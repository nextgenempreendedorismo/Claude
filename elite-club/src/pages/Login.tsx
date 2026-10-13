import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { loginAdmin, loginMember, useSession } from '../lib/auth'

export default function Login() {
  const session = useSession()
  const nav = useNavigate()
  const loc = useLocation()
  const [tab, setTab] = useState<'member' | 'admin'>('member')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (session?.role === 'admin') return <Navigate to={(loc.state as { from?: string })?.from || '/admin'} replace />
  if (session?.role === 'member') return <Navigate to="/minha-area" replace />

  function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (tab === 'admin') {
      if (!loginAdmin(password)) setError('Senha inválida.')
      else nav('/admin')
    } else {
      const err = loginMember(email, code)
      if (err) setError(err)
      else nav('/minha-area')
    }
  }

  return (
    <div className="login">
      <div className="hero">
        <img src="/brand/elite-vertical.png" alt="Elite Club" />
        <div className="tag">Comunidade · Networking · Benefícios</div>
      </div>
      <div className="panel">
        <form className="box" onSubmit={submit}>
          <div>
            <div className="eyebrow">Bem-vinda</div>
            <h1>Acesse o Elite Club</h1>
          </div>
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button type="button" className={tab === 'member' ? 'active' : ''} onClick={() => setTab('member')}>
              Sou associada
            </button>
            <button type="button" className={tab === 'admin' ? 'active' : ''} onClick={() => setTab('admin')}>
              Administração
            </button>
          </div>
          {tab === 'member' ? (
            <>
              <label className="field">
                E-mail
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </label>
              <label className="field">
                Código de acesso
                <input inputMode="numeric" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="6 dígitos" />
              </label>
            </>
          ) : (
            <label className="field">
              Senha do administrador
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
          )}
          {error && <div className="alert err">{error}</div>}
          <button className="btn gold" type="submit">
            Entrar
          </button>
          <div className="card flat small muted" style={{ padding: 14 }}>
            <b>Acesso de demonstração</b>
            <br />
            Admin: senha <code>elite2026</code>
            <br />
            Associada: <code>ana@exemplo.com.br</code> · código <code>482913</code>
          </div>
          <div className="row small muted" style={{ justifyContent: 'center' }}>
            <img src="/brand/dialog-mark.png" alt="Dialog" style={{ width: 28, borderRadius: 6 }} />
            Parte do ecossistema Clube Dialog
          </div>
        </form>
      </div>
    </div>
  )
}
