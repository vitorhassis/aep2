import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  title?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export function BrowserFrame({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function AppLayout({ title, children }: AppLayoutProps) {
  return (
    <BrowserFrame>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          {title && <h1 className="page-title">{title}</h1>}
          {children}
        </main>
      </div>
    </BrowserFrame>
  )
}
