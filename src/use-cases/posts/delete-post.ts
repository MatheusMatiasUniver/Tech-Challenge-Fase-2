import { AppError } from '../../errors/app-error'
import { type PostRepositoryInterface } from '../../repositories/post-repository.interface'

export class DeletePostUseCase {
  constructor(private readonly postsRepository: PostRepositoryInterface) {}

  async execute(id: string, authorId: string): Promise<void> {
    const post = await this.postsRepository.findById(id)

    if (post === null) {
      throw new AppError('Post não encontrado', 404)
    }

    if (post.authorId !== authorId) {
      throw new AppError('Acesso proibido', 403)
    }

    await this.postsRepository.delete(id)
  }
}
