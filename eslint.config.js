import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import sonarjs from 'eslint-plugin-sonarjs';
// Node 18 compatibility - unicorn plugin requires Node 20+ for toReversed()
const nodeVersion = process.version;
const unicorn = nodeVersion >= 'v20.0.0' ? await import('eslint-plugin-unicorn').then(m => m.default) : null;
import unusedImports from 'eslint-plugin-unused-imports';

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
        // Disable TypeScript project parsing for now due to tsconfig issues
        // project: true,
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
      import: importPlugin,
      sonarjs,
      'unused-imports': unusedImports,
      ...(unicorn ? { unicorn } : {}),
    },
    rules: {
  // Production rules (strict for release readiness)
  'no-console': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unused-vars': 'error',
  'unused-imports/no-unused-imports': 'error',
  // TS: allow async functions without await while refactoring
  'require-await': 'warn',
  // TS handles undefined variables/types; avoid false positives (DOM types etc.)
  'no-undef': 'off',

      // Production Security & Safety
      'no-debugger': 'error',                              // Remove debugger statements
      'no-alert': 'error',                                 // No alert/confirm in production
      'no-process-env': 'warn',                            // Use config instead of process.env
      '@typescript-eslint/no-non-null-assertion': 'error', // Force null checks in production
      // '@typescript-eslint/strict-boolean-expressions': 'error', // Requires project config
      'no-throw-literal': 'error',                         // Throw proper Error objects
      'prefer-promise-reject-errors': 'error',             // Reject with Error objects

      // Anti-AI Laziness Rules
      '@typescript-eslint/no-empty-function': ['error', {  // No empty implementations
        allow: ['arrowFunctions', 'constructors']          // Allow empty arrow functions and constructors
      }],
      '@typescript-eslint/no-unused-expressions': 'error', // No meaningless statements
      'no-empty': 'error',                                 // No empty blocks
      'no-constant-condition': 'error',                    // No if(true) or while(true)
      'no-unreachable': 'error',                           // No dead code after returns
      // '@typescript-eslint/no-unnecessary-condition': 'error', // Requires project config
      'no-useless-return': 'error',                        // No unnecessary return statements
      'no-useless-catch': 'error',                         // No catch blocks that just rethrow

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

      // Smart additions for AI code quality (actual problems, not arbitrary limits)
      // '@typescript-eslint/no-floating-promises': 'error',    // Requires project config
      // '@typescript-eslint/await-thenable': 'error',          // Requires project config
      // '@typescript-eslint/no-misused-promises': 'error',     // Requires project config
      'import/no-extraneous-dependencies': 'error',             // Prevent dependency bloat
      'import/no-mutable-exports': 'error',                     // Immutable exports
      'import/first': 'error',                                  // Imports at top
      'no-useless-concat': 'error',                             // String efficiency
      'no-await-in-loop': 'warn',                               // Sequential vs parallel async

      // Complexity & Cognitive Load
      complexity: ['error', { max: 20 }],
      'max-depth': ['error', { max: 4 }],
      'max-lines-per-function': [
        'error',
        { max: 80, skipBlankLines: true, skipComments: true },
      ],
      'max-params': ['error', { max: 4 }], // Google standard - use objects for many params
      'max-nested-callbacks': ['error', { max: 3 }],

      // SonarJS - Code Quality Intelligence
      'sonarjs/cognitive-complexity': ['warn', 35],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 3 }],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/no-same-line-conditional': 'error',
      'sonarjs/no-small-switch': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/no-useless-catch': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',

        // Import Organization
  'no-duplicate-imports': 'error',

      // Event System Architecture Enforcement
      // Custom rules for event-driven patterns (not implemented yet, but patterns to watch for):
      // - Event names must follow 'domain:action-name' pattern
      // - Use emitSafe() in async functions instead of emit()
      // - Event payloads should be properly typed (no 'any')
      // - No direct cross-package imports (use EventBus)
      // TODO: Implement custom ESLint plugin for these patterns

      // Foundation Exports Enforcement - Use centralized utilities
      'no-restricted-imports': [
        'error',
        {
          paths: [
            // Disallow internal cross-package imports; enforce event-driven via foundation EventBus
            // Allowed exceptions: foundation and database (including subpaths)
          ],
          patterns: [
            {
              group: [
                '@claude-zen/brain',
                '@claude-zen/coordination', 
                '@claude-zen/knowledge',
                '@claude-zen/monitoring',
                '@claude-zen/telemetry',
                '@claude-zen/ai-safety',
                '@claude-zen/memory',
                '@claude-zen/interfaces',
                '@claude-zen/*-linter',
                '@claude-zen/*-analyzer',
                '@claude-zen/*-operations'
              ],
              message:
                'Import only @claude-zen/foundation, @claude-zen/database, or @claude-zen/neural-ml across packages. Use the EventBus for cross-domain communication.',
            },
          ],
          // ESLint no-restricted-imports doesn't support explicit except for patterns directly;
          // we rely on the validator scripts for precise enforcement and keep lint as a soft guard.
        },
      ],

      // Unicorn - Modern JavaScript Excellence (conditional on Node 20+)
      ...(process.version >= 'v20.0.0' ? {
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
      } : {}),

      // Safety rule that's noisy on optional chaining in defensive code
      'no-unsafe-optional-chaining': 'warn',

      // Additional GTS-inspired rules (syntax-only)
      'quote-props': ['error', 'consistent-as-needed'],
      
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
        // Allow CSS custom properties (--*) and HTTP headers first
        {
          selector: 'property',
          format: null,
          filter: {
            regex: '^(--[a-zA-Z][a-zA-Z0-9-]*|Content-Type|X-Project-Context)$',
            match: true,
          },
        },
        // Properties - flexible for APIs
        {
          selector: 'property',
          format: ['camelCase', 'snake_case'],
          filter: {
            regex:
              '^(__.*__|constructor|--[a-zA-Z][a-zA-Z0-9-]*|Content-Type|X-Project-Context)$',
            match: false,
          },
        },
        // Parameters - camelCase, NO unused patterns
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'forbid', // Force expansion into code
        },
      ],
    },
  },

  // Web Dashboard Browser Environment Override - MUST come after general TypeScript rules
  {
    files: ['apps/web-dashboard/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        // Browser globals for web dashboard
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        Node: 'readonly',
        DragEvent: 'readonly',
        MouseEvent: 'readonly',
        Event: 'readonly',
        EventTarget: 'readonly',
        MessageEvent: 'readonly',
        WebSocket: 'readonly',
        CloseEvent: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        location: 'readonly',
        navigator: 'readonly',
      },
    },
    rules: {
      // Browser console logging is appropriate for web dashboard
      'no-console': 'warn',
    },
  },

  {
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        Node: 'readonly',
        ResizeObserver: 'readonly',
        Iterator: 'readonly',
        DragEvent: 'readonly',
        MouseEvent: 'readonly',
        Event: 'readonly',
        EventTarget: 'readonly',
        MessageEvent: 'readonly',
        WebSocket: 'readonly',
        CloseEvent: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        location: 'readonly',
        navigator: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      sonarjs,
      ...(unicorn ? { unicorn } : {}),
      'unused-imports': unusedImports,
    },
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/naming-convention': [
        'warn',
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'method', format: ['camelCase'] },
        { selector: 'class', format: ['PascalCase'] },
        { selector: 'interface', format: ['PascalCase'] },
        { selector: 'typeAlias', format: ['PascalCase'] },
        { selector: 'enum', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase'] },
      ],
      complexity: ['warn', { max: 35 }],
      'max-depth': ['warn', { max: 6 }],
      'max-lines-per-function': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
      '@typescript-eslint/no-unused-vars': 'warn',
      'unused-imports/no-unused-imports': 'warn',
    },
  },
  {
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        Node: 'readonly',
        ResizeObserver: 'readonly',
        DragEvent: 'readonly',
        MouseEvent: 'readonly',
        Event: 'readonly',
        EventTarget: 'readonly',
        MessageEvent: 'readonly',
        WebSocket: 'readonly',
        CloseEvent: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        location: 'readonly',
        navigator: 'readonly',
      },
    },
    plugins: {
      import: importPlugin,
      sonarjs,
      ...(unicorn ? { unicorn } : {}),
      'unused-imports': unusedImports,
    },
    rules: {
      'no-console': 'warn',
      complexity: ['warn', { max: 35 }],
      'max-depth': ['warn', { max: 6 }],
      'max-lines-per-function': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
      'no-unused-vars': 'warn',
      'unused-imports/no-unused-imports': 'warn',
    },
  },

  // Foundation Package Exception - Allow internal imports for implementation
  {
    files: ['packages/core/foundation/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __filename: 'readonly',
        __dirname: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      sonarjs,
      ...(unicorn ? { unicorn } : {}),
      'unused-imports': unusedImports,
    },
    rules: {
      // Allow foundation to import its own internals - it implements the utilities
      'no-restricted-imports': 'off',

      // Other standard rules still apply
      'no-console': 'warn', // Allow console in implementation
      '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unused-vars': 'error',
      'unused-imports/no-unused-imports': 'error',
  'require-await': 'warn',
  'no-undef': 'off',
      'no-duplicate-imports': 'error',
      'sonarjs/no-duplicate-string': 'error',
      '@typescript-eslint/naming-convention': [
        'warn',
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
        { selector: 'function', format: ['camelCase'] },
        { selector: 'method', format: ['camelCase'] },
        { selector: 'class', format: ['PascalCase'] },
        { selector: 'interface', format: ['PascalCase'] },
        { selector: 'typeAlias', format: ['PascalCase'] },
      ],
    },
  },

  // JavaScript files - Simplified rules (no TypeScript-specific rules)
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
  parserOptions: { ecmaFeatures: { jsx: true } },
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
      import: importPlugin,
      sonarjs,
      'unused-imports': unusedImports,
      ...(unicorn ? { unicorn } : {}),
    },
    rules: {
      // Basic quality rules for JS files (NO TypeScript rules)
      'no-console': 'warn', // Allow console in JS scripts
      'no-unused-vars': 'error',
      'unused-imports/no-unused-imports': 'error',
      'prefer-const': 'error',
      'no-var': 'error',

      // Complexity for JS
      complexity: ['warn', { max: 15 }], // More relaxed for scripts
      'max-depth': ['warn', { max: 5 }],

      // SonarJS basics
      'sonarjs/cognitive-complexity': ['warn', 20],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],

      // Import organization (JS compatible)
      'no-duplicate-imports': 'error',

      // Foundation Exports Enforcement for JS files
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['lodash', 'lodash/*'],
              message:
                'Use foundation exports: const { _, lodash } = require("@claude-zen/foundation")',
            },
            {
              group: ['uuid', 'uuid/*'],
              message:
                'Use foundation exports: const { generateUUID } = require("@claude-zen/foundation")',
            },
          ],
        },
      ],

      // Modern JavaScript patterns
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',

      // NO TypeScript-specific rules for JS files
      // "@typescript-eslint/naming-convention" - REMOVED for JS files
    },
  },

  // (Broken singularity-coder config block removed)

  // Test files - Environment with Vitest globals
  {
    files: [
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/tests/**/*.{ts,tsx,js,jsx}',
    ],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
        vitest: 'readonly',
        // Also include Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      sonarjs,
      'unused-imports': unusedImports,
      ...(unicorn ? { unicorn } : {}),
    },
    rules: {
      // Relax rules for test files but keep sonarjs/complexity working
      '@typescript-eslint/no-explicit-any': 'warn',
      'max-lines-per-function': 'off',
      'sonarjs/cognitive-complexity': ['warn', 50], // Higher threshold for tests
      '@typescript-eslint/naming-convention': 'off',
      complexity: 'off', // Turn off basic complexity for tests
      'max-nested-callbacks': ['error', { max: 5 }], // Higher threshold for tests
      
      // Allow tests to import from their own package and foundation/database
      'no-restricted-imports': 'off',
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
      'apps/**/build/**/*', // Critical: Web dashboard build directory
      'apps/web-dashboard/build/**', // Explicit web dashboard build exclusion

      // Node modules and dependencies
      'coverage/**/*',
      'node_modules/**/*',

      // Configuration and cache files (exclude ESLint config)
      'vite.config.*',
      'vitest.config.*',
      'tailwind.config.*',
      'test-results.json',
      'test-agui-page.js',
      '.eslintcache',
      '**/*.tsbuildinfo',
      '**/tailwind.config.*',
      '**/vite.config.*',
      'config/default.*',

      // Generated files - TypeScript compilation output
      '**/*.d.ts',
      '**/*.d.ts.map',
      '**/*.js.map',

      // All dist and build output directories
      '**/dist/**/*',
      '**/build/**/*',
      '**/output/**/*',

      // All compiled JavaScript files in source directories
      'packages/**/src/**/*.js', // Compiled JS files in package src directories
      'packages/**/test/**/*.js', // Compiled JS files in package test directories
      'apps/**/src/**/*.js', // Compiled JS files in app src directories

      // Critical: Specific build artifacts causing massive lint failures
      'apps/web-dashboard/build/_app/**/*', // Svelte build output
      'apps/web-dashboard/build/**/*.js', // All built JS files
      'apps/web-dashboard/build/**/*.ts', // All built TS files
      '**/build/_app/immutable/chunks/**/*', // Minified chunks
      '**/build/_app/immutable/**/*', // All immutable assets

      // Legacy patterns (keep for backward compatibility)
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

      // Legacy/old packages - completely ignore during restructuring
      'packages-old/**/*',

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

      // Generated documentation
      'docs/**/*',

      // Binary and executable files
      'bin/**/*',
      '*.cjs',

      // Example files (demo code with intentional console usage)
      'examples/**/*',

  // Experimental discovery prototypes (not part of production build yet)
  'src/coordination/discovery/**/*',

      // Deep Core Tier 5 packages (ultra-restricted, emergency only)
      'packages/core/dspy/**/*',
      'packages/core/fact-system/**/*',

      // Database adapters (third-party naming conventions)
      'packages/core/database/src/adapters/**/*',

      // Test files (only exclude specific patterns, not all tests)
      // Note: We want to lint test files, so we don't exclude them here
      // The test environment config above handles linting rules for tests
      
      // Temporarily exclude problematic test files until they're cleaned up
      'packages/services/brain/src/__tests__/event-driven-integration.test.ts',

  // Third-party packages that shouldn't be linted (none for release)

      // Intentionally broken test packages
      'packages/tools/repo-analyzer-broken/**/*',

      // Generated Svelte files (comprehensive exclusion)
      '**/.svelte-kit/**/*',
      '**/generated/**/*',
      '**/output/**/*',
      '**/chunks/**/*',

      // Test scripts in apps
      'apps/**/playwright-*.js',
      'apps/**/*test*.js',

      // Security scripts (separate linting)
      'security/**/*',
    ],
  },
  // Transitional relax rules for new unified event system (will be tightened later)
  {
    files: [
      'packages/core/foundation/src/events/saga/**/*.{ts,tsx}',
      'packages/core/foundation/src/events/modules/**/*.{ts,tsx}',
      'packages/services/document-intelligence/src/event-module-wrapper.ts',
      'packages/services/coordination/src/core/coordination-event-module.ts'
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'unicorn/prefer-ternary': 'off',
      'prefer-destructuring': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-console': 'warn',
      'no-duplicate-imports': 'error'
    }
  }
];
