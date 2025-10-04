import amqp from 'amqplib';
import { environment } from './environment.config';
import { logInfo } from '../shared/utils/logs.utils';
import {
  KITCHEN_ORDERS_QUEUE,
  KITCHEN_ORDERS_PENDING_QUEUE,
  KITCHEN_ORDERS_DELIVERED_QUEUE,
  KITCHEN_ORDERS_HISTORY_QUEUE,
  FI_HISTORY_ORDERS_REQUEST_QUEUE,
  FOOD_INVENTORY_INGREDIENTS_QUEUE,
  KITCHEN_RECIPE_QUEUE,
} from '../core/constants/rabbitmq.constants';

const RABBITMQ_URL = environment.RABBITMQ_URL;
let channel: amqp.Channel
const ASSERT_QUEUE = [
  KITCHEN_ORDERS_QUEUE,
  FI_HISTORY_ORDERS_REQUEST_QUEUE,
  FOOD_INVENTORY_INGREDIENTS_QUEUE,
  KITCHEN_ORDERS_PENDING_QUEUE,
  KITCHEN_ORDERS_DELIVERED_QUEUE,
  KITCHEN_ORDERS_HISTORY_QUEUE,
  KITCHEN_RECIPE_QUEUE
];


export async function initRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    for (const queue of ASSERT_QUEUE) {
      await channel.assertQueue(queue, { durable: true });
    }
    logInfo('RabbitMQ conectado');
  } catch (err) {
    console.error('❌ Error conectando a RabbitMQ:', err);
    process.exit(1);
  }
}
export { channel }