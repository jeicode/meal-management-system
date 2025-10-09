# 🍽️ Meal Management System

Main repository for the microservices system for restaurant management.

Access the demo of the application here: [https://meal-management-system-ms.vercel.app](https://meal-management-system-ms.vercel.app)

## 🧩 Microservices Description

### 🔗 `api-gateway`

- Receives client requests.
- Redirects requests to the appropriate microservice.
- Acts as a central entry point to the system.

### 🍱 `food-inventory-ms`

- Manages the inventory of available ingredients and products.
- Checks the availability of ingredients for orders.
- Communicates with other services through events to update stock.

### 🍳 `kitchen-ms`

- Simulates order processing and preparation.
- Receives validated orders and executes their cooking.
- Publishes events when an order has been prepared.

### 🧠 `mcp-ms`

- Stores the application's Product Knowledge Model (PKM).
- Contains all the information, business rules, and knowledge structure of the system's domain.
- Serves as the single source of truth and knowledge for other microservices that require it.

### 🌐 `client`

- Web interface for restaurant users.
- Allows viewing the menu, placing orders, and viewing order status.

## 🧱 Requirements

- Docker and Docker Compose installed
- Node.js version >= 20
- pnpm (optional, recommended for managing dependencies)

## 📚 Documentation per microservice

Each microservice has its own specific documentation. Please review the README.md files for each one for more details on configuration, environment variables, available endpoints, and more:

- 1 [API Gateway](./api-gateway)
- 2 [Kitchen Microservice](./kitchen-ms)
- 3 [Food Inventory Microservice](./food-inventory-ms)
- 4 [Restaurant Client](./restaurant-client)
- 5 [MCP Microservice](./mcp-ms)

## 🚀 Environment Initialization

Run all background services:

```bash
docker-compose up -d
```
