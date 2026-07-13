import 'reflect-metadata'
import express from 'express'

import { authRoutes } from './http/controllers/auth/routes'
import { postsRoutes } from './http/controllers/posts/routes'
import { errorHandler } from './http/middlewares/error-handler'
import { metricsMiddleware } from './http/middlewares/metrics'
import { metricsRegistry } from './observability/metrics'

export const app = express()

app.use(express.json())
app.use(metricsMiddleware)

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ativo' })
})

app.get('/metrics', async (_request, response) => {
  response.setHeader('Content-Type', metricsRegistry.contentType)
  response.send(await metricsRegistry.metrics())
})

app.use('/auth', authRoutes)
app.use('/posts', postsRoutes)

app.use(errorHandler)
