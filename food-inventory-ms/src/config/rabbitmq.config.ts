import amqp from 'amqplib';
import { environment } from './enviroment.config';
import { logError, logInfo } from '../shared/utils/logs.utils';
import { 
  INVENTORY_INGREDIENTS_QUEUE, 
  INVENTORY_INGREDIENTS_CHANGE_QUEUE, 
  INVENTORY_PURCHASE_HISTORY_QUEUE, 
  FOOD_INVENTORY_INGREDIENTS_QUEUE, 
  PURCHASE_INGREDIENT_QUEUE,
  FI_HISTORY_ORDERS_REQUEST_QUEUE
} from '../core/constants/raabitmq.constants';

const RABBITMQ_URL = environment.RABBITMQ_URL;
let channel: amqp.Channel
const QUEUES = [
  FOOD_INVENTORY_INGREDIENTS_QUEUE,
  FI_HISTORY_ORDERS_REQUEST_QUEUE,
  INVENTORY_INGREDIENTS_QUEUE,
  INVENTORY_INGREDIENTS_CHANGE_QUEUE,
  INVENTORY_PURCHASE_HISTORY_QUEUE,
  PURCHASE_INGREDIENT_QUEUE
];

export async function runRabbitMQ() {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      for (const queue of QUEUES) await channel.assertQueue(queue, { durable: true });
      maintainConnection(channel);
      logInfo('RabbitMQ conectado');
    } catch (err) {
      logError('❌ Error conectando a RabbitMQ:', err);
      process.exit(1);
    }
}

async function maintainConnection(_channel: amqp.Channel) {
  try {
    await _channel.assertQueue('heartbeat_queue', {
      durable: false,   
      autoDelete: true, 
      exclusive: true,  
    })
    setInterval(async () => {
      _channel.sendToQueue('heartbeat_queue', Buffer.from('ping'), { 
        persistent: false,
      });
    }, 30000);  

  } catch (error) {
    logError('Error al conectar con RabbitMQ:', error);
  }
}

export { channel }