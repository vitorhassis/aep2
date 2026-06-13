import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Filter, Plus, Search } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { SolicitacaoCard } from '@/components/requests/SolicitacaoCard'
import { SolicitacaoDetalheModal } from '@/components/requests/SolicitacaoDetalheModal'
import { AdminUpdateStatusModal } from '@/components/requests/AdminUpdateStatusModal'
import { solicitacaoService } from '@/services'
import type { SolicitacaoDetalhe, SolicitacaoResumo } from '@/types'

const demoSolicitacoes: SolicitacaoResumo[] = [
  {
    id: 'admin-demo-1',
    protocolo: '25185/2026-4',
    titulo: 'Poste sem iluminação na rua principal',
    status: 'ABERTA',
    anonima: false,
    categoriaNome: 'Iluminação',
    categoriaIcone: 'Lightbulb',
    categoriaCor: '#1d74d8',
    usuarioNome: 'Maria Silva',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: 'admin-demo-2',
    protocolo: '25186/2026-5',
    titulo: 'Buraco próximo à escola municipal',
    status: 'EM_ATENDIMENTO',
    anonima: false,
    categoriaNome: 'Infraestrutura',
    categoriaIcone: 'Construction',
    categoriaCor: '#f5b544',
    usuarioNome: 'João Souza',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: 'admin-demo-3',
    protocolo: '25187/2026-6',
    titulo: 'Limpeza de praça',
    status: 'RESOLVIDA',
    anonima: true,
    categoriaNome: 'Limpeza Urbana',
    categoriaIcone: 'Trash2',
    categoriaCor: '#0f9f95',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
]

export function AdminSolicitacoesPage() {
  const [busca, setBusca] = useState('')
  const [detalheModal, setDetalheModal] = useState<SolicitacaoDetalhe | null>(null)
  const [editModal, setEditModal] = useState<SolicitacaoDetalhe | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-solicitacoes', busca],
    queryFn: () =>
      solicitacaoService.listarTodas({
        busca: busca || undefined,
        page: 0,
        size: 100,
      }),
  })

  async function openDetalhe(s: SolicitacaoResumo) {
    if (s.id.startsWith('admin-demo-')) {
      setDetalheModal(toDemoDetalhe(s))
      return
    }
    try {
      const detalhe = await solicitacaoService.detalhe(s.id)
      setDetalheModal(detalhe)
    } catch {
      setDetalheModal(toDemoDetalhe(s))
    }
  }

  async function openEdit(s: SolicitacaoResumo) {
    if (s.id.startsWith('admin-demo-')) {
      setEditModal(toDemoDetalhe(s))
      return
    }
    try {
      const detalhe = await solicitacaoService.detalhe(s.id)
      setEditModal(detalhe)
    } catch {
      setEditModal(toDemoDetalhe(s))
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
            <button className="btn">
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
            <StatusColumn title="Aguardando" items={aguardando} onDetalhes={openDetalhe} onEditar={openEdit} />
            <StatusColumn title="Em andamento" items={andamento} onDetalhes={openDetalhe} onEditar={openEdit} />
            <StatusColumn title="Finalizado" items={finalizado} onDetalhes={openDetalhe} onEditar={openEdit} />
          </div>
        )}
      </section>

      {detalheModal && (
        <SolicitacaoDetalheModal
          solicitacao={detalheModal}
          onClose={() => setDetalheModal(null)}
          isAdmin
        />
      )}
      {editModal && (
        <AdminUpdateStatusModal
          solicitacao={editModal}
          onClose={() => setEditModal(null)}
        />
      )}
    </AppLayout>
  )
}

function toDemoDetalhe(s: SolicitacaoResumo): SolicitacaoDetalhe {
  return {
    ...s,
    descricao: s.titulo,
    categoria: {
      id: 'demo-cat',
      nome: s.categoriaNome,
      descricao: s.categoriaNome,
      icone: s.categoriaIcone,
      cor: s.categoriaCor,
      ativa: true,
      criadoEm: s.criadoEm,
    },
    respostaAdmin: 'Sua solicitação foi recebida e encaminhada para a equipe responsável.',
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
      {
        id: 'hist-2',
        statusAnterior: 'ABERTA',
        statusNovo: s.status,
        alteradoPor: 'Gerente Exemplo',
        criadoEm: s.atualizadoEm,
      },
    ],
  }
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
  onEditar,
}: {
  title: string
  items: SolicitacaoResumo[]
  onDetalhes: (s: SolicitacaoResumo) => void
  onEditar: (s: SolicitacaoResumo) => void
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
              isAdmin
              onDetalhes={() => onDetalhes(s)}
              onEditar={() => onEditar(s)}
            />
          ))
        )}
      </div>
    </div>
  )
}
