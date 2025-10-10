import { channel } from '../../../../config/rabbitmq.config';
import { KITCHEN_ORDERS_QUEUE } from '../../../../core/constants/rabbitmq.constants';
import { logError } from '../../../../shared/utils/logs.utils';
import { processKitchenOrders } from '../../../kitchen/domain/services/process-orders.service';
import { OrdersRpcDatasource } from '../../domain/datasources/orders.datasource';

export class RabbitMQOrdersRpc implements OrdersRpcDatasource {
  async rpcOrdersToKitchen(): Promise<any> {
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
      logError('❌ rpcOrdersToKitchen', (err as Error).message);
    }
  }
}
