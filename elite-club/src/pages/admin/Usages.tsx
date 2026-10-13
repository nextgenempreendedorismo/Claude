import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icons'
import UsageForm from '../../components/UsageForm'
import UsageTable from '../../components/UsageTable'
import { PageHead } from '../../components/ui'
import { useDB } from '../../lib/store'
import type { UsageStatus } from '../../lib/types'
import { currentMonth, downloadFile, monthLabel, shiftMonth, toCSV } from '../../lib/utils'

export default function Usages() {
  const db = useDB()
  const [ym, setYm] = useState(currentMonth())
  const [memberId, setMemberId] = useState('')
  const [benefitId, setBenefitId] = useState('')
  const [status, setStatus] = useState<UsageStatus | ''>('')
  const [view, setView] = useState<'lista' | 'relatorio'>('lista')
  const [creating, setCreating] = useState(false)

  const list = useMemo(
    () =>
      db.usages
        .filter((u) => (ym ? u.date.startsWith(ym) : true))
        .filter((u) => !memberId || u.memberId === memberId)
        .filter((u) => !benefitId || u.benefitId === benefitId)
        .filter((u) => !status || u.status === status)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [db.usages, ym, memberId, benefitId, status],
  )

  const confirmed = list.filter((u) => u.status === 'confirmado')
  const report = db.members
    .filter((m) => !memberId || m.id === memberId)
    .map((m) => ({
      m,
      cells: db.benefits.map((b) =>
        confirmed.filter((u) => u.memberId === m.id && u.benefitId === b.id).reduce((s, u) => s + u.quantity, 0),
      ),
    }))

  const name = (id: string) => db.members.find((m) => m.id === id)?.name ?? ''
  const benefit = (id: string) => db.benefits.find((b) => b.id === id)

  function exportCSV() {
    const rows = [
      ['Data', 'Horário', 'Associada', 'Benefício', 'Quantidade', 'Unidade', 'Status', 'Convidada', 'Origem', 'Observações'],
      ...list.map((u) => [
        u.date, u.startTime, name(u.memberId), benefit(u.benefitId)?.title, u.quantity, benefit(u.benefitId)?.unit,
        u.status, u.guest?.name, u.origin, u.note,
      ]),
    ]
    downloadFile(`usos-${ym || 'todos'}.csv`, '﻿' + toCSV(rows), 'text/csv;charset=utf-8')
  }

  return (
    <>
      <PageHead
        title="Uso de benefícios"
        subtitle="Registro e contabilização de todos os benefícios utilizados pelas associadas."
        actions={
          <>
            <button className="btn ghost" onClick={exportCSV}><Icon.download width={16} /> Exportar CSV</button>
            <button className="btn gold" onClick={() => setCreating(true)}><Icon.plus width={16} /> Registrar uso</button>
          </>
        }
      />
      <div className="row" style={{ marginBottom: 16 }}>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn ghost sm" onClick={() => setYm(shiftMonth(ym || currentMonth(), -1))}>‹</button>
          <b style={{ minWidth: 140, textAlign: 'center' }}>{ym ? monthLabel(ym) : 'Todos os meses'}</b>
          <button className="btn ghost sm" onClick={() => setYm(shiftMonth(ym || currentMonth(), 1))}>›</button>
          <button className="btn ghost sm" onClick={() => setYm(ym ? '' : currentMonth())}>{ym ? 'Ver todos' : 'Mês atual'}</button>
        </div>
        <select style={{ maxWidth: 220 }} value={memberId} onChange={(e) => setMemberId(e.target.value)}>
          <option value="">Todas as associadas</option>
          {[...db.members].sort((a, b) => a.name.localeCompare(b.name)).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select style={{ maxWidth: 240 }} value={benefitId} onChange={(e) => setBenefitId(e.target.value)}>
          <option value="">Todos os benefícios</option>
          {db.benefits.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
        </select>
        <select style={{ maxWidth: 160 }} value={status} onChange={(e) => setStatus(e.target.value as UsageStatus | '')}>
          <option value="">Todos os status</option>
          <option value="confirmado">Confirmado</option>
          <option value="pendente">Pendente</option>
          <option value="recusado">Recusado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="tabs">
        <button className={view === 'lista' ? 'active' : ''} onClick={() => setView('lista')}>Registros ({list.length})</button>
        <button className={view === 'relatorio' ? 'active' : ''} onClick={() => setView('relatorio')}>Relatório por associada</button>
      </div>

      {view === 'lista' ? (
        <UsageTable usages={list} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Associada</th>
                {db.benefits.map((b) => <th key={b.id} title={b.title} style={{ minWidth: 110 }}>{b.title}</th>)}
              </tr>
            </thead>
            <tbody>
              {report.map(({ m, cells }) => (
                <tr key={m.id}>
                  <td><b>{m.name}</b></td>
                  {cells.map((c, i) => {
                    const b = db.benefits[i]!
                    return (
                      <td key={b.id} className="small" style={{ color: c ? undefined : 'var(--muted)' }}>
                        {b.monthlyQuota && ym ? `${c}/${b.monthlyQuota}` : c || '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && <UsageForm mode="admin" onClose={() => setCreating(false)} />}
    </>
  )
}
