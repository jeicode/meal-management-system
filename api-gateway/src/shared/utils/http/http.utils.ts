import { IncomingMessage, ServerResponse } from 'http';

export async function parseRequestBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            try {
                const parsed = JSON.parse(body);
                resolve(parsed);
            } catch (err) {
                reject(new Error('JSON inválido'));
            }
        });
        req.on('error', reject);
    });
}


type SendResponseParams = {
    res: ServerResponse;
    status: number;
    data: Record<string, any>;
}
export function sendResponse({ res, status, data }: SendResponseParams) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}


export function handleError(err: any, res: ServerResponse) {
    if(res.writableEnded) return;
    console.error('Error: ', err.message);
    const status = err.name === 'ValidationError' || err.message === 'JSON inválido' ? 400 : 500;
    const message = err.message || 'Error interno del servidor';

    sendResponse({ res, status, data: { error: { message } } });
}

const allowedOrigins = [
    'https://restaurant-client-ms.vercel.app',
    'http://localhost:4200',
    'http://localhost:3000'
  ];
export function addCors(req: IncomingMessage, res: ServerResponse) {
    const origin = req.headers.origin || '';
    if (allowedOrigins.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
   
    if (req.method === 'OPTIONS') { // Manejo de preflight para OPTIONS
        res.writeHead(204);
        return res.end();
    }
}

export function addSecurityHeaders(res: ServerResponse) {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
}


export function parseQueryToObject(query: Record<string, any>): Record<string, any> {
    const parsedQuery: Record<string, any> = {};
    for (const key in query) {
        if (query.hasOwnProperty(key)) {
            const value = query[key];
            if (typeof value !== 'string') {
                parsedQuery[key] = value;
                continue;
            }
            const [mainKey, subKey] = key.split('.');
            if (subKey == 'in') {
                parsedQuery[mainKey] = {
                    [subKey]: value.split(',').map(item => item.trim())
                };
            } 
            else {
                if (subKey) {
                    parsedQuery[mainKey] = {
                        [subKey]: value
                    };
                } else {
                    parsedQuery[mainKey] = value;
                }
            }
        }
    }

    return parsedQuery;
}

