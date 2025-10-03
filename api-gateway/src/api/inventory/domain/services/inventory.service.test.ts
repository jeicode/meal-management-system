import { describe, test, expect, vi, beforeEach, Mock } from 'vitest';
import { InventoryService } from '../services/inventory.service';
import { InventoryDatasource } from '../datasources/inventory.datasource';

// 1. Crear la Interfaz Simulada (Mock)
const mockDatasource: Record<keyof InventoryDatasource, Mock> = {
  getInventoryIngredients: vi.fn(),
  getInventoryPurchaseHistory: vi.fn(),
  suscribeAndResponseInventoryIngredients: vi.fn(),
};

// Le inyectamos la versión simulada (mock) del datasource.
const service = new InventoryService(mockDatasource as InventoryDatasource);

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
  
  // ----------------------------------------------------------------------
  // PRUEBA 3: Flujo de suscripción
  // ----------------------------------------------------------------------
  test('should delegate subscription logic to the datasource', async () => {
    const mockSubscriptionStatus = { success: true, message: "Subscribed" };
    mockDatasource.suscribeAndResponseInventoryIngredients.mockResolvedValue(mockSubscriptionStatus);
    const result = await service.suscribeAndResponseInventoryIngredients();
    // 1. Verificamos que el método de suscripción fue llamado.
    expect(mockDatasource.suscribeAndResponseInventoryIngredients).toHaveBeenCalledOnce();
    // 2. Verificamos que el resultado es el esperado.
    expect(result).toEqual(mockSubscriptionStatus);
  });
});