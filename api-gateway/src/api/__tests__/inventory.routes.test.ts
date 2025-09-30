import request from 'supertest';
import { describe, it, expect, vi, Mock } from 'vitest';
import { createHttpServer } from '../../config/http-server.config';
import { getInventoryIngredients } from '../../shared/services/rabbitmq.service';

const BASE_API = '/api/v1/inventory';

vi.mock('../../shared/services/rabbitmq.service', () => ({
  getInventoryIngredients: vi.fn()
}));

const mockGetInventoryIngredients = getInventoryIngredients as Mock;

describe('GET /api/v1/inventory/ingredients ', () => {
  it('should return a list of ingredients', async () => {
    mockGetInventoryIngredients.mockResolvedValue({data: [{id: 1, name: 'Ingredient 1', quantity: 10}]});
    const server = createHttpServer();
    const {body:{data}} = await request(server).get(`${BASE_API}/ingredients`)
    const dataApi = data.data;
    expect(dataApi).toEqual([{id: 1, name: 'Ingredient 1', quantity: 10}]);
    expect(dataApi.length).toBeGreaterThan(0);
  });


  it('should return error if exist error', async () => {
    mockGetInventoryIngredients.mockResolvedValue({error: {message: 'Error getting ingredients'}});
    const server = createHttpServer();
    const res = await request(server).get(`${BASE_API}/ingredients`)
    expect(res.status).toBe(500);
    expect(res.body?.data).toBe(undefined);
    expect(res.body?.error?.message).toContain('Error getting ingredients');
  });
});

