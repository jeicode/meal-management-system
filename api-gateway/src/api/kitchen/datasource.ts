export abstract class KitchenDatasource {
  abstract getRecipesFromKitchen(): Promise<Record<string, unknown>>;
  abstract sendOrderToKitchen(message: object): Promise<Record<string, unknown>>;
  abstract getKitchenOrders(params: Record<string, unknown>): Promise<Record<string, unknown>>;
}