import { Channel, ConsumeMessage } from "amqplib";

export async function subscribeQueue(
  channel: Channel,
  queue: string,
  onMessage: (msg: ConsumeMessage, ack: () => void, nack: () => void) => void,
  options: { prefetch?: number; noAck?: boolean } = {}
): Promise<string> {
  if (!channel) throw new Error("RabbitMQ no initialized");

  if (options.prefetch) {
    await channel.prefetch(options.prefetch);
  }

  const { consumerTag } = await channel.consume(
    queue,
    (msg) => {
      if (!msg) return;
      onMessage(msg, () => channel.ack(msg), () => channel.nack(msg));
    },
    { noAck: options.noAck ?? false }
  );

  return consumerTag;
}
