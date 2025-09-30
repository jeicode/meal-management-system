import { sseClients } from "../../api/sse/controller";
import { channel } from "../../core/config/rabbitmq.config";
import { KITCHEN_ORDERS_PENDING_QUEUE } from "../../core/constants/raabitmq.constants";
import { logError } from "../../shared/utils/logs.utils";

export async function suscribeOrdersPendingOrPreparing() {  
  if (!channel) throw new Error('RabbitMQ no inicializado');
    try {
      await channel.prefetch(1);
      const { consumerTag } = await channel.consume(KITCHEN_ORDERS_PENDING_QUEUE, async (msg) => {
        if (msg){
            const data = JSON.parse(msg.content.toString());
            for (const client of sseClients) {
              client.write(`event: kitchen.orders\ndata: ${JSON.stringify(data)}\n\n`);
            }
            channel!.ack(msg);
        }
      }, { noAck: false });
      return consumerTag;
    } catch (err: unknown) {
      logError('❌ suscribeOrdersPendingOrPreparing', (err as Error).message);
    }
}