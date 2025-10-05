import { dbChannel, orderHistoryTableChangeFilter } from 'src/config/db-changes.config';
import { ApiGatewayDatasource } from '../../domain/datasources/api-gateway.datasource';
import { channel } from 'src/config/rabbitmq.config';
import {
  KITCHEN_ORDERS_PENDING_QUEUE,
  KITCHEN_ORDERS_QUEUE,
} from 'src/core/constants/rabbitmq.constants';
import { logError } from 'src/shared/utils/logs.utils';
import { processKitchenOrders } from '../../../kitchen/domain/services/process-orders.service';

export class RabbitMQApiGatewayDatasource implements ApiGatewayDatasource {
  rpcOrdersPendingOrPreparing() {
    try {
      dbChannel
        .on('postgres_changes', orderHistoryTableChangeFilter, payload => {
          channel.sendToQueue(KITCHEN_ORDERS_PENDING_QUEUE, Buffer.from(JSON.stringify(payload)));
        })
        .subscribe();
    } catch (err: any) {
      logError(
        '❌ Error subscribing to database changes: listenOrdersPendingOrPreparing',
        err.message,
      );
    }
  }

  async rpcApiGatewayOrders() {
    try {
      await channel.prefetch(1);
      channel.consume(
        KITCHEN_ORDERS_QUEUE,
        async msg => {
          if (msg !== null) {
            const data = JSON.parse(msg.content.toString());
            const response = await processKitchenOrders({
              orders: Number(data.dishes),
              presetRecipesIds: data.presetRecipesIds,
            });
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
              correlationId: msg.properties.correlationId,
            });
          }
        },
        { noAck: true },
      );
    } catch (err: unknown) {
      logError('❌ consumeApiGatewayOrders', (err as Error).message);
    }
  }
}
