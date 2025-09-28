
import http from 'http';
import { setupRabbitMQ } from './rabbitmq.config';
import { logInfo } from '../shared/utils/logs.utils';
import { addCors, addSecurityHeaders } from '../shared/utils/http/http.utils';
import { addRoutes } from '../routes/routes';
import { suscribeAndResponseInventoryIngredients } from '../events/inventory.event';
import { suscribeOrdersPendingOrPreparing } from '../events/kitchen.event';

type ServerOptions = {
    PORT: number;
};

export function createHttpServer() {
    return http.createServer(async (req, res) => {
        addSecurityHeaders(res);
        addCors(req, res);
        addRoutes(req, res);
    });
}

export async function runServer({ PORT }: ServerOptions) {
    const server = createHttpServer();
    setupRabbitMQ().then(() => {
        suscribeAndResponseInventoryIngredients();
        suscribeOrdersPendingOrPreparing();
        
        server.listen(PORT, () => {
            logInfo(`API Gateway escuchando en http://localhost:${PORT}`);
        });
    });
}
    