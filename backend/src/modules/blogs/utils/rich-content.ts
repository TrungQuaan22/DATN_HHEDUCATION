import type { Prisma } from '@prisma/client'
import { createSlugFromText } from '~/common/utils/slug'
import { normalizeText } from '~/common/utils/search'

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

const collectImageMediaIds = (node: unknown, mediaIds: Set<string>): void => {
  if (!node || typeof node !== 'object') return
  const richNode = node as RichNode
  if (richNode.type === 'image' && typeof richNode.attrs?.mediaId === 'string') {
    mediaIds.add(richNode.attrs.mediaId)
  }
  if (Array.isArray(richNode.content)) {
    richNode.content.forEach((child) => collectImageMediaIds(child, mediaIds))
  }
}

export const getRichContentMediaIds = (content: unknown): string[] => {
  const mediaIds = new Set<string>()
  collectImageMediaIds(content, mediaIds)
  return [...mediaIds]
}

export const normalizeRichContentHeadingIds = (content: unknown): unknown => {
  if (!content || typeof content !== 'object') return content
  const document = content as RichNode
  if (!Array.isArray(document.content)) return content

  const usedIds = new Map<string, number>()
  const normalizedNodes = document.content.map((node) => {
    if (!node || typeof node !== 'object' || node.type !== 'heading') return node
    const headingText = collectText(node).replace(/\s+/g, ' ').trim()
    const baseId = createSlugFromText(normalizeText(headingText)) || 'muc'
    const count = (usedIds.get(baseId) ?? 0) + 1
    usedIds.set(baseId, count)
    return {
      ...node,
      attrs: {
        ...node.attrs,
        id: count === 1 ? baseId : `${baseId}-${count}`
      }
    }
  })

  return { ...document, content: normalizedNodes }
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
