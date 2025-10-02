import { describe, expect, it } from 'vitest';
import { orderSchema } from 'src/api/kitchen/presentation/schemas/kitchen-order.schemas';

describe('orderSchema validation', () => {

  it('should pass with a valid number of dishes', async () => {
    const validData = { dishes: 5 };
    await expect(orderSchema.isValid(validData)).resolves.toBe(true);
  });

  it('should fail if dishes is less than 1', async () => {
    const invalidData = { dishes: 0 };

    await expect(orderSchema.isValid(invalidData)).resolves.toBe(false);
    try {
      await orderSchema.validate(invalidData);
    } catch (error) {
      expect((error as Error).message).toBe('You must send at least one dish');
    }
  });

  it('should fail if dishes is greater than 15', async () => {
    const invalidData = { dishes: 16 };

    await expect(orderSchema.isValid(invalidData)).resolves.toBe(false);
    try {
      await orderSchema.validate(invalidData);
    } catch (error) {
      expect((error as Error)?.message).toBe('You can send a maximum of 15 dishes');
    }
  });

  it('should fail if dishes is not provided', async () => {
    const invalidData = {};
    await expect(orderSchema.isValid(invalidData)).resolves.toBe(false);
    try {
      await orderSchema.validate(invalidData);
    } catch (error) {
      expect((error as Error)?.message).toBe('Param dishes is required');
    }
  });
});
