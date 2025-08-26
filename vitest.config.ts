/**
 * @fileoverview Vitest Configuration for Claude Code Zen Testing Framework
 *
 * This configuration file sets up Vitest for comprehensive testing across the entire
 * Claude Code Zen codebase. It includes optimized settings for performance, coverage,
 * parallel execution, and TypeScript/JavaScript testing.
 *
 * Key Features:
 * - Happy-DOM environment for 4x faster DOM testing than jsdom
 * - Concurrent test execution with thread pooling
 * - Comprehensive coverage reporting with v8 provider
 * - Path aliases for cleaner imports in tests
 * - Optimized timeouts and thresholds for large codebase
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 1.0.0
 *
 * @see {@link https://vitest.dev/config/} Vitest Configuration Reference
 * @see {@link https://github.com/capricorn86/happy-dom} Happy-DOM Documentation
 *
 * @example
 * ```bash
 * # Run tests with this configuration
 * npm test
 *
 * # Run with coverage
 * npm run test: coverage
 *
 * # Run specific test pattern
 * npm test -- --run coordination
 * ```
 */

import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for Claude Code Zen testing framework.
 *
 * Configures the test environment, coverage reporting, parallel execution,
 * and path resolution for comprehensive testing across the codebase.
 *
 * @constant {import('vitest/config').UserConfig}
 *
 * @property {object} test - Test execution configuration
 * @property {object} test.coverage - Coverage reporting configuration with v8 provider
 * @property {object} test.poolOptions - Thread pool configuration for parallel execution
 * @property {object} resolve - Module resolution configuration with path aliases
 *
 * @returns {import('vitest/config').UserConfig} Complete Vitest configuration object
 *
 * @example
 * ```typescript
 * // This config enables path aliases in tests:
 * import { CoreEngine } from '@core/engine';
 * import { MemoryStore } from '@memory/store';
 * import { NeuralNetwork } from '@neural/network';
 * ```
 */
export default defineConfig({
	test: {
		/**
		 * Test environment configuration.
		 * Using happy-dom for 4x faster DOM testing compared to jsdom.
		 *
		 * @type {'happy-dom'}
		 * @see {@link https://github.com/capricorn86/happy-dom} Happy-DOM Performance Benefits
		 */
		environment: "happy-dom",

		/**
		 * Test file inclusion patterns.
		 * Includes TypeScript and TypeScript React test files from multiple directories.
		 *
		 * @type {string[]}
		 * @example ['src/__tests__/coordination/memory.test.ts', 'tests/integration/api.test.ts']
		 */
		include: [
			"src/__tests__/**/*.test.ts",
			"src/__tests__/**/*.test.tsx",
			"tests/**/*.test.ts",
			"tests/**/*.test.tsx",
		],

		/**
		 * File and directory exclusion patterns.
		 * Excludes build artifacts, dependencies, and legacy JavaScript test files.
		 *
		 * @type {string[]}
		 * @rationale Excluding swarm-zen JS files as they're legacy and cause type conflicts
		 */
		exclude: [
			"node_modules",
			"dist",
			".git",
			"coverage",
			"src/__tests__/swarm-zen/**/*.js",
			"src/interfaces/cli.disabled/**/*",
			"src/__tests__/e2e/complete-workflow.test.ts",
			"src/__tests__/coordination/shared-fact-system.test.ts",
			"src/__tests__/coordination/collective-knowledge-*.test.ts",
		],

		/**
		 * Global test utilities configuration.
		 * Enables global access to describe, it, expect, etc. without explicit imports.
		 *
		 * @type {boolean}
		 * @default true
		 * @see {@link https://vitest.dev/config/#globals} Vitest Globals Documentation
		 */
		globals: true,

		/**
		 * Performance and timeout configurations.
		 * Optimized for large codebase with complex async operations.
		 */

		/**
		 * Maximum time allowed for individual test execution.
		 *
		 * @type {number}
		 * @unit milliseconds
		 * @default 30000
		 * @rationale Extended timeout for complex integration tests and neural network operations
		 */
		testTimeout: 30000,

		/**
		 * Maximum number of concurrent test suites.
		 *
		 * @type {number}
		 * @default 8
		 * @performance Balances speed with system resource usage
		 */
		maxConcurrency: 8,

		/**
		 * Test execution sequence configuration.
		 *
		 * @type {object}
		 * @property {boolean} concurrent - Enable concurrent test execution by default
		 */
		sequence: {
			/** @type {boolean} @default true */
			concurrent: true,
		},

		/**
		 * Timeout for test hooks (beforeEach, afterEach, etc.).
		 *
		 * @type {number}
		 * @unit milliseconds
		 * @default 10000
		 */
		hookTimeout: 10000,

		/**
		 * Timeout for test teardown operations.
		 *
		 * @type {number}
		 * @unit milliseconds
		 * @default 10000
		 */
		teardownTimeout: 10000,

		/**
		 * Code coverage configuration using V8 provider.
		 * Comprehensive coverage reporting with multiple output formats.
		 *
		 * @type {object}
		 * @see {@link https://vitest.dev/guide/coverage.html} Vitest Coverage Guide
		 */
		coverage: {
			/**
			 * Coverage provider selection.
			 * V8 provides native Node.js coverage with better performance.
			 *
			 * @type {'v8'}
			 * @alternative 'c8|istanbul''
			 * @performance V8 is fastest for TypeScript projects
			 */
			provider: "v8",

			/**
			 * Coverage report output formats.
			 * Multiple formats for different use cases (CI, local dev, web viewing).
			 *
			 * @type {string[]}
			 * @format text - Console output for immediate feedback
			 * @format json - Machine-readable for CI integration
			 * @format html - Interactive web interface
			 * @format lcov - Standard format for external tools
			 */
			reporter: ["text", "json", "html", "lcov"],

			/**
			 * Directory for coverage report output.
			 *
			 * @type {string}
			 * @default 'coverage'
			 * @gitignore This directory should be in .gitignore
			 */
			reportsDirectory: "coverage",

			/**
			 * Files to include in coverage analysis.
			 * Only source TypeScript files, excluding tests and type definitions.
			 *
			 * @type {string[]}
			 * @pattern Glob patterns for TypeScript source files
			 */
			include: ["src/**/*.{ts,tsx}"],

			/**
			 * Files and directories to exclude from coverage.
			 * Excludes test files, type definitions, and build artifacts.
			 *
			 * @type {string[]}
			 * @rationale Test files shouldn't count toward coverage metrics
			 */
			exclude: [
				"src/__tests__/**",
				"src/**/*.test.{ts,tsx}",
				"src/**/*.spec.{ts,tsx}",
				"src/**/*.d.ts",
				"src/types/**",
				"node_modules",
				"dist",
			],

			/**
			 * Coverage quality thresholds.
			 * Enforces minimum code coverage standards.
			 *
			 * @type {object}
			 * @property {object} global - Global coverage requirements
			 * @quality 70% threshold balances quality with development speed
			 */
			thresholds: {
				global: {
					/** @type {number} @unit percentage @minimum 70 */
					branches: 70,
					/** @type {number} @unit percentage @minimum 70 */
					functions: 70,
					/** @type {number} @unit percentage @minimum 70 */
					lines: 70,
					/** @type {number} @unit percentage @minimum 70 */
					statements: 70,
				},
			},
		},

		/**
		 * Test setup file configuration.
		 * Files to run before test execution starts.
		 *
		 * @type {string[]}
		 * @see './tests/vitest-setup.ts' Global test setup and mocks
		 */
		setupFiles: ["./tests/vitest-setup.ts", "./tests/jest-compat-setup.ts"],

		/**
		 * Test result reporting configuration.
		 * Multiple reporters for different output needs.
		 *
		 * @type {string[]}
		 * @format verbose - Detailed console output with test names and timing
		 * @format json - Machine-readable results for CI/CD integration
		 */
		reporter: ["verbose", "json"],

		/**
		 * Output file configuration for reporters.
		 * Specifies where to write structured test results.
		 *
		 * @type {object}
		 * @property {string} json - JSON output file path for CI integration
		 */
		outputFile: {
			json: "./test-results.json",
		},

		/**
		 * Test execution pool configuration.
		 * Uses worker threads for parallel test execution.
		 *
		 * @type {'threads'}
		 * @alternative 'forks|vmThreads''
		 * @performance Threads provide best balance of speed and isolation
		 */
		pool: "threads",

		/**
		 * Thread pool optimization settings.
		 * Controls resource allocation for parallel test execution.
		 *
		 * @type {object}
		 * @property {object} threads - Thread-specific configuration
		 */
		poolOptions: {
			threads: {
				/**
				 * Maximum number of worker threads.
				 *
				 * @type {number}
				 * @default 4
				 * @performance Limited to prevent system overload
				 */
				maxThreads: 4,

				/**
				 * Minimum number of worker threads.
				 *
				 * @type {number}
				 * @default 2
				 * @performance Ensures consistent performance baseline
				 */
				minThreads: 2,
			},
		},
	},

	/**
	 * Module resolution configuration.
	 * Defines path aliases for cleaner imports throughout the codebase.
	 *
	 * @type {object}
	 * @property {object} alias - Path alias mappings
	 * @see {@link https://vitest.dev/config/#resolve-alias} Vitest Alias Documentation
	 *
	 * @example
	 * ```typescript
	 * // Instead of: import { Engine } from '../../../core/engine';
	 * import { Engine } from '@core/engine';
	 * ```
	 */
	resolve: {
		/**
		 * Path alias definitions for module resolution.
		 * Maps short aliases to full directory paths for cleaner imports.
		 *
		 * @type {Record<string, string>}
		 * @pattern @{domain} - Domain-specific modules
		 * @benefits Reduces import path complexity and improves maintainability
		 */
		alias: {
			/** @description Core system components and engines */
			"@core": resolve(__dirname, "src/core"),

			/** @description Coordination and orchestration modules */
			"@coordination": resolve(__dirname, "src/coordination"),

			/** @description Neural network and AI components */
			"@neural": resolve(__dirname, "src/neural"),

			/** @description Memory management and storage systems */
			"@memory": resolve(__dirname, "src/memory"),

			/** @description Utility functions and helpers */
			"@utils": resolve(__dirname, "src/utils"),

			/** @description TypeScript type definitions */
			"@types": resolve(__dirname, "src/types"),

			/** @description User interface and interaction components */
			"@interfaces": resolve(__dirname, "src/interfaces"),

			/** @description Swarm intelligence and multi-agent systems */
			"@swarm-zen": resolve(__dirname, "src/swarm-zen"),

			/** @description API endpoints and HTTP handling */
			"@api": resolve(__dirname, "src/api"),

			/** @description Model Context Protocol (MCP) integrations */
			"@mcp": resolve(__dirname, "src/mcp"),

			/** @description Configuration management */
			"@config": resolve(__dirname, "src/config"),

			/** @description Terminal and CLI interfaces */
			"@terminal": resolve(__dirname, "src/terminal"),

			/** @description Development and debugging tools */
			"@tools": resolve(__dirname, "src/tools"),

			/** @description Knowledge management and RAG systems */
			"@knowledge": resolve(__dirname, "src/knowledge"),

			/** @description Database connections and ORM */
			"@database": resolve(__dirname, "src/database"),
		},
	},
});

/**
 * @typedef {object} VitestConfig
 * @description Complete Vitest configuration type definition
 * @see {@link https://vitest.dev/config/} Full configuration reference
 *
 * @property {object} test - Test execution configuration
 * @property {string} test.environment - Test environment ('happy-dom', 'jsdom', 'node')
 * @property {string[]} test.include - Test file inclusion patterns
 * @property {string[]} test.exclude - File exclusion patterns
 * @property {boolean} test.globals - Enable global test utilities
 * @property {number} test.testTimeout - Individual test timeout in milliseconds
 * @property {number} test.maxConcurrency - Maximum concurrent test suites
 * @property {object} test.sequence - Test execution sequence configuration
 * @property {number} test.hookTimeout - Test hook timeout in milliseconds
 * @property {number} test.teardownTimeout - Teardown timeout in milliseconds
 * @property {object} test.coverage - Coverage reporting configuration
 * @property {string} test.coverage.provider - Coverage provider ('v8', 'c8', 'istanbul')
 * @property {string[]} test.coverage.reporter - Coverage report formats
 * @property {string} test.coverage.reportsDirectory - Coverage output directory
 * @property {string[]} test.coverage.include - Files to include in coverage
 * @property {string[]} test.coverage.exclude - Files to exclude from coverage
 * @property {object} test.coverage.thresholds - Coverage quality thresholds
 * @property {string[]} test.setupFiles - Test setup files
 * @property {string[]} test.reporter - Test result reporters
 * @property {object} test.outputFile - Reporter output file configuration
 * @property {string} test.pool - Test execution pool type
 * @property {object} test.poolOptions - Pool-specific configuration
 * @property {object} resolve - Module resolution configuration
 * @property {Record<string, string>} resolve.alias - Path alias mappings
 */
