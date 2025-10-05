import { handleError } from 'src/shared/utils/general.utils';
import { RabbitMQFoodInventoryDatasource } from 'src/modules/food-inventory/infraestructure/rabbitmq/rabbitmq-food-inventory.datasource';
import { FoodInventoryService } from 'src/modules/food-inventory/domain/services/food-inventory.service';
import { selectRecipes } from '../../utils/recipe.utils';
import {
  enrichRecipesWithIngredients,
  fetchIngredientsForRecipes,
  groupIngredientsByRecipe,
} from '../../utils/ingredient-processor.util';
import {
  createNewOrder,
  processInventoryRequest,
  updateOrderWithInventoryData,
} from '../../utils/order-manager.util';

const inventoryService = new FoodInventoryService(new RabbitMQFoodInventoryDatasource());

type ProcessOrderParams = { orders: number; presetRecipesIds?: string };

export async function processKitchenOrders({ orders, presetRecipesIds }: ProcessOrderParams) {
  try {
    // Paso 1: Seleccionar recetas
    const { selectedRecipes, uniqueRecipeIds } = await selectRecipes(orders, presetRecipesIds);

    // Paso 2: Procesar ingredientes
    const ingredients = await fetchIngredientsForRecipes(uniqueRecipeIds);
    const ingredientsMap = groupIngredientsByRecipe(ingredients);
    const recipesWithIngredients = enrichRecipesWithIngredients(selectedRecipes, ingredientsMap);

    // Paso 3: Crear orden
    const orderHistory = await createNewOrder(recipesWithIngredients);

    // Paso 4: Gestionar inventario
    const { recipesData, ingredientsPendingPurchase } = await processInventoryRequest(
      orderHistory,
      inventoryService,
    );

    if (recipesData?.error || !recipesData) {
      return { recipesData, ingredientsPendingPurchase };
    }

    // Paso 5: Actualizar orden
    await updateOrderWithInventoryData(orderHistory, recipesData);

    return { recipesData, ingredientsPendingPurchase };
  } catch (error: unknown) {
    console.error(error);
    return handleError(error);
  }
}
