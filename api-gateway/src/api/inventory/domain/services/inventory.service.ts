// inventory.service.ts
import { InventoryDatasource } from "../datasources/inventory.datasource";

export class InventoryService {
  constructor(private readonly datasource: InventoryDatasource) {}

  async getInventoryIngredients() {
    return await this.datasource.getInventoryIngredients();
  }

  async getInventoryPurchaseHistory(params: { take: number; skip: number }) {
    return await this.datasource.getInventoryPurchaseHistory(params);
  }

  async suscribeAndResponseInventoryIngredients() {
    return await this.datasource.suscribeAndResponseInventoryIngredients();
  }
}
