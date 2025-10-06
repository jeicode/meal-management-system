import { getOrdersSchema, orderSchema } from './kitchen/presentation/schemas/kitchen-order.schemas';
import { getPurchaseHistorySchema } from './inventory/presentation/schemas/inventory.schemas';
import {
  getInventoryIngredientsController,
  getPurchaseHistoryController,
} from 'src/api/inventory/presentation/inventory.controller';
import {
  getKitchenRecipesController,
  getOrdersController,
  kitchenOrderController,
} from 'src/api/kitchen/presentation/kitchen.controller';
import { runServerSSE } from 'src/api/sse/sse.controller';
import { Route } from 'src/core/interfaces/http.interface';
import { agentController } from './agent/presentation/agent.controller';
import { generateOrdersWithAiSchema } from './agent/presentation/schemas/agent.schemas';

const BASE_API = '/api/v1';

// Definir rutas en un arreglo
export const routes: Route[] = [
  {
    method: 'GET',
    path: `${BASE_API}/sse`,
    controller: runServerSSE,
    isSSE: true,
  },

  // ----- AGENT -------
  {
    method: 'POST',
    path: `${BASE_API}/agent`,
    controller: agentController,
    schema: generateOrdersWithAiSchema,
    validateOn: 'body',
  },

  // ----- KITCHEN -------
  {
    method: 'POST',
    path: `${BASE_API}/kitchen/order`,
    controller: kitchenOrderController,
    schema: orderSchema,
    validateOn: 'query',
  },
  {
    method: 'GET',
    path: `${BASE_API}/kitchen/recipes`,
    controller: getKitchenRecipesController,
  },
  {
    method: 'GET',
    path: `${BASE_API}/kitchen/orders`,
    controller: getOrdersController,
    schema: getOrdersSchema,
    validateOn: 'query',
  },

  // ----- INVENTORY -------
  {
    method: 'GET',
    path: `${BASE_API}/inventory/purchase-history`,
    controller: getPurchaseHistoryController,
    schema: getPurchaseHistorySchema,
    validateOn: 'query',
  },
  {
    method: 'GET',
    path: `${BASE_API}/inventory/ingredients`,
    controller: getInventoryIngredientsController,
  },
];
