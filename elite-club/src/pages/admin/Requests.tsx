import UsageTable from '../../components/UsageTable'
import { PageHead } from '../../components/ui'
import { useDB } from '../../lib/store'

export default function Requests() {
  const db = useDB()
  const pending = db.usages.filter((u) => u.status === 'pendente').sort((a, b) => a.date.localeCompare(b.date))
  const decided = db.usages
    .filter((u) => u.origin === 'associada' && u.status !== 'pendente')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20)

  return (
    <>
      <PageHead
        title="Solicitações"
        subtitle="Reservas de sala, convidadas e pedidos de benefícios feitos pelas associadas. Solicitações pendentes já reservam o saldo do mês."
      />
      <h3 style={{ marginBottom: 10 }}>Aguardando aprovação ({pending.length})</h3>
      <UsageTable usages={pending} />
      <h3 style={{ margin: '28px 0 10px' }}>Decididas recentemente</h3>
      <UsageTable usages={decided} />
    </>
  )
}
