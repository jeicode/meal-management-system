# 🍽️ Food Inventory Microservice

![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.19.0-green?style=for-the-badge&logo=nodedotjs)
![PNPM](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220)

## 🚀 Quick Start

### Requirements

- Docker and Docker Compose installed
- Node.js version >= 20
- pnpm (optional, recommended to handle dependencies)

### RabbitMQ

Start RabbitMQ if you don't already have it running.

```bash
docker run -d \
--name rabbitmq \
-p 5672:5672 \
-e RABBITMQ_DEFAULT_USER=admin \
-e RABBITMQ_DEFAULT_PASS=admin \
--restart always \
rabbitmq:4.1.0-rc.1-alpine
```

### Environment Variables

Create an .env file and make sure the RabbitMQ service is running. Then, update the RABBITMQ_URL variable with the correct connection values.

> **Note:** To use Supabase with *realtime* support, you must have a Supabase account and properly configure *Postgres Changes* as explained in the official documentation:  
> [https://supabase.com/docs/guides/realtime/postgres-changes?queryGroups=database-method&database-method=sql](https://supabase.com/docs/guides/realtime/postgres-changes?queryGroups=database-method&database-method=sql)


```bash
RABBITMQ_URL=amqp://user:password@host
DATABASE_URL=POSTGRES_URI
SUPABASE_URL=SUPABASE_URL
SUPABASE_ANON_KEY=SUPABASE_ANON_KEY
RABBITMQ_TIMEOUT=20000 // optional
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

# Performing Migrations
```bash
npx prisma generate
npx prisma migrate dev
```

# Running
```bash
pnpm run dev
```

### Deploying with Docker

```bash
docker build -t food-inventory-ms .
docker run -d --env-file .env food-inventory-ms
```