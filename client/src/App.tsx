import { useState } from 'react'
import { DocumentEditorPage } from './components/DocumentEditorPage'
import { DocumentList } from './components/DocumentList'

function App() {
  const [openDocumentId, setOpenDocumentId] = useState<number | null>(null)

  if (openDocumentId !== null) {
    return (
      <DocumentEditorPage
        documentId={openDocumentId}
        onBack={() => setOpenDocumentId(null)}
      />
    )
  }

  return <DocumentList onOpen={setOpenDocumentId} />
}

export default App
