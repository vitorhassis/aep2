import { useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImagePlus, Upload, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { categoriaService, solicitacaoService } from '@/services'
import type { CreateSolicitacaoRequest } from '@/types'

const schema = z.object({
  categoriaId: z.string().min(1, 'Selecione uma categoria'),
  prioridade: z.string().min(1, 'Selecione uma prioridade'),
  descricao: z.string().min(20, 'Descreva com mais detalhes'),
  localizacao: z.string().min(3, 'Informe a localização'),
  emailContato: z.string().email('Email inválido').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface Props {
  onClose: () => void
  onSuccess?: () => void
}

export function NovaSolicitacaoModal({ onClose, onSuccess }: Props) {
  const [anonima, setAnonima] = useState(false)
  const [arquivoNome, setArquivoNome] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const queryClient = useQueryClient()

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias-ativas'],
    queryFn: categoriaService.listarAtivas,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { prioridade: 'MEDIA' },
  })

  const mutation = useMutation({
    mutationFn: (data: CreateSolicitacaoRequest) => solicitacaoService.criar(data),
    onSuccess: (sol) => {
      toast.success(`Solicitação criada! Protocolo: ${sol.protocolo}`, {
        duration: 6000,
        description: 'Guarde o número do protocolo para acompanhar.',
      })
      queryClient.invalidateQueries({ queryKey: ['minhas-solicitacoes'] })
      onSuccess?.()
      onClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? 'Erro ao criar solicitação')
    },
  })

  function onSubmit(data: FormData) {
    const categoria = categorias.find((c) => c.id === data.categoriaId)
    const local = data.localizacao.trim()
    mutation.mutate({
      titulo: `${categoria?.nome ?? 'Solicitação'} - ${local}`,
      descricao: data.descricao,
      categoriaId: data.categoriaId,
      anonima,
      emailContato: anonima ? data.emailContato || undefined : undefined,
      logradouro: local,
    })
  }

  function handleArquivoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setArquivoNome(file.name)
    setPreviewUrl(URL.createObjectURL(file))
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <section className="modal modal-form">
        <div className="modal-header">
          <h2 className="modal-title">Criar Nova Solicitação</h2>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            <div className="form-grid-two">
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select className="form-select" {...register('categoriaId')}>
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
                {errors.categoriaId && <span className="err">{errors.categoriaId.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Prioridade</label>
                <select className="form-select" {...register('prioridade')}>
                  <option value="">Selecione a prioridade</option>
                  <option value="ALTA">Alta</option>
                  <option value="MEDIA">Média</option>
                  <option value="BAIXA">Baixa</option>
                </select>
                {errors.prioridade && <span className="err">{errors.prioridade.message}</span>}
              </div>

              <div className="form-group form-span">
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Descreva sua solicitação"
                  {...register('descricao')}
                />
                {errors.descricao && <span className="err">{errors.descricao.message}</span>}
              </div>

              <div className="form-group form-span">
                <label className="form-label">Localização</label>
                <input className="form-input" placeholder="Ex: Rua X, nº Y" {...register('localizacao')} />
                {errors.localizacao && <span className="err">{errors.localizacao.message}</span>}
              </div>

              <div className="form-group form-span">
                <label className="form-label">Anexo (imagem)</label>
                <input
                  ref={fileInputRef}
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={handleArquivoChange}
                />
                <button
                  className="upload-box"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="upload-icon">
                    {previewUrl ? <ImagePlus size={22} /> : <Upload size={22} />}
                  </span>
                  <span>
                    <strong>{arquivoNome || 'Importar imagem'}</strong>
                    <small>{arquivoNome ? 'Arquivo selecionado para simulação visual' : 'PNG, JPG ou JPEG'}</small>
                  </span>
                </button>
                {previewUrl && (
                  <div className="upload-preview">
                    <img src={previewUrl} alt="Pré-visualização do anexo" />
                  </div>
                )}
              </div>

              <div className="form-group form-span">
                <label className="form-label">Opção de Envio</label>
                <div className="radio-row">
                  <label><input type="radio" checked={!anonima} onChange={() => setAnonima(false)} /> Enviar identificado</label>
                  <label><input type="radio" checked={anonima} onChange={() => setAnonima(true)} /> Enviar anonimamente</label>
                </div>
              </div>

              {anonima && (
                <div className="form-group form-span">
                  <label className="form-label">Email para retorno (opcional)</label>
                  <input className="form-input" type="email" placeholder="seu@email.com" {...register('emailContato')} />
                  {errors.emailContato && <span className="err">{errors.emailContato.message}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <button type="button" className="btn" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
