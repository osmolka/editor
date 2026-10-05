import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { SEEDED_USERS } from '../seeded-users'
import type { SeededUser } from '../types'

const STORAGE_KEY = 'editor.currentUserId'

interface CurrentUserContextValue {
  currentUser: SeededUser
  users: SeededUser[]
  setCurrentUserId: (id: number) => void
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null)

function readStoredUserId(): number {
  const stored = Number(localStorage.getItem(STORAGE_KEY))
  return SEEDED_USERS.some((u) => u.id === stored) ? stored : SEEDED_USERS[0].id
}

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserIdState] = useState(readStoredUserId)

  const setCurrentUserId = (id: number) => {
    localStorage.setItem(STORAGE_KEY, String(id))
    setCurrentUserIdState(id)
  }

  const currentUser = useMemo(
    () => SEEDED_USERS.find((u) => u.id === currentUserId) ?? SEEDED_USERS[0],
    [currentUserId],
  )

  return (
    <CurrentUserContext.Provider value={{ currentUser, users: SEEDED_USERS, setCurrentUserId }}>
      {children}
    </CurrentUserContext.Provider>
  )
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext)
  if (!ctx) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider')
  }
  return ctx
}
