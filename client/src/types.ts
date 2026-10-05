export interface SeededUser {
  id: number
  name: string
  email: string
}

export interface DocumentSummary {
  id: number
  title: string
  ownerId: number
  createdAt: string
  updatedAt: string
  owner?: { id: number; name: string; email: string }
}

export interface DocumentDetail extends DocumentSummary {
  content: string
}
