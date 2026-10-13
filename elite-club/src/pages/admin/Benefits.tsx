import { useState } from 'react'
import { Icon } from '../../components/Icons'
import { Field, Modal, PageHead } from '../../components/ui'
import { remove, upsert, useDB } from '../../lib/store'
import type { Benefit, BenefitKind, QuotaUnit } from '../../lib/types'
import { uid } from '../../lib/utils'

export const KIND_LABEL: Record<BenefitKind, string> = {
  encontro: 'Encontro',
  convidada: 'Convidada',
  sala: 'Reserva de sala',
  endereco_fiscal: 'Endereço fiscal',
  desconto: 'Desconto',
  experiencia: 'Experiência',
  comunidade: 'Comunidade',
  campanha: 'Campanha',
}

function BenefitForm({ initial, onClose }: { initial?: Benefit; onClose: () => void }) {
  const db = useDB()
  const [b, setB] = useState<Benefit>(
    initial ?? {
      id: uid(),
      title: '',
      description: '',
      kind: 'desconto',
      unit: 'vezes',
      requiresBooking: false,
      memberCanRequest: true,
      active: true,
      createdAt: new Date().toISOString(),
    },
  )
  const set = <K extends keyof Benefit>(k: K, v: Benefit[K]) => setB((x) => ({ ...x, [k]: v }))
  return (
    <Modal
      title={initial ? 'Editar benefício' : 'Novo benefício'}
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn gold" disabled={!b.title.trim()} onClick={() => { upsert('benefits', b); onClose() }}>Salvar</button>
        </>
      }
    >
      <div className="grid-2">
        <Field label="Título *" span><input value={b.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <Field label="Descrição" span><textarea value={b.description} onChange={(e) => set('description', e.target.value)} /></Field>
        <Field label="Tipo">
          <select value={b.kind} onChange={(e) => set('kind', e.target.value as BenefitKind)}>
            {Object.entries(KIND_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Field>
        <Field label="Parceiro que fornece">
          <select value={b.partnerId ?? ''} onChange={(e) => set('partnerId', e.target.value || undefined)}>
            <option value="">Elite Club (próprio)</option>
            {db.partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Desconto (%)">
          <input type="number" min={0} max={100} value={b.discountPct ?? ''} onChange={(e) => set('discountPct', e.target.value ? Number(e.target.value) : undefined)} />
        </Field>
        <Field label="Limite por mês (vazio = sem limite)">
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <input type="number" min={0} step={0.5} value={b.monthlyQuota ?? ''} onChange={(e) => set('monthlyQuota', e.target.value ? Number(e.target.value) : undefined)} />
            <select value={b.unit} onChange={(e) => set('unit', e.target.value as QuotaUnit)} style={{ maxWidth: 110 }}>
              <option value="vezes">vezes</option>
              <option value="horas">horas</option>
            </select>
          </div>
        </Field>
        <Field label="Regras / observações" span><textarea value={b.rules ?? ''} onChange={(e) => set('rules', e.target.value)} /></Field>
        <Field label="Cláusula do contrato"><input value={b.contractRef ?? ''} onChange={(e) => set('contractRef', e.target.value)} placeholder="ex.: f" /></Field>
        <div className="stack" style={{ gap: 8, alignContent: 'end' }}>
          <label className="check"><input type="checkbox" checked={b.requiresBooking} onChange={(e) => set('requiresBooking', e.target.checked)} /> Exige reserva / agendamento</label>
          <label className="check"><input type="checkbox" checked={b.memberCanRequest} onChange={(e) => set('memberCanRequest', e.target.checked)} /> Associada pode solicitar pela área dela</label>
          <label className="check"><input type="checkbox" checked={b.active} onChange={(e) => set('active', e.target.checked)} /> Ativo</label>
        </div>
      </div>
    </Modal>
  )
}

export default function Benefits() {
  const db = useDB()
  const [editing, setEditing] = useState<Benefit | 'new' | null>(null)
  const sorted = [...db.benefits].sort((a, b) => (a.contractRef ?? 'z').localeCompare(b.contractRef ?? 'z'))

  return (
    <>
      <PageHead
        title="Clube de benefícios"
        subtitle="Entregáveis do contrato e benefícios dos parceiros, com limites mensais não cumulativos."
        actions={<button className="btn gold" onClick={() => setEditing('new')}><Icon.plus width={16} /> Novo benefício</button>}
      />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cláusula</th>
              <th>Benefício</th>
              <th>Tipo</th>
              <th>Parceiro</th>
              <th>Limite</th>
              <th>Solicitação</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((b) => {
              const p = db.partners.find((x) => x.id === b.partnerId)
              return (
                <tr key={b.id}>
                  <td>{b.contractRef ? <span className="badge neutral">3.{b.contractRef}</span> : '—'}</td>
                  <td>
                    <b>{b.title}</b>
                    <div className="small muted" style={{ maxWidth: 420 }}>{b.description}</div>
                  </td>
                  <td className="small">{KIND_LABEL[b.kind]}{b.discountPct ? ` · ${b.discountPct}%` : ''}</td>
                  <td className="small">{p ? <span className={`badge ${p.ecosystem === 'dialog' ? 'dialog' : 'neutral'}`}>{p.name}</span> : 'Elite Club'}</td>
                  <td className="small">{b.monthlyQuota ? `${b.monthlyQuota} ${b.unit}/mês` : 'Sem limite'}</td>
                  <td className="small">{b.memberCanRequest ? 'Associada' : 'Só admin'}</td>
                  <td><span className={`badge ${b.active ? 'ok' : 'neutral'}`}>{b.active ? 'ativo' : 'inativo'}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn ghost icon" onClick={() => setEditing(b)}><Icon.edit width={14} /></button>{' '}
                    <button className="btn ghost icon" onClick={() => confirm('Excluir este benefício e todos os registros de uso dele? Para manter o histórico, prefira desativá-lo.') && remove('benefits', b.id)}><Icon.trash width={14} /></button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="card flat small muted" style={{ marginTop: 16 }}>
        <b>Condições gerais (contrato):</b> 3.1. Descontos não são convertíveis em dinheiro nem necessariamente cumulativos com outras promoções.
        3.2. O almoço ou momento de convivência eventualmente realizado após os encontros não integra automaticamente o valor da assinatura,
        sendo consumos individuais de responsabilidade de cada participante, salvo comunicação expressa em sentido contrário.
      </div>
      {editing && <BenefitForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </>
  )
}
