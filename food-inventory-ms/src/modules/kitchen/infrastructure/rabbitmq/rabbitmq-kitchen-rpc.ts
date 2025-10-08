import { channel } from '../../../../config/rabbitmq.config';
import {
  FOOD_INVENTORY_INGREDIENTS_QUEUE,
  PURCHASE_INGREDIENT_QUEUE,
} from '../../../../core/constants/rabbitmq.constants';
import { logError } from '../../../../shared/utils/logs.utils';
import { updateInventoryFromRecipesRequest } from '../../../food-inventory/domain/repositories/food-inventory.repository';
import { KitchenDatasource } from '../../domain/datasources/kitchen.datasource';

export class RabbitMQKitchenRpc implements KitchenDatasource {
  async rpcKitchenRequests() {
    try {
      await channel.prefetch(1);
      channel.consume(
        FOOD_INVENTORY_INGREDIENTS_QUEUE,
        async msg => {
          if (msg) {
            const order = JSON.parse(msg.content.toString());
            const res = await updateInventoryFromRecipesRequest({ order });
            const data = {
              orderId: order.id,
              ingredients: res?.ingredientsPendingPurchase,
            };
            if (Object.keys(data.ingredients).length > 0) {
              channel.sendToQueue(PURCHASE_INGREDIENT_QUEUE, Buffer.from(JSON.stringify(data)));
            }
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(res)), {
              correlationId: msg.properties.correlationId,
            });
            channel.ack(msg);
          }
        },
        { noAck: false },
      );
    } catch (err: unknown) {
      logError('❌ consumeKitchenRequests', (err as Error).message);
    }
  }
}
