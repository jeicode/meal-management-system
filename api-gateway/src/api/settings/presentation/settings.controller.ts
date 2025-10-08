import { ServerResponse } from 'http';
import { Request } from 'src/core/interfaces/http.interface';

import { SettingsRpcService } from '../domain/services/settings-rpc.service';
import { RabbitMQSettingsDatasource } from '../infrastructure/rabbitmq/rabbitmq-inventory-rpc';
import { handleError, sendResponse } from 'src/shared/utils/http/http.utils';

const settingsRpcService = new SettingsRpcService(new RabbitMQSettingsDatasource());
export async function deleteDataController(req: Request, res: ServerResponse) {
  try {
    await settingsRpcService.deleteData();
    sendResponse({ res, status: 200, data: { ok: true } });
  } catch (err) {
    handleError(err, res);
  }
}
