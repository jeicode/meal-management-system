import { KitchenSubscriberService } from "../domain/services/kitchen-subscriber.service";
import { RabbitMQKitchenSubscriber } from "../infraestructure/rabbitmq/rabbitmq-kitchen-suscriber";

const kitchenSuscriberService = new  KitchenSubscriberService(new RabbitMQKitchenSubscriber());

export async function suscribeOrdersPendingOrPreparing() {  
  return kitchenSuscriberService.suscribeOrdersPendingOrPreparing();
}