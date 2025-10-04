import { KitchenSubscriberService } from "../domain/services/kitchen-subscriber.service";
import { RabbitMQKitchenSubscriber } from "../infrastructure/rabbitmq/rabbitmq-kitchen-subscriber";

const kitchenSubscriberService = new  KitchenSubscriberService(new RabbitMQKitchenSubscriber());

export async function subscribeOrdersPendingOrPreparing() {  
  return kitchenSubscriberService.subscribeOrdersPendingOrPreparing();
}