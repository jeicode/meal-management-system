import { getOrdersSchema, orderSchema } from "../validations/kitchen/kitchen-order.schemas";
import { getPurchaseHistorySchema } from "../validations/inventory/inventory.schemas";
import { Route } from "../core/interfaces/http.interface";
import { getInventoryIngredientsController, getPurchaseHistoryController } from "../api/inventory/controller";
import { getKitchenRecipesController, getOrdersController, kitchenOrderController } from "../api/kitchen/controller";
import { runServerSSE } from "../api/sse/controller";

const BASE_API = "/api/v1";

// Definir rutas en un arreglo
export const routes: Route[] = [
  {
    method: "GET",
    path: `${BASE_API}/sse`,
    controller: runServerSSE,
    isSSE: true
  },

  // ----- KITCHEN -------
  {
    method: "POST",
    path: `${BASE_API}/kitchen/order`,
    controller: kitchenOrderController,
    schema: orderSchema,
    validateOn: "query"
  },
  {
    method: "GET",
    path: `${BASE_API}/kitchen/recipes`,
    controller: getKitchenRecipesController
  },
  {
    method: "POST",
    path: `${BASE_API}/kitchen/orders`,
    controller: getOrdersController,
    schema: getOrdersSchema,
    validateOn: "body"
  },

  // ----- INVENTORY -------
  {
    method: "GET",
    path: `${BASE_API}/inventory/purchase-history`,
    controller: getPurchaseHistoryController,
    schema: getPurchaseHistorySchema,
    validateOn: "query"
  },
  {
    method: "GET",
    path: `${BASE_API}/inventory/ingredients`,
    controller: getInventoryIngredientsController
  }
];