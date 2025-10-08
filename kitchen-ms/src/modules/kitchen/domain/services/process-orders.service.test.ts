import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as recipeUtils from '../../utils/recipe.utils';
import * as ingredientProcessor from '../../utils/ingredient-processor.util';
import * as orderManager from '../../utils/order-manager.util';
import { processKitchenOrders } from './process-orders.service';

vi.mock('src/shared/utils/general.utils');
vi.mock('../../utils/recipe.utils');
vi.mock('../../utils/ingredient-processor.util');
vi.mock('../../utils/order-manager.util');
vi.mock('src/modules/food-inventory/domain/services/food-inventory.service');
vi.mock('src/modules/food-inventory/infraestructure/rabbitmq/rabbitmq-food-inventory-rpc');

describe('processKitchenOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe procesar una orden completa exitosamente', async () => {
    const params = { orders: 3, presetRecipesIds: '1,2,3' };

    const mockSelectedRecipes = [
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Pasta' },
      { id: 3, name: 'Salad' },
    ];

    const mockIngredients = [
      { id: 1, recipeId: 1, name: 'Tomato', quantity: 2 },
      { id: 2, recipeId: 1, name: 'Cheese', quantity: 100 },
      { id: 3, recipeId: 2, name: 'Pasta', quantity: 200 },
      { id: 4, recipeId: 3, name: 'Lettuce', quantity: 1 },
    ];

    const mockIngredientsMap = {
      1: [
        { id: 1, recipeId: 1, name: 'Tomato', quantity: 2 },
        { id: 2, recipeId: 1, name: 'Cheese', quantity: 100 },
      ],
      2: [{ id: 3, recipeId: 2, name: 'Pasta', quantity: 200 }],
      3: [{ id: 4, recipeId: 3, name: 'Lettuce', quantity: 1 }],
    };

    const mockRecipesWithIngredients = [
      {
        id: 1,
        name: 'Pizza',
        ingredients: [
          { id: 1, recipeId: 1, name: 'Tomato', quantity: 2 },
          { id: 2, recipeId: 1, name: 'Cheese', quantity: 100 },
        ],
      },
      {
        id: 2,
        name: 'Pasta',
        ingredients: [{ id: 3, recipeId: 2, name: 'Pasta', quantity: 200 }],
      },
      {
        id: 3,
        name: 'Salad',
        ingredients: [{ id: 4, recipeId: 3, name: 'Lettuce', quantity: 1 }],
      },
    ];

    const mockOrderHistory = {
      id: 123,
      status: 'WAITING_FOR_INGREDIENTS',
      listRecipes: mockRecipesWithIngredients,
    };

    const mockRecipesData = [
      { id: 1, name: 'Pizza', ingredientsAvailable: true },
      { id: 2, name: 'Pasta', ingredientsAvailable: true },
      { id: 3, name: 'Salad', ingredientsAvailable: false },
    ];

    const mockIngredientsPendingPurchase = [{ id: 4, name: 'Lettuce', quantity: 1 }];

    vi.spyOn(recipeUtils, 'selectRecipes').mockResolvedValue({
      selectedRecipes: mockSelectedRecipes,
      uniqueRecipeIds: [1, 2, 3],
    });

    vi.spyOn(ingredientProcessor, 'fetchIngredientsForRecipes').mockResolvedValue(mockIngredients);
    vi.spyOn(ingredientProcessor, 'groupIngredientsByRecipe').mockReturnValue(mockIngredientsMap);
    vi.spyOn(ingredientProcessor, 'enrichRecipesWithIngredients').mockReturnValue(
      mockRecipesWithIngredients,
    );

    vi.spyOn(orderManager, 'createNewOrder').mockResolvedValue(mockOrderHistory);
    vi.spyOn(orderManager, 'processInventoryRequest').mockResolvedValue({
      recipesData: mockRecipesData,
      ingredientsPendingPurchase: mockIngredientsPendingPurchase,
    });
    vi.spyOn(orderManager, 'updateOrderWithInventoryData').mockResolvedValue(undefined);

    const result = await processKitchenOrders(params);

    expect(recipeUtils.selectRecipes).toHaveBeenCalledWith(3, '1,2,3');
    expect(ingredientProcessor.fetchIngredientsForRecipes).toHaveBeenCalledWith([1, 2, 3]);
    expect(ingredientProcessor.groupIngredientsByRecipe).toHaveBeenCalledWith(mockIngredients);
    expect(ingredientProcessor.enrichRecipesWithIngredients).toHaveBeenCalledWith(
      mockSelectedRecipes,
      mockIngredientsMap,
    );
    expect(orderManager.createNewOrder).toHaveBeenCalledWith(mockRecipesWithIngredients);
    expect(orderManager.processInventoryRequest).toHaveBeenCalled();
    expect(orderManager.updateOrderWithInventoryData).toHaveBeenCalledWith(
      mockOrderHistory,
      mockRecipesData,
    );

    expect(result).toEqual({
      recipesData: mockRecipesData,
      ingredientsPendingPurchase: mockIngredientsPendingPurchase,
    });
  });

  it('debe procesar orden sin presetRecipesIds', async () => {
    const params = { orders: 2 };

    const mockSelectedRecipes = [
      { id: 5, name: 'Burger' },
      { id: 6, name: 'Tacos' },
    ];

    vi.spyOn(recipeUtils, 'selectRecipes').mockResolvedValue({
      selectedRecipes: mockSelectedRecipes,
      uniqueRecipeIds: [5, 6],
    });
    vi.spyOn(ingredientProcessor, 'fetchIngredientsForRecipes').mockResolvedValue([]);
    vi.spyOn(ingredientProcessor, 'groupIngredientsByRecipe').mockReturnValue({});
    vi.spyOn(ingredientProcessor, 'enrichRecipesWithIngredients').mockReturnValue(
      mockSelectedRecipes,
    );
    vi.spyOn(orderManager, 'createNewOrder').mockResolvedValue({ id: 456 });
    vi.spyOn(orderManager, 'processInventoryRequest').mockResolvedValue({
      recipesData: [],
      ingredientsPendingPurchase: [],
    });
    vi.spyOn(orderManager, 'updateOrderWithInventoryData').mockResolvedValue(undefined);

    const result: any = await processKitchenOrders(params);
    expect(recipeUtils.selectRecipes).toHaveBeenCalledWith(2, undefined);
    expect(result.recipesData).toEqual([]);
  });

  it('debe retornar cuando recipesData tiene error', async () => {
    const params = { orders: 1, presetRecipesIds: '1' };

    const mockRecipesData = {
      error: 'Inventory service error',
    };

    vi.spyOn(recipeUtils, 'selectRecipes').mockResolvedValue({
      selectedRecipes: [{ id: 1, name: 'Pizza' }],
      uniqueRecipeIds: [1],
    });
    vi.spyOn(ingredientProcessor, 'fetchIngredientsForRecipes').mockResolvedValue([]);
    vi.spyOn(ingredientProcessor, 'groupIngredientsByRecipe').mockReturnValue({});
    vi.spyOn(ingredientProcessor, 'enrichRecipesWithIngredients').mockReturnValue([
      { id: 1, name: 'Pizza', ingredients: [] },
    ]);
    vi.spyOn(orderManager, 'createNewOrder').mockResolvedValue({ id: 789 });
    vi.spyOn(orderManager, 'processInventoryRequest').mockResolvedValue({
      recipesData: mockRecipesData,
      ingredientsPendingPurchase: [],
    });
    vi.spyOn(orderManager, 'updateOrderWithInventoryData').mockResolvedValue(undefined);

    const result = await processKitchenOrders(params);

    expect(orderManager.updateOrderWithInventoryData).not.toHaveBeenCalled();
    expect(result).toEqual({
      recipesData: mockRecipesData,
      ingredientsPendingPurchase: [],
    });
  });

  it('debe retornar cuando recipesData es null', async () => {
    const params = { orders: 1, presetRecipesIds: '1' };

    vi.spyOn(recipeUtils, 'selectRecipes').mockResolvedValue({
      selectedRecipes: [{ id: 1, name: 'Pizza' }],
      uniqueRecipeIds: [1],
    });
    vi.spyOn(ingredientProcessor, 'fetchIngredientsForRecipes').mockResolvedValue([]);
    vi.spyOn(ingredientProcessor, 'groupIngredientsByRecipe').mockReturnValue({});
    vi.spyOn(ingredientProcessor, 'enrichRecipesWithIngredients').mockReturnValue([
      { id: 1, name: 'Pizza', ingredients: [] },
    ]);
    vi.spyOn(orderManager, 'createNewOrder').mockResolvedValue({ id: 999 });
    vi.spyOn(orderManager, 'processInventoryRequest').mockResolvedValue({
      recipesData: null,
      ingredientsPendingPurchase: [],
    });
    vi.spyOn(orderManager, 'updateOrderWithInventoryData').mockResolvedValue(undefined);

    const result = await processKitchenOrders(params);

    expect(orderManager.updateOrderWithInventoryData).not.toHaveBeenCalled();
    expect(result).toEqual({
      recipesData: null,
      ingredientsPendingPurchase: [],
    });
  });

  it('debe retornar cuando recipesData es undefined', async () => {
    const params = { orders: 1, presetRecipesIds: '1' };

    vi.spyOn(recipeUtils, 'selectRecipes').mockResolvedValue({
      selectedRecipes: [{ id: 1, name: 'Pizza' }],
      uniqueRecipeIds: [1],
    });
    vi.spyOn(ingredientProcessor, 'fetchIngredientsForRecipes').mockResolvedValue([]);
    vi.spyOn(ingredientProcessor, 'groupIngredientsByRecipe').mockReturnValue({});
    vi.spyOn(ingredientProcessor, 'enrichRecipesWithIngredients').mockReturnValue([
      { id: 1, name: 'Pizza', ingredients: [] },
    ]);
    vi.spyOn(orderManager, 'createNewOrder').mockResolvedValue({ id: 1111 });
    vi.spyOn(orderManager, 'processInventoryRequest').mockResolvedValue({
      recipesData: undefined,
      ingredientsPendingPurchase: [],
    });
    vi.spyOn(orderManager, 'updateOrderWithInventoryData').mockResolvedValue(undefined);

    const result = await processKitchenOrders(params);

    expect(orderManager.updateOrderWithInventoryData).not.toHaveBeenCalled();
    expect(result).toEqual({
      recipesData: undefined,
      ingredientsPendingPurchase: [],
    });
  });

  it('debe procesar orden con ingredientes pendientes de compra', async () => {
    const params = { orders: 1, presetRecipesIds: '1' };

    const mockIngredientsPendingPurchase = [
      { id: 1, name: 'Tomato', quantity: 5 },
      { id: 2, name: 'Cheese', quantity: 200 },
    ];

    vi.spyOn(recipeUtils, 'selectRecipes').mockResolvedValue({
      selectedRecipes: [{ id: 1, name: 'Pizza' }],
      uniqueRecipeIds: [1],
    });
    vi.spyOn(ingredientProcessor, 'fetchIngredientsForRecipes').mockResolvedValue([]);
    vi.spyOn(ingredientProcessor, 'groupIngredientsByRecipe').mockReturnValue({});
    vi.spyOn(ingredientProcessor, 'enrichRecipesWithIngredients').mockReturnValue([]);
    vi.spyOn(orderManager, 'createNewOrder').mockResolvedValue({ id: 123 });
    vi.spyOn(orderManager, 'processInventoryRequest').mockResolvedValue({
      recipesData: [{ id: 1, name: 'Pizza', ingredientsAvailable: false }],
      ingredientsPendingPurchase: mockIngredientsPendingPurchase,
    });
    vi.spyOn(orderManager, 'updateOrderWithInventoryData').mockResolvedValue(undefined);

    const result: any = await processKitchenOrders(params);

    expect(result.ingredientsPendingPurchase).toEqual(mockIngredientsPendingPurchase);
  });
});
