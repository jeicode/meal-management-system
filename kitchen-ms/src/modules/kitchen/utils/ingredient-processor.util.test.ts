import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchIngredientsForRecipes,
  groupIngredientsByRecipe,
  enrichRecipesWithIngredients,
} from './ingredient-processor.util';
import * as kitchenRepository from '../domain/repositories/kitchen.repository';

vi.mock('../domain/repositories/kitchen.repository');

describe('fetchIngredientsForRecipes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe llamar a getRecipeIngredients con los IDs correctos', async () => {
    const recipeIds = [1, 2, 3];
    const mockIngredients = [
      { id: 1, recipeId: 1, ingredientId: 1, quantity: 2 },
      { id: 2, recipeId: 2, ingredientId: 2, quantity: 1 },
    ];

    vi.spyOn(kitchenRepository, 'getRecipeIngredients').mockResolvedValue(mockIngredients);

    const result = await fetchIngredientsForRecipes(recipeIds);

    expect(kitchenRepository.getRecipeIngredients).toHaveBeenCalledWith({
      where: { recipeId: { in: recipeIds } },
    });
    expect(result).toEqual(mockIngredients);
  });

  it('debe retornar un array vacío cuando no hay ingredientes', async () => {
    const recipeIds = [1, 2];
    vi.spyOn(kitchenRepository, 'getRecipeIngredients').mockResolvedValue([]);

    const result = await fetchIngredientsForRecipes(recipeIds);

    expect(result).toEqual([]);
  });
});

describe('groupIngredientsByRecipe', () => {
  it('debe agrupar ingredientes por recipeId', () => {
    const ingredients = [
      { id: 1, recipeId: 1, name: 'Tomato', quantity: '2' },
      { id: 2, recipeId: 1, name: 'Onion', quantity: '1' },
      { id: 3, recipeId: 2, name: 'Cheese', quantity: '100g' },
      { id: 4, recipeId: 3, name: 'Pasta', quantity: '200g' },
    ];

    const result = groupIngredientsByRecipe(ingredients);

    expect(result).toEqual({
      1: [
        { id: 1, recipeId: 1, name: 'Tomato', quantity: '2' },
        { id: 2, recipeId: 1, name: 'Onion', quantity: '1' },
      ],
      2: [{ id: 3, recipeId: 2, name: 'Cheese', quantity: '100g' }],
      3: [{ id: 4, recipeId: 3, name: 'Pasta', quantity: '200g' }],
    });
  });

  it('debe retornar un objeto vacío cuando no hay ingredientes', () => {
    const result = groupIngredientsByRecipe([]);

    expect(result).toEqual({});
  });

  it('debe manejar ingredientes con el mismo recipeId', () => {
    const ingredients = [
      { id: 1, recipeId: 1, name: 'Ingredient 1' },
      { id: 2, recipeId: 1, name: 'Ingredient 2' },
      { id: 3, recipeId: 1, name: 'Ingredient 3' },
    ];

    const result = groupIngredientsByRecipe(ingredients);

    expect(result[1]).toHaveLength(3);
    expect(result[1]).toEqual(ingredients);
  });
});

describe('enrichRecipesWithIngredients', () => {
  it('debe agregar ingredientes a las recetas', () => {
    const recipes = [
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Pasta' },
    ];

    const ingredientsMap = {
      1: [
        { id: 1, recipeId: 1, name: 'Tomato' },
        { id: 2, recipeId: 1, name: 'Cheese' },
      ],
      2: [{ id: 3, recipeId: 2, name: 'Pasta' }],
    };

    const result = enrichRecipesWithIngredients(recipes, ingredientsMap);

    expect(result).toEqual([
      {
        id: 1,
        name: 'Pizza',
        ingredients: [
          { id: 1, recipeId: 1, name: 'Tomato' },
          { id: 2, recipeId: 1, name: 'Cheese' },
        ],
      },
      {
        id: 2,
        name: 'Pasta',
        ingredients: [{ id: 3, recipeId: 2, name: 'Pasta' }],
      },
    ]);
  });

  it('debe asignar un array vacío a recetas sin ingredientes', () => {
    const recipes = [
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
    ];

    const ingredientsMap = {
      1: [{ id: 1, recipeId: 1, name: 'Tomato' }],
    };

    const result = enrichRecipesWithIngredients(recipes, ingredientsMap);

    expect(result[0].ingredients).toEqual([{ id: 1, recipeId: 1, name: 'Tomato' }]);
    expect(result[1].ingredients).toEqual([]);
  });

  it('debe retornar un array vacío cuando no hay recetas', () => {
    const result = enrichRecipesWithIngredients([], {});

    expect(result).toEqual([]);
  });

  it('debe preservar todas las propiedades originales de las recetas', () => {
    const recipes = [{ id: 1, name: 'Pizza' }];

    const ingredientsMap = {
      1: [{ id: 1, recipeId: 1, name: 'Tomato' }],
    };

    const result = enrichRecipesWithIngredients(recipes, ingredientsMap);

    expect(result[0]).toMatchObject({
      id: 1,
      name: 'Pizza',
      ingredients: [{ id: 1, recipeId: 1, name: 'Tomato' }],
    });
  });

  it('debe manejar ingredientsMap vacío', () => {
    const recipes = [
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Pasta' },
    ];

    const result = enrichRecipesWithIngredients(recipes, {});

    expect(result).toEqual([
      { id: 1, name: 'Pizza', ingredients: [] },
      { id: 2, name: 'Pasta', ingredients: [] },
    ]);
  });
});
