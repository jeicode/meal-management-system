export interface FoodInventoryDatasource {
    suscribeIngredientsChanges(): void
    rpcInventoryIngredients(): Promise<any>
    rpcHistoryPurchase(): Promise<any>
    makePendingIngredientPurchases(): void
}