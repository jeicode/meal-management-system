import { mcpServer, supabase } from "../supabase-mcp-server";

export function createRecipeTool() {
    // 🧩 Tool #2: Crear receta
    mcpServer.tool(
        "create_recipe",
        {
            title: "Crear nueva receta",
            description: "Inserta una nueva receta en la tabla 'recipes'.",
        },
        async (args) => {
            const { name } = args;

            if (!name) throw new Error("Faltan parámetros: 'name'");

            const { data, error } = await supabase
                .from("Recipe")
                .insert([{ name }])
                .select("*");

            if (error) throw new Error(error.message);

            return {
                content: [
                    {
                        type: "text",
                        text: `Receta creada: ${JSON.stringify(data, null, 2)}`,
                    },
                ],
                structuredContent: { data },
            };
        }
    );
}


export function listRecipesTool() {
    mcpServer.tool(
        "list-recipes",
        {
            title: "Lista de recetas",
            description: "Obtener todas las recetas de la base de datos.",
        },
        async () => {
            const { data, error } = await supabase.from("Recipe").select("*");
            if (error) throw new Error(error.message);

            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
                structuredContent: { data },
            };
        }
    );
}
