import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { StatusSolicitacao } from '@/types'
import { STATUS_CONFIG } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string) {
  return format(new Date(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatDateShort(iso: string) {
  return format(new Date(iso), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatRelative(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR })
}

export function statusConfig(status: StatusSolicitacao) {
  return STATUS_CONFIG[status]
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>
    if (e.response && typeof e.response === 'object') {
      const resp = e.response as Record<string, unknown>
      if (resp.data && typeof resp.data === 'object') {
        const data = resp.data as Record<string, unknown>
        if (typeof data.detail === 'string') return data.detail
        if (typeof data.message === 'string') return data.message
      }
    }
    if (typeof e.message === 'string') return e.message
  }
  return 'Erro inesperado. Tente novamente.'
}
