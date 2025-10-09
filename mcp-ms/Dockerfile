# Etapa base
FROM node:20.19.0-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# Etapa de dependencias
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm i -f


# Etapa de construcción
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build 

# Etapa final
FROM base AS final
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/src/index.js"]