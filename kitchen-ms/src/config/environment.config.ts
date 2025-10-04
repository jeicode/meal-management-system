import 'dotenv/config';
import { get } from 'env-var';

export const environment = {
    TIMEOUT_RABBITMQ: get('TIMEOUT_RABBITMQ').asInt(),
    RABBITMQ_URL: get('RABBITMQ_URL').required().asString(),
    SUPABASE_URL: get('SUPABASE_URL').required().asString(),
    SUPABASE_ANON_KEY: get('SUPABASE_ANON_KEY').required().asString()
}