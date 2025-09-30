import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { sendResponse } from './http.utils';

describe('sendResponse', () => {
  let resMock:any = {};

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