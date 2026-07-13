import type { OpenAPIV3 } from 'openapi-types'

export const openApiDocument: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    description:
      'API REST para uma plataforma de blogging voltada a docentes e alunos.',
    title: 'Tech Challenge Blogging API',
    version: '1.0.0',
  },
  tags: [{ name: 'Autenticação' }, { name: 'Posts' }, { name: 'Operação' }],
  paths: {
    '/health': {
      get: {
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Health' },
              },
            },
            description: 'API ativa.',
          },
        },
        summary: 'Verifica a disponibilidade da API',
        tags: ['Operação'],
      },
    },
    '/metrics': {
      get: {
        responses: {
          '200': {
            content: {
              'text/plain': {
                schema: { type: 'string' },
              },
            },
            description: 'Métricas no formato Prometheus.',
          },
        },
        summary: 'Expõe métricas Prometheus',
        tags: ['Operação'],
      },
    },
    '/auth/login': {
      post: {
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
          required: true,
        },
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
            description: 'Autenticação realizada.',
          },
          '400': { $ref: '#/components/responses/InvalidRequest' },
          '401': { $ref: '#/components/responses/InvalidCredentials' },
        },
        summary: 'Autentica um usuário',
        tags: ['Autenticação'],
      },
    },
    '/posts': {
      get: {
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Posts' },
              },
            },
            description: 'Lista de posts.',
          },
        },
        summary: 'Lista posts por data de criação',
        tags: ['Posts'],
      },
      post: {
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePostRequest' },
            },
          },
          required: true,
        },
        responses: {
          '201': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Post' },
              },
            },
            description: 'Post criado.',
          },
          '400': { $ref: '#/components/responses/InvalidRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
        security: [{ bearerAuth: [] }],
        summary: 'Cria um post para o usuário autenticado',
        tags: ['Posts'],
      },
    },
    '/posts/search': {
      get: {
        parameters: [
          {
            in: 'query',
            name: 'q',
            required: true,
            schema: { minLength: 1, type: 'string' },
          },
        ],
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Posts' },
              },
            },
            description: 'Posts encontrados por título ou conteúdo.',
          },
          '400': { $ref: '#/components/responses/InvalidRequest' },
        },
        summary: 'Busca posts por título ou conteúdo',
        tags: ['Posts'],
      },
    },
    '/posts/{id}': {
      get: {
        parameters: [{ $ref: '#/components/parameters/PostId' }],
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Post' },
              },
            },
            description: 'Post encontrado.',
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
        summary: 'Retorna um post pelo identificador',
        tags: ['Posts'],
      },
      put: {
        parameters: [{ $ref: '#/components/parameters/PostId' }],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePostRequest' },
            },
          },
          required: true,
        },
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Post' },
              },
            },
            description: 'Post atualizado.',
          },
          '400': { $ref: '#/components/responses/InvalidRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
        security: [{ bearerAuth: [] }],
        summary: 'Atualiza um post do próprio autor',
        tags: ['Posts'],
      },
      delete: {
        parameters: [{ $ref: '#/components/parameters/PostId' }],
        responses: {
          '204': { description: 'Post removido.' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
        security: [{ bearerAuth: [] }],
        summary: 'Remove um post do próprio autor',
        tags: ['Posts'],
      },
    },
  },
  components: {
    parameters: {
      PostId: {
        in: 'path',
        name: 'id',
        required: true,
        schema: { format: 'uuid', type: 'string' },
      },
    },
    responses: {
      Forbidden: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
        description: 'O usuário autenticado não é o autor do post.',
      },
      InvalidCredentials: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
        description: 'Email ou senha inválidos.',
      },
      InvalidRequest: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
        description: 'Dados da requisição inválidos.',
      },
      NotFound: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
        description: 'Post não encontrado.',
      },
      Unauthorized: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
        description: 'Token Bearer ausente ou inválido.',
      },
    },
    schemas: {
      CreatePostRequest: {
        example: { content: 'Conteúdo do post.', title: 'Meu primeiro post' },
        properties: {
          content: { minLength: 1, type: 'string' },
          title: { maxLength: 255, minLength: 1, type: 'string' },
        },
        required: ['title', 'content'],
        type: 'object',
      },
      Error: {
        example: { message: 'Dados da requisição inválidos' },
        properties: { message: { type: 'string' } },
        required: ['message'],
        type: 'object',
      },
      Health: {
        example: { status: 'ativo' },
        properties: { status: { example: 'ativo', type: 'string' } },
        required: ['status'],
        type: 'object',
      },
      LoginRequest: {
        example: { email: 'professor@exemplo.com', password: '123456' },
        properties: {
          email: { format: 'email', type: 'string' },
          password: { minLength: 1, type: 'string' },
        },
        required: ['email', 'password'],
        type: 'object',
      },
      LoginResponse: {
        properties: {
          access_token: { type: 'string' },
          token_type: { example: 'Bearer', type: 'string' },
        },
        required: ['access_token', 'token_type'],
        type: 'object',
      },
      Post: {
        properties: {
          author: { $ref: '#/components/schemas/PostAuthor' },
          authorId: { format: 'uuid', type: 'string' },
          content: { type: 'string' },
          createdAt: { format: 'date-time', type: 'string' },
          id: { format: 'uuid', type: 'string' },
          title: { type: 'string' },
          updatedAt: { format: 'date-time', type: 'string' },
        },
        required: [
          'id',
          'title',
          'content',
          'authorId',
          'createdAt',
          'updatedAt',
        ],
        type: 'object',
      },
      PostAuthor: {
        properties: {
          email: { format: 'email', type: 'string' },
          id: { format: 'uuid', type: 'string' },
          name: { type: 'string' },
        },
        required: ['id', 'name', 'email'],
        type: 'object',
      },
      Posts: {
        items: { $ref: '#/components/schemas/Post' },
        type: 'array',
      },
      UpdatePostRequest: {
        example: { title: 'Título atualizado' },
        minProperties: 1,
        properties: {
          content: { minLength: 1, type: 'string' },
          title: { maxLength: 255, minLength: 1, type: 'string' },
        },
        type: 'object',
      },
    },
    securitySchemes: {
      bearerAuth: {
        bearerFormat: 'JWT',
        scheme: 'bearer',
        type: 'http',
      },
    },
  },
}
