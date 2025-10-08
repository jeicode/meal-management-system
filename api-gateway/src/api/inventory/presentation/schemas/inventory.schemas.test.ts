import { describe, it, expect } from 'vitest';
import { getPurchaseHistorySchema } from '../schemas/inventory.schemas';

describe('getPurchaseHistorySchema', () => {
  it('debería pasar con valores válidos', async () => {
    const validData = { take: 10, skip: 100 };
    await expect(getPurchaseHistorySchema.validate(validData)).resolves.toEqual(validData);
  });

  it('debería pasar si take es omitido', async () => {
    const validData = { skip: 50 };
    await expect(getPurchaseHistorySchema.validate(validData)).resolves.toEqual(validData);
  });

  it('debería pasar si skip es omitido', async () => {
    const validData = { take: 20 };
    await expect(getPurchaseHistorySchema.validate(validData)).resolves.toEqual(validData);
  });

  it('debería fallar si take es menor a 1', async () => {
    const invalidData = { take: 0, skip: 10 };
    await expect(getPurchaseHistorySchema.validate(invalidData)).rejects.toThrow(
      /take must be greater than or equal to 1/,
    );
  });

  it('debería fallar si take es mayor a 300', async () => {
    const invalidData = { take: 301, skip: 10 };
    await expect(getPurchaseHistorySchema.validate(invalidData)).rejects.toThrow(
      /take must be less than or equal to 300/,
    );
  });

  it('debería fallar si skip es menor a 0', async () => {
    const invalidData = { take: 10, skip: -1 };
    await expect(getPurchaseHistorySchema.validate(invalidData)).rejects.toThrow(
      /skip must be greater than or equal to 0/,
    );
  });

  it('debería fallar si skip es mayor a 1500', async () => {
    const invalidData = { take: 10, skip: 1501 };
    await expect(getPurchaseHistorySchema.validate(invalidData)).rejects.toThrow(
      /skip must be less than or equal to 1500/,
    );
  });

  it('debería fallar si take no es número', async () => {
    const invalidData = { take: 'abc', skip: 10 };
    await expect(getPurchaseHistorySchema.validate(invalidData)).rejects.toThrow(
      /take must be a `number` type/,
    );
  });

  it('debería fallar si skip no es número', async () => {
    const invalidData = { take: 10, skip: 'xyz' };
    await expect(getPurchaseHistorySchema.validate(invalidData)).rejects.toThrow(
      /skip must be a `number` type/,
    );
  });
});
