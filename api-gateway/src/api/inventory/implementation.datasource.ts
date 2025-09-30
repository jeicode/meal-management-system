import { randomUUID } from "crypto";
import { channel } from "../../core/config/rabbitmq.config";
import { GetInventoryPurchaseHistoryParams, InventoryDatasource } from "./datasource";
import { INVENTORY_INGREDIENTS_QUEUE, INVENTORY_PURCHASE_HISTORY_QUEUE } from "../../core/constants/raabitmq.constants";
import { environment } from "../../core/config/enviroment.config";

export class RabbitMQInventoryDatasource implements InventoryDatasource {

    async getInventoryIngredients(): Promise<any> {
        if (!channel) throw new Error('RabbitMQ no inicializado');
            return new Promise((resolve) => {
                const correlationId = randomUUID();
                channel!.assertQueue('', { exclusive: true }).then(({ queue: randomQueue }) => {
                    const buffer = Buffer.from(JSON.stringify({}));
                    channel!.sendToQueue(
                        INVENTORY_INGREDIENTS_QUEUE,
                        buffer,
                        { replyTo: randomQueue, correlationId }
                    );
        
                    const timeout = setTimeout(() => {
                        channel!.deleteQueue(randomQueue);
                        resolve({ error: { message: 'Tiempo de espera excedido' } });
                    }, environment.TIMEOUT_RABBITMQ || 10000);
        
                    channel!.consume(randomQueue, (msg) => {
                        if (msg?.properties?.correlationId === correlationId) {
                            clearTimeout(timeout);
                            const result = JSON.parse(msg.content.toString());
                            channel!.deleteQueue(randomQueue);
                            resolve(result);
                        }
                    }, { noAck: true });
                });
            });
    }

    async getInventoryPurchaseHistory(params: GetInventoryPurchaseHistoryParams): Promise<any> {
        if (!channel) throw new Error('RabbitMQ no inicializado');
            return new Promise(async (resolve) => {
                const correlationId = randomUUID();
                const { queue: randomQueue } = await channel!.assertQueue('', { exclusive: true });
                const buffer = Buffer.from(JSON.stringify(params));
        
                channel!.sendToQueue(INVENTORY_PURCHASE_HISTORY_QUEUE, buffer, { replyTo: randomQueue, correlationId: correlationId });
        
                const timeout = setTimeout(() => {
                    channel!.deleteQueue(randomQueue);
                    resolve({ error: { message: 'Tiempo de espera excedido' } });
                }, environment.TIMEOUT_RABBITMQ || 10000);
                
                channel!.consume(randomQueue, msg => {
                    if (msg?.properties?.correlationId === correlationId) {
                        clearTimeout(timeout);
                        const result = JSON.parse(msg.content.toString());
                        channel!.deleteQueue(randomQueue);
                        resolve(result);
                    }
                }, { noAck: true });
            });
    }
  }