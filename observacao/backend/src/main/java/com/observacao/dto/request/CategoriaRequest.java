package com.observacao.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoriaRequest {
    @NotBlank @Size(min = 2, max = 100)
    private String nome;

    @Size(max = 500)
    private String descricao;

    @Size(max = 50)
    private String icone;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor deve ser hex válido ex: #3B82F6")
    private String cor;

    private boolean ativa = true;
}
