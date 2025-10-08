import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { Request, Route } from '../../../core/interfaces/http.interface';
import { contentType } from '../../../core/constants/http.constants';
import { sseClients } from '../../../api/sse/sse.controller';

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
  'https://meal-management-system-ms.vercel.app',
  'http://localhost:4200',
  'http://localhost:3000',
];
export function addCors(req: IncomingMessage, res: ServerResponse) {
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
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
  const parsedQuery: Record<string, any> = {};

  const toProperType = (val: string) => {
    if (/^\d+(\.\d+)?$/.test(val)) return Number(val); // convierte números
    return val;
  };

  for (const key in query) {
    if (!Object.prototype.hasOwnProperty.call(query, key)) continue;
    const value = query[key];
    const keys = key.split('.');

    let current = parsedQuery;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];

      if (i === keys.length - 1) {
        // última clave
        if (k === 'in' && typeof value === 'string') {
          current[k] = value.split(',').map(v => toProperType(v.trim()));
        } else if (typeof value === 'string') {
          current[k] = toProperType(value.trim());
        } else {
          current[k] = value;
        }
      } else {
        if (!current[k] || typeof current[k] !== 'object') {
          current[k] = {};
        }
        current = current[k];
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
