import { useSyncExternalStore } from 'react'
import { getDB } from './store'

/**
 * Autenticação de demonstração (modo local). Em produção, substituir por um
 * provedor real (ex.: Supabase Auth) — ver README.
 */
export type Session = { role: 'admin' } | { role: 'member'; memberId: string } | null

const KEY = 'elite-club-session'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'elite2026'

function read(): Session {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || 'null') as Session
  } catch {
    return null
  }
}

let session: Session = read()
const listeners = new Set<() => void>()

function set(s: Session) {
  session = s
  try {
    if (s) sessionStorage.setItem(KEY, JSON.stringify(s))
    else sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

export function useSession(): Session {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => session,
  )
}

export function loginAdmin(password: string): boolean {
  if (password !== ADMIN_PASSWORD) return false
  set({ role: 'admin' })
  return true
}

export function loginMember(email: string, code: string): string | null {
  const m = getDB().members.find(
    (x) => x.email.trim().toLowerCase() === email.trim().toLowerCase() && x.accessCode === code.trim(),
  )
  if (!m) return 'E-mail ou código de acesso inválido.'
  if (m.paymentStatus === 'cancelada') return 'Associação cancelada. Fale com a equipe Elite Club.'
  set({ role: 'member', memberId: m.id })
  return null
}

export const logout = () => set(null)
