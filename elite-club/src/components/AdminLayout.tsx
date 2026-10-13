import { useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { logout, useSession } from '../lib/auth'
import { useDB } from '../lib/store'
import { Icon } from './Icons'

const NAV = [
  { to: '/admin', label: 'Painel', icon: Icon.dashboard, end: true },
  { to: '/admin/associadas', label: 'Associadas', icon: Icon.users },
  { to: '/admin/usos', label: 'Uso de benefícios', icon: Icon.list },
  { to: '/admin/solicitacoes', label: 'Solicitações', icon: Icon.inbox },
  { to: '/admin/encontros', label: 'Encontros', icon: Icon.calendar },
  { to: '/admin/beneficios', label: 'Benefícios', icon: Icon.gift },
  { to: '/admin/parceiros', label: 'Parceiros', icon: Icon.handshake },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Icon.settings },
]

export default function AdminLayout() {
  const session = useSession()
  const db = useDB()
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  if (session?.role !== 'admin') return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  const pending = db.usages.filter((u) => u.status === 'pendente').length

  return (
    <div className="shell">
      <div className="mobile-bar">
        <img src="/brand/elite-horizontal-light.png" alt="Elite Club" />
        <button onClick={() => setOpen(true)} aria-label="Abrir menu">
          <Icon.menu width={24} height={24} />
        </button>
      </div>
      <aside className={`sidebar ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
        <div className="brand">
          <img src="/brand/elite-horizontal-light.png" alt="Elite Club" />
        </div>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav ${isActive ? 'active' : ''}`}>
            <n.icon />
            {n.label}
            {n.to === '/admin/solicitacoes' && pending > 0 && (
              <span className="badge warn" style={{ marginLeft: 'auto' }}>
                {pending}
              </span>
            )}
          </NavLink>
        ))}
        <div className="foot">
          <div className="ecosystem">
            <img src="/brand/dialog-mark.png" alt="Dialog" />
            <span>Ecossistema Clube Dialog</span>
          </div>
          <button className="btn ghost sm" style={{ color: '#d9cfbf', borderColor: '#3a3226' }} onClick={logout}>
            <Icon.logout width={14} height={14} /> Sair
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
