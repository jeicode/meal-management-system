import { channel } from '../../../../config/rabbitmq.config';
import { OrderDatasource } from '../../domain/datasources/orders.datasource';
import { FI_HISTORY_ORDERS_REQUEST_QUEUE } from '../../../../core/constants/rabbitmq.constants';
import { IOrderHistoryUpdate } from '../../../../core/interfaces/order-history.interface';
import { randomUUID } from 'crypto';

export class RabbitMQOrderDatasource implements OrderDatasource {
  async requestOrderHistoryToKitchen(data: IOrderHistoryUpdate): Promise<any> {
    await channel.prefetch(1);
    return new Promise(resolve => {
      channel.assertQueue('', { exclusive: true }).then(({ queue: randomQueue }) => {
        const correlationId = randomUUID();
        const buffer = Buffer.from(JSON.stringify(data));
        channel.sendToQueue(FI_HISTORY_ORDERS_REQUEST_QUEUE, buffer, {
          replyTo: randomQueue,
          correlationId: correlationId,
        });

        const timeout = setTimeout(() => {
          channel.deleteQueue(randomQueue);
          resolve({ error: { message: 'Tiempo de espera excedido 15s' } });
        }, 15000);

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
