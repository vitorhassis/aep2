import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit3, Filter, Plus, Search, Trash2, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { categoriaService, type CategoriaRequest } from '@/services'
import type { Categoria } from '@/types'

const schema = z.object({
  nome: z.string().min(2, 'Nome muito curto'),
  descricao: z.string().optional(),
  icone: z.string().optional(),
  cor: z.string().min(4, 'Escolha uma cor'),
  ativa: z.boolean(),
})

type FormData = z.infer<typeof schema>

export function AdminCategoriasPage() {
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [criando, setCriando] = useState(false)
  const [busca, setBusca] = useState('')
  const queryClient = useQueryClient()

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias-todas'],
    queryFn: categoriaService.listarTodas,
  })

  const createMutation = useMutation({
    mutationFn: (data: CategoriaRequest) => categoriaService.criar(data),
    onSuccess: () => {
      toast.success('Categoria criada')
      queryClient.invalidateQueries({ queryKey: ['categorias-todas'] })
      queryClient.invalidateQueries({ queryKey: ['categorias-ativas'] })
      setCriando(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Erro ao criar'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoriaRequest }) =>
      categoriaService.atualizar(id, data),
    onSuccess: () => {
      toast.success('Categoria atualizada')
      queryClient.invalidateQueries({ queryKey: ['categorias-todas'] })
      queryClient.invalidateQueries({ queryKey: ['categorias-ativas'] })
      setEditando(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Erro ao atualizar'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriaService.deletar(id),
    onSuccess: () => {
      toast.success('Categoria desativada')
      queryClient.invalidateQueries({ queryKey: ['categorias-todas'] })
      queryClient.invalidateQueries({ queryKey: ['categorias-ativas'] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Erro ao deletar'),
  })

  const filtradas = categorias.filter((categoria) =>
    categoria.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (categoria.descricao ?? '').toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <AppLayout title="Categorias">
      <section className="wire-panel category-panel">
        <div className="panel-toolbar">
          <div>
            <h2 className="panel-heading">Categorias cadastradas</h2>
            <p className="panel-subtitle">Gerencie os tipos de solicitações disponíveis para os cidadãos.</p>
          </div>

          <div className="toolbar-actions">
            <div style={{ position: 'relative' }}>
              <Filter size={13} style={{ position: 'absolute', left: 8, top: 12 }} />
              <select className="small-select" style={{ paddingLeft: 28 }} aria-label="Filtrar">
                <option>Todas</option>
                <option>Ativas</option>
                <option>Inativas</option>
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
            <button className="btn btn-primary" onClick={() => setCriando(true)}>
              <Plus size={14} /> ADICIONAR
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="empty-state">Carregando categorias...</div>
        ) : (
          <table className="category-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className="empty-state">Nenhuma categoria encontrada</div>
                  </td>
                </tr>
              ) : (
                filtradas.map((categoria) => (
                  <tr key={categoria.id}>
                    <td>
                      <div className="category-name-cell">
                        <span className="category-swatch" style={{ backgroundColor: categoria.cor || '#1f7a8c' }} />
                        <div>
                          <strong>{categoria.nome}</strong>
                          {categoria.descricao && <p>{categoria.descricao}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={categoria.ativa ? 'badge badge-active' : 'badge badge-inactive'}>
                        {categoria.ativa ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="category-actions">
                        <button className="btn btn-sm btn-outline" onClick={() => setEditando(categoria)}>
                          <Edit3 size={14} /> Editar
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteMutation.mutate(categoria.id)}>
                          <Trash2 size={14} /> Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>

      {criando && (
        <CategoriaModal
          title="Nova Categoria"
          onClose={() => setCriando(false)}
          onSave={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
        />
      )}

      {editando && (
        <CategoriaModal
          title="Editar Categoria"
          initial={editando}
          onClose={() => setEditando(null)}
          onSave={(data) => updateMutation.mutate({ id: editando.id, data })}
          loading={updateMutation.isPending}
        />
      )}
    </AppLayout>
  )
}

interface CategoriaModalProps {
  title: string
  initial?: Categoria
  onClose: () => void
  onSave: (data: CategoriaRequest) => void
  loading: boolean
}

function CategoriaModal({ title, initial, onClose, onSave, loading }: CategoriaModalProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: initial?.nome ?? '',
      descricao: initial?.descricao ?? '',
      icone: initial?.icone ?? 'Tag',
      cor: initial?.cor ?? '#1f7a8c',
      ativa: initial?.ativa ?? true,
    },
  })

  const ativa = watch('ativa')
  const cor = watch('cor')

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <section className="modal modal-form category-modal">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={22} /></button>
        </div>

        <form onSubmit={handleSubmit((data) => onSave({
          nome: data.nome,
          descricao: data.descricao,
          icone: data.icone || 'Tag',
          cor: data.cor,
          ativa: data.ativa,
        }))}>
          <div className="modal-body">
            <div className="form-grid-two">
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <input className="form-input" placeholder="Ex: Iluminação" {...register('nome')} />
                {errors.nome && <span className="err">{errors.nome.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Ícone</label>
                <input className="form-input" placeholder="Ex: Lightbulb" {...register('icone')} />
              </div>

              <div className="form-group form-span">
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Descreva quando esta categoria deve ser usada"
                  {...register('descricao')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cor</label>
                <div className="color-field">
                  <input type="color" value={cor} onChange={(e) => setValue('cor', e.target.value)} aria-label="Cor da categoria" />
                  <input className="form-input" {...register('cor')} />
                </div>
                {errors.cor && <span className="err">{errors.cor.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <button
                  type="button"
                  className={`switch ${ativa ? 'on' : ''}`}
                  onClick={() => setValue('ativa', !ativa)}
                  aria-label="Alternar status"
                >
                  <span className="switch-knob" />
                </button>
                <span className="muted">{ativa ? 'Categoria ativa' : 'Categoria inativa'}</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
