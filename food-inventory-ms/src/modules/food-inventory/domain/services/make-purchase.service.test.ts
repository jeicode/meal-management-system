import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createPurchaseHistory,
  incrementIngredientQuantity,
} from '../repositories/food-inventory.repository';
import { makePurchase } from './make-purchase.service';
import { logError } from '../../../../shared/utils/logs.utils';

vi.mock('../../../../shared/utils/logs.utils', () => ({
  logError: vi.fn(),
}));

vi.mock('../repositories/food-inventory.repository', () => ({
  createPurchaseHistory: vi.fn(),
  incrementIngredientQuantity: vi.fn(),
}));

vi.mock('../../../orders/domain/services/orders.service', () => ({
  OrderService: vi.fn().mockImplementation(() => ({
    requestOrderHistoryToKitchen: vi.fn(),
  })),
}));

vi.mock('../../../orders/infrastructure/rabbitmq/rabbitmq-order.datasource', () => ({
  RabbitMQOrderDatasource: vi.fn(),
}));

// Import después de los mocks

describe('makePurchase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('debe comprar ingredientes y actualizar orden exitosamente', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({ quantitySold: 10 }),
    });
    global.fetch = mockFetch as any;

    const promise = makePurchase({
      orderId: 1,
      ingredients: { Harina: 10 },
    });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(mockFetch).toHaveBeenCalledWith(
      'https://recruitment.alegra.com/api/farmers-market/buy?ingredient=Harina',
    );
    expect(createPurchaseHistory).toHaveBeenCalledWith({
      ingredientToPurchase: 'Harina',
      quantityPurchased: 10,
      orderId: 1,
    });
    expect(result).toBe(true);
  });

  it('debe reintentar compra si no se obtiene cantidad completa', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({ quantitySold: 5 }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ quantitySold: 5 }),
      });
    global.fetch = mockFetch as any;

    const promise = makePurchase({
      orderId: 1,
      ingredients: { Azúcar: 10 },
    });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(createPurchaseHistory).toHaveBeenCalledTimes(2);
    expect(result).toBe(true);
  });

  it('debe incrementar inventario si se compra más de lo necesario', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({ quantitySold: 15 }),
    });
    global.fetch = mockFetch as any;

    const promise = makePurchase({
      orderId: 1,
      ingredients: { Sal: 10 },
    });

    await vi.runAllTimersAsync();
    await promise;

    expect(incrementIngredientQuantity).toHaveBeenCalledWith({
      name: 'Sal',
      quantity: 5,
    });
  });

  it('debe manejar errores de fetch y continuar', async () => {
    const mockFetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        json: async () => ({ quantitySold: 10 }),
      });
    global.fetch = mockFetch as any;

    const promise = makePurchase({
      orderId: 1,
      ingredients: { Pimienta: 10 },
    });

    await vi.runAllTimersAsync();
    await promise;

    expect(logError).toHaveBeenCalledWith('Error al comprar ingredientes');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('debe manejar múltiples ingredientes', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({ quantitySold: 10 }),
    });
    global.fetch = mockFetch as any;

    const promise = makePurchase({
      orderId: 1,
      ingredients: {
        Harina: 10,
        Azúcar: 10,
      },
    });

    await vi.runAllTimersAsync();
    await promise;

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(createPurchaseHistory).toHaveBeenCalledTimes(2);
  });

  it('debe esperar 2 segundos entre reintentos', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({ quantitySold: 5 }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ quantitySold: 5 }),
      });
    global.fetch = mockFetch as any;

    const promise = makePurchase({
      orderId: 1,
      ingredients: { Leche: 10 },
    });

    // Avanzar tiempo manualmente
    await vi.advanceTimersByTimeAsync(2000);
    await vi.runAllTimersAsync();
    await promise;

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('debe saltar ingredientes con quantitySold = 0', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({ quantitySold: 0 }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ quantitySold: 10 }),
      });
    global.fetch = mockFetch as any;

    const promise = makePurchase({
      orderId: 1,
      ingredients: { Mantequilla: 10 },
    });

    await vi.runAllTimersAsync();
    await promise;

    // Debe llamar createPurchaseHistory solo 1 vez (cuando quantitySold > 0)
    expect(createPurchaseHistory).toHaveBeenCalledTimes(1);
    expect(createPurchaseHistory).toHaveBeenCalledWith({
      ingredientToPurchase: 'Mantequilla',
      quantityPurchased: 10,
      orderId: 1,
    });
  });
});
