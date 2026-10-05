import type { DocumentDetail, DocumentSummary } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(userId: number, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': String(userId),
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.error ?? `Request failed with status ${res.status}`)
  }

  return res.json() as Promise<T>
}

export function getOwnedDocuments(userId: number) {
  return request<{ documents: DocumentSummary[] }>(userId, '/documents/owned')
}

export function getSharedDocuments(userId: number) {
  return request<{ documents: DocumentSummary[] }>(userId, '/documents/shared')
}

export function createDocument(userId: number, title?: string) {
  return request<{ document: DocumentDetail }>(userId, '/documents', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}

export function getDocument(userId: number, id: number) {
  return request<{ document: DocumentDetail }>(userId, `/documents/${id}`)
}

export function updateDocumentTitle(userId: number, id: number, title: string) {
  return request<{ document: DocumentDetail }>(userId, `/documents/${id}/title`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  })
}

export function updateDocumentContent(userId: number, id: number, content: string) {
  return request<{ document: DocumentDetail }>(userId, `/documents/${id}/content`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  })
}

export function shareDocument(userId: number, id: number, email: string) {
  return request<{ share: { id: number; documentId: number; userId: number } }>(
    userId,
    `/documents/${id}/shares`,
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    },
  )
}

export async function importDocument(userId: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_URL}/import`, {
    method: 'POST',
    headers: { 'X-User-Id': String(userId) },
    body: formData,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.error ?? `Request failed with status ${res.status}`)
  }

  return res.json() as Promise<{ document: DocumentDetail }>
}

export { ApiError }
