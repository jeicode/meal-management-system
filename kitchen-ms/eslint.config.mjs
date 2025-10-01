// eslint.config.mjs
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import prettierFlat from "eslint-config-prettier/flat";

export default defineConfig(
  js.configs.recommended,
  tseslint.configs.recommended,
  prettierFlat,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // 🚀 permitir any sin error
    },
  }
);
