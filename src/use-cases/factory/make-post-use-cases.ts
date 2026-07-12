import { TypeOrmPostRepository } from '../../repositories/typeorm/typeorm-post-repository'
import { CreatePostUseCase } from '../posts/create-post'
import { DeletePostUseCase } from '../posts/delete-post'
import { GetPostUseCase } from '../posts/get-post'
import { ListPostsUseCase } from '../posts/list-posts'
import { SearchPostsUseCase } from '../posts/search-posts'
import { UpdatePostUseCase } from '../posts/update-post'

export function makeCreatePostUseCase(): CreatePostUseCase {
  return new CreatePostUseCase(new TypeOrmPostRepository())
}

export function makeDeletePostUseCase(): DeletePostUseCase {
  return new DeletePostUseCase(new TypeOrmPostRepository())
}

export function makeGetPostUseCase(): GetPostUseCase {
  return new GetPostUseCase(new TypeOrmPostRepository())
}

export function makeListPostsUseCase(): ListPostsUseCase {
  return new ListPostsUseCase(new TypeOrmPostRepository())
}

export function makeSearchPostsUseCase(): SearchPostsUseCase {
  return new SearchPostsUseCase(new TypeOrmPostRepository())
}

export function makeUpdatePostUseCase(): UpdatePostUseCase {
  return new UpdatePostUseCase(new TypeOrmPostRepository())
}
