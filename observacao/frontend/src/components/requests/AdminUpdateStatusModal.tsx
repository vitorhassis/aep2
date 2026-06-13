import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import type { SolicitacaoDetalhe, StatusSolicitacao } from '@/types'
import { solicitacaoService } from '@/services'
import { formatDate } from '@/lib/utils'

interface Props {
  solicitacao: SolicitacaoDetalhe
  onClose: () => void
}

const STATUS_LABEL: Record<StatusSolicitacao, string> = {
  ABERTA: 'Aguardando',
  EM_ANALISE: 'Aguardando',
  EM_ATENDIMENTO: 'Em andamento',
  RESOLVIDA: 'Finalizado',
  INDEFERIDA: 'Indeferido',
}

export function AdminUpdateStatusModal({ solicitacao, onClose }: Props) {
  const [status, setStatus] = useState<StatusSolicitacao>(solicitacao.status)
  const [resposta, setResposta] = useState(solicitacao.respostaAdmin ?? '')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      solicitacaoService.atualizarStatus(solicitacao.id, {
        status,
        observacao: `Status atualizado para ${STATUS_LABEL[status]}`,
        respostaAdmin: resposta || undefined,
      }),
    onSuccess: () => {
      toast.success('Status atualizado com sucesso')
      queryClient.invalidateQueries({ queryKey: ['admin-solicitacoes'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      onClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? 'Erro ao atualizar status')
    },
  })

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <section className="modal modal-form">
        <div className="modal-header">
          <h2 className="modal-title">Gerenciar Solicitação</h2>
          <button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={22} /></button>
        </div>

        <div className="modal-body">
          <div className="detail-pair">
            <span>Protocolo:</span>
            <strong>{solicitacao.protocolo}</strong>
          </div>

          <h3 style={{ fontSize: 14, margin: '18px 0 8px', fontWeight: 800 }}>Histórico de status</h3>
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

          <div className="form-group" style={{ marginTop: 14 }}>
            <label className="form-label">Status da solicitação</label>
            <select className="form-select status-input" value={status} onChange={(e) => setStatus(e.target.value as StatusSolicitacao)}>
              <option value="ABERTA">Aguardando</option>
              <option value="EM_ATENDIMENTO">Em andamento</option>
              <option value="RESOLVIDA">Finalizado</option>
              <option value="INDEFERIDA">Indeferido</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: 18 }}>
            <label className="form-label">Responder</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Digite sua resposta aqui..."
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <button className="btn" onClick={onClose}>Cancelar</button>
            <button className="btn" onClick={onClose}>Excluir</button>
          </div>
          <button className="btn" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </section>
    </div>
  )
}
