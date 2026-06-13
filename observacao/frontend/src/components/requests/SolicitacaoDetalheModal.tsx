import { Paperclip, X } from 'lucide-react'
import type { SolicitacaoDetalhe, StatusSolicitacao } from '@/types'
import { formatDate } from '@/lib/utils'
import { prioridadeVisual } from './SolicitacaoCard'

interface SolicitacaoDetalheModalProps {
  solicitacao: SolicitacaoDetalhe
  onClose: () => void
  onExcluir?: () => void
  isAdmin?: boolean
}

const STATUS_LABEL: Record<StatusSolicitacao, string> = {
  ABERTA: 'Aguardando',
  EM_ANALISE: 'Aguardando',
  EM_ATENDIMENTO: 'Em andamento',
  RESOLVIDA: 'Finalizado',
  INDEFERIDA: 'Indeferido',
}

export function SolicitacaoDetalheModal({
  solicitacao,
  onClose,
  onExcluir,
  isAdmin = false,
}: SolicitacaoDetalheModalProps) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <section className="modal modal-wide">
        <div className="modal-header">
          <h2 className="modal-title">Detalhes da Solicitação</h2>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div>
              <Detail label="Protocolo" value={solicitacao.protocolo} />
              <Detail label="Categoria" value={solicitacao.categoria.nome} />
              <Detail label="Descrição" value={solicitacao.descricao} />
              <Detail
                label="Localização"
                value={[solicitacao.logradouro, solicitacao.bairro].filter(Boolean).join(', ') || 'Rua Exemplo, 123'}
              />
              <Detail label="Prioridade" value={prioridadeVisual(solicitacao)} />
              <div className="detail-pair">
                <span>Anexo</span>
                <strong><Paperclip size={18} /></strong>
              </div>
              <Detail label="Data de Criação" value={formatDate(solicitacao.criadoEm)} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 800 }}>Histórico de Status</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitacao.historico.length === 0 ? (
                    <tr>
                      <td>{formatDate(solicitacao.criadoEm)}</td>
                      <td>{STATUS_LABEL[solicitacao.status]}</td>
                    </tr>
                  ) : (
                    solicitacao.historico.map((h) => (
                      <tr key={h.id}>
                        <td>{formatDate(h.criadoEm)}</td>
                        <td>{STATUS_LABEL[h.statusNovo]}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="response-box">
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800 }}>
              Resposta do Gerente
            </h3>
            <div className="response-card">
              {solicitacao.respostaAdmin ? (
                solicitacao.respostaAdmin
              ) : (
                <>
                  Prezado(a) cidadão(a),<br />
                  Sua solicitação foi recebida e será analisada pela equipe responsável.
                  <br />
                  Atenciosamente,<br />
                  <strong>Nome do Gerente:</strong> {isAdmin ? 'Gerente' : 'Gerente Exemplo'}
                </>
              )}
            </div>
          </div>
        </div>

        {!isAdmin && onExcluir && solicitacao.status === 'ABERTA' && (
          <div className="modal-footer">
            <button className="btn" onClick={onClose}>Cancelar</button>
            <button className="btn btn-danger" onClick={onExcluir}>Excluir</button>
          </div>
        )}
      </section>
    </div>
  )
}

function Detail({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="detail-pair">
      <span>{label}:</span>
      <strong>{value || '-'}</strong>
    </div>
  )
}
