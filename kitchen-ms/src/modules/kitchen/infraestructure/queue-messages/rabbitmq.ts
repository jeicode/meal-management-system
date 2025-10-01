import { channel } from 'src/config/rabbitmq.config';
import { logError } from 'src/shared/utils/logs.utils';
import { KitchenDatasource } from '../../datasource';
import { KITCHEN_ORDERS_DELIVERED_QUEUE, KITCHEN_ORDERS_HISTORY_QUEUE, KITCHEN_RECIPE_QUEUE } from 'src/domain/constants/raabitmq.constants';
import { getOrdersDelivered, getOrdersHistory } from 'src/modules/orders/repository';
import { getRecipes } from '../../repository';

export class RabbitMQKitchenDatasource implements KitchenDatasource {
  async rpcOrdersDelivered() {
    try {
      await channel.prefetch(1);
      channel.consume(KITCHEN_ORDERS_DELIVERED_QUEUE, async (msg) => {
        if (msg !== null) {
          const response = await getOrdersDelivered()
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId: msg.properties.correlationId }
          );
        }
      }, { noAck: true });
    } catch (err: unknown) {
      logError('❌ consumeOrdersDelivered', (err as Error).message);
    }
  }
  
  
  async rpcOrdersHistory() {
    try {
      await channel.prefetch(1);
      channel.consume(KITCHEN_ORDERS_HISTORY_QUEUE, async (msg) => {
        if (msg !== null) {
          
          const data = JSON.parse(msg.content.toString());
  
          const response = await getOrdersHistory(data)
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId: msg.properties.correlationId }
          );
        }
      }, { noAck: true });
    } catch (err: unknown) {
      logError('❌ consumeOrdersHistory', (err as Error).message);
    }
  }
  
  async rpcRecipes() {
    try {
      await channel.prefetch(1);
      channel.consume(KITCHEN_RECIPE_QUEUE, async (msg) => {
        if (msg) {
          const response = await getRecipes()
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId: msg.properties.correlationId }
          );
          channel.ack(msg);
        }
      }, { noAck: false });
    } catch (err: unknown) {
      logError('❌ consumeOrdersHistory', (err as Error).message);
    }
  }
  
  
}
