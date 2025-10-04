import { InventoryRpcDatasource } from "../datasources/inventory.datasource";

export class InventoryRpcService {
  constructor(private readonly datasource: InventoryRpcDatasource) {}

  async getInventoryIngredients() {
    return await this.datasource.getInventoryIngredients();
  }

  async getInventoryPurchaseHistory(params: { take: number; skip: number }) {
    return await this.datasource.getInventoryPurchaseHistory(params);
  }
}
