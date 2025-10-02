// modules/orders/orders.service.ts

import { OrdersDatasource } from "src/modules/orders/domain/datasources/orders.datasource";

export class OrdersService {
  constructor(private readonly datasource: OrdersDatasource) {}

  async publishPendingOrder(payload: unknown) {
    return this.datasource.publishPendingOrder(payload);
  }

  async processKitchenOrders(data: { dishes: number }) {
    return this.datasource.processKitchenOrders(data);
  }
}
