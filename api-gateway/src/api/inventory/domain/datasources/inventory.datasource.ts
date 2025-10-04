export type GetInventoryPurchaseHistoryParams = {take?: number, skip?: number}

export abstract class InventoryRpcDatasource {
  abstract getInventoryIngredients(): Promise<Record<string, unknown>>;
  abstract getInventoryPurchaseHistory(params: GetInventoryPurchaseHistoryParams): Promise<Record<string, unknown>>;
}

export interface InventorySubscriberDatasource {
  subscribeAndResponseInventoryIngredients(): Promise<unknown>;
}
