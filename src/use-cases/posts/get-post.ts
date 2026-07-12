import { type Post } from '../../entities/post.entity'
import { AppError } from '../../errors/app-error'
import { type PostRepositoryInterface } from '../../repositories/post-repository.interface'

export class GetPostUseCase {
  constructor(private readonly postsRepository: PostRepositoryInterface) {}

  async execute(id: string): Promise<Post> {
    const post = await this.postsRepository.findById(id)

    if (post === null) {
      throw new AppError('Post não encontrado', 404)
    }

    return post
  }
}
