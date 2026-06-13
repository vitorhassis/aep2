import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { NovaSolicitacaoModal } from '@/components/requests/NovaSolicitacaoModal'
import { ArrowLeft } from 'lucide-react'

export function NovaSolicitacaoPage() {
  const navigate = useNavigate()

  return (
    <AppLayout
      title="Nova Solicitação"
      actions={
        <button className="btn btn-ghost" onClick={() => navigate('/solicitacoes')}>
          <ArrowLeft size={14} /> Voltar
        </button>
      }
    >
      <div style={{ maxWidth: 640 }}>
        <NovaSolicitacaoModal
          onClose={() => navigate('/solicitacoes')}
          onSuccess={() => navigate('/solicitacoes')}
        />
      </div>
    </AppLayout>
  )
}
