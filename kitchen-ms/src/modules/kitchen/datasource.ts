
export abstract class KitchenDatasource {
  abstract rpcOrdersDelivered(): void;
  abstract rpcOrdersHistory(): void;
  abstract rpcRecipes(): void;
}