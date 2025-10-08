import { IOrderHistoryUpdate } from '../../../../core/interfaces/order-history.interface';
export interface OrderDatasource {
  requestOrderHistoryToKitchen(data: IOrderHistoryUpdate): Promise<void>;
}
