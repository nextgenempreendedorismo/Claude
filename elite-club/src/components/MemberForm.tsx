import { useState } from 'react'
import { getDB, upsert } from '../lib/store'
import type { Member, PaymentStatus } from '../lib/types'
import { randomCode, slugify, todayISO, uid } from '../lib/utils'
import { Field, Modal } from './ui'

export function emptyMember(): Member {
  return {
    id: uid(),
    slug: '',
    accessCode: randomCode(),
    name: '',
    email: '',
    address: {},
    socials: {},
    plan: 'Elite',
    joinedAt: todayISO(),
    paymentStatus: 'adimplente',
    fiscalAddress: false,
    publicPage: true,
    showOnPage: { email: true, phone: false, whatsapp: true, city: true },
    createdAt: new Date().toISOString(),
  }
}

/** Redimensiona a foto enviada para no máx. 480px e devolve como data URL. */
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const max = 480
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

export default function MemberForm({ initial, onClose }: { initial?: Member; onClose: (saved?: Member) => void }) {
  const [m, setM] = useState<Member>(initial ?? emptyMember())
  const [error, setError] = useState('')
  const set = <K extends keyof Member>(k: K, v: Member[K]) => setM((x) => ({ ...x, [k]: v }))
  const setAddr = (k: keyof Member['address'], v: string) => setM((x) => ({ ...x, address: { ...x.address, [k]: v } }))
  const setSocial = (k: keyof Member['socials'], v: string) => setM((x) => ({ ...x, socials: { ...x.socials, [k]: v } }))
  const setShow = (k: keyof Member['showOnPage'], v: boolean) => setM((x) => ({ ...x, showOnPage: { ...x.showOnPage, [k]: v } }))

  async function onPhoto(file?: File) {
    if (!file) return
    try {
      set('photoUrl', await resizeImage(file))
    } catch {
      setError('Não foi possível carregar a imagem.')
    }
  }

  function save() {
    setError('')
    if (!m.name.trim()) return setError('Informe o nome completo.')
    if (!m.email.trim()) return setError('Informe o e-mail.')
    const slug = slugify(m.slug || m.displayName || m.name)
    const db = getDB()
    if (db.members.some((x) => x.id !== m.id && x.slug === slug)) {
      return setError(`O endereço da página "/m/${slug}" já está em uso. Escolha outro.`)
    }
    if (db.members.some((x) => x.id !== m.id && x.email.toLowerCase() === m.email.trim().toLowerCase())) {
      return setError('Já existe uma associada com este e-mail.')
    }
    const saved = { ...m, slug, email: m.email.trim() }
    upsert('members', saved)
    onClose(saved)
  }

  return (
    <Modal
      title={initial ? 'Editar associada' : 'Nova associada'}
      onClose={() => onClose()}
      footer={
        <>
          {error && <div className="alert err" style={{ marginRight: 'auto' }}>{error}</div>}
          <button className="btn ghost" onClick={() => onClose()}>Cancelar</button>
          <button className="btn gold" onClick={save}>Salvar</button>
        </>
      }
    >
      <div className="section-title" style={{ marginTop: 0 }}>Dados pessoais</div>
      <div className="grid-2">
        <Field label="Nome completo *"><input value={m.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Nome de exibição"><input value={m.displayName ?? ''} onChange={(e) => set('displayName', e.target.value)} placeholder="Como aparece na página" /></Field>
        <Field label="CPF"><input value={m.cpf ?? ''} onChange={(e) => set('cpf', e.target.value)} /></Field>
        <Field label="RG"><input value={m.rg ?? ''} onChange={(e) => set('rg', e.target.value)} /></Field>
        <Field label="Data de nascimento"><input type="date" value={m.birthDate ?? ''} onChange={(e) => set('birthDate', e.target.value)} /></Field>
        <Field label="Foto">
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            {m.photoUrl && <img src={m.photoUrl} alt="" className="avatar" />}
            <input type="file" accept="image/*" onChange={(e) => onPhoto(e.target.files?.[0])} />
            {m.photoUrl && <button type="button" className="btn ghost sm" onClick={() => set('photoUrl', undefined)}>Remover</button>}
          </div>
        </Field>
      </div>

      <div className="section-title">Contato</div>
      <div className="grid-2">
        <Field label="E-mail *"><input type="email" value={m.email} onChange={(e) => set('email', e.target.value)} /></Field>
        <Field label="WhatsApp"><input value={m.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value)} placeholder="(11) 90000-0000" /></Field>
        <Field label="Telefone"><input value={m.phone ?? ''} onChange={(e) => set('phone', e.target.value)} /></Field>
      </div>

      <div className="section-title">Profissional</div>
      <div className="grid-2">
        <Field label="Empresa"><input value={m.company ?? ''} onChange={(e) => set('company', e.target.value)} /></Field>
        <Field label="Cargo / atuação"><input value={m.role ?? ''} onChange={(e) => set('role', e.target.value)} /></Field>
        <Field label="Segmento"><input value={m.segment ?? ''} onChange={(e) => set('segment', e.target.value)} /></Field>
        <Field label="CNPJ"><input value={m.cnpj ?? ''} onChange={(e) => set('cnpj', e.target.value)} /></Field>
        <Field label="Frase de destaque" span><input value={m.headline ?? ''} onChange={(e) => set('headline', e.target.value)} placeholder="Uma frase que resume o seu trabalho" /></Field>
        <Field label="Sobre (bio)" span><textarea value={m.bio ?? ''} onChange={(e) => set('bio', e.target.value)} /></Field>
        <Field label="Serviços (um por linha)" span><textarea value={m.services ?? ''} onChange={(e) => set('services', e.target.value)} /></Field>
      </div>

      <div className="section-title">Endereço</div>
      <div className="grid-3">
        <Field label="CEP"><input value={m.address.cep ?? ''} onChange={(e) => setAddr('cep', e.target.value)} /></Field>
        <Field label="Rua"><input value={m.address.street ?? ''} onChange={(e) => setAddr('street', e.target.value)} /></Field>
        <Field label="Número"><input value={m.address.number ?? ''} onChange={(e) => setAddr('number', e.target.value)} /></Field>
        <Field label="Complemento"><input value={m.address.complement ?? ''} onChange={(e) => setAddr('complement', e.target.value)} /></Field>
        <Field label="Bairro"><input value={m.address.district ?? ''} onChange={(e) => setAddr('district', e.target.value)} /></Field>
        <Field label="Cidade"><input value={m.address.city ?? ''} onChange={(e) => setAddr('city', e.target.value)} /></Field>
        <Field label="UF"><input maxLength={2} value={m.address.state ?? ''} onChange={(e) => setAddr('state', e.target.value.toUpperCase())} /></Field>
      </div>

      <div className="section-title">Redes sociais e links</div>
      <div className="grid-2">
        <Field label="Instagram"><input value={m.socials.instagram ?? ''} onChange={(e) => setSocial('instagram', e.target.value)} placeholder="@usuario" /></Field>
        <Field label="LinkedIn"><input value={m.socials.linkedin ?? ''} onChange={(e) => setSocial('linkedin', e.target.value)} placeholder="usuario ou link" /></Field>
        <Field label="Facebook"><input value={m.socials.facebook ?? ''} onChange={(e) => setSocial('facebook', e.target.value)} /></Field>
        <Field label="TikTok"><input value={m.socials.tiktok ?? ''} onChange={(e) => setSocial('tiktok', e.target.value)} placeholder="@usuario" /></Field>
        <Field label="YouTube"><input value={m.socials.youtube ?? ''} onChange={(e) => setSocial('youtube', e.target.value)} placeholder="@canal" /></Field>
        <Field label="Site"><input value={m.socials.website ?? ''} onChange={(e) => setSocial('website', e.target.value)} placeholder="www.seusite.com.br" /></Field>
        <Field label="Portfólio / catálogo"><input value={m.socials.portfolio ?? ''} onChange={(e) => setSocial('portfolio', e.target.value)} /></Field>
      </div>

      <div className="section-title">Página exclusiva</div>
      <div className="grid-2">
        <Field label="Endereço da página">
          <input value={m.slug} onChange={(e) => set('slug', e.target.value)} placeholder={slugify(m.displayName || m.name) || 'nome-da-associada'} />
        </Field>
        <div className="stack" style={{ gap: 8, alignContent: 'end' }}>
          <label className="check"><input type="checkbox" checked={m.publicPage} onChange={(e) => set('publicPage', e.target.checked)} /> Página pública ativa</label>
        </div>
        <div className="row" style={{ gridColumn: '1 / -1' }}>
          <span className="small muted">Exibir na página:</span>
          <label className="check"><input type="checkbox" checked={m.showOnPage.whatsapp} onChange={(e) => setShow('whatsapp', e.target.checked)} /> WhatsApp</label>
          <label className="check"><input type="checkbox" checked={m.showOnPage.phone} onChange={(e) => setShow('phone', e.target.checked)} /> Telefone</label>
          <label className="check"><input type="checkbox" checked={m.showOnPage.email} onChange={(e) => setShow('email', e.target.checked)} /> E-mail</label>
          <label className="check"><input type="checkbox" checked={m.showOnPage.city} onChange={(e) => setShow('city', e.target.checked)} /> Cidade</label>
        </div>
      </div>

      <div className="section-title">Associação</div>
      <div className="grid-3">
        <Field label="Plano / categoria"><input value={m.plan} onChange={(e) => set('plan', e.target.value)} /></Field>
        <Field label="Início da vigência"><input type="date" value={m.joinedAt} onChange={(e) => set('joinedAt', e.target.value)} /></Field>
        <Field label="Fim da vigência"><input type="date" value={m.contractEnd ?? ''} onChange={(e) => set('contractEnd', e.target.value || undefined)} /></Field>
        <Field label="Situação financeira">
          <select value={m.paymentStatus} onChange={(e) => set('paymentStatus', e.target.value as PaymentStatus)}>
            <option value="adimplente">Adimplente</option>
            <option value="inadimplente">Inadimplente</option>
            <option value="suspensa">Suspensa</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </Field>
        <Field label="Dia de vencimento"><input type="number" min={1} max={31} value={m.dueDay ?? ''} onChange={(e) => set('dueDay', e.target.value ? Number(e.target.value) : undefined)} /></Field>
        <Field label="Código de acesso">
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <input value={m.accessCode} onChange={(e) => set('accessCode', e.target.value)} />
            <button type="button" className="btn ghost sm" onClick={() => set('accessCode', randomCode())}>Gerar</button>
          </div>
        </Field>
        <label className="check" style={{ gridColumn: '1 / -1' }}>
          <input type="checkbox" checked={m.fiscalAddress} onChange={(e) => set('fiscalAddress', e.target.checked)} /> Utiliza endereço fiscal Dialog
        </label>
        <Field label="Observações internas" span><textarea value={m.notes ?? ''} onChange={(e) => set('notes', e.target.value)} /></Field>
      </div>
    </Modal>
  )
}
