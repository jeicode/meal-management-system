import { mcpServer } from '../../supabase-mcp-server';

export function listIngredientsTool() {
  mcpServer.registerTool(
    'Listar ingredientes y consultar inventario',
    {
      title: 'Listar ingredientes y consultar inventario',
      description:
        'Devuelve la lista **completa** de todos los ingredientes. Útil para verificar la **disponibilidad**, **stock**, buscar ingredientes **faltantes**, **agotados** o cualquier consulta relacionada con el inventario actual.',
    },
    async () => {
      const res = await fetch('http://localhost:3000/api/v1/inventory/ingredients');
      const data = await res.json();
      if (data.error) throw new Error(data.error?.message);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: { data },
      };
    },
  );
}
