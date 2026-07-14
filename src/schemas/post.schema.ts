import { z } from 'zod'

export const createPostSchema = z.object({
  title: z.string().trim().min(1).max(255),
  content: z.string().trim().min(1),
})

export const updatePostSchema = createPostSchema
  .partial()
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: 'Informe ao menos um campo para atualização',
  })

export const searchPostsSchema = z.object({
  q: z.string().trim().min(1),
})
