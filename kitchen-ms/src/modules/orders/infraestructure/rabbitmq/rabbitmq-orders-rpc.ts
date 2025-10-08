import { channel } from '../../../../config/rabbitmq.config';
import {
  KITCHEN_ORDERS_PENDING_QUEUE,
  KITCHEN_ORDERS_QUEUE,
} from '../../../../core/constants/rabbitmq.constants';
import { processKitchenOrders } from '../../../kitchen/domain/services/process-orders.service';
import { OrdersDatasource } from '../../domain/datasources/orders.datasource';

export class RabbitMQOrdersRpc implements OrdersDatasource {
  async publishPendingOrder(payload: unknown): Promise<void> {
    channel.sendToQueue(KITCHEN_ORDERS_PENDING_QUEUE, Buffer.from(JSON.stringify(payload)));
  }
  async processKitchenOrders(): Promise<any> {
    await channel.prefetch(1);
    channel.consume(KITCHEN_ORDERS_QUEUE, async msg => {
      if (!msg) return;
      const data: any = JSON.parse(msg.content.toString());
      const response = await processKitchenOrders({ orders: Number(data.dishes) });
      channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
        correlationId: msg.properties.correlationId,
      });
    });
  }
}
