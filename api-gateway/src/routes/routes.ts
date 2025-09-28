import { parse } from "url";
import { IncomingMessage, ServerResponse } from "http";
import { getKitchenRecipesController, getOrdersController, kitchenOrderController } from "../controllers/kitchen.controller";
import { getInventoryIngredientsController, getPurchaseHistoryController } from "../controllers/inventory.controller";
import { runServerSSE } from "../controllers/sse.controller";
import { contentType } from "../constants/http.constants";
import { Request } from "../interfaces/http.interface";
import { handleError, parseQueryToObject } from "../shared/utils/http/http.utils";
import { getOrdersSchema, orderSchema } from "../validations/kitchen/kitchen-order.schemas";
import { getPurchaseHistorySchema } from "../validations/inventory/inventory.schemas";

const BASE_API = '/api/v1';

export function addRoutes(req: IncomingMessage, res: ServerResponse) {
    const parsedUrl = parse(req.url || '', true);
    const pathname = parsedUrl.pathname;
    const request: Request = req as Request;
    request.query = parseQueryToObject({ ...parsedUrl.query });

    if (req.method === 'GET' && pathname === `${BASE_API}/sse`) {
        return runServerSSE(req, res);
    }

    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', async() => {
        try {
            request.body = body ? JSON.parse(body) : {};
            if (req.method === 'GET' && pathname === `${BASE_API}/kitchen/order`) {
                await orderSchema.validate(request.query, { abortEarly: false });
                return kitchenOrderController(request, res);
            }
            else if (req.method === 'GET' && pathname === `${BASE_API}/kitchen/recipes`) {
                return getKitchenRecipesController(request, res);
            }
            else if (req.method === 'POST' && pathname === `${BASE_API}/kitchen/orders`) {
                await getOrdersSchema.validate(request.body, { abortEarly: false });
                return getOrdersController(request, res);
            }
            else if (req.method === 'GET' && pathname === `${BASE_API}/inventory/purchase-history`) {
                await getPurchaseHistorySchema.validate(request.query, { abortEarly: false });
                return getPurchaseHistoryController(request, res);
            }
            else if (req.method === 'GET' && pathname === `${BASE_API}/inventory/ingredients`) {
                return getInventoryIngredientsController(request, res);
            }
            else {
                res.writeHead(404, contentType);
                return res.end(JSON.stringify({ error: 'Not Found' }));
            }
        } catch (error) {
            handleError(error, res);
            return;
        }
    });
}