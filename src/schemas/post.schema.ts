import { z } from 'zod'

export const createPostSchema = z.object({
  content: z.string().trim().min(1),
  title: z.string().trim().min(1).max(255),
})

export const updatePostSchema = createPostSchema
  .partial()
  .refine((data) => data.content !== undefined || data.title !== undefined, {
    message: 'Informe ao menos um campo para atualização',
  })

export const searchPostsSchema = z.object({
  q: z.string().trim().min(1),
})
