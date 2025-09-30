import { randomUUID } from "crypto";
import { FI_HISTORY_ORDERS_REQUEST_QUEUE } from '../../constants/raabitmq.constants';
import { channel } from "../../config/rabbitmq.config";
import { IOrderHistoryUpdate } from "../../interfaces/order-history.interface";

/**
 * 
 * @param data 
 * @returns 
 */
export async function requestOrderHistoryToKitchen(data: IOrderHistoryUpdate): Promise<any> {
    return new Promise(async (resolve) => {

        const correlationId = randomUUID();
        const { queue: randomQueue } = await channel.assertQueue('', { exclusive: true });
        const buffer = Buffer.from(JSON.stringify(data));
        channel.sendToQueue(FI_HISTORY_ORDERS_REQUEST_QUEUE, buffer, { replyTo: randomQueue, correlationId: correlationId });

        const timeout = setTimeout(() => {
            channel.deleteQueue(randomQueue);
            resolve({ error: { message: 'Tiempo de espera excedido 15s' } });
        }, 15000);
        
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





