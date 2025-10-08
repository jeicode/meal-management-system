import { IncomingMessage, ServerResponse } from 'http';
import { InventoryRpcService } from '../domain/services/inventory-rpc.service';
import { RabbitMQInventoryRpcDatasource } from '../infrastructure/rabbitmq/rabbitmq-inventory-rpc';
import { Request } from '../../../core/interfaces/http.interface';
import { handleError, sendResponse } from '../../../shared/utils/http/http.utils';

const inventoryService = new InventoryRpcService(new RabbitMQInventoryRpcDatasource());

/**
 *
 * @param req
 * @param res
 * @returns
 */
export async function getPurchaseHistoryController(req: Request, res: ServerResponse) {
  try {
    const { take, skip } = req.query;
    const data = await inventoryService.getInventoryPurchaseHistory({
      take: Number(take),
      skip: Number(skip),
    });
    if (data.error) return sendResponse({ res, status: 500, data });
    sendResponse({ res, status: 200, data });
  } catch (err) {
    handleError(err, res);
  }
}
/**
 *
 * @param req
 * @param res
 * @returns
 */
export async function getInventoryIngredientsController(req: IncomingMessage, res: ServerResponse) {
  try {
    const data = await inventoryService.getInventoryIngredients();
    if (data.error) return sendResponse({ res, status: 500, data: { error: data.error } });
    sendResponse({ res, status: 200, data: { data } });
  } catch (err) {
    handleError(err, res);
  }
}
