import { Edit3, Plus, Trash2 } from 'lucide-react'
import type { SolicitacaoResumo } from '@/types'

interface SolicitacaoCardProps {
  solicitacao: SolicitacaoResumo
  onDetalhes?: () => void
  onEditar?: () => void
  onCancelar?: () => void
  isAdmin?: boolean
}

export function prioridadeVisual(s: Pick<SolicitacaoResumo, 'status'>) {
  if (s.status === 'ABERTA') return 'ALTA'
  if (s.status === 'RESOLVIDA') return 'BAIXA'
  return 'MÉDIA'
}

export function SolicitacaoCard({
  solicitacao,
  onDetalhes,
  onEditar,
  onCancelar,
  isAdmin = false,
}: SolicitacaoCardProps) {
  return (
    <article className="request-card">
      <p className="request-line">
        <strong>Protocolo:</strong> {solicitacao.protocolo}
      </p>
      <p className="request-line">
        <strong>Categoria:</strong> {solicitacao.categoriaNome}
      </p>
      <p className="request-line">
        <strong>Prioridade:</strong> {prioridadeVisual(solicitacao)}
      </p>

      <div className="request-actions">
        <button className="btn btn-sm" onClick={onDetalhes}>
          <Plus size={13} /> Detalhes
        </button>

        {isAdmin && onEditar && (
          <button className="btn btn-sm" onClick={onEditar}>
            <Edit3 size={12} /> Editar
          </button>
        )}

        {!isAdmin && onCancelar && solicitacao.status === 'ABERTA' && (
          <button className="btn btn-sm" onClick={onCancelar}>
            <Trash2 size={12} /> Cancelar
          </button>
        )}
      </div>
    </article>
  )
}
