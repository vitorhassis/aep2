package com.observacao.dto.response;

import com.observacao.entity.Categoria;
import com.observacao.entity.HistoricoStatus;
import com.observacao.entity.Solicitacao;
import com.observacao.entity.Usuario;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class ResponseDTOs {

    // ---- Auth ----
    @Data @Builder
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private UsuarioResponse usuario;
    }

    // ---- Usuario ----
    @Data @Builder
    public static class UsuarioResponse {
        private UUID id;
        private String nome;
        private String email;
        private String perfil;

        public static UsuarioResponse from(Usuario u) {
            return UsuarioResponse.builder()
                .id(u.getId())
                .nome(u.getNome())
                .email(u.getEmail())
                .perfil(u.getPerfil().name())
                .build();
        }
    }

    // ---- Categoria ----
    @Data @Builder
    public static class CategoriaResponse {
        private UUID id;
        private String nome;
        private String descricao;
        private String icone;
        private String cor;
        private boolean ativa;
        private OffsetDateTime criadoEm;

        public static CategoriaResponse from(Categoria c) {
            return CategoriaResponse.builder()
                .id(c.getId())
                .nome(c.getNome())
                .descricao(c.getDescricao())
                .icone(c.getIcone())
                .cor(c.getCor())
                .ativa(c.isAtiva())
                .criadoEm(c.getCriadoEm())
                .build();
        }
    }

    // ---- Histórico ----
    @Data @Builder
    public static class HistoricoResponse {
        private UUID id;
        private String statusAnterior;
        private String statusNovo;
        private String observacao;
        private String alteradoPor;
        private OffsetDateTime criadoEm;

        public static HistoricoResponse from(HistoricoStatus h) {
            return HistoricoResponse.builder()
                .id(h.getId())
                .statusAnterior(h.getStatusAnterior() != null ? h.getStatusAnterior().name() : null)
                .statusNovo(h.getStatusNovo().name())
                .observacao(h.getObservacao())
                .alteradoPor(h.getAlteradoPor() != null ? h.getAlteradoPor().getNome() : "Sistema")
                .criadoEm(h.getCriadoEm())
                .build();
        }
    }

    // ---- Solicitação (resumo) ----
    @Data @Builder
    public static class SolicitacaoResumo {
        private UUID id;
        private String protocolo;
        private String titulo;
        private String status;
        private boolean anonima;
        private String categoriaNome;
        private String categoriaIcone;
        private String categoriaCor;
        private String usuarioNome;   // null se anônimo
        private OffsetDateTime criadoEm;
        private OffsetDateTime atualizadoEm;

        public static SolicitacaoResumo from(Solicitacao s) {
            return SolicitacaoResumo.builder()
                .id(s.getId())
                .protocolo(s.getProtocolo())
                .titulo(s.getTitulo())
                .status(s.getStatus().name())
                .anonima(s.isAnonima())
                .categoriaNome(s.getCategoria().getNome())
                .categoriaIcone(s.getCategoria().getIcone())
                .categoriaCor(s.getCategoria().getCor())
                .usuarioNome(s.isAnonima() ? null : (s.getUsuario() != null ? s.getUsuario().getNome() : null))
                .criadoEm(s.getCriadoEm())
                .atualizadoEm(s.getAtualizadoEm())
                .build();
        }
    }

    // ---- Solicitação (detalhe completo) ----
    @Data @Builder
    public static class SolicitacaoDetalhe {
        private UUID id;
        private String protocolo;
        private String titulo;
        private String descricao;
        private String status;
        private boolean anonima;
        private String emailContato;
        private CategoriaResponse categoria;
        private UsuarioResponse usuario;     // null se anônimo
        private String respostaAdmin;
        private String logradouro;
        private String bairro;
        private String complemento;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private List<HistoricoResponse> historico;
        private OffsetDateTime criadoEm;
        private OffsetDateTime atualizadoEm;

        public static SolicitacaoDetalhe from(Solicitacao s) {
            return SolicitacaoDetalhe.builder()
                .id(s.getId())
                .protocolo(s.getProtocolo())
                .titulo(s.getTitulo())
                .descricao(s.getDescricao())
                .status(s.getStatus().name())
                .anonima(s.isAnonima())
                .emailContato(s.getEmailContato())
                .categoria(CategoriaResponse.from(s.getCategoria()))
                .usuario(s.isAnonima() || s.getUsuario() == null ? null : UsuarioResponse.from(s.getUsuario()))
                .respostaAdmin(s.getRespostaAdmin())
                .logradouro(s.getLogradouro())
                .bairro(s.getBairro())
                .complemento(s.getComplemento())
                .latitude(s.getLatitude())
                .longitude(s.getLongitude())
                .historico(s.getHistorico().stream().map(HistoricoResponse::from).toList())
                .criadoEm(s.getCriadoEm())
                .atualizadoEm(s.getAtualizadoEm())
                .build();
        }
    }

    // ---- Dashboard Admin ----
    @Data @Builder
    public static class DashboardStats {
        private long total;
        private long abertas;
        private long emAnalise;
        private long emAtendimento;
        private long resolvidas;
        private long indeferidas;
        private long hoje;
    }

    // ---- Page genérica ----
    @Data @Builder
    public static class PageResponse<T> {
        private List<T> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean first;
        private boolean last;
    }
}
