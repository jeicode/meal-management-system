import { channel } from 'src/config/rabbitmq.config';
import {
  InventorySubscriberDatasource,
} from 'src/api/inventory/domain/datasources/inventory.datasource';
import {
  INVENTORY_INGREDIENTS_CHANGE_QUEUE,
} from 'src/core/constants/rabbitmq.constants';
import { sseClients } from 'src/api/sse/sse.controller';
import { logError } from 'src/shared/utils/logs/logs.utils';

export class RabbitMQInventorySubscriber implements InventorySubscriberDatasource {
  async subscribeAndResponseInventoryIngredients() {
    if (!channel) throw new Error('RabbitMQ no inicializado');
    try {
      const { consumerTag } = await channel.consume(
        INVENTORY_INGREDIENTS_CHANGE_QUEUE,
        async msg => {
          if (msg) {
            const data = JSON.parse(msg.content.toString());
            for (const client of sseClients) {
              client.write(`event: inventory.ingredients\ndata: ${JSON.stringify(data)}\n\n`);
            }
            channel!.ack(msg);
          }
        },
        { noAck: false },
      );
      return consumerTag;
    } catch (err: unknown) {
      logError('❌ suscribeInventoryIngredients', (err as Error).message);
      return '';
    }
  }
}
