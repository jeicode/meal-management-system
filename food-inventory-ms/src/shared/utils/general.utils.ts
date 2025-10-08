import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export function handleError(error: any) {
  console.error(error.message);
  if (error instanceof PrismaClientKnownRequestError) {
    return { error: { message: 'Error al procesar la solicitud, intenta de nuevo.' } };
  }
  return { error: { message: 'Unknown error' } };
}
