import { setupRabbitMQ } from "./config/rabbitmq.config";
import { 
    rpcHistoryPurchase, 
    rpcInventoryIngredients, 
    suscribeIngredientsChanges } 
from "./events/inventory.events";
import { rpcKitchenRequests } from "./events/kitchen.events";
import { makePendingIngredientPurchases } from "./jobs/jobs";

setupRabbitMQ().then(() => {
    suscribeIngredientsChanges();
    rpcInventoryIngredients();
    rpcKitchenRequests();
    rpcHistoryPurchase();
    makePendingIngredientPurchases();
})

