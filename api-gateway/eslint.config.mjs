// eslint.config.mjs
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import prettierFlat from "eslint-config-prettier/flat";

export default defineConfig(
  js.configs.recommended,             // reglas base de ESLint
  tseslint.configs.recommended,       // reglas recomendadas de typescript-eslint
  // agrega configs opcionales en medio si quieres (strict, stylistic...)
  prettierFlat                        // debe ir al final para desactivar reglas que choque con prettier
);
