export interface OrdersDatasource {
    publishPendingOrder(payload: unknown): Promise<void>;
    processKitchenOrders(data: { dishes: number }): Promise<unknown>;
  }
  