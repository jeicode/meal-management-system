import { INVENTORY_INGREDIENTS_CHANGE_QUEUE } from "../../core/constants/raabitmq.constants";
import { logError } from "../../shared/utils/logs.utils";
import { channel } from "../../core/config/rabbitmq.config";
import { sseClients } from "../../api/sse/controller";


export async function suscribeAndResponseInventoryIngredients() {
  if (!channel) throw new Error('RabbitMQ no inicializado');
  try {
    const { consumerTag } = await channel.consume(INVENTORY_INGREDIENTS_CHANGE_QUEUE, async (msg) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        for (const client of sseClients) {
          client.write(`event: inventory.ingredients\ndata: ${JSON.stringify(data)}\n\n`);
        }
        channel!.ack(msg);
      }
    }, { noAck: false });
    return consumerTag;
  } catch (err: unknown) {
    logError('❌ suscribeInventoryIngredients', (err as Error).message);
    return '';
  }
}