import { ApiGatewayDatasource } from "../datasources/api-gateway.datasource";

export class ApiGatewayService {
  constructor(private readonly datasource: ApiGatewayDatasource) {}

  async rpcOrdersPendingOrPreparing() {
    return this.datasource.rpcOrdersPendingOrPreparing();
  }
  
  async rpcApiGatewayOrders() {
    return this.datasource.rpcApiGatewayOrders();
  }
}
