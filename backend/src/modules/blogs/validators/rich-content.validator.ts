import z from 'zod'

const markSchema = z
  .object({
    type: z.string().trim().min(1).max(50),
    attrs: z.record(z.unknown()).optional()
  })
  .passthrough()

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
      if (node.type === 'text' && typeof node.text !== 'string') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Text node must include text'
        })
      }

      if (node.type === 'heading') {
        const level = node.attrs?.level
        if (level !== 1 && level !== 2 && level !== 3) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Heading level must be 1, 2, or 3'
          })
        }
      }

      if ((node.type === 'mathInline' || node.type === 'mathBlock') && typeof node.attrs?.latex !== 'string') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Math node must include attrs.latex'
        })
      }

      if (node.type === 'youtube' && typeof node.attrs?.url !== 'string') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'YouTube node must include attrs.url'
        })
      }

      if (node.type === 'image' && node.attrs?.src && !node.attrs.mediaId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Image node should reference mediaId instead of permanent src'
        })
      }
    })
)

export const richContentSchema = z
  .object({
    type: z.literal('doc'),
    content: z.array(richNodeSchema).max(2000)
  })
  .strict()
