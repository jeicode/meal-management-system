import { logError } from '../../../shared/utils/logs.utils';
import { FoodInventoryService } from '../domain/services/food-inventory.service';
import { RabbitMQFoodInventoryRpc } from '../infraestructure/rabbitmq/rabbitmq-food-inventory-rpc';

const foodInventoryService = new FoodInventoryService(new RabbitMQFoodInventoryRpc());

export function rpcFoodInventoryHistoryRequest() {
  try {
    foodInventoryService.rpcFoodInventoryHistoryRequest();
  } catch (err: unknown) {
    logError('❌ consumeFoodInventoryHistoryRequest', (err as Error).message);
  }
}
