import { OrderStatus } from "prisma/prisma-client"
import { orm } from "src/config/orm.config"
import { ORDER_STATUS } from "src/core/constants/kitchen.constants"
import { IOrderHistory, IRecipe } from "src/core/interfaces/order-history.interface"
import { handleError } from "src/shared/utils/general.utils"

export async function updateOrderHistory(order: IOrderHistory) {
    try {
        const waitingForIngredients = order.listRecipes.some((r: IRecipe) => r.status === ORDER_STATUS.WAITING_FOR_INGREDIENTS)
        const status = waitingForIngredients ? ORDER_STATUS.WAITING_FOR_INGREDIENTS : ORDER_STATUS.PREPARING
        await orm.orderHistory.update({
            where: {id: order.id},
            data: {
                listRecipes: order.listRecipes,
                status: status as OrderStatus
            }
        })
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
        return await orm.orderHistory.findMany(params)
    } catch (error) {
      return handleError(error)
    }
}



export async function createOrderHistory(params: any) {
    try {
        return await orm.orderHistory.create(params)
    } catch (error) {
        return handleError(error)
    }
}

export async function updateOrderPendingToDelivered() {
    try {
        await orm.orderHistory.updateMany({
            where: {
                status: 'PREPARING',
                createdAt: {
                    lt: new Date(Date.now() - 4000),
                },
            },
            data: { status: 'DELIVERED' },
        });
    } catch (error) {
        return handleError(error)
    }
}
    