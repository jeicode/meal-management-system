import {
  createOrderHistory,
  updateOrderHistory,
} from 'src/modules/orders/domain/repositories/orders.repository';
import { FoodInventoryService } from 'src/modules/food-inventory/domain/services/food-inventory.service';

export async function createNewOrder(recipesWithIngredients: any[]): Promise<any> {
  const order = await createOrderHistory({
    data: {
      status: 'WAITING_FOR_INGREDIENTS',
      listRecipes: recipesWithIngredients,
    },
  });

  if (!order) {
    throw new Error('Error al crear el pedido');
  }

  return order;
}

export async function processInventoryRequest(order: any, inventoryService: FoodInventoryService) {
  const { recipesData, ingredientsPendingPurchase } =
    await inventoryService.requestIngredientsToInventory({ order });

  return { recipesData, ingredientsPendingPurchase };
}

export async function updateOrderWithInventoryData(order: any, recipesData: any): Promise<void> {
  order.listRecipes = recipesData;
  await updateOrderHistory(order);
}
