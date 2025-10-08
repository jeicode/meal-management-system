import { mcpServer, supabase } from '../supabase-mcp-server';
import { z } from 'zod';

export function createIngredientToRecipe() {
  // 🧩 Tool #2: Crear receta
  mcpServer.registerTool(
    'crearIngredienteParaReceta',
    {
      title: 'Crear ingrediente para una receta',
      description:
        'Asocia un ingrediente existente a una receta ya creada en la base de datos, indicando la cantidad necesaria. Úsalo cuando la receta y el ingrediente ya existan',
      inputSchema: {
        recipeId: z.number().describe('ID numérico de la receta existente.'),
        ingredientId: z.number().describe('ID numérico del ingrediente existente.'),
        quantity: z.number().describe('Cantidad requerida del ingrediente para la receta.'),
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

export function listRecipeIngredientsTool() {
  mcpServer.registerTool(
    'listarIngredientesReceta',
    {
      title: 'Listar ingredientes de una receta específica',
      description:
        'Devuelve la lista **completa** de ingredientes para una receta, utilizando su ID.',
      inputSchema: {
        recipeId: z.number().describe('ID numérico de la receta'),
      },
      outputSchema: {
        data: z.array(
          z.object({
            recipeId: z.number(),
            ingredientId: z.number(),
            quantity: z.number(),
          }),
        ),
      },
    },
    async ({ recipeId }) => {
      const { data, error } = await supabase
        .from('RecipeIngredient')
        .select('*')
        .eq('recipeId', recipeId);
      if (error) throw new Error(error.message);

      return {
        content: [
          {
            type: 'text',
            text: `Se encontraron ${data.length} ingredientes para la receta con ID ${recipeId} ${JSON.stringify(data, null, 2)}`,
          },
        ],
        structuredContent: { data },
      };
    },
  );
}
