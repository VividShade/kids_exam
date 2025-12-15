import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // 커스텀 룰/세팅
  {
    plugins: { tailwindcss },
    rules: {
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/enforces-shorthand': 'off',
      'tailwindcss/no-contradicting-classname': 'error',
      'tailwindcss/no-custom-classname': 'warn',
      'tailwindcss/no-unnecessary-arbitrary-value': 'off', // w-[100px] 허용
      'react-hooks/exhaustive-deps': 'warn',
      // 필요하면 "no-console": "warn" 도 추가
    },
    settings: {
      react: { version: 'detect' },
      tailwindcss: { callees: ['cn', 'clsx'] },
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
