import { IncomingMessage, ServerResponse } from "http";
import { getInventoryIngredients, getInventoryPurchaseHistory } from "../shared/services/rabbitmq.service";
import { handleError, sendResponse } from "../shared/utils/http/http.utils";
import { Request } from "../interfaces/http.interface";



/**
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export async function getPurchaseHistoryController(req: Request, res: ServerResponse) {
    try {
        const {take, skip} = req.query;
        const dataToSent = {take: Number(take), skip: Number(skip)}
        const data:any = await getInventoryPurchaseHistory(dataToSent);
        if (data.error) return sendResponse({res, status: 500, data});
        sendResponse({res, status: 200, data});

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
export async function getInventoryIngredientsController(req: IncomingMessage, res: ServerResponse) {
    try {
        const data:any = await getInventoryIngredients();
        if (data.error) return sendResponse({res, status: 500, data:{error: data.error}});
        sendResponse({res, status: 200, data: {data}});

    } catch (err: any) {
        handleError(err, res);
    }
}
