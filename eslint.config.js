import path from "node:path";
import { fileURLToPath } from "node:url";

import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

const toolingFiles = [
  "*.config.{js,mjs,ts}",
  "eslint.config.js",
  "prettier.config.js",
  "drizzle.config.ts",
  "vite.config.ts",
  "vitest.config.ts",
  "playwright.config.ts",
];

const sideEffectEntryFiles = [
  "src/main.ts",
  "src/main.tsx",
  "src/app/bootstrap.ts",
  "src/app/server.ts",
  "src/**/*.setup.ts",
  "src/**/*.setup.tsx",
  "src/**/*.instrumentation.ts",
  "src/**/*.instrumentation.tsx",
  "test/**/*.setup.ts",
  "tests/**/*.setup.ts",
];

const boundaryRestrictedImports = [
  {
    regex: "^@/(modules|features)/[^/]+/(?!index\\.(js|ts|tsx)$).+",
    message: "Import another component through its public index.ts API.",
  },
];

const implementationDetailImports = [
  {
    group: [
      "@prisma/client",
      "@supabase/supabase-js",
      "drizzle-orm",
      "drizzle-orm/*",
      "firebase",
      "firebase/*",
      "mongodb",
      "mongodb/*",
      "openai",
      "openai/*",
      "stripe",
      "stripe/*",
    ],
    message:
      "Keep provider, database, and SDK details out of domain/application code. Use adapters or repositories.",
  },
];

export default tseslint.config(
  {
    ignores: [
      "coverage/**",
      "dist/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
      sourceType: "module",
    },
    plugins: {
      unicorn,
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
        node: true,
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          disallowTypeAnnotations: false,
          fixStyle: "separate-type-imports",
          prefer: "type-imports",
        },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "function",
          format: ["camelCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "interface",
          format: ["PascalCase"],
          custom: {
            match: false,
            regex: "^I[A-Z]",
          },
        },
        {
          selector: "enumMember",
          format: ["UPPER_CASE"],
        },
        {
          selector: "objectLiteralProperty",
          format: null,
        },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: boundaryRestrictedImports,
        },
      ],
      "import/enforce-node-protocol-usage": ["error", "always"],
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          js: "always",
          jsx: "always",
          mjs: "always",
          ts: "never",
          tsx: "never",
        },
      ],
      "import/no-default-export": "error",
      "import/no-unassigned-import": "error",
      "import/order": [
        "error",
        {
          alphabetize: {
            caseInsensitive: true,
            order: "asc",
          },
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
          "newlines-between": "always",
          pathGroups: [
            {
              group: "internal",
              pattern: "@/**",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin", "type"],
          warnOnUnassignedImports: true,
        },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message: "Read environment variables only inside config modules.",
        },
      ],
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            kebabCase: true,
          },
          ignore: [
            /^README\.md$/u,
            /^CODEOWNERS$/u,
            /^[a-z]+\.config\.[cm]?[jt]s$/u,
            /^eslint\.config\.js$/u,
            /^prettier\.config\.js$/u,
          ],
        },
      ],
      "unicorn/prefer-node-protocol": "error",
    },
  },
  {
    files: toolingFiles,
    rules: {
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-deprecated": "off",
      "import/no-named-as-default-member": "off",
      "import/no-default-export": "off",
      "no-restricted-properties": "off",
      "unicorn/filename-case": "off",
    },
  },
  {
    files: sideEffectEntryFiles,
    rules: {
      "import/no-unassigned-import": "off",
    },
  },
  {
    files: [
      "src/modules/**/application/**/*.{ts,tsx}",
      "src/modules/**/domain/**/*.{ts,tsx}",
      "src/modules/**/*.use-case.{ts,tsx}",
      "src/features/**/application/**/*.{ts,tsx}",
      "src/features/**/domain/**/*.{ts,tsx}",
      "src/features/**/*.use-case.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [...boundaryRestrictedImports, ...implementationDetailImports],
        },
      ],
    },
  },
  {
    files: [
      "src/**/config/**/*.{ts,tsx}",
      "src/**/config.{ts,tsx}",
      "src/shared/config/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-properties": "off",
    },
  },
  eslintConfigPrettier,
);
