import { channel } from 'src/config/rabbitmq.config';
import {
  GetInventoryPurchaseHistoryParams,
  InventoryRpcDatasource,
} from 'src/api/inventory/domain/datasources/inventory.datasource';
import {
  INVENTORY_INGREDIENTS_QUEUE,
  INVENTORY_PURCHASE_HISTORY_QUEUE,
} from 'src/core/constants/rabbitmq.constants';
import { rpcRequest } from './helpers/rabbitmq-rpc.helper';

export class RabbitMQInventoryRpcDatasource implements InventoryRpcDatasource {
  async getInventoryIngredients(): Promise<Record<string, unknown>> {
    return rpcRequest(channel!, INVENTORY_INGREDIENTS_QUEUE, {});
  }

  async getInventoryPurchaseHistory(
    params: GetInventoryPurchaseHistoryParams,
  ): Promise<Record<string, unknown>> {
    return rpcRequest(channel!, INVENTORY_PURCHASE_HISTORY_QUEUE, params);
  }
}
