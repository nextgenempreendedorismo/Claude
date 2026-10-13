import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import BenefitBalance from '../../components/BenefitBalance'
import { Icon } from '../../components/Icons'
import MemberForm from '../../components/MemberForm'
import { useQR } from '../../components/QR'
import UsageForm from '../../components/UsageForm'
import UsageTable from '../../components/UsageTable'
import { Avatar, PaymentBadge } from '../../components/ui'
import { publicPageUrl } from '../../lib/links'
import { memberIsActive } from '../../lib/rules'
import { remove, useDB } from '../../lib/store'
import { currentMonth, formatDate, monthLabel, shiftMonth } from '../../lib/utils'

export default function MemberDetail() {
  const { id } = useParams()
  const db = useDB()
  const nav = useNavigate()
  const [tab, setTab] = useState<'beneficios' | 'historico' | 'dados'>('beneficios')
  const [ym, setYm] = useState(currentMonth())
  const [editing, setEditing] = useState(false)
  const [registering, setRegistering] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const m = db.members.find((x) => x.id === id)
  const qr = useQR(m ? publicPageUrl(m.slug) : '')
  if (!m) return <Navigate to="/admin/associadas" replace />

  const url = publicPageUrl(m.slug)
  const status = memberIsActive(m)
  const history = db.usages.filter((u) => u.memberId === m.id).sort((a, b) => b.date.localeCompare(a.date))

  function copy() {
    navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function del() {
    if (!m) return
    if (confirm(`Excluir ${m.name}? Todo o histórico de benefícios dela também será removido.`)) {
      remove('members', m.id)
      nav('/admin/associadas')
    }
  }

  const info: [string, string | undefined][] = [
    ['Nome completo', m.name],
    ['Nome de exibição', m.displayName],
    ['CPF', m.cpf],
    ['RG', m.rg],
    ['Nascimento', m.birthDate && formatDate(m.birthDate)],
    ['E-mail', m.email],
    ['WhatsApp', m.whatsapp],
    ['Telefone', m.phone],
    ['Empresa', m.company],
    ['Cargo', m.role],
    ['Segmento', m.segment],
    ['CNPJ', m.cnpj],
    ['Endereço', [m.address.street, m.address.number, m.address.complement, m.address.district, m.address.city, m.address.state, m.address.cep].filter(Boolean).join(', ')],
    ['Instagram', m.socials.instagram],
    ['LinkedIn', m.socials.linkedin],
    ['Facebook', m.socials.facebook],
    ['TikTok', m.socials.tiktok],
    ['YouTube', m.socials.youtube],
    ['Site', m.socials.website],
    ['Portfólio', m.socials.portfolio],
    ['Plano', m.plan],
    ['Vigência', `${formatDate(m.joinedAt)} até ${m.contractEnd ? formatDate(m.contractEnd) : 'indeterminado'}`],
    ['Vencimento', m.dueDay ? `Dia ${m.dueDay}` : undefined],
    ['Endereço fiscal Dialog', m.fiscalAddress ? 'Sim' : 'Não'],
    ['Código de acesso', m.accessCode],
    ['Observações', m.notes],
  ]

  return (
    <>
      <Link to="/admin/associadas" className="small">← Associadas</Link>
      <div className="card" style={{ margin: '12px 0 20px' }}>
        <div className="spread" style={{ alignItems: 'flex-start' }}>
          <div className="row" style={{ alignItems: 'flex-start', gap: 20 }}>
            <Avatar member={m} size="lg" />
            <div className="stack" style={{ gap: 6 }}>
              <h1>{m.displayName || m.name}</h1>
              <div className="muted">{[m.role, m.company].filter(Boolean).join(' · ')}</div>
              <div className="row">
                <PaymentBadge status={m.paymentStatus} />
                <span className="badge neutral">{m.plan}</span>
                {m.fiscalAddress && <span className="badge dialog">Endereço fiscal</span>}
              </div>
              {!status.ok && <div className="alert err small">{status.reason}</div>}
            </div>
          </div>
          <div className="row" style={{ alignItems: 'flex-start' }}>
            {qr && m.publicPage && (
              <a href={qr} download={`qr-${m.slug}.png`} title="Baixar QR Code da página">
                <img src={qr} alt="QR Code" width={92} height={92} style={{ border: '1px solid var(--line)', borderRadius: 10 }} />
              </a>
            )}
            <div className="stack" style={{ gap: 8 }}>
              <button className="btn gold sm" onClick={() => setEditing(true)}><Icon.edit width={14} /> Editar cadastro</button>
              {m.publicPage ? (
                <>
                  <Link className="btn ghost sm" to={`/m/${m.slug}`} target="_blank"><Icon.external width={14} /> Abrir página</Link>
                  <button className="btn ghost sm" onClick={copy}><Icon.copy width={14} /> {copied ? 'Copiado!' : 'Copiar link'}</button>
                </>
              ) : (
                <span className="small muted">Página pública desativada</span>
              )}
              <button className="btn danger sm" onClick={del}><Icon.trash width={14} /> Excluir</button>
            </div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === 'beneficios' ? 'active' : ''} onClick={() => setTab('beneficios')}>Benefícios do mês</button>
        <button className={tab === 'historico' ? 'active' : ''} onClick={() => setTab('historico')}>Histórico ({history.length})</button>
        <button className={tab === 'dados' ? 'active' : ''} onClick={() => setTab('dados')}>Dados cadastrais</button>
      </div>

      {tab === 'beneficios' && (
        <>
          <div className="row" style={{ marginBottom: 16 }}>
            <button className="btn ghost sm" onClick={() => setYm(shiftMonth(ym, -1))}>‹</button>
            <b style={{ minWidth: 150, textAlign: 'center' }}>{monthLabel(ym)}</b>
            <button className="btn ghost sm" onClick={() => setYm(shiftMonth(ym, 1))}>›</button>
            <span className="small muted">Saldos mensais não são cumulativos.</span>
          </div>
          <BenefitBalance member={m} ym={ym} onUse={(benefitId) => setRegistering(benefitId)} />
        </>
      )}
      {tab === 'historico' && <UsageTable usages={history} showMember={false} />}
      {tab === 'dados' && (
        <div className="card">
          <div className="grid-2">
            {info.filter(([, v]) => v).map(([k, v]) => (
              <div key={k}>
                <div className="small muted">{k}</div>
                <div style={{ whiteSpace: 'pre-line' }}>{v}</div>
              </div>
            ))}
          </div>
          {m.bio && (
            <>
              <div className="section-title">Bio</div>
              <p style={{ whiteSpace: 'pre-line' }}>{m.bio}</p>
            </>
          )}
        </div>
      )}

      {editing && <MemberForm initial={m} onClose={() => setEditing(false)} />}
      {registering && (
        <UsageForm mode="admin" initial={{ memberId: m.id, benefitId: registering }} onClose={() => setRegistering(null)} />
      )}
    </>
  )
}
