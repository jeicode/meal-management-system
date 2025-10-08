import { logError } from '../../../shared/utils/logs.utils';
import { KitchenService } from '../domain/services/kitchen.service';
import { RabbitMQKitchenRpc } from '../infrastructure/rabbitmq/rabbitmq-kitchen-rpc';
const kitchenService = new KitchenService(new RabbitMQKitchenRpc());

export async function rpcKitchenRequests() {
  try {
    kitchenService.rpcKitchenRequests();
  } catch (err: unknown) {
    logError('❌ rpcKitchenRequests', (err as Error).message);
  }
}
