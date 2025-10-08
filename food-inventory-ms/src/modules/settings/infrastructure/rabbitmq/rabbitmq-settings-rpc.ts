import { channel } from '../../../../config/rabbitmq.config';
import { DELETE_DATA_QUEUE } from '../../../../core/constants/rabbitmq.constants';
import { SettingsDatasource } from '../../domain/datasources/settings.datasource';
import { logError } from '../../../../shared/utils/logs.utils';
import {
  deleteAllPurchaseHistory,
  resetIngredientsQuantity,
} from '../../../../modules/food-inventory/domain/repositories/food-inventory.repository';

export class RabbitMQSettingsRpc implements SettingsDatasource {
  async deleteData() {
    try {
      await channel.prefetch(1);
      channel.consume(
        DELETE_DATA_QUEUE,
        async msg => {
          if (msg) {
            await Promise.all([deleteAllPurchaseHistory(), resetIngredientsQuantity()]);
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
