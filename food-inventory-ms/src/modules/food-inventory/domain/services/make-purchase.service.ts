import { logError } from "src/shared/utils/logs.utils";
import { RabbitMQOrderDatasource } from "src/modules/orders/infraestructure/rabbitmq/rabbitmq-order.datasource";
import { OrderService } from "src/modules/orders/domain/services/orders.service";
import { createPurchaseHistory, incrementIngredientQuantity } from "src/modules/food-inventory/domain/repositories/food-inventory.repository";

const orderService = new OrderService(new RabbitMQOrderDatasource())

type MakePurchaseParams = {
    orderId: number;
    ingredients: Record<string, number>;
}
export async function makePurchase(params: MakePurchaseParams): Promise<boolean> {
    const { orderId, ingredients } = params;
    const remainingIngredients = { ...ingredients };

    while (Object.keys(remainingIngredients).length > 0) {
        for (const key of Object.keys(remainingIngredients)) {
            const ingredientName = key;
            const ingredientQuantity = remainingIngredients[key];
            let quantitySold = 0;

            try {
                const res = await fetch(`https://recruitment.alegra.com/api/farmers-market/buy?ingredient=${ingredientName}`);
                const data = await res.json();
                quantitySold = data.quantitySold ?? 0;
            } catch {
                logError('Error al comprar ingredientes');
            }

            if (quantitySold === 0) continue;

            const remainingQuantity = ingredientQuantity - quantitySold;
            remainingIngredients[key] = Math.max(0, remainingQuantity);

            if (quantitySold > ingredientQuantity) {
                await incrementIngredientQuantity({
                    name: ingredientName,
                    quantity: quantitySold - ingredientQuantity
                });
            }

            if (remainingIngredients[key] === 0) {
                delete remainingIngredients[key];
            }
            await createPurchaseHistory({
                ingredientToPurchase: ingredientName,
                quantityPurchased: quantitySold,
                orderId
            });
        }

        if (Object.keys(remainingIngredients).length > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    await orderService.requestOrderHistoryToKitchen({ id: orderId, status: 'PREPARING' });
    return true;
}
