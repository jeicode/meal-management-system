import { FoodInventoryDatasource } from "src/modules/food-inventory/domain/datasources/food-inventory.datasource";

export class FoodInventoryService implements FoodInventoryDatasource {
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
}