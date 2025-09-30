import {
  KITCHEN_ORDERS_DELIVERED_QUEUE,
  KITCHEN_ORDERS_HISTORY_QUEUE,
  KITCHEN_RECIPE_QUEUE
} from "../constants/raabitmq.constants";
import { channel } from "../config/rabbitmq.config";
import { getOrdersDelivered, getOrdersHistory } from "../controllers/order-history/order-history.controller";
import { logError } from "../shared/utils/logs.utils";
import { getRecipes } from "../controllers/kitchen.controller";

export async function rpcOrdersDelivered() {
  try {
    await channel.prefetch(1);
    channel.consume(KITCHEN_ORDERS_DELIVERED_QUEUE, async (msg) => {
      if (msg !== null) {
        const response = await getOrdersDelivered()
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(response)),
          { correlationId: msg.properties.correlationId }
        );
      }
    }, { noAck: true });
  } catch (err: unknown) {
    logError('❌ consumeOrdersDelivered', (err as Error).message);
  }
}


export async function rpcOrdersHistory() {
  try {
    await channel.prefetch(1);
    channel.consume(KITCHEN_ORDERS_HISTORY_QUEUE, async (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        const response = await getOrdersHistory(data)
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(response)),
          { correlationId: msg.properties.correlationId }
        );
      }
    }, { noAck: true });
  } catch (err: unknown) {
    logError('❌ consumeOrdersHistory', (err as Error).message);
  }
}

export async function rpcRecipes() {
  try {
    await channel.prefetch(1);
    channel.consume(KITCHEN_RECIPE_QUEUE, async (msg) => {
      if (msg) {
        const response = await getRecipes()
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(response)),
          { correlationId: msg.properties.correlationId }
        );
        channel.ack(msg);
      }
    }, { noAck: false });
  } catch (err: unknown) {
    logError('❌ consumeOrdersHistory', (err as Error).message);
  }
}
