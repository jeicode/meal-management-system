import * as yup from 'yup';


export const orderSchema = yup.object().shape({
  dishes: yup.number().integer().required('Param dishes is required').max(15, 'You can send a maximum of 15 dishes').min(1, 'You must send at least one dish')
});


export const getOrdersSchema = yup.object({
  where: yup.object({
    status: yup.mixed().notRequired().test('is-valid-status', 'Invalid status', (value) => {
      if (value === undefined || value === null) return true; // <<< permite vacío
      if (typeof value === 'string') {
        return true;
      }
      if (
        typeof value === 'object' &&
        value !== null
      ) {
        const { in: inArray } = value as { in: string[] };
        return (
          Array.isArray(inArray) &&
          inArray.every((item) => typeof item === 'string')
        );
      }
      return false;
    }),
  }).optional(),
  orderBy: yup.object({
    createdAt: yup.mixed().oneOf(['asc', 'desc']),
  }).optional(), 
}).optional();


