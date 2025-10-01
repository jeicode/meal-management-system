import amqp, { Channel, ChannelModel } from 'amqplib';
import { environment } from './enviroment.config';
import { logError, logInfo } from '../../shared/utils/logs.utils';
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
import { suscribeAndResponseInventoryIngredients } from '../../api/inventory/events';
import { suscribeOrdersPendingOrPreparing } from '../../api/kitchen/events';


const RABBITMQ_URL = environment.RABBITMQ_URL;
export let channel: Channel | null = null;
export let connection: ChannelModel | null = null;

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

export async function connectRabbitMQ(retries = 5) {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    for (const queue of ASSERT_QUEUE) {
      await channel.assertQueue(queue, { durable: true });
    }

    logInfo('✅ Conectado a RabbitMQ');

    // Suscribimos consumidores
    await suscribeAndResponseInventoryIngredients();
    await suscribeOrdersPendingOrPreparing();

    // Listeners para reconexión
    connection.on('close', () => {
      logError('❌ Conexión RabbitMQ cerrada, reintentando...');
      reconnectRabbitMQ();
    });
    connection.on('error', (err) => {
      logError('❌ Error en RabbitMQ:', err.message);
      reconnectRabbitMQ();
    });
  } catch (err) {
    logError('❌ Error conectando a RabbitMQ:', (err as Error)?.message);
    if (retries > 0) {
      setTimeout(() => connectRabbitMQ(retries - 1), 5000);
    } else {
      logError('❌ No se pudo conectar a RabbitMQ después de varios intentos');
      process.exit(1);
    }
  }
}


export function reconnectRabbitMQ() {
  if (connection) {
    connection.removeAllListeners();
    connection = null;
  }
  if (channel) channel = null;
  setTimeout(() => connectRabbitMQ(), 5000);
}