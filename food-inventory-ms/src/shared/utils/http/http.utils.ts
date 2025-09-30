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
    data: object;
}
export function sendResponse({res, status, data}: SendResponseParams) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}