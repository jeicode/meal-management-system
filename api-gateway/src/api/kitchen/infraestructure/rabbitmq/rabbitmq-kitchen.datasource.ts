import {
  KITCHEN_ORDERS_HISTORY_QUEUE,
  KITCHEN_ORDERS_QUEUE,
  KITCHEN_RECIPE_QUEUE,
} from 'src/core/constants/raabitmq.constants';
import { KitchenDatasource } from 'src/api/kitchen/domain/datasources/kitchen.datasource';
import { channel } from 'src/config/rabbitmq.config';
import { rpcRequest } from './helpers/rabbitmq-rpc.helper';

export class RabbitMQKitchenDatasource implements KitchenDatasource {
  async getRecipesFromKitchen(): Promise<Record<string, any>> {
    return rpcRequest(channel!, KITCHEN_RECIPE_QUEUE, {});
  }

  async sendOrderToKitchen(message: object): Promise<Record<string, any>> {
    return rpcRequest(channel!, KITCHEN_ORDERS_QUEUE, message);
  }

  async getKitchenOrders(params: Record<string, any>): Promise<Record<string, any>> {
    return rpcRequest(channel!, KITCHEN_ORDERS_HISTORY_QUEUE, params);
  }
}
