import { FoodInventoryDatasource } from '../../domain/datasources/food-inventory.datasource';
import { channel } from '../../../../config/rabbitmq.config';
import {
  DELETE_DATA_QUEUE,
  INVENTORY_INGREDIENTS_CHANGE_QUEUE,
  INVENTORY_INGREDIENTS_QUEUE,
  INVENTORY_PURCHASE_HISTORY_QUEUE,
  PURCHASE_INGREDIENT_QUEUE,
} from '../../../../core/constants/rabbitmq.constants';
import { logError } from '../../../../shared/utils/logs.utils';
import { dbChannel, ingredientTableChangeFilter } from '../../../../config/db-changes.config';
import { makePurchase } from '../../domain/services/make-purchase.service';
import {
  deleteAllPurchaseHistory,
  getPurchaseHistory,
} from '../../domain/repositories/food-inventory.repository';

export class RabbitMQFoodInventoryDatasource implements FoodInventoryDatasource {
  suscribeIngredientsChanges() {
    try {
      dbChannel
        .on('postgres_changes', ingredientTableChangeFilter, payload => {
          const { new: data, errors } = payload;
          if (errors) {
            const error = {
              message: errors?.[0],
              details: errors,
            };
            return channel.sendToQueue(
              INVENTORY_INGREDIENTS_CHANGE_QUEUE,
              Buffer.from(JSON.stringify({ error })),
            );
          }
          return channel.sendToQueue(
            INVENTORY_INGREDIENTS_CHANGE_QUEUE,
            Buffer.from(JSON.stringify({ data })),
          );
        })
        .subscribe();
    } catch (err: any) {
      channel.sendToQueue(
        INVENTORY_INGREDIENTS_QUEUE,
        Buffer.from(
          JSON.stringify({
            data: null,
            error: { message: err.message, details: [err.message] },
          }),
        ),
      );
      logError('❌ Error subscribing to Ingredient table changes', err.message);
    }
  }

  async rpcInventoryIngredients() {
    try {
      if (!channel) {
        console.error('❌ Canal de RabbitMQ no disponible');
        return;
      }
      console.log(`✅ Esperando mensajes en la cola: ${INVENTORY_INGREDIENTS_QUEUE}`);

      channel.consume(
        INVENTORY_INGREDIENTS_QUEUE,
        async msg => {
          if (!msg) return console.error('⚠️ Mensaje nulo recibido');
          // const data = await getInventoryIngredients();
          console.log('📨 [1] Solicitud recibida:', msg.content.toString());
          console.log('📨 [2] replyTo:', msg.properties.replyTo);
          console.log('📨 [3] correlationId:', msg.properties.correlationId);
          const queue = await channel.checkQueue(msg.properties.replyTo);
          console.log('📨 [4] existe la cola ?:', queue);

          // channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(data)), {
          //   correlationId: msg.properties.correlationId,
          // });
          // console.log('✅ [7] sendToQueue ejecutado');
          console.log('✅ [7] Saliendo del mensaje');
          channel.ack(msg); // Confirma el mensaje de todas formas
        },
        { noAck: false },
      );
    } catch (err: unknown) {
      console.error('❌ consumeInventoryIngredients', (err as Error).message);
    }
  }
  async rpcHistoryPurchase() {
    try {
      await channel.prefetch(1);
      channel.consume(
        INVENTORY_PURCHASE_HISTORY_QUEUE,
        async msg => {
          if (msg) {
            const { take, skip } = JSON.parse(msg.content.toString());
            const data = await getPurchaseHistory({ take, skip });
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(data)), {
              correlationId: msg.properties.correlationId,
            });
            channel.ack(msg);
          }
        },
        { noAck: false },
      );
    } catch (err: unknown) {
      logError('❌ consumeHistoryPurchase', (err as Error).message);
    }
  }

  async rpcDeleteAllPurchaseHistory() {
    try {
      await channel.prefetch(1);
      channel.consume(
        DELETE_DATA_QUEUE,
        async msg => {
          if (msg) {
            await deleteAllPurchaseHistory();
            channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify('purchase_history_deleted')),
              {
                correlationId: msg.properties.correlationId,
              },
            );
            channel.ack(msg);
          }
        },
        { noAck: false },
      );
    } catch (err: unknown) {
      logError('❌ consumeHistoryPurchase', (err as Error).message);
    }
  }

  async makePendingIngredientPurchases() {
    try {
      await channel.prefetch(1);
      channel.consume(
        PURCHASE_INGREDIENT_QUEUE,
        async msg => {
          if (!msg) return;
          const data = JSON.parse(msg.content.toString());
          await makePurchase(data);
          channel.ack(msg);
        },
        { noAck: false },
      );
    } catch (error) {
      logError('❌ makePendingIngredientPurchases', (error as Error).message);
    }
  }
}
