// service.ts
import { KitchenDatasource } from "./datasource";

export class KitchenService {
  constructor(private readonly datasource: KitchenDatasource) {}

  async getKitchenOrders(params: { take: number; skip: number; where: any; orderBy: any }) {
    return await this.datasource.getKitchenOrders(params);
  }
  
  async getRecipesFromKitchen() {
    return await this.datasource.getRecipesFromKitchen();
  }

  async sendOrderToKitchen(params: { dishes: number }) {
    return await this.datasource.sendOrderToKitchen(params);
  }
}
