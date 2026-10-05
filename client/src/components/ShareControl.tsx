import { useState } from 'react'
import { ApiError, shareDocument } from '../api/client'
import { useCurrentUser } from '../context/CurrentUserContext'

export function ShareControl({ documentId }: { documentId: number }) {
  const { currentUser, users } = useCurrentUser()
  const candidates = users.filter((u) => u.id !== currentUser.id)
  const [selectedEmail, setSelectedEmail] = useState(candidates[0]?.email ?? '')
  const [status, setStatus] = useState<'idle' | 'sharing' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  if (candidates.length === 0) return null

  const handleShare = async () => {
    setStatus('sharing')
    try {
      await shareDocument(currentUser.id, documentId, selectedEmail)
      const sharedWith = candidates.find((u) => u.email === selectedEmail)
      setMessage(`Shared with ${sharedWith?.name ?? selectedEmail}`)
      setStatus('done')
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Failed to share')
      setStatus('error')
    }
  }

  return (
    <div className="share-control">
      <select
        className="share-select"
        value={selectedEmail}
        onChange={(e) => setSelectedEmail(e.target.value)}
      >
        {candidates.map((user) => (
          <option key={user.id} value={user.email}>
            {user.name} ({user.email})
          </option>
        ))}
      </select>
      <button type="button" className="btn btn-secondary" onClick={handleShare} disabled={status === 'sharing'}>
        {status === 'sharing' ? 'Sharing…' : 'Share'}
      </button>
      {status === 'done' && <span className="share-status success">{message}</span>}
      {status === 'error' && <span className="share-status error">{message}</span>}
    </div>
  )
}
