'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import FontFamily from '@tiptap/extension-font-family'
import { useEffect } from 'react'

interface NewsEditorProps {
  content: string
  onChange: (html: string) => void
}

const FONT_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Sans', value: 'Arial, sans-serif' },
  { label: 'Monospace', value: 'monospace' },
]

const COLOR_OPTIONS = ['#ffffff', '#06b6d4', '#8b5cf6', '#f87171', '#34d399', '#fbbf24']
const HIGHLIGHT_OPTIONS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff']

export default function NewsEditor({ content, onChange }: NewsEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-neon-cyan underline' } }),
      ImageExtension.configure({ HTMLAttributes: { class: 'rounded-xl my-4 max-w-full' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[400px] px-4 py-3 focus:outline-none',
      },
    },
  })

  // Keep editor content in sync if `content` changes externally (e.g. loading an article to edit)
  useEffect(() => {
    if (editor && content !== editor.getHTML() && content !== undefined) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  if (!editor) return null

  const btnClass = (active: boolean) =>
    `px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition ${
      active
        ? 'border-neon-cyan text-neon-cyan bg-[rgba(6,182,212,0.08)]'
        : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.85)] hover:border-neon-cyan hover:text-neon-cyan'
    }`

  function setLink() {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('Link URL:', previousUrl || 'https://')
    if (url === null) return
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  function addImage() {
    const url = window.prompt('Image URL (e.g. a GitHub raw link):', 'https://')
    if (!url) return
    editor?.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div className="border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden bg-[var(--card-bg)]">
      <div className="flex flex-wrap gap-1.5 p-2 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Bold">
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Italic">
          <em>I</em>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="Underline">
          <u>U</u>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive('strike'))} title="Strikethrough">
          <s>S</s>
        </button>

        <div className="w-px bg-[rgba(255,255,255,0.08)] mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))} title="Heading 1">
          H1
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))} title="Heading 2">
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))} title="Heading 3">
          H3
        </button>

        <div className="w-px bg-[rgba(255,255,255,0.08)] mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Bullet list">
          • List
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Numbered list">
          1. List
        </button>

        <div className="w-px bg-[rgba(255,255,255,0.08)] mx-1" />

        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(editor.isActive({ textAlign: 'left' }))} title="Align left">
          ⬅
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(editor.isActive({ textAlign: 'center' }))} title="Align center">
          ⬌
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnClass(editor.isActive({ textAlign: 'right' }))} title="Align right">
          ➡
        </button>

        <div className="w-px bg-[rgba(255,255,255,0.08)] mx-1" />

        <button type="button" onClick={setLink} className={btnClass(editor.isActive('link'))} title="Insert link">
          🔗
        </button>
        <button type="button" onClick={addImage} className={btnClass(false)} title="Insert image">
          🖼️
        </button>

        <div className="w-px bg-[rgba(255,255,255,0.08)] mx-1" />

        <select
          onChange={e => {
            const val = e.target.value
            if (val) editor.chain().focus().setFontFamily(val).run()
            else editor.chain().focus().unsetFontFamily().run()
          }}
          className="text-xs rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.85)] px-2 py-1.5"
          defaultValue=""
        >
          {FONT_OPTIONS.map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
        </select>

        <div className="flex items-center gap-1 px-1">
          <span className="text-[10px] text-dim">Color:</span>
          {COLOR_OPTIONS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => editor.chain().focus().setColor(c).run()}
              className="w-5 h-5 rounded-full border border-[rgba(255,255,255,0.2)]"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>

        <div className="flex items-center gap-1 px-1">
          <span className="text-[10px] text-dim">Highlight:</span>
          {HIGHLIGHT_OPTIONS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()}
              className="w-5 h-5 rounded-full border border-[rgba(255,255,255,0.2)]"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
