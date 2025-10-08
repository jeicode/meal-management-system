import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchIngredientsByIds,
  aggregateIngredientConsumption,
  calculateInventoryChanges,
  updateInventoryInTransaction,
  enrichRecipeIngredients,
  determineRecipeStatus,
} from './food-inventory.utils';
import { orm } from '../../../config/orm.config';

// Mock del ORM
vi.mock('../../../config/orm.config', () => ({
  orm: {
    ingredient: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
  },
}));

describe('inventory.utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchIngredientsByIds', () => {
    it('debe obtener ingredientes por sus IDs correctamente', async () => {
      const mockIngredients = [
        {
          id: 1,
          name: 'Harina',
          quantity_available: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Azúcar',
          quantity_available: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(orm.ingredient.findMany).mockResolvedValue(mockIngredients);

      const result = await fetchIngredientsByIds([1, 2]);

      expect(orm.ingredient.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
        select: {
          id: true,
          name: true,
          quantity_available: true,
        },
      });
      expect(result).toEqual(mockIngredients);
    });
  });

  describe('aggregateIngredientConsumption', () => {
    it('debe agregar consumo de ingredientes de múltiples recetas', () => {
      const recipes = [
        {
          ingredients: [
            { ingredientId: 1, quantity: 10 },
            { ingredientId: 2, quantity: 5 },
          ],
        },
        {
          ingredients: [
            { ingredientId: 1, quantity: 15 },
            { ingredientId: 3, quantity: 20 },
          ],
        },
      ];

      const result = aggregateIngredientConsumption(recipes);

      expect(result.size).toBe(3);
      expect(result.get(1)).toEqual({
        ingredientId: 1,
        totalQuantityNeeded: 25,
      });
      expect(result.get(2)).toEqual({
        ingredientId: 2,
        totalQuantityNeeded: 5,
      });
      expect(result.get(3)).toEqual({
        ingredientId: 3,
        totalQuantityNeeded: 20,
      });
    });

    it('debe manejar recetas sin ingredientes', () => {
      const recipes = [{ ingredients: [] }];

      const result = aggregateIngredientConsumption(recipes);

      expect(result.size).toBe(0);
    });
  });

  describe('calculateInventoryChanges', () => {
    it('debe calcular actualizaciones cuando hay suficiente inventario', () => {
      const ingredientsData = [
        { id: 1, name: 'Harina', quantity_available: 100 },
        { id: 2, name: 'Azúcar', quantity_available: 50 },
      ];

      const consumption = new Map([
        [1, { ingredientId: 1, totalQuantityNeeded: 30 }],
        [2, { ingredientId: 2, totalQuantityNeeded: 20 }],
      ]);

      const result = calculateInventoryChanges(ingredientsData, consumption);

      expect(result.updates).toEqual([
        { id: 1, quantity: 70 },
        { id: 2, quantity: 30 },
      ]);
      expect(result.pendingPurchase).toEqual({});
      expect(result.ingredientMap.size).toBe(2);
    });

    it('debe identificar ingredientes faltantes', () => {
      const ingredientsData = [
        { id: 1, name: 'Harina', quantity_available: 10 },
        { id: 2, name: 'Azúcar', quantity_available: 5 },
      ];

      const consumption = new Map([
        [1, { ingredientId: 1, totalQuantityNeeded: 30 }],
        [2, { ingredientId: 2, totalQuantityNeeded: 20 }],
      ]);

      const result = calculateInventoryChanges(ingredientsData, consumption);

      expect(result.pendingPurchase).toEqual({
        Harina: 20,
        Azúcar: 15,
      });
      expect(result.updates).toEqual([
        { id: 1, quantity: 0 },
        { id: 2, quantity: 0 },
      ]);
    });

    it('debe manejar ingredientes con cantidad disponible 0', () => {
      const ingredientsData = [{ id: 1, name: 'Harina', quantity_available: 0 }];

      const consumption = new Map([[1, { ingredientId: 1, totalQuantityNeeded: 10 }]]);

      const result = calculateInventoryChanges(ingredientsData, consumption);

      expect(result.pendingPurchase).toEqual({ Harina: 10 });
      expect(result.updates).toEqual([]);
    });

    it('debe ignorar ingredientes que no existen en los datos', () => {
      const ingredientsData = [{ id: 1, name: 'Harina', quantity_available: 100 }];

      const consumption = new Map([
        [1, { ingredientId: 1, totalQuantityNeeded: 30 }],
        [999, { ingredientId: 999, totalQuantityNeeded: 50 }],
      ]);

      const result = calculateInventoryChanges(ingredientsData, consumption);

      expect(result.updates.length).toBe(1);
      expect(result.updates[0]).toEqual({ id: 1, quantity: 70 });
    });
  });

  describe('updateInventoryInTransaction', () => {
    it('debe actualizar múltiples ingredientes en transacción', async () => {
      const updates = [
        { id: 1, quantity: 70 },
        { id: 2, quantity: 30 },
      ];
      const mockTx = {
        $queryRaw: vi.fn().mockResolvedValue([]),
        ingredient: {
          update: vi
            .fn()
            .mockResolvedValueOnce({ id: 1, quantity_available: 70 })
            .mockResolvedValueOnce({ id: 2, quantity_available: 30 }),
        },
      };

      vi.mocked(orm.$transaction).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      const result = await updateInventoryInTransaction(updates);

      expect(orm.$transaction).toHaveBeenCalledTimes(1);

      expect(mockTx.$queryRaw).toHaveBeenCalledTimes(1);

      const queryRawCall = mockTx.$queryRaw.mock.calls[0];
      expect(queryRawCall[1]).toEqual([1, 2]);

      expect(mockTx.ingredient.update).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });
    it('debe retornar array vacío cuando no hay actualizaciones', async () => {
      const result = await updateInventoryInTransaction([]);
      expect(orm.$transaction).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('debe manejar errores en la transacción', async () => {
      const updates = [{ id: 1, quantity: 70 }];
      vi.mocked(orm.$transaction).mockRejectedValue(new Error('Transaction failed'));
      await expect(updateInventoryInTransaction(updates)).rejects.toThrow('Transaction failed');
    });
  });

  describe('enrichRecipeIngredients', () => {
    it('debe enriquecer ingredientes de recetas con información adicional', () => {
      const recipes = [
        {
          id: 1,
          name: 'Torta',
          ingredients: [
            { ingredientId: 1, quantity: 100 },
            { ingredientId: 2, quantity: 50 },
          ],
        },
      ];

      const ingredientMap = new Map([
        [1, { id: 1, name: 'Harina', quantity_available: 200 }],
        [2, { id: 2, name: 'Azúcar', quantity_available: 30 }],
      ]);

      const consumption = new Map([
        [1, { ingredientId: 1, totalQuantityNeeded: 100 }],
        [2, { ingredientId: 2, totalQuantityNeeded: 50 }],
      ]);

      const result = enrichRecipeIngredients(recipes, ingredientMap, consumption);

      expect(result[0].ingredients[0]).toEqual({
        ingredientId: 1,
        quantity: 100,
        ingredientName: 'Harina',
        missingAmount: 0,
      });
      expect(result[0].ingredients[1]).toEqual({
        ingredientId: 2,
        quantity: 50,
        ingredientName: 'Azúcar',
        missingAmount: 20,
      });
    });
  });

  describe('determineRecipeStatus', () => {
    it('debe retornar WAITING_FOR_INGREDIENTS cuando faltan ingredientes', () => {
      const recipe = {
        ingredients: [{ ingredientName: 'Harina' }, { ingredientName: 'Azúcar' }],
      };

      const pendingPurchase = {
        Harina: 10,
      };

      const result = determineRecipeStatus(recipe, pendingPurchase);

      expect(result).toBe('WAITING_FOR_INGREDIENTS');
    });

    it('debe retornar DELIVERED cuando todos los ingredientes están disponibles', () => {
      const recipe = {
        ingredients: [{ ingredientName: 'Harina' }, { ingredientName: 'Azúcar' }],
      };

      const pendingPurchase = {};

      const result = determineRecipeStatus(recipe, pendingPurchase);

      expect(result).toBe('DELIVERED');
    });

    it('debe retornar DELIVERED cuando no hay ingredientes', () => {
      const recipe = {
        ingredients: [],
      };
      const pendingPurchase = { Harina: 10 };
      const result = determineRecipeStatus(recipe, pendingPurchase);

      expect(result).toBe('DELIVERED');
    });

    it('debe manejar múltiples ingredientes faltantes', () => {
      const recipe = {
        ingredients: [
          { ingredientName: 'Harina' },
          { ingredientName: 'Azúcar' },
          { ingredientName: 'Huevos' },
        ],
      };

      const pendingPurchase = {
        Harina: 10,
        Azúcar: 5,
      };

      const result = determineRecipeStatus(recipe, pendingPurchase);

      expect(result).toBe('WAITING_FOR_INGREDIENTS');
    });
  });
});
