import { initRabbitMQ } from './config/rabbitmq.config';
import { prepareOrdersJob } from './core/jobs/order.jobs';
import { rpcFoodInventoryHistoryRequest } from './modules/food-inventory/presentation/food-inventory.events';
import {
  rpcOrdersDelivered,
  rpcOrdersHistory,
  rpcRecipes,
} from './modules/kitchen/presentation/kitchen.events';
import {
  rpcOrdersToKitchen,
  subscribeToOrderChanges,
} from './modules/orders/presentation/orders.events';
import { rpcDeleteData } from './modules/settings/presentation/settings.controller';

function initEvents() {
  rpcOrdersToKitchen();
  rpcFoodInventoryHistoryRequest();
  subscribeToOrderChanges();
  rpcOrdersDelivered();
  rpcOrdersHistory();
  rpcRecipes();
  rpcDeleteData();
}

initRabbitMQ().then(() => {
  initEvents();
  prepareOrdersJob();
});
