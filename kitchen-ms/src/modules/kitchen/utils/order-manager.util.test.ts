import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createNewOrder,
  processInventoryRequest,
  updateOrderWithInventoryData,
} from './order-manager.util';
import * as ordersRepository from '../../../modules/orders/domain/repositories/orders.repository';
import { FoodInventoryService } from '../../food-inventory/domain/services/food-inventory.service';

vi.mock('../../../modules/orders/domain/repositories/orders.repository');
vi.mock('../../food-inventory/domain/services/food-inventory.service');

describe('createNewOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe crear un pedido con estado WAITING_FOR_INGREDIENTS', async () => {
    const recipesWithIngredients = [
      {
        id: 1,
        name: 'Pizza',
        ingredients: [
          { id: 1, name: 'Tomato', quantity: 2 },
          { id: 2, name: 'Cheese', quantity: 100 },
        ],
      },
      {
        id: 2,
        name: 'Pasta',
        ingredients: [{ id: 3, name: 'Pasta', quantity: 200 }],
      },
    ];

    const mockOrder: any = {
      id: 123,
      status: 'WAITING_FOR_INGREDIENTS',
      listRecipes: recipesWithIngredients,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(ordersRepository, 'createOrderHistory').mockResolvedValue(mockOrder);

    const result = await createNewOrder(recipesWithIngredients);

    expect(ordersRepository.createOrderHistory).toHaveBeenCalledWith({
      data: {
        status: 'WAITING_FOR_INGREDIENTS',
        listRecipes: recipesWithIngredients,
      },
    });
    expect(result).toEqual(mockOrder);
  });

  it('debe manejar una lista vacía de recetas', async () => {
    const recipesWithIngredients: any[] = [];

    const mockOrder: any = {
      id: 124,
      status: 'WAITING_FOR_INGREDIENTS',
      listRecipes: [],
      createdAt: new Date(),
    };

    vi.spyOn(ordersRepository, 'createOrderHistory').mockResolvedValue(mockOrder);

    const result = await createNewOrder(recipesWithIngredients);

    expect(result).toEqual(mockOrder);
  });

  it('debe propagar errores del repositorio', async () => {
    const recipesWithIngredients = [{ id: 1, name: 'Pizza', ingredients: [] }];
    const error = new Error('Database connection error');

    vi.spyOn(ordersRepository, 'createOrderHistory').mockRejectedValue(error);

    await expect(createNewOrder(recipesWithIngredients)).rejects.toThrow(
      'Database connection error',
    );
  });
});

describe('processInventoryRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe propagar errores del servicio de inventario', async () => {
    const mockOrder = { id: 123, status: 'WAITING_FOR_INGREDIENTS' };
    const error = new Error('Inventory service error');

    const mockInventoryService = {
      requestIngredientsToInventory: vi.fn().mockRejectedValue(error),
    } as unknown as FoodInventoryService;

    await expect(processInventoryRequest(mockOrder, mockInventoryService)).rejects.toThrow(
      'Inventory service error',
    );
  });

  it('debe manejar respuestas vacías del servicio', async () => {
    const mockOrder = { id: 123, status: 'WAITING_FOR_INGREDIENTS' };

    const mockInventoryService = {
      requestIngredientsToInventory: vi.fn().mockResolvedValue({
        recipesData: [],
        ingredientsPendingPurchase: [],
      }),
    } as unknown as FoodInventoryService;

    const result = await processInventoryRequest(mockOrder, mockInventoryService);

    expect(result.recipesData).toEqual([]);
    expect(result.ingredientsPendingPurchase).toEqual([]);
  });
});

describe('updateOrderWithInventoryData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe actualizar el pedido con los datos del inventario', async () => {
    const mockOrder = {
      id: 123,
      status: 'WAITING_FOR_INGREDIENTS',
      listRecipes: [{ id: 1, name: 'Pizza' }],
    };

    const mockRecipesData = [
      {
        id: 1,
        name: 'Pizza',
        ingredientsAvailable: true,
        ingredients: [{ id: 1, name: 'Tomato', available: true }],
      },
    ];

    vi.spyOn(ordersRepository, 'updateOrderHistory').mockResolvedValue(undefined);

    await updateOrderWithInventoryData(mockOrder, mockRecipesData);

    expect(mockOrder.listRecipes).toEqual(mockRecipesData);
    expect(ordersRepository.updateOrderHistory).toHaveBeenCalledWith(mockOrder);
  });

  it('debe manejar recipesData vacío', async () => {
    const mockOrder = {
      id: 123,
      status: 'WAITING_FOR_INGREDIENTS',
      listRecipes: [{ id: 1, name: 'Pizza' }],
    };

    const mockRecipesData: any[] = [];

    vi.spyOn(ordersRepository, 'updateOrderHistory').mockResolvedValue(undefined);

    await updateOrderWithInventoryData(mockOrder, mockRecipesData);

    expect(mockOrder.listRecipes).toEqual([]);
    expect(ordersRepository.updateOrderHistory).toHaveBeenCalledWith(mockOrder);
  });

  it('debe propagar errores del repositorio', async () => {
    const mockOrder = {
      id: 123,
      status: 'WAITING_FOR_INGREDIENTS',
      listRecipes: [{ id: 1, name: 'Pizza' }],
    };

    const mockRecipesData = [{ id: 1, name: 'Pizza', ingredientsAvailable: true }];
    const error = new Error('Database update error');

    vi.spyOn(ordersRepository, 'updateOrderHistory').mockRejectedValue(error);

    await expect(updateOrderWithInventoryData(mockOrder, mockRecipesData)).rejects.toThrow(
      'Database update error',
    );
  });

  it('debe retornar void (undefined)', async () => {
    const mockOrder = { id: 123, listRecipes: [] };
    const mockRecipesData = [{ id: 1, name: 'Pizza' }];

    vi.spyOn(ordersRepository, 'updateOrderHistory').mockResolvedValue(undefined);

    const result = await updateOrderWithInventoryData(mockOrder, mockRecipesData);

    expect(result).toBeUndefined();
  });
});
