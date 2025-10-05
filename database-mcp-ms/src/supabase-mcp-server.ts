import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createClient as createSupabase } from "@supabase/supabase-js";
import { environment } from "./config/environment.config";
import { listIngredientsTool } from "./tools/ingredient.tool";
import { createRecipeTool, listRecipesTool } from "./tools/recipe.tool";
import { createIngredientToRecipe } from "./tools/recipe-ingredient.tool";

export const mcpServer = new McpServer({
  name: "supabase-mcp",
  version: "1.0.0",
});

export const supabase = createSupabase(
  environment.SUPABASE_URL || '',
  environment.SUPABASE_ANON_KEY || ''
);

export class SupabaseMcpServer {
  constructor() {
    this.registerTools();
  }

  private registerTools() {
    listIngredientsTool()
    listRecipesTool()
    createRecipeTool()
    createIngredientToRecipe()
  }


  async start() {
    const transport = new StdioServerTransport()
    await mcpServer.connect(transport)
  }
}

