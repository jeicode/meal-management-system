import { channel } from "src/config/rabbitmq.config";
import { KITCHEN_ORDERS_PENDING_QUEUE, KITCHEN_ORDERS_QUEUE } from "src/core/constants/raabitmq.constants";
import { OrdersDatasource } from "src/modules/orders/domain/datasources/orders.datasource";
import { processKitchenOrders } from "src/modules/kitchen/domain/services/process-orders.service";

export class RabbitOrdersDatasource implements OrdersDatasource {
  async publishPendingOrder(payload: unknown): Promise<void> {
    channel.sendToQueue(KITCHEN_ORDERS_PENDING_QUEUE, Buffer.from(JSON.stringify(payload)));
  }
  async processKitchenOrders(): Promise<any> {

    await channel.prefetch(1);
      channel.consume(KITCHEN_ORDERS_QUEUE, async msg => {
        if (!msg) return;
        const data:any = JSON.parse(msg.content.toString());
        const response = await processKitchenOrders({ orders: Number(data.dishes), channel });
        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
          correlationId: msg.properties.correlationId,
        });
      });
  }
}
