import { updateOrderPendingToDelivered } from '../../modules/orders/domain/repositories/orders.repository';
import { logError } from '../../shared/utils/logs.utils';

const timeToPrepare = 10000;
export const prepareOrdersJob = async () => {
  try {
    await updateOrderPendingToDelivered();
  } catch (error: any) {
    logError(error.message);
  }
  setTimeout(async () => await prepareOrdersJob(), timeToPrepare);
};
