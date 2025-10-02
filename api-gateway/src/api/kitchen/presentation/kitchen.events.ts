import { KitchenService } from "../domain/services/kitchen.service";
import { RabbitMQKitchenDatasource } from "../infraestructure/rabbitmq/rabbitmq-kitchen.datasource";

const kichtenService = new KitchenService(new RabbitMQKitchenDatasource());

export async function suscribeOrdersPendingOrPreparing() {  
  return kichtenService.suscribeOrdersPendingOrPreparing();
}