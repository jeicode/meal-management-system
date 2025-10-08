import { KitchenDatasource } from '../datasources/kitchen.datasource';
export class KitchenService {
  constructor(protected readonly datasource: KitchenDatasource) {}
  rpcKitchenRequests(): Promise<void> {
    return this.datasource.rpcKitchenRequests();
  }
}
