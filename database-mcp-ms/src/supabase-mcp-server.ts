import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { createClient as createSupabase } from '@supabase/supabase-js';
import { environment } from './config/environment.config';
import { listIngredientsTool } from './tools/ingredient.tool';
import { createRecipeTool, listRecipesTool } from './tools/recipe.tool';
import { createIngredientToRecipe } from './tools/recipe-ingredient.tool';

export const mcpServer = new McpServer({
  name: 'supabase-mcp',
  version: '1.0.0',
});

export const supabase = createSupabase(
  environment.SUPABASE_URL || '',
  environment.SUPABASE_ANON_KEY || '',
);

export class SupabaseMcpServer {
  private app: express.Application;
  private port: number;

  constructor(port: number = 3001) {
    this.app = express();
    this.port = port;
    this.registerTools();
    this.setupRoutes();
  }

  private registerTools() {
    listIngredientsTool();
    listRecipesTool();
    createRecipeTool();
    createIngredientToRecipe();
  }

  private setupRoutes() {
    // Habilitar CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });

    // IMPORTANTE: Parsear JSON antes de /mcp
    this.app.use(express.json());

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'supabase-mcp' });
    });

    // Endpoint MCP
    this.app.post('/mcp', async (req, res) => {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });

      res.on('close', () => {
        transport.close();
      });

      await mcpServer.connect(transport);
      await transport.handleRequest(req, res, req.body);
    });
  }

  async start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 MCP Server running on http://localhost:${this.port}`);
      console.log(`📡 MCP endpoint: http://localhost:${this.port}/mcp`);
      console.log(`💚 Health check: http://localhost:${this.port}/health`);
    });
  }
}
