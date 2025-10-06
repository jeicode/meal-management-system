import * as yup from 'yup';

export const generateOrdersWithAiSchema = yup.object().shape({
  text: yup.string().required('text is required in body'),
});
