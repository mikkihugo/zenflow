// Enhanced ESLint 9 config with JSDoc validation for unified architecture
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import jsdocPlugin from 'eslint-plugin-jsdoc';

export default [
  // TypeScript files configuration
  {
    name: 'claude-zen-typescript',
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        // Remove project requirement to avoid path issues
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
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'prefer-const': 'warn',
      'no-var': 'error',
      // JSDoc rules for unified architecture documentation
      'jsdoc/require-description': [
        'error',
        {
          contexts: [
            'ClassDeclaration',
            'FunctionDeclaration',
            'MethodDefinition',
            'TSInterfaceDeclaration',
          ],
        },
      ],
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
      'jsdoc/require-example': [
        'warn',
        {
          contexts: ['ClassDeclaration', 'TSInterfaceDeclaration'],
        },
      ],
      'jsdoc/check-examples': [
        'warn',
        {
          exampleCodeRegex: '```(?:typescript|ts|javascript|js)\\n([\\s\\S]*?)```',
        },
      ],
      'jsdoc/check-syntax': 'error',
      'jsdoc/check-tag-names': [
        'error',
        {
          definedTags: ['fileoverview', 'since', 'version', 'author', 'template', 'emits'],
        },
      ],
      'jsdoc/check-types': 'off', // TypeScript handles this
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
  // Ignore patterns
  {
    name: 'claude-zen-ignores',
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
      'scripts/**/*.py',
      '**/*.backup',
      '*.config.js.backup',
      // Temporarily ignore problematic files
      'bin/claude-zen-pkg.ts',
      'lint-terminator*.js',
      'scripts/tools/babel.config.cjs',
      'scripts/test-monorepo-detection.js',
    ],
  },
];
