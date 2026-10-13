import { memberIsActive, usedInMonth } from '../lib/rules'
import { useDB } from '../lib/store'
import type { Member } from '../lib/types'
import { Quota } from './ui'

export default function BenefitBalance({
  member,
  ym,
  onUse,
  mode = 'admin',
}: {
  member: Member
  ym: string
  onUse?: (benefitId: string) => void
  mode?: 'admin' | 'member'
}) {
  const db = useDB()
  const active = memberIsActive(member).ok
  const benefits = db.benefits.filter((b) => b.active)

  return (
    <div className="grid">
      {benefits.map((b) => {
        const partner = db.partners.find((p) => p.id === b.partnerId)
        const used = usedInMonth(db, member.id, b.id, ym)
        const count = db.usages.filter(
          (u) => u.memberId === member.id && u.benefitId === b.id && u.date.startsWith(ym) && u.status === 'confirmado',
        ).length
        const exhausted = !!b.monthlyQuota && used >= b.monthlyQuota
        const canAct = onUse && active && !exhausted && (mode === 'admin' || b.memberCanRequest)
        return (
          <div key={b.id} className="card benefit-card">
            <div className="head">
              <div>
                {partner && (
                  <span className={`badge ${partner.ecosystem === 'dialog' ? 'dialog' : 'neutral'}`} style={{ marginBottom: 8 }}>
                    {partner.name}
                  </span>
                )}
                <h3>{b.title}</h3>
              </div>
              {b.discountPct ? <span className="pct">{b.discountPct}%</span> : null}
            </div>
            <div className="small muted">{b.description}</div>
            {b.monthlyQuota ? (
              <Quota used={used} total={b.monthlyQuota} unit={b.unit} />
            ) : (
              <div className="small"><b>{count}</b> uso(s) confirmado(s) no mês</div>
            )}
            {canAct && (
              <div>
                <button className="btn sm ghost" onClick={() => onUse!(b.id)}>
                  {mode === 'admin' ? 'Registrar uso' : b.kind === 'convidada' ? 'Cadastrar convidada' : b.kind === 'sala' ? 'Reservar sala' : 'Solicitar'}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
