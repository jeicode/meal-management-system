import { randomUUID } from "crypto";
import { channel } from "../../config/rabbitmq.config";
import { 
    INVENTORY_INGREDIENTS_QUEUE, 
    INVENTORY_PURCHASE_HISTORY_QUEUE, 
    KITCHEN_ORDERS_DELIVERED_QUEUE, 
    KITCHEN_ORDERS_HISTORY_QUEUE, 
    KITCHEN_ORDERS_QUEUE, 
    KITCHEN_RECIPE_QUEUE
} from '../../constants/raabitmq.constants';
import { environment } from "../../config/enviroment.config";



export async function getInventoryIngredients() {
    return new Promise(async (resolve) => {
        const correlationId = randomUUID();
        const { queue: randomQueue } = await channel.assertQueue('', { exclusive: true });
        const buffer = Buffer.from(JSON.stringify({}));
        channel.sendToQueue(INVENTORY_INGREDIENTS_QUEUE, buffer, { replyTo: randomQueue, correlationId: correlationId });

        const timeout = setTimeout(() => {
            channel.deleteQueue(randomQueue);
            resolve({ error: { message: 'Tiempo de espera excedido' } });
        }, environment.TIMEOUT_RABBITMQ || 10000);
        
        channel.consume(randomQueue, msg => {
            if (msg?.properties?.correlationId === correlationId) {
                clearTimeout(timeout);
                const result = JSON.parse(msg.content.toString());
                channel.deleteQueue(randomQueue);
                resolve(result);
            }
        }, { noAck: true });
    });
}

export async function getRecipesFromKitchen() {
    return new Promise(async (resolve) => {
        const correlationId = randomUUID();
        const { queue: randomQueue } = await channel.assertQueue('', { exclusive: true });
        const buffer = Buffer.from(JSON.stringify({}));

        channel.sendToQueue(KITCHEN_RECIPE_QUEUE, buffer, { replyTo: randomQueue, correlationId: correlationId });

        const timeout = setTimeout(() => {
            channel.deleteQueue(randomQueue);
            resolve({ error: { message: 'Tiempo de espera excedido' } });
        }, environment.TIMEOUT_RABBITMQ || 10000);
        
        channel.consume(randomQueue, msg => {
            if (msg?.properties?.correlationId === correlationId) {
                clearTimeout(timeout);
                const result = JSON.parse(msg.content.toString());
                channel.deleteQueue(randomQueue);
                resolve(result);
            }
        }, { noAck: true });
    });
}

export async function sendOrderToKitchen(message: object): Promise<any> {
    return new Promise(async (resolve) => {
        const correlationId = randomUUID();
        const { queue: randomQueue } = await channel.assertQueue('', { exclusive: true });
        const buffer = Buffer.from(JSON.stringify(message));
        channel.sendToQueue(KITCHEN_ORDERS_QUEUE, buffer, { replyTo: randomQueue, correlationId: correlationId });

        const timeout = setTimeout(() => {
            channel.deleteQueue(randomQueue);
            resolve({ error: { message: 'Tiempo de espera excedido' } });
        }, environment.TIMEOUT_RABBITMQ || 10000);
        
        channel.consume(randomQueue, msg => {
            if (msg?.properties?.correlationId === correlationId) {
                clearTimeout(timeout);
                const result = JSON.parse(msg.content.toString());
                channel.deleteQueue(randomQueue);
                resolve(result);
            }
        }, { noAck: true });

    });
}


export async function getOrdersDelivered() {
    return new Promise(async (resolve) => {
        const correlationId = randomUUID();
        const { queue: randomQueue } = await channel.assertQueue('', { exclusive: true });
        const buffer = Buffer.from(JSON.stringify({}));

        channel.sendToQueue(KITCHEN_ORDERS_DELIVERED_QUEUE, buffer, { replyTo: randomQueue, correlationId: correlationId });

        const timeout = setTimeout(() => {
            channel.deleteQueue(randomQueue);
            resolve({ error: { message: 'Tiempo de espera excedido' } });
        }, environment.TIMEOUT_RABBITMQ || 10000);
        
        channel.consume(randomQueue, msg => {
            if (msg?.properties?.correlationId === correlationId) {
                clearTimeout(timeout);
                const result = JSON.parse(msg.content.toString());
                channel.deleteQueue(randomQueue);
                resolve(result);
            }
        }, { noAck: true });
    });
}


type GetInventoryPurchaseHistoryParams = {
    take?: number;
    skip?: number;
}
export async function getInventoryPurchaseHistory(params: GetInventoryPurchaseHistoryParams) {
    return new Promise(async (resolve) => {
        const correlationId = randomUUID();
        const { queue: randomQueue } = await channel.assertQueue('', { exclusive: true });
        const buffer = Buffer.from(JSON.stringify(params));

        channel.sendToQueue(INVENTORY_PURCHASE_HISTORY_QUEUE, buffer, { replyTo: randomQueue, correlationId: correlationId });

        const timeout = setTimeout(() => {
            channel.deleteQueue(randomQueue);
            resolve({ error: { message: 'Tiempo de espera excedido' } });
        }, environment.TIMEOUT_RABBITMQ || 10000);
        
        channel.consume(randomQueue, msg => {
            if (msg?.properties?.correlationId === correlationId) {
                clearTimeout(timeout);
                const result = JSON.parse(msg.content.toString());
                channel.deleteQueue(randomQueue);
                resolve(result);
            }
        }, { noAck: true });
    });
}


type GetOrdersParams = Record<string, any>
export async function getOrders(params: GetOrdersParams): Promise<Record<string, any>> {
    return new Promise(async (resolve) => {
        const correlationId = randomUUID();
        const { queue: randomQueue } = await channel.assertQueue('', { exclusive: true });
        const buffer = Buffer.from(JSON.stringify(params));
        channel.sendToQueue(KITCHEN_ORDERS_HISTORY_QUEUE, buffer, { replyTo: randomQueue, correlationId: correlationId });

        const timeout = setTimeout(() => {
            channel.deleteQueue(randomQueue);
            resolve({ error: { message: 'Tiempo de espera excedido' } });
        }, environment.TIMEOUT_RABBITMQ || 10000);
        
        channel.consume(randomQueue, msg => {
            if (msg?.properties?.correlationId === correlationId) {
                clearTimeout(timeout);
                const result = JSON.parse(msg.content.toString());
                channel.deleteQueue(randomQueue);
                resolve(result);
            }
        }, { noAck: true });
    });
}
