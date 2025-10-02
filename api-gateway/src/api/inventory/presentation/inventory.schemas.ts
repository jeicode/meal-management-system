import * as yup from 'yup';


export const getPurchaseHistorySchema = yup.object().shape({
  take: yup.number().integer().min(1).max(50).optional(),
  skip: yup.number().integer().min(0).max(1500).optional(),
})



