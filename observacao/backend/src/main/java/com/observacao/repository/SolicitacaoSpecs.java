package com.observacao.repository;

import com.observacao.entity.Solicitacao;
import com.observacao.entity.Solicitacao.Status;
import com.observacao.entity.Usuario;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class SolicitacaoSpecs {

    /**
     * Filtros para CIDADÃO: restringe ao usuário dono.
     */
    public static Specification<Solicitacao> doUsuario(
            Usuario usuario, Status status, String busca) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Sempre filtra pelo dono
            predicates.add(cb.equal(root.get("usuario"), usuario));

            // Status opcional
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // Busca textual opcional — usa LIKE em protocolo e título
            if (busca != null && !busca.isBlank()) {
                String pattern = "%" + busca.toLowerCase() + "%";
                Predicate porProtocolo = cb.like(
                        cb.lower(root.get("protocolo").as(String.class)), pattern);
                Predicate porTitulo = cb.like(
                        cb.lower(root.get("titulo").as(String.class)), pattern);
                predicates.add(cb.or(porProtocolo, porTitulo));
            }

            // Ordenação por data decrescente
            query.orderBy(cb.desc(root.get("criadoEm")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Filtros para ADMIN: vê todas as solicitações.
     */
    public static Specification<Solicitacao> comFiltrosAdmin(
            Status status, UUID categoriaId, String busca) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Status opcional
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // Categoria opcional
            if (categoriaId != null) {
                predicates.add(cb.equal(root.get("categoria").get("id"), categoriaId));
            }

            // Busca textual opcional
            if (busca != null && !busca.isBlank()) {
                String pattern = "%" + busca.toLowerCase() + "%";
                Predicate porProtocolo = cb.like(
                        cb.lower(root.get("protocolo").as(String.class)), pattern);
                Predicate porTitulo = cb.like(
                        cb.lower(root.get("titulo").as(String.class)), pattern);
                predicates.add(cb.or(porProtocolo, porTitulo));
            }

            // Ordenação por data decrescente
            query.orderBy(cb.desc(root.get("criadoEm")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
