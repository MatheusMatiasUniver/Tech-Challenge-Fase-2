# Tech Challenge Fase 2 - Blogging API

API REST para uma plataforma de blogging voltada a docentes e alunos. Docentes autenticados criam e gerenciam posts; alunos e demais usuarios podem consultar e pesquisar o conteudo publicado.

## 1. Sobre o Projeto

O projeto atende ao Tech Challenge da FIAP com uma API Node.js persistida em PostgreSQL. A aplicacao oferece autenticacao por JWT, CRUD de posts, busca por titulo ou conteudo, testes automatizados, Docker e verificacoes de CI.

## 2. Arquitetura do Projeto

O projeto segue o padrao arquitetural adotado como referencia no Pettech:

```text
Route -> Controller -> Use-case -> Repository interface -> TypeORM repository -> Entity -> PostgreSQL
```

Responsabilidades principais:

- `src/http/controllers/`: recebe HTTP, valida entrada e serializa respostas.
- `src/http/controllers/<resource>/routes.ts`: registra endpoints e middlewares.
- `src/use-cases/`: concentra regras de negocio, como autoria de posts e login.
- `src/repositories/`: define contratos de persistencia.
- `src/repositories/typeorm/`: implementa os contratos com TypeORM.
- `src/use-cases/factory/`: monta use-cases com suas dependencias concretas.
- `src/entities/`: mapeia entidades TypeORM.
- `src/database/`: concentra DataSource, migrations e seed.

## 3. Schemas e Banco de Dados

Convencoes utilizadas:

- tabelas em ingles;
- colunas de dominio em portugues;
- propriedades TypeScript em ingles;
- timestamps padronizados como `created_at` e `updated_at`.

### `users`

| Coluna | Tipo | Descricao |
|---|---|---|
| `id` | UUID | Identificador do usuario, com default `gen_random_uuid()` |
| `nome` | varchar(150) | Nome do usuario |
| `email` | varchar(255) | Email unico para autenticacao |
| `senha_hash` | varchar(255) | Hash bcrypt da senha |
| `created_at` | timestamptz | Data de criacao |
| `updated_at` | timestamptz | Data da ultima atualizacao |

### `posts`

| Coluna | Tipo | Descricao |
|---|---|---|
| `id` | UUID | Identificador do post, com default `gen_random_uuid()` |
| `titulo` | varchar(255) | Titulo do post |
| `conteudo` | text | Conteudo do post |
| `autor_id` | UUID | Chave estrangeira para `users.id` |
| `created_at` | timestamptz | Data de criacao |
| `updated_at` | timestamptz | Data da ultima atualizacao |

Migrations sao a unica forma de evoluir o schema. `synchronize` fica desabilitado para evitar alteracoes automaticas no banco.

## 4. Tecnologias Utilizadas

- Node.js e TypeScript
- Express
- PostgreSQL e TypeORM
- Zod
- bcryptjs e jsonwebtoken
- Jest e Supertest
- Docker e Docker Compose
- Prometheus, Grafana e prom-client
- GitHub Actions

## 5. Rotas e Metodos HTTP

### Healthcheck

| Metodo | Rota | Autenticacao | Descricao |
|---|---|---|---|
| `GET` | `/health` | Nao | Verifica se a API esta ativa |
| `GET` | `/metrics` | Nao | Expoe metricas no formato Prometheus |

### Autenticacao

| Metodo | Rota | Autenticacao | Descricao |
|---|---|---|---|
| `POST` | `/auth/login` | Nao | Retorna um access token Bearer |

Corpo do login:

```json
{
  "email": "professor@exemplo.com",
  "password": "123456"
}
```

### Posts

| Metodo | Rota | Autenticacao | Descricao |
|---|---|---|---|
| `GET` | `/posts` | Nao | Lista posts por data de criacao |
| `GET` | `/posts/:id` | Nao | Retorna um post pelo id |
| `GET` | `/posts/search?q=termo` | Nao | Busca em titulo e conteudo |
| `POST` | `/posts` | Bearer | Cria um post para o usuario autenticado |
| `PUT` | `/posts/:id` | Bearer | Atualiza post do proprio autor |
| `DELETE` | `/posts/:id` | Bearer | Remove post do proprio autor |

Exemplo de criacao:

```http
POST /posts
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "title": "Meu primeiro post",
  "content": "Conteudo do post."
}
```

O autor e definido pelo JWT; `authorId` nao deve ser enviado no corpo da requisicao.

## 6. Containers

O Compose sobe quatro containers separados e reproduziveis:

| Servico | Porta no container | Porta no host |
|---|---:|---:|
| API | `3001` | `3001` |
| PostgreSQL | `5432` | `5433` |
| Prometheus | `9090` | `9090` |
| Grafana | `3000` | `3002` |

O servico `api` aguarda o healthcheck do PostgreSQL. Em seguida executa migrations, seed e inicia o servidor. Os dados do banco ficam no volume `tech-challenge_postgres_data_v2`. Prometheus e Grafana possuem volumes proprios para manter metricas e configuracoes entre reinicializacoes.

## 7. Testes e Cobertura

Comandos disponiveis:

```bash
npm test
npm run test:coverage
npm run lint
npm run typecheck
npm run build
```

O Jest exige cobertura minima global de 20% para linhas e statements. A cobertura atual e superior a 65% em ambas as metricas.

Os testes cobrem login, credenciais invalidas, middleware JWT, validacao HTTP, protecao de rotas e regra de autoria de posts.

## 8. CI/CD

O workflow em `.github/workflows/ci.yml` executa em pushes e pull requests para `main` e `master`:

1. `npm ci`
2. lint
3. typecheck
4. testes com cobertura
5. build

O CI esta implementado. Deploy continuo ainda nao foi configurado.

## 9. Como Executar o Projeto

### Execucao local

1. Crie o ambiente a partir do exemplo:

   ```bash
   cp .env.example .env
   ```

2. Defina um `JWT_SECRET` aleatorio e configure a conexao PostgreSQL local no `.env`.

3. Instale dependencias e prepare o banco:

   ```bash
   npm install
   npm run migration:run
   npm run seed
   ```

4. Inicie a API:

   ```bash
   npm run dev
   ```

### Execucao com Docker

```bash
docker compose up --build -d
curl http://localhost:3001/health
```

Servicos disponiveis apos a subida:

| Servico | URL |
|---|---|
| API healthcheck | `http://localhost:3001/health` |
| Metricas | `http://localhost:3001/metrics` |
| Prometheus | `http://localhost:9090` |
| Grafana | `http://localhost:3002` |

O Grafana inicia com usuario `admin` e senha `admin`. Defina `GRAFANA_ADMIN_PASSWORD` no ambiente para substituir a senha local padrao.

Para parar os containers sem apagar os dados:

```bash
docker compose down
```

Para remover tambem o volume do banco Docker:

```bash
docker compose down -v
```

## 10. Observabilidade

A observabilidade segue o mesmo fluxo usado como referencia no Pettech, adaptado para Express:

```text
API Express (/metrics) -> Prometheus -> Grafana
```

O modulo `src/observability/metrics.ts` usa `prom-client` para expor metricas padrao do Node.js e as metricas HTTP abaixo:

- `tech_challenge_http_requests_total`: total de requisicoes por metodo, rota e status HTTP;
- `tech_challenge_http_request_duration_seconds`: histograma de latencia por metodo, rota e status;
- `tech_challenge_http_requests_in_progress`: requisicoes em andamento por metodo e rota.

Os identificadores de recursos nao entram nos labels. Por exemplo, uma chamada a `/posts/<uuid>` e registrada como `/posts/:id`, evitando alta cardinalidade no Prometheus. O endpoint `/metrics` nao e instrumentado para que o scrape nao altere os indicadores da API.

O datasource do Grafana e o dashboard `Tech Challenge API` sao provisionados automaticamente. O dashboard apresenta requisicoes por rota, erros HTTP, latencia p95, requisicoes em andamento e memoria do processo Node.js.

