import { type Post } from '../../entities/post.entity'
import {
  type CreatePostData,
  type PostRepositoryInterface,
} from '../../repositories/post-repository.interface'

export class CreatePostUseCase {
  constructor(private readonly postsRepository: PostRepositoryInterface) {}

  async execute(data: CreatePostData): Promise<Post> {
    return this.postsRepository.create(data)
  }
}
