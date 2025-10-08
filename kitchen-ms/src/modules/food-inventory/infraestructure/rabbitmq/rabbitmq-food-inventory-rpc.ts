import { orm } from '../../../../config/orm.config';
import {
  FoodInventoryDatasource,
  RequestIngredientsToInventoryParams,
} from '../../domain/datasources/food-inventory.datasource';
import { channel } from '../../../../config/rabbitmq.config';
import { logError } from '../../../../shared/utils/logs.utils';
import { handleError } from '../../../../shared/utils/general.utils';
import { randomUUID } from 'crypto';
import {
  FI_HISTORY_ORDERS_REQUEST_QUEUE,
  FOOD_INVENTORY_INGREDIENTS_QUEUE,
} from '../../../../core/constants/rabbitmq.constants';

export class RabbitMQFoodInventoryRpc implements FoodInventoryDatasource {
  async rpcFoodInventoryHistoryRequest() {
    try {
      await channel.prefetch(1);
      channel.consume(
        FI_HISTORY_ORDERS_REQUEST_QUEUE,
        async msg => {
          if (msg) {
            try {
              const data = JSON.parse(msg.content.toString());
              if (data.id) {
                await orm.orderHistory.update({ where: { id: data.id }, data });
              }
              const response = await orm.orderHistory.findFirst({
                where: { status: 'WAITING_FOR_INGREDIENTS' },
                orderBy: { createdAt: 'asc' },
              });

              channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
                correlationId: msg.properties.correlationId,
              });
            } catch (error: unknown) {
              channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(JSON.stringify(handleError(error))),
                { correlationId: msg.properties.correlationId },
              );
            }
            channel.ack(msg);
          }
        },
        { noAck: false },
      );
    } catch (err: unknown) {
      logError('❌ consumeFoodInventoryHistoryRequest', (err as Error).message);
    }
  }
  requestIngredientsToInventory({ order }: RequestIngredientsToInventoryParams): Promise<any> {
    return new Promise(resolve => {
      const correlationId = randomUUID();
      channel.assertQueue('', { exclusive: true }).then(({ queue: randomQueue }) => {
        const buffer = Buffer.from(JSON.stringify(order));

        channel.sendToQueue(FOOD_INVENTORY_INGREDIENTS_QUEUE, buffer, {
          replyTo: randomQueue,
          correlationId: correlationId,
        });

        const timeout = setTimeout(() => {
          channel.deleteQueue(randomQueue);
          resolve({ error: { message: 'Tiempo de espera excedido 20s' } });
        }, 20000);

        channel.consume(
          randomQueue,
          msg => {
            if (msg?.properties?.correlationId === correlationId) {
              clearTimeout(timeout);
              const result = JSON.parse(msg.content.toString());
              channel.deleteQueue(randomQueue);
              resolve(result);
            }
          },
          { noAck: true },
        );
      });
    });
  }
}
