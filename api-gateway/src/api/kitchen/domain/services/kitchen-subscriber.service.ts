import { KitchenSubscriberDatasource } from "src/api/kitchen/domain/datasources/kitchen.datasource";

export class KitchenSubscriberService {
    constructor(private readonly subscriberDatasource: KitchenSubscriberDatasource) {}
  
    async suscribeOrdersPendingOrPreparing() {
      return this.subscriberDatasource.suscribeOrdersPendingOrPreparing();
    }
  }