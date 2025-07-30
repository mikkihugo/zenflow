// ESLint 9 Flat Config for Claude Zen
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  // Base config for all files
  {
    name: 'claude-zen/base',
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2024,
      },
    },
  },
  // JavaScript files
  {
    name: 'claude-zen/javascript',
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ...js.configs.recommended,
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-var': 'error',
    },
  },
  // TypeScript files
  {
    name: 'claude-zen/typescript',
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
    },
  },
  // Test files with Jest-specific configuration
  {
    name: 'claude-zen/tests',
    files: [
      '**/*.test.js',
      '**/*.test.ts',
      '**/*.spec.js',
      '**/*.spec.ts',
      '**/__tests__/**/*',
      '**/tests/**/*',
      'test/**/*',
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
        // Jest-specific globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      // Disable problematic rules for tests
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'no-console': 'off',

      // Jest-specific best practices
      'prefer-const': 'warn',
      'no-var': 'error',

      // Allow test-specific patterns
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      complexity: 'off',
    },
  },
  // CLI-specific files
  {
    name: 'claude-zen/cli',
    files: ['src/cli/**/*.js', 'src/cli/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-process-exit': 'off',
      'no-console': 'off',
    },
  },
  // Web UI files (browser environment)
  {
    name: 'claude-zen/web-ui',
    files: ['src/ui/**/*.js', 'src/ui/web-ui/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
    },
    rules: {
      'no-console': 'warn',
    },
  },
  // Config files
  {
    name: 'claude-zen/config',
    files: ['*.config.js', '*.config.mjs', '*.config.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  // Script files
  {
    name: 'claude-zen/scripts',
    files: ['scripts/**/*.js', 'scripts/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
      'no-process-exit': 'off',
    },
  },
  // Ignore patterns
  {
    name: 'claude-zen/ignores',
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '.hive-mind/**',
      '.swarm/**',
      'logs/**',
      'target/**',
      'temp-js/**',
      'archive/**',
      'examples/**/node_modules/**',
      '**/*.min.js',
      'ruv-swarm/**',
      'native/**',
      'claude-zen-mcp/**',
      'vision-to-code/**',
      'services/**',
      'benchmark/**/*.py',
      'infrastructure/**',
      'docker/**',
      '*.wgsl',
      '*.rs',
      '*.lock',
      '*.log',
      '*.db',
      '*.tgz',
      '*.dump',
      'scripts/test-monorepo-detection.js',
      '**/*.d.ts',
    ],
  },
];
