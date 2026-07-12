import { type Post } from '../../entities/post.entity'
import { AppError } from '../../errors/app-error'
import {
  type PostRepositoryInterface,
  type UpdatePostData,
} from '../../repositories/post-repository.interface'

export class UpdatePostUseCase {
  constructor(private readonly postsRepository: PostRepositoryInterface) {}

  async execute(
    id: string,
    authorId: string,
    data: UpdatePostData,
  ): Promise<Post> {
    const post = await this.postsRepository.findById(id)

    if (post === null) {
      throw new AppError('Post não encontrado', 404)
    }

    if (post.authorId !== authorId) {
      throw new AppError('Acesso proibido', 403)
    }

    const updatedPost = await this.postsRepository.update(id, data)

    if (updatedPost === null) {
      throw new AppError('Post não encontrado', 404)
    }

    return updatedPost
  }
}
