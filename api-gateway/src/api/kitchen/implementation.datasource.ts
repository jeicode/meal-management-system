import { randomUUID } from "crypto";
import { channel } from "../../core/config/rabbitmq.config";
import { KitchenDatasource } from "./datasource";
import { KITCHEN_ORDERS_HISTORY_QUEUE, KITCHEN_ORDERS_QUEUE, KITCHEN_RECIPE_QUEUE } from "../../core/constants/raabitmq.constants";
import { environment } from "../../core/config/enviroment.config";

export class RabbitMQKitchenDatasource implements KitchenDatasource {

    async getRecipesFromKitchen() {
        if (!channel) throw new Error('RabbitMQ no inicializado');
        return new Promise(async (resolve) => {
            const correlationId = randomUUID();
            const { queue: randomQueue } = await channel!.assertQueue('', { exclusive: true });
            const buffer = Buffer.from(JSON.stringify({}));
    
            channel!.sendToQueue(KITCHEN_RECIPE_QUEUE, buffer, { replyTo: randomQueue, correlationId: correlationId });
    
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
    
    async sendOrderToKitchen(message: object): Promise<any> {
        if (!channel) throw new Error('RabbitMQ no inicializado');
        return new Promise(async (resolve) => {
            const correlationId = randomUUID();
            const { queue: randomQueue } = await channel!.assertQueue('', { exclusive: true });
            const buffer = Buffer.from(JSON.stringify(message));
            channel!.sendToQueue(KITCHEN_ORDERS_QUEUE, buffer, { replyTo: randomQueue, correlationId: correlationId });
    
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
    
    async getKitchenOrders(params: Record<string, any>): Promise<Record<string, any>> {
        if (!channel) throw new Error('RabbitMQ no inicializado');
        return new Promise(async (resolve) => {
            const correlationId = randomUUID();
            const { queue: randomQueue } = await channel!.assertQueue('', { exclusive: true });
            const buffer = Buffer.from(JSON.stringify(params));
            channel!.sendToQueue(KITCHEN_ORDERS_HISTORY_QUEUE, buffer, { replyTo: randomQueue, correlationId: correlationId });
    
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