import { logError } from '../../../../shared/utils/logs.utils';
import { orm } from '../../../../config/orm.config';
import { handleError } from '../../../../shared/utils/general.utils';
import { IOrderHistory } from '../../../../core/interfaces/order-history.interface';
import { PurchaseHistoryCreate } from '../../../../core/interfaces/purchase-history.interface';

import {
  aggregateIngredientConsumption,
  calculateInventoryChanges,
  determineRecipeStatus,
  enrichRecipeIngredients,
  fetchIngredientsByIds,
  updateInventoryInTransaction,
} from '../../utils/food-inventory.utils';

type UpdateIngredientQuantityParams = {
  id?: number;
  name?: string;
  quantity: number;
};

export async function resetIngredientsQuantity() {
  try {
    return orm.ingredient.updateMany({
      data: { quantity_available: 5 },
    });
  } catch (error: any) {
    logError('Error al resetear los ingredientes ', error);
    return false;
  }
}
export async function updateIngredientQuantity(ing: UpdateIngredientQuantityParams) {
  try {
    const where = ing.id ? { id: ing.id } : { name: ing.name };
    return orm.ingredient.update({
      where,
      data: { quantity_available: ing.quantity },
    });
  } catch (error: any) {
    logError('Error al actualizar inventario ', error);
    return false;
  }
}

export async function incrementIngredientQuantity(ing: UpdateIngredientQuantityParams) {
  try {
    const where = ing.id ? { id: ing.id } : { name: ing.name };
    return orm.ingredient.update({
      where,
      data: {
        quantity_available: {
          increment: ing.quantity,
        },
      },
    });
  } catch (error: any) {
    logError('Error al actualizar inventario ', error);
    return false;
  }
}

type UpdateInventoryFromOrdersParams = {
  order: IOrderHistory | any;
};

export async function updateInventoryFromRecipesRequest({
  order,
}: UpdateInventoryFromOrdersParams): Promise<any> {
  try {
    const consumption = aggregateIngredientConsumption(order.listRecipes);
    const ingredientIds = Array.from(consumption.keys());

    const ingredientsData = await fetchIngredientsByIds(ingredientIds);

    // Validar ingredientes faltantes
    const foundIds = new Set(ingredientsData.map(ing => ing.id));
    for (const id of ingredientIds) {
      if (!foundIds.has(id)) {
        logError(`Ingrediente con #ID ${id} no encontrado`);
      }
    }

    const { updates, pendingPurchase, ingredientMap } = calculateInventoryChanges(
      ingredientsData,
      consumption,
    );

    if (updates.length > 0) {
      await updateInventoryInTransaction(updates);
    }

    const enrichedRecipes = enrichRecipeIngredients(order.listRecipes, ingredientMap, consumption);

    const recipesData = enrichedRecipes.map(recipe => ({
      ...recipe,
      status: determineRecipeStatus(recipe, pendingPurchase),
    }));

    return {
      recipesData,
      ingredientsPendingPurchase: pendingPurchase,
    };
  } catch (error: any) {
    return handleError(error);
  }
}

export async function getInventoryIngredients() {
  try {
    console.log('🔍 Consultando base de datos...');
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: La consulta tardó más de 5 segundos')), 5000);
    });
    const queryPromise = orm.ingredient.findMany();
    const result = await Promise.race([queryPromise, timeoutPromise]);
    return result;
  } catch (error: unknown) {
    console.error('❌ Error en getInventoryIngredients:', error);
    throw error;
  }
}
export async function createPurchaseHistory(data: PurchaseHistoryCreate) {
  try {
    return await orm.purchaseHistory.create({
      data: {
        quantityPurchased: data.quantityPurchased,
        ingredientToPurchase: data.ingredientToPurchase,
        orderId: data.orderId,
      },
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}

type GetInventoryPurchaseHistoryParams = {
  take?: number;
  skip?: number;
};
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
      orm.purchaseHistory.count(),
    ]);
    const remaining = count - skip - data.length;

    return { data, pagination: { total: count, remaining, take, skip } };
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function deleteAllPurchaseHistory() {
  try {
    return await orm.purchaseHistory.deleteMany();
  } catch (error: unknown) {
    return handleError(error);
  }
}
