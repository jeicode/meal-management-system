import { KitchenSubscriberDatasource } from '../datasources/kitchen.datasource';

export class KitchenSubscriberService {
  constructor(private readonly subscriberDatasource: KitchenSubscriberDatasource) {}

  async subscribeOrdersPendingOrPreparing() {
    return this.subscriberDatasource.subscribeOrdersPendingOrPreparing();
  }
}
