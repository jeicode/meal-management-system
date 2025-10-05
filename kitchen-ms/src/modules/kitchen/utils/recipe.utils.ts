import { isValidValue, randomItemFromList } from 'src/shared/utils/general.utils';
import { getRecipes } from '../domain/repositories/kitchen.repository';

export function parsePresetRecipeIds(presetRecipesIds?: string): number[] | null {
  if (!isValidValue(presetRecipesIds)) return null;
  return presetRecipesIds!.split(',').map(Number);
}

export function mapRecipesInOrder(recipes: any[], originalIds: number[]): any[] {
  const recipeMap = new Map(recipes.map(r => [r.id, r]));
  return originalIds.map(id => recipeMap.get(id)).filter(Boolean);
}

export type RecipeSelection = {
  selectedRecipes: any[];
  uniqueRecipeIds: number[];
};

export async function getPresetRecipes(originalIds: number[]): Promise<RecipeSelection> {
  const uniqueIds = [...new Set(originalIds)];
  const recipes = await getRecipes({ where: { id: { in: uniqueIds } } });
  const selectedRecipes = mapRecipesInOrder(recipes, originalIds);

  return { selectedRecipes, uniqueRecipeIds: uniqueIds };
}

export async function getRandomRecipes(count: number): Promise<RecipeSelection> {
  const allRecipes = await getRecipes();
  const selectedRecipes = randomItemFromList(allRecipes, count);
  const uniqueRecipeIds = [...new Set(selectedRecipes.map(r => r.id))];

  return { selectedRecipes, uniqueRecipeIds };
}

export async function selectRecipes(
  orders: number,
  presetRecipesIds?: string,
): Promise<RecipeSelection> {
  const originalIds = parsePresetRecipeIds(presetRecipesIds);

  if (originalIds && originalIds.length > 0) {
    return await getPresetRecipes(originalIds);
  }

  return await getRandomRecipes(orders);
}
