import { dbChannel, ingredientTableChangeFilter } from "../config/db-changes.config";
import { channel } from "../config/rabbitmq.config";
import { INVENTORY_INGREDIENTS_CHANGE_QUEUE, INVENTORY_INGREDIENTS_QUEUE, INVENTORY_PURCHASE_HISTORY_QUEUE } from "../constants/raabitmq.constants";
import { getInventoryIngredients, getPurchaseHistory } from "../controllers/inventory/inventory.controller";
import { logError } from "../shared/utils/logs.utils";

export async function suscribeIngredientsChanges() {
  try {
    dbChannel.on('postgres_changes', ingredientTableChangeFilter, (payload) => {
      const {new: data, errors} = payload
      if (errors){
        const error = {
          message: errors?.[0],
          details: errors
        }
        return channel.sendToQueue(INVENTORY_INGREDIENTS_CHANGE_QUEUE, Buffer.from(JSON.stringify({error})));
      }
      return channel.sendToQueue(INVENTORY_INGREDIENTS_CHANGE_QUEUE, Buffer.from(JSON.stringify({data})));
    }).subscribe();
  } catch (err: any) {
    channel.sendToQueue(INVENTORY_INGREDIENTS_QUEUE, Buffer.from(JSON.stringify({
      data: null,
      error: {message: err.message, details: [err.message]}
    })));
    logError('❌ Error subscribing to Ingredient table changes', err.message);
  }
}

export async function rpcInventoryIngredients() {
  try {
    channel.consume(INVENTORY_INGREDIENTS_QUEUE, async (msg) => {
      if (msg) {
        const data = await getInventoryIngredients()
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(data)),
          { correlationId: msg.properties.correlationId }
        );
      }
    }, { noAck: true });
  } catch (err: unknown) {
    logError('❌ consumeInventoryIngredients', (err as Error).message);
  }
}

export async function rpcHistoryPurchase() {
  try {
    await channel.prefetch(1);
    channel.consume(INVENTORY_PURCHASE_HISTORY_QUEUE, async (msg) => {
      if (msg) {
        const {take, skip} = JSON.parse(msg.content.toString());
        const data = await getPurchaseHistory({take, skip})
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(data)),
          { correlationId: msg.properties.correlationId }
        );
        channel.ack(msg);
      }
    }, { noAck: false });
  } catch (err: unknown) {
    logError('❌ consumeHistoryPurchase', (err as Error).message);
  }
}

