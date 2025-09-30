import { setupRabbitMQ } from "./config/rabbitmq.config";
import { listenOrdersPendingOrPreparing, rpcApiGatewayOrders } from "./events/api-gateway.events";
import { rpcFoodInventoryHistoryRequest } from "./events/food-inventory.events";
import { rpcOrdersDelivered, rpcOrdersHistory, rpcRecipes } from "./events/kitchen.events";
import { prepareOrdersJob } from "./jobs";


setupRabbitMQ().then(() => {
    listenOrdersPendingOrPreparing();
    
    rpcApiGatewayOrders();
    rpcFoodInventoryHistoryRequest();
    rpcOrdersDelivered();
    rpcOrdersHistory();
    rpcRecipes();
    // JOBS
    prepareOrdersJob();
})

