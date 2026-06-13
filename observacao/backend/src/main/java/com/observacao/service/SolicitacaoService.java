package com.observacao.service;

import com.observacao.dto.request.SolicitacaoDTOs;
import com.observacao.dto.response.ResponseDTOs;
import com.observacao.entity.HistoricoStatus;
import com.observacao.entity.Solicitacao;
import com.observacao.entity.Solicitacao.Status;
import com.observacao.entity.Usuario;
import com.observacao.exception.BusinessException;
import com.observacao.exception.NotFoundException;
import com.observacao.repository.CategoriaRepository;
import com.observacao.repository.SolicitacaoSpecs;
import com.observacao.repository.SolicitacaoRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final CategoriaRepository categoriaRepository;
    private final EntityManager entityManager;

    // ---- Criação (público ou autenticado) ----
    @Transactional
    public ResponseDTOs.SolicitacaoDetalhe criar(SolicitacaoDTOs.CreateRequest req, Usuario usuarioLogado) {
        var categoria = categoriaRepository.findById(req.getCategoriaId())
            .orElseThrow(() -> new NotFoundException("Categoria não encontrada"));

        if (!categoria.isAtiva()) throw new BusinessException("Categoria inativa");

        var solicitacao = Solicitacao.builder()
            .titulo(req.getTitulo())
            .descricao(req.getDescricao())
            .categoria(categoria)
            .anonima(req.isAnonima())
            .emailContato(req.getEmailContato())
            .logradouro(req.getLogradouro())
            .bairro(req.getBairro())
            .complemento(req.getComplemento())
            .latitude(req.getLatitude())
            .longitude(req.getLongitude())
            .build();

        if (usuarioLogado != null && !req.isAnonima()) {
            solicitacao.setUsuario(usuarioLogado);
        }

        // 1) persiste e faz flush para o trigger do banco gerar o protocolo
        solicitacaoRepository.saveAndFlush(solicitacao);

        // 2) adiciona histórico inicial
        adicionarHistorico(solicitacao, null, Status.ABERTA, "Solicitação criada", usuarioLogado);
        solicitacaoRepository.saveAndFlush(solicitacao);

        // 3) evicta do cache de 1º nível para recarregar com protocolo do trigger
        entityManager.refresh(solicitacao);

        return ResponseDTOs.SolicitacaoDetalhe.from(solicitacao);
    }

    // ---- Busca pública por protocolo ----
    @Transactional(readOnly = true)
    public ResponseDTOs.SolicitacaoDetalhe buscarPorProtocolo(String protocolo) {
        var s = solicitacaoRepository.findByProtocolo(protocolo.toUpperCase())
            .orElseThrow(() -> new NotFoundException("Protocolo não encontrado: " + protocolo));
        return ResponseDTOs.SolicitacaoDetalhe.from(s);
    }

    // ---- Listagem CIDADÃO ----
    @Transactional(readOnly = true)
    public ResponseDTOs.PageResponse<ResponseDTOs.SolicitacaoResumo> listarMinhas(
            Usuario usuario, String statusStr, String busca, int page, int size) {

        Status status = parseStatus(statusStr);
        var pageable = PageRequest.of(page, Math.min(size, 50));
        var spec = SolicitacaoSpecs.doUsuario(usuario, status, busca);
        Page<Solicitacao> resultado = solicitacaoRepository.findAll(spec, pageable);
        return toPageResponse(resultado);
    }

    // ---- Listagem ADMIN ----
    @Transactional(readOnly = true)
    public ResponseDTOs.PageResponse<ResponseDTOs.SolicitacaoResumo> listarTodas(
            String statusStr, UUID categoriaId, String busca, int page, int size) {

        Status status = parseStatus(statusStr);
        var pageable = PageRequest.of(page, Math.min(size, 100));
        var spec = SolicitacaoSpecs.comFiltrosAdmin(status, categoriaId, busca);
        Page<Solicitacao> resultado = solicitacaoRepository.findAll(spec, pageable);
        return toPageResponse(resultado);
    }

    // ---- Detalhe ----
    @Transactional(readOnly = true)
    public ResponseDTOs.SolicitacaoDetalhe buscarDetalhe(UUID id, Usuario solicitante, boolean isAdmin) {
        var s = solicitacaoRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Solicitação não encontrada"));

        if (!isAdmin && (s.getUsuario() == null || !s.getUsuario().getId().equals(solicitante.getId()))) {
            throw new AccessDeniedException("Acesso negado");
        }
        return ResponseDTOs.SolicitacaoDetalhe.from(s);
    }

    // ---- Excluir ----
    @Transactional
    public void excluir(UUID id, Usuario usuario) {
        var s = solicitacaoRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Solicitação não encontrada"));

        if (s.getUsuario() == null || !s.getUsuario().getId().equals(usuario.getId())) {
            throw new AccessDeniedException("Você não tem permissão para excluir esta solicitação");
        }
        if (s.getStatus() != Status.ABERTA) {
            throw new BusinessException("Somente solicitações com status ABERTA podem ser excluídas");
        }
        solicitacaoRepository.delete(s);
    }

    // ---- Atualizar status (ADMIN) ----
    @Transactional
    public ResponseDTOs.SolicitacaoDetalhe atualizarStatus(
            UUID id, SolicitacaoDTOs.UpdateStatusRequest req, Usuario admin) {

        var s = solicitacaoRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Solicitação não encontrada"));

        Status novoStatus;
        try {
            novoStatus = Status.valueOf(req.getStatus());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Status inválido: " + req.getStatus());
        }

        Status statusAnterior = s.getStatus();
        s.setStatus(novoStatus);

        if (req.getRespostaAdmin() != null && !req.getRespostaAdmin().isBlank()) {
            s.setRespostaAdmin(req.getRespostaAdmin());
        }

        adicionarHistorico(s, statusAnterior, novoStatus, req.getObservacao(), admin);
        solicitacaoRepository.save(s);

        return ResponseDTOs.SolicitacaoDetalhe.from(s);
    }

    // ---- Dashboard stats ----
    @Transactional(readOnly = true)
    public ResponseDTOs.DashboardStats stats() {
        return ResponseDTOs.DashboardStats.builder()
            .total(solicitacaoRepository.count())
            .abertas(solicitacaoRepository.countByStatus(Status.ABERTA))
            .emAnalise(solicitacaoRepository.countByStatus(Status.EM_ANALISE))
            .emAtendimento(solicitacaoRepository.countByStatus(Status.EM_ATENDIMENTO))
            .resolvidas(solicitacaoRepository.countByStatus(Status.RESOLVIDA))
            .indeferidas(solicitacaoRepository.countByStatus(Status.INDEFERIDA))
            .hoje(solicitacaoRepository.countHoje())
            .build();
    }

    // ---- Helpers ----
    private void adicionarHistorico(Solicitacao s, Status anterior, Status novo, String obs, Usuario quem) {
        var h = HistoricoStatus.builder()
            .solicitacao(s)
            .statusAnterior(anterior)
            .statusNovo(novo)
            .observacao(obs)
            .alteradoPor(quem)
            .build();
        s.getHistorico().add(h);
    }

    private Status parseStatus(String statusStr) {
        if (statusStr == null || statusStr.isBlank()) return null;
        try {
            return Status.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Status inválido: " + statusStr);
        }
    }

    private ResponseDTOs.PageResponse<ResponseDTOs.SolicitacaoResumo> toPageResponse(Page<Solicitacao> page) {
        return ResponseDTOs.PageResponse.<ResponseDTOs.SolicitacaoResumo>builder()
            .content(page.getContent().stream().map(ResponseDTOs.SolicitacaoResumo::from).toList())
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .first(page.isFirst())
            .last(page.isLast())
            .build();
    }
}
