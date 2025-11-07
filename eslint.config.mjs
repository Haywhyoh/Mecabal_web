import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Allow 'any' type for flexibility in API responses and dynamic data
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unescaped entities in JSX (apostrophes, etc.)
      "react/no-unescaped-entities": "warn",
      // Allow unused variables (common in development)
      "@typescript-eslint/no-unused-vars": "warn",
      // Allow setState in effects (sometimes necessary for initialization)
      "react-hooks/set-state-in-effect": "warn",
      // Allow missing dependencies in useEffect (can cause infinite loops if added)
      "react-hooks/exhaustive-deps": "warn",
      // Allow ts-ignore comments
      "@typescript-eslint/ban-ts-comment": "warn",
      // Allow img tags (Next.js Image might not always be suitable)
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;
