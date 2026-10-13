import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import BenefitBalance from '../../components/BenefitBalance'
import { Icon } from '../../components/Icons'
import UsageForm from '../../components/UsageForm'
import { Avatar, Field, Modal, PaymentBadge, UsageBadge } from '../../components/ui'
import { logout, useSession } from '../../lib/auth'
import { publicPageUrl, socialUrl, whatsappUrl } from '../../lib/links'
import { memberIsActive } from '../../lib/rules'
import { upsert, useDB } from '../../lib/store'
import type { Member } from '../../lib/types'
import { currentMonth, formatDate, formatDateLong, initials, monthLabel, todayISO } from '../../lib/utils'

/** A associada edita apenas o conteúdo da própria página pública. */
function ProfileEditor({ member, onClose }: { member: Member; onClose: () => void }) {
  const [m, setM] = useState(member)
  const set = <K extends keyof Member>(k: K, v: Member[K]) => setM((x) => ({ ...x, [k]: v }))
  const setSocial = (k: keyof Member['socials'], v: string) => setM((x) => ({ ...x, socials: { ...x.socials, [k]: v } }))
  return (
    <Modal
      title="Editar minha página"
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn gold" onClick={() => { upsert('members', m); onClose() }}>Salvar</button>
        </>
      }
    >
      <div className="grid-2">
        <Field label="Nome de exibição"><input value={m.displayName ?? ''} onChange={(e) => set('displayName', e.target.value)} /></Field>
        <Field label="Cargo / atuação"><input value={m.role ?? ''} onChange={(e) => set('role', e.target.value)} /></Field>
        <Field label="Empresa"><input value={m.company ?? ''} onChange={(e) => set('company', e.target.value)} /></Field>
        <Field label="WhatsApp"><input value={m.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value)} /></Field>
        <Field label="Frase de destaque" span><input value={m.headline ?? ''} onChange={(e) => set('headline', e.target.value)} /></Field>
        <Field label="Sobre" span><textarea value={m.bio ?? ''} onChange={(e) => set('bio', e.target.value)} /></Field>
        <Field label="Serviços (um por linha)" span><textarea value={m.services ?? ''} onChange={(e) => set('services', e.target.value)} /></Field>
        <Field label="Instagram"><input value={m.socials.instagram ?? ''} onChange={(e) => setSocial('instagram', e.target.value)} /></Field>
        <Field label="LinkedIn"><input value={m.socials.linkedin ?? ''} onChange={(e) => setSocial('linkedin', e.target.value)} /></Field>
        <Field label="Site"><input value={m.socials.website ?? ''} onChange={(e) => setSocial('website', e.target.value)} /></Field>
        <Field label="Portfólio"><input value={m.socials.portfolio ?? ''} onChange={(e) => setSocial('portfolio', e.target.value)} /></Field>
        <Field label="Facebook"><input value={m.socials.facebook ?? ''} onChange={(e) => setSocial('facebook', e.target.value)} /></Field>
        <Field label="TikTok"><input value={m.socials.tiktok ?? ''} onChange={(e) => setSocial('tiktok', e.target.value)} /></Field>
        <Field label="YouTube"><input value={m.socials.youtube ?? ''} onChange={(e) => setSocial('youtube', e.target.value)} /></Field>
      </div>
    </Modal>
  )
}

export default function MemberHome() {
  const session = useSession()
  const db = useDB()
  const [requesting, setRequesting] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  if (session?.role !== 'member') return <Navigate to="/login" replace />
  const m = db.members.find((x) => x.id === session.memberId)
  if (!m) {
    return (
      <div className="empty">
        <p>Cadastro não encontrado.</p>
        <button className="btn" onClick={logout}>Voltar ao login</button>
      </div>
    )
  }

  const ym = currentMonth()
  const status = memberIsActive(m)
  const meetings = db.meetings.filter((x) => x.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3)
  const mine = db.usages.filter((u) => u.memberId === m.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12)
  const partners = db.partners.filter((p) => p.active)
  const url = publicPageUrl(m.slug)

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="member-top">
        <img src="/brand/elite-horizontal-light.png" alt="Elite Club" />
        <button className="btn ghost sm" onClick={logout}><Icon.logout width={14} /> Sair</button>
      </div>
      <div className="member-main stack" style={{ gap: 28 }}>
        <div className="card spread">
          <div className="row" style={{ gap: 18 }}>
            <Avatar member={m} size="lg" />
            <div className="stack" style={{ gap: 6 }}>
              <div className="eyebrow">Olá,</div>
              <h1>{m.displayName || m.name}</h1>
              <div className="row"><PaymentBadge status={m.paymentStatus} /><span className="badge neutral">{m.plan}</span></div>
            </div>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            {m.publicPage && (
              <>
                <Link className="btn gold sm" to={`/m/${m.slug}`} target="_blank"><Icon.external width={14} /> Ver minha página</Link>
                <button className="btn ghost sm" onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
                  <Icon.copy width={14} /> {copied ? 'Link copiado!' : 'Copiar link da página'}
                </button>
              </>
            )}
            <button className="btn ghost sm" onClick={() => setEditing(true)}><Icon.edit width={14} /> Editar minha página</button>
          </div>
        </div>

        {!status.ok && <div className="alert err">{status.reason} Fale com a equipe Elite Club para regularizar.</div>}

        <section>
          <div className="spread" style={{ marginBottom: 14 }}>
            <h2>Meus benefícios · {monthLabel(ym)}</h2>
            <span className="small muted">Saldos mensais, pessoais e não cumulativos.</span>
          </div>
          <BenefitBalance member={m} ym={ym} mode="member" onUse={(id) => setRequesting(id)} />
        </section>

        <div className="grid-2">
          <section className="card">
            <h3 style={{ marginBottom: 12 }}>Próximos Encontros Elite</h3>
            <div className="stack" style={{ gap: 12 }}>
              {meetings.length ? meetings.map((x) => {
                const d = new Date(x.date + 'T12:00')
                return (
                  <div key={x.id} className="row" style={{ flexWrap: 'nowrap' }}>
                    <div className="meeting-date">
                      <b>{String(d.getDate()).padStart(2, '0')}</b>
                      <span>{d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                    </div>
                    <div>
                      <b>{x.title}</b>
                      <div className="small muted">{formatDateLong(x.date)} · {x.start}–{x.end} · {x.location}</div>
                      <div className="small muted">{x.program.join(' · ')}</div>
                    </div>
                  </div>
                )
              }) : <p className="muted">Calendário em breve.</p>}
            </div>
          </section>
          <section className="card">
            <h3 style={{ marginBottom: 12 }}>Minhas solicitações e usos</h3>
            {mine.length ? (
              <table>
                <tbody>
                  {mine.map((u) => (
                    <tr key={u.id}>
                      <td>
                        {db.benefits.find((b) => b.id === u.benefitId)?.title}
                        {u.guest && <div className="small muted">Convidada: {u.guest.name}</div>}
                      </td>
                      <td className="small muted">{formatDate(u.date)}{u.startTime ? ` · ${u.startTime}` : ''}</td>
                      <td style={{ textAlign: 'right' }}><UsageBadge status={u.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="muted">Nenhum registro ainda.</p>}
          </section>
        </div>

        <section>
          <h2 style={{ marginBottom: 14 }}>Parceiros do clube</h2>
          <div className="grid">
            {partners.map((p) => (
              <div key={p.id} className="card stack" style={{ gap: 10 }}>
                <div className="row" style={{ flexWrap: 'nowrap' }}>
                  {p.logoUrl ? <img className="partner-logo" src={p.logoUrl} alt={p.name} /> : <span className="partner-logo">{initials(p.name)}</span>}
                  <div>
                    <b>{p.name}</b>
                    <div className="small muted">{p.category}</div>
                  </div>
                </div>
                <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
                  {db.benefits.filter((b) => b.partnerId === p.id && b.active).map((b) => <li key={b.id}>{b.title}</li>)}
                </ul>
                <div className="row">
                  {p.whatsapp && <a className="btn ghost sm" href={whatsappUrl(p.whatsapp, 'Olá! Sou associada do Elite Club.')} target="_blank" rel="noreferrer"><Icon.whatsapp width={14} /> WhatsApp</a>}
                  {p.website && <a className="btn ghost sm" href={socialUrl.website(p.website)} target="_blank" rel="noreferrer"><Icon.globe width={14} /> Site</a>}
                  {p.instagram && <a className="btn ghost sm" href={socialUrl.instagram(p.instagram)} target="_blank" rel="noreferrer"><Icon.instagram width={14} /> Instagram</a>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="card flat small muted">
          Descontos não são convertíveis em dinheiro nem necessariamente cumulativos com outras promoções. O almoço ou momento de
          convivência após os encontros é consumo individual de cada participante, salvo comunicação em contrário.
        </div>
        <div className="row small muted" style={{ justifyContent: 'center' }}>
          <img src="/brand/dialog-mark.png" alt="Dialog" style={{ width: 30, borderRadius: 6 }} /> Ecossistema Clube Dialog
        </div>
      </div>

      {requesting && <UsageForm mode="member" initial={{ memberId: m.id, benefitId: requesting }} onClose={() => setRequesting(null)} />}
      {editing && <ProfileEditor member={m} onClose={() => setEditing(false)} />}
    </div>
  )
}
