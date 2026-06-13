import type { StatusSolicitacao } from '@/types'

const STATUS_LABEL: Record<StatusSolicitacao, string> = {
  ABERTA: 'Aberta',
  EM_ANALISE: 'Em Análise',
  EM_ATENDIMENTO: 'Em Atendimento',
  RESOLVIDA: 'Resolvida',
  INDEFERIDA: 'Indeferida',
}

const STATUS_DOT: Record<StatusSolicitacao, string> = {
  ABERTA: 'var(--status-aberta-dot)',
  EM_ANALISE: 'var(--status-analise-dot)',
  EM_ATENDIMENTO: 'var(--status-atend-dot)',
  RESOLVIDA: 'var(--status-resolvida-dot)',
  INDEFERIDA: 'var(--status-indeferida-dot)',
}

export function StatusBadge({ status }: { status: StatusSolicitacao }) {
  const cls = `badge badge-${status.toLowerCase()}`
  return (
    <span className={cls}>
      <span className="badge-dot" style={{ background: STATUS_DOT[status] }} />
      {STATUS_LABEL[status]}
    </span>
  )
}

type Priority = 'ALTA' | 'MEDIA' | 'BAIXA'

const PRIORITY_LABEL: Record<Priority, string> = {
  ALTA: 'Alta',
  MEDIA: 'Média',
  BAIXA: 'Baixa',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge badge-${priority.toLowerCase()}`}>
      {PRIORITY_LABEL[priority]}
    </span>
  )
}

export function CategoryBadge({
  name,
  icon,
  color,
}: {
  name: string
  icon?: string
  color?: string
}) {
  return (
    <span
      className="badge"
      style={{
        background: color ? `${color}18` : 'var(--bg-card-alt)',
        color: color ?? 'var(--text-secondary)',
        border: `1px solid ${color ? `${color}40` : 'var(--border)'}`,
      }}
    >
      {name}
    </span>
  )
}
