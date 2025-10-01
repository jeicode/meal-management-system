import { Channel } from "amqplib";
import { handleError, randomItemFromList } from "src/shared/utils/general.utils";
import { IOrderHistory } from "src/domain/interfaces/order-history.interface";
import { createOrderHistory, updateOrderHistory } from "../orders/repository";
import { FoodInventoryService } from "../food-inventory/service";
import { RabbitMQFoodInventoryDatasource } from "../food-inventory/infraestructure/queue-messages/rabbitmq";
import { getRecipeIngredients, getRecipes } from "./repository";

const inventoryService = new FoodInventoryService(new RabbitMQFoodInventoryDatasource());


type ProcessOrderParams = {orders: number;channel: Channel};
export async function processKitchenOrders({orders, channel}: ProcessOrderParams){
  try {
    const recipes = await getRecipes()
    const randomRecipes = randomItemFromList(recipes, orders)
    const listIdsRecipes = [...new Set(randomRecipes.map(r => r.id))]
  
    const allIngredientsRecipe = await getRecipeIngredients({where: {recipeId:{in: listIdsRecipes}}})
    const allIngredientsRecipeMapped = allIngredientsRecipe.reduce((acc:any, item:any) => {
      if (!acc[item.recipeId]) {
        acc[item.recipeId] = [item]
        return acc
      }
      acc[item.recipeId].push(item)
      return acc;
    }, {} as Record<number, any>);
    
    const recipesWithIngredients = randomRecipes.map((recipe:any) => {
      recipe.ingredients = allIngredientsRecipeMapped[recipe.id]
      return recipe
    })

    const orderHistory:any = await createOrderHistory({
      data: {
        status: 'WAITING_FOR_INGREDIENTS',
        listRecipes: recipesWithIngredients
      }
    })
    if (!orderHistory?.id) throw new Error('Error al crear el pedido')
    
    // solicitamos ingredientes al inventario
    const {recipesData, ingredientsPendingPurchase} = await inventoryService.requestIngredientsToInventory({order: orderHistory, channel})
    if (recipesData.error) return recipesData;
    orderHistory.listRecipes = recipesData;
    await updateOrderHistory(orderHistory as IOrderHistory)
    return {recipesData, ingredientsPendingPurchase}
  } catch (error: unknown) {
    return handleError(error)
  }
}
