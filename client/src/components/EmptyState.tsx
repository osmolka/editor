export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        <svg width="29" height="29" viewBox="0 0 29 29" fill="none">
          <path d="M7 3.5h10l5 5V24a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M17 3.5v5h5M9 14h9M9 18h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </div>
      <h2>No document open</h2>
      <p>Select a document from the sidebar, or create a new one to get started.</p>
      <button type="button" className="btn btn-primary" onClick={onCreate}>
        New Document
      </button>
    </div>
  )
}
