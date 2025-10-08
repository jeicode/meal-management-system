import 'dotenv/config';
import { get } from 'env-var';

export const environment = {
  PORT: get('PORT').required().asPortNumber(),
  RABBITMQ_URL: get('RABBITMQ_URL').required().asString(),
  TIMEOUT_RABBITMQ: get('TIMEOUT_RABBITMQ').asInt(),
  GOOGLE_API_KEY: get('GOOGLE_API_KEY').required().asString(),
  MCP_SERVER_URL: get('MCP_SERVER_URL').required().asString(),
};
