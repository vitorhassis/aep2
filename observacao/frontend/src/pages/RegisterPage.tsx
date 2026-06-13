import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authService } from '@/services'
import { useAuthStore } from '@/store/auth.store'
import { BrowserFrame } from '@/components/layout/AppLayout'

const schema = z
  .object({
    email: z.string().email('Email inválido'),
    senha: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmarSenha: z.string(),
    perfil: z.enum(['CIDADAO', 'ADMIN']),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  })

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { perfil: 'CIDADAO' },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      authService.register(data.email.split('@')[0] || data.email, data.email, data.senha, data.perfil),
    onSuccess: (resp) => {
      setAuth(resp.usuario, resp.accessToken, resp.refreshToken)
      navigate(resp.usuario.perfil === 'ADMIN' ? '/admin/solicitacoes' : '/solicitacoes')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? 'Erro ao registrar')
    },
  })

  return (
    <BrowserFrame>
      <div className="auth-stage">
        <section className="auth-card register">
          <h1 className="auth-title">ObservAção</h1>

          <form className="auth-form" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <span className="err">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <input className="form-input" type="password" autoComplete="new-password" {...register('senha')} />
              {errors.senha && <span className="err">{errors.senha.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar senha</label>
              <input className="form-input" type="password" autoComplete="new-password" {...register('confirmarSenha')} />
              {errors.confirmarSenha && <span className="err">{errors.confirmarSenha.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de usuário</label>
              <select className="form-select" {...register('perfil')}>
                <option value="CIDADAO">Cidadão</option>
                <option value="ADMIN">Gerente</option>
              </select>
            </div>

            <div className="auth-actions">
              <Link to="/login" className="auth-link">Entrar</Link>
              <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Registrando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </BrowserFrame>
  )
}
