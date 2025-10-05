import { mcpServer } from "../supabase-mcp-server";

export function listIngredientsTool() {
    mcpServer.tool(
        "list-ingredients",
        {
            title: "Lista de ingredientes",
            description: "lista de ingredientes disponibles para crear las nuevas recetas que se soliciten",
        },
        async () => {
            const res = await fetch('http://localhost:3000/api/v1/inventory/ingredients')
            const data = await res.json();
            if (data.error) throw new Error(data.error?.message);
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
                structuredContent: { data },
            };
        }
    );
}