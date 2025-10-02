import { logError } from "../../../shared/utils/logs.utils";
import { FoodInventoryService } from "../domain/services/food-inventory.service";
import { RabbitMQFoodInventoryDatasource } from "../infraestructure/rabbitmq/rabbitmq-food-inventory.datasource";

const foodInventoryService = new FoodInventoryService(new RabbitMQFoodInventoryDatasource());

export function rpcFoodInventoryHistoryRequest() {
    try {
      foodInventoryService.rpcFoodInventoryHistoryRequest();
    } catch (err: unknown) {
      logError('❌ consumeFoodInventoryHistoryRequest', (err as Error).message);
    }
}