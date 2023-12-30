declare module "eslint-plugin-react" {
  interface Config {
    plugins: string[];
    rules: Record<string, number>;
    parserOptions: object;
  }

  interface Configs {
    recommended: Config;
    all: Config;
    "jsx-runtime": Config;
  }

  interface DeprecatedRules {
    "jsx-sort-default-props": object;
    "jsx-space-before-closing": object;
  }

  export interface Default {
    rules: Record<string, object>;
    configs: Configs;
    deprecatedRules: DeprecatedRules;
  }

  export const deprecatedRules: DeprecatedRules;

  const DEFAULT: Default;
  export default DEFAULT;
}

declare module "eslint-plugin-react-hooks" {
  /** An ESLint configuration. */
  interface Config {
    plugins: string[];
    rules: Record<string, string>;
  }

  interface Configs {
    recommended: Config;
  }

  interface ReactHooksRules {
    "rules-of-hooks": object;
    "exhaustive-deps": object;
  }

  export interface Default {
    configs: Configs;
    rules: ReactHooksRules;
  }

  export const configs: Configs;
  export const rules: ReactHooksRules;

  const DEFAULT: Default;
  export default DEFAULT;
}
