// service.ts

import { ApiGatewayDatasource } from "./datasource";

export class ApiGatewayService {
  constructor(private readonly datasource: ApiGatewayDatasource) {}

  async rpcOrdersPendingOrPreparing() {
    return await this.datasource.rpcOrdersPendingOrPreparing();
  }
  
  async rpcApiGatewayOrders() {
    return await this.datasource.rpcApiGatewayOrders();
  }
}
