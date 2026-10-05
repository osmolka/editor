import { useEffect, useState } from 'react'
import { createDocument, deleteDocument, getOwnedDocuments, getSharedDocuments } from './api/client'
import { ApiError } from './api/client'
import { useCurrentUser } from './context/CurrentUserContext'
import { DocumentEditor } from './components/DocumentEditor'
import { EmptyState } from './components/EmptyState'
import { Sidebar } from './components/Sidebar'
import type { DocumentDetail, DocumentSummary } from './types'

function App() {
  const { currentUser } = useCurrentUser()
  const [owned, setOwned] = useState<DocumentSummary[]>([])
  const [shared, setShared] = useState<DocumentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [openDocumentId, setOpenDocumentId] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    setOpenDocumentId(null)
    Promise.all([getOwnedDocuments(currentUser.id), getSharedDocuments(currentUser.id)])
      .then(([ownedRes, sharedRes]) => {
        if (!active) return
        setOwned(ownedRes.documents)
        setShared(sharedRes.documents)
      })
      .catch(() => {
        if (active) setError('Failed to load documents')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [currentUser.id])

  const handleCreate = async () => {
    const res = await createDocument(currentUser.id)
    setOwned((prev) => [res.document, ...prev])
    setOpenDocumentId(res.document.id)
  }

  const handleImported = (document: DocumentDetail) => {
    setOwned((prev) => [document, ...prev])
    setOpenDocumentId(document.id)
  }

  const handleDeleteOwned = async (doc: DocumentSummary) => {
    if (!window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) return

    setDeletingId(doc.id)
    try {
      await deleteDocument(currentUser.id, doc.id)
      handleDeleted(doc.id)
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete document')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleted = (id: number) => {
    setOwned((prev) => prev.filter((d) => d.id !== id))
    setShared((prev) => prev.filter((d) => d.id !== id))
    setOpenDocumentId((prev) => (prev === id ? null : prev))
  }

  const handleTitleSaved = (id: number, title: string) => {
    setOwned((prev) => prev.map((d) => (d.id === id ? { ...d, title } : d)))
    setShared((prev) => prev.map((d) => (d.id === id ? { ...d, title } : d)))
  }

  return (
    <div className="app-shell">
      <Sidebar
        owned={owned}
        shared={shared}
        loading={loading}
        error={error}
        selectedId={openDocumentId}
        onSelect={setOpenDocumentId}
        onCreate={handleCreate}
        onImported={handleImported}
        onDeleteOwned={handleDeleteOwned}
        deletingId={deletingId}
      />
      <main className="main-pane">
        {openDocumentId === null ? (
          <EmptyState onCreate={handleCreate} />
        ) : (
          <DocumentEditor
            key={openDocumentId}
            documentId={openDocumentId}
            onDeleted={handleDeleted}
            onTitleSaved={handleTitleSaved}
          />
        )}
      </main>
    </div>
  )
}

export default App
