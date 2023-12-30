import * as path from "node:path";
import * as url from "node:url";

import eslintJs from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tsEslint from "@typescript-eslint/eslint-plugin";
import tsEslintParser from "@typescript-eslint/parser";

const DIR_NAME = path.dirname(url.fileURLToPath(import.meta.url));

export default [
  eslintJs.configs.recommended,
  {
    files: ["**/*.js", "**/*.jsx", "**/*.cjs", "**/*.mjs", "**/*.tsx"],
    settings: {
      react: {
        version: "18.2",
      },
    },
    plugins: {
      "@typescript-eslint": tsEslint,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      react: react,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parser: tsEslintParser,
      parserOptions: { tsconfigRootDir: DIR_NAME, project: true },
      globals: {
        document: null,
        console: null,
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    rules: {
      ...tsEslint.configs["eslint-recommended"]?.rules,
      ...tsEslint.configs.recommended?.rules,
      ...tsEslint.configs["recommended-requiring-type-checking"]?.rules,
      ...tsEslint.configs.strict?.rules,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...react.configs.recommended.rules,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...reactHooks.configs.recommended.rules,
    },
  },
];
