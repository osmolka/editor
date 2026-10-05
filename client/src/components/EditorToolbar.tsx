import type { Editor } from '@tiptap/react'

function ToolbarButton({
  onClick,
  isActive,
  label,
  title,
}: {
  onClick: () => void
  isActive: boolean
  label: string
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={title}
      title={title}
      className={isActive ? 'toolbar-button active' : 'toolbar-button'}
    >
      {label}
    </button>
  )
}

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  return (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        <ToolbarButton
          label="B"
          title="Bold"
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="I"
          title="Italic"
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="U"
          title="Underline"
          isActive={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <ToolbarButton
          label="H1"
          title="Heading 1"
          isActive={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          label="H2"
          title="Heading 2"
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <ToolbarButton
          label="• List"
          title="Bullet list"
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="1. List"
          title="Numbered list"
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
      </div>
    </div>
  )
}
