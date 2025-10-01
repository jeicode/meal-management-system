import { orm } from "src/config/orm.config"

export async function getRecipes() {
    return await orm.recipe.findMany()
}


export async function getRecipeIngredients({where}: {where: any}) {
    return await orm.recipeIngredient.findMany({where});
}