import { useSyncExternalStore } from 'react'
import { buildSeed } from './seed'
import type { DB } from './types'

/**
 * Armazenamento local (localStorage). Toda leitura/escrita do app passa por aqui,
 * então trocar por um backend (ex.: Supabase) significa reimplementar este módulo.
 */
const KEY = 'elite-club-db-v1'

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DB
  } catch {
    /* armazenamento indisponível: usa dados iniciais em memória */
  }
  return buildSeed()
}

let db: DB = load()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    /* ignore */
  }
}

export function getDB(): DB {
  return db
}

export function setDB(updater: (d: DB) => DB) {
  db = updater(db)
  persist()
  listeners.forEach((l) => l())
}

export function useDB(): DB {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => db,
  )
}

type Collection = 'members' | 'partners' | 'benefits' | 'usages' | 'meetings'
type Item<C extends Collection> = DB[C][number]

export function upsert<C extends Collection>(col: C, item: Item<C>) {
  setDB((d) => {
    const list = d[col] as Item<C>[]
    const exists = list.some((x) => x.id === item.id)
    const next = exists ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item]
    return { ...d, [col]: next }
  })
}

export function remove(col: Collection, id: string) {
  setDB((d) => {
    const next: DB = { ...d, [col]: (d[col] as { id: string }[]).filter((x) => x.id !== id) }
    // remove registros dependentes
    if (col === 'members') next.usages = next.usages.filter((u) => u.memberId !== id)
    if (col === 'benefits') next.usages = next.usages.filter((u) => u.benefitId !== id)
    if (col === 'meetings') next.usages = next.usages.map((u) => (u.meetingId === id ? { ...u, meetingId: undefined } : u))
    if (col === 'partners') next.benefits = next.benefits.map((b) => (b.partnerId === id ? { ...b, partnerId: undefined } : b))
    return next
  })
}

export function exportJSON(): string {
  return JSON.stringify(db, null, 2)
}

export function importJSON(raw: string) {
  const parsed = JSON.parse(raw) as DB
  if (!Array.isArray(parsed.members) || !Array.isArray(parsed.benefits)) {
    throw new Error('Arquivo inválido')
  }
  setDB(() => ({ ...buildSeed(), ...parsed }))
}

export function resetDemo() {
  setDB(() => buildSeed())
}
