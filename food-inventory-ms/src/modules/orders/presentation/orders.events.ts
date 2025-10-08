import { KitchenService } from 'src/modules/kitchen/domain/services/kitchen.service';
import { logError } from '../../../shared/utils/logs.utils';
import { RabbitMQKitchenRpc } from 'src/modules/kitchen/infrastructure/rabbitmq/rabbitmq-kitchen-rpc';

const kitchenService = new KitchenService(new RabbitMQKitchenRpc());

export async function rpcKitchenRequests() {
  try {
    kitchenService.rpcKitchenRequests();
  } catch (err: unknown) {
    logError('❌ rpcKitchenRequests', (err as Error).message);
  }
}
