# 🍽️ Mcp Microservice

![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.19.0-green?style=for-the-badge&logo=nodedotjs)
![PNPM](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220)

## 🚀 Quick Start

### Requirements

- Docker and Docker Compose installed
- Node.js version >= 20
- pnpm (recommended for managing dependencies)

### Environment Variables

```bash
PORT=3000
API_GATEWAY_URL=http://localhost:3000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/postgres"
SUPABASE_URL=URL_PROYECTO_SUPABASE
SUPABASE_ANON_KEY=
```

### Installing Dependencies

```bash
pnpm install
```

### Running Tests

```bash
pnpm run test
```

### Running Locally

# Running

```bash
pnpm run dev
```

### Deploying with Docker

```bash
docker build -t mcp-ms .
docker run -d --env-file .env mcp-ms
```
