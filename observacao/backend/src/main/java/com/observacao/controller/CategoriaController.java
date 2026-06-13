package com.observacao.controller;

import com.observacao.dto.request.CategoriaRequest;
import com.observacao.dto.response.ResponseDTOs;
import com.observacao.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    // Público — usado no formulário de criação de solicitação
    @GetMapping("/categorias/ativas")
    public List<ResponseDTOs.CategoriaResponse> listarAtivas() {
        return categoriaService.listarAtivas();
    }

    // Admin — listagem completa (inclui inativas)
    @GetMapping("/admin/categorias")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ResponseDTOs.CategoriaResponse> listarTodas() {
        return categoriaService.listarTodas();
    }

    @GetMapping("/admin/categorias/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseDTOs.CategoriaResponse buscarPorId(@PathVariable UUID id) {
        return categoriaService.buscarPorId(id);
    }

    @PostMapping("/admin/categorias")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseDTOs.CategoriaResponse criar(@Valid @RequestBody CategoriaRequest request) {
        return categoriaService.criar(request);
    }

    @PutMapping("/admin/categorias/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseDTOs.CategoriaResponse atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody CategoriaRequest request) {
        return categoriaService.atualizar(id, request);
    }

    @DeleteMapping("/admin/categorias/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable UUID id) {
        categoriaService.deletar(id);
    }
}
