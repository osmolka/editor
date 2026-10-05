import { useRef, useState } from 'react'
import { ApiError, importDocument } from '../api/client'
import { useCurrentUser } from '../context/CurrentUserContext'

const ALLOWED_EXTENSIONS = ['.txt', '.md']

export function ImportButton({ onImported }: { onImported: (documentId: number) => void }) {
  const { currentUser } = useCurrentUser()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    )
    if (!hasAllowedExtension) {
      setError('Only .txt and .md files can be imported.')
      return
    }

    setError(null)
    setImporting(true)
    try {
      const res = await importDocument(currentUser.id, file)
      onImported(res.document.id)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="import-control">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={importing}
      >
        {importing ? 'Importing…' : 'Import File'}
      </button>
      <span className="import-hint">Supports .txt and .md files only</span>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
