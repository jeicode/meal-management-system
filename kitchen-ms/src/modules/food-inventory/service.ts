// service.ts

import { FoodInventoryDatasource } from './datasource';
import { RequestIngredientsToInventoryParams } from './datasource';

export class FoodInventoryService {
  constructor(private readonly datasource: FoodInventoryDatasource) {}
  rpcFoodInventoryHistoryRequest() {
    return this.datasource.rpcFoodInventoryHistoryRequest();
  }
  requestIngredientsToInventory({ order, channel }: RequestIngredientsToInventoryParams) {
    return this.datasource.requestIngredientsToInventory({ order, channel });
  }
}
