import { useEffect, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../../components/Icons'
import { QRImage } from '../../components/QR'
import { Avatar } from '../../components/ui'
import { buildVCard, publicPageUrl, socialUrl, telUrl, whatsappUrl } from '../../lib/links'
import { useDB } from '../../lib/store'
import type { Socials } from '../../lib/types'
import { downloadFile } from '../../lib/utils'

const SOCIALS: { key: keyof Socials; label: string; icon: (p: object) => ReactNode }[] = [
  { key: 'instagram', label: 'Instagram', icon: Icon.instagram },
  { key: 'linkedin', label: 'LinkedIn', icon: Icon.linkedin },
  { key: 'website', label: 'Site', icon: Icon.globe },
  { key: 'portfolio', label: 'Portfólio', icon: Icon.briefcase },
  { key: 'facebook', label: 'Facebook', icon: Icon.facebook },
  { key: 'tiktok', label: 'TikTok', icon: Icon.tiktok },
  { key: 'youtube', label: 'YouTube', icon: Icon.youtube },
]

export default function PublicProfile() {
  const { slug } = useParams()
  const db = useDB()
  const m = db.members.find((x) => x.slug === slug)
  const visible = m && m.publicPage && m.paymentStatus !== 'cancelada'

  useEffect(() => {
    document.title = visible ? `${m.displayName || m.name} · Elite Club` : 'Elite Club'
    return () => {
      document.title = 'Elite Club'
    }
  }, [m, visible])

  if (!visible) {
    return (
      <div className="public">
        <div className="wrap" style={{ textAlign: 'center', paddingTop: 60 }}>
          <img src="/brand/elite-vertical.png" alt="Elite Club" style={{ width: 180, margin: '0 auto' }} />
          <h1 style={{ marginTop: 20 }}>Página não encontrada</h1>
          <p style={{ color: '#d9cfbf' }}>Esta página não existe ou não está disponível no momento.</p>
        </div>
      </div>
    )
  }

  const name = m.displayName || m.name
  const url = publicPageUrl(m.slug)
  const greeting = `Olá, ${name.split(' ')[0]}! Vi sua página no Elite Club.`
  const services = (m.services ?? '').split('\n').map((s) => s.trim()).filter(Boolean)

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} · Elite Club`, url })
      } catch {
        /* cancelado */
      }
    } else {
      await navigator.clipboard?.writeText(url)
      alert('Link copiado!')
    }
  }

  return (
    <div className="public">
      <div className="wrap">
        <div className="top">
          <img src="/brand/elite-mark.png" alt="Elite Club" />
        </div>

        <div className="profile">
          <Avatar member={m} size="lg" />
          <span className="member-tag"><Icon.star width={10} height={10} /> Associada Elite Club</span>
          <h1>{name}</h1>
          {(m.role || m.company) && <div className="role">{[m.role, m.company].filter(Boolean).join(' · ')}</div>}
          {m.headline && <p className="headline">“{m.headline}”</p>}
          {m.showOnPage.city && m.address.city && (
            <div className="small" style={{ color: '#a89c8a' }}>
              <Icon.pin width={12} height={12} /> {m.address.city}{m.address.state ? ` · ${m.address.state}` : ''}
            </div>
          )}
        </div>

        <div className="quick">
          {m.showOnPage.whatsapp && m.whatsapp && (
            <a href={whatsappUrl(m.whatsapp, greeting)} target="_blank" rel="noreferrer"><Icon.whatsapp /> WhatsApp</a>
          )}
          {m.showOnPage.phone && m.phone && <a href={telUrl(m.phone)}><Icon.phone /> Ligar</a>}
          {m.showOnPage.email && m.email && <a href={`mailto:${m.email}`}><Icon.mail /> E-mail</a>}
          <button onClick={() => downloadFile(`${m.slug}.vcf`, buildVCard(m), 'text/vcard')}><Icon.contact /> Salvar contato</button>
          <button onClick={share}><Icon.share /> Compartilhar</button>
        </div>

        <div className="links">
          {SOCIALS.filter((s) => m.socials[s.key]?.trim()).map((s) => (
            <a key={s.key} className="link" href={socialUrl[s.key](m.socials[s.key]!)} target="_blank" rel="noreferrer">
              {s.icon({})}
              {s.label}
              <span className="sub">{m.socials[s.key]!.replace(/^https?:\/\/(www\.)?/, '')}</span>
            </a>
          ))}
        </div>

        {m.bio && (
          <div className="block">
            <h2>Sobre</h2>
            <p>{m.bio}</p>
          </div>
        )}

        {services.length > 0 && (
          <div className="block">
            <h2>Serviços</h2>
            <ul className="services">{services.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        )}

        {m.segment && (
          <div className="block" style={{ textAlign: 'center' }}>
            <div className="eyebrow" style={{ color: 'var(--gold)' }}>Segmento</div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 22, marginTop: 4 }}>{m.segment}</p>
          </div>
        )}

        <div className="block qr">
          <QRImage text={url} size={170} />
          <span className="small" style={{ color: '#a89c8a' }}>Aponte a câmera para abrir esta página</span>
        </div>

        <footer>
          <Link to="/login" style={{ display: 'block' }}>
            <img src="/brand/elite-horizontal-light.png" alt="Elite Club" style={{ height: 44 }} />
          </Link>
          <div className="eco">
            <img src="/brand/dialog-mark.png" alt="Dialog" />
            <span>Ecossistema Clube Dialog</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
