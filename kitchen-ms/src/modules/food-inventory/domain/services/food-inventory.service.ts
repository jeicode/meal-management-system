// service.ts

import { FoodInventoryDatasource } from './domain/datasources/food-inventory.datasource';
import { RequestIngredientsToInventoryParams } from './domain/datasources/food-inventory.datasource';

export class FoodInventoryService {
  constructor(private readonly datasource: FoodInventoryDatasource) {}
  rpcFoodInventoryHistoryRequest() {
    return this.datasource.rpcFoodInventoryHistoryRequest();
  }
  requestIngredientsToInventory({ order, channel }: RequestIngredientsToInventoryParams) {
    return this.datasource.requestIngredientsToInventory({ order, channel });
  }
}
