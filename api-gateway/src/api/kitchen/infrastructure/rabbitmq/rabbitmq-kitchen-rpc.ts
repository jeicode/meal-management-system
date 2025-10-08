import {
  KITCHEN_ORDERS_HISTORY_QUEUE,
  KITCHEN_ORDERS_QUEUE,
  KITCHEN_RECIPE_QUEUE,
} from '../../../../core/constants/rabbitmq.constants';
import { channel } from '../../../../config/rabbitmq.config';
import { rpcRequest } from '../../../../shared/utils/rabbitmq/rabbitmq-rpc.helper';
import {
  KitchenRpcDatasource,
  paramsSendOrderToKitchen,
} from '../../domain/datasources/kitchen.datasource';

export class RabbitMQKitchenRpc implements KitchenRpcDatasource {
  async getRecipesFromKitchen(): Promise<Record<string, any>> {
    return rpcRequest(channel!, KITCHEN_RECIPE_QUEUE, {});
  }

  async sendOrderToKitchen(message: paramsSendOrderToKitchen): Promise<Record<string, any>> {
    return rpcRequest(channel!, KITCHEN_ORDERS_QUEUE, message);
  }

  async getKitchenOrders(params: Record<string, any>): Promise<Record<string, any>> {
    return rpcRequest(channel!, KITCHEN_ORDERS_HISTORY_QUEUE, params);
  }
}
