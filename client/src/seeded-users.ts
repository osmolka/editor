import type { SeededUser } from './types'

/**
 * Matches server/prisma/seed.ts. There is no /api/users endpoint, so the
 * two seeded identities are mirrored here for the user switcher.
 */
export const SEEDED_USERS: SeededUser[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
]
