import {
  KitchenRpcDatasource,
  paramsSendOrderToKitchen,
} from 'src/api/kitchen/domain/datasources/kitchen.datasource';

export class KitchenRpcService {
  constructor(private readonly datasource: KitchenRpcDatasource) {}

  async getKitchenOrders(params: { take: number; skip: number; where: unknown; orderBy: unknown }) {
    return await this.datasource.getKitchenOrders(params);
  }

  async getRecipesFromKitchen() {
    return await this.datasource.getRecipesFromKitchen();
  }

  async sendOrderToKitchen(params: paramsSendOrderToKitchen) {
    return await this.datasource.sendOrderToKitchen(params);
  }
}
