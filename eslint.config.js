import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  
  // PROTOTYPE-FOCUSED CONFIG - Only lint important source files
  {
    files: [
      'apps/*/src/**/*.{ts,tsx}',
      'packages/*/src/**/*.{ts,tsx}',
      'apps/web-dashboard/src/**/*.{js,jsx,svelte}'
    ],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        NodeJS: 'readonly',
        fetch: 'readonly',
        window: 'readonly',
        document: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // CRITICAL ONLY - things that break functionality
      'no-undef': 'error',
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-unreachable': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-imports': 'error',
      
      // PROTOTYPE-FRIENDLY - allow rapid development
      'no-console': 'off',                    // Allow debugging
      '@typescript-eslint/no-explicit-any': 'off', // Allow quick typing
      'require-await': 'off',                 // Allow async placeholders
      'no-empty': 'warn',                     // Allow empty blocks
      'no-constant-condition': 'warn',        // Allow if(true) for prototyping
      'complexity': 'off',                    // No complexity limits
      'max-lines-per-function': 'off',       // No length limits
    },
  },

  // Add Node.js globals for JS files
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'warn',
    },
  },

  // MINIMAL IGNORES - Only tests and build output
  {
    ignores: [
      // Tests only - we want to fix problematic files
      'tests/**/*',
      '**/*.test.*',
      '**/*.spec.*',
      '**/tests/**/*',
      
      // Build outputs only
      'dist/**/*',
      'build/**/*',
      '**/dist/**/*',
      '**/build/**/*',
      '**/.svelte-kit/**/*',
      '**/*.d.ts',
      '**/*.js.map',
      
      // Node modules only
      'node_modules/**/*',
      'coverage/**/*',
    ],
  },
];