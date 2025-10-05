import { PrismaClientKnownRequestError } from '../../../prisma/prisma-client/runtime/library';
import { logError } from './logs.utils';

/**
 *
 * @param items
 * @param count
 * @returns
 */
export function randomItemFromList<T>(items: T[], count: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(items[Math.floor(Math.random() * items.length)]);
  }
  return result;
}

export function handleError(error: any) {
  logError(error.message);
  if (error instanceof PrismaClientKnownRequestError) {
    return { error: { message: 'Error al procesar la solicitud, intenta de nuevo.' } };
  }
  return { error: { message: 'Unknown error' } };
}

export function isValidValue(value?: string): boolean {
  if (value === 'undefined' || !value || value === 'null') return false;
  return true;
}
