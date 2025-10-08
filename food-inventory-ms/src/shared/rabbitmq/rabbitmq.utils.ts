import { channel } from '../../config/rabbitmq.config';

export async function cleanupQueue(queueName: string) {
  try {
    await channel.deleteQueue(queueName);
    console.log(`✅ Cola eliminada: ${queueName}`);
  } catch (err: any) {
    console.error(`❌ Error: ${err.message}`);
  }
}
