package com.observacao.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

public class SolicitacaoDTOs {

    @Data
    public static class CreateRequest {
        @NotBlank @Size(min = 5, max = 255)
        private String titulo;

        @NotBlank @Size(min = 20)
        private String descricao;

        @NotNull
        private UUID categoriaId;

        private boolean anonima = false;

        // Opcionais de localização
        private String logradouro;
        private String bairro;
        private String complemento;
        private BigDecimal latitude;
        private BigDecimal longitude;

        // Email de contato para anônimos que querem retorno
        private String emailContato;
    }

    @Data
    public static class UpdateStatusRequest {
        @NotNull
        private String status;  // validado no service via enum

        private String observacao;
        private String respostaAdmin;
    }
}
