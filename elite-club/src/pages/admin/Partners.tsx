import { useState } from 'react'
import { Icon } from '../../components/Icons'
import { Field, Modal, PageHead } from '../../components/ui'
import { socialUrl, whatsappUrl } from '../../lib/links'
import { remove, upsert, useDB } from '../../lib/store'
import type { Ecosystem, Partner } from '../../lib/types'
import { initials, uid } from '../../lib/utils'

function PartnerForm({ initial, onClose }: { initial?: Partner; onClose: () => void }) {
  const [p, setP] = useState<Partner>(
    initial ?? { id: uid(), name: '', category: '', ecosystem: 'externo', active: true, createdAt: new Date().toISOString() },
  )
  const set = <K extends keyof Partner>(k: K, v: Partner[K]) => setP((x) => ({ ...x, [k]: v }))
  return (
    <Modal
      title={initial ? 'Editar parceiro' : 'Novo parceiro'}
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn gold" disabled={!p.name.trim()} onClick={() => { upsert('partners', p); onClose() }}>Salvar</button>
        </>
      }
    >
      <div className="grid-2">
        <Field label="Nome *"><input value={p.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Categoria"><input value={p.category} onChange={(e) => set('category', e.target.value)} placeholder="ex.: Beleza, Saúde, Marketing" /></Field>
        <Field label="Ecossistema">
          <select value={p.ecosystem} onChange={(e) => set('ecosystem', e.target.value as Ecosystem)}>
            <option value="externo">Parceiro externo</option>
            <option value="dialog">Ecossistema Dialog</option>
          </select>
        </Field>
        <Field label="URL do logo"><input value={p.logoUrl ?? ''} onChange={(e) => set('logoUrl', e.target.value)} placeholder="https://…" /></Field>
        <Field label="Descrição" span><textarea value={p.description ?? ''} onChange={(e) => set('description', e.target.value)} /></Field>
        <Field label="Responsável"><input value={p.contactName ?? ''} onChange={(e) => set('contactName', e.target.value)} /></Field>
        <Field label="WhatsApp"><input value={p.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value)} /></Field>
        <Field label="E-mail"><input value={p.email ?? ''} onChange={(e) => set('email', e.target.value)} /></Field>
        <Field label="Site"><input value={p.website ?? ''} onChange={(e) => set('website', e.target.value)} /></Field>
        <Field label="Instagram"><input value={p.instagram ?? ''} onChange={(e) => set('instagram', e.target.value)} /></Field>
        <label className="check" style={{ alignSelf: 'end' }}><input type="checkbox" checked={p.active} onChange={(e) => set('active', e.target.checked)} /> Parceria ativa</label>
      </div>
    </Modal>
  )
}

export default function Partners() {
  const db = useDB()
  const [editing, setEditing] = useState<Partner | 'new' | null>(null)

  return (
    <>
      <PageHead
        title="Parceiros"
        subtitle="Empresas parceiras do clube e os benefícios que cada uma oferece."
        actions={<button className="btn gold" onClick={() => setEditing('new')}><Icon.plus width={16} /> Novo parceiro</button>}
      />
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {db.partners.map((p) => {
          const benefits = db.benefits.filter((b) => b.partnerId === p.id)
          const uses = db.usages.filter((u) => u.status === 'confirmado' && benefits.some((b) => b.id === u.benefitId)).length
          return (
            <div key={p.id} className="card stack" style={{ gap: 12, opacity: p.active ? 1 : 0.6 }}>
              <div className="spread" style={{ flexWrap: 'nowrap' }}>
                <div className="row" style={{ flexWrap: 'nowrap' }}>
                  {p.logoUrl ? <img className="partner-logo" src={p.logoUrl} alt={p.name} /> : <span className="partner-logo">{initials(p.name)}</span>}
                  <div>
                    <h3>{p.name}</h3>
                    <div className="small muted">{p.category}</div>
                  </div>
                </div>
                <div className="row" style={{ flexWrap: 'nowrap', gap: 4 }}>
                  <button className="btn ghost icon" onClick={() => setEditing(p)}><Icon.edit width={14} /></button>
                  <button className="btn ghost icon" onClick={() => confirm(`Excluir ${p.name}? Os benefícios dele passam a ser do Elite Club.`) && remove('partners', p.id)}><Icon.trash width={14} /></button>
                </div>
              </div>
              <div className="row">
                <span className={`badge ${p.ecosystem === 'dialog' ? 'dialog' : 'neutral'}`}>{p.ecosystem === 'dialog' ? 'Ecossistema Dialog' : 'Parceiro externo'}</span>
                {!p.active && <span className="badge err">inativo</span>}
                <span className="small muted">{uses} uso(s) confirmado(s)</span>
              </div>
              {p.description && <div className="small muted">{p.description}</div>}
              <div>
                <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>Benefícios oferecidos</div>
                {benefits.length ? (
                  <ul style={{ margin: 0, paddingLeft: 18 }} className="small">
                    {benefits.map((b) => <li key={b.id}>{b.title}{b.monthlyQuota ? ` (${b.monthlyQuota} ${b.unit}/mês)` : ''}</li>)}
                  </ul>
                ) : (
                  <div className="small muted">Nenhum benefício vinculado. Vincule em Benefícios.</div>
                )}
              </div>
              <div className="row">
                {p.whatsapp && <a className="btn ghost sm" href={whatsappUrl(p.whatsapp)} target="_blank" rel="noreferrer"><Icon.whatsapp width={14} /> WhatsApp</a>}
                {p.email && <a className="btn ghost sm" href={`mailto:${p.email}`}><Icon.mail width={14} /> E-mail</a>}
                {p.website && <a className="btn ghost sm" href={socialUrl.website(p.website)} target="_blank" rel="noreferrer"><Icon.globe width={14} /> Site</a>}
                {p.instagram && <a className="btn ghost sm" href={socialUrl.instagram(p.instagram)} target="_blank" rel="noreferrer"><Icon.instagram width={14} /> Instagram</a>}
              </div>
            </div>
          )
        })}
      </div>
      {editing && <PartnerForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </>
  )
}
