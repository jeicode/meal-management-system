import { z } from 'zod';
import { mcpServer } from '../../supabase-mcp-server';

export function createOrderTool() {
  mcpServer.registerTool(
    'crearOrden',
    {
      title: 'Crear una nueva orden de cocina',
      description: `
      Crea una nueva orden en el sistema de cocina.  
      La orden puede generarse de dos formas:
      1. Indicando cuántos platos se deben preparar (campo \`dishes\`).
      2. Especificando los IDs de recetas predefinidas (campo \`presetRecipesIds\`).
      
      Si se incluyen ambos campos, se priorizarán las recetas predefinidas.  
      Esta acción envía la información al microservicio de cocina para iniciar el proceso de preparación.
      `,
      inputSchema: {
        dishes: z
          .number()
          .optional()
          .describe(
            'Cantidad de platos para la orden. Las recetas se seleccionan de forma aleatoria',
          ),
        presetRecipesIds: z
          .string()
          .optional()
          .describe(
            'IDs de las recetas predefinidas para la orden separado por comas. Los ids deben existir en basa de datos',
          ),
      },
    },
    async args => {
      let alreadyParams = false;
      let url = 'http://localhost:3000/api/v1/kitchen/order';
      if (args.dishes) {
        url += `?dishes=${args.dishes}`;
        alreadyParams = true;
      }
      if (args.presetRecipesIds) {
        url += `${alreadyParams ? '&' : '?'}presetRecipesIds=${args.presetRecipesIds}`;
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error?.message);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: { data },
      };
    },
  );
}
