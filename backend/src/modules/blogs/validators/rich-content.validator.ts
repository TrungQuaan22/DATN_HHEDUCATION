import z from 'zod'

const allowedMarks = new Set(['bold', 'italic', 'underline', 'strike', 'code', 'link'])
const allowedNodes = new Set([
  'paragraph',
  'text',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'blockquote',
  'codeBlock',
  'hardBreak',
  'horizontalRule',
  'image'
])

const markSchema = z
  .object({
    type: z.string().trim().min(1).max(50),
    attrs: z.record(z.unknown()).optional()
  })
  .passthrough()
  .superRefine((mark, ctx) => {
    if (!allowedMarks.has(mark.type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Unsupported mark: ${mark.type}` })
    }
    if (mark.type === 'link' && typeof mark.attrs?.href !== 'string') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Link mark must include attrs.href' })
    }
  })

type RichNode = {
  type: string
  attrs?: Record<string, unknown>
  text?: string
  marks?: Array<z.infer<typeof markSchema>>
  content?: RichNode[]
}

const baseNodeSchema = z
  .object({
    type: z.string().trim().min(1).max(50),
    attrs: z.record(z.unknown()).optional()
  })
  .passthrough()

export const richNodeSchema: z.ZodType<RichNode> = z.lazy(() =>
  baseNodeSchema
    .extend({
      text: z.string().max(20000).optional(),
      marks: z.array(markSchema).max(20).optional(),
      content: z.array(richNodeSchema).max(1000).optional()
    })
    .superRefine((node, ctx) => {
      if (!allowedNodes.has(node.type)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Unsupported node: ${node.type}` })
      }
      if (node.type === 'text' && typeof node.text !== 'string') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Text node must include text'
        })
      }

      if (node.type === 'heading') {
        const level = node.attrs?.level
        if (level !== 2 && level !== 3) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Heading level must be 2 or 3'
          })
        }
        if (node.attrs?.id !== undefined && (typeof node.attrs.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(node.attrs.id))) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Heading must include a URL-safe attrs.id' })
        }
      }



      if (node.type === 'image') {
        if (typeof node.attrs?.mediaId !== 'string' || !z.string().uuid().safeParse(node.attrs.mediaId).success) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Image must include a valid attrs.mediaId' })
        }
        if (typeof node.attrs?.src !== 'string' || !z.string().url().safeParse(node.attrs.src).success) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Image must include a valid attrs.src' })
        }
      }
    })
)

export const richContentSchema = z
  .object({
    type: z.literal('doc'),
    content: z.array(richNodeSchema).max(2000)
  })
  .strict()
