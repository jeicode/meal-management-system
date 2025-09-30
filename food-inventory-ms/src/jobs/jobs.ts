import { channel } from "../config/rabbitmq.config";
import { PURCHASE_INGREDIENT_QUEUE } from "../constants/raabitmq.constants";
import { logError } from "../shared/utils/logs.utils";
import { createPurchaseHistory, incrementIngredientQuantity } from "../controllers/inventory/inventory.controller";
import { requestOrderHistoryToKitchen } from "../shared/services/rabbitmq.service";

export const makePendingIngredientPurchases = () => {
    channel.prefetch(1);
    channel.consume(PURCHASE_INGREDIENT_QUEUE, async (msg) => {
        if (!msg) return;
        const data = JSON.parse(msg.content.toString());
        await makePurchase(data);
        channel.ack(msg);
    });
};

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
            } catch (error: any) {
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

    await requestOrderHistoryToKitchen({ id: orderId, status: 'PREPARING' });
    return true;
}
