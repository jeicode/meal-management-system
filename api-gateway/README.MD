# 🍽️ API gateway Microservice

![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.19.0-green?style=for-the-badge&logo=nodedotjs)
![PNPM](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220)

API gateway microservice.

## 🚀 Quick Start

### Requirements

- Docker and Docker Compose installed
- Node.js version >= 20
- pnpm (optional, recommended for managing dependencies)

### RabbitMQ

Start RabbitMQ if you don't have it running already.
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

```bash
PORT=3000
RABBITMQ_URL=amqp://user:password@host
TIMEOUT_RABBITMQ=10000 //optional
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

```bash
pnpm run dev
```

## Deployment
### with Docker

```bash
docker build -t api-gateway .
docker run -p 3000:3000 --env-file .env api-gateway
```

### without Docker

```bash
pnpm install
pnpm run build
pnpm run start
```