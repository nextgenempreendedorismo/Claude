import { useRef, useState } from 'react'
import { Icon } from '../../components/Icons'
import { PageHead } from '../../components/ui'
import { exportJSON, importJSON, resetDemo } from '../../lib/store'
import { downloadFile, todayISO } from '../../lib/utils'

export default function Settings() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)

  async function onImport(file?: File) {
    if (!file) return
    try {
      importJSON(await file.text())
      setMsg({ tone: 'ok', text: 'Backup importado com sucesso.' })
    } catch (e) {
      setMsg({ tone: 'err', text: `Não foi possível importar: ${(e as Error).message}` })
    }
  }

  return (
    <>
      <PageHead title="Configurações" subtitle="Backup e dados do sistema." />
      <div className="grid-2">
        <div className="card stack">
          <h3>Backup dos dados</h3>
          <p className="muted small" style={{ margin: 0 }}>
            Nesta versão os dados ficam salvos neste navegador. Exporte um backup regularmente e importe-o para restaurar
            ou levar os dados para outro computador.
          </p>
          <div className="row">
            <button className="btn gold" onClick={() => downloadFile(`elite-club-backup-${todayISO()}.json`, exportJSON(), 'application/json')}>
              <Icon.download width={16} /> Exportar backup
            </button>
            <button className="btn ghost" onClick={() => fileRef.current?.click()}>Importar backup</button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => onImport(e.target.files?.[0])} />
          </div>
          {msg && <div className={`alert ${msg.tone}`}>{msg.text}</div>}
        </div>
        <div className="card stack">
          <h3>Dados de demonstração</h3>
          <p className="muted small" style={{ margin: 0 }}>
            Apaga todos os dados atuais e restaura as associadas, parceiros, benefícios e encontros de exemplo.
          </p>
          <div>
            <button className="btn danger" onClick={() => confirm('Apagar todos os dados e restaurar a demonstração?') && resetDemo()}>
              Restaurar demonstração
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
