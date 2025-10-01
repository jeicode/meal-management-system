import { KitchenDatasource } from "./datasource";

export class KitchenService {
  constructor(private readonly datasource: KitchenDatasource) {}

  rpcOrdersDelivered() {
    return this.datasource.rpcOrdersDelivered();
  }
  
   rpcOrdersHistory() {
    return this.datasource.rpcOrdersHistory();
  }

  rpcRecipes() {
    return this.datasource.rpcRecipes();
  }
}
