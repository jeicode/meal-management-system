import { logError } from "../../shared/utils/logs.utils";
import { KitchenService } from "./service";
import { RabbitMQKitchenDatasource } from "./infraestructure/queue-messages/rabbitmq";

const kitchenService = new KitchenService(new RabbitMQKitchenDatasource())
export async function rpcOrdersDelivered() {
  try {
    kitchenService.rpcOrdersDelivered()
  } catch (err: unknown) {
    logError('❌ consumeOrdersDelivered', (err as Error).message);
  }
}

export async function rpcOrdersHistory() {
  try {
    kitchenService.rpcOrdersHistory()
  } catch (err: unknown) {
    logError('❌ consumeOrdersHistory', (err as Error).message);
  }
}

export async function rpcRecipes() {
  try {
    kitchenService.rpcRecipes()
  } catch (err: unknown) {
    logError('❌ consumeOrdersHistory', (err as Error).message);
  }
}
