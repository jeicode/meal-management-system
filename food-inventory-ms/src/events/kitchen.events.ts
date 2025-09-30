import { logError } from "../shared/utils/logs.utils";
import { channel } from "../config/rabbitmq.config";
import { updateInventoryFromRecipesRequest } from "../controllers/inventory/inventory.controller";
import { FOOD_INVENTORY_INGREDIENTS_QUEUE, PURCHASE_INGREDIENT_QUEUE } from "../constants/raabitmq.constants";

export async function rpcKitchenRequests() {
    try {
      await channel.prefetch(1);
      channel.consume(FOOD_INVENTORY_INGREDIENTS_QUEUE, async (msg) => {
        if (msg) {
          const order = JSON.parse(msg.content.toString());
          const res = await updateInventoryFromRecipesRequest({order})   
          const data = {
            orderId: order.id,
            ingredients: res?.ingredientsPendingPurchase
          }
          if (Object.keys(data.ingredients).length > 0){
            channel.sendToQueue(PURCHASE_INGREDIENT_QUEUE, Buffer.from(JSON.stringify(data)));
          }
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(res)),
            { correlationId: msg.properties.correlationId }
          );
          channel.ack(msg);
        }
      }, { noAck: false });
    } catch (err: unknown) {
      logError('❌ consumeKitchenRequests', (err as Error).message);
    }
  }
  