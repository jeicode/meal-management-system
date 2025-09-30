
import http from 'http';
import { channel, connection, connectRabbitMQ } from './rabbitmq.config';
import { logInfo } from '../../shared/utils/logs.utils';
import { addCors, addRoutes, addSecurityHeaders } from '../../shared/utils/http/http.utils';
import { routes } from '../../api/routes';

type ServerOptions = {
    PORT: number;
};
export let server: http.Server | null = null;

export function createHttpServer() {
    return http.createServer(async (req, res) => {
        addSecurityHeaders(res);
        addCors(req, res);
        addRoutes({req, res, routes});
    });
}

export async function runServer({ PORT }: ServerOptions) {
    server = createHttpServer();
    await connectRabbitMQ();
    server.listen(PORT, () => {
      logInfo(`✅ API Gateway escuchando en http://localhost:${PORT}`);
    });  
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }


async function shutdown() {
    logInfo('Cerrando servidor...');
    if (server) {
      server.close();
    }
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    process.exit(0);
  }