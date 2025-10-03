// service.test.ts
import { describe, it, expect, vi, beforeEach, Mocked } from "vitest";
import { KitchenDatasource } from "src/api/kitchen/domain/datasources/kitchen.datasource";
import { KitchenService } from "./kitchen.service";

describe("KitchenService", () => {
  let datasourceMock: Mocked<KitchenDatasource>;
  let service: KitchenService;

  beforeEach(() => {
    datasourceMock = {
      getKitchenOrders: vi.fn(),
      getRecipesFromKitchen: vi.fn(),
      sendOrderToKitchen: vi.fn(),
    } as unknown as Mocked<KitchenDatasource>;

    service = new KitchenService(datasourceMock);
  });

  it("debería obtener kitchen orders desde el datasource", async () => {
    const params = { take: 10, skip: 0, where: {}, orderBy: {} };
    const fakeOrders = [{ id: 1, status: "PENDING" }];
    datasourceMock.getKitchenOrders.mockResolvedValue(fakeOrders);

    const result = await service.getKitchenOrders(params);

    expect(datasourceMock.getKitchenOrders).toHaveBeenCalledWith(params);
    expect(result).toEqual(fakeOrders);
  });

  it("debería obtener recetas desde el datasource", async () => {
    const fakeRecipes = [{ id: 1, name: "Pasta" }];
    datasourceMock.getRecipesFromKitchen.mockResolvedValue(fakeRecipes);

    const result = await service.getRecipesFromKitchen();

    expect(datasourceMock.getRecipesFromKitchen).toHaveBeenCalled();
    expect(result).toEqual(fakeRecipes);
  });

  it("debería enviar orden a la cocina", async () => {
    const params = { dishes: 3 };
    const fakeResponse = { success: true };
    datasourceMock.sendOrderToKitchen.mockResolvedValue(fakeResponse);

    const result = await service.sendOrderToKitchen(params);

    expect(datasourceMock.sendOrderToKitchen).toHaveBeenCalledWith(params);
    expect(result).toEqual(fakeResponse);
  });
});
