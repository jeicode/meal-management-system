/**
 * 
 * @param operation 
 * @param retries 
 * @param delayMs 
 * @returns 
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T | undefined> => {
  for (let i = 0; i < retries; i++) {
      try {
          return await fn();
      } catch (err) {
          if (i === retries - 1) throw err;
          await new Promise((res) => setTimeout(res, delay * (i + 1))); // Backoff progresivo
      }
  }
};