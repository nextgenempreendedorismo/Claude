import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icons'
import MemberForm from '../../components/MemberForm'
import { Avatar, Empty, PageHead, PaymentBadge } from '../../components/ui'
import { useDB } from '../../lib/store'
import type { PaymentStatus } from '../../lib/types'
import { downloadFile, formatDate, toCSV } from '../../lib/utils'

export default function Members() {
  const db = useDB()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<PaymentStatus | ''>('')
  const [creating, setCreating] = useState(false)

  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    return db.members
      .filter((m) => !status || m.paymentStatus === status)
      .filter(
        (m) =>
          !t ||
          [m.name, m.displayName, m.email, m.company, m.segment, m.cpf].some((v) => v?.toLowerCase().includes(t)),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [db.members, q, status])

  function exportCSV() {
    const rows = [
      ['Nome', 'E-mail', 'WhatsApp', 'CPF', 'Empresa', 'Cargo', 'Segmento', 'CNPJ', 'Cidade', 'UF', 'Instagram', 'LinkedIn', 'Site', 'Plano', 'Início', 'Fim', 'Situação', 'Endereço fiscal', 'Página'],
      ...list.map((m) => [
        m.name, m.email, m.whatsapp, m.cpf, m.company, m.role, m.segment, m.cnpj, m.address.city, m.address.state,
        m.socials.instagram, m.socials.linkedin, m.socials.website, m.plan, m.joinedAt, m.contractEnd, m.paymentStatus,
        m.fiscalAddress ? 'Sim' : 'Não', `${location.origin}/m/${m.slug}`,
      ]),
    ]
    downloadFile('associadas.csv', '﻿' + toCSV(rows), 'text/csv;charset=utf-8')
  }

  return (
    <>
      <PageHead
        title="Associadas"
        subtitle="Cadastro completo, situação financeira e página exclusiva de cada associada."
        actions={
          <>
            <button className="btn ghost" onClick={exportCSV}><Icon.download width={16} /> Exportar</button>
            <button className="btn gold" onClick={() => setCreating(true)}><Icon.plus width={16} /> Nova associada</button>
          </>
        }
      />
      <div className="row" style={{ marginBottom: 16 }}>
        <input style={{ maxWidth: 360 }} placeholder="Buscar por nome, e-mail, empresa, segmento…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select style={{ maxWidth: 200 }} value={status} onChange={(e) => setStatus(e.target.value as PaymentStatus | '')}>
          <option value="">Todas as situações</option>
          <option value="adimplente">Adimplentes</option>
          <option value="inadimplente">Inadimplentes</option>
          <option value="suspensa">Suspensas</option>
          <option value="cancelada">Canceladas</option>
        </select>
        <span className="small muted">{list.length} associada(s)</span>
      </div>
      <div className="table-wrap">
        {list.length ? (
          <table>
            <thead>
              <tr>
                <th>Associada</th>
                <th>Empresa</th>
                <th>Contato</th>
                <th>Desde</th>
                <th>Situação</th>
                <th>Página</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id} style={{ cursor: 'pointer' }} onClick={() => nav(`/admin/associadas/${m.id}`)}>
                  <td>
                    <div className="row" style={{ flexWrap: 'nowrap' }}>
                      <Avatar member={m} />
                      <div>
                        <b>{m.name}</b>
                        <div className="small muted">{m.segment}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {m.company}
                    <div className="small muted">{m.role}</div>
                  </td>
                  <td className="small">
                    {m.email}
                    <div className="muted">{m.whatsapp}</div>
                  </td>
                  <td className="small">{formatDate(m.joinedAt)}</td>
                  <td><PaymentBadge status={m.paymentStatus} /></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {m.publicPage ? (
                      <Link className="btn ghost sm" to={`/m/${m.slug}`} target="_blank"><Icon.external width={14} /> Abrir</Link>
                    ) : (
                      <span className="small muted">Desativada</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty>Nenhuma associada encontrada.</Empty>
        )}
      </div>
      {creating && (
        <MemberForm
          onClose={(saved) => {
            setCreating(false)
            if (saved) nav(`/admin/associadas/${saved.id}`)
          }}
        />
      )}
    </>
  )
}
