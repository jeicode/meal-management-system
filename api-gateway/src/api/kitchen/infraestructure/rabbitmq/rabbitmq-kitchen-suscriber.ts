import { channel } from "src/config/rabbitmq.config";
import { KitchenSubscriberDatasource } from "../../domain/datasources/kitchen.datasource";
import { subscribeQueue } from "./helpers/rabbitmq-suscriber.helper";
import { KITCHEN_ORDERS_PENDING_QUEUE } from "src/core/constants/raabitmq.constants";
import { sseClients } from "src/api/sse/sse.controller";
import { logError } from "src/shared/utils/logs/logs.utils";

export class RabbitMQKitchenSubscriber implements KitchenSubscriberDatasource {
  async suscribeOrdersPendingOrPreparing(): Promise<string> {
    try {
      return await subscribeQueue(
        channel!,
        KITCHEN_ORDERS_PENDING_QUEUE,
        (msg, ack) => {
          try {
            const data = JSON.parse(msg.content.toString());
            for (const client of sseClients) {
              client.write(`event: kitchen.orders\ndata: ${JSON.stringify(data)}\n\n`);
            }
            ack();
          } catch (err) {
            logError("❌ Error procesando kitchen.orders", (err as Error).message);
          }
        },
        { prefetch: 1, noAck: false }
      );
    } catch (err) {
      logError("❌ suscribeOrdersPendingOrPreparing", (err as Error).message);
      throw err;
    }
  }
}
