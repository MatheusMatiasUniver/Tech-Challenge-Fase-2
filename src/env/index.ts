import 'dotenv/config'
import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_HOST: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_PORT: z.coerce.number().int().positive(),
  DATABASE_USER: z.string().min(1),
  JWT_EXPIRES_IN: z.string().min(1).default('1h'),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
})

export type Env = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)
