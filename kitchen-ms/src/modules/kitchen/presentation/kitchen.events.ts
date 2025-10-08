import { KitchenService } from 'src/modules/kitchen/domain/services/kitchen.service';
import { logError } from 'src/shared/utils/logs.utils';
import { RabbitMQKitchenRpc } from 'src/modules/kitchen/infraestructure/rabbitmq/rabbitmq-kitchen-rpc';

const kitchenService = new KitchenService(new RabbitMQKitchenRpc());
export async function rpcOrdersDelivered() {
  try {
    kitchenService.rpcOrdersDelivered();
  } catch (err: unknown) {
    logError('❌ consumeOrdersDelivered', (err as Error).message);
  }
}

export async function rpcOrdersHistory() {
  try {
    kitchenService.rpcOrdersHistory();
  } catch (err: unknown) {
    logError('❌ consumeOrdersHistory', (err as Error).message);
  }
}

export async function rpcRecipes() {
  try {
    kitchenService.rpcRecipes();
  } catch (err: unknown) {
    logError('❌ consumeOrdersHistory', (err as Error).message);
  }
}
