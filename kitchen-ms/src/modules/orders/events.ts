// modules/orders/orders.events.ts
import { OrdersService } from './service';
import { RabbitOrdersDatasource } from './infraestructure/queue-mesaging/rabbit.implementation';
import { RealtimeChannel } from '@supabase/supabase-js';
import { orderHistoryTableChangeFilter } from 'src/config/db-changes.config';
import { logError } from 'src/shared/utils/logs.utils';
import { Channel } from 'amqplib';
import { KITCHEN_ORDERS_QUEUE } from 'src/domain/constants/raabitmq.constants';

const ordersService = new OrdersService(new RabbitOrdersDatasource());

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