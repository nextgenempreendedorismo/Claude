import type { Benefit, DB, Meeting, Member, Partner, Usage } from './types'
import { uid, toISODate } from './utils'

const now = () => new Date().toISOString()

/** Segunda terça-feira do mês (data padrão dos Encontros Elite na demonstração). */
function secondTuesday(year: number, month: number): Date {
  const d = new Date(year, month, 1)
  const offset = (2 - d.getDay() + 7) % 7
  return new Date(year, month, 1 + offset + 7)
}

export function buildSeed(): DB {
  const created = now()

  const partners: Partner[] = [
    {
      id: 'p-dialog',
      name: 'Dialog',
      logoUrl: '/brand/dialog-mark.png',
      category: 'Coworking & Endereço Fiscal',
      description: 'Ecossistema Dialog: salas, planos de horas e endereço fiscal.',
      ecosystem: 'dialog',
      active: true,
      createdAt: created,
    },
    {
      id: 'p-creative',
      name: 'Dialog Creative',
      logoUrl: '/brand/dialog-mark.png',
      category: 'Marketing & Criação',
      description: 'Serviços e produtos criativos do ecossistema Dialog.',
      ecosystem: 'dialog',
      active: true,
      createdAt: created,
    },
    {
      id: 'p-neuro',
      name: 'NeuroBusiness',
      logoUrl: '/brand/dialog-mark.png',
      category: 'Desenvolvimento & Negócios',
      description: 'Programas e serviços NeuroBusiness do ecossistema Dialog.',
      ecosystem: 'dialog',
      active: true,
      createdAt: created,
    },
    {
      id: 'p-advisor',
      name: 'Advisor Dialog',
      logoUrl: '/brand/dialog-mark.png',
      category: 'Mentoria & Advisory',
      description: 'Sessões de Advisor para estratégia de negócios.',
      ecosystem: 'dialog',
      active: true,
      createdAt: created,
    },
  ]

  const b = (x: Omit<Benefit, 'id' | 'createdAt' | 'active'> & { id: string }): Benefit => ({
    active: true,
    createdAt: created,
    ...x,
  })

  const benefits: Benefit[] = [
    b({
      id: 'b-encontro',
      title: 'Encontro Elite presencial',
      description: '01 encontro presencial por mês, das 10h às 12h, em data divulgada no calendário da comunidade.',
      kind: 'encontro',
      monthlyQuota: 1,
      unit: 'vezes',
      requiresBooking: false,
      memberCanRequest: false,
      contractRef: 'a',
    }),
    b({
      id: 'b-experiencias',
      title: 'Experiências com especialistas',
      description: 'Networking, Pocket Talks, Hot Seats, Pitch & Venda e Mesa de Oportunidades, conforme a programação de cada encontro.',
      kind: 'experiencia',
      unit: 'vezes',
      requiresBooking: false,
      memberCanRequest: false,
      contractRef: 'b',
    }),
    b({
      id: 'b-comunidade',
      title: 'Grupo estratégico e comunidade',
      description: 'Participação no grupo estratégico e na comunidade Elite Club.',
      kind: 'comunidade',
      unit: 'vezes',
      requiresBooking: false,
      memberCanRequest: false,
      contractRef: 'c',
    }),
    b({
      id: 'b-convidada',
      title: 'Convidada intencional',
      description: 'Levar 01 convidada por mês ao Encontro Elite, mediante cadastro prévio e disponibilidade.',
      kind: 'convidada',
      monthlyQuota: 1,
      unit: 'vezes',
      requiresBooking: true,
      memberCanRequest: true,
      rules: 'Prioridade para mulheres que ainda não participaram de nenhum encontro.',
      contractRef: 'd',
    }),
    b({
      id: 'b-campanhas',
      title: 'Indicações, brindes e Elite Cast',
      description: 'Ações de indicação, benefícios do mês, brindes e seleção para o Elite Cast, conforme regulamento de cada campanha.',
      kind: 'campanha',
      unit: 'vezes',
      requiresBooking: false,
      memberCanRequest: false,
      contractRef: 'e',
    }),
    b({
      id: 'b-sala',
      title: 'Sala no ecossistema Dialog',
      description: '02 horas mensais de utilização de sala, pessoais e não cumulativas, mediante reserva e disponibilidade.',
      kind: 'sala',
      partnerId: 'p-dialog',
      monthlyQuota: 2,
      unit: 'horas',
      requiresBooking: true,
      memberCanRequest: true,
      rules: 'Horas pessoais e não cumulativas: o saldo não usado no mês não passa para o próximo.',
      contractRef: 'f',
    }),
    b({
      id: 'b-endereco',
      title: 'Endereço fiscal',
      description: 'Benefício de endereço fiscal, observadas as exigências cadastrais e operacionais aplicáveis.',
      kind: 'endereco_fiscal',
      partnerId: 'p-dialog',
      unit: 'vezes',
      requiresBooking: false,
      memberCanRequest: true,
      contractRef: 'g',
    }),
    b({
      id: 'b-desc-dialog',
      title: 'Até 45% off em planos de horas Dialog',
      description: 'Desconto em planos elegíveis de horas da Dialog, conforme condições comerciais e disponibilidade.',
      kind: 'desconto',
      partnerId: 'p-dialog',
      discountPct: 45,
      unit: 'vezes',
      requiresBooking: false,
      memberCanRequest: true,
      rules: 'Descontos não são convertíveis em dinheiro nem necessariamente cumulativos com outras promoções.',
      contractRef: 'h',
    }),
    b({
      id: 'b-desc-creative',
      title: 'Até 50% off Dialog Creative',
      description: 'Desconto em serviços e produtos elegíveis da Dialog Creative.',
      kind: 'desconto',
      partnerId: 'p-creative',
      discountPct: 50,
      unit: 'vezes',
      requiresBooking: false,
      memberCanRequest: true,
      rules: 'Descontos não são convertíveis em dinheiro nem necessariamente cumulativos com outras promoções.',
      contractRef: 'h',
    }),
    b({
      id: 'b-desc-neuro',
      title: 'Até 50% off NeuroBusiness',
      description: 'Desconto em serviços e produtos elegíveis NeuroBusiness.',
      kind: 'desconto',
      partnerId: 'p-neuro',
      discountPct: 50,
      unit: 'vezes',
      requiresBooking: false,
      memberCanRequest: true,
      rules: 'Descontos não são convertíveis em dinheiro nem necessariamente cumulativos com outras promoções.',
      contractRef: 'h',
    }),
    b({
      id: 'b-desc-advisor',
      title: 'Até 50% off em sessões de Advisor',
      description: 'Desconto em sessões de Advisor, conforme condições comerciais e disponibilidade.',
      kind: 'desconto',
      partnerId: 'p-advisor',
      discountPct: 50,
      unit: 'vezes',
      requiresBooking: true,
      memberCanRequest: true,
      rules: 'Descontos não são convertíveis em dinheiro nem necessariamente cumulativos com outras promoções.',
      contractRef: 'h',
    }),
    b({
      id: 'b-clube-dialog',
      title: 'Ecossistema Clube Dialog',
      description: 'Participação nos demais benefícios e experiências do ecossistema Clube Dialog disponibilizados à categoria.',
      kind: 'experiencia',
      partnerId: 'p-dialog',
      unit: 'vezes',
      requiresBooking: false,
      memberCanRequest: false,
      contractRef: 'i',
    }),
  ]

  const today = new Date()
  const meetings: Meeting[] = []
  for (let i = -1; i <= 4; i++) {
    const d = secondTuesday(today.getFullYear(), today.getMonth() + i)
    meetings.push({
      id: uid(),
      date: toISODate(d),
      start: '10:00',
      end: '12:00',
      title: `Encontro Elite · ${d.toLocaleDateString('pt-BR', { month: 'long' })}`,
      location: 'Ecossistema Dialog',
      program: ['Networking', 'Pocket Talk', 'Hot Seat', 'Pitch & Venda', 'Mesa de Oportunidades'],
      createdAt: created,
    })
  }

  const members: Member[] = [
    {
      id: 'm-1',
      slug: 'ana-carolina-souza',
      accessCode: '482913',
      name: 'Ana Carolina Souza',
      displayName: 'Ana Souza',
      email: 'ana@exemplo.com.br',
      phone: '(11) 98888-7777',
      whatsapp: '(11) 98888-7777',
      company: 'Souza Arquitetura',
      role: 'Fundadora & Arquiteta',
      segment: 'Arquitetura e Interiores',
      headline: 'Projetos residenciais e corporativos com alma.',
      bio: 'Arquiteta há 12 anos, apaixonada por transformar espaços em experiências. Atendo projetos residenciais de alto padrão e escritórios.',
      services: 'Projetos residenciais\nInteriores corporativos\nConsultoria de reforma',
      address: { city: 'São Paulo', state: 'SP' },
      socials: {
        instagram: '@souza.arquitetura',
        linkedin: 'https://www.linkedin.com/in/anasouza',
        website: 'https://www.souzaarquitetura.com.br',
      },
      plan: 'Elite',
      joinedAt: toISODate(new Date(today.getFullYear(), today.getMonth() - 3, 5)),
      paymentStatus: 'adimplente',
      dueDay: 5,
      fiscalAddress: false,
      publicPage: true,
      showOnPage: { email: true, phone: true, whatsapp: true, city: true },
      createdAt: created,
    },
    {
      id: 'm-2',
      slug: 'beatriz-lima',
      accessCode: '135790',
      name: 'Beatriz Lima',
      email: 'beatriz@exemplo.com.br',
      whatsapp: '(11) 97777-6666',
      company: 'BL Finanças',
      role: 'Planejadora Financeira CFP®',
      segment: 'Finanças',
      headline: 'Clareza financeira para mulheres empreendedoras.',
      bio: 'Ajudo empreendedoras a organizar as finanças do negócio e da vida pessoal.',
      address: { city: 'São Paulo', state: 'SP' },
      socials: { instagram: '@bl.financas', linkedin: 'https://www.linkedin.com/in/beatrizlima' },
      plan: 'Elite',
      joinedAt: toISODate(new Date(today.getFullYear(), today.getMonth() - 1, 12)),
      paymentStatus: 'inadimplente',
      dueDay: 10,
      fiscalAddress: true,
      publicPage: true,
      showOnPage: { email: true, phone: false, whatsapp: true, city: true },
      createdAt: created,
    },
  ]

  const thisMonth = meetings.find((m) => m.date.slice(0, 7) === toISODate(today).slice(0, 7))
  const usages: Usage[] = thisMonth
    ? [
        {
          id: uid(),
          memberId: 'm-1',
          benefitId: 'b-sala',
          date: toISODate(today),
          startTime: '14:00',
          quantity: 1,
          status: 'confirmado',
          origin: 'associada',
          createdAt: created,
        },
        {
          id: uid(),
          memberId: 'm-1',
          benefitId: 'b-convidada',
          date: thisMonth.date,
          meetingId: thisMonth.id,
          quantity: 1,
          status: 'pendente',
          guest: { name: 'Juliana Prado', phone: '(11) 96666-5555', instagram: '@juprado' },
          origin: 'associada',
          createdAt: created,
        },
      ]
    : []

  return { version: 1, members, partners, benefits, usages, meetings }
}
