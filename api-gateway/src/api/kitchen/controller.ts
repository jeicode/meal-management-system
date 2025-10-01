import { handleError } from '../../shared/utils/http/http.utils';
import { sendResponse } from '../../shared/utils/http/http.utils';
import { IncomingMessage, ServerResponse } from 'http';
import { Request } from '../../core/interfaces/http.interface';

import { KitchenService } from './service';
import { RabbitMQKitchenDatasource } from './implementation.datasource';

const kitchenService = new KitchenService(new RabbitMQKitchenDatasource());

export async function getOrdersController(req: Request, res: ServerResponse) {
    try {
        const { take = 15, skip = 0, where, orderBy } = req.body;
        const data = await kitchenService.getKitchenOrders({ take: Number(take), skip: Number(skip), where, orderBy });
        sendResponse({res, status: 200, data: {data}});
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
export async function kitchenOrderController(req: Request, res: ServerResponse) {
    try {
        const { dishes } = req.query;
        const result = await kitchenService.sendOrderToKitchen({ dishes: Number(dishes) });
        if (result.error) return sendResponse({res, status: 500, data: result});
        sendResponse({res, status: 200, data: result});
    } catch (err) {
        handleError(err, res);
    }
}


/**
 * 
 * @param req 
 * @param res 
 */
export async function getKitchenRecipesController(req: IncomingMessage, res: ServerResponse) {
    try {
        const data = await kitchenService.getRecipesFromKitchen();
        sendResponse({res, status: 200, data: {data}});
    } catch (err) {
        handleError(err, res);
    }
}