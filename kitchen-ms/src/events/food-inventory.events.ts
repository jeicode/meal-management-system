import { FI_HISTORY_ORDERS_REQUEST_QUEUE } from "../constants/raabitmq.constants";
import { orm } from "../config/orm.config";
import { channel } from "../config/rabbitmq.config";
import { handleError } from "../shared/utils/general.utils";
import { logError } from "../shared/utils/logs.utils";

export async function rpcFoodInventoryHistoryRequest() {
    try {
      await channel.prefetch(1);
      channel.consume(FI_HISTORY_ORDERS_REQUEST_QUEUE, async(msg) => {
        if (msg) {
          try {
            const data = JSON.parse(msg.content.toString());
            if (data.id){
              await orm.orderHistory.update({where: {id: data.id}, data})
            }
            const response = await orm.orderHistory.findFirst({
              where: {status: 'WAITING_FOR_INGREDIENTS'},
              orderBy: {createdAt: 'asc'}
            })
    
            channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify(response)),
              { correlationId: msg.properties.correlationId }
            );
          } 
          catch (error: unknown) {
            channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify(handleError(error))),
              { correlationId: msg.properties.correlationId }
            );
          }
          channel.ack(msg);
        }
      }, { noAck: false });
    } catch (err: unknown) {
      logError('❌ consumeFoodInventoryHistoryRequest', (err as Error).message);
    }
}