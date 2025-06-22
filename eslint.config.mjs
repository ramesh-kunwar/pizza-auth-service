import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: { js },
        extends: ["js/recommended"],
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        languageOptions: { globals: globals.browser },
    },
    tseslint.configs.recommended,
    {
        rules: {
            "no-console": "off",
            "no-unused-vars": "warn",
            "dot-notation": "off",
        },
    },
    {
        ignores: [
            "dist",
            "node_modules",
            "eslint.config.mjs",
            "jest.config.js",
        ],
    },
]);
