# Tech Challenge Fase 2 - Blogging API

API REST para uma plataforma de blogging voltada a docentes e alunos. Docentes autenticados criam e gerenciam posts; alunos e demais usuários podem consultar e pesquisar o conteúdo publicado.

## 1. Sobre o Projeto

O projeto atende ao Tech Challenge da FIAP com uma API Node.js persistida em PostgreSQL. A aplicação oferece autenticação por JWT, CRUD de posts, busca por título ou conteúdo, testes automatizados, Docker e verificações de CI.

## 2. Arquitetura do Projeto

O projeto segue o padrão arquitetural adotado como referência no Pettech:

```text
Route -> Controller -> Use-case -> Repository interface -> TypeORM repository -> Entity -> PostgreSQL
```

Responsabilidades principais:

- `src/http/controllers/`: recebe HTTP, valida entrada e serializa respostas.
- `src/http/controllers/<resource>/routes.ts`: registra endpoints e middlewares.
- `src/use-cases/`: concentra regras de negócio, como autoria de posts e login.
- `src/repositories/`: define contratos de persistência.
- `src/repositories/typeorm/`: implementa os contratos com TypeORM.
- `src/use-cases/factory/`: monta use-cases com suas dependências concretas.
- `src/entities/`: mapeia entidades TypeORM.
- `src/database/`: concentra DataSource, migrations e seed.

## 3. Schemas e Banco de Dados

Convenções utilizadas:

- tabelas em inglês;
- colunas de domínio em português;
- propriedades TypeScript em inglês;
- timestamps padronizados como `created_at` e `updated_at`.

### `users`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador do usuário, com default `gen_random_uuid()` |
| `nome` | varchar(150) | Nome do usuário |
| `email` | varchar(255) | Email único para autenticação |
| `senha_hash` | varchar(255) | Hash bcrypt da senha |
| `created_at` | timestamptz | Data de criação |
| `updated_at` | timestamptz | Data da última atualização |

### `posts`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador do post, com default `gen_random_uuid()` |
| `titulo` | varchar(255) | Título do post |
| `conteudo` | text | Conteúdo do post |
| `autor_id` | UUID | Chave estrangeira para `users.id` |
| `created_at` | timestamptz | Data de criação |
| `updated_at` | timestamptz | Data da última atualização |

Migrations são a única forma de evoluir o schema. `synchronize` fica desabilitado para evitar alterações automáticas no banco.

## 4. Tecnologias Utilizadas

- Node.js e TypeScript
- Express
- PostgreSQL e TypeORM
- Zod
- bcryptjs e jsonwebtoken
- Jest e Supertest
- Docker e Docker Compose
- Prometheus, Grafana e prom-client
- OpenAPI 3.0 e Swagger UI
- GitHub Actions
- Render (deploy contínuo)

## 5. Rotas e Métodos HTTP

### Healthcheck

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `GET` | `/health` | Não | Verifica se a API está ativa |
| `GET` | `/metrics` | Não | Expõe métricas no formato Prometheus |
| `GET` | `/docs.json` | Não | Retorna o documento OpenAPI 3.0 |
| `GET` | `/docs` | Não | Disponibiliza documentação interativa Swagger UI |

### Autenticação

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/auth/login` | Não | Retorna um access token Bearer |

Corpo do login:

```json
{
  "email": "professor@exemplo.com",
  "password": "123456"
}
```

### Posts

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `GET` | `/posts` | Não | Lista posts por data de criação |
| `GET` | `/posts/:id` | Não | Retorna um post pelo id |
| `GET` | `/posts/search?q=termo` | Não | Busca em título e conteúdo |
| `POST` | `/posts` | Bearer | Cria um post para o usuário autenticado |
| `PUT` | `/posts/:id` | Bearer | Atualiza post do próprio autor |
| `DELETE` | `/posts/:id` | Bearer | Remove post do próprio autor |

Exemplo de criação:

```http
POST /posts
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "title": "Meu primeiro post",
  "content": "Conteúdo do post."
}
```

O autor é definido pelo JWT; `authorId` não deve ser enviado no corpo da requisição.

## 6. Containers

O Compose sobe quatro containers separados e reproduzíveis:

| Serviço | Porta no container | Porta no host |
|---|---:|---:|
| API | `3001` | `3001` |
| PostgreSQL | `5432` | `5433` |
| Prometheus | `9090` | `9090` |
| Grafana | `3000` | `3002` |

O serviço `api` aguarda o healthcheck do PostgreSQL. Em seguida executa migrations, seed e inicia o servidor. Os dados do banco ficam no volume `tech-challenge_postgres_data_v2`. Prometheus e Grafana possuem volumes próprios para manter métricas e configurações entre reinicializações.

## 7. Testes e Cobertura

Comandos disponíveis:

```bash
npm test
npm run test:coverage
npm run lint
npm run typecheck
npm run build
```

O Jest exige cobertura mínima global de 20% para linhas e statements. A cobertura atual é superior a 65% em ambas as métricas.

Os testes cobrem login, credenciais inválidas, middleware JWT, validação HTTP, proteção de rotas e regra de autoria de posts.

## 8. CI/CD e Deploy

### Integração contínua (CI)

O workflow em `.github/workflows/ci.yml` executa em pushes e pull requests para `main` e `master`:

1. `npm ci`
2. lint
3. typecheck
4. testes com cobertura
5. build

### Deploy contínuo (CD)

A aplicação está publicada no Render com deploy contínuo: cada push no branch conectado ao serviço dispara automaticamente um novo build e deploy.

| Recurso | URL |
|---|---|
| API (healthcheck) | `https://tech-challenge-vhbi.onrender.com/health` |
| Swagger UI | `https://tech-challenge-vhbi.onrender.com/docs` |

Detalhes da publicação:

- A API e o PostgreSQL são **serviços separados** no Render (o banco é um PostgreSQL gerenciado, não roda no mesmo container da API).
- O Render usa apenas o `Dockerfile` (um único container). Por isso o comando de inicialização do container executa `migration:run` e o seed antes de subir o servidor.
- Conexões com o PostgreSQL do Render exigem SSL, controlado pela variável `DATABASE_SSL` (`true` em produção, `false` em ambiente local e Docker).

## 9. Como Executar o Projeto

### Execução local

1. Crie o ambiente a partir do exemplo:

   ```bash
   cp .env.example .env
   ```

2. Defina um `JWT_SECRET` aleatório e configure a conexão PostgreSQL local no `.env`. Mantenha `DATABASE_SSL=false` no ambiente local e no Docker; ative (`true`) apenas em provedores gerenciados que exijam SSL, como o Render.

3. Instale dependências e prepare o banco:

   ```bash
   npm install
   npm run migration:run
   npm run seed
   ```

4. Inicie a API:

   ```bash
   npm run dev
   ```

### Execução com Docker

```bash
docker compose up --build -d
curl http://localhost:3001/health
```

Serviços disponíveis após a subida:

| Serviço | URL |
|---|---|
| API healthcheck | `http://localhost:3001/health` |
| Métricas | `http://localhost:3001/metrics` |
| Prometheus | `http://localhost:9090` |
| Grafana | `http://localhost:3002` |
| Swagger UI | `http://localhost:3001/docs` |

O Grafana inicia com usuário `admin` e senha `admin`. Defina `GRAFANA_ADMIN_PASSWORD` no ambiente para substituir a senha local padrão.

Para parar os containers sem apagar os dados:

```bash
docker compose down
```

Para remover também o volume do banco Docker:

```bash
docker compose down -v
```

## 10. Observabilidade

A observabilidade segue o mesmo fluxo usado como referência no Pettech, adaptado para Express:

```text
API Express (/metrics) -> Prometheus -> Grafana
```

O módulo `src/observability/metrics.ts` usa `prom-client` para expor métricas padrão do Node.js e as métricas HTTP abaixo:

- `tech_challenge_http_requests_total`: total de requisições por método, rota e status HTTP;
- `tech_challenge_http_request_duration_seconds`: histograma de latência por método, rota e status;
- `tech_challenge_http_requests_in_progress`: requisições em andamento por método e rota.

Os identificadores de recursos não entram nos labels. Por exemplo, uma chamada a `/posts/<uuid>` é registrada como `/posts/:id`, evitando alta cardinalidade no Prometheus. O endpoint `/metrics` não é instrumentado para que o scrape não altere os indicadores da API.

O datasource do Grafana e o dashboard `Tech Challenge API` são provisionados automaticamente. O dashboard apresenta requisições por rota, erros HTTP, latência p95, requisições em andamento e memória do processo Node.js.

### Monitorando a API publicada no Render

O `docker-compose.yml` sobe a stack completa (API, PostgreSQL, Prometheus e Grafana) e monitora a **API local**. Para monitorar a **API publicada no Render** sem subir a API nem o banco localmente, existe um compose dedicado, `docker-compose.monitor.yml`, que sobe apenas Prometheus e Grafana.

Como o Prometheus usa o modelo *pull* (ele faz scrape do alvo), o Prometheus rodando localmente coleta o endpoint `/metrics` da API hospedada no Render, via HTTPS. O alvo do scrape fica em `prometheus.render.yml`:

```yaml
scrape_configs:
  - job_name: tech-challenge-api
    metrics_path: /metrics
    scheme: https
    static_configs:
      - targets:
          - tech-challenge-vhbi.onrender.com
```

Para subir apenas o monitoramento apontando para o Render:

```bash
docker compose -f docker-compose.monitor.yml up
```

| Serviço | URL |
|---|---|
| Prometheus | `http://localhost:9090` |
| Grafana | `http://localhost:3002` |

O alvo `tech-challenge-api` pode ser conferido em `http://localhost:9090/targets` (estado `UP` indica scrape bem-sucedido). Como o plano Free do Render hiberna após inatividade, a primeira coleta pode falhar até o serviço "acordar". O compose de monitoramento usa volumes próprios (`prometheus_monitor_data` e `grafana_monitor_data`) para não misturar dados com a stack completa.

## 11. Swagger e OpenAPI

O documento OpenAPI 3.0 é exposto em `GET /docs.json`. A interface Swagger UI está em `GET /docs` e documenta healthcheck, métricas, login e todas as operações de posts.

Para testar as rotas protegidas na interface:

1. Execute `POST /auth/login` com o usuário de seed.
2. Copie o valor de `access_token` da resposta.
3. Clique em `Authorize` e informe o token JWT.
4. Execute `POST`, `PUT` ou `DELETE` em `/posts`.

O esquema Bearer está declarado somente nas rotas que exigem autenticação. O documento é mantido em `src/docs/openapi.ts` e possui teste de integração para evitar divergência entre a API e a documentação.

## 12. Decisões de Design e Desvios Conscientes da Especificação

A especificação original descreve o endpoint `POST /posts` recebendo título, conteúdo e autor no corpo da requisição e não prevê autenticação. Este projeto evoluiu sobre esse ponto de forma deliberada:

- **Autenticação por JWT foi adicionada** como camada extra, protegendo as operações de escrita (`POST`, `PUT`, `DELETE`).
- **O autor é derivado do token JWT, não do corpo da requisição.** O `authorId` do post é sempre o `sub` do usuário autenticado.

O motivo do desvio é de segurança. Assim que existe autenticação, o token passa a ser a fonte de verdade da identidade. Aceitar o autor pelo corpo permitiria que um usuário criasse ou alterasse posts se passando por outro (falsificação de autoria), tornando inútil a regra de autoria que retorna `403` quando o usuário não é o dono do post. Portanto, implementar o autor pelo corpo seria um retrocesso de segurança, e não uma melhoria.

O trecho da especificação ("aceitará dados como título, conteúdo e autor") é ilustrativo do modelo de dados de um post. A obrigação de autoria continua atendida: todo post tem um autor associado; apenas a fonte desse autor mudou do corpo para o token.

## 13. Desafios e Aprendizados

- **Refatoração de OutSystems para Node.js.** O ponto de partida era uma aplicação low-code. Reconstruir o back-end em Node.js exigiu redefinir modelo de dados, contratos de API e responsabilidades de camada do zero.
- **Arquitetura em camadas (padrão Pettech).** Manter rotas e controllers finos, com regras nos use-cases e o TypeORM isolado nos repositories, deu um custo inicial de estrutura, mas facilitou testar regras de negócio sem subir banco.
- **Convenção de nomenclatura bilíngue.** Tabelas e timestamps em inglês, colunas de domínio em português e propriedades TypeScript em inglês mapeadas por decorators. Foi uma decisão de padronização que exigiu disciplina nas entidades e migrations para não vazar nomes de coluna para os use-cases.
- **Migrations em vez de `synchronize`.** Desabilitar o `synchronize` e versionar o schema por migrations aproxima o projeto de um cenário de produção, ao custo de manter as migrations manualmente alinhadas às entidades.
- **Testes sem depender de um PostgreSQL real.** A maior parte da suíte valida validação HTTP, middleware JWT e regra de autoria isolando a camada de persistência, o que mantém o CI rápido e determinístico. A cobertura ficou acima de 65%, bem além do mínimo de 20%.
- **Observabilidade com baixa cardinalidade.** Ao instrumentar `/metrics`, foi preciso normalizar rotas dinâmicas (`/posts/<uuid>` vira `/posts/:id`) para evitar explosão de labels no Prometheus.
- **Documentação viva.** O documento OpenAPI é mantido à mão e coberto por teste de integração, garantindo que a API e a documentação não divirjam ao longo do tempo.
