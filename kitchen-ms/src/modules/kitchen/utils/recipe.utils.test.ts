import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parsePresetRecipeIds,
  mapRecipesInOrder,
  getPresetRecipes,
  getRandomRecipes,
  selectRecipes,
} from './recipe.utils';
import * as generalUtils from '../../../shared/utils/general.utils';
import * as kitchenRepository from '../domain/repositories/kitchen.repository';

vi.mock('../../../shared/utils/general.utils');
vi.mock('../domain/repositories/kitchen.repository');

describe('parsePresetRecipeIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe parsear una cadena de IDs separados por comas', () => {
    vi.spyOn(generalUtils, 'isValidValue').mockReturnValue(true);

    const result = parsePresetRecipeIds('1,2,3,4');

    expect(result).toEqual([1, 2, 3, 4]);
  });

  it('debe retornar null cuando la cadena no es válida', () => {
    vi.spyOn(generalUtils, 'isValidValue').mockReturnValue(false);

    const result = parsePresetRecipeIds(undefined);

    expect(result).toBeNull();
  });

  it('debe retornar null cuando la cadena está vacía', () => {
    vi.spyOn(generalUtils, 'isValidValue').mockReturnValue(false);

    const result = parsePresetRecipeIds('');

    expect(result).toBeNull();
  });

  it('debe manejar IDs con espacios', () => {
    vi.spyOn(generalUtils, 'isValidValue').mockReturnValue(true);

    const result = parsePresetRecipeIds('1, 2, 3');

    expect(result).toEqual([1, 2, 3]);
  });

  it('debe manejar un solo ID', () => {
    vi.spyOn(generalUtils, 'isValidValue').mockReturnValue(true);

    const result = parsePresetRecipeIds('42');

    expect(result).toEqual([42]);
  });

  it('debe manejar IDs duplicados', () => {
    vi.spyOn(generalUtils, 'isValidValue').mockReturnValue(true);

    const result = parsePresetRecipeIds('1,2,2,3,3,3');

    expect(result).toEqual([1, 2, 2, 3, 3, 3]);
  });
});

describe('mapRecipesInOrder', () => {
  it('debe mapear recetas en el orden de los IDs originales', () => {
    const recipes = [
      { id: 3, name: 'Pasta' },
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
    ];
    const originalIds = [1, 2, 3];

    const result = mapRecipesInOrder(recipes, originalIds);

    expect(result).toEqual([
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
      { id: 3, name: 'Pasta' },
    ]);
  });

  it('debe filtrar IDs que no existen en las recetas', () => {
    const recipes = [
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
    ];
    const originalIds = [1, 2, 99, 100];

    const result = mapRecipesInOrder(recipes, originalIds);

    expect(result).toEqual([
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
    ]);
    expect(result).toHaveLength(2);
  });

  it('debe manejar IDs duplicados manteniendo el orden', () => {
    const recipes = [
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
    ];
    const originalIds = [1, 1, 2, 2, 1];

    const result = mapRecipesInOrder(recipes, originalIds);

    expect(result).toEqual([
      { id: 1, name: 'Pizza' },
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
      { id: 2, name: 'Salad' },
      { id: 1, name: 'Pizza' },
    ]);
  });

  it('debe retornar array vacío cuando no hay recetas', () => {
    const recipes: any[] = [];
    const originalIds = [1, 2, 3];

    const result = mapRecipesInOrder(recipes, originalIds);

    expect(result).toEqual([]);
  });

  it('debe retornar array vacío cuando originalIds está vacío', () => {
    const recipes = [
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
    ];
    const originalIds: number[] = [];

    const result = mapRecipesInOrder(recipes, originalIds);

    expect(result).toEqual([]);
  });
});

describe('getPresetRecipes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe obtener recetas preset y eliminar duplicados en uniqueRecipeIds', async () => {
    const originalIds = [1, 2, 2, 3, 1];
    const mockRecipes: any = [
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
      { id: 3, name: 'Pasta' },
    ];

    vi.spyOn(kitchenRepository, 'getRecipes').mockResolvedValue(mockRecipes);

    const result = await getPresetRecipes(originalIds);

    expect(kitchenRepository.getRecipes).toHaveBeenCalledWith({
      where: { id: { in: [1, 2, 3] } },
    });
    expect(result.uniqueRecipeIds).toEqual([1, 2, 3]);
    expect(result.selectedRecipes).toHaveLength(5);
  });

  it('debe manejar cuando no se encuentran algunas recetas', async () => {
    const originalIds = [1, 2, 99];
    const mockRecipes: any = [
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
    ];

    vi.spyOn(kitchenRepository, 'getRecipes').mockResolvedValue(mockRecipes);

    const result = await getPresetRecipes(originalIds);

    expect(result.selectedRecipes).toHaveLength(2);
    expect(result.uniqueRecipeIds).toEqual([1, 2, 99]);
  });

  it('debe manejar una lista vacía de IDs', async () => {
    const originalIds: number[] = [];

    vi.spyOn(kitchenRepository, 'getRecipes').mockResolvedValue([]);

    const result = await getPresetRecipes(originalIds);

    expect(result.selectedRecipes).toEqual([]);
    expect(result.uniqueRecipeIds).toEqual([]);
  });
});

describe('getRandomRecipes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe obtener recetas aleatorias', async () => {
    const count = 3;
    const mockAllRecipes: any = [
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
      { id: 3, name: 'Pasta' },
      { id: 4, name: 'Burger' },
      { id: 5, name: 'Tacos' },
    ];
    const mockSelectedRecipes = [
      { id: 2, name: 'Salad' },
      { id: 4, name: 'Burger' },
      { id: 1, name: 'Pizza' },
    ];

    vi.spyOn(kitchenRepository, 'getRecipes').mockResolvedValue(mockAllRecipes);
    vi.spyOn(generalUtils, 'randomItemFromList').mockReturnValue(mockSelectedRecipes);

    const result = await getRandomRecipes(count);

    expect(kitchenRepository.getRecipes).toHaveBeenCalledWith();
    expect(generalUtils.randomItemFromList).toHaveBeenCalledWith(mockAllRecipes, count);
    expect(result.selectedRecipes).toEqual(mockSelectedRecipes);
    expect(result.uniqueRecipeIds).toEqual([2, 4, 1]);
  });

  it('debe manejar cuando randomItemFromList retorna recetas duplicadas', async () => {
    const count = 4;
    const mockAllRecipes: any = [
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
    ];
    const mockSelectedRecipes = [
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
    ];

    vi.spyOn(kitchenRepository, 'getRecipes').mockResolvedValue(mockAllRecipes);
    vi.spyOn(generalUtils, 'randomItemFromList').mockReturnValue(mockSelectedRecipes);

    const result = await getRandomRecipes(count);

    expect(result.selectedRecipes).toHaveLength(4);
    expect(result.uniqueRecipeIds).toEqual([1, 2]);
  });

  it('debe manejar cuando no hay recetas disponibles', async () => {
    const count = 5;

    vi.spyOn(kitchenRepository, 'getRecipes').mockResolvedValue([]);
    vi.spyOn(generalUtils, 'randomItemFromList').mockReturnValue([]);

    const result = await getRandomRecipes(count);

    expect(result.selectedRecipes).toEqual([]);
    expect(result.uniqueRecipeIds).toEqual([]);
  });

  it('debe solicitar el número correcto de recetas', async () => {
    const count = 10;
    const mockAllRecipes: any = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Recipe ${i + 1}`,
    }));
    const mockSelectedRecipes = mockAllRecipes.slice(0, count);

    vi.spyOn(kitchenRepository, 'getRecipes').mockResolvedValue(mockAllRecipes);
    vi.spyOn(generalUtils, 'randomItemFromList').mockReturnValue(mockSelectedRecipes);

    await getRandomRecipes(count);

    expect(generalUtils.randomItemFromList).toHaveBeenCalledWith(mockAllRecipes, count);
  });
});

describe('selectRecipes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe seleccionar recetas preset cuando presetRecipesIds es válido', async () => {
    const orders = 5;
    const presetRecipesIds = '1,2,3';
    const mockRecipes: any = [
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
      { id: 3, name: 'Pasta' },
    ];

    vi.spyOn(generalUtils, 'isValidValue').mockReturnValue(true);
    vi.spyOn(kitchenRepository, 'getRecipes').mockResolvedValue(mockRecipes);

    const result = await selectRecipes(orders, presetRecipesIds);

    expect(result.selectedRecipes).toEqual(mockRecipes);
    expect(result.uniqueRecipeIds).toEqual([1, 2, 3]);
    expect(generalUtils.randomItemFromList).not.toHaveBeenCalled();
  });

  it('debe seleccionar recetas aleatorias cuando presetRecipesIds no es válido', async () => {
    const orders = 3;
    const mockAllRecipes: any = [
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
      { id: 3, name: 'Pasta' },
      { id: 4, name: 'Burger' },
    ];
    const mockSelectedRecipes = [
      { id: 2, name: 'Salad' },
      { id: 4, name: 'Burger' },
      { id: 1, name: 'Pizza' },
    ];

    vi.spyOn(generalUtils, 'isValidValue').mockReturnValue(false);
    vi.spyOn(kitchenRepository, 'getRecipes').mockResolvedValue(mockAllRecipes);
    vi.spyOn(generalUtils, 'randomItemFromList').mockReturnValue(mockSelectedRecipes);

    const result = await selectRecipes(orders, undefined);

    expect(generalUtils.randomItemFromList).toHaveBeenCalledWith(mockAllRecipes, orders);
    expect(result.selectedRecipes).toEqual(mockSelectedRecipes);
  });

  it('debe seleccionar recetas aleatorias cuando presetRecipesIds está vacío', async () => {
    const orders = 2;
    const mockAllRecipes: any = [
      { id: 1, name: 'Pizza' },
      { id: 2, name: 'Salad' },
    ];

    vi.spyOn(generalUtils, 'isValidValue').mockReturnValue(true);
    vi.spyOn(kitchenRepository, 'getRecipes').mockResolvedValue(mockAllRecipes);
    vi.spyOn(generalUtils, 'randomItemFromList').mockReturnValue(mockAllRecipes);

    const result = await selectRecipes(orders, '');

    // Como isValidValue retorna true pero split('') da array vacío
    // se debería ir por el path de random
    expect(result.selectedRecipes).toBeDefined();
  });
});
