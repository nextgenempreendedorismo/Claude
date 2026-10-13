import { useEffect, type ReactNode } from 'react'
import type { Member, PaymentStatus, UsageStatus } from '../lib/types'
import { initials } from '../lib/utils'
import { Icon } from './Icons'

export function Modal({
  title,
  onClose,
  children,
  footer,
  size,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'sm'
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size ?? ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="btn ghost icon" onClick={onClose} aria-label="Fechar">
            <Icon.x />
          </button>
        </div>
        {children}
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function Field({ label, children, span }: { label: string; children: ReactNode; span?: boolean }) {
  return (
    <label className="field" style={span ? { gridColumn: '1 / -1' } : undefined}>
      {label}
      {children}
    </label>
  )
}

export function Avatar({ member, size }: { member: Pick<Member, 'name' | 'photoUrl'>; size?: 'lg' }) {
  return member.photoUrl ? (
    <img className={`avatar ${size ?? ''}`} src={member.photoUrl} alt={member.name} />
  ) : (
    <span className={`avatar ${size ?? ''}`}>{initials(member.name)}</span>
  )
}

const payTone: Record<PaymentStatus, string> = {
  adimplente: 'ok',
  inadimplente: 'err',
  suspensa: 'warn',
  cancelada: 'neutral',
}
export const PaymentBadge = ({ status }: { status: PaymentStatus }) => (
  <span className={`badge ${payTone[status]}`}>{status}</span>
)

const usageTone: Record<UsageStatus, string> = {
  pendente: 'warn',
  confirmado: 'ok',
  recusado: 'err',
  cancelado: 'neutral',
}
export const UsageBadge = ({ status }: { status: UsageStatus }) => (
  <span className={`badge ${usageTone[status]}`}>{status}</span>
)

export function PageHead({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  )
}

export function Quota({ used, total, unit }: { used: number; total: number; unit: string }) {
  const pct = Math.min(100, (used / total) * 100)
  return (
    <div className="stack" style={{ gap: 6 }}>
      <div className="spread small">
        <span className="muted">
          {used} de {total} {unit} usados
        </span>
        <b>{Math.max(0, total - used)} disponível</b>
      </div>
      <div className="progress">
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>
}
