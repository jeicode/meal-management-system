import { IOrderHistoryUpdate } from "src/core/interfaces/order-history.interface";
import { OrderDatasource } from "../datasources/orders.datasource";

export class OrderService implements OrderDatasource {
    constructor(protected readonly datasource: OrderDatasource) {}
    requestOrderHistoryToKitchen(data: IOrderHistoryUpdate): Promise<void> {
        return this.datasource.requestOrderHistoryToKitchen(data);
    }
}