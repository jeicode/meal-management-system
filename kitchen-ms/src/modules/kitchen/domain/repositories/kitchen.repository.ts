import { Prisma } from 'prisma/prisma-client';
import { orm } from 'src/config/orm.config';

type paramGetRecipes = {
  where: Prisma.RecipeWhereInput;
};
export async function getRecipes(params?: paramGetRecipes) {
  if (!params) return await orm.recipe.findMany();
  return await orm.recipe.findMany(params);
}

type paramGetRecipeIngredients = {
  where: Prisma.RecipeIngredientWhereInput;
};
export async function getRecipeIngredients(params: paramGetRecipeIngredients) {
  return await orm.recipeIngredient.findMany(params);
}
