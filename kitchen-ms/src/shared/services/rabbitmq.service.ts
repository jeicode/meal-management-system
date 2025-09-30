import { randomUUID } from "crypto";
import { FOOD_INVENTORY_INGREDIENTS_QUEUE } from '../../constants/raabitmq.constants';
import { Channel } from "amqplib";
import { orm } from "../../config/orm.config";
import { handleError, randomItemFromList } from "../utils/general.utils";
import { createOrderHistory, updateOrderHistory } from "../../controllers/order-history/order-history.controller";
import { OrderHistory } from "prisma/prisma-client";
import { IOrderHistory } from "src/interfaces/order-history.interface";

type RequestIngredientsToInventoryParams = {
    order: OrderHistory;
    channel: Channel;
};
export async function requestIngredientsToInventory({order, channel}: RequestIngredientsToInventoryParams): Promise<any> {
    return new Promise(async (resolve) => {
        const correlationId = randomUUID();
        const { queue: randomQueue } = await channel.assertQueue('', { exclusive: true });
        const buffer = Buffer.from(JSON.stringify(order));

        channel.sendToQueue(FOOD_INVENTORY_INGREDIENTS_QUEUE, buffer, { replyTo: randomQueue, correlationId: correlationId });

        const timeout = setTimeout(() => {
            channel.deleteQueue(randomQueue);
            resolve({ error: { message: 'Tiempo de espera excedido 20s' } });
        }, 20000);
        
        channel.consume(randomQueue, msg => {
            if (msg?.properties?.correlationId === correlationId) {
                clearTimeout(timeout);
                const result = JSON.parse(msg.content.toString());
                channel.deleteQueue(randomQueue);
                resolve(result);
            }
        }, { noAck: true });

    });
}



/**
 * Procesa los pedidos del gerente
 * @param orders Cantidad de pedidos
 * @param channel Canal de RabbitMQ
 * @returns Array de recetas con ingredientes
 */
type ProcessOrderParams = {orders: number;channel: Channel};
export async function processKitchenOrders({orders, channel}: ProcessOrderParams){
  try {
    const recipes = await orm.recipe.findMany()
    const randomRecipes = randomItemFromList(recipes, orders)
    const listIdsRecipes = [...new Set(randomRecipes.map(r => r.id))]
  
    const allIngredientsRecipe = await orm.recipeIngredient.findMany({
      where: {recipeId:{in: listIdsRecipes}}
    });
    const allIngredientsRecipeMapped = allIngredientsRecipe.reduce((acc, item) => {
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
    const {recipesData, ingredientsPendingPurchase} = await requestIngredientsToInventory({order: orderHistory, channel})
    if (recipesData.error) return recipesData;
    orderHistory.listRecipes = recipesData;
    await updateOrderHistory(orderHistory as IOrderHistory)
    return {recipesData, ingredientsPendingPurchase}
  } catch (error: unknown) {
    return handleError(error)
  }
}