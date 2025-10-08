import { randomUUID } from 'crypto';
import { Channel, ConsumeMessage } from 'amqplib';
import { environment } from 'src/config/environment.config';

export function rpcRequest<T = any>(
  channel: Channel,
  targetQueue: string,
  message: object,
  timeoutMs: number = environment.TIMEOUT_RABBITMQ || 10000,
): Promise<T | { error: { message: string } }> {
  if (!channel) throw new Error('RabbitMQ not initialized');

  return new Promise(resolve => {
    const correlationId = randomUUID();
    channel
      .assertQueue('', { exclusive: true })
      .then(({ queue: replyQueue }) => {
        const buffer = Buffer.from(JSON.stringify(message));
        channel.sendToQueue(targetQueue, buffer, {
          replyTo: replyQueue,
          correlationId,
        });

        const timeout = setTimeout(() => {
          channel.deleteQueue(replyQueue);
          resolve({ error: { message: 'Timeout exceeded' } });
        }, timeoutMs);

        channel.consume(
          replyQueue,
          (msg: ConsumeMessage | null) => {
            if (msg?.properties?.correlationId === correlationId) {
              clearTimeout(timeout);
              const result = JSON.parse(msg.content.toString());
              channel.deleteQueue(replyQueue);
              resolve(result);
            }
          },
          { noAck: true },
        );
      })
      .catch(err => {
        resolve({ error: { message: (err as Error).message } });
      });
  });
}
