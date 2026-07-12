import express from 'express'
import jwt from 'jsonwebtoken'
import request from 'supertest'

import { app } from '../../src/app'
import { env } from '../../src/env'
import { errorHandler } from '../../src/http/middlewares/error-handler'
import { jwtValidate } from '../../src/http/middlewares/jwt-validate'

describe('authentication HTTP flow', () => {
  it('returns 400 when login body is invalid', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'invalid', password: '' })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ message: 'Dados da requisição inválidos' })
  })

  it('rejects a protected route without a Bearer token', async () => {
    const protectedApp = express()

    protectedApp.get('/protected', jwtValidate, (req, res) => {
      res.status(200).json({ userId: req.userId })
    })
    protectedApp.use(errorHandler)

    const response = await request(protectedApp).get('/protected')

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ message: 'Não autorizado' })
  })

  it('accepts a valid Bearer token on a protected route', async () => {
    const protectedApp = express()
    const userId = '7d204c96-cb9a-4fa9-bae6-0d0cfb5d8d46'

    protectedApp.get('/protected', jwtValidate, (req, res) => {
      res.status(200).json({ userId: req.userId })
    })
    protectedApp.use(errorHandler)

    const token = jwt.sign({ sub: userId }, env.JWT_SECRET)
    const response = await request(protectedApp)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ userId })
  })
})
