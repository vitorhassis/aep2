package com.observacao.repository;

import com.observacao.entity.Solicitacao;
import com.observacao.entity.Solicitacao.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SolicitacaoRepository
        extends JpaRepository<Solicitacao, UUID>,
                JpaSpecificationExecutor<Solicitacao> {

    Optional<Solicitacao> findByProtocolo(String protocolo);

    long countByStatus(Status status);

    @Query("""
        SELECT COUNT(s) FROM Solicitacao s
        WHERE s.criadoEm >= CURRENT_DATE
    """)
    long countHoje();
}
