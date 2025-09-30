


export type GetInventoryPurchaseHistoryParams = {take?: number, skip?: number}

export abstract class InventoryDatasource {
  abstract getInventoryIngredients(): Promise<any>;
  abstract getInventoryPurchaseHistory(params: GetInventoryPurchaseHistoryParams): Promise<any>;
}