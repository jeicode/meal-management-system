import { InventorySubscriberService } from "../domain/services/inventory-subscriber.service";
import { RabbitMQInventorySubscriber } from "../infrastructure/rabbitmq/rabbitmq-inventory-subscriber";

const inventorySubscriberService = new InventorySubscriberService(new RabbitMQInventorySubscriber());

export async function subscribeAndResponseInventoryIngredients() {
  return inventorySubscriberService.subscribeAndResponseInventoryIngredients();
}