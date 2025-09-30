import 'dotenv/config';
import { get } from 'env-var';

export const environment = {
    PORT: get('PORT').required().asPortNumber(),
    RABBITMQ_URL: get('RABBITMQ_URL').required().asString(),
    TIMEOUT_RABBITMQ: get('TIMEOUT_RABBITMQ').asInt()
}