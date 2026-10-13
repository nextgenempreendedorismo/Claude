import { useState } from 'react'
import { Icon } from '../../components/Icons'
import UsageForm from '../../components/UsageForm'
import UsageTable from '../../components/UsageTable'
import { Avatar, Field, Modal, PageHead } from '../../components/ui'
import { checkUsage } from '../../lib/rules'
import { remove, upsert, useDB } from '../../lib/store'
import type { Meeting } from '../../lib/types'
import { formatDateLong, todayISO, uid } from '../../lib/utils'

const PROGRAM = ['Networking', 'Pocket Talk', 'Hot Seat', 'Pitch & Venda', 'Mesa de Oportunidades', 'Especialista convidada', 'Elite Cast']

function MeetingForm({ initial, onClose }: { initial?: Meeting; onClose: () => void }) {
  const [m, setM] = useState<Meeting>(
    initial ?? {
      id: uid(),
      date: todayISO(),
      start: '10:00',
      end: '12:00',
      title: 'Encontro Elite',
      location: 'Ecossistema Dialog',
      program: ['Networking', 'Pocket Talk', 'Hot Seat', 'Pitch & Venda', 'Mesa de Oportunidades'],
      createdAt: new Date().toISOString(),
    },
  )
  const set = <K extends keyof Meeting>(k: K, v: Meeting[K]) => setM((x) => ({ ...x, [k]: v }))
  const toggle = (p: string) => set('program', m.program.includes(p) ? m.program.filter((x) => x !== p) : [...m.program, p])
  return (
    <Modal
      title={initial ? 'Editar encontro' : 'Novo encontro'}
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn gold" disabled={!m.title || !m.date} onClick={() => { upsert('meetings', m); onClose() }}>Salvar</button>
        </>
      }
    >
      <div className="grid-3">
        <Field label="Data"><input type="date" value={m.date} onChange={(e) => set('date', e.target.value)} /></Field>
        <Field label="Início"><input type="time" value={m.start} onChange={(e) => set('start', e.target.value)} /></Field>
        <Field label="Término"><input type="time" value={m.end} onChange={(e) => set('end', e.target.value)} /></Field>
      </div>
      <div className="grid-2" style={{ marginTop: 16 }}>
        <Field label="Título"><input value={m.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <Field label="Local"><input value={m.location} onChange={(e) => set('location', e.target.value)} /></Field>
        <Field label="Descrição / tema" span><textarea value={m.description ?? ''} onChange={(e) => set('description', e.target.value)} /></Field>
      </div>
      <div className="section-title">Programação</div>
      <div className="row">
        {PROGRAM.map((p) => (
          <label key={p} className="check"><input type="checkbox" checked={m.program.includes(p)} onChange={() => toggle(p)} /> {p}</label>
        ))}
      </div>
    </Modal>
  )
}

export default function Meetings() {
  const db = useDB()
  const [editing, setEditing] = useState<Meeting | 'new' | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [guestFor, setGuestFor] = useState<string | null>(null)
  const today = todayISO()
  const sorted = [...db.meetings].sort((a, b) => a.date.localeCompare(b.date))
  const upcoming = sorted.filter((m) => m.date >= today)
  const past = sorted.filter((m) => m.date < today).reverse()
  const encontro = db.benefits.find((b) => b.kind === 'encontro')
  const convidada = db.benefits.find((b) => b.kind === 'convidada')

  function togglePresence(meeting: Meeting, memberId: string) {
    if (!encontro) return
    const existing = db.usages.find((u) => u.meetingId === meeting.id && u.memberId === memberId && u.benefitId === encontro.id)
    if (existing) {
      remove('usages', existing.id)
      return
    }
    const draft = {
      memberId,
      benefitId: encontro.id,
      meetingId: meeting.id,
      date: meeting.date,
      quantity: 1,
      status: 'confirmado' as const,
      origin: 'admin' as const,
    }
    const check = checkUsage(db, draft)
    if (!check.ok && !confirm(`${check.errors.join('\n')}\n\nRegistrar presença mesmo assim?`)) return
    upsert('usages', { ...draft, id: uid(), createdAt: new Date().toISOString(), note: check.ok ? undefined : '[Exceção autorizada] presença' })
  }

  function renderMeeting(m: Meeting) {
    const open = openId === m.id
    const presences = db.usages.filter((u) => u.meetingId === m.id && u.benefitId === encontro?.id)
    const guests = db.usages.filter((u) => u.meetingId === m.id && u.benefitId === convidada?.id)
    const d = new Date(m.date + 'T12:00')
    return (
      <div key={m.id} className="card" style={{ padding: 0 }}>
        <div className="spread" style={{ padding: 18 }}>
          <div className="row" style={{ flexWrap: 'nowrap', gap: 16 }}>
            <div className="meeting-date">
              <b>{String(d.getDate()).padStart(2, '0')}</b>
              <span>{d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
            </div>
            <div>
              <h3>{m.title}</h3>
              <div className="small muted">{formatDateLong(m.date)} · {m.start}–{m.end} · {m.location}</div>
              <div className="small" style={{ marginTop: 4 }}>
                <b>{presences.length}</b> presença(s) · <b>{guests.filter((g) => g.status !== 'recusado' && g.status !== 'cancelado').length}</b> convidada(s)
              </div>
            </div>
          </div>
          <div className="row">
            <button className="btn ghost sm" onClick={() => setOpenId(open ? null : m.id)}>{open ? 'Fechar' : 'Presenças e convidadas'}</button>
            <button className="btn ghost icon" title="Editar" onClick={() => setEditing(m)}><Icon.edit width={14} /></button>
            <button className="btn ghost icon" title="Excluir" onClick={() => confirm('Excluir este encontro?') && remove('meetings', m.id)}><Icon.trash width={14} /></button>
          </div>
        </div>
        {open && (
          <div style={{ borderTop: '1px solid var(--line)', padding: 18 }} className="stack">
            {m.description && <p className="muted" style={{ margin: 0 }}>{m.description}</p>}
            <div className="row">{m.program.map((p) => <span key={p} className="chip">{p}</span>)}</div>
            <div className="section-title" style={{ marginTop: 4 }}>Check-in de presença</div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 8 }}>
              {db.members
                .filter((x) => x.paymentStatus !== 'cancelada')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((x) => {
                  const present = presences.some((u) => u.memberId === x.id)
                  return (
                    <label key={x.id} className="check card flat" style={{ padding: 10, cursor: 'pointer', background: present ? 'var(--ok-bg)' : undefined }}>
                      <input type="checkbox" checked={present} onChange={() => togglePresence(m, x.id)} />
                      <Avatar member={x} />
                      <span>
                        {x.name}
                        {x.paymentStatus !== 'adimplente' && <div className="small" style={{ color: 'var(--err)' }}>{x.paymentStatus}</div>}
                      </span>
                    </label>
                  )
                })}
            </div>
            <div className="spread">
              <div className="section-title" style={{ flex: 1 }}>Convidadas</div>
              <button className="btn ghost sm" onClick={() => setGuestFor(m.id)}><Icon.plus width={14} /> Cadastrar convidada</button>
            </div>
            <UsageTable usages={guests} />
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <PageHead
        title="Encontros Elite"
        subtitle="Calendário da comunidade, check-in de presença e convidadas intencionais."
        actions={<button className="btn gold" onClick={() => setEditing('new')}><Icon.plus width={16} /> Novo encontro</button>}
      />
      <h3 style={{ marginBottom: 10 }}>Próximos</h3>
      <div className="stack">{upcoming.length ? upcoming.map(renderMeeting) : <p className="muted">Nenhum encontro agendado.</p>}</div>
      <h3 style={{ margin: '28px 0 10px' }}>Anteriores</h3>
      <div className="stack">{past.length ? past.map(renderMeeting) : <p className="muted">Nenhum encontro anterior.</p>}</div>

      {editing && <MeetingForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
      {guestFor && convidada && (
        <UsageForm
          mode="admin"
          initial={{ benefitId: convidada.id, meetingId: guestFor, date: db.meetings.find((x) => x.id === guestFor)?.date }}
          onClose={() => setGuestFor(null)}
        />
      )}
    </>
  )
}
