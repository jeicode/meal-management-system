import { describe, test, expect, vi, beforeEach, Mock } from 'vitest';
import { InventoryRpcService } from './inventory-rpc.service';
import { InventoryRpcDatasource } from '../datasources/inventory.datasource';

// 1. Crear la Interfaz Simulada (Mock)
const mockDatasource: Record<keyof InventoryRpcDatasource, Mock> = {
  getInventoryIngredients: vi.fn(),
  getInventoryPurchaseHistory: vi.fn(),
};

// Le inyectamos la versión simulada (mock) del datasource.
const service = new InventoryRpcService(mockDatasource as InventoryRpcDatasource);

describe('InventoryService Unit Tests (Vitest)', () => {
  // Limpiamos los mocks antes de cada prueba.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ----------------------------------------------------------------------
  // PRUEBA 1: Flujo de obtener ingredientes
  // ----------------------------------------------------------------------
  test('should successfully get a list of ingredients and call the datasource', async () => {
    const mockIngredients = [{ name: 'Tomato', quantity: 5 }];
    mockDatasource.getInventoryIngredients.mockResolvedValue(mockIngredients);
    const result = await service.getInventoryIngredients();
    expect(mockDatasource.getInventoryIngredients).toHaveBeenCalledOnce();
    expect(mockDatasource.getInventoryIngredients).toHaveBeenCalledWith();
    expect(result).toEqual(mockIngredients); 
  });

  // ----------------------------------------------------------------------
  // PRUEBA 2: Flujo de historial de compra con parámetros
  // ----------------------------------------------------------------------
  test('should call purchase history with correct pagination parameters', async () => {
    const mockParams = { take: 10, skip: 20 };
    const mockHistory = { items: [{ id: 1 }], total: 50 };
    mockDatasource.getInventoryPurchaseHistory.mockResolvedValue(mockHistory);
    const result = await service.getInventoryPurchaseHistory(mockParams);
    expect(mockDatasource.getInventoryPurchaseHistory).toHaveBeenCalledWith(mockParams);
    expect(result).toEqual(mockHistory);
  });
});