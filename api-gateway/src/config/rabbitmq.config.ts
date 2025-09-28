import amqp from 'amqplib';
import { environment } from './enviroment.config';
import { logError, logInfo } from '../shared/utils/logs.utils';
import {
  INVENTORY_INGREDIENTS_CHANGE_QUEUE,
  INVENTORY_INGREDIENTS_QUEUE,
  KITCHEN_ORDERS_HISTORY_QUEUE,
  KITCHEN_ORDERS_PENDING_QUEUE,
  KITCHEN_ORDERS_QUEUE,
  KITCHEN_ORDERS_DELIVERED_QUEUE,
  KITCHEN_RECIPE_QUEUE,
  INVENTORY_PURCHASE_HISTORY_QUEUE
} from '../constants/raabitmq.constants';


const RABBITMQ_URL = environment.RABBITMQ_URL;
let channel: amqp.Channel

const ASSERT_QUEUE = [
  KITCHEN_ORDERS_QUEUE,
  KITCHEN_ORDERS_PENDING_QUEUE,
  KITCHEN_ORDERS_DELIVERED_QUEUE,
  KITCHEN_RECIPE_QUEUE,
  KITCHEN_ORDERS_HISTORY_QUEUE,
  INVENTORY_INGREDIENTS_QUEUE,
  INVENTORY_INGREDIENTS_CHANGE_QUEUE,
  INVENTORY_PURCHASE_HISTORY_QUEUE,
];
export async function setupRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    for (const queue of ASSERT_QUEUE) {
      await channel.assertQueue(queue, { durable: true });
    }
    logInfo('Conectado a RabbitMQ');
  } catch (err: any) {
    logError('❌ Error conectando a RabbitMQ:', err.message);
    process.exit(1);
  }
}
export { channel }