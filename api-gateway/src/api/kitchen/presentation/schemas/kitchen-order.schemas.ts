import * as yup from 'yup';

export const orderSchema = yup.object().shape({
  dishes: yup
    .number()
    .integer()
    .test(
      'one-of-required', // Nombre del test
      'Debes enviar el parámetro "dishes" O "presetRecipesIds", pero no ambos.', // Mensaje de error (se puede poner en un solo campo)
      function (value) {
        const { presetRecipesIds } = this.parent;

        const dishesExists = value !== null && value !== undefined;
        const presetRecipesExists =
          presetRecipesIds !== null && presetRecipesIds !== undefined && presetRecipesIds !== '';

        if (dishesExists && presetRecipesExists) {
          return this.createError({
            message: 'Solo debes enviar "dishes" O "presetRecipesIds", no ambos.',
          });
        }

        if (!dishesExists && !presetRecipesExists) {
          return this.createError({
            message: 'Debes enviar el parámetro "dishes" O "presetRecipesIds".',
          });
        }

        return true;
      },
    )
    .max(15, 'You can send a maximum of 15 dishes')
    .min(1, 'You must send at least one dish')
    .nullable(),

  presetRecipesIds: yup
    .string()
    .test(
      'one-of-required',
      'Solo debes enviar "dishes" O "presetRecipesIds", no ambos.',
      function () {
        return true;
      },
    )
    .matches(/^(\d+)(,\d+)*$/, 'Debe ser una lista de números separados por comas (ej: 1,2,3)')
    .test('valid-numbers', 'Los IDs deben ser números válidos', value => {
      if (!value) return true;
      const ids = value.split(',');
      return ids.every(id => !isNaN(Number(id)) && Number(id) > 0);
    }),
});

export const getOrdersSchema = yup
  .object({
    where: yup
      .object({
        status: yup
          .mixed()
          .notRequired()
          .test('is-valid-status', 'Invalid status', value => {
            if (value === undefined || value === null) return true; // <<< permite vacío
            if (typeof value === 'string') {
              return true;
            }
            if (typeof value === 'object' && value !== null) {
              const { in: inArray } = value as { in: string[] };
              return Array.isArray(inArray) && inArray.every(item => typeof item === 'string');
            }
            return false;
          }),
      })
      .optional(),
    orderBy: yup
      .object({
        createdAt: yup.mixed().oneOf(['asc', 'desc']),
      })
      .optional(),
  })
  .optional();
