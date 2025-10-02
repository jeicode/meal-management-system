import { IncomingMessage, ServerResponse } from "http";
import { InventoryService } from "src/api/inventory/domain/services/inventory.service";
import { RabbitMQInventoryDatasource } from "src/api/inventory/infraestructure/rabbitmq/rabbitmq-inventory.datasource";
import { Request } from "src/core/interfaces/http.interface";
import { handleError, sendResponse } from "src/shared/utils/http/http.utils";

const inventoryService = new InventoryService(new RabbitMQInventoryDatasource());

/**
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export async function getPurchaseHistoryController(req: Request, res: ServerResponse) {
    try {
      const { take, skip } = req.query;
      const data = await inventoryService.getInventoryPurchaseHistory({ take: Number(take), skip: Number(skip) });
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
        if (data.error) return sendResponse({res, status: 500, data:{error: data.error}});
        sendResponse({res, status: 200, data: {data}});

    } catch (err) {
        handleError(err, res);
    }
}
