
export abstract class ApiGatewayDatasource {
  abstract rpcOrdersPendingOrPreparing(): void;
  abstract rpcApiGatewayOrders(): void;
}