import { getRecipeIngredients } from '../domain/repositories/kitchen.repository';

export async function fetchIngredientsForRecipes(recipeIds: number[]): Promise<any[]> {
  return await getRecipeIngredients({
    where: { recipeId: { in: recipeIds } },
  });
}

export function groupIngredientsByRecipe(ingredients: any[]): Record<number, any[]> {
  return ingredients.reduce((acc: Record<number, any[]>, item: any) => {
    if (!acc[item.recipeId]) {
      acc[item.recipeId] = [];
    }
    acc[item.recipeId].push(item);
    return acc;
  }, {});
}

export function enrichRecipesWithIngredients(
  recipes: any[],
  ingredientsMap: Record<number, any[]>,
): any[] {
  return recipes.map(recipe => ({
    ...recipe,
    ingredients: ingredientsMap[recipe.id] || [],
  }));
}
