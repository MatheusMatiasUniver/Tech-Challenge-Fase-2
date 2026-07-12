import { randomUUID } from 'node:crypto'

import bcrypt from 'bcryptjs'

import { AppDataSource } from '../data-source'
import { TypeOrmUserRepository } from '../../repositories/typeorm/typeorm-user-repository'

async function seed(): Promise<void> {
  await AppDataSource.initialize()

  try {
    const usersRepository = new TypeOrmUserRepository()
    const email = 'professor@exemplo.com'
    const existingUser = await usersRepository.findByEmail(email)

    if (existingUser !== null) {
      return
    }

    const passwordHash = await bcrypt.hash('123456', 12)

    await usersRepository.create({
      email,
      id: randomUUID(),
      name: 'Professor',
      passwordHash,
    })
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

seed().catch((error: unknown) => {
  console.error('Falha ao popular o banco de dados', error)
  process.exitCode = 1
})
