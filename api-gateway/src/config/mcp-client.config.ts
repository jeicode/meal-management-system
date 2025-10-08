import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { environment } from './environment.config';

class MCPClientService {
  private client: Client | null = null;
  private transport: StreamableHTTPClientTransport | null = null;
  private mcpUrl: string;

  constructor(mcpUrl: string = environment.MCP_SERVER_URL) {
    this.mcpUrl = mcpUrl;
  }

  async connect() {
    if (this.client) {
      return this.client;
    }

    try {
      this.transport = new StreamableHTTPClientTransport(new URL(`${this.mcpUrl}/mcp`));

      this.client = new Client(
        {
          name: 'meal-management-client',
          version: '1.0.0',
        },
        {
          capabilities: {
            tools: {},
          },
        },
      );

      await this.client.connect(this.transport);
      console.log('✅ Connected to MCP server');

      return this.client;
    } catch (error) {
      console.error('❌ Failed to connect to MCP:' + this.mcpUrl, error);
      this.client = null;
      this.transport = null;
      throw error;
    }
  }

  async listTools() {
    try {
      const client = await this.connect();
      const response = await client.listTools();
      return response;
    } catch (error) {
      console.error('Error listing tools:', error);
      throw error;
    }
  }

  async callTool(name: string, args: Record<string, unknown>) {
    try {
      const client = await this.connect();
      const response = await client.callTool({
        name,
        arguments: args,
      });
      return response;
    } catch (error) {
      console.error(`Error calling tool ${name}:`, error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      try {
        await this.client.close();
        console.log('✅ Disconnected from MCP server');
      } catch (error) {
        console.error('Error disconnecting:', error);
      } finally {
        this.client = null;
        this.transport = null;
      }
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.mcpUrl}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed with status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('MCP health check failed:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const mcpClient = new MCPClientService(
  process.env.MCP_SERVER_URL || 'http://localhost:3001',
);
