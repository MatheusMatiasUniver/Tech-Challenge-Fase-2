FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:24-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/build ./build

EXPOSE 3001

CMD node ./node_modules/typeorm/cli.js migration:run -d build/database/data-source.js && node build/database/seeds/seed.js && node build/server.js
