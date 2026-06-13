import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Filter, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { SolicitacaoCard } from '@/components/requests/SolicitacaoCard'
import { SolicitacaoDetalheModal } from '@/components/requests/SolicitacaoDetalheModal'
import { NovaSolicitacaoModal } from '@/components/requests/NovaSolicitacaoModal'
import { solicitacaoService } from '@/services'
import type { SolicitacaoDetalhe, SolicitacaoResumo } from '@/types'

const demoSolicitacoes: SolicitacaoResumo[] = [
  {
    id: 'demo-1',
    protocolo: '25185/2026-4',
    titulo: 'Poste sem iluminação na rua principal',
    status: 'ABERTA',
    anonima: false,
    categoriaNome: 'Iluminação',
    categoriaIcone: 'Lightbulb',
    categoriaCor: '#1d74d8',
    usuarioNome: 'Usuário',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    protocolo: '25186/2026-5',
    titulo: 'Buraco próximo à escola municipal',
    status: 'EM_ATENDIMENTO',
    anonima: false,
    categoriaNome: 'Infraestrutura',
    categoriaIcone: 'Construction',
    categoriaCor: '#f5b544',
    usuarioNome: 'Usuário',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    protocolo: '25187/2026-6',
    titulo: 'Solicitação de limpeza de praça',
    status: 'RESOLVIDA',
    anonima: true,
    categoriaNome: 'Limpeza Urbana',
    categoriaIcone: 'Trash2',
    categoriaCor: '#0f9f95',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
]

export function SolicitacoesPage() {
  const [busca, setBusca] = useState('')
  const [detalheSol, setDetalheSol] = useState<SolicitacaoDetalhe | null>(null)
  const [novaSol, setNovaSol] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['minhas-solicitacoes', busca],
    queryFn: () =>
      solicitacaoService.listarMinhas({
        busca: busca || undefined,
        page: 0,
        size: 50,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => solicitacaoService.excluir(id),
    onSuccess: () => {
      toast.success('Solicitação excluída')
      queryClient.invalidateQueries({ queryKey: ['minhas-solicitacoes'] })
      setDetalheSol(null)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? 'Erro ao excluir')
    },
  })

  async function openDetalhe(s: SolicitacaoResumo) {
    if (s.id.startsWith('demo-')) {
      setDetalheSol({
        ...s,
        descricao: s.titulo === 'Poste sem iluminação na rua principal'
          ? 'A lâmpada do poste está queimada há alguns dias, deixando a rua escura durante a noite.'
          : 'Solicitação registrada para acompanhamento do setor responsável.',
        categoria: {
          id: 'demo-cat',
          nome: s.categoriaNome,
          descricao: s.categoriaNome,
          icone: s.categoriaIcone,
          cor: s.categoriaCor,
          ativa: true,
          criadoEm: s.criadoEm,
        },
        respostaAdmin: s.status === 'RESOLVIDA'
          ? 'Prezado(a) cidadão(ã), sua solicitação foi atendida pela equipe responsável.'
          : 'Sua solicitação foi recebida e encaminhada para análise.',
        logradouro: 'Rua Exemplo, 123',
        bairro: 'Centro',
        complemento: '',
        historico: [
          {
            id: 'hist-1',
            statusNovo: 'ABERTA',
            alteradoPor: 'Sistema',
            criadoEm: s.criadoEm,
          },
        ],
      })
      return
    }
    try {
      const detalhe = await solicitacaoService.detalhe(s.id)
      setDetalheSol(detalhe)
    } catch {
      setDetalheSol({
        ...s,
        descricao: s.titulo || 'Solicitacao registrada para acompanhamento.',
        categoria: {
          id: 'categoria-resumo',
          nome: s.categoriaNome,
          descricao: s.categoriaNome,
          icone: s.categoriaIcone,
          cor: s.categoriaCor,
          ativa: true,
          criadoEm: s.criadoEm,
        },
        respostaAdmin: 'Sua solicitacao foi recebida e encaminhada para analise.',
        logradouro: 'Rua informada na solicitacao',
        bairro: '',
        complemento: '',
        historico: [
          {
            id: `${s.id}-hist`,
            statusNovo: s.status,
            alteradoPor: 'Sistema',
            criadoEm: s.criadoEm,
          },
        ],
      })
    }
  }

  const solicitacoes = data?.content ?? (isError ? demoSolicitacoes : [])
  const aguardando = solicitacoes.filter((s) => s.status === 'ABERTA' || s.status === 'EM_ANALISE')
  const andamento = solicitacoes.filter((s) => s.status === 'EM_ATENDIMENTO')
  const finalizado = solicitacoes.filter((s) => s.status === 'RESOLVIDA' || s.status === 'INDEFERIDA')

  return (
    <AppLayout title="Solicitações">
      <section className="wire-panel">
        <div className="panel-toolbar">
          <h2 className="panel-heading">Status:</h2>
          <div className="toolbar-actions">
            <div style={{ position: 'relative' }}>
              <Filter size={13} style={{ position: 'absolute', left: 8, top: 5 }} />
              <select className="small-select" style={{ paddingLeft: 28 }} aria-label="Filtrar">
                <option>filtrar</option>
              </select>
            </div>
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                className="pill-control"
                placeholder="buscar"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <button className="btn" onClick={() => setNovaSol(true)}>
              <Plus size={14} /> ADICIONAR
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="kanban-board">
            <LoadingColumn title="Aguardando" />
            <LoadingColumn title="Em andamento" />
            <LoadingColumn title="Finalizado" />
          </div>
        ) : (
          <div className="kanban-board">
            <StatusColumn title="Aguardando" items={aguardando} onDetalhes={openDetalhe} onCancelar={(s) => deleteMutation.mutate(s.id)} />
            <StatusColumn title="Em andamento" items={andamento} onDetalhes={openDetalhe} onCancelar={(s) => deleteMutation.mutate(s.id)} />
            <StatusColumn title="Finalizado" items={finalizado} onDetalhes={openDetalhe} onCancelar={(s) => deleteMutation.mutate(s.id)} />
          </div>
        )}
      </section>

      {detalheSol && (
        <SolicitacaoDetalheModal
          solicitacao={detalheSol}
          onClose={() => setDetalheSol(null)}
          onExcluir={detalheSol.status === 'ABERTA' ? () => deleteMutation.mutate(detalheSol.id) : undefined}
        />
      )}
      {novaSol && <NovaSolicitacaoModal onClose={() => setNovaSol(false)} />}
    </AppLayout>
  )
}

function LoadingColumn({ title }: { title: string }) {
  return (
    <div>
      <h3 className="kanban-title">{title}</h3>
      <div className="kanban-column">
        {[1, 2].map((i) => (
          <div key={i} className="request-card request-card-loading">
            <span />
            <span />
            <span />
            <div />
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusColumn({
  title,
  items,
  onDetalhes,
  onCancelar,
}: {
  title: string
  items: SolicitacaoResumo[]
  onDetalhes: (s: SolicitacaoResumo) => void
  onCancelar: (s: SolicitacaoResumo) => void
}) {
  return (
    <div>
      <h3 className="kanban-title">{title}</h3>
      <div className="kanban-column">
        {items.length === 0 ? (
          <div className="muted" style={{ textAlign: 'center', fontWeight: 700 }}>Sem solicitações</div>
        ) : (
          items.map((s) => (
            <SolicitacaoCard
              key={s.id}
              solicitacao={s}
              onDetalhes={() => onDetalhes(s)}
              onCancelar={() => onCancelar(s)}
            />
          ))
        )}
      </div>
    </div>
  )
}
