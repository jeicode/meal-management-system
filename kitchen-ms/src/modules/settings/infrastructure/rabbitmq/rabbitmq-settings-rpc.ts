import { channel } from '../../../../config/rabbitmq.config';
import { DELETE_DATA_QUEUE } from '../../../../core/constants/rabbitmq.constants';
import { logError } from '../../../../shared/utils/logs.utils';
import { deleteAllOrders } from '../../../orders/domain/repositories/orders.repository';
import { SettingsDatasource } from '../../domain/datasources/settings.datasource';

export class RabbitMQSettingsRpc implements SettingsDatasource {
  async deleteData() {
    await channel.prefetch(1);
    try {
      channel.consume(
        DELETE_DATA_QUEUE,
        async msg => {
          if (msg) {
            await deleteAllOrders();
            channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify('data_deleted')),
              {
                correlationId: msg.properties.correlationId,
              },
            );
            channel.ack(msg);
          }
        },
        { noAck: false },
      );
    } catch (err: unknown) {
      logError('❌ deleteData', (err as Error).message);
    }
  }
}
