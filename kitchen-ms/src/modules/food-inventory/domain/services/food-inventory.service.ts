import {
  FoodInventoryDatasource,
  RequestIngredientsToInventoryParams,
} from '../datasources/food-inventory.datasource';

export class FoodInventoryService {
  constructor(private readonly datasource: FoodInventoryDatasource) {}
  rpcFoodInventoryHistoryRequest() {
    return this.datasource.rpcFoodInventoryHistoryRequest();
  }
  requestIngredientsToInventory({ order }: RequestIngredientsToInventoryParams) {
    return this.datasource.requestIngredientsToInventory({ order });
  }
}
