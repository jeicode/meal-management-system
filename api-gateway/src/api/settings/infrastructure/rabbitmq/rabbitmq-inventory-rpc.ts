import { channel } from '../../../../config/rabbitmq.config';
import { DELETE_DATA_QUEUE } from '../../../../core/constants/rabbitmq.constants';
import { SettingsDatasource } from '../../domain/datasources/settings.datasource';
import { rpcRequest } from '../../../../shared/utils/rabbitmq/rabbitmq-rpc.helper';

export class RabbitMQSettingsDatasource implements SettingsDatasource {
  async deleteData(): Promise<Record<string, unknown>> {
    return rpcRequest(channel!, DELETE_DATA_QUEUE, {});
  }
}
