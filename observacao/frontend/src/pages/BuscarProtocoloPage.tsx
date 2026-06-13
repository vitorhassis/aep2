import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Search, Eye, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { solicitacaoService } from '@/services'
import { SolicitacaoDetalheModal } from '@/components/requests/SolicitacaoDetalheModal'
import type { SolicitacaoDetalhe } from '@/types'
import { StatusBadge, CategoryBadge } from '@/components/ui/Badges'
import { formatDate } from '@/lib/utils'

export function BuscarProtocoloPage() {
  const { numero: paramNumero } = useParams()
  const [busca, setBusca] = useState(paramNumero ?? '')
  const [resultado, setResultado] = useState<SolicitacaoDetalhe | null>(null)
  const [loading, setLoading] = useState(false)
  const [detalheOpen, setDetalheOpen] = useState(false)

  async function handleBuscar(e: React.FormEvent) {
    e.preventDefault()
    if (!busca.trim()) return
    setLoading(true)
    setResultado(null)
    try {
      const sol = await solicitacaoService.buscarPorProtocolo(busca.trim())
      setResultado(sol)
    } catch (err: any) {
      toast.error(
        err?.response?.status === 404
          ? 'Protocolo não encontrado'
          : 'Erro ao buscar protocolo'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px' }}>
      {/* Back link */}
      <div style={{ width: '100%', maxWidth: 560, marginBottom: 24 }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Voltar ao login
        </Link>
      </div>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ width: 44, height: 44, background: 'var(--primary-500)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Eye size={22} color="#fff" strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          Observ<span style={{ color: 'var(--primary-500)' }}>Ação</span>
        </span>
      </div>

      {/* Search card */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '32px 36px', width: '100%', maxWidth: 560, boxShadow: 'var(--shadow-lg)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 6px', color: 'var(--text-primary)' }}>
          Consultar Protocolo
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 24px' }}>
          Acompanhe sua solicitação sem precisar de login
        </p>

        <form onSubmit={handleBuscar} style={{ display: 'flex', gap: 10 }}>
          <div className="search-wrapper" style={{ flex: 1 }}>
            <Search className="search-icon" />
            <input
              className="form-input"
              placeholder="Ex: OBS-202506-000001"
              value={busca}
              onChange={(e) => setBusca(e.target.value.toUpperCase())}
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {/* Resultado */}
        {resultado && (
          <div style={{ marginTop: 24, padding: '16px', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <span className="solicitacao-protocolo" style={{ marginBottom: 6, display: 'inline-block' }}>
                  {resultado.protocolo}
                </span>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0 0' }}>
                  {resultado.titulo}
                </p>
              </div>
              <StatusBadge status={resultado.status} />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <CategoryBadge name={resultado.categoria.nome} color={resultado.categoria.cor} />
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px' }}>
              {resultado.descricao}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Criado em {formatDate(resultado.criadoEm)}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setDetalheOpen(true)}
              >
                <Eye size={13} /> Ver detalhes completos
              </button>
            </div>
          </div>
        )}
      </div>

      {detalheOpen && resultado && (
        <SolicitacaoDetalheModal
          solicitacao={resultado}
          onClose={() => setDetalheOpen(false)}
        />
      )}
    </div>
  )
}
