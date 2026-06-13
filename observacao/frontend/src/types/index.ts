// ============================================================
// Domínio
// ============================================================

export type Perfil = 'ADMIN' | 'CIDADAO'

export type StatusSolicitacao =
  | 'ABERTA'
  | 'EM_ANALISE'
  | 'EM_ATENDIMENTO'
  | 'RESOLVIDA'
  | 'INDEFERIDA'

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: Perfil
}

export interface Categoria {
  id: string
  nome: string
  descricao?: string
  icone?: string
  cor?: string
  ativa: boolean
  criadoEm: string
}

export interface HistoricoStatus {
  id: string
  statusAnterior?: StatusSolicitacao
  statusNovo: StatusSolicitacao
  observacao?: string
  alteradoPor: string
  criadoEm: string
}

export interface SolicitacaoResumo {
  id: string
  protocolo: string
  titulo: string
  status: StatusSolicitacao
  anonima: boolean
  categoriaNome: string
  categoriaIcone?: string
  categoriaCor?: string
  usuarioNome?: string
  criadoEm: string
  atualizadoEm: string
}

export interface SolicitacaoDetalhe extends SolicitacaoResumo {
  descricao: string
  emailContato?: string
  categoria: Categoria
  usuario?: Usuario
  respostaAdmin?: string
  logradouro?: string
  bairro?: string
  complemento?: string
  latitude?: number
  longitude?: number
  historico: HistoricoStatus[]
}

export interface DashboardStats {
  total: number
  abertas: number
  emAnalise: number
  emAtendimento: number
  resolvidas: number
  indeferidas: number
  hoje: number
}

// ============================================================
// API Request/Response
// ============================================================

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  usuario: Usuario
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface CreateSolicitacaoRequest {
  titulo: string
  descricao: string
  categoriaId: string
  anonima: boolean
  emailContato?: string
  logradouro?: string
  bairro?: string
  complemento?: string
  latitude?: number
  longitude?: number
}

export interface UpdateStatusRequest {
  status: StatusSolicitacao
  observacao?: string
  respostaAdmin?: string
}

// ============================================================
// UI helpers
// ============================================================

export const STATUS_CONFIG: Record<
  StatusSolicitacao,
  { label: string; color: string; bg: string; border: string }
> = {
  ABERTA: {
    label: 'Aberta',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
  },
  EM_ANALISE: {
    label: 'Em Análise',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
  },
  EM_ATENDIMENTO: {
    label: 'Em Atendimento',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    border: 'border-violet-200 dark:border-violet-800',
  },
  RESOLVIDA: {
    label: 'Resolvida',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  INDEFERIDA: {
    label: 'Indeferida',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800',
  },
}
