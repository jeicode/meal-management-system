import { IncomingMessage, ServerResponse } from "http";

export const sseClients: ServerResponse[] = [];

export async function runServerSSE(req: IncomingMessage, res: ServerResponse) {
  res.write(`event: connected\ndata: ${JSON.stringify(true)}\n\n`);
  // 🔥 Heartbeat cada 20s (comentario SSE, no dispara evento en el cliente)
  const interval = setInterval(() => {
    res.write(`:\n\n`);
  }, 20000);

  req.on("close", () => {
    clearInterval(interval);
    const index = sseClients.indexOf(res);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
    res.end();
  });
}
