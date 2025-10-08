import { SettingsRpcService } from '../domain/services/settings-rpc.service';
import { RabbitMQSettingsRpc } from '../infrastructure/rabbitmq/rabbitmq-settings-rpc';

const settingsService = new SettingsRpcService(new RabbitMQSettingsRpc());
export async function rpcDeleteData() {
  settingsService.deleteData();
}
