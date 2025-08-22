/**
 * ESLint configuration for AI Linter package
 * Ensures node_modules and other dependencies are never linted
 */

import js from '@eslint/js';

export default [
  // Apply base recommended rules
  js.configs.recommended,

  {
    // Global ignores - these patterns are ignored everywhere
    ignores: [
      'node_modules/**',
      '**/node_modules/**',
      'dist/**',
      'build/**',
      '**/*.d.ts',
      '**/*.tsbuildinfo',
      'coverage/**',
      '**/*.tmp',
      '**/*.temp',
      '.tmp/**',
      '.temp/**',
      '**/*.log',
      'logs/**',
      'pnpm-lock.yaml',
      'package-lock.json',
      'yarn.lock',
      '.env*',
    ],
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      // Allow unused vars that start with underscore
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Formatting rules
      'comma-dangle': ['error', 'always-multiline'],
      'no-trailing-spaces': 'error',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],

      // Code quality rules
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-undef': 'error',
      'no-unused-expressions': 'warn',
    },
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/test-*.js'],
    rules: {
      // Relax rules for test files
      'no-console': 'off',
    },
  },
];