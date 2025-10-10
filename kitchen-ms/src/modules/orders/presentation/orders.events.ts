import { OrdersRpcService } from '../domain/services/orders-rpc.service';
import { OrdersSubscriberService } from '../domain/services/orders-subscriber.service';
import { RabbitMQOrdersRpc } from '../infraestructure/rabbitmq/rabbitmq-orders-rpc';
import { RabbitMQOrdersSubscriber } from '../infraestructure/rabbitmq/rabbitmq-orders-subscriber';

const ordersSubscriberService = new OrdersSubscriberService(new RabbitMQOrdersSubscriber());
const ordersRpcService = new OrdersRpcService(new RabbitMQOrdersRpc());

export async function subscribeToOrderChanges() {
  await ordersSubscriberService.subscribeToOrderChanges();
}

export async function rpcOrdersToKitchen() {
  await ordersRpcService.rpcOrdersToKitchen();
}
