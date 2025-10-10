import { dbChannel, orderHistoryTableChangeFilter } from '../../../../config/db-changes.config';
import { channel } from '../../../../config/rabbitmq.config';
import { KITCHEN_ORDERS_PENDING_QUEUE } from '../../../../core/constants/rabbitmq.constants';
import { logError } from '../../../../shared/utils/logs.utils';
import { OrdersSubscriberDatasource } from '../../domain/datasources/orders.datasource';

export class RabbitMQOrdersSubscriber implements OrdersSubscriberDatasource {
  async subscribeToOrderChanges(): Promise<void> {
    try {
      dbChannel
        .on('postgres_changes', orderHistoryTableChangeFilter, (payload: any) => {
          channel.sendToQueue(KITCHEN_ORDERS_PENDING_QUEUE, Buffer.from(JSON.stringify(payload)));
        })
        .subscribe();
    } catch (err: any) {
      logError('❌ Error subscribing to database changes: subscribeToOrderChanges', err.message);
    }
  }
}
