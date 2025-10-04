import { InventorySubscriberDatasource } from "../datasources/inventory.datasource";

export class InventorySubscriberService {
  constructor(private readonly datasource: InventorySubscriberDatasource) {}

  async subscribeAndResponseInventoryIngredients() {
    return this.datasource.subscribeAndResponseInventoryIngredients();
  }
}