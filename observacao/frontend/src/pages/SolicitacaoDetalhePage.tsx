import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { SolicitacaoDetalheModal } from '@/components/requests/SolicitacaoDetalheModal'
import { solicitacaoService } from '@/services'
import { useAuthStore } from '@/store/auth.store'

export function SolicitacaoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const queryClient = useQueryClient()
  const isAdmin = usuario?.perfil === 'ADMIN'

  const { data: solicitacao, isLoading, error } = useQuery({
    queryKey: ['solicitacao', id],
    queryFn: () => solicitacaoService.detalhe(id!),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: () => solicitacaoService.excluir(id!),
    onSuccess: () => {
      toast.success('Solicitação excluída')
      queryClient.invalidateQueries({ queryKey: ['minhas-solicitacoes'] })
      navigate('/solicitacoes')
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Erro ao excluir'),
  })

  if (isLoading) {
    return (
      <AppLayout title="Solicitação">
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Carregando...</div>
      </AppLayout>
    )
  }

  if (error || !solicitacao) {
    return (
      <AppLayout title="Solicitação">
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Não encontrado.</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={`Protocolo ${solicitacao.protocolo}`}
      actions={
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Voltar
        </button>
      }
    >
      {/* Render o modal inline como conteúdo de página (sem overlay) */}
      <div style={{ maxWidth: 640 }}>
        <SolicitacaoDetalheModal
          solicitacao={solicitacao}
          onClose={() => navigate(-1)}
          onExcluir={
            !isAdmin && solicitacao.status === 'ABERTA'
              ? () => {
                  if (confirm('Excluir esta solicitação?')) deleteMutation.mutate()
                }
              : undefined
          }
          isAdmin={isAdmin}
        />
      </div>
    </AppLayout>
  )
}
