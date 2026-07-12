import { type NextFunction, type Request, type Response } from 'express'
import jwt, { type JwtPayload } from 'jsonwebtoken'

import { env } from '../../env'
import { AppError } from '../../errors/app-error'

export function jwtValidate(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const authorization = request.headers.authorization

  if (authorization === undefined) {
    next(new AppError('Não autorizado', 401))
    return
  }

  const [scheme, token] = authorization.split(' ')

  if (scheme !== 'Bearer' || token === undefined || token.length === 0) {
    next(new AppError('Não autorizado', 401))
    return
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET)

    if (typeof payload === 'string' || payload.sub === undefined) {
      next(new AppError('Não autorizado', 401))
      return
    }

    request.userId = (payload as JwtPayload).sub
    next()
  } catch {
    next(new AppError('Não autorizado', 401))
  }
}
