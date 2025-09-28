import { IncomingMessage, ServerResponse } from "http";

export const sseClients: ServerResponse[] = []; // todos los clientes SSE activos

export async function runServerSSE(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.push(res);

  // enviamos un primer evento vacío para mantener viva la conexión
  res.write(`event: connected\ndata: ${JSON.stringify(true)}\n\n`);
  req.on('close', () => {
    const index = sseClients.indexOf(res);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
    res.end();
  });
}

