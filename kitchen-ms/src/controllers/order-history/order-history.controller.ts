import { ORDER_STATUS } from "../../constants/kitchen.constants";
import { orm } from "../../config/orm.config";
import { OrderStatus } from "../../../prisma/prisma-client";
import { handleError } from "../../shared/utils/general.utils";
import { retry } from "../../shared/utils/db.utils";
import { IOrderHistory, IRecipe } from "src/interfaces/order-history.interface";

export async function updateOrderHistory(order: IOrderHistory) {
    try {
        const waitingForIngredients = order.listRecipes.some((r: IRecipe) => r.status === ORDER_STATUS.WAITING_FOR_INGREDIENTS)
        const status = waitingForIngredients ? ORDER_STATUS.WAITING_FOR_INGREDIENTS : ORDER_STATUS.PREPARING
        
        await retry(() => orm.orderHistory.update({
            where: {id: order.id},
            data: {
                listRecipes: order.listRecipes,
                status: status as OrderStatus
            }
        }))
    } catch (error) {
        return handleError(error)
    }
}

export async function getOrdersDelivered() {
    try {
        return await orm.orderHistory.findMany({
            where: {
                status: 'DELIVERED'
            },
            orderBy: {createdAt: 'desc'},
            take: 5
        })
    } catch (error) {
        return handleError(error)
    }
}


export async function getOrdersHistory(params: any) {
    try {
      return await retry(() => orm.orderHistory.findMany(params));
    } catch (error) {
      return handleError(error)
    }
}

export async function createOrderHistory(params: any) {
    try {
        return await retry(() => orm.orderHistory.create(params))
    } catch (error) {
        return handleError(error)
    }
}
    