import { InventoryService } from "../domain/services/inventory.service";
import { RabbitMQInventoryDatasource } from "../infraestructure/rabbitmq/rabbitmq-inventory.datasource";

const inventoryService = new InventoryService(new RabbitMQInventoryDatasource());

export async function suscribeAndResponseInventoryIngredients() {
  return inventoryService.suscribeAndResponseInventoryIngredients();
}