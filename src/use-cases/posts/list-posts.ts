import { type Post } from '../../entities/post.entity'
import { type PostRepositoryInterface } from '../../repositories/post-repository.interface'

export class ListPostsUseCase {
  constructor(private readonly postsRepository: PostRepositoryInterface) {}

  async execute(): Promise<Post[]> {
    return this.postsRepository.findAll()
  }
}
