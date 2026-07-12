import { AppDataSource } from '../../database/data-source'
import { User } from '../../entities/user.entity'
import {
  type CreateUserData,
  type UserRepositoryInterface,
} from '../user-repository.interface'

export class TypeOrmUserRepository implements UserRepositoryInterface {
  private readonly repository = AppDataSource.getRepository(User)

  async create(data: CreateUserData): Promise<User> {
    const user = this.repository.create(data)

    return this.repository.save(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email })
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOneBy({ id })
  }
}
