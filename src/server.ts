import { app } from './app'
import { AppDataSource } from './database/data-source'
import { env } from './env'

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize()

  app.listen(env.PORT, () => {
    console.log(`Servidor rodando na porta ${env.PORT}`)
  })
}

bootstrap().catch((error: unknown) => {
  console.error('Falha ao iniciar o servidor: ', error)
  process.exitCode = 1
})
