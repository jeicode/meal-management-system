export abstract class KitchenRpcDatasource {
  abstract getRecipesFromKitchen(): Promise<Record<string, any>>;
  abstract sendOrderToKitchen(message: object): Promise<Record<string, any>>;
  abstract getKitchenOrders(params: Record<string, any>): Promise<Record<string, any>>;
}

export abstract class KitchenSubscriberDatasource {
  abstract subscribeOrdersPendingOrPreparing(): void
}
