import { useState } from 'react'
import { remove, upsert, useDB } from '../lib/store'
import type { Usage } from '../lib/types'
import { formatDate } from '../lib/utils'
import { Icon } from './Icons'
import UsageForm from './UsageForm'
import { Empty, UsageBadge } from './ui'

export default function UsageTable({ usages, showMember = true, actions = true }: { usages: Usage[]; showMember?: boolean; actions?: boolean }) {
  const db = useDB()
  const [editing, setEditing] = useState<Usage | null>(null)
  const member = (id: string) => db.members.find((m) => m.id === id)
  const benefit = (id: string) => db.benefits.find((b) => b.id === id)
  const meeting = (id?: string) => db.meetings.find((m) => m.id === id)

  if (!usages.length) return <div className="table-wrap"><Empty>Nenhum registro.</Empty></div>

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            {showMember && <th>Associada</th>}
            <th>Benefício</th>
            <th>Detalhes</th>
            <th>Qtd.</th>
            <th>Status</th>
            {actions && <th></th>}
          </tr>
        </thead>
        <tbody>
          {usages.map((u) => {
            const b = benefit(u.benefitId)
            return (
              <tr key={u.id}>
                <td className="small">
                  {formatDate(u.date)}
                  {u.startTime && <div className="muted">{u.startTime}</div>}
                </td>
                {showMember && <td><b>{member(u.memberId)?.name ?? '—'}</b></td>}
                <td>
                  {b?.title ?? '—'}
                  <div className="small muted">{u.origin === 'associada' ? 'Solicitado pela associada' : 'Registrado pelo admin'}</div>
                </td>
                <td className="small">
                  {u.guest && <div>Convidada: <b>{u.guest.name}</b>{u.guest.phone && ` · ${u.guest.phone}`}</div>}
                  {u.meetingId && <div className="muted">{meeting(u.meetingId)?.title}</div>}
                  {u.note && <div className="muted">{u.note}</div>}
                </td>
                <td className="small">{u.quantity} {b?.unit}</td>
                <td><UsageBadge status={u.status} /></td>
                {actions && (
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                    {u.status === 'pendente' && (
                      <>
                        <button className="btn sm gold" title="Aprovar" onClick={() => upsert('usages', { ...u, status: 'confirmado' })}><Icon.check width={14} /></button>{' '}
                        <button className="btn sm danger" title="Recusar" onClick={() => upsert('usages', { ...u, status: 'recusado' })}><Icon.x width={14} /></button>{' '}
                      </>
                    )}
                    <button className="btn ghost icon" title="Editar" onClick={() => setEditing(u)}><Icon.edit width={14} /></button>{' '}
                    <button className="btn ghost icon" title="Excluir" onClick={() => confirm('Excluir este registro?') && remove('usages', u.id)}><Icon.trash width={14} /></button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      {editing && <UsageForm mode="admin" initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
