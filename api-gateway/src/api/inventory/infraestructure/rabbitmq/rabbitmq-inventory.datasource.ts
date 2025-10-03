import { channel } from 'src/config/rabbitmq.config';
import {
  GetInventoryPurchaseHistoryParams,
  InventoryDatasource,
} from 'src/api/inventory/domain/datasources/inventory.datasource';
import {
  INVENTORY_INGREDIENTS_CHANGE_QUEUE,
  INVENTORY_INGREDIENTS_QUEUE,
  INVENTORY_PURCHASE_HISTORY_QUEUE,
} from 'src/core/constants/raabitmq.constants';
import { sseClients } from 'src/api/sse/sse.controller';
import { logError } from 'src/shared/utils/logs/logs.utils';
import { rpcRequest } from './helpers/rabbitmq-rpc.helper';

export class RabbitMQInventoryDatasource implements InventoryDatasource {
  async getInventoryIngredients(): Promise<Record<string, unknown>> {
    return rpcRequest(channel!, INVENTORY_INGREDIENTS_QUEUE, {});
  }

  async getInventoryPurchaseHistory(
    params: GetInventoryPurchaseHistoryParams,
  ): Promise<Record<string, unknown>> {
    return rpcRequest(channel!, INVENTORY_PURCHASE_HISTORY_QUEUE, params);
  }

  async suscribeAndResponseInventoryIngredients() {
    if (!channel) throw new Error('RabbitMQ no inicializado');
    try {
      const { consumerTag } = await channel.consume(
        INVENTORY_INGREDIENTS_CHANGE_QUEUE,
        async msg => {
          if (msg) {
            const data = JSON.parse(msg.content.toString());
            for (const client of sseClients) {
              client.write(`event: inventory.ingredients\ndata: ${JSON.stringify(data)}\n\n`);
            }
            channel!.ack(msg);
          }
        },
        { noAck: false },
      );
      return consumerTag;
    } catch (err: unknown) {
      logError('❌ suscribeInventoryIngredients', (err as Error).message);
      return '';
    }
  }
}
