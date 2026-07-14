import { type NextFunction, type Request, type Response } from 'express'
import { ZodError } from 'zod'

import { AppError } from '../../../errors/app-error'
import {
  createPostSchema,
  postIdSchema,
  searchPostsSchema,
  updatePostSchema,
} from '../../../schemas/post.schema'
import {
  makeCreatePostUseCase,
  makeDeletePostUseCase,
  makeGetPostUseCase,
  makeListPostsUseCase,
  makeSearchPostsUseCase,
  makeUpdatePostUseCase,
} from '../../../use-cases/factory/make-post-use-cases'
import { serializePost } from './post-response'

function forwardError(error: unknown, next: NextFunction): void {
  if (error instanceof ZodError) {
    next(new AppError('Dados da requisição inválidos', 400))
    return
  }

  next(error)
}

function getAuthenticatedUserId(request: Request): string {
  if (request.userId === undefined) {
    throw new AppError('Não autorizado', 401)
  }

  return request.userId
}

function getPostId(request: Request): string {
  return postIdSchema.parse(request.params.id)
}

export async function createPost(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = createPostSchema.parse(request.body)
    const post = await makeCreatePostUseCase().execute({
      ...data,
      authorId: getAuthenticatedUserId(request),
    })

    response.status(201).json(serializePost(post))
  } catch (error) {
    forwardError(error, next)
  }
}

export async function deletePost(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await makeDeletePostUseCase().execute(
      getPostId(request),
      getAuthenticatedUserId(request),
    )

    response.status(204).send()
  } catch (error) {
    forwardError(error, next)
  }
}

export async function getPost(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const post = await makeGetPostUseCase().execute(getPostId(request))

    response.status(200).json(serializePost(post))
  } catch (error) {
    forwardError(error, next)
  }
}

export async function listPosts(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const posts = await makeListPostsUseCase().execute()

    response.status(200).json(posts.map(serializePost))
  } catch (error) {
    forwardError(error, next)
  }
}

export async function searchPosts(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { q } = searchPostsSchema.parse(request.query)
    const posts = await makeSearchPostsUseCase().execute(q)

    response.status(200).json(posts.map(serializePost))
  } catch (error) {
    forwardError(error, next)
  }
}

export async function updatePost(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = updatePostSchema.parse(request.body)
    const post = await makeUpdatePostUseCase().execute(
      getPostId(request),
      getAuthenticatedUserId(request),
      data,
    )

    response.status(200).json(serializePost(post))
  } catch (error) {
    forwardError(error, next)
  }
}
