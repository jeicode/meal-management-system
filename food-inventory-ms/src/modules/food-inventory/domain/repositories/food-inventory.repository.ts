import { logError } from "src/shared/utils/logs.utils";
import { orm } from "src/config/orm.config";
import { RECIPE_STATUS } from "src/core/constants/recipe.constants";
import { handleError } from "src/shared/utils/general.utils";
import { IOrderHistory } from "src/core/interfaces/order-history.interface";
import { PurchaseHistoryCreate } from "src/core/interfaces/purchase-history.interface";
import { retry } from "src/shared/utils/db/db.utils";
import { aggregateIngredientConsumption, calculateInventoryChanges, determineRecipeStatus, enrichRecipeIngredients, fetchIngredientsByIds, updateInventoryInTransaction } from "../../utils/food-inventory.utils";


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

export async function updateInventoryFromRecipesRequest({ 
    order 
}: UpdateInventoryFromOrdersParams): Promise<any> {
    try {
        // 1. Agregar todos los ingredientes necesarios
        const consumption = aggregateIngredientConsumption(order.listRecipes);
        const ingredientIds = Array.from(consumption.keys());

        // 2. Obtener todos los ingredientes en UNA sola consulta
        const ingredientsData = await fetchIngredientsByIds(ingredientIds);

        // Validar ingredientes faltantes
        const foundIds = new Set(ingredientsData.map(ing => ing.id));
        for (const id of ingredientIds) {
            if (!foundIds.has(id)) {
                logError(`Ingrediente con #ID ${id} no encontrado`);
            }
        }

        // 3. Calcular qué ingredientes faltan y qué actualizar
        const { updates, pendingPurchase, ingredientMap } = calculateInventoryChanges(
            ingredientsData,
            consumption
        );

        // 4. Actualizar inventario en UNA transacción con row-level locking
        if (updates.length > 0) {
            await updateInventoryInTransaction(updates);
        }

        // 5. Enriquecer las recetas con información de ingredientes
        const enrichedRecipes = enrichRecipeIngredients(
            order.listRecipes,
            ingredientMap,
            consumption
        );

        // 6. Determinar el estado de cada receta
        const recipesData = enrichedRecipes.map(recipe => ({
            ...recipe,
            status: determineRecipeStatus(recipe, pendingPurchase)
        }));

        return { 
            recipesData, 
            ingredientsPendingPurchase: pendingPurchase 
        };

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
