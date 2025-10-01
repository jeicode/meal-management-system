export type GetInventoryPurchaseHistoryParams = {take?: number, skip?: number}

export abstract class InventoryDatasource {
  abstract getInventoryIngredients(): Promise<Record<string, unknown>>;
  abstract getInventoryPurchaseHistory(params: GetInventoryPurchaseHistoryParams): Promise<Record<string, unknown>>;
}