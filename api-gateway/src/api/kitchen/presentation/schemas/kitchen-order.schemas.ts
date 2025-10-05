import * as yup from 'yup';

export const orderSchema = yup.object().shape({
  dishes: yup
    .number()
    .integer()
    .required('Param dishes is required')
    .max(15, 'You can send a maximum of 15 dishes')
    .min(1, 'You must send at least one dish'),
  presetRecipesIds: yup
    .string()
    .optional()
    .matches(/^(\d+)(,\d+)*$/, 'Debe ser una lista de números separados por comas (ej: 1,2,3)')
    .test('valid-numbers', 'Los IDs deben ser números válidos', value => {
      if (!value) return true; // Si es opcional y está vacío
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
