import { FilterXSS } from 'xss'

/**
 * Cleans news article HTML from the Tiptap editor before rendering.
 * Pure CommonJS (no jsdom), so it runs in any Node version on Vercel.
 */

const STYLE_AND_CLASS = ['style', 'class']

const filter = new FilterXSS({
  whiteList: {
    p: STYLE_AND_CLASS,
    h1: STYLE_AND_CLASS,
    h2: STYLE_AND_CLASS,
    h3: STYLE_AND_CLASS,
    strong: STYLE_AND_CLASS,
    em: STYLE_AND_CLASS,
    u: STYLE_AND_CLASS,
    s: STYLE_AND_CLASS,
    span: STYLE_AND_CLASS,
    mark: [...STYLE_AND_CLASS, 'data-color'],
    ul: STYLE_AND_CLASS,
    ol: STYLE_AND_CLASS,
    li: STYLE_AND_CLASS,
    br: [],
    a: ['href', 'target', 'rel', ...STYLE_AND_CLASS],
    img: ['src', 'alt', ...STYLE_AND_CLASS],
  },
  // Only the inline styles the editor produces (colour, highlight, alignment, font)
  css: {
    whiteList: {
      color: true,
      'background-color': true,
      'text-align': true,
      'font-family': true,
    },
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed'],
  onTagAttr(tag, name, value) {
    // Links and images: only http(s), relative URLs and mailto
    if ((name === 'href' || name === 'src') && !/^(https?:\/\/|\/(?!\/)|#|mailto:)/i.test(value.trim())) {
      return ''
    }
    return undefined
  },
})

export function sanitizeArticleHtml(html: string): string {
  return filter.process(html)
}
