import { OrdersDatasource } from '../datasources/orders.datasource';

export class OrdersService {
  constructor(private readonly datasource: OrdersDatasource) {}

  async publishPendingOrder(payload: unknown) {
    return this.datasource.publishPendingOrder(payload);
  }

  async processKitchenOrders(data: { dishes: number }) {
    return this.datasource.processKitchenOrders(data);
  }
}
