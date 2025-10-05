// inventory.utils.ts

import { orm } from "src/config/orm.config";


interface IngredientUpdate {
    id: number;
    quantity: number;
}

interface IngredientConsumption {
    ingredientId: number;
    totalQuantityNeeded: number;
}

/**
 * Obtiene todos los ingredientes necesarios en una sola consulta
 */
export async function fetchIngredientsByIds(ingredientIds: number[]) {
    return orm.ingredient.findMany({
        where: {
            id: { in: ingredientIds }
        },
        select: {
            id: true,
            name: true,
            quantity_available: true
        }
    });
}

/**
 * Agrupa los ingredientes por ID y suma las cantidades totales necesarias
 */
export function aggregateIngredientConsumption(recipes: any[]): Map<number, IngredientConsumption> {
    const consumption = new Map<number, IngredientConsumption>();

    for (const recipe of recipes) {
        for (const ing of recipe.ingredients) {
            const existing = consumption.get(ing.ingredientId);
            if (existing) {
                existing.totalQuantityNeeded += ing.quantity;
            } else {
                consumption.set(ing.ingredientId, {
                    ingredientId: ing.ingredientId,
                    totalQuantityNeeded: ing.quantity
                });
            }
        }
    }

    return consumption;
}

/**
 * Calcula qué ingredientes faltan y cuánto se puede consumir
 */
export function calculateInventoryChanges(
    ingredientsData: any[],
    consumption: Map<number, IngredientConsumption>
) {
    const updates: IngredientUpdate[] = [];
    const pendingPurchase: Record<string, number> = {};
    const ingredientMap = new Map(ingredientsData.map(ing => [ing.id, ing]));

    for (const [ingredientId, { totalQuantityNeeded }] of consumption) {
        const ingredient = ingredientMap.get(ingredientId);
        if (!ingredient) continue;

        const available = ingredient.quantity_available;
        const remaining = available - totalQuantityNeeded;

        if (remaining < 0) {
            pendingPurchase[ingredient.name] = Math.abs(remaining);
        }

        // Solo actualizamos si hay inventario disponible
        if (available > 0) {
            updates.push({
                id: ingredientId,
                quantity: Math.max(0, remaining)
            });
        }
    }

    return { updates, pendingPurchase, ingredientMap };
}

/**
 * Actualiza múltiples ingredientes en una sola transacción
 * Usa row-level locking para evitar race conditions
 */
export async function updateInventoryInTransaction(updates: IngredientUpdate[]) {
    if (updates.length === 0) return [];

    return orm.$transaction(async (tx) => {
        const ingredientIds = updates.map(u => u.id);
        
        // Bloqueamos las filas para evitar race conditions
        // Usamos Prisma.join() para manejar correctamente el array
        await tx.$queryRaw`
            SELECT id, quantity_available 
            FROM "Ingredient" 
            WHERE id = ANY(${ingredientIds}::int[])
            FOR UPDATE
        `;

        // Actualizamos cada ingrediente
        const updatePromises = updates.map(update =>
            tx.ingredient.update({
                where: { id: update.id },
                data: { quantity_available: update.quantity }
            })
        );

        return Promise.all(updatePromises);
    });
}

/**
 * Enriquece los ingredientes de las recetas con información calculada
 */
export function enrichRecipeIngredients(
    recipes: any[],
    ingredientMap: Map<number, any>,
    consumption: Map<number, IngredientConsumption>
) {
    return recipes.map(recipe => {
        const enrichedIngredients = recipe.ingredients.map((ing: any) => {
            const ingredient = ingredientMap.get(ing.ingredientId);
            if (!ingredient) {
                return {
                    ...ing,
                    ingredientName: 'Unknown',
                    missingAmount: ing.quantity
                };
            }

            const consumptionData = consumption.get(ing.ingredientId)!;
            const available = ingredient.quantity_available;
            const remaining = available - consumptionData.totalQuantityNeeded;

            return {
                ...ing,
                ingredientName: ingredient.name,
                missingAmount: remaining < 0 ? Math.abs(remaining) : 0
            };
        });

        return {
            ...recipe,
            ingredients: enrichedIngredients
        };
    });
}

/**
 * Determina el estado de una receta basado en ingredientes faltantes
 */
export function determineRecipeStatus(recipe: any, pendingPurchase: Record<string, number>) {
    const recipeIngredientNames = recipe.ingredients.map((ing: any) => ing.ingredientName);
    const hasMissingIngredients = recipeIngredientNames.some(
        (name: string) => pendingPurchase[name] !== undefined
    );

    return hasMissingIngredients ? 'WAITING_FOR_INGREDIENTS' : 'DELIVERED';
}