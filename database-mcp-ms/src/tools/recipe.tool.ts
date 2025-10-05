import { z } from 'zod';
import { mcpServer, supabase } from '../supabase-mcp-server';

export function createRecipeTool() {
  mcpServer.registerTool(
    'Crear receta',
    {
      title: 'Crear receta',
      description: 'Crear nueva receta en la base de datos',
      inputSchema: { name: z.string() },
    },

    async ({ name }) => {
      // Validación adicional
      if (!name.trim()) {
        throw new Error("El parámetro 'name' es requerido");
      }
      try {
        const { data, error } = await supabase
          .from('Recipe')
          .insert([{ name: name.trim() }])
          .select(); // Agregado para obtener los datos insertados

        if (error) {
          throw new Error(`Error al crear la receta: ${error.message}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ Receta creada exitosamente:\n${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error al crear la receta: ${err?.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}

export function listRecipesTool() {
  mcpServer.registerTool(
    'Lista de recetas',
    {
      title: 'Lista de recetas',
      description: 'Obtener todas las recetas de la base de datos',
    },
    async () => {
      const { data, error } = await supabase.from('Recipe').select('*');
      if (error) throw new Error(error.message);

      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: { data },
      };
    },
  );
}
