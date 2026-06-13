import { api } from './api'
import type {
  AuthResponse,
  Categoria,
  CreateSolicitacaoRequest,
  DashboardStats,
  PageResponse,
  SolicitacaoDetalhe,
  SolicitacaoResumo,
  UpdateStatusRequest,
  Usuario,
} from '@/types'

// ---- Auth ----
export const authService = {
  login: (email: string, senha: string) =>
    api.post<AuthResponse>('/auth/login', { email, senha }).then((r) => r.data),

  register: (nome: string, email: string, senha: string, perfil: 'ADMIN' | 'CIDADAO' = 'CIDADAO') =>
    api.post<AuthResponse>('/auth/register', { nome, email, senha, perfil }).then((r) => r.data),

  me: () => api.get<Usuario>('/auth/me').then((r) => r.data),

  logout: () => api.post('/auth/logout').catch(() => {}),
}

// ---- Categorias ----
export const categoriaService = {
  listarAtivas: () =>
    api.get<Categoria[]>('/categorias/ativas').then((r) => r.data),

  listarTodas: () =>
    api.get<Categoria[]>('/admin/categorias').then((r) => r.data),

  criar: (data: CategoriaRequest) =>
    api.post<Categoria>('/admin/categorias', data).then((r) => r.data),

  atualizar: (id: string, data: CategoriaRequest) =>
    api.put<Categoria>(`/admin/categorias/${id}`, data).then((r) => r.data),

  deletar: (id: string) => api.delete(`/admin/categorias/${id}`),
}

export interface CategoriaRequest {
  nome: string
  descricao?: string
  icone?: string
  cor?: string
  ativa: boolean
}

// ---- Solicitações ----
export const solicitacaoService = {
  criar: (data: CreateSolicitacaoRequest) =>
    api.post<SolicitacaoDetalhe>('/solicitacoes', data).then((r) => r.data),

  buscarPorProtocolo: (numero: string) =>
    api.get<SolicitacaoDetalhe>(`/solicitacoes/protocolo/${numero}`).then((r) => r.data),

  listarMinhas: (params: {
    status?: string
    busca?: string
    page?: number
    size?: number
  }) =>
    api
      .get<PageResponse<SolicitacaoResumo>>('/solicitacoes', { params })
      .then((r) => r.data),

  detalhe: (id: string) =>
    api.get<SolicitacaoDetalhe>(`/solicitacoes/${id}`).then((r) => r.data),

  excluir: (id: string) => api.delete(`/solicitacoes/${id}`),

  // Admin
  listarTodas: (params: {
    status?: string
    categoriaId?: string
    busca?: string
    page?: number
    size?: number
  }) =>
    api
      .get<PageResponse<SolicitacaoResumo>>('/admin/solicitacoes', { params })
      .then((r) => r.data),

  atualizarStatus: (id: string, data: UpdateStatusRequest) =>
    api
      .patch<SolicitacaoDetalhe>(`/admin/solicitacoes/${id}/status`, data)
      .then((r) => r.data),

  dashboardStats: () =>
    api.get<DashboardStats>('/admin/dashboard').then((r) => r.data),
}
