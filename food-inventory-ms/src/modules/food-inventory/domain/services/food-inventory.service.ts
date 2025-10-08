import { FoodInventoryDatasource } from '../datasources/food-inventory.datasource';

export class FoodInventoryService {
  constructor(protected readonly datasource: FoodInventoryDatasource) {}
  suscribeIngredientsChanges(): void {
    return this.datasource.suscribeIngredientsChanges();
  }
  rpcInventoryIngredients(): Promise<void> {
    return this.datasource.rpcInventoryIngredients();
  }
  rpcHistoryPurchase(): Promise<void> {
    return this.datasource.rpcHistoryPurchase();
  }
  makePendingIngredientPurchases(): void {
    return this.datasource.makePendingIngredientPurchases();
  }
  rpcDeleteAllPurchaseHistory(): void {
    return this.datasource.rpcDeleteAllPurchaseHistory();
  }
}
