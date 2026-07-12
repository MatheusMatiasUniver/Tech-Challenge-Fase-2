import { type Post } from '../../entities/post.entity'
import { type PostRepositoryInterface } from '../../repositories/post-repository.interface'

export class SearchPostsUseCase {
  constructor(private readonly postsRepository: PostRepositoryInterface) {}

  async execute(query: string): Promise<Post[]> {
    return this.postsRepository.search(query)
  }
}
