import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { addCors, addSecurityHeaders, sendResponse } from './http.utils';
import { IncomingMessage, ServerResponse } from 'http';

describe('sendResponse', () => {
  let resMock:any;

  beforeEach(() => {
    resMock = {
      writeHead: vitest.fn(),
      end: vitest.fn(),
    };
  });

  it('should set the correct status and content type headers and send the correct response body', () => {
    const status = 200;
    const data = { message: 'Success' };
    sendResponse({ res: resMock, status, data });
    expect(resMock.writeHead).toHaveBeenCalledWith(status, { 'Content-Type': 'application/json' });
    expect(resMock.end).toHaveBeenCalledWith(JSON.stringify(data));
  });

  it('should call writeHead once', () => {
    const status = 200;
    const data = { message: 'Success' };
    sendResponse({ res: resMock, status, data });
    expect(resMock.writeHead).toHaveBeenCalledTimes(1);
  });

  it('should call end once with the correct data', () => {
    const status = 404;
    const data = { error: 'Not Found' };
    sendResponse({ res: resMock, status, data });
    expect(resMock.end).toHaveBeenCalledWith(JSON.stringify(data));
  });
});


describe('addCors', () => {
  let req: Partial<IncomingMessage>;
  let res: Partial<ServerResponse>;

  beforeEach(() => {
    req = {
      headers: {},
      method: 'GET',
    };
    res = {
      setHeader: vitest.fn(),
      writeHead: vitest.fn(),
      end: vitest.fn(),
    };
  });

  it('should set CORS headers when origin is allowed', () => {
    req!.headers!.origin = 'https://restaurant-client-ms.vercel.app';

    addCors(req as IncomingMessage, res as ServerResponse);

    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', req!.headers!.origin);
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type');
    expect(res.writeHead).not.toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
  });

  it('should NOT set Access-Control-Allow-Origin when origin is not allowed', () => {
    req!.headers!.origin = 'https://not-allowed.com';

    addCors(req as IncomingMessage, res as ServerResponse);
    expect(res.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', req!.headers!.origin);
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type');
  });
});


describe('addSecurityHeaders', () => {
  let res: Partial<ServerResponse>;

  beforeEach(() => {
    res = {
      setHeader: vitest.fn(),
    };
  });

  it('should set security headers', () => {
    addSecurityHeaders(res as ServerResponse);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Frame-Options',
      'SAMEORIGIN'
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Referrer-Policy',
      'strict-origin-when-cross-origin'
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Security-Policy',
      "default-src 'self'"
    );
  });
});
