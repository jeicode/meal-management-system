import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Channel } from 'amqplib';
import { rpcRequest } from './rabbitmq-rpc.helper';

describe('rpcRequest', () => {
  let mockChannel: Partial<Channel>;

  beforeEach(() => {
    vi.useFakeTimers(); // para controlar el timeout
    mockChannel = {
      assertQueue: vi.fn().mockResolvedValue({ queue: 'reply-queue' }),
      sendToQueue: vi.fn(),
      consume: vi.fn(),
      deleteQueue: vi.fn(),
    };
  });

  it('debería lanzar error si no hay channel', () => {
    // @ts-expect-error probamos null channel
    expect(() => rpcRequest(null, 'test-queue', {})).toThrow('RabbitMQ no inicializado');
  });

  it('debería resolver con error si se excede el timeout', async () => {
    const promise = rpcRequest<any>(mockChannel as any, 'target-queue', { test: true }, 5000);
    // avanzamos el tiempo y ejecutamos todos los timers pendientes
    vi.advanceTimersByTime(5001);
    await vi.runAllTimersAsync(); // esto asegura que se ejecute setTimeout dentro del Promise

    const result = await promise;
    expect(result).toEqual({ error: { message: 'Tiempo de espera excedido' } });
    expect(mockChannel.deleteQueue).toHaveBeenCalledWith('reply-queue');
  });

  it('debería resolver con error si assertQueue falla', async () => {
    (mockChannel.assertQueue as any).mockRejectedValue(new Error('Fallo en assertQueue'));

    const result = await rpcRequest<any>(mockChannel as Channel, 'target-queue', { test: true });

    expect(result).toEqual({ error: { message: 'Fallo en assertQueue' } });
  });
});
