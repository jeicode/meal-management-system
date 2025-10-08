import 'dotenv/config';
import { get } from 'env-var';

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// si .env está en la raíz del proyecto (database-mcp-ms/.env) y este archivo está en src/
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
// si el archivo está en src/config/ -> usa "../../.env"

export const environment = {
    SUPABASE_URL: get('SUPABASE_URL').required().asString(),
    SUPABASE_ANON_KEY: get('SUPABASE_ANON_KEY').required().asString()
}