import 'reflect-metadata'
import express from 'express'

import { authRoutes } from './http/controllers/auth/routes'
import { postsRoutes } from './http/controllers/posts/routes'
import { errorHandler } from './http/middlewares/error-handler'

export const app = express()

app.use(express.json())

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ativo' })
})

app.use('/auth', authRoutes)
app.use('/posts', postsRoutes)

app.use(errorHandler)
