FROM node:20.19.0-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm i -f

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run generate
RUN pnpm run build


FROM base AS final
COPY --from=deps /app/node_modules ./node_modules 
COPY --from=build /app/dist ./dist 
COPY ./prisma ./dist/prisma

WORKDIR /app/dist

CMD ["node", "src/index.js"]
