package com.observacao.controller;

import com.observacao.dto.request.SolicitacaoDTOs;
import com.observacao.dto.response.ResponseDTOs;
import com.observacao.entity.Usuario;
import com.observacao.service.SolicitacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SolicitacaoController {

    private final SolicitacaoService solicitacaoService;

    // ---- PÚBLICO ----

    /** Qualquer pessoa pode buscar um protocolo (ex: cidadão que enviou anônimo) */
    @GetMapping("/solicitacoes/protocolo/{numero}")
    public ResponseDTOs.SolicitacaoDetalhe buscarPorProtocolo(@PathVariable String numero) {
        return solicitacaoService.buscarPorProtocolo(numero);
    }

    /** Criação pública (anônima) ou autenticada */
    @PostMapping("/solicitacoes")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseDTOs.SolicitacaoDetalhe criar(
            @Valid @RequestBody SolicitacaoDTOs.CreateRequest request,
            @AuthenticationPrincipal Usuario usuarioLogado) {
        return solicitacaoService.criar(request, usuarioLogado);
    }

    // ---- CIDADÃO ----

    /** Lista as próprias solicitações */
    @GetMapping("/solicitacoes")
    @PreAuthorize("hasRole('CIDADAO')")
    public ResponseDTOs.PageResponse<ResponseDTOs.SolicitacaoResumo> listarMinhas(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return solicitacaoService.listarMinhas(usuario, status, busca, page, size);
    }

    /** Detalhe de uma solicitação própria */
    @GetMapping("/solicitacoes/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseDTOs.SolicitacaoDetalhe detalhe(
            @PathVariable UUID id,
            @AuthenticationPrincipal Usuario usuario) {
        boolean isAdmin = usuario.getPerfil() == Usuario.Perfil.ADMIN;
        return solicitacaoService.buscarDetalhe(id, usuario, isAdmin);
    }

    /** Cidadão pode excluir somente as próprias solicitações ABERTAS */
    @DeleteMapping("/solicitacoes/{id}")
    @PreAuthorize("hasRole('CIDADAO')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(
            @PathVariable UUID id,
            @AuthenticationPrincipal Usuario usuario) {
        solicitacaoService.excluir(id, usuario);
    }

    // ---- ADMIN ----

    /** Lista todas as solicitações com filtros */
    @GetMapping("/admin/solicitacoes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseDTOs.PageResponse<ResponseDTOs.SolicitacaoResumo> listarTodas(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID categoriaId,
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return solicitacaoService.listarTodas(status, categoriaId, busca, page, size);
    }

    /** Admin atualiza status e pode adicionar resposta */
    @PatchMapping("/admin/solicitacoes/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseDTOs.SolicitacaoDetalhe atualizarStatus(
            @PathVariable UUID id,
            @Valid @RequestBody SolicitacaoDTOs.UpdateStatusRequest request,
            @AuthenticationPrincipal Usuario admin) {
        return solicitacaoService.atualizarStatus(id, request, admin);
    }

    /** Dashboard stats para admin */
    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseDTOs.DashboardStats dashboardStats() {
        return solicitacaoService.stats();
    }
}
