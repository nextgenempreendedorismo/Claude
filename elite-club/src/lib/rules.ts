import type { Benefit, DB, Member, Usage } from './types'
import { todayISO } from './utils'

const COUNTED: Usage['status'][] = ['pendente', 'confirmado']

/** Quantidade já usada (ou reservada) de um benefício no mês "YYYY-MM". */
export function usedInMonth(db: DB, memberId: string, benefitId: string, ym: string, excludeId?: string): number {
  return db.usages
    .filter(
      (u) =>
        u.memberId === memberId &&
        u.benefitId === benefitId &&
        u.id !== excludeId &&
        u.date.startsWith(ym) &&
        COUNTED.includes(u.status),
    )
    .reduce((s, u) => s + u.quantity, 0)
}

export function remaining(db: DB, memberId: string, benefit: Benefit, ym: string): number | null {
  if (!benefit.monthlyQuota) return null
  return Math.max(0, benefit.monthlyQuota - usedInMonth(db, memberId, benefit.id, ym))
}

export function memberIsActive(m: Member): { ok: boolean; reason?: string } {
  if (m.paymentStatus !== 'adimplente') {
    return { ok: false, reason: `Associada ${m.paymentStatus}: benefícios disponíveis apenas enquanto adimplente.` }
  }
  if (m.contractEnd && m.contractEnd < todayISO()) {
    return { ok: false, reason: 'Contrato com vigência encerrada.' }
  }
  return { ok: true }
}

export interface Check {
  ok: boolean
  errors: string[]
  warnings: string[]
}

/** Valida um uso de benefício conforme as regras do contrato. */
export function checkUsage(db: DB, usage: Omit<Usage, 'id' | 'createdAt'> & { id?: string }): Check {
  const errors: string[] = []
  const warnings: string[] = []
  const member = db.members.find((m) => m.id === usage.memberId)
  const benefit = db.benefits.find((b) => b.id === usage.benefitId)
  if (!member) errors.push('Selecione a associada.')
  if (!benefit) errors.push('Selecione o benefício.')
  if (!member || !benefit) return { ok: false, errors, warnings }

  const active = memberIsActive(member)
  if (!active.ok) errors.push(active.reason!)
  if (!benefit.active) errors.push('Benefício inativo.')
  if (!(usage.quantity > 0)) errors.push('Quantidade deve ser maior que zero.')

  if (benefit.monthlyQuota && COUNTED.includes(usage.status)) {
    const ym = usage.date.slice(0, 7)
    const used = usedInMonth(db, member.id, benefit.id, ym, usage.id)
    if (used + usage.quantity > benefit.monthlyQuota) {
      const left = Math.max(0, benefit.monthlyQuota - used)
      errors.push(
        `Limite mensal atingido: ${benefit.monthlyQuota} ${benefit.unit}/mês, saldo de ${left} ${benefit.unit} neste mês (não cumulativo).`,
      )
    }
  }

  if (benefit.kind === 'convidada') {
    if (!usage.guest?.name?.trim()) errors.push('Informe o nome da convidada (cadastro prévio obrigatório).')
    if (!usage.meetingId) errors.push('Selecione o encontro em que a convidada irá participar.')
    if (usage.guest) {
      const norm = (s?: string) => (s ?? '').replace(/\D/g, '') || undefined
      const phone = norm(usage.guest.phone)
      const email = usage.guest.email?.trim().toLowerCase() || undefined
      const name = usage.guest.name.trim().toLowerCase()
      const already = db.usages.some(
        (u) =>
          u.id !== usage.id &&
          u.guest &&
          u.status === 'confirmado' &&
          ((phone && norm(u.guest.phone) === phone) ||
            (email && u.guest.email?.trim().toLowerCase() === email) ||
            u.guest.name.trim().toLowerCase() === name),
      )
      if (already) {
        warnings.push('Esta convidada já participou de um encontro. A prioridade é para mulheres que ainda não participaram.')
      }
      const isMember = db.members.some(
        (m) => (email && m.email.toLowerCase() === email) || (phone && norm(m.whatsapp) === phone),
      )
      if (isMember) warnings.push('A convidada já está cadastrada como associada.')
    }
  }

  if (benefit.kind === 'sala' && !usage.startTime) warnings.push('Informe o horário da reserva da sala.')
  if (benefit.kind === 'endereco_fiscal' && !member.cnpj) {
    warnings.push('Associada sem CNPJ cadastrado: confira as exigências cadastrais do endereço fiscal.')
  }

  return { ok: errors.length === 0, errors, warnings }
}
