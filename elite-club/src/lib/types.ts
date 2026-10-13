export type PaymentStatus = 'adimplente' | 'inadimplente' | 'suspensa' | 'cancelada'

export interface Socials {
  instagram?: string
  linkedin?: string
  facebook?: string
  tiktok?: string
  youtube?: string
  website?: string
  portfolio?: string
}

export interface Address {
  cep?: string
  street?: string
  number?: string
  complement?: string
  district?: string
  city?: string
  state?: string
}

export interface Member {
  id: string
  slug: string
  /** Código de acesso para a área da associada (modo local). */
  accessCode: string
  name: string
  displayName?: string
  cpf?: string
  rg?: string
  birthDate?: string
  email: string
  phone?: string
  whatsapp?: string
  photoUrl?: string
  company?: string
  role?: string
  segment?: string
  cnpj?: string
  headline?: string
  bio?: string
  services?: string
  address: Address
  socials: Socials
  plan: string
  joinedAt: string
  contractEnd?: string
  paymentStatus: PaymentStatus
  dueDay?: number
  fiscalAddress: boolean
  publicPage: boolean
  /** Campos exibidos na página pública. */
  showOnPage: { email: boolean; phone: boolean; whatsapp: boolean; city: boolean }
  notes?: string
  createdAt: string
}

export type Ecosystem = 'dialog' | 'externo'

export interface Partner {
  id: string
  name: string
  logoUrl?: string
  category: string
  description?: string
  ecosystem: Ecosystem
  contactName?: string
  whatsapp?: string
  email?: string
  website?: string
  instagram?: string
  active: boolean
  createdAt: string
}

export type BenefitKind =
  | 'encontro'
  | 'convidada'
  | 'sala'
  | 'endereco_fiscal'
  | 'desconto'
  | 'experiencia'
  | 'comunidade'
  | 'campanha'

export type QuotaUnit = 'vezes' | 'horas'

export interface Benefit {
  id: string
  title: string
  description: string
  kind: BenefitKind
  partnerId?: string
  discountPct?: number
  /** Limite por mês. Vazio = sem limite (uso livre, apenas registrado). */
  monthlyQuota?: number
  unit: QuotaUnit
  requiresBooking: boolean
  /** Associada pode solicitar pela área dela (fica pendente até o admin aprovar). */
  memberCanRequest: boolean
  rules?: string
  contractRef?: string
  active: boolean
  createdAt: string
}

export type UsageStatus = 'pendente' | 'confirmado' | 'recusado' | 'cancelado'

export interface Usage {
  id: string
  memberId: string
  benefitId: string
  /** Data em que o benefício foi/será usado (YYYY-MM-DD). */
  date: string
  quantity: number
  status: UsageStatus
  note?: string
  meetingId?: string
  startTime?: string
  guest?: { name: string; phone?: string; email?: string; instagram?: string }
  origin: 'admin' | 'associada'
  createdAt: string
}

export interface Meeting {
  id: string
  date: string
  start: string
  end: string
  title: string
  location: string
  program: string[]
  description?: string
  createdAt: string
}

export interface DB {
  version: number
  members: Member[]
  partners: Partner[]
  benefits: Benefit[]
  usages: Usage[]
  meetings: Meeting[]
}
