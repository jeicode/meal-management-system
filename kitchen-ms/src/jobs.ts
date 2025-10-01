import { updateOrderPendingToDelivered } from "./modules/orders/repository";
import { logError } from "./shared/utils/logs.utils";

const timeToPrepare = 8000;
export const prepareOrdersJob = async () => {
    try {
        await updateOrderPendingToDelivered()
    } 
    catch (error: any) {logError(error.message)} 
    setTimeout( async () => await prepareOrdersJob(), timeToPrepare);
};
