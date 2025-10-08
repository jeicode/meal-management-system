import { channel } from '../../../../config/rabbitmq.config';
import { KitchenSubscriberDatasource } from '../../domain/datasources/kitchen.datasource';
import { KITCHEN_ORDERS_PENDING_QUEUE } from '../../../../core/constants/rabbitmq.constants';
import { sseClients } from '../../../../api/sse/sse.controller';
import { logError } from '../../../../shared/utils/logs/logs.utils';
import { subscribeQueue } from '../../../../shared/utils/rabbitmq/rabbitmq-suscriber.helper';

export class RabbitMQKitchenSubscriber implements KitchenSubscriberDatasource {
  async subscribeOrdersPendingOrPreparing(): Promise<string> {
    try {
      return await subscribeQueue(
        channel!,
        KITCHEN_ORDERS_PENDING_QUEUE,
        (msg, ack) => {
          try {
            const data = JSON.parse(msg.content.toString());
            for (const client of sseClients) {
              client.write(`event: kitchen.orders\ndata: ${JSON.stringify(data)}\n\n`);
            }
            ack();
          } catch (err) {
            logError('❌ Error processing kitchen.orders', (err as Error).message);
          }
        },
        { prefetch: 3, noAck: false },
      );
    } catch (err) {
      logError('❌ subscribeOrdersPendingOrPreparing', (err as Error).message);
      throw err;
    }
  }
}
