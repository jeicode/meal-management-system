import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mcpServer } from '../../supabase-mcp-server';
import { listIngredientsTool } from './ingredient.tool';

// Mock del mcpServer
vi.mock('../../supabase-mcp-server', () => ({
  mcpServer: {
    registerTool: vi.fn(),
  },
}));

// Mock de fetch global
global.fetch = vi.fn();

describe('listIngredientsTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe registrar la herramienta con el título y descripción correctos', () => {
    listIngredientsTool();

    expect(mcpServer.registerTool).toHaveBeenCalledTimes(1);
    expect(mcpServer.registerTool).toHaveBeenCalledWith(
      'Listar ingredientes y consultar inventario',
      {
        title: 'Listar ingredientes y consultar inventario',
        description:
          'Devuelve la lista **completa** de todos los ingredientes. Útil para verificar la **disponibilidad**, **stock**, buscar ingredientes **faltantes**, **agotados** o cualquier consulta relacionada con el inventario actual.',
      },
      expect.any(Function),
    );
  });

  it('debe realizar un fetch a la URL correcta cuando se ejecuta el handler', async () => {
    const mockData = {
      ingredients: [
        { id: 1, name: 'Tomate', stock: 10 },
        { id: 2, name: 'Cebolla', stock: 5 },
      ],
    };

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockData,
    });

    listIngredientsTool();

    // Obtener el handler (tercer argumento)
    const handler = (mcpServer.registerTool as any).mock.calls[0][2];
    await handler();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/v1/inventory/ingredients');
  });

  it('debe retornar los datos en el formato correcto cuando la respuesta es exitosa', async () => {
    const mockData = {
      ingredients: [
        { id: 1, name: 'Tomate', stock: 10 },
        { id: 2, name: 'Cebolla', stock: 5 },
      ],
    };

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockData,
    });

    listIngredientsTool();

    const handler = (mcpServer.registerTool as any).mock.calls[0][2];
    const result = await handler();

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: JSON.stringify(mockData, null, 2),
        },
      ],
      structuredContent: { data: mockData },
    });
  });

  it('debe lanzar un error cuando la respuesta contiene un error', async () => {
    const mockError = {
      error: {
        message: 'Error al obtener ingredientes',
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockError,
    });

    listIngredientsTool();

    const handler = (mcpServer.registerTool as any).mock.calls[0][2];

    await expect(handler()).rejects.toThrow('Error al obtener ingredientes');
  });

  it('debe manejar errores de red', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    listIngredientsTool();

    const handler = (mcpServer.registerTool as any).mock.calls[0][2];

    await expect(handler()).rejects.toThrow('Network error');
  });

  it('debe formatear correctamente JSON con indentación de 2 espacios', async () => {
    const mockData = { test: 'data' };

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockData,
    });

    listIngredientsTool();

    const handler = (mcpServer.registerTool as any).mock.calls[0][2];
    const result = await handler();

    expect(result.content[0].text).toBe(JSON.stringify(mockData, null, 2));
  });

  it('debe manejar respuestas con arrays vacíos', async () => {
    const mockData = { ingredients: [] };

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockData,
    });

    listIngredientsTool();

    const handler = (mcpServer.registerTool as any).mock.calls[0][2];
    const result = await handler();

    expect(result.structuredContent.data).toEqual(mockData);
    expect(result.content[0].text).toBe(JSON.stringify(mockData, null, 2));
  });
});
