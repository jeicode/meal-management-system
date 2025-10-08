import { FoodInventoryService } from '../../modules/food-inventory/domain/services/food-inventory.service';
import { RabbitMQFoodInventoryDatasource } from '../../modules/food-inventory/infrastructure/rabbitmq/rabbitmq-food-inventory.datasource';

const foodInventoryService = new FoodInventoryService(new RabbitMQFoodInventoryDatasource());
export const makePendingIngredientPurchases = () => {
  foodInventoryService.makePendingIngredientPurchases();
};
