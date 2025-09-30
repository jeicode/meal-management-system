import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { makePurchase } from './jobs';
import { incrementIngredientQuantity, createPurchaseHistory } from '../controllers/inventory/inventory.controller';
import { requestOrderHistoryToKitchen } from '../shared/services/rabbitmq.service';

vi.mock('../shared/utils/logs.utils', () => ({
  logError: vi.fn(),
}));

vi.mock('../controllers/inventory/inventory.controller', () => ({
  incrementIngredientQuantity: vi.fn(),
  createPurchaseHistory: vi.fn(),
}));

vi.mock('../shared/services/rabbitmq.service', () => ({
  requestOrderHistoryToKitchen: vi.fn(),
}));

global.fetch = vi.fn();

describe('makePurchase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockParams = {
    orderId: 1,
    ingredients: {
      tomato: 5,
      lettuce: 3
    }
  };

  it('should successfully purchase all ingredients', async () => {
    // Mock de fetch para simular compras exitosas
    (fetch as Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ quantitySold: 5 }) // Compra todos los tomates
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ quantitySold: 3 }) // Compra toda la lechuga
      });

    const result = await makePurchase(mockParams);

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(incrementIngredientQuantity).not.toHaveBeenCalled(); // No debería haber sobrante
    expect(createPurchaseHistory).toHaveBeenCalledTimes(2);
    expect(requestOrderHistoryToKitchen).toHaveBeenCalledWith({
      id: 1,
      status: 'PREPARING'
    });
  });
});