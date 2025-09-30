import { logError } from "../shared/utils/logs.utils";
import { channel } from "../config/rabbitmq.config";
import { KITCHEN_ORDERS_PENDING_QUEUE, KITCHEN_ORDERS_QUEUE } from "../constants/raabitmq.constants";
import { processKitchenOrders } from "../shared/services/rabbitmq.service";
import { orderHistoryTableChangeFilter, dbChannel } from "../config/db-changes.config";

export function listenOrdersPendingOrPreparing() {
  try {
    dbChannel.on('postgres_changes', orderHistoryTableChangeFilter, (payload) => {
      channel.sendToQueue(KITCHEN_ORDERS_PENDING_QUEUE, Buffer.from(JSON.stringify(payload)));
    }).subscribe();
  } catch (err: any) {
    logError('❌ Error subscribing to database changes: listenOrdersPendingOrPreparing', err.message);
  }
}

export async function rpcApiGatewayOrders() {
    try {
      await channel.prefetch(1);
      channel.consume(KITCHEN_ORDERS_QUEUE, async(msg) => {
        if (msg !== null) {
          const data = JSON.parse(msg.content.toString());
          const response = await processKitchenOrders({orders: Number(data.dishes), channel})
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId: msg.properties.correlationId }
          );
        }
      }, { noAck: true });
    } catch (err: unknown) {
      logError('❌ consumeApiGatewayOrders', (err as Error).message);
    }
}