import { Channel } from "amqplib";
import { OrderHistory } from "prisma/prisma-client";

export type RequestIngredientsToInventoryParams = {order: OrderHistory;channel: Channel};
export type RequestIngredientsToInventoryResponse = {recipesData: any; ingredientsPendingPurchase: any};
export interface FoodInventoryDatasource {
  rpcFoodInventoryHistoryRequest(): void;
  requestIngredientsToInventory({order, channel}: RequestIngredientsToInventoryParams): Promise<RequestIngredientsToInventoryResponse>;
}