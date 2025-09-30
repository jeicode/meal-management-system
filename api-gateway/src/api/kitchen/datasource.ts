export abstract class KitchenDatasource {
  abstract getRecipesFromKitchen(): Promise<any>;
  abstract sendOrderToKitchen(message: object): Promise<any>;
  abstract getKitchenOrders(params: Record<string, any>): Promise<Record<string, any>>;
}