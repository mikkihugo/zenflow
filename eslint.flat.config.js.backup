// Enhanced ESLint 9 config with JSDoc validation for unified architecture
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import securityPlugin from 'eslint-plugin-security';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  // TypeScript files configuration (excluding .d.ts files which are handled separately)
  {
    name: 'claude-zen-typescript',
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/*.d.ts'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
          modules: true,
        },
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        Promise: 'readonly',
        Generator: 'readonly',
        GeneratorFunction: 'readonly',
        AsyncGenerator: 'readonly',
        AsyncGeneratorFunction: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        Express: 'readonly',
        NextFunction: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      jsdoc: jsdocPlugin,
      security: securityPlugin,
    },
    rules: {
      // Performance rules
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'prefer-template': 'error',

      // Security rules
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'warn',

      // TypeScript specific
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      // JSDoc rules for unified architecture documentation - STRICT ENFORCEMENT
      'jsdoc/require-description': [
        'error',
        {
          contexts: [
            'ClassDeclaration',
            'FunctionDeclaration',
            'MethodDefinition',
            'TSInterfaceDeclaration',
            'TSMethodSignature',
            'TSPropertySignature',
            'TSTypeAliasDeclaration',
            'ExportNamedDeclaration',
          ],
        },
      ],
      'jsdoc/require-description-complete-sentence': 'error',
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-param-type': 'off', // TypeScript provides types
      'jsdoc/require-returns': [
        'error',
        {
          contexts: ['FunctionDeclaration', 'MethodDefinition'],
          exemptedBy: ['constructor', 'void'],
        },
      ],
      'jsdoc/require-returns-description': 'error',
      'jsdoc/require-returns-type': 'off', // TypeScript provides types
      'jsdoc/require-throws': 'error',
      'jsdoc/require-yields': 'error',
      'jsdoc/require-example': [
        'error',
        {
          contexts: ['ClassDeclaration', 'TSInterfaceDeclaration', 'FunctionDeclaration'],
        },
      ],
      // Disabled: jsdoc/check-examples doesn't work with ESLint 8+
      // 'jsdoc/check-examples': 'off',
      'jsdoc/check-syntax': 'error',
      'jsdoc/check-tag-names': [
        'error',
        {
          definedTags: ['fileoverview', 'since', 'version', 'author', 'template', 'emits'],
        },
      ],
      'jsdoc/check-types': 'off', // TypeScript handles this
      // JSDoc strictness: Keep documentation complete and high quality
      'jsdoc/check-values': 'error',
      'jsdoc/require-file-overview': [
        'error',
        {
          tags: {
            fileoverview: {
              initialCommentsOnly: true,
              mustExist: true,
            },
          },
        },
      ],
      'jsdoc/tag-lines': [
        'error',
        'never',
        {
          startLines: 1,
        },
      ],
      'jsdoc/valid-types': 'off', // TypeScript handles this
    },
  },
  // TypeScript declaration files (.d.ts) - lighter rules without project parsing
  {
    name: 'claude-zen-typescript-declarations',
    files: ['**/*.d.ts'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2024,
      sourceType: 'module',
      // No project parsing for .d.ts files
      parserOptions: {
        ecmaFeatures: {
          modules: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      jsdoc: jsdocPlugin,
    },
    rules: {
      // Basic rules for .d.ts files
      '@typescript-eslint/no-explicit-any': 'warn',
      'jsdoc/require-description': 'warn',
      'jsdoc/require-param': 'warn',
      'jsdoc/require-returns': 'warn',
      'jsdoc/require-example': 'off', // Less strict for declaration files
    },
  },
  // JavaScript files configuration
  {
    name: 'claude-zen-javascript',
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        Promise: 'readonly',
        Generator: 'readonly',
        GeneratorFunction: 'readonly',
        AsyncGenerator: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        Express: 'readonly',
        NextFunction: 'readonly',
        NodeJS: 'readonly',
      },
    },
    rules: {
      // Focus on auto-fixable rules only
      'no-unused-vars': 'off', // Too many false positives with TypeScript
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-undef': 'off', // Turn off to avoid TypeScript conflicts
      'no-unreachable': 'warn',
      'no-redeclare': 'off', // Turn off to avoid TypeScript conflicts
      'no-duplicate-imports': 'warn',
      semi: ['error', 'always'],
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
      indent: ['error', 2, { SwitchCase: 1 }],
      'comma-dangle': ['error', 'always-multiline'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'no-multiple-empty-lines': ['error', { max: 2 }],
    },
  },
  // Test files
  {
    name: 'claude-zen-tests',
    files: [
      '**/*.test.js',
      '**/*.spec.js',
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/__tests__/**/*',
      '**/tests/**/*',
      'test/**/*',
    ],
    languageOptions: {
      globals: {
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
      'no-unused-expressions': 'off',
      'no-console': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
  // Ignore patterns (migrated from .eslintignore)
  {
    name: 'claude-zen-ignores',
    ignores: [
      // From .eslintignore - AI integration files
      'scripts/ai-eslint/github-copilot-integration.js',
      'scripts/ai-eslint/ax-dspy-integration.js',
      'scripts/ai-eslint/simple-dspy-integration.js',

      // Node modules and dist
      'node_modules/**',
      'dist/**',
      'build/**',

      // Cache directories
      '.cache/**',
      '.next/**',
      '.nuxt/**',

      // Log files
      'logs/**',
      '*.log',

      // Test coverage
      'coverage/**',

      // Environment files
      '.env',
      '.env.local',
      '.env.development.local',
      '.env.test.local',
      '.env.production.local',

      // Existing ignores
      '.hive-mind/**',
      '.swarm/**',
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
      '*.db',
      '*.tgz',
      '*.dump',
      'scripts/**/*.py',
      '**/*.backup',
      '*.config.js.backup',

      // Test files that aren't in TypeScript project
      'src/__tests__/**',
      '**/tests/**',

      // Temporarily ignore problematic files
      'bin/claude-zen-pkg.ts',
      'lint-terminator*.js',
      'scripts/tools/babel.config.cjs',
      'scripts/test-monorepo-detection.js',
    ],
  },
];
