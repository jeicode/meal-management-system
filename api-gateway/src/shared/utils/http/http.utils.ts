import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { Request, Route } from '../../../core/interfaces/http.interface';
import { contentType } from '../../../core/constants/http.constants';
import { sseClients } from '../../../api/sse/controller';

type SendResponseParams = {
  res: ServerResponse;
  status: number;
  data: unknown;
};
export function sendResponse({ res, status, data }: SendResponseParams) {
  if (res.writableEnded) return;
  res.writeHead(status, contentType);
  res.end(JSON.stringify(data));
}

export function handleError(err: Error | unknown, res: ServerResponse) {
  if (res.writableEnded) return;
  console.error('Error: ', (err as Error).message);
  const status =
    (err as Error).name === 'ValidationError' || (err as Error).message === 'JSON inválido'
      ? 400
      : 500;
  const message = (err as Error).message || 'Error interno del servidor';
  sendResponse({ res, status, data: { error: { message } } });
}

const allowedOrigins = [
  'https://restaurant-client-ms.vercel.app',
  'http://localhost:4200',
  'http://localhost:3000',
];
export function addCors(req: IncomingMessage, res: ServerResponse) {
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return true; // corta la ejecución en el caller
  }
  return false;
}

export function addSecurityHeaders(res: ServerResponse) {
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
}

export function parseQueryToObject(query: Record<string, unknown>): Record<string, unknown> {
  const parsedQuery: Record<string, unknown> = {};
  for (const key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      const value = query[key];
      if (typeof value !== 'string') {
        parsedQuery[key] = value;
        continue;
      }
      const [mainKey, subKey] = key.split('.');
      if (subKey == 'in') {
        parsedQuery[mainKey] = {
          [subKey]: value.split(',').map(item => item.trim()),
        };
      } else {
        if (subKey) {
          parsedQuery[mainKey] = {
            [subKey]: value,
          };
        } else {
          parsedQuery[mainKey] = value;
        }
      }
    }
  }

  return parsedQuery;
}

type AddRoutesParams = {
  routes: Route[];
  req: IncomingMessage;
  res: ServerResponse;
};
export async function addRoutes({ routes, req, res }: AddRoutesParams) {
  const parsedUrl = parse(req.url || '', true);
  const pathname = parsedUrl.pathname;
  const request: Request = req as Request;
  request.query = parseQueryToObject({ ...parsedUrl.query });

  const route = routes.find(r => r.method === req.method && r.path === pathname);
  if (route?.isSSE) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    sseClients.push(res);
    return route.controller(request, res);
  }

  try {
    request.body = await parseRequestBody(req);
    if (!route) {
      return sendResponse({ res, status: 404, data: { error: 'Not Found' } });
    }

    if (route.schema) {
      const dataToValidate = route.validateOn === 'body' ? request.body : request.query;
      await route.schema.validate(dataToValidate, { abortEarly: false });
    }

    return route.controller(request, res);
  } catch (error) {
    handleError(error, res);
  }
}

export async function parseRequestBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch {
        reject(new Error('JSON inválido'));
      }
    });

    req.on('error', reject);
  });
}
