import { TypeOrmUserRepository } from '../../repositories/typeorm/typeorm-user-repository'
import { SigninUseCase } from '../auth/signin'

export function makeSigninUseCase(): SigninUseCase {
  const usersRepository = new TypeOrmUserRepository()

  return new SigninUseCase(usersRepository)
}
