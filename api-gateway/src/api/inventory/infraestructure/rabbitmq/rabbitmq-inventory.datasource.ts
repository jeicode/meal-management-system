import { randomUUID } from 'crypto';
import { channel } from 'src/config/rabbitmq.config';
import {
  GetInventoryPurchaseHistoryParams,
  InventoryDatasource,
} from 'src/api/inventory/domain/datasources/inventory.datasource';
import {
  INVENTORY_INGREDIENTS_CHANGE_QUEUE,
  INVENTORY_INGREDIENTS_QUEUE,
  INVENTORY_PURCHASE_HISTORY_QUEUE,
} from 'src/core/constants/raabitmq.constants';
import { environment } from 'src/config/enviroment.config';
import { sseClients } from 'src/api/sse/sse.controller';
import { logError } from 'src/shared/utils/logs/logs.utils';

export class RabbitMQInventoryDatasource implements InventoryDatasource {
  async getInventoryIngredients(): Promise<Record<string, unknown>> {
    if (!channel) throw new Error('RabbitMQ no inicializado');
    return new Promise(resolve => {
      channel!.assertQueue('', { exclusive: true }).then(({ queue: randomQueue }) => {
        const correlationId = randomUUID();
        const buffer = Buffer.from(JSON.stringify({}));
        channel!.sendToQueue(INVENTORY_INGREDIENTS_QUEUE, buffer, {
          replyTo: randomQueue,
          correlationId,
        });

        const timeout = setTimeout(() => {
          channel!.deleteQueue(randomQueue);
          resolve({ error: { message: 'Tiempo de espera excedido' } });
        }, environment.TIMEOUT_RABBITMQ || 10000);

        channel!.consume(
          randomQueue,
          msg => {
            if (msg?.properties?.correlationId === correlationId) {
              clearTimeout(timeout);
              const result = JSON.parse(msg.content.toString());
              channel!.deleteQueue(randomQueue);
              resolve(result);
            }
          },
          { noAck: true },
        );
      });
    });
  }

  async getInventoryPurchaseHistory(
    params: GetInventoryPurchaseHistoryParams,
  ): Promise<Record<string, unknown>> {
    if (!channel) throw new Error('RabbitMQ no inicializado');
    return new Promise(resolve => {
      channel!.assertQueue('', { exclusive: true }).then(({ queue: randomQueue }) => {
        const correlationId = randomUUID();
        const buffer = Buffer.from(JSON.stringify(params));
        channel!.sendToQueue(INVENTORY_PURCHASE_HISTORY_QUEUE, buffer, {
          replyTo: randomQueue,
          correlationId: correlationId,
        });
        const timeout = setTimeout(() => {
          channel!.deleteQueue(randomQueue);
          resolve({ error: { message: 'Tiempo de espera excedido' } });
        }, environment.TIMEOUT_RABBITMQ || 10000);

        channel!.consume(
          randomQueue,
          msg => {
            if (msg?.properties?.correlationId === correlationId) {
              clearTimeout(timeout);
              const result = JSON.parse(msg.content.toString());
              channel!.deleteQueue(randomQueue);
              resolve(result);
            }
          },
          { noAck: true },
        );
      });
    });
  }

  async suscribeAndResponseInventoryIngredients() {
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
