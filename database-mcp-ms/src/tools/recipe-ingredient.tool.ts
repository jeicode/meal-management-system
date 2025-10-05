import { mcpServer, supabase } from "../supabase-mcp-server";

export function createIngredientToRecipe() {
    // 🧩 Tool #2: Crear receta
    mcpServer.tool(
        "create_ingredient_recipe",
        {
            title: "Registrar ingredientes de la nueva receta",
            description: "Inserta los nuevos ingredientes para la nueva receta acabada de crear'.",
        },
        async (args) => {
            const { recipeId, ingredientId, quantity } = args;

            if (!recipeId || !ingredientId || !quantity) throw new Error("Faltan parámetros: 'recipeId' o 'ingredientId' 'quantity'.");

            const { data, error } = await supabase
                .from("RecipeIngredient")
                .insert([{ recipeId, ingredientId, quantity }])
                .select("*");

            if (error) throw new Error(error.message);

            return {
                content: [
                    {
                        type: "text",
                        text: `RecipeIngredient creada: ${JSON.stringify(data, null, 2)}`,
                    },
                ],
                structuredContent: { data },
            };
        }
    );
}
