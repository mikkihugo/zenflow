/**
 * ESLint Configuration
 * 
 * Modern ESLint 9+ configuration replacing broken Biome system
 * Provides TypeScript linting with sensible rules for monorepo structure
 */
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import promisePlugin from 'eslint-plugin-promise';
import jestPlugin from 'eslint-plugin-jest';
import nodePlugin from 'eslint-plugin-n';
import sonarPlugin from 'eslint-plugin-sonarjs';
import unicornPlugin from 'eslint-plugin-unicorn';
import importPlugin from 'eslint-plugin-import';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

export default [
  // Base JavaScript rules
  js.configs.recommended,
  
  // TypeScript configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        projectService: true
        // Remove project: './tsconfig.json' - let projectService auto-discover
      },
      globals: {
        // Node.js globals
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        // Browser/Web globals
        WebAssembly: 'readonly',
        WebSocket: 'readonly',
        NodeJS: 'readonly',
        React: 'readonly',
        // Timer functions
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      promise: promisePlugin,
      jest: jestPlugin,
      n: nodePlugin,
      sonarjs: sonarPlugin,
      unicorn: unicornPlugin,
      import: importPlugin,
      'unused-imports': unusedImportsPlugin
    },
    rules: {
      // Basic ESLint rules for AI development systems
      'no-console': 'warn', // Allow console for AI debug output but warn
      'no-debugger': 'error',
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-duplicate-imports': 'off', // Disabled due to many false positives
      'no-unused-vars': 'off', // Will be handled by TypeScript
      'no-undef': 'off', // TypeScript handles this better
      'no-redeclare': 'off', // TypeScript handles this better
      'no-empty': 'warn', // Allow empty blocks (common in catch blocks)
      'no-unsafe-optional-chaining': 'off', // TypeScript handles this
      
      // Promise handling for AI async operations (claude-code-cli, gemini-cli, etc.)
      'promise/always-return': 'error', // AI tools need return values
      'promise/no-return-wrap': 'error', // Avoid unnecessary Promise wrapping
      'promise/param-names': 'error', // Consistent parameter naming
      'promise/catch-or-return': 'error', // Handle AI tool errors properly
      'promise/no-nesting': 'warn', // Prefer promise chains for AI workflows
      'promise/no-promise-in-callback': 'warn', // Avoid callback/promise mixing
      'promise/no-callback-in-promise': 'warn', // Keep AI async patterns clean
      'promise/avoid-new': 'off', // Allow new Promise for AI tool wrappers
      'promise/no-return-in-finally': 'warn', // Prevent AI cleanup issues
      
      // Custom AI development patterns
      'no-floating-promises': 'off', // Let TypeScript handle this
      'require-await': 'warn', // Ensure async functions actually await
      'no-async-promise-executor': 'error', // Prevent common AI async bugs
      'prefer-promise-reject-errors': 'error', // Consistent error handling
      
      // AI testing patterns with Jest
      'jest/no-disabled-tests': 'warn', // Don't leave disabled tests
      'jest/no-focused-tests': 'error', // Don't commit focused tests
      'jest/no-identical-title': 'error', // Unique test names
      'jest/prefer-to-have-length': 'warn', // Better array assertions
      'jest/valid-expect': 'error', // Valid expect usage
      'jest/no-conditional-expect': 'error', // Avoid conditional expects
      'jest/consistent-test-it': 'warn', // Consistent test/it usage
      
      // Node.js patterns for AI CLI tools (simplified - no type-aware rules)
      'n/no-unsupported-features/es-syntax': 'off', // We use modern ES features
      'n/no-missing-import': 'off', // TypeScript handles imports
      'n/no-unpublished-import': 'off', // Allow dev dependencies
      'n/prefer-global/process': 'off', // Turned off for simplicity
      'n/prefer-promises/fs': 'off', // Turned off for simplicity  
      'n/no-sync': 'off', // Turned off for simplicity
      
      // SonarJS code quality rules for AI development
      'sonarjs/cognitive-complexity': ['warn', 20], // Keep functions understandable
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }], // Avoid hardcoded duplicates
      'sonarjs/no-identical-functions': 'error', // Prevent code duplication
      'sonarjs/no-collapsible-if': 'warn', // Simplify nested conditions
      'sonarjs/prefer-immediate-return': 'warn', // Clean return patterns
      'sonarjs/prefer-while': 'warn', // Use appropriate loops
      'sonarjs/no-small-switch': 'warn', // Use if/else for small switches
      'sonarjs/no-redundant-boolean': 'error', // Remove unnecessary boolean casting
      'sonarjs/no-unused-collection': 'error', // Remove unused collections
      'sonarjs/no-gratuitous-expressions': 'error', // Remove pointless expressions
      
      // Unicorn modern JavaScript patterns for AI tools
      'unicorn/better-regex': 'warn', // Improve regex patterns
      'unicorn/catch-error-name': 'warn', // Consistent error naming
      'unicorn/consistent-destructuring': 'warn', // Use destructuring consistently
      'unicorn/explicit-length-check': 'warn', // Explicit array/string length checks
      'unicorn/filename-case': 'off', // Allow current file naming
      'unicorn/new-for-builtins': 'error', // Use new for built-in constructors
      'unicorn/no-array-for-each': 'off', // Allow forEach (common in AI tools)
      'unicorn/no-console-spaces': 'warn', // Clean console output
      'unicorn/no-empty-file': 'error', // Remove empty files
      'unicorn/no-instanceof-array': 'error', // Use Array.isArray()
      'unicorn/no-lonely-if': 'warn', // Simplify lonely if statements
      'unicorn/no-useless-undefined': 'warn', // Remove unnecessary undefined
      'unicorn/prefer-array-some': 'warn', // Use array.some() appropriately
      'unicorn/prefer-includes': 'warn', // Use includes() over indexOf
      'unicorn/prefer-string-starts-ends-with': 'warn', // Modern string methods
      'unicorn/prefer-ternary': 'warn', // Use ternary for simple conditions
      'unicorn/throw-new-error': 'error', // Always use new Error()
      
      // Import/Export organization for AI tool modules
      'import/order': ['warn', {
        'groups': [
          'builtin',
          'external', 
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always',
        'alphabetize': { order: 'asc', caseInsensitive: true }
      }],
      'import/first': 'error', // All imports at top
      'import/no-duplicates': 'error', // No duplicate imports
      'import/newline-after-import': 'warn', // Newline after imports
      'import/no-unresolved': 'off', // TypeScript handles this
      'import/no-extraneous-dependencies': 'off', // Allow dev dependencies
      
      // Unused imports cleanup for AI development
      'unused-imports/no-unused-imports': 'error', // Remove unused imports
      'unused-imports/no-unused-vars': [
        'warn',
        { 
          'vars': 'all', 
          'varsIgnorePattern': '^_', 
          'args': 'after-used', 
          'argsIgnorePattern': '^_' 
        }
      ]
    }
  },
  
  // Test files - AI-specific Jest configuration
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      globals: {
        // Jest globals
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        // Node.js globals
        process: 'readonly',
        Buffer: 'readonly',
        console: 'readonly'
      }
    },
    plugins: {
      jest: jestPlugin,
      promise: promisePlugin
    },
    rules: {
      // Jest-specific rules for AI testing
      'jest/expect-expect': 'warn',
      'jest/no-alias-methods': 'error',
      'jest/no-commented-out-tests': 'warn',
      'jest/no-done-callback': 'error', // Prefer async/await
      'jest/prefer-todo': 'warn',
      'jest/require-top-level-describe': 'warn',
      'jest/valid-describe-callback': 'error',
      'jest/valid-title': 'error',
      
      // Promise handling in tests
      'promise/catch-or-return': 'error',
      'promise/always-return': 'off', // Tests don't always need return
      
      // Allow console in tests for debugging AI behavior
      'no-console': 'off'
    }
  },
  
  // Node.js script files (.mjs files and .js files)
  {
    files: ['**/scripts/*.mjs', '**/*.mjs', '**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Node.js globals
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly'
      }
    },
    rules: {
      'no-console': 'off', // Scripts and JS files need console output
      'no-undef': 'off', // Node.js environment
      // 'unused-imports/no-unused-vars': [
      //   'warn',
      //   { 
      //     'vars': 'all', 
      //     'varsIgnorePattern': '^_|^__dirname|^stderr', 
      //     'args': 'after-used', 
      //     'argsIgnorePattern': '^_' 
      //   }
      // ]
    }
  },
  
  // Global ignores - infrastructure and build artifacts only
  {
    ignores: [
      // Build artifacts and dependencies - use proper glob patterns
      '**/node_modules/**',
      '**/dist/**', 
      '**/build/**',
      '**/target/**',
      '**/pkg/**',
      '**/.svelte-kit/**',
      
      // Generated files only
      '**/*.d.ts',
      
      // Test files with parsing issues - ignore problematic test files
      '**/src/__tests__/**',
      '**/tests/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      
      // Config files that are JavaScript (but not TypeScript config files)
      '**/*.config.js',
      '**/*.cjs',
      'eslint.config.mjs',
      
      // Version control and CI directories
      '**/.github/**',
      '**/.claude/**'
    ]
  }
];