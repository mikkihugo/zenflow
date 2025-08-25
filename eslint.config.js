import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import sonarjs from 'eslint-plugin-sonarjs';
import unusedImports from 'eslint-plugin-unused-imports';
import unicorn from 'eslint-plugin-unicorn';

export default [
  js.configs.recommended,
  // TypeScript files - AI-optimized rules
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        // Optimized for 4-tier architecture - specific paths for all tiers
        project: [
          './tsconfig.json',
          './apps/*/tsconfig.json',
          // Public API packages
          './packages/public-api/*/tsconfig.json',
          './packages/public-api/*/*/tsconfig.json',
          // Implementation packages
          './packages/implementation/*/tsconfig.json',
          // Enterprise packages
          './packages/enterprise/*/tsconfig.json',
          // Private core packages
          './packages/private-core/*/tsconfig.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        NodeJS: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        require: 'readonly',
        fetch: 'readonly',
        AbortSignal: 'readonly',
        URLSearchParams: 'readonly',
        WebSocket: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'import': importPlugin,
      'sonarjs': sonarjs,
      'unused-imports': unusedImports,
      'unicorn': unicorn,
    },
    rules: {
      // AI-adapted production rules - STRICT
      'no-console': 'error', // No console in production
      '@typescript-eslint/no-explicit-any': 'error', // Force proper types
      '@typescript-eslint/no-unused-vars': 'error', // Expand all variables
      'unused-imports/no-unused-imports': 'error', // Use imports or remove them
      'require-await': 'error', // Expand async or remove async
      
      // AI Security & Quality - Advanced
      'no-eval': 'error',
      'no-implied-eval': 'error', 
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-global-assign': 'error',
      'no-implicit-globals': 'error',
      
      // AI Performance & Modern Patterns - Advanced
      'prefer-template': 'error', // Template literals
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'object-shorthand': 'error',
      'prefer-destructuring': ['error', { object: true, array: false }],
      
      // Google-style Complexity & Cognitive Load
      'complexity': ['error', { max: 20 }], // Google standard - balanced complexity
      'max-depth': ['error', { max: 4 }], // Google standard - avoid deep nesting
      'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }], // Google standard - focused functions
      'max-params': ['error', { max: 4 }], // Google standard - use objects for many params
      'max-nested-callbacks': ['error', { max: 3 }],
      
      // SonarJS - Code Quality Intelligence  
      'sonarjs/cognitive-complexity': ['error', 30], // Google-style - reasonable for complex business logic
      'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/no-same-line-conditional': 'error',
      'sonarjs/no-small-switch': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/no-useless-catch': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',
      
      // Import Organization - AI should organize imports properly  
      'no-duplicate-imports': 'error', // Use native ESLint rule instead
      
      // Unicorn - Modern JavaScript Excellence
      'unicorn/better-regex': 'error',
      'unicorn/catch-error-name': 'error',
      'unicorn/consistent-destructuring': 'error',
      'unicorn/no-array-for-each': 'error', // Prefer for-of
      'unicorn/no-console-spaces': 'error',
      'unicorn/no-for-loop': 'error', // Prefer for-of/map/filter
      'unicorn/no-lonely-if': 'error',
      'unicorn/no-useless-undefined': 'error',
      'unicorn/prefer-array-some': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-string-starts-ends-with': 'error',
      'unicorn/prefer-ternary': 'error',
      
      // TypeScript naming conventions - industry standard
      '@typescript-eslint/naming-convention': [
        'warn',
        // Variables, functions, methods - camelCase
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
        { selector: 'function', format: ['camelCase'] },
        { selector: 'method', format: ['camelCase'] },
        // Classes, interfaces, types - PascalCase
        { selector: 'class', format: ['PascalCase'] },
        { selector: 'interface', format: ['PascalCase'] },
        { selector: 'typeAlias', format: ['PascalCase'] },
        { selector: 'enum', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase'] },
        // Properties - flexible for APIs
        { 
          selector: 'property', 
          format: ['camelCase', 'snake_case'],
          filter: { regex: '^(__.*__|constructor)$', match: false }
        },
        // Parameters - camelCase, NO unused patterns
        { 
          selector: 'parameter', 
          format: ['camelCase'],
          leadingUnderscore: 'forbid' // Force expansion into code
        },
      ],
    },
  },
  
  // JavaScript files - Simplified rules
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
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
        fetch: 'readonly',
        AbortSignal: 'readonly',
        URLSearchParams: 'readonly',
        WebSocket: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    plugins: {
      'import': importPlugin,
      'sonarjs': sonarjs,
      'unused-imports': unusedImports,
      'unicorn': unicorn,
    },
    rules: {
      // Basic quality rules for JS files
      'no-console': 'warn', // Allow console in JS scripts
      'no-unused-vars': 'error',
      'unused-imports/no-unused-imports': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Complexity for JS
      'complexity': ['warn', { max: 15 }], // More relaxed for scripts
      'max-depth': ['warn', { max: 5 }],
      
      // SonarJS basics
      'sonarjs/cognitive-complexity': ['warn', 20],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
    },
  },
  
  // Ignore patterns
  {
    ignores: [
      // Build artifacts and compiled output
      'scripts/**/*',
      'dist/**/*',
      'build/**/*',
      'target/**/*',
      'packages/**/dist/**/*',
      'apps/**/dist/**/*',
      'apps/**/.svelte-kit/**/*',
      
      // Node modules and dependencies
      'coverage/**/*', 
      'node_modules/**/*',
      
      // Configuration and cache files
      '*.config.*',
      'test-results.json',
      '.eslintcache',
      'gts.json',
      'jest.config.js',
      '**/*.tsbuildinfo',
      
      // Generated files
      '**/*.d.ts',
      'packages/**/*.js',
      'packages/**/*.js.map',
      
      // Database and storage
      '*.db',
      '*.sqlite*',
      'storage/**/*',
      'qdrant_storage/**/*',
      '**/*.kuzu/**/*',
      
      // Environment and local files
      '.env*',
      '.mise.toml',
      
      // Development directories
      'ruv-FANN/**/*', // Rust code
      '.claude/**/*', // Claude commands
      '.claude-zen/**/*', // Local data
      '.github/**/*', // GitHub workflows
      'tmp/**/*',
      'logs/**/*',
      
      // Test setup files not in tsconfig
      'tests/setup*.ts',
      'tests/vitest-setup.ts',
      
      // Root-level utility scripts
      'analyze-corruption-patterns.mjs',
      'apply-ast-union-fix.mjs',
      'fix-remaining-corruption.sh',
      'test-*.ts',
      'test-*.mjs',
      '*.test.*',
      '*.spec.*',
      
      // Mock and script files
      '**/mock-*.{js,cjs,mjs}',
      '**/scripts/**/*.{js,mjs,cjs}',
      '**/*-codegen.config.ts',
      'apps/*/scripts/**/*.{js,mjs,cjs}',
      
      // Bazel and analysis artifacts
      'bazel-*/**/*',
      '.bazel-*/**/*',
      'analysis-reports/**/*',
      'graph-db/**/*',
      
      // Playwright artifacts
      '.playwright-mcp/**/*',
    ],
  },
];