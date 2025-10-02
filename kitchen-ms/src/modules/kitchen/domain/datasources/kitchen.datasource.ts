
export interface KitchenDatasource {
  rpcOrdersDelivered(): void;
  rpcOrdersHistory(): void;
  rpcRecipes(): void;
}