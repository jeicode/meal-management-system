import { logError } from "src/shared/utils/logs.utils";
import { orm } from "src/config/orm.config";
import { RECIPE_STATUS } from "src/core/constants/recipe.constants";
import { handleError } from "src/shared/utils/general.utils";
import { IOrderHistory } from "src/core/interfaces/order-history.interface";
import { PurchaseHistoryCreate } from "src/core/interfaces/purchase-history.interface";
import { retry } from "src/shared/utils/db/db.utils";


type UpdateIngredientQuantityParams = {
    id?: number;
    name?: string;
    quantity: number;
}
export async function updateIngredientQuantity(ing: UpdateIngredientQuantityParams) {
    async function updateIngredient() {
        const where = ing.id ? { id: ing.id } : { name: ing.name };
        return orm.ingredient.update({
            where,
            data: { quantity_available: ing.quantity },
        });
    }
    try { await retry(updateIngredient); }
    catch (error: any) {
        logError("Error al actualizar inventario ", error.message);
        return false
    }
}

export async function incrementIngredientQuantity(ing: UpdateIngredientQuantityParams) {
    async function updateIngredient() {
        const where = ing.id ? { id: ing.id } : { name: ing.name };
        return orm.ingredient.update({
            where,
            data: {
                quantity_available: {
                    increment: ing.quantity
                }
            },
        });
    }
    try { return await retry(updateIngredient) }
    catch (error: any) {
        logError("Error al actualizar inventario ", error.message);
        return false
    }
}



type UpdateInventoryFromOrdersParams = {
    order: IOrderHistory | any
}

export async function updateInventoryFromRecipesRequest({ order }: UpdateInventoryFromOrdersParams): Promise<any> {
    try {
        const ingredientsPendingPurchase: Record<string, any> = {};
        const recipesData: any[] = [];
        for (const recipe of order.listRecipes) {
            const recipeIngredients = recipe.ingredients;
            for (const ing of recipeIngredients) {
                const ingredientInventory = await retry(() => orm.ingredient.findUnique({ where: { id: ing.ingredientId } }));
                if (!ingredientInventory) {
                    logError(`Ingrediente con #ID ${ing.ingredientId} no encontrado`);
                    continue;
                }

                const quantity_available = ingredientInventory.quantity_available;
                ing.ingredientName = ingredientInventory.name;
                ing.missingAmount = 0;
                const remainingQuantity = quantity_available - ing.quantity;
                if (remainingQuantity < 0) ing.missingAmount = Math.abs(remainingQuantity);

                if (ingredientsPendingPurchase[ing.ingredientName]) {
                    ingredientsPendingPurchase[ing.ingredientName] += ing.quantity;
                    if (quantity_available > 0) {
                        await updateIngredientQuantity({ id: ing.ingredientId, quantity: Math.max(0, remainingQuantity) });
                    }
                    continue;
                }

                if (ing.missingAmount > 0) {
                    ingredientsPendingPurchase[ing.ingredientName] = ing.missingAmount;
                }
                if (quantity_available > 0) {
                    await updateIngredientQuantity({ id: ing.ingredientId, quantity: Math.max(0, remainingQuantity) });
                }
            }

            recipe.status = Object.keys(ingredientsPendingPurchase).length > 0 ?
                RECIPE_STATUS.WAITING_FOR_INGREDIENTS :
                RECIPE_STATUS.DELIVERED;
            recipesData.push(recipe);
        }


        return { recipesData, ingredientsPendingPurchase };
    } catch (error: any) {
        return handleError(error);
    }
}


export async function getInventoryIngredients() {
    try {
        const ingredients = await orm.ingredient.findMany();
        return ingredients
    } catch (error: unknown) {
        return handleError(error)
    }
}


export async function createPurchaseHistory(data: PurchaseHistoryCreate) {
    try {
        return await retry(() => orm.purchaseHistory.create({
            data: {
                quantityPurchased: data.quantityPurchased,
                ingredientToPurchase: data.ingredientToPurchase,
                orderId: data.orderId
            }
        }))
    } catch (error: unknown) {
        return handleError(error)
    }
}

type GetInventoryPurchaseHistoryParams = {
    take?: number;
    skip?: number;
}
export async function getPurchaseHistory(params: GetInventoryPurchaseHistoryParams) {
    try {
        const take = params?.take || 10;
        const skip = params?.skip || 0;
        const [data, count] = await orm.$transaction([
            orm.purchaseHistory.findMany({
                orderBy: { createdAt: 'desc' },
                take,
                skip,
            }),
            orm.purchaseHistory.count()
        ]);
        const remaining = count - (skip) - data.length;

        return { data, pagination: { total: count, remaining, take, skip } }
    } catch (error: unknown) {
        return handleError(error)
    }
}
