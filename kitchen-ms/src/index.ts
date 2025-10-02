import { initRabbitMQ } from "./config/rabbitmq.config";
import { prepareOrdersJob } from "./core/jobs/order.jobs";
import { rpcApiGatewayOrders, rpcOrdersPendingOrPreparing } from "./modules/api-gateway/presentation/api-gateway.events";
import { rpcFoodInventoryHistoryRequest } from "./modules/food-inventory/presentation/food-inventory.events";
import { rpcOrdersDelivered, rpcOrdersHistory, rpcRecipes } from "./modules/kitchen/presentation/kitchen.events";


function initEvents() {
    rpcOrdersPendingOrPreparing();
    rpcFoodInventoryHistoryRequest();
    rpcApiGatewayOrders();
    rpcOrdersDelivered();
    rpcOrdersHistory();
    rpcRecipes();
}

initRabbitMQ().then(() => {
    initEvents();
    prepareOrdersJob();
})

