import { runRabbitMQ } from './config/rabbitmq.config';
import { rpcKitchenRequests } from './modules/kitchen/presentation/kitchen.events';
import { makePendingIngredientPurchases } from './core/jobs/jobs';
import {
  rpcHistoryPurchase,
  rpcInventoryIngredients,
  suscribeIngredientsChanges,
} from './modules/food-inventory/presentation/food-inventory.events';
import { rpcDeleteData } from './modules/settings/presentation/settings.controller';

function initEvents() {
  suscribeIngredientsChanges();
  rpcInventoryIngredients();
  rpcHistoryPurchase();
  rpcKitchenRequests();
  rpcDeleteData();
}

runRabbitMQ().then(() => {
  initEvents();
  // JOBS
  makePendingIngredientPurchases();
});
