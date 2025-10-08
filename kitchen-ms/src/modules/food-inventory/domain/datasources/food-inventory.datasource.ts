import { OrderHistory } from '../../../../../prisma/prisma-client';

export type RequestIngredientsToInventoryParams = { order: OrderHistory };
export type RequestIngredientsToInventoryResponse = {
  recipesData: any;
  ingredientsPendingPurchase: any;
};
export interface FoodInventoryDatasource {
  rpcFoodInventoryHistoryRequest(): void;
  requestIngredientsToInventory({
    order,
  }: RequestIngredientsToInventoryParams): Promise<RequestIngredientsToInventoryResponse>;
}
