import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores([
    "**/node_modules",
    "**/dist",
    "**/.github",
    "**/.git",
    "**/.vscode",
    "**/bin",
    "**/coverage",
    "**/testes",
]), {
    extends: compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
    ),

    plugins: {
        "@typescript-eslint": typescriptEslint,
        prettier,
    },

    languageOptions: {
        parser: tsParser,
    },

    rules: {
        "@typescript-eslint/adjacent-overload-signatures": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-require-imports": "warn",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/no-unsafe-function-type": "warn",
        "@typescript-eslint/no-unused-expressions": "warn",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-wrapper-object-types": "warn",
        "eslint-disable-next-line": "off",
        "no-case-declarations": "off",
        "no-constant-condition": "off",
        "no-fallthrough": "off",
        "no-prototype-builtins": "off",
        "no-redeclare": "warn",
        "no-undef": "warn",
        "no-unsafe-finally": "off",
        "no-useless-catch": "off",
        "no-useless-escape": "off",
        "no-var": "off",
        "prefer-const": "off",
        "prefer-spread": "off",
        "prettier/prettier": "off",
    },
}]);