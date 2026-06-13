import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ClipboardList, LogOut, Tags, UserCircle } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services'
import { cn } from '@/lib/utils'

const cidadaoNav = [
  { label: 'Minhas solicitações', href: '/solicitacoes', icon: ClipboardList },
]

const adminNav = [
  { label: 'Solicitações', href: '/solicitacoes', icon: ClipboardList },
  { label: 'Categorias', href: '/categorias', icon: Tags },
]

export function Sidebar() {
  const { usuario, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = usuario?.perfil === 'ADMIN' || location.pathname.startsWith('/admin') || location.pathname.startsWith('/categorias')
  const navItems = isAdmin ? adminNav : cidadaoNav

  async function handleLogout() {
    await authService.logout()
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-brand" aria-label="ObservAção">
          <div className="sidebar-brand-mark">O</div>
          <div>
            <strong>ObservAção</strong>
            <span>Prefeitura Municipal</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const active =
            item.href === '/solicitacoes'
                ? location.pathname.startsWith('/solicitacoes') || location.pathname === '/'
                : location.pathname.startsWith(item.href)

          return (
            <Link key={item.href} to={item.href} className={cn('sidebar-item', active && 'active')}>
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-mini">
          <UserCircle size={26} />
          <span>{isAdmin ? 'Gerente' : 'Usuário'}</span>
        </div>
        <button className="icon-button" onClick={handleLogout} title="Sair" aria-label="Sair">
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  )
}
