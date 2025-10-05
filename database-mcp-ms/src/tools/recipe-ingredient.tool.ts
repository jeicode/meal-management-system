import { mcpServer, supabase } from '../supabase-mcp-server';
import { z } from 'zod';

export function createIngredientToRecipe() {
  // 🧩 Tool #2: Crear receta
  mcpServer.registerTool(
    'Crear ingrediente para la receta',
    {
      title: 'Crear ingrediente para la receta',
      description: 'Crear ingrediente para la receta en la base de datos',
      inputSchema: {
        recipeId: z.number().describe('Id de la receta previamente creada'),
        ingredientId: z.number().describe('Id del ingrediente disponible en base de datos'),
        quantity: z.number().describe('Cantidad del ingrediente necesario para la receta'),
      },
    },
    async args => {
      const { recipeId, ingredientId, quantity } = args;

      if (!recipeId || !ingredientId || !quantity)
        throw new Error("Faltan parámetros: 'recipeId' o 'ingredientId' 'quantity'.");

      const { data, error } = await supabase
        .from('RecipeIngredient')
        .insert([{ recipeId, ingredientId, quantity }])
        .select('*');

      if (error) throw new Error(error.message);

      return {
        content: [
          {
            type: 'text',
            text: `RecipeIngredient creada: ${JSON.stringify(data, null, 2)}`,
          },
        ],
        structuredContent: { data },
      };
    },
  );
}
