'use client'

import { useRef } from 'react'

interface ContentToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (newValue: string) => void
}

export default function ContentToolbar({ textareaRef, value, onChange }: ContentToolbarProps) {
  function insertAtSelection(before: string, after: string = '', placeholder: string = '') {
    const el = textareaRef.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end) || placeholder

    const newValue = value.slice(0, start) + before + selected + after + value.slice(end)
    onChange(newValue)

    setTimeout(() => {
      el.focus()
      const cursorStart = start + before.length
      const cursorEnd = cursorStart + selected.length
      el.setSelectionRange(cursorStart, cursorEnd)
    }, 0)
  }

  function insertAtLineStart(prefix: string) {
    const el = textareaRef.current
    if (!el) return

    const start = el.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1

    const newValue = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    onChange(newValue)

    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, start + prefix.length)
    }, 0)
  }

  function handleBold() {
    insertAtSelection('**', '**', 'bold text')
  }

  function handleHeading(level: 1 | 2) {
    insertAtLineStart(level === 1 ? '# ' : '## ')
  }

  function handleLink() {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selectedText = value.slice(start, end) || 'link text'

    const url = window.prompt('Link URL:', 'https://')
    if (!url) return

    const newValue = value.slice(0, start) + `[${selectedText}](${url})` + value.slice(end)
    onChange(newValue)

    setTimeout(() => {
      el.focus()
      const cursorPos = start + `[${selectedText}](${url})`.length
      el.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  function handleImage() {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart

    const url = window.prompt('Image URL (e.g. a GitHub raw link):', 'https://')
    if (!url) return
    const alt = window.prompt('Alt text (optional, describes the image):', '') || ''

    const needsLeadingNewline = start > 0 && value[start - 1] !== '\n'
    const needsTrailingNewline = start < value.length && value[start] !== '\n'
    const insertion = `${needsLeadingNewline ? '\n' : ''}![${alt}](${url})${needsTrailingNewline ? '\n' : ''}`

    const newValue = value.slice(0, start) + insertion + value.slice(start)
    onChange(newValue)

    setTimeout(() => {
      el.focus()
      const cursorPos = start + insertion.length
      el.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  const btnClass = "px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.85)] hover:border-neon-cyan hover:text-neon-cyan transition"

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <button type="button" onClick={handleBold} className={btnClass} title="Bold">
        <strong>B</strong>
      </button>
      <button type="button" onClick={() => handleHeading(1)} className={btnClass} title="Heading 1">
        H1
      </button>
      <button type="button" onClick={() => handleHeading(2)} className={btnClass} title="Heading 2">
        H2
      </button>
      <button type="button" onClick={handleLink} className={btnClass} title="Insert link">
        🔗 Link
      </button>
      <button type="button" onClick={handleImage} className={btnClass} title="Insert image">
        🖼️ Image
      </button>
    </div>
  )
}
