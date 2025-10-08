import { InventoryRpcDatasource } from '../../domain/datasources/inventory.datasource';
import {
  INVENTORY_INGREDIENTS_QUEUE,
  INVENTORY_PURCHASE_HISTORY_QUEUE,
} from '../../../../core/constants/rabbitmq.constants';
import { channel } from '../../../../config/rabbitmq.config';
import { rpcRequest } from '../../../../shared/utils/rabbitmq/rabbitmq-rpc.helper';
import { GetInventoryPurchaseHistoryParams } from '../../../../api/inventory/domain/datasources/inventory.datasource';

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
