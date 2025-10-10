import { OrdersSubscriberDatasource } from '../datasources/orders.datasource';

export class OrdersSubscriberService {
  constructor(private readonly datasource: OrdersSubscriberDatasource) {}
  async subscribeToOrderChanges() {
    return this.datasource.subscribeToOrderChanges();
  }
}
