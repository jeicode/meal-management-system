import 'dotenv/config';
import { get } from 'env-var';

export const environment = {
  SUPABASE_URL: get('SUPABASE_URL').required().asString(),
  SUPABASE_ANON_KEY: get('SUPABASE_ANON_KEY').required().asString(),
};
