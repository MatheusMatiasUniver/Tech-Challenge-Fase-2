import { Router } from 'express'

import { signin } from './signin'

export const authRoutes = Router()

authRoutes.post('/login', signin)
