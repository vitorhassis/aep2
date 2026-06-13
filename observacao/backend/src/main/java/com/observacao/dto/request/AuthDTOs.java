package com.observacao.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDTOs {

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6)
        private String senha;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank @Size(min = 3, max = 255)
        private String nome;
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 8)
        private String senha;
        private String perfil;
    }

    @Data
    public static class RefreshRequest {
        @NotBlank
        private String refreshToken;
    }
}
