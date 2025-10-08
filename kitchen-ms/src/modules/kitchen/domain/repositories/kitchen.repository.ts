import { Prisma } from '../../../../../prisma/prisma-client';
import { orm } from '../../../../config/orm.config';

type paramGetRecipes = {
  where: Prisma.RecipeWhereInput;
};
export async function getRecipes(params?: paramGetRecipes) {
  const recipes = await orm.recipe.findMany({
    ...params,
    include: {
      ingredients: true,
    },
  });

  return recipes;
}

type paramGetRecipeIngredients = {
  where: Prisma.RecipeIngredientWhereInput;
};
export async function getRecipeIngredients(params: paramGetRecipeIngredients) {
  return await orm.recipeIngredient.findMany(params);
}
