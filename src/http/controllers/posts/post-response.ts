import { type Post } from '../../../entities/post.entity'

export function serializePost(post: Post): object {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    authorId: post.authorId,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author:
      post.author === undefined
        ? undefined
        : {
            id: post.author.id,
            name: post.author.name,
            email: post.author.email,
          },
  }
}
