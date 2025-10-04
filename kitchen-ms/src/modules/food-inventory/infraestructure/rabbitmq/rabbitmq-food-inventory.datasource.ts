import { orm } from 'src/config/orm.config';
import { FoodInventoryDatasource, RequestIngredientsToInventoryParams } from '../../domain/datasources/food-inventory.datasource';
import { channel } from 'src/config/rabbitmq.config';
import {
  FI_HISTORY_ORDERS_REQUEST_QUEUE,
  FOOD_INVENTORY_INGREDIENTS_QUEUE,
} from 'src/core/constants/rabbitmq.constants';
import { logError } from 'src/shared/utils/logs.utils';
import { handleError } from 'src/shared/utils/general.utils';
import { randomUUID } from 'crypto';

export class RabbitMQFoodInventoryDatasource implements FoodInventoryDatasource {
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
  requestIngredientsToInventory({
    order,
    channel,
  }: RequestIngredientsToInventoryParams): Promise<any> {
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
