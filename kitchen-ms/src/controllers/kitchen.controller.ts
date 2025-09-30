import { orm } from "../config/orm.config"
import { handleError } from "../shared/utils/general.utils"


export async function getRecipes() {
    try {
        return await orm.recipe.findMany()
    } catch (error) {
        return handleError(error)
    }
}
