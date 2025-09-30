import { describe, it, expect, vi } from 'vitest';
import { retry } from './db.utils';

describe('retry', () => {
  it('should resolve immediately if fn succeeds on first try', async () => {
    const fn = vi.fn().mockResolvedValue('ok');

    const result = await retry(fn);

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry if fn fails and eventually succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const result = await retry(fn, 3, 10); // Delay pequeño para tests

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw if fn fails all retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));

    await expect(retry(fn, 3, 10)).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
