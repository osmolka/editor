import { ImportButton } from './ImportButton'
import { UserSwitcher } from './UserSwitcher'
import type { DocumentDetail, DocumentSummary } from '../types'

function NavList({
  documents,
  emptyLabel,
  selectedId,
  onSelect,
  badge,
  deletingId,
  onDelete,
}: {
  documents: DocumentSummary[]
  emptyLabel: string
  selectedId: number | null
  onSelect: (id: number) => void
  badge: 'owned' | 'shared'
  deletingId?: number | null
  onDelete?: (doc: DocumentSummary) => void
}) {
  if (documents.length === 0) {
    return <p className="nav-empty">{emptyLabel}</p>
  }

  return (
    <ul className="nav-list">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className={doc.id === selectedId ? 'nav-item selected' : 'nav-item'}
        >
          <button
            type="button"
            className="nav-item-button"
            aria-current={doc.id === selectedId ? 'page' : undefined}
            onClick={() => onSelect(doc.id)}
          >
            <span className="nav-item-title">{doc.title}</span>
            {badge === 'shared' && doc.owner && (
              <span className="nav-item-meta">shared by {doc.owner.name}</span>
            )}
          </button>
          {onDelete && (
            <button
              type="button"
              className="nav-item-delete"
              aria-label={`Delete ${doc.title}`}
              onClick={() => onDelete(doc)}
              disabled={deletingId === doc.id}
            >
              {deletingId === doc.id ? '…' : '✕'}
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

export function Sidebar({
  owned,
  shared,
  loading,
  error,
  selectedId,
  onSelect,
  onCreate,
  onImported,
  onDeleteOwned,
  deletingId,
}: {
  owned: DocumentSummary[]
  shared: DocumentSummary[]
  loading: boolean
  error: string | null
  selectedId: number | null
  onSelect: (id: number) => void
  onCreate: () => void
  onImported: (document: DocumentDetail) => void
  onDeleteOwned: (doc: DocumentSummary) => void
  deletingId: number | null
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">Document Editor</h1>
        <UserSwitcher />
      </div>

      <div className="sidebar-actions">
        <button type="button" className="btn btn-primary" onClick={onCreate}>
          New Document
        </button>
        <ImportButton onImported={onImported} />
      </div>
      <p className="sidebar-hint">Import accepts .txt and .md files only</p>

      <nav className="sidebar-nav">
        {loading && <p className="nav-empty">Loading…</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <>
            <div className="nav-section">
              <h2 className="nav-section-title">
                My Documents <span className="doc-badge owned">Owned</span>
              </h2>
              <NavList
                documents={owned}
                emptyLabel="No documents yet."
                selectedId={selectedId}
                onSelect={onSelect}
                badge="owned"
                deletingId={deletingId}
                onDelete={onDeleteOwned}
              />
            </div>

            <div className="nav-section">
              <h2 className="nav-section-title">
                Shared with Me <span className="doc-badge shared">Shared</span>
              </h2>
              <NavList
                documents={shared}
                emptyLabel="No documents shared with you yet."
                selectedId={selectedId}
                onSelect={onSelect}
                badge="shared"
              />
            </div>
          </>
        )}
      </nav>
    </aside>
  )
}
