import { Channel } from "amqplib";
import { OrderHistory } from "prisma/prisma-client";

export type RequestIngredientsToInventoryParams = {order: OrderHistory;channel: Channel};
export type RequestIngredientsToInventoryResponse = {recipesData: any; ingredientsPendingPurchase: any};
export abstract class FoodInventoryDatasource {
  abstract rpcFoodInventoryHistoryRequest(): void;
  abstract requestIngredientsToInventory({order, channel}: RequestIngredientsToInventoryParams): Promise<RequestIngredientsToInventoryResponse>;
}