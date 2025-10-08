import { z } from 'zod';
import { mcpServer } from '../../supabase-mcp-server'; // Asumiendo que esta es la configuración de tu framework
const PurchaseItemSchema = z
  .object({
    id: z.number().describe('ID único de la transacción de compra.'),
    orderId: z.number().describe('ID de la orden o factura a la que pertenece esta compra.'),
    ingredientToPurchase: z.string().describe('Nombre o identificador del ingrediente comprado.'),
    quantityPurchased: z.number().describe('Cantidad comprada del ingrediente.'),
    createdAt: z.string().describe('Fecha y hora en que se registró la compra (ISO 8601).'),
    updatedAt: z.string().describe('Fecha y hora de la última modificación (ISO 8601).').optional(),
  })
  .describe('Detalles de una transacción individual de compra de ingredientes.');

// 2. Esquema para la Paginación
const PaginationSchema = z
  .object({
    total: z.number().describe('Número total de registros disponibles.'),
    remaining: z.number().describe('Número de registros restantes en el historial.'),
    take: z.number().describe('Número de registros devueltos por página.'),
    skip: z.number().describe('Número de registros saltados (offset).'),
  })
  .describe('Metadatos de paginación de la respuesta.');

export function listPurchaseHistoryTool() {
  mcpServer.registerTool(
    'Obtener_Historial_Compras',
    {
      title: 'Obtener Historial Completo de Compras de Ingredientes',
      description:
        'Devuelve una lista completa de todas las transacciones de compra de ingredientes que se han realizado. Úsala para responder preguntas sobre **qué, cuándo y cuánto** se ha comprado.',
      outputSchema: {
        data: z
          .array(PurchaseItemSchema)
          .describe('Lista de todas las compras de ingredientes registradas.'),
        pagination: PaginationSchema.describe('Información de paginación de la respuesta.'),
      },
    },
    async () => {
      try {
        const res = await fetch('http://localhost:3000/api/v1/inventory/purchase-history?take=300');
        if (!res.ok) {
          const errorBody = await res.text();
          throw new Error(
            `Error al obtener el historial de compras. Estado: ${res.status}. Cuerpo de la respuesta: ${errorBody}`,
          );
        }

        const data = await res.json();

        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
          structuredContent: data,
        };
      } catch (error: any) {
        console.error('Error en Obtener_Historial_Compras:', error);
        return {
          content: [
            {
              type: 'text',
              text: `ERROR: No se pudo obtener el historial de compras. Razón: ${error.message}`,
            },
          ],
          structuredContent: { error: error.message },
        };
      }
    },
  );
}
