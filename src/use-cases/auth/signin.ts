import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'

import { env } from '../../env'
import { AppError } from '../../errors/app-error'
import { type UserRepositoryInterface } from '../../repositories/user-repository.interface'

interface SignInUseCaseResponse {
  accessToken: string
  tokenType: 'Bearer'
}

export class SigninUseCase {
  constructor(private readonly usersRepository: UserRepositoryInterface) {}

  async execute(
    email: string,
    password: string,
  ): Promise<SignInUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (user === null) {
      throw new AppError('Credenciais inválidas', 401)
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatches) {
      throw new AppError('Credenciais inválidas', 401)
    }

    const accessToken = jwt.sign({ sub: user.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    })

    return {
      accessToken,
      tokenType: 'Bearer',
    }
  }
}
