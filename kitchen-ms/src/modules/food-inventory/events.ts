import { logError } from "../../shared/utils/logs.utils";
import { RabbitMQFoodInventoryDatasource } from "./infraestructure/queue-messages/rabbitmq";
import { FoodInventoryService } from "./service";

const foodInventoryService = new FoodInventoryService(new RabbitMQFoodInventoryDatasource());

export function rpcFoodInventoryHistoryRequest() {
    try {
      foodInventoryService.rpcFoodInventoryHistoryRequest();
    } catch (err: unknown) {
      logError('❌ consumeFoodInventoryHistoryRequest', (err as Error).message);
    }
}