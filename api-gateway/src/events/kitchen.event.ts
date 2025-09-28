import { channel } from "../config/rabbitmq.config";
import { KITCHEN_ORDERS_PENDING_QUEUE } from "../constants/raabitmq.constants";
import { sseClients } from "../controllers/sse.controller";
import { logError } from "../shared/utils/logs.utils";

export async function suscribeOrdersPendingOrPreparing() {
    try {
      await channel.prefetch(1);
      const { consumerTag } = await channel.consume(KITCHEN_ORDERS_PENDING_QUEUE, async (msg) => {
        if (msg){
            const data = JSON.parse(msg.content.toString());
            for (const client of sseClients) {
              client.write(`event: kitchen.orders\ndata: ${JSON.stringify(data)}\n\n`);
            }
            channel.ack(msg);
        }
      }, { noAck: false });
      return consumerTag;
    } catch (err: unknown) {
      logError('❌ suscribeOrdersPendingOrPreparing', (err as Error).message);
    }
}