import { useMemo, useState } from 'react'
import { checkUsage, remaining } from '../lib/rules'
import { upsert, useDB } from '../lib/store'
import type { Usage, UsageStatus } from '../lib/types'
import { formatDate, todayISO, uid } from '../lib/utils'
import { Field, Modal } from './ui'

type Draft = Omit<Usage, 'id' | 'createdAt'> & { id?: string; createdAt?: string }

export default function UsageForm({
  initial,
  mode,
  onClose,
}: {
  initial?: Partial<Draft>
  mode: 'admin' | 'member'
  onClose: () => void
}) {
  const db = useDB()
  const [u, setU] = useState<Draft>({
    memberId: '',
    benefitId: '',
    date: todayISO(),
    quantity: 1,
    status: mode === 'admin' ? 'confirmado' : 'pendente',
    origin: mode === 'admin' ? 'admin' : 'associada',
    ...initial,
  })
  const [override, setOverride] = useState(false)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setU((x) => ({ ...x, [k]: v }))

  const benefits = db.benefits.filter((b) => b.active && (mode === 'admin' || b.memberCanRequest))
  const benefit = db.benefits.find((b) => b.id === u.benefitId)
  const check = useMemo(() => checkUsage(db, u), [db, u])
  const upcoming = db.meetings.filter((m) => m.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date))
  const meetingsForSelect = u.meetingId && !upcoming.some((m) => m.id === u.meetingId)
    ? [...db.meetings.filter((m) => m.id === u.meetingId), ...upcoming]
    : upcoming
  const left = benefit && u.memberId ? remaining(db, u.memberId, benefit, u.date.slice(0, 7)) : null

  const canSave = check.ok || (mode === 'admin' && override && !!u.note?.trim())

  function save() {
    if (!canSave) return
    const note = !check.ok && override ? `[Exceção autorizada] ${u.note ?? ''}`.trim() : u.note
    upsert('usages', {
      ...u,
      note,
      id: u.id ?? uid(),
      createdAt: u.createdAt ?? new Date().toISOString(),
    } as Usage)
    onClose()
  }

  function pickMeeting(id: string) {
    const m = db.meetings.find((x) => x.id === id)
    setU((x) => ({ ...x, meetingId: id || undefined, date: m ? m.date : x.date }))
  }

  return (
    <Modal
      title={u.id ? 'Editar registro' : mode === 'admin' ? 'Registrar uso de benefício' : 'Solicitar benefício'}
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn gold" disabled={!canSave} onClick={save}>
            {mode === 'admin' ? 'Salvar' : 'Enviar solicitação'}
          </button>
        </>
      }
    >
      <div className="grid-2">
        {mode === 'admin' && (
          <Field label="Associada">
            <select value={u.memberId} onChange={(e) => set('memberId', e.target.value)} disabled={!!initial?.memberId && !!initial?.id}>
              <option value="">Selecione…</option>
              {[...db.members].sort((a, b) => a.name.localeCompare(b.name)).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.paymentStatus !== 'adimplente' ? `(${m.paymentStatus})` : ''}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Benefício" span={mode === 'member'}>
          <select value={u.benefitId} onChange={(e) => setU((x) => ({ ...x, benefitId: e.target.value, guest: undefined, meetingId: undefined }))}>
            <option value="">Selecione…</option>
            {benefits.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </Field>

        {benefit && (
          <div className="card flat small" style={{ gridColumn: '1 / -1', padding: 14 }}>
            {benefit.description}
            {benefit.rules && <div className="muted" style={{ marginTop: 6 }}>{benefit.rules}</div>}
            {left !== null && (
              <div style={{ marginTop: 6 }}>
                Saldo em {u.date.slice(5, 7)}/{u.date.slice(0, 4)}: <b>{left} {benefit.unit}</b> de {benefit.monthlyQuota}
              </div>
            )}
          </div>
        )}

        {(benefit?.kind === 'convidada' || benefit?.kind === 'encontro') && (
          <Field label="Encontro" span>
            <select value={u.meetingId ?? ''} onChange={(e) => pickMeeting(e.target.value)}>
              <option value="">Selecione…</option>
              {(mode === 'admin' ? [...db.meetings].sort((a, b) => b.date.localeCompare(a.date)) : meetingsForSelect).map((m) => (
                <option key={m.id} value={m.id}>
                  {formatDate(m.date)} · {m.title}
                </option>
              ))}
            </select>
          </Field>
        )}

        {benefit?.kind === 'convidada' && (
          <>
            <Field label="Nome da convidada *"><input value={u.guest?.name ?? ''} onChange={(e) => set('guest', { ...u.guest, name: e.target.value })} /></Field>
            <Field label="WhatsApp da convidada"><input value={u.guest?.phone ?? ''} onChange={(e) => set('guest', { name: '', ...u.guest, phone: e.target.value })} /></Field>
            <Field label="E-mail da convidada"><input type="email" value={u.guest?.email ?? ''} onChange={(e) => set('guest', { name: '', ...u.guest, email: e.target.value })} /></Field>
            <Field label="Instagram da convidada"><input value={u.guest?.instagram ?? ''} onChange={(e) => set('guest', { name: '', ...u.guest, instagram: e.target.value })} /></Field>
          </>
        )}

        {benefit?.kind !== 'convidada' && benefit?.kind !== 'encontro' && (
          <Field label={benefit?.requiresBooking ? 'Data da reserva' : 'Data de uso'}>
            <input type="date" value={u.date} onChange={(e) => set('date', e.target.value)} />
          </Field>
        )}
        {benefit?.kind === 'sala' && (
          <Field label="Horário de início"><input type="time" value={u.startTime ?? ''} onChange={(e) => set('startTime', e.target.value)} /></Field>
        )}
        {benefit?.unit === 'horas' && (
          <Field label="Horas">
            <input type="number" min={0.5} step={0.5} value={u.quantity} onChange={(e) => set('quantity', Number(e.target.value))} />
          </Field>
        )}
        {mode === 'admin' && (
          <Field label="Status">
            <select value={u.status} onChange={(e) => set('status', e.target.value as UsageStatus)}>
              <option value="confirmado">Confirmado</option>
              <option value="pendente">Pendente</option>
              <option value="recusado">Recusado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </Field>
        )}
        <Field label="Observações" span>
          <textarea value={u.note ?? ''} onChange={(e) => set('note', e.target.value)} placeholder={mode === 'member' ? 'Ex.: serviço de interesse, preferência de horário…' : ''} />
        </Field>
      </div>

      {u.benefitId && (u.memberId || mode === 'member') && (
        <div className="stack" style={{ gap: 8, marginTop: 14 }}>
          {check.errors.map((e) => <div key={e} className="alert err">{e}</div>)}
          {check.warnings.map((w) => <div key={w} className="alert warn">{w}</div>)}
          {mode === 'admin' && !check.ok && (
            <label className="check">
              <input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} />
              Autorizar como exceção (exige observação)
            </label>
          )}
        </div>
      )}
    </Modal>
  )
}
