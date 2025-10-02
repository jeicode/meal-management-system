import { logError } from "src/shared/utils/logs.utils";
import { KitchenService } from "src/modules/kitchen/domain/services/kitchen.service";
import { RabbitMQKitchenDatasource } from "src/modules/kitchen/infraestructure/rabbitmq/rabbitmq-kitchen.datasource";
const kitchenService = new KitchenService(new RabbitMQKitchenDatasource())

export async function rpcKitchenRequests() {
    try {
      kitchenService.rpcKitchenRequests();
    } catch (err: unknown) {
      logError('❌ rpcKitchenRequests', (err as Error).message);
    }
}
  