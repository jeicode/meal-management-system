import { OrdersRpcDatasource } from '../datasources/orders.datasource';

export class OrdersRpcService {
  constructor(private readonly datasource: OrdersRpcDatasource) {}
  async rpcOrdersToKitchen() {
    return this.datasource.rpcOrdersToKitchen();
  }
}
