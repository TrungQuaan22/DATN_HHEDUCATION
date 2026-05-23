import type { Prisma } from '@prisma/client'

type RichNode = {
  type?: unknown
  text?: unknown
  content?: unknown
  attrs?: Record<string, unknown>
}

export type RichContent = {
  type: 'doc'
  content: RichNode[]
}

const collectText = (node: unknown): string => {
  if (!node || typeof node !== 'object') {
    return ''
  }

  const richNode = node as RichNode

  if (richNode.type === 'text' && typeof richNode.text === 'string') {
    return richNode.text
  }

  if (Array.isArray(richNode.content)) {
    return richNode.content.map(collectText).join(' ')
  }

  return ''
}

export const countRichContentWords = (content: Prisma.JsonValue): number => {
  const text = collectText(content).trim()
  if (!text) {
    return 0
  }

  return text.split(/\s+/).filter(Boolean).length
}

export const getReadingMinutes = (content: Prisma.JsonValue): number => {
  const words = countRichContentWords(content)
  return Math.max(1, Math.ceil(words / 220))
}

export const createExcerptFromContent = (content: Prisma.JsonValue, maxLength = 180): string => {
  const text = collectText(content).replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trim()}...`
}
