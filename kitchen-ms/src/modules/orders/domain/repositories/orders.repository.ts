import { OrderStatus, Prisma } from '../../../../../prisma/prisma-client';
import { orm } from '../../../../config/orm.config';
import { ORDER_STATUS } from '../../../../core/constants/kitchen.constants';
import { IOrderHistory, IRecipe } from '../../../../core/interfaces/order-history.interface';
import { handleError } from '../../../../shared/utils/general.utils';

export async function updateOrderHistory(order: IOrderHistory) {
  try {
    const waitingForIngredients = order.listRecipes.some(
      (r: IRecipe) => r.status === ORDER_STATUS.WAITING_FOR_INGREDIENTS,
    );
    const status = waitingForIngredients
      ? ORDER_STATUS.WAITING_FOR_INGREDIENTS
      : ORDER_STATUS.PREPARING;
    await orm.orderHistory.update({
      where: { id: order.id },
      data: {
        listRecipes: order.listRecipes,
        status: status as OrderStatus,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function getOrdersDelivered() {
  try {
    return await orm.orderHistory.findMany({
      where: {
        status: 'DELIVERED',
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function getOrdersHistory(params: Prisma.OrderHistoryFindManyArgs) {
  try {
    const take = params.take || 10;
    const skip = params.skip || 0;
    const [data, count] = await orm.$transaction([
      orm.orderHistory.findMany({
        ...params,
        take,
        skip,
      }),
      orm.orderHistory.count(),
    ]);
    const remaining = count - skip - data.length;

    return { data, pagination: { total: count, remaining, take, skip } };
  } catch (error) {
    return handleError(error);
  }
}

export async function createOrderHistory(params: Prisma.OrderHistoryCreateArgs) {
  try {
    return await orm.orderHistory.create(params);
  } catch (error) {
    return handleError(error);
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
    return handleError(error);
  }
}

export async function deleteAllOrders() {
  try {
    return await orm.orderHistory.deleteMany();
  } catch (error) {
    return handleError(error);
  }
}
