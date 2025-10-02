import { randomUUID } from 'crypto';
import {
  KITCHEN_ORDERS_HISTORY_QUEUE,
  KITCHEN_ORDERS_PENDING_QUEUE,
  KITCHEN_ORDERS_QUEUE,
  KITCHEN_RECIPE_QUEUE,
} from 'src/core/constants/raabitmq.constants';
import { environment } from 'src/config/enviroment.config';
import { channel } from 'src/config/rabbitmq.config';
import { KitchenDatasource } from 'src/api/kitchen/domain/datasources/kitchen.datasource';
import { sseClients } from 'src/api/sse/sse.controller';
import { logError } from 'src/shared/utils/logs/logs.utils';

export class RabbitMQKitchenDatasource implements KitchenDatasource {
  async getRecipesFromKitchen(): Promise<Record<string, unknown>> {
    if (!channel) throw new Error('RabbitMQ no inicializado');
    return new Promise(resolve => {
      const correlationId = randomUUID();
      channel!.assertQueue('', { exclusive: true }).then(({ queue: randomQueue }) => {
        const buffer = Buffer.from(JSON.stringify({}));

        channel!.sendToQueue(KITCHEN_RECIPE_QUEUE, buffer, {
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

  async sendOrderToKitchen(message: object): Promise<Record<string, unknown>> {
    if (!channel) throw new Error('RabbitMQ no inicializado');
    return new Promise(resolve => {
      const correlationId = randomUUID();
      channel!.assertQueue('', { exclusive: true }).then(({ queue: randomQueue }) => {
        const buffer = Buffer.from(JSON.stringify(message));
        channel!.sendToQueue(KITCHEN_ORDERS_QUEUE, buffer, {
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

  async getKitchenOrders(params: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!channel) throw new Error('RabbitMQ no inicializado');
    return new Promise(resolve => {
      const correlationId = randomUUID();
      channel!.assertQueue('', { exclusive: true }).then(({ queue: randomQueue }) => {
        const buffer = Buffer.from(JSON.stringify(params));
        channel!.sendToQueue(KITCHEN_ORDERS_HISTORY_QUEUE, buffer, {
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

  async suscribeOrdersPendingOrPreparing(){
    if (!channel) throw new Error('RabbitMQ no inicializado');
    try {
      await channel.prefetch(1);
      const { consumerTag } = await channel.consume(
        KITCHEN_ORDERS_PENDING_QUEUE,
        async msg => {
          if (msg) {
            const data = JSON.parse(msg.content.toString());
            for (const client of sseClients) {
              client.write(`event: kitchen.orders\ndata: ${JSON.stringify(data)}\n\n`);
            }
            channel!.ack(msg);
          }
        },
        { noAck: false },
      );
      return consumerTag;
    } catch (err: unknown) {
      logError('❌ suscribeOrdersPendingOrPreparing', (err as Error).message);
    }
  }
}
