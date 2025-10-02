// service.ts
import { KitchenDatasource } from "src/api/kitchen/domain/datasources/kitchen.datasource";

export class KitchenService {
  constructor(private readonly datasource: KitchenDatasource) {}

  async getKitchenOrders(params: { take: number; skip: number; where: unknown; orderBy: unknown }) {
    return await this.datasource.getKitchenOrders(params);
  }
  
  async getRecipesFromKitchen() {
    return await this.datasource.getRecipesFromKitchen();
  }

  async sendOrderToKitchen(params: { dishes: number }) {
    return await this.datasource.sendOrderToKitchen(params);
  }

  async suscribeOrdersPendingOrPreparing() {
    return await this.datasource.suscribeOrdersPendingOrPreparing();
  }
}
