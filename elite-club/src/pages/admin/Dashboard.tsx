import { Link } from 'react-router-dom'
import { Avatar, PageHead, PaymentBadge, UsageBadge } from '../../components/ui'
import { useDB } from '../../lib/store'
import { currentMonth, formatDate, formatDateLong, monthLabel, todayISO } from '../../lib/utils'

export default function Dashboard() {
  const db = useDB()
  const ym = currentMonth()
  const today = todayISO()
  const active = db.members.filter((m) => m.paymentStatus === 'adimplente')
  const overdue = db.members.filter((m) => m.paymentStatus === 'inadimplente')
  const monthUsages = db.usages.filter((u) => u.date.startsWith(ym) && u.status === 'confirmado')
  const pending = db.usages.filter((u) => u.status === 'pendente')
  const nextMeeting = [...db.meetings].sort((a, b) => a.date.localeCompare(b.date)).find((m) => m.date >= today)
  const idOf = (kind: string) => db.benefits.find((b) => b.kind === kind)?.id
  const roomHours = monthUsages.filter((u) => u.benefitId === idOf('sala')).reduce((s, u) => s + u.quantity, 0)

  const byBenefit = db.benefits
    .map((b) => {
      const list = monthUsages.filter((u) => u.benefitId === b.id)
      return {
        b,
        total: list.reduce((s, u) => s + u.quantity, 0),
        members: new Set(list.map((u) => u.memberId)).size,
      }
    })
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total)

  const recent = [...db.usages].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)
  const name = (id: string) => db.members.find((m) => m.id === id)?.name ?? '—'
  const benefit = (id: string) => db.benefits.find((b) => b.id === id)?.title ?? '—'

  return (
    <>
      <PageHead title="Painel" subtitle={`Visão geral de ${monthLabel(ym)}`} />

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', marginBottom: 20 }}>
        <div className="card kpi">
          <span className="label">Associadas ativas</span>
          <span className="value">{active.length}</span>
          <span className="small muted">de {db.members.length} cadastradas</span>
        </div>
        <div className="card kpi">
          <span className="label">Inadimplentes</span>
          <span className="value" style={{ color: overdue.length ? 'var(--err)' : undefined }}>{overdue.length}</span>
          <span className="small muted">benefícios bloqueados</span>
        </div>
        <div className="card kpi">
          <span className="label">Usos no mês</span>
          <span className="value">{monthUsages.length}</span>
          <span className="small muted">registros confirmados</span>
        </div>
        <div className="card kpi">
          <span className="label">Horas de sala</span>
          <span className="value">{roomHours}h</span>
          <span className="small muted">de {active.length * 2}h disponíveis no mês</span>
        </div>
        <Link to="/admin/solicitacoes" className="card kpi" style={{ textDecoration: 'none' }}>
          <span className="label">Solicitações</span>
          <span className="value" style={{ color: pending.length ? 'var(--warn)' : undefined }}>{pending.length}</span>
          <span className="small muted">aguardando aprovação</span>
        </Link>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="eyebrow">Próximo encontro</div>
          {nextMeeting ? (
            <div className="stack" style={{ gap: 8, marginTop: 8 }}>
              <h2>{nextMeeting.title}</h2>
              <div className="muted">
                {formatDateLong(nextMeeting.date)} · {nextMeeting.start}–{nextMeeting.end} · {nextMeeting.location}
              </div>
              <div className="row">
                {nextMeeting.program.map((p) => (
                  <span key={p} className="chip">{p}</span>
                ))}
              </div>
              <div className="small">
                <b>{db.usages.filter((u) => u.meetingId === nextMeeting.id && u.benefitId === idOf('convidada') && u.status !== 'recusado' && u.status !== 'cancelado').length}</b>{' '}
                convidada(s) cadastrada(s) ·{' '}
                <b>{db.usages.filter((u) => u.meetingId === nextMeeting.id && u.benefitId === idOf('encontro') && u.status === 'confirmado').length}</b>{' '}
                presença(s) registrada(s)
              </div>
              <div>
                <Link className="btn ghost sm" to="/admin/encontros">Gerenciar encontros</Link>
              </div>
            </div>
          ) : (
            <p className="muted">Nenhum encontro agendado.</p>
          )}
        </div>

        <div className="card">
          <div className="eyebrow">Uso por benefício · {monthLabel(ym)}</div>
          {byBenefit.length ? (
            <table style={{ marginTop: 8 }}>
              <tbody>
                {byBenefit.map(({ b, total, members }) => (
                  <tr key={b.id}>
                    <td>{b.title}</td>
                    <td className="small muted">{members} associada(s)</td>
                    <td style={{ textAlign: 'right' }}>
                      <b>{total}</b> {b.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted">Nenhum uso confirmado neste mês ainda.</p>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="spread">
            <div className="eyebrow">Atividade recente</div>
            <Link to="/admin/usos" className="small">Ver tudo</Link>
          </div>
          <table style={{ marginTop: 8 }}>
            <tbody>
              {recent.map((u) => (
                <tr key={u.id}>
                  <td>
                    <b>{name(u.memberId)}</b>
                    <div className="small muted">{benefit(u.benefitId)}</div>
                  </td>
                  <td className="small muted">{formatDate(u.date)}</td>
                  <td style={{ textAlign: 'right' }}><UsageBadge status={u.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="eyebrow">Atenção: adimplência</div>
          {db.members.filter((m) => m.paymentStatus !== 'adimplente').length ? (
            <table style={{ marginTop: 8 }}>
              <tbody>
                {db.members
                  .filter((m) => m.paymentStatus !== 'adimplente')
                  .map((m) => (
                    <tr key={m.id}>
                      <td>
                        <Link to={`/admin/associadas/${m.id}`} className="row" style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Avatar member={m} />
                          <span>{m.name}</span>
                        </Link>
                      </td>
                      <td style={{ textAlign: 'right' }}><PaymentBadge status={m.paymentStatus} /></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p className="muted">Todas as associadas estão adimplentes.</p>
          )}
        </div>
      </div>
    </>
  )
}
