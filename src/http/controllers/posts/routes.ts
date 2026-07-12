import { Router } from 'express'

import { jwtValidate } from '../../middlewares/jwt-validate'
import {
  createPost,
  deletePost,
  getPost,
  listPosts,
  searchPosts,
  updatePost,
} from './posts'

export const postsRoutes = Router()

postsRoutes.get('/', listPosts)
postsRoutes.get('/search', searchPosts)
postsRoutes.get('/:id', getPost)
postsRoutes.post('/', jwtValidate, createPost)
postsRoutes.put('/:id', jwtValidate, updatePost)
postsRoutes.delete('/:id', jwtValidate, deletePost)
