import { z } from 'zod';
import { mcpServer, supabase } from '../../supabase-mcp-server';

export function createRecipeTool() {
  mcpServer.registerTool(
    'Crear receta',
    {
      title: 'Crear receta y sus ingredientes',
      description: 'Crear nueva receta en la base de datos',
      inputSchema: {
        name: z
          .string()
          .describe(
            'Nombre de la receta. Debe ir de acuerdo a los ingredientes que tiene. El nombre debe ser descriptivo. Ejemplo: "Ensalada de pollo"',
          ),
        ingredients: z.array(
          z.object({
            ingredientId: z.number().describe('ID del ingrediente'),
            quantity: z.number().max(3).describe('Cantidad del ingrediente (1-3)'),
          }),
        ),
      },
    },

    async ({ name, ingredients }) => {
      // Validación adicional
      if (!name.trim()) {
        throw new Error("El parámetro 'name' es requerido");
      }
      if (!ingredients || ingredients.length === 0) {
        throw new Error("El parámetro 'ingredients' es requerido");
      }

      try {
        const { data, error } = await supabase
          .from('Recipe')
          .insert([{ name: name.trim() }])
          .select();
        if (error || !data) {
          throw new Error(`Error al crear la receta: ${error.message}`);
        }

        const inserts = ingredients.map(ingredient => ({
          recipeId: data[0].id,
          ingredientId: ingredient.ingredientId,
          quantity: ingredient.quantity,
        }));

        const { error: insertError } = await supabase
          .from('RecipeIngredient')
          .insert(inserts)
          .select();

        if (insertError) {
          throw new Error(`Error al crear los ingredientes de la receta: ${insertError.message}`);
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
