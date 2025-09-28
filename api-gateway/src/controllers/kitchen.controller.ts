import { handleError } from '../shared/utils/http/http.utils';
import { sendResponse } from '../shared/utils/http/http.utils';
import { 
    getOrders, 
    getRecipesFromKitchen, 
    sendOrderToKitchen 
} from '../shared/services/rabbitmq.service';
import { IncomingMessage, ServerResponse } from 'http';
import { Request } from '../interfaces/http.interface';

export async function getOrdersController(req: Request, res: ServerResponse) {
    try {
        const body = req.body;
        const data = await getOrders(body);
        sendResponse({res, status: 200, data: {data}});
    } catch (err: any) {
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
        const result = await sendOrderToKitchen(req.query);
        if (result.error) return sendResponse({res, status: 500, data: result});
        sendResponse({res, status: 200, data: result});
    } catch (err: any) {
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
        const data:any = await getRecipesFromKitchen();
        sendResponse({res, status: 200, data: {data}});
    } catch (err: any) {
        handleError(err, res);
    }
}