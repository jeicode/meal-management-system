import http from 'http';
import { describe, expect, it } from 'vitest';
import { createHttpServer } from '../../config/http-server.config';
import { AddressInfo } from 'net';

describe('GET /api/v1/sse', () => {
  it('should receive SSE message with connected: true', async () => {
    const app = createHttpServer();
    const server = app.listen();

    const options = {
      hostname: 'localhost',
      port: (server.address() as AddressInfo).port,
      path: '/api/v1/sse',
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
      },
    };

    await new Promise<void>((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk.toString();
          if (data.includes('connected') && data.includes('true')) {
            expect(res.statusCode).toBe(200);
            expect(data).toContain('connected');
            expect(data).toContain('true');
            resolve();
            server.close();
            req.destroy();
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
        server.close();
      });

      req.end();
    });
  });
});
