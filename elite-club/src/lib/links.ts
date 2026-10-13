import type { Member } from './types'

const digits = (s?: string) => (s ?? '').replace(/\D/g, '')

/** Telefone brasileiro → formato internacional sem símbolos (55DDXXXXXXXXX). */
export function intlPhone(s?: string): string {
  const d = digits(s)
  if (!d) return ''
  return d.startsWith('55') && d.length > 11 ? d : `55${d}`
}

export const whatsappUrl = (s?: string, text?: string) =>
  `https://wa.me/${intlPhone(s)}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export const telUrl = (s?: string) => `tel:+${intlPhone(s)}`

function handle(v: string) {
  return v.trim().replace(/^@/, '')
}

function asUrl(v: string, base: string): string {
  const t = v.trim()
  if (/^https?:\/\//i.test(t)) return t
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(t) && t.includes('/')) return `https://${t}`
  return base + handle(t)
}

export const socialUrl = {
  instagram: (v: string) => asUrl(v, 'https://instagram.com/'),
  linkedin: (v: string) => asUrl(v, 'https://www.linkedin.com/in/'),
  facebook: (v: string) => asUrl(v, 'https://facebook.com/'),
  tiktok: (v: string) => asUrl(v, 'https://www.tiktok.com/@'),
  youtube: (v: string) => asUrl(v, 'https://www.youtube.com/@'),
  website: (v: string) => (/^https?:\/\//i.test(v.trim()) ? v.trim() : `https://${v.trim()}`),
  portfolio: (v: string) => (/^https?:\/\//i.test(v.trim()) ? v.trim() : `https://${v.trim()}`),
}

export function publicPageUrl(slug: string): string {
  return `${window.location.origin}/m/${slug}`
}

/** Cartão de contato (vCard 3.0) para salvar na agenda do celular. */
export function buildVCard(m: Member): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${m.displayName || m.name}`,
    `N:${m.name.split(' ').slice(1).join(' ')};${m.name.split(' ')[0]};;;`,
  ]
  if (m.company) lines.push(`ORG:${m.company}`)
  if (m.role) lines.push(`TITLE:${m.role}`)
  if (m.showOnPage.phone && m.phone) lines.push(`TEL;TYPE=CELL:+${intlPhone(m.phone)}`)
  if (m.showOnPage.whatsapp && m.whatsapp && m.whatsapp !== m.phone) lines.push(`TEL;TYPE=CELL:+${intlPhone(m.whatsapp)}`)
  if (m.showOnPage.email && m.email) lines.push(`EMAIL:${m.email}`)
  if (m.socials.website) lines.push(`URL:${socialUrl.website(m.socials.website)}`)
  lines.push(`URL;TYPE=Elite Club:${publicPageUrl(m.slug)}`)
  lines.push('END:VCARD')
  return lines.join('\r\n')
}
