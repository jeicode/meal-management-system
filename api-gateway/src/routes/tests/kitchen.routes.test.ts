import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createHttpServer } from '../../config/http-server.config';

const BASE_API = '/api/v1/kitchen';

describe('GET /api/v1/kitchen/order', () => {
  it('Param dishes is required', async () => {
    const server = createHttpServer();
    const res = await request(server).get(`${BASE_API}/order`)
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Param dishes is required');
  });
  it('Param dishes must be a number', async () => {
    const server = createHttpServer();
    const res = await request(server).get(`${BASE_API}/order?dishes=NUMBER`)
    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('dishes must be a `number` type, but the final value was:');
  });

  it('Param dishes must be greater than 0', async () => {
    const server = createHttpServer();
    const res = await request(server).get(`${BASE_API}/order?dishes=0`)
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('You must send at least one dish');
  });

  it('Param dishes must be less or equal than 15', async () => {
    const server = createHttpServer();
    const res = await request(server).get(`${BASE_API}/order?dishes=16`)
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('You can send a maximum of 15 dishes');
  });

  it('dishes must be an integer', async () => {
    const server = createHttpServer();
    const res = await request(server).get(`${BASE_API}/order?dishes=1.2`)
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('dishes must be an integer');
  }); 
});

