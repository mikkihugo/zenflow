import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";

export default [
	js.configs.recommended,
	// Web Dashboard - Browser Environment (MUST come before general TypeScript rules)
	{
		files: ["apps/web-dashboard/**/*.{ts,tsx,js,jsx}"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 2024,
				sourceType: "module",
				// project: ["./apps/web-dashboard/tsconfig.json"],
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				// Browser globals
				window: "readonly",
				document: "readonly",
				localStorage: "readonly",
				sessionStorage: "readonly",
				navigator: "readonly",
				location: "readonly",
				history: "readonly",
				HTMLElement: "readonly",
				Element: "readonly",
				Node: "readonly",
				Event: "readonly",
				EventTarget: "readonly",
				fetch: "readonly",
				Request: "readonly",
				Response: "readonly",
				Headers: "readonly",
				URL: "readonly",
				URLSearchParams: "readonly",
				WebSocket: "readonly",
				console: "readonly",
				setTimeout: "readonly",
				clearTimeout: "readonly",
				setInterval: "readonly",
				clearInterval: "readonly",
				requestAnimationFrame: "readonly",
				cancelAnimationFrame: "readonly",
				performance: "readonly",
				Blob: "readonly",
				File: "readonly",
				FileReader: "readonly",
				FormData: "readonly",
				DragEvent: "readonly",
				MouseEvent: "readonly",
				KeyboardEvent: "readonly",
				CustomEvent: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
			import: importPlugin,
			sonarjs: sonarjs,
			"unused-imports": unusedImports,
			unicorn: unicorn,
		},
		rules: {
			// Same rules as TypeScript files
			"no-console": "error",
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-unused-vars": "error",
			"unused-imports/no-unused-imports": "error",
			"require-await": "error",

			// AI Security & Quality
			"no-eval": "error",
			"no-implied-eval": "error",
			"no-new-func": "error",
			"no-script-url": "error",
			"no-global-assign": "error",
			"no-implicit-globals": "error",

			// AI Performance & Modern Patterns
			"prefer-template": "error",
			"no-var": "error",
			"prefer-const": "error",
			"prefer-arrow-callback": "error",
			"arrow-body-style": ["error", "as-needed"],
			"object-shorthand": "error",
			"prefer-destructuring": ["error", { object: true, array: false }],

			// Complexity
			complexity: ["error", { max: 20 }],
			"max-depth": ["error", { max: 4 }],
			"max-lines-per-function": [
				"error",
				{ max: 80, skipBlankLines: true, skipComments: true },
			],
			"max-params": ["error", { max: 4 }],
			"max-nested-callbacks": ["error", { max: 3 }],

			// SonarJS
			"sonarjs/cognitive-complexity": ["error", 30],
			"sonarjs/no-duplicate-string": ["error", { threshold: 3 }],
			"sonarjs/no-identical-functions": "error",
			"sonarjs/no-redundant-jump": "error",
			"sonarjs/no-same-line-conditional": "error",
			"sonarjs/no-small-switch": "error",
			"sonarjs/no-unused-collection": "error",
			"sonarjs/no-useless-catch": "error",
			"sonarjs/prefer-immediate-return": "error",
			"sonarjs/prefer-single-boolean-return": "error",

			// Import Organization
			"no-duplicate-imports": "error",
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: ["lodash", "lodash/*"],
							message:
								'Use foundation exports: import { _, lodash } from "@claude-zen/foundation"',
						},
						{
							group: ["nanoid", "nanoid/*"],
							message:
								'Use foundation exports: import { generateNanoId, customAlphabet } from "@claude-zen/foundation"',
						},
						{
							group: ["uuid", "uuid/*"],
							message:
								'Use foundation exports: import { generateUUID } from "@claude-zen/foundation"',
						},
						{
							group: ["winston", "winston/*"],
							message:
								'Use foundation logging: import { getLogger } from "@claude-zen/foundation"',
						},
						{
							group: ["pino", "pino/*"],
							message:
								'Use foundation logging: import { getLogger } from "@claude-zen/foundation"',
						},
					],
				},
			],

			// Unicorn
			"unicorn/better-regex": "error",
			"unicorn/catch-error-name": "error",
			"unicorn/consistent-destructuring": "error",
			"unicorn/no-array-for-each": "error",
			"unicorn/no-console-spaces": "error",
			"unicorn/no-for-loop": "error",
			"unicorn/no-lonely-if": "error",
			"unicorn/no-useless-undefined": "error",
			"unicorn/prefer-array-some": "error",
			"unicorn/prefer-includes": "error",
			"unicorn/prefer-string-starts-ends-with": "error",
			"unicorn/prefer-ternary": "error",

			// TypeScript naming conventions - allow CSS properties
			"@typescript-eslint/naming-convention": [
				"warn",
				{ selector: "variable", format: ["camelCase", "UPPER_CASE"] },
				{ selector: "function", format: ["camelCase"] },
				{ selector: "method", format: ["camelCase"] },
				{ selector: "class", format: ["PascalCase"] },
				{ selector: "interface", format: ["PascalCase"] },
				{ selector: "typeAlias", format: ["PascalCase"] },
				{ selector: "enum", format: ["PascalCase"] },
				{ selector: "enumMember", format: ["PascalCase"] },
				// Allow CSS custom properties (--*) and HTTP headers first
				{
					selector: "property",
					format: null,
					filter: {
						regex: "^(--[a-zA-Z][a-zA-Z0-9-]*|Content-Type|X-Project-Context)$",
						match: true,
					},
				},
				{
					selector: "property",
					format: ["camelCase", "snake_case"],
					filter: {
						regex:
							"^(__.*__|constructor|--[a-zA-Z][a-zA-Z0-9-]*|Content-Type|X-Project-Context)$",
						match: false,
					},
				},
				{
					selector: "parameter",
					format: ["camelCase"],
					leadingUnderscore: "forbid",
				},
			],
		},
	},
	// TypeScript files - AI-optimized rules
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 2024,
				sourceType: "module",
				// Disable TypeScript project parsing for now to avoid config issues
				// project: [],
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				console: "readonly",
				process: "readonly",
				Buffer: "readonly",
				__dirname: "readonly",
				__filename: "readonly",
				global: "readonly",
				NodeJS: "readonly",
				setTimeout: "readonly",
				clearTimeout: "readonly",
				setInterval: "readonly",
				clearInterval: "readonly",
				setImmediate: "readonly",
				clearImmediate: "readonly",
				require: "readonly",
				fetch: "readonly",
				AbortSignal: "readonly",
				URLSearchParams: "readonly",
				WebSocket: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
			import: importPlugin,
			sonarjs: sonarjs,
			"unused-imports": unusedImports,
			unicorn: unicorn,
		},
		rules: {
			// AI-adapted production rules - STRICT
			"no-console": "error", // No console in production
			"@typescript-eslint/no-explicit-any": "error", // Force proper types
			"@typescript-eslint/no-unused-vars": "error", // Expand all variables
			"unused-imports/no-unused-imports": "error", // Use imports or remove them
			"require-await": "error", // Expand async or remove async

			// AI Security & Quality - Advanced
			"no-eval": "error",
			"no-implied-eval": "error",
			"no-new-func": "error",
			"no-script-url": "error",
			"no-global-assign": "error",
			"no-implicit-globals": "error",

			// AI Performance & Modern Patterns - Advanced
			"prefer-template": "error", // Template literals
			"no-var": "error",
			"prefer-const": "error",
			"prefer-arrow-callback": "error",
			"arrow-body-style": ["error", "as-needed"],
			"object-shorthand": "error",
			"prefer-destructuring": ["error", { object: true, array: false }],

			// Google-style Complexity & Cognitive Load
			complexity: ["error", { max: 20 }], // Google standard - balanced complexity
			"max-depth": ["error", { max: 4 }], // Google standard - avoid deep nesting
			"max-lines-per-function": [
				"error",
				{ max: 80, skipBlankLines: true, skipComments: true },
			], // Google standard - focused functions
			"max-params": ["error", { max: 4 }], // Google standard - use objects for many params
			"max-nested-callbacks": ["error", { max: 3 }],

			// SonarJS - Code Quality Intelligence
			"sonarjs/cognitive-complexity": ["error", 30], // Google-style - reasonable for complex business logic
			"sonarjs/no-duplicate-string": ["error", { threshold: 3 }],
			"sonarjs/no-identical-functions": "error",
			"sonarjs/no-redundant-jump": "error",
			"sonarjs/no-same-line-conditional": "error",
			"sonarjs/no-small-switch": "error",
			"sonarjs/no-unused-collection": "error",
			"sonarjs/no-useless-catch": "error",
			"sonarjs/prefer-immediate-return": "error",
			"sonarjs/prefer-single-boolean-return": "error",

			// Import Organization - AI should organize imports properly
			"no-duplicate-imports": "error", // Use native ESLint rule instead

			// Foundation Exports Enforcement - Use centralized utilities
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: ["lodash", "lodash/*"],
							message:
								'Use foundation exports: import { _, lodash } from "@claude-zen/foundation"',
						},
						{
							group: ["nanoid", "nanoid/*"],
							message:
								'Use foundation exports: import { generateNanoId, customAlphabet } from "@claude-zen/foundation"',
						},
						{
							group: ["uuid", "uuid/*"],
							message:
								'Use foundation exports: import { generateUUID } from "@claude-zen/foundation"',
						},
						{
							group: ["date-fns", "date-fns/*"],
							message:
								'Use foundation exports: import { dateFns, format, addDays } from "@claude-zen/foundation"',
						},
						{
							group: ["commander", "commander/*"],
							message:
								'Use foundation exports: import { Command, program } from "@claude-zen/foundation"',
						},
						{
							group: ["zod", "zod/*"],
							message:
								'Use foundation exports: import { z, validateInput } from "@claude-zen/foundation"',
						},
						{
							group: ["winston", "winston/*"],
							message:
								'Use foundation logging: import { getLogger } from "@claude-zen/foundation"',
						},
						{
							group: ["pino", "pino/*"],
							message:
								'Use foundation logging: import { getLogger } from "@claude-zen/foundation"',
						},
						{
							group: ["ajv", "ajv/*"],
							message:
								'Use foundation validation: import { z, validateInput } from "@claude-zen/foundation"',
						},
						{
							group: ["type-fest", "type-fest/*"],
							message:
								'Use foundation types: import { /* type utilities */ } from "@claude-zen/foundation"',
						},
						{
							group: [
								"inversify",
								"inversify/*",
								"tsyringe",
								"tsyringe/*",
								"awilix",
								"awilix/*",
							],
							message:
								'Use foundation DI: import { createServiceContainer, inject, TOKENS } from "@claude-zen/foundation"',
						},
						{
							group: [
								"eventemitter3",
								"eventemitter3/*",
								"events",
								"mitt",
								"mitt/*",
							],
							message:
								'Use foundation events: import { EventEmitter } from "@claude-zen/foundation"',
						},
						{
							group: [
								"axios",
								"axios/*",
								"node-fetch",
								"cross-fetch",
								"isomorphic-fetch",
							],
							message: "Use native fetch or foundation HTTP utilities",
						},
						{
							group: [
								"chalk",
								"chalk/*",
								"kleur",
								"kleur/*",
								"colors",
								"colors/*",
							],
							message:
								"Use foundation logging with structured output instead of console colors",
						},
						{
							group: ["p-timeout", "p-retry", "p-queue", "p-limit"],
							message:
								'Use foundation async utilities: import { withTimeout, withRetry, safeAsync } from "@claude-zen/foundation"',
						},
						// Error Handling - ALL error utilities through foundation
						{
							group: ["neverthrow", "neverthrow/*"],
							message:
								'Use foundation error handling: import { Result, ok, err } from "@claude-zen/foundation"',
						},
						{
							group: ["fp-ts/Either", "fp-ts/TaskEither", "fp-ts/*"],
							message:
								'Use foundation error handling: import { Result, ok, err, safeAsync } from "@claude-zen/foundation"',
						},
						{
							group: ["rxjs", "rxjs/*"],
							message:
								'Use foundation events: import { TypedEventBase } from "@claude-zen/foundation" or native Promise patterns',
						},
						// Config utilities - foundation provides better environment handling
						{
							group: [
								"dotenv",
								"dotenv/*",
								"cross-env",
								"cross-env/*",
								"env-var",
								"env-var/*",
							],
							message:
								'Use foundation config: import { getConfig, str, num, bool, port } from "@claude-zen/foundation"',
						},
						// Allow native Node.js APIs - only restrict problematic duplicates
						// NOTE: We intentionally DON'T restrict native Node.js modules:
						// - fs, fs/promises (keep native file system access)
						// - crypto (keep native crypto)
						// - child_process (keep native process spawning)
						// - path (keep native path utilities)
						// - http, https (keep native HTTP servers)

						// Only restrict when foundation provides CLEAR benefits:
						{
							group: ["axios", "axios/*"],
							message: "Consider native fetch API (Node 18+) for HTTP requests",
						},
					],
				},
			],

			// Unicorn - Modern JavaScript Excellence
			"unicorn/better-regex": "error",
			"unicorn/catch-error-name": "error",
			"unicorn/consistent-destructuring": "error",
			"unicorn/no-array-for-each": "error", // Prefer for-of
			"unicorn/no-console-spaces": "error",
			"unicorn/no-for-loop": "error", // Prefer for-of/map/filter
			"unicorn/no-lonely-if": "error",
			"unicorn/no-useless-undefined": "error",
			"unicorn/prefer-array-some": "error",
			"unicorn/prefer-includes": "error",
			"unicorn/prefer-string-starts-ends-with": "error",
			"unicorn/prefer-ternary": "error",

			// TypeScript naming conventions - industry standard
			"@typescript-eslint/naming-convention": [
				"warn",
				// Variables, functions, methods - camelCase
				{ selector: "variable", format: ["camelCase", "UPPER_CASE"] },
				{ selector: "function", format: ["camelCase"] },
				{ selector: "method", format: ["camelCase"] },
				// Classes, interfaces, types - PascalCase
				{ selector: "class", format: ["PascalCase"] },
				{ selector: "interface", format: ["PascalCase"] },
				{ selector: "typeAlias", format: ["PascalCase"] },
				{ selector: "enum", format: ["PascalCase"] },
				{ selector: "enumMember", format: ["PascalCase"] },
				// Allow CSS custom properties (--*) and HTTP headers first
				{
					selector: "property",
					format: null,
					filter: {
						regex: "^(--[a-zA-Z][a-zA-Z0-9-]*|Content-Type|X-Project-Context)$",
						match: true,
					},
				},
				// Properties - flexible for APIs
				{
					selector: "property",
					format: ["camelCase", "snake_case"],
					filter: {
						regex:
							"^(__.*__|constructor|--[a-zA-Z][a-zA-Z0-9-]*|Content-Type|X-Project-Context)$",
						match: false,
					},
				},
				// Parameters - camelCase, NO unused patterns
				{
					selector: "parameter",
					format: ["camelCase"],
					leadingUnderscore: "forbid", // Force expansion into code
				},
			],
		},
	},

	// Foundation Package Exception - Allow internal imports for implementation
	{
		files: ["packages/core/foundation/**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 2024,
				sourceType: "module",
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				console: "readonly",
				process: "readonly",
				Buffer: "readonly",
				__filename: "readonly",
				__dirname: "readonly",
				global: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
			import: importPlugin,
			sonarjs,
			unicorn,
			"unused-imports": unusedImports,
		},
		rules: {
			// Allow foundation to import its own internals - it implements the utilities
			"no-restricted-imports": "off",
			
			// Other standard rules still apply
			"no-console": "warn", // Allow console in implementation
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-unused-vars": "error", 
			"unused-imports/no-unused-imports": "error",
			"require-await": "error",
			"no-duplicate-imports": "error",
			"sonarjs/no-duplicate-string": "error",
			"@typescript-eslint/naming-convention": [
				"warn",
				{ selector: "variable", format: ["camelCase", "UPPER_CASE"] },
				{ selector: "function", format: ["camelCase"] },
				{ selector: "method", format: ["camelCase"] },
				{ selector: "class", format: ["PascalCase"] },
				{ selector: "interface", format: ["PascalCase"] },
				{ selector: "typeAlias", format: ["PascalCase"] },
			],
		},
	},

	// JavaScript files - Simplified rules (no TypeScript-specific rules)
	{
		files: ["**/*.{js,jsx,mjs,cjs}"],
		languageOptions: {
			ecmaVersion: 2024,
			sourceType: "module",
			globals: {
				console: "readonly",
				process: "readonly",
				Buffer: "readonly",
				__dirname: "readonly",
				__filename: "readonly",
				global: "readonly",
				require: "readonly",
				module: "readonly",
				exports: "readonly",
				fetch: "readonly",
				AbortSignal: "readonly",
				URLSearchParams: "readonly",
				WebSocket: "readonly",
				setTimeout: "readonly",
				clearTimeout: "readonly",
				setInterval: "readonly",
				clearInterval: "readonly",
			},
		},
		plugins: {
			import: importPlugin,
			sonarjs: sonarjs,
			"unused-imports": unusedImports,
			unicorn: unicorn,
		},
		rules: {
			// Basic quality rules for JS files (NO TypeScript rules)
			"no-console": "warn", // Allow console in JS scripts
			"no-unused-vars": "error",
			"unused-imports/no-unused-imports": "error",
			"prefer-const": "error",
			"no-var": "error",

			// Complexity for JS
			complexity: ["warn", { max: 15 }], // More relaxed for scripts
			"max-depth": ["warn", { max: 5 }],

			// SonarJS basics
			"sonarjs/cognitive-complexity": ["warn", 20],
			"sonarjs/no-duplicate-string": ["warn", { threshold: 5 }],

			// Import organization (JS compatible)
			"no-duplicate-imports": "error",

			// Foundation Exports Enforcement for JS files
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: ["lodash", "lodash/*"],
							message:
								'Use foundation exports: const { _, lodash } = require("@claude-zen/foundation")',
						},
						{
							group: ["uuid", "uuid/*"],
							message:
								'Use foundation exports: const { generateUUID } = require("@claude-zen/foundation")',
						},
					],
				},
			],

			// Modern JavaScript patterns
			"prefer-template": "error",
			"object-shorthand": "error",
			"prefer-arrow-callback": "error",

			// NO TypeScript-specific rules for JS files
			// "@typescript-eslint/naming-convention" - REMOVED for JS files
		},
	},

	// Test files - Environment with Jest/Vitest globals
	{
		files: ["**/*.test.{ts,tsx,js,jsx}", "**/*.spec.{ts,tsx,js,jsx}", "**/tests/**/*.{ts,tsx,js,jsx}"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 2024,
				sourceType: "module",
			},
			globals: {
				describe: "readonly",
				it: "readonly", 
				test: "readonly",
				expect: "readonly",
				beforeAll: "readonly",
				afterAll: "readonly",
				beforeEach: "readonly",
				afterEach: "readonly",
				vi: "readonly",
				vitest: "readonly",
				jest: "readonly",
				// Also include Node.js globals
				console: "readonly",
				process: "readonly",
				Buffer: "readonly",
				__dirname: "readonly",
				__filename: "readonly",
				global: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
			import: importPlugin,
			sonarjs: sonarjs,
			"unused-imports": unusedImports,
			unicorn: unicorn,
		},
		rules: {
			// Relax rules for test files but keep sonarjs/complexity working
			"@typescript-eslint/no-explicit-any": "warn",
			"max-lines-per-function": "off",
			"sonarjs/cognitive-complexity": ["warn", 50],  // Higher threshold for tests
			"@typescript-eslint/naming-convention": "off",
			"complexity": "off",  // Turn off basic complexity for tests
		},
	},

	// Ignore patterns
	{
		ignores: [
			// Build artifacts and compiled output
			"scripts/**/*",
			"dist/**/*",
			"build/**/*",
			"target/**/*",
			"packages/**/dist/**/*",
			"apps/**/dist/**/*",
			"apps/**/.svelte-kit/**/*",
			"apps/**/build/**/*",          // Critical: Web dashboard build directory
			"apps/web-dashboard/build/**", // Explicit web dashboard build exclusion

			// Node modules and dependencies
			"coverage/**/*",
			"node_modules/**/*",

			// Configuration and cache files
			"*.config.*",
			"test-results.json",
			".eslintcache",
			"gts.json",
			"jest.config.js",
			"**/*.tsbuildinfo",

			// Generated files - TypeScript compilation output
			"**/*.d.ts",
			"**/*.d.ts.map",
			"**/*.js.map",
			
			// All compiled JavaScript files in source directories
			"packages/**/src/**/*.js",    // Compiled JS files in package src directories
			"packages/**/test/**/*.js",   // Compiled JS files in package test directories
			"apps/**/src/**/*.js",        // Compiled JS files in app src directories
			
			// Critical: Specific build artifacts causing massive lint failures
			"apps/web-dashboard/build/_app/**/*",    // Svelte build output
			"apps/web-dashboard/build/**/*.js",      // All built JS files  
			"apps/web-dashboard/build/**/*.ts",      // All built TS files
			"**/build/_app/immutable/chunks/**/*",   // Minified chunks
			"**/build/_app/immutable/**/*",          // All immutable assets
			
			// Legacy patterns (keep for backward compatibility)
			"packages/**/*.js",
			"packages/**/*.js.map",

			// Database and storage
			"*.db",
			"*.sqlite*",
			"storage/**/*",
			"qdrant_storage/**/*",
			"**/*.kuzu/**/*",

			// Environment and local files
			".env*",
			".mise.toml",

			// Development directories
			"ruv-FANN/**/*", // Rust code
			".claude/**/*", // Claude commands
			".claude-zen/**/*", // Local data
			".github/**/*", // GitHub workflows
			"tmp/**/*",
			"logs/**/*",
			
			// Legacy/old packages - completely ignore during restructuring
			"packages-old/**/*",

			// Test setup files not in tsconfig
			"tests/setup*.ts",
			"tests/vitest-setup.ts",

			// Root-level utility scripts
			"analyze-corruption-patterns.mjs",
			"apply-ast-union-fix.mjs",
			"fix-remaining-corruption.sh",
			"test-*.ts",
			"test-*.mjs",
			"*.test.*",
			"*.spec.*",

			// Mock and script files
			"**/mock-*.{js,cjs,mjs}",
			"**/scripts/**/*.{js,mjs,cjs}",
			"**/*-codegen.config.ts",
			"apps/*/scripts/**/*.{js,mjs,cjs}",

			// Bazel and analysis artifacts
			"bazel-*/**/*",
			".bazel-*/**/*",
			"analysis-reports/**/*",
			"graph-db/**/*",

			// Playwright artifacts
			".playwright-mcp/**/*",
		],
	},
];
