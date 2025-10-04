import { FoodInventoryService } from "src/modules/food-inventory/domain/services/food-inventory.service";
import { RabbitMQFoodInventoryDatasource } from "src/modules/food-inventory/infrastructure/rabbitmq/rabbitmq-food-inventory.datasource";

const foodInventoryService = new FoodInventoryService(new RabbitMQFoodInventoryDatasource())

export async function suscribeIngredientsChanges() {
  foodInventoryService.suscribeIngredientsChanges();
}

export async function rpcInventoryIngredients() {
  foodInventoryService.rpcInventoryIngredients();
}

export async function rpcHistoryPurchase() {
  foodInventoryService.rpcHistoryPurchase();
}

