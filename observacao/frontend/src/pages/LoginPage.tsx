import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authService } from '@/services'
import { useAuthStore } from '@/store/auth.store'
import { BrowserFrame } from '@/components/layout/AppLayout'

const schema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Informe a senha'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => authService.login(data.email, data.senha),
    onSuccess: (resp) => {
      setAuth(resp.usuario, resp.accessToken, resp.refreshToken)
      navigate(resp.usuario.perfil === 'ADMIN' ? '/admin/solicitacoes' : '/solicitacoes')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? 'Credenciais inválidas')
    },
  })

  return (
    <BrowserFrame>
      <div className="auth-stage">
        <section className="auth-card">
          <h1 className="auth-title">ObservAção</h1>

          <form className="auth-form" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <span className="err">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <input className="form-input" type="password" autoComplete="current-password" {...register('senha')} />
              {errors.senha && <span className="err">{errors.senha.message}</span>}
            </div>

            <div className="auth-actions">
              <Link to="/register" className="auth-link">Registrar-se</Link>
              <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </BrowserFrame>
  )
}
