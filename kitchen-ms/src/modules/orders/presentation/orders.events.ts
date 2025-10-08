import { orderHistoryTableChangeFilter } from '../../../config/db-changes.config';
import { KITCHEN_ORDERS_QUEUE } from '../../../core/constants/rabbitmq.constants';
import { logError } from '../../../shared/utils/logs.utils';
import { OrdersService } from '../domain/services/orders.service';
import { RabbitMQOrdersRpc } from '../infraestructure/rabbitmq/rabbitmq-orders-rpc';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Channel } from 'amqplib';

const ordersService = new OrdersService(new RabbitMQOrdersRpc());

export async function rpcOrdersPendingOrPreparing(dbChannel: RealtimeChannel) {
  try {
    dbChannel
      .on('postgres_changes', orderHistoryTableChangeFilter, async payload => {
        await ordersService.publishPendingOrder(payload);
      })
      .subscribe();
  } catch (error: unknown) {
    logError(
      '❌ Error subscribing to database changes: rpcOrdersPendingOrPreparing',
      (error as Error).message,
    );
  }
}

export async function rpcApiGatewayOrders(channel: Channel) {
  await channel.prefetch(1);
  channel.consume(KITCHEN_ORDERS_QUEUE, async msg => {
    if (!msg) return;
    const data = JSON.parse(msg.content.toString());
    const response = await ordersService.processKitchenOrders({ dishes: Number(data.dishes) });
    channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
      correlationId: msg.properties.correlationId,
    });
  });
}
