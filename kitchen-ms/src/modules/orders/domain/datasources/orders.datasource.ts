export interface OrdersRpcDatasource {
  rpcOrdersToKitchen(): Promise<unknown>;
}

export interface OrdersSubscriberDatasource {
  subscribeToOrderChanges(): void;
}
