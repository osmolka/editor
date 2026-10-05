import { useEffect, useState } from 'react'
import { createDocument, getOwnedDocuments, getSharedDocuments } from '../api/client'
import { useCurrentUser } from '../context/CurrentUserContext'
import type { DocumentSummary } from '../types'
import { ImportButton } from './ImportButton'
import { UserSwitcher } from './UserSwitcher'

export function DocumentList({ onOpen }: { onOpen: (id: number) => void }) {
  const { currentUser } = useCurrentUser()
  const [owned, setOwned] = useState<DocumentSummary[]>([])
  const [shared, setShared] = useState<DocumentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = () => {
    setLoading(true)
    setError(null)
    Promise.all([getOwnedDocuments(currentUser.id), getSharedDocuments(currentUser.id)])
      .then(([ownedRes, sharedRes]) => {
        setOwned(ownedRes.documents)
        setShared(sharedRes.documents)
      })
      .catch(() => setError('Failed to load documents'))
      .finally(() => setLoading(false))
  }

  useEffect(reload, [currentUser.id])

  const handleCreate = async () => {
    const res = await createDocument(currentUser.id)
    onOpen(res.document.id)
  }

  return (
    <div className="document-list-page">
      <div className="page-header">
        <h1>Redactor</h1>
        <UserSwitcher />
      </div>

      <div className="list-actions">
        <button type="button" onClick={handleCreate}>
          New Document
        </button>
        <ImportButton onImported={onOpen} />
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          <section className="document-section owned">
            <h2>
              My Documents <span className="doc-badge owned">Owned</span>
            </h2>
            {owned.length === 0 && <p>No documents yet.</p>}
            <ul>
              {owned.map((doc) => (
                <li key={doc.id}>
                  <button type="button" onClick={() => onOpen(doc.id)}>
                    {doc.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="document-section shared">
            <h2>
              Shared with Me <span className="doc-badge shared">Shared</span>
            </h2>
            {shared.length === 0 && <p>No documents shared with you yet.</p>}
            <ul>
              {shared.map((doc) => (
                <li key={doc.id}>
                  <button type="button" onClick={() => onOpen(doc.id)}>
                    {doc.title}
                  </button>
                  {doc.owner && <span className="owner-tag"> — shared by {doc.owner.name}</span>}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
