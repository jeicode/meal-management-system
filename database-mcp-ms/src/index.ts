import { SupabaseMcpServer } from './supabase-mcp-server';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const server = new SupabaseMcpServer(PORT);
server.start().catch(console.error);

// Manejo de cierre limpio
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down MCP server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down MCP server...');
  process.exit(0);
});
