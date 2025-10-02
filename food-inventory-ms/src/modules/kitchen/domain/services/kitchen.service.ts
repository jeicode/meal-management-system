import { KitchenDatasource } from "src/modules/kitchen/domain/kitchen.datasource";

export class KitchenService implements KitchenDatasource {
    constructor(protected readonly datasource: KitchenDatasource) {}
    rpcKitchenRequests(): Promise<void> {
        return this.datasource.rpcKitchenRequests();
    }
}