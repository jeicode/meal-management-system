import { initRabbitMQ } from "./config/rabbitmq.config";
import { prepareOrdersJob } from "./jobs";
import { rpcApiGatewayOrders, rpcOrdersPendingOrPreparing } from "./modules/api-gateway/events";
import { rpcFoodInventoryHistoryRequest } from "./modules/food-inventory/events";
import { rpcOrdersDelivered, rpcOrdersHistory, rpcRecipes } from "./modules/kitchen/events";


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

