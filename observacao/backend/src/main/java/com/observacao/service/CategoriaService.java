package com.observacao.service;

import com.observacao.dto.request.CategoriaRequest;
import com.observacao.dto.response.ResponseDTOs;
import com.observacao.entity.Categoria;
import com.observacao.exception.BusinessException;
import com.observacao.exception.NotFoundException;
import com.observacao.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public List<ResponseDTOs.CategoriaResponse> listarAtivas() {
        return categoriaRepository.findByAtivaTrue().stream()
            .map(ResponseDTOs.CategoriaResponse::from)
            .toList();
    }

    public List<ResponseDTOs.CategoriaResponse> listarTodas() {
        return categoriaRepository.findAll().stream()
            .map(ResponseDTOs.CategoriaResponse::from)
            .toList();
    }

    public ResponseDTOs.CategoriaResponse buscarPorId(UUID id) {
        return ResponseDTOs.CategoriaResponse.from(
            categoriaRepository.findById(id).orElseThrow(() -> new NotFoundException("Categoria não encontrada"))
        );
    }

    @Transactional
    public ResponseDTOs.CategoriaResponse criar(CategoriaRequest request) {
        if (categoriaRepository.existsByNome(request.getNome())) {
            throw new BusinessException("Já existe uma categoria com este nome");
        }

        var categoria = Categoria.builder()
            .nome(request.getNome())
            .descricao(request.getDescricao())
            .icone(request.getIcone())
            .cor(request.getCor())
            .ativa(request.isAtiva())
            .build();

        return ResponseDTOs.CategoriaResponse.from(categoriaRepository.save(categoria));
    }

    @Transactional
    public ResponseDTOs.CategoriaResponse atualizar(UUID id, CategoriaRequest request) {
        var categoria = categoriaRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Categoria não encontrada"));

        if (categoriaRepository.existsByNomeAndIdNot(request.getNome(), id)) {
            throw new BusinessException("Já existe outra categoria com este nome");
        }

        categoria.setNome(request.getNome());
        categoria.setDescricao(request.getDescricao());
        categoria.setIcone(request.getIcone());
        categoria.setCor(request.getCor());
        categoria.setAtiva(request.isAtiva());

        return ResponseDTOs.CategoriaResponse.from(categoriaRepository.save(categoria));
    }

    @Transactional
    public void deletar(UUID id) {
        var categoria = categoriaRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Categoria não encontrada"));
        // Soft delete: apenas desativa
        categoria.setAtiva(false);
        categoriaRepository.save(categoria);
    }
}
