import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/store/auth.store'

// Auth pages
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
// Cidadão pages
import { DashboardPage } from '@/pages/DashboardPage'
import { SolicitacoesPage } from '@/pages/SolicitacoesPage'
import { NovaSolicitacaoPage } from '@/pages/NovaSolicitacaoPage'
import { SolicitacaoDetalhePage } from '@/pages/SolicitacaoDetalhePage'
import { BuscarProtocoloPage } from '@/pages/BuscarProtocoloPage'
// Admin pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminSolicitacoesPage } from '@/pages/admin/AdminSolicitacoesPage'
import { AdminCategoriasPage } from '@/pages/admin/AdminCategoriasPage'

function SolicitacoesRoute() {
  const { usuario } = useAuthStore()
  return usuario?.perfil === 'ADMIN' ? <AdminSolicitacoesPage /> : <SolicitacoesPage />
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode
  requiredRole?: 'ADMIN' | 'CIDADAO'
}) {
  const { isAuthenticated, usuario } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requiredRole && usuario?.perfil !== requiredRole) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/protocolo" element={<BuscarProtocoloPage />} />
          <Route path="/protocolo/:numero" element={<BuscarProtocoloPage />} />

          {/* Cidadão */}
          <Route path="/" element={
            <ProtectedRoute requiredRole="CIDADAO"><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/solicitacoes" element={
            <ProtectedRoute><SolicitacoesRoute /></ProtectedRoute>
          } />
          <Route path="/solicitacoes/nova" element={
            <ProtectedRoute requiredRole="CIDADAO"><NovaSolicitacaoPage /></ProtectedRoute>
          } />
          <Route path="/solicitacoes/:id" element={
            <ProtectedRoute><SolicitacaoDetalhePage /></ProtectedRoute>
          } />
          <Route
  path="/categorias"
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <AdminCategoriasPage />
    </ProtectedRoute>
  }
/>

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN"><AdminDashboardPage /></ProtectedRoute>
          } />
          <Route path="/admin/solicitacoes" element={
            <ProtectedRoute requiredRole="ADMIN"><AdminSolicitacoesPage /></ProtectedRoute>
          } />
          <Route path="/admin/categorias" element={
            <ProtectedRoute requiredRole="ADMIN"><AdminCategoriasPage /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}
