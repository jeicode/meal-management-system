// food-inventory.repository.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  updateIngredientQuantity,
  incrementIngredientQuantity,
  getInventoryIngredients,
  createPurchaseHistory,
  getPurchaseHistory,
} from './food-inventory.repository';
import { orm } from 'src/config/orm.config';

// Mocks
vi.mock('src/config/orm.config', () => ({
  orm: {
    ingredient: {
      update: vi.fn(),
      findMany: vi.fn(),
    },
    purchaseHistory: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('src/shared/utils/logs.utils', () => ({
  logError: vi.fn(),
}));

vi.mock('src/shared/utils/db/db.utils', () => ({
  retry: vi.fn(fn => fn()),
}));

vi.mock('../../utils/food-inventory.utils', () => ({
  aggregateIngredientConsumption: vi.fn(),
  calculateInventoryChanges: vi.fn(),
  determineRecipeStatus: vi.fn(),
  enrichRecipeIngredients: vi.fn(),
  fetchIngredientsByIds: vi.fn(),
  updateInventoryInTransaction: vi.fn(),
}));

describe('food-inventory.repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateIngredientQuantity', () => {
    it('debe actualizar cantidad por ID', async () => {
      vi.mocked(orm.ingredient.update).mockResolvedValue({
        id: 1,
        quantity_available: 100,
      } as any);

      await updateIngredientQuantity({ id: 1, quantity: 100 });

      expect(orm.ingredient.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { quantity_available: 100 },
      });
    });
  });

  describe('incrementIngredientQuantity', () => {
    it('debe incrementar cantidad de ingrediente', async () => {
      const mockResult = { id: 1, quantity_available: 150 };
      vi.mocked(orm.ingredient.update).mockResolvedValue(mockResult as any);

      const result = await incrementIngredientQuantity({ id: 1, quantity: 50 });

      expect(orm.ingredient.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          quantity_available: { increment: 50 },
        },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getInventoryIngredients', () => {
    it('debe obtener todos los ingredientes', async () => {
      const mockIngredients = [
        { id: 1, name: 'Harina', quantity_available: 100 },
        { id: 2, name: 'Azúcar', quantity_available: 50 },
      ];

      vi.mocked(orm.ingredient.findMany).mockResolvedValue(mockIngredients as any);

      const result = await getInventoryIngredients();

      expect(orm.ingredient.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockIngredients);
    });
  });

  describe('createPurchaseHistory', () => {
    it('debe crear historial de compra', async () => {
      const mockData = {
        quantityPurchased: 10,
        ingredientToPurchase: 'Harina',
        orderId: 123,
      };

      const mockResult = { id: 1, ...mockData };
      vi.mocked(orm.purchaseHistory.create).mockResolvedValue(mockResult as any);

      const result = await createPurchaseHistory(mockData);

      expect(orm.purchaseHistory.create).toHaveBeenCalledWith({
        data: mockData,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getPurchaseHistory', () => {
    it('debe obtener historial con paginación', async () => {
      const mockData = [
        { id: 1, ingredientToPurchase: 'Harina', quantityPurchased: 10 },
        { id: 2, ingredientToPurchase: 'Azúcar', quantityPurchased: 5 },
      ];

      vi.mocked(orm.$transaction).mockResolvedValue([mockData, 20] as any);

      const result = await getPurchaseHistory({ take: 10, skip: 0 });

      expect(result).toEqual({
        data: mockData,
        pagination: {
          total: 20,
          remaining: 18,
          take: 10,
          skip: 0,
        },
      });
    });
  });
});
