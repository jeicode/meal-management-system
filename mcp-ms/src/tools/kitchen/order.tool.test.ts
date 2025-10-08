import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mcpServer } from '../../supabase-mcp-server';
import { createOrderTool } from './order.tool';

// Mock del mcpServer
vi.mock('../../supabase-mcp-server', () => ({
  mcpServer: {
    registerTool: vi.fn(),
  },
}));

// Mock de fetch global
global.fetch = vi.fn();

describe('createOrderTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe registrar la herramienta con el título y descripción correctos', () => {
    createOrderTool();

    expect(mcpServer.registerTool).toHaveBeenCalledTimes(1);
    expect(mcpServer.registerTool).toHaveBeenCalledWith(
      'crearOrden',
      expect.objectContaining({
        title: 'Crear una nueva orden de cocina',
        description: expect.stringContaining('Crea una nueva orden en el sistema de cocina'),
      }),
      expect.any(Function),
    );
  });

  it('debe verificar que el inputSchema tiene los campos correctos', () => {
    createOrderTool();

    const callArgs = (mcpServer.registerTool as any).mock.calls[0][1];

    expect(callArgs.inputSchema).toHaveProperty('dishes');
    expect(callArgs.inputSchema).toHaveProperty('presetRecipesIds');
  });

  it('debe crear una URL solo con dishes cuando solo se proporciona dishes', async () => {
    const mockData = {
      orderId: '123',
      status: 'created',
      dishes: 3,
    };

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockData,
    });

    createOrderTool();

    const handler = (mcpServer.registerTool as any).mock.calls[0][2];
    await handler({ dishes: 3 });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/kitchen/order?dishes=3',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  });

  it('debe crear una URL solo con presetRecipesIds cuando solo se proporcionan recetas', async () => {
    const mockData = {
      orderId: '456',
      status: 'created',
      recipes: ['1', '2', '3'],
    };

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockData,
    });

    createOrderTool();

    const handler = (mcpServer.registerTool as any).mock.calls[0][2];
    await handler({ presetRecipesIds: '1,2,3' });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/kitchen/order?presetRecipesIds=1,2,3',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  });

  it('debe crear una URL con ambos parámetros cuando se proporcionan dishes y presetRecipesIds', async () => {
    const mockData = {
      orderId: '789',
      status: 'created',
    };

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockData,
    });

    createOrderTool();

    const handler = (mcpServer.registerTool as any).mock.calls[0][2];
    await handler({ dishes: 5, presetRecipesIds: '1,2' });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/kitchen/order?dishes=5&presetRecipesIds=1,2',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  });
});
