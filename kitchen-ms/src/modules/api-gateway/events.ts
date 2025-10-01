import { logError } from "../../shared/utils/logs.utils";
import { RabbitMQApiGatewayDatasource } from "./infraestructure/queue-messages/rabbitmq";
import { ApiGatewayService } from "./service";

const apiGatewayService = new ApiGatewayService(new RabbitMQApiGatewayDatasource());

export function rpcOrdersPendingOrPreparing() {
  try {
    apiGatewayService.rpcOrdersPendingOrPreparing()
  } catch (err: any) {
    logError('❌ Error subscribing to database changes: rpcOrdersPendingOrPreparing', err.message);
  }
}

export async function rpcApiGatewayOrders() {
  try {
    apiGatewayService.rpcApiGatewayOrders()
  } catch (error: any) {
    logError('❌ Error subscribing to database changes: rpcApiGatewayOrders', error.message);
  }
}