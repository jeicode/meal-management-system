import { orm } from "./config/orm.config";
import { logError } from "./shared/utils/logs.utils";

const updateHistory = orm.orderHistory.updateMany;
const timeToPrepare = 8000;
export const prepareOrdersJob = async () => {
    try {
        await updateHistory({
            where: {
                status: 'PREPARING',
                createdAt: {
                    lt: new Date(Date.now() - 4000),
                },
            },
            data: { status: 'DELIVERED' },
        });
    } 
    catch (error: any) {logError(error.message)} 
    setTimeout( async () => await prepareOrdersJob(), timeToPrepare);
};
