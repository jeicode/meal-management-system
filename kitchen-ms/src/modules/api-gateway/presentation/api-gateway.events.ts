import { logError } from '../../../shared/utils/logs.utils';
import { RabbitMQApiGatewayRpc } from '../infrastructure/rabbitmq/rabbitmq-apigateway-rpc';
import { ApiGatewayService } from '../domain/services/api-gateway.service';

const apiGatewayService = new ApiGatewayService(new RabbitMQApiGatewayRpc());

export function rpcOrdersPendingOrPreparing() {
  try {
    apiGatewayService.rpcOrdersPendingOrPreparing();
  } catch (err: any) {
    logError('❌ Error subscribing to database changes: rpcOrdersPendingOrPreparing', err.message);
  }
}

export async function rpcApiGatewayOrders() {
  try {
    apiGatewayService.rpcApiGatewayOrders();
  } catch (error: any) {
    logError('❌ Error subscribing to database changes: rpcApiGatewayOrders', error.message);
  }
}
