import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import {
  ApiError,
  getDocument,
  updateDocumentContent,
  updateDocumentTitle,
} from '../api/client'
import { useCurrentUser } from '../context/CurrentUserContext'
import type { DocumentDetail } from '../types'
import { useDebouncedCallback } from '../hooks/useDebouncedCallback'
import { EditorToolbar } from './EditorToolbar'
import { ShareControl } from './ShareControl'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function EditorBody({ document }: { document: DocumentDetail }) {
  const { currentUser } = useCurrentUser()
  const isOwner = document.ownerId === currentUser.id
  const [title, setTitle] = useState(document.title)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  const saveTitle = useDebouncedCallback(async (next: string) => {
    setSaveStatus('saving')
    try {
      await updateDocumentTitle(currentUser.id, document.id, next)
      setSaveStatus('saved')
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
      <div className="editor-header">
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
        <span className="save-status">
          {saveStatus === 'saving' && 'Saving…'}
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'error' && 'Failed to save'}
        </span>
      </div>
      {isOwner && <ShareControl documentId={document.id} />}
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="editor-content" />
    </div>
  )
}

export function DocumentEditorPage({
  documentId,
  onBack,
}: {
  documentId: number
  onBack: () => void
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

  return (
    <div>
      <button type="button" onClick={onBack} className="back-button">
        ← Back to documents
      </button>
      {error && <p className="error-text">{error}</p>}
      {!error && !document && <p>Loading…</p>}
      {document && <EditorBody key={document.id} document={document} />}
    </div>
  )
}
