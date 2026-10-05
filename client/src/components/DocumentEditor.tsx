import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import {
  ApiError,
  deleteDocument,
  getDocument,
  updateDocumentContent,
  updateDocumentTitle,
} from '../api/client'
import { useCurrentUser } from '../context/CurrentUserContext'
import type { DocumentDetail } from '../types'
import { useDebouncedCallback } from '../hooks/useDebouncedCallback'
import { EditorToolbar } from './EditorToolbar'
import { ShareControl } from './ShareControl'

type SaveStatus = 'saving' | 'saved' | 'error'

function EditorBody({
  document,
  onDeleted,
  onTitleSaved,
}: {
  document: DocumentDetail
  onDeleted: () => void
  onTitleSaved: (title: string) => void
}) {
  const { currentUser } = useCurrentUser()
  const isOwner = document.ownerId === currentUser.id
  const [title, setTitle] = useState(document.title)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return

    setDeleting(true)
    try {
      await deleteDocument(currentUser.id, document.id)
      onDeleted()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete document')
      setDeleting(false)
    }
  }

  const saveTitle = useDebouncedCallback(async (next: string) => {
    setSaveStatus('saving')
    try {
      await updateDocumentTitle(currentUser.id, document.id, next)
      setSaveStatus('saved')
      onTitleSaved(next)
    } catch {
      setSaveStatus('error')
    }
  }, 600)

  const saveContent = useDebouncedCallback(async (next: string) => {
    setSaveStatus('saving')
    try {
      await updateDocumentContent(currentUser.id, document.id, next)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }, 800)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: false,
        strike: false,
      }),
    ],
    content: document.content,
    onUpdate: ({ editor }) => {
      saveContent(editor.getHTML())
    },
  })

  return (
    <div className="editor-page">
      <div className="editor-topbar">
        <input
          className="title-input"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            saveTitle(e.target.value)
          }}
          aria-label="Document title"
        />
        <span className={`doc-badge ${isOwner ? 'owned' : 'shared'}`}>
          {isOwner ? 'Owned' : 'Shared with you'}
        </span>
        <span className="save-status" role="status" aria-live="polite">
          {saveStatus === 'saving' && 'Saving…'}
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'error' && 'Failed to save'}
        </span>
      </div>
      {isOwner && (
        <div className="owner-actions">
          <ShareControl documentId={document.id} />
          <button type="button" className="btn btn-danger-subtle" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete Document'}
          </button>
        </div>
      )}
      <EditorToolbar editor={editor} />
      <div className="document-surface-wrapper">
        <div className="document-surface">
          <EditorContent editor={editor} className="editor-content" />
        </div>
      </div>
    </div>
  )
}

export function DocumentEditor({
  documentId,
  onDeleted,
  onTitleSaved,
}: {
  documentId: number
  onDeleted: (id: number) => void
  onTitleSaved: (id: number, title: string) => void
}) {
  const { currentUser } = useCurrentUser()
  const [document, setDocument] = useState<DocumentDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDocument(null)
    setError(null)
    getDocument(currentUser.id, documentId)
      .then((res) => setDocument(res.document))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load document')
      })
  }, [currentUser.id, documentId])

  if (error) return <p className="error-text editor-page-error">{error}</p>
  if (!document) return <p className="editor-page-loading">Loading…</p>

  return (
    <EditorBody
      key={document.id}
      document={document}
      onDeleted={() => onDeleted(document.id)}
      onTitleSaved={(title) => onTitleSaved(document.id, title)}
    />
  )
}
