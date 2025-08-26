#!/usr/bin/env node

/**
 * @fileoverview Comprehensive Test Runner for Foundation SDK
 *
 * This script runs extensive tests with different configurations:
 * - Unit tests (fast, no API calls)
 * - Integration tests (real Claude API calls)
 * - Performance tests (load testing and metrics)
 * - Streaming tests (real-time processing)
 * - Parallel execution tests (concurrent operations)
 *
 * Usage:
 *   npm run test:comprehensive                    # Unit tests only
 *   npm run test:comprehensive -- --integration  # Include integration tests
 *   npm run test:comprehensive -- --all          # Run all test suites
 *   npm run test:comprehensive -- --performance  # Include performance tests
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 */

import { spawn } from "node:child_process";
import * as fs from "node:fs";

const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
};

function colorize(text, color) {
	return `${colors[color]}${text}${colors.reset}`;
}

function log(message, color = "reset") {
	console.log(colorize(message, color));
}

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
	integration: args.includes("--integration"),
	performance: args.includes("--performance"),
	streaming: args.includes("--streaming"),
	parallel: args.includes("--parallel"),
	all: args.includes("--all"),
	verbose: args.includes("--verbose"),
	help: args.includes("--help") || args.includes("-h"),
};

// If --all is specified, enable all test types
if (flags.all) {
	flags.integration = true;
	flags.performance = true;
	flags.streaming = true;
	flags.parallel = true;
}

function printHelp() {
	log("🧪 Foundation SDK Comprehensive Test Runner", "bright");
	log("");
	log("Usage:", "cyan");
	log("  npm run test:comprehensive [options]", "blue");
	log("");
	log("Options:", "cyan");
	log("  --integration   Run integration tests (requires API access)");
	log("  --performance   Run performance and load tests");
	log("  --streaming     Run streaming and real-time tests");
	log("  --parallel      Run parallel execution tests");
	log("  --all           Run all test suites");
	log("  --verbose       Enable verbose output");
	log("  --help, -h      Show this help message");
	log("");
	log("Examples:", "cyan");
	log(
		"  npm run test:comprehensive                    # Unit tests only",
		"blue",
	);
	log(
		"  npm run test:comprehensive -- --integration  # Unit + Integration",
		"blue",
	);
	log(
		"  npm run test:comprehensive -- --all          # All test suites",
		"blue",
	);
	log(
		"  npm run test:comprehensive -- --performance  # Unit + Performance",
		"blue",
	);
	log("");
}

if (flags.help) {
	printHelp();
	process.exit(0);
}

// Test configuration
const testConfig = {
	// Base test files (always run)
	baseTests: [
		"tests/claude-sdk.test.ts",
		"__tests__/error-handling.test.ts",
		"__tests__/telemetry.test.ts",
	],

	// Comprehensive test file with conditional suites
	comprehensiveTest: "tests/comprehensive-claude-sdk.test.ts",

	// Integration test file
	integrationTest: "tests/integration.test.ts",

	// Additional test files
	additionalTests: ["tests/llm-provider.test.ts"],
};

// Environment variables to control test execution
const testEnv = {
	...process.env,
	RUN_INTEGRATION: flags.integration ? "true" : "false",
	RUN_PERFORMANCE: flags.performance ? "true" : "false",
	RUN_STREAMING: flags.streaming ? "true" : "false",
	RUN_PARALLEL: flags.parallel ? "true" : "false",
	NODE_ENV: "test",
	LOG_LEVEL: flags.verbose ? "debug" : "info",
};

function runVitest(testFiles, description, additionalOptions = []) {
	return new Promise((resolve, reject) => {
		log(`\n🚀 Running ${description}...`, "cyan");
		log(`📁 Test files: ${testFiles.join(", ")}`, "blue");

		const vitestArgs = [
			"vitest",
			"run",
			...testFiles,
			"--reporter=verbose",
			"--reporter=json",
			"--outputFile=test-results.json",
			...additionalOptions,
		];

		if (flags.verbose) {
			log(`🔧 Command: npx ${vitestArgs.join(" ")}`, "yellow");
		}

		const child = spawn("npx", vitestArgs, {
			env: testEnv,
			stdio: "pipe",
			shell: true,
		});

		let stdout = "";
		let stderr = "";

		child.stdout.on("data", (data) => {
			const output = data.toString();
			stdout += output;
			if (flags.verbose) {
				process.stdout.write(output);
			}
		});

		child.stderr.on("data", (data) => {
			const output = data.toString();
			stderr += output;
			if (flags.verbose) {
				process.stderr.write(output);
			}
		});

		child.on("close", (code) => {
			if (code === 0) {
				log(`✅ ${description} completed successfully`, "green");
				resolve({ success: true, stdout, stderr });
			} else {
				log(`❌ ${description} failed with exit code ${code}`, "red");
				if (!flags.verbose && stderr) {
					log("Error output:", "red");
					console.error(stderr);
				}
				resolve({ success: false, stdout, stderr, exitCode: code });
			}
		});

		child.on("error", (error) => {
			log(`❌ Failed to start ${description}: ${error.message}`, "red");
			reject(error);
		});
	});
}

// function parseTestResults(stdout) {
//   try {
//     // Extract test results from stdout
//     const lines = stdout.split('\n');
//     const testLine = lines.find(line => line.includes('Test Files'));
//     if (testLine) {
//       const match = testLine.match(/(\d+)\s+passed/);
//       return match ? parseInt(match[1]) : 0;
//     }
//     return 0;
//   } catch {
//     return 0;
//   }
// }

async function runTestSuite() {
	log("🧪 Foundation SDK Comprehensive Test Suite", "bright");
	log("=".repeat(60), "blue");

	// Display configuration
	log("\n📋 Test Configuration:", "cyan");
	log(`   Unit Tests: ✅ Enabled (always)`, "green");
	log(
		`   Integration Tests: ${flags.integration ? "✅ Enabled" : "⏭️ Disabled"}`,
		flags.integration ? "green" : "yellow",
	);
	log(
		`   Performance Tests: ${flags.performance ? "✅ Enabled" : "⏭️ Disabled"}`,
		flags.performance ? "green" : "yellow",
	);
	log(
		`   Streaming Tests: ${flags.streaming ? "✅ Enabled" : "⏭️ Disabled"}`,
		flags.streaming ? "green" : "yellow",
	);
	log(
		`   Parallel Tests: ${flags.parallel ? "✅ Enabled" : "⏭️ Disabled"}`,
		flags.parallel ? "green" : "yellow",
	);
	log(
		`   Verbose Output: ${flags.verbose ? "✅ Enabled" : "⏭️ Disabled"}`,
		flags.verbose ? "green" : "yellow",
	);

	const results = [];
	let totalPassed = 0;
	let totalFailed = 0;

	try {
		// 1. Run base unit tests (always)
		log(`\n${"=".repeat(60)}`, "blue");
		const baseResult = await runVitest(
			testConfig.baseTests.filter((file) => fs.existsSync(file)),
			"Unit Tests (Base)",
			["--testTimeout=30000"],
		);
		results.push({ name: "Unit Tests", ...baseResult });
		if (baseResult.success) totalPassed++;
		else totalFailed++;

		// 2. Run comprehensive tests with conditional suites
		log(`\n${"=".repeat(60)}`, "blue");
		const comprehensiveResult = await runVitest(
			[testConfig.comprehensiveTest],
			"Comprehensive Tests (Conditional)",
			["--testTimeout=300000"], // 5 minute timeout for comprehensive tests
		);
		results.push({ name: "Comprehensive Tests", ...comprehensiveResult });
		if (comprehensiveResult.success) totalPassed++;
		else totalFailed++;

		// 3. Run integration tests (if enabled)
		if (flags.integration && fs.existsSync(testConfig.integrationTest)) {
			log(`\n${"=".repeat(60)}`, "blue");
			const integrationResult = await runVitest(
				[testConfig.integrationTest],
				"Integration Tests (Real API)",
				["--testTimeout=300000", "--bail=1"], // Stop on first failure for integration
			);
			results.push({ name: "Integration Tests", ...integrationResult });
			if (integrationResult.success) totalPassed++;
			else totalFailed++;
		}

		// 4. Run additional tests
		const existingAdditionalTests = testConfig.additionalTests.filter((file) =>
			fs.existsSync(file),
		);
		if (existingAdditionalTests.length > 0) {
			log(`\n${"=".repeat(60)}`, "blue");
			const additionalResult = await runVitest(
				existingAdditionalTests,
				"Additional Tests",
				["--testTimeout=60000"],
			);
			results.push({ name: "Additional Tests", ...additionalResult });
			if (additionalResult.success) totalPassed++;
			else totalFailed++;
		}
	} catch {
		log(`❌ Test execution error: ${error.message}`, "red");
		totalFailed++;
	}

	// Generate final report
	log(`\n${"=".repeat(60)}`, "blue");
	log("📊 Test Suite Summary", "bright");
	log(`${"=".repeat(60)}`, "blue");

	results.forEach((result, index) => {
		const status = result.success ? "✅ PASSED" : "❌ FAILED";
		const color = result.success ? "green" : "red";
		log(`${index + 1}. ${result.name}: ${colorize(status, color)}`);

		if (!result.success && result.exitCode) {
			log(`   Exit code: ${result.exitCode}`, "red");
		}
	});

	log("");
	log(`📈 Overall Results:`, "cyan");
	log(`   ✅ Passed: ${colorize(totalPassed.toString(), "green")}`);
	log(
		`   ❌ Failed: ${colorize(totalFailed.toString(), totalFailed > 0 ? "red" : "green")}`,
	);
	log(
		`   📊 Success Rate: ${colorize(`${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%`, totalFailed === 0 ? "green" : "yellow")}`,
	);

	// Test results file handling
	if (fs.existsSync("test-results.json")) {
		try {
			const testResults = JSON.parse(
				fs.readFileSync("test-results.json", "utf8"),
			);
			if (testResults.testResults) {
				log(`📄 Detailed results saved to: test-results.json`, "blue");
			}
		} catch {
			log(`⚠️ Could not parse test results file: ${error.message}`, "yellow");
		}
	}

	// Performance summary (if performance tests were run)
	if (flags.performance) {
		log("");
		log("⚡ Performance Test Notes:", "magenta");
		log("   - Check logs for timing and throughput metrics");
		log("   - Review memory usage and resource consumption");
		log("   - Analyze concurrent execution patterns");
	}

	// Integration test notes (if integration tests were run)
	if (flags.integration) {
		log("");
		log("🔌 Integration Test Notes:", "magenta");
		log("   - Requires valid Claude API access");
		log("   - Tests real API calls and responses");
		log("   - May be affected by API rate limits");
	}

	// Exit with appropriate code
	const exitCode = totalFailed === 0 ? 0 : 1;

	if (exitCode === 0) {
		log(`\n🎉 All test suites completed successfully!`, "green");
	} else {
		log(
			`\n💥 ${totalFailed} test suite(s) failed. Check logs above for details.`,
			"red",
		);
	}

	log(`${"=".repeat(60)}`, "blue");
	process.exit(exitCode);
}

// Handle unhandled promises
process.on("unhandledRejection", (reason) => {
	log(`❌ Unhandled promise rejection: ${reason}`, "red");
	process.exit(1);
});

// Handle interrupt signals
process.on("SIGINT", () => {
	log("\n🛑 Test execution interrupted by user", "yellow");
	process.exit(130);
});

process.on("SIGTERM", () => {
	log("\n🛑 Test execution terminated", "yellow");
	process.exit(143);
});

// Run the test suite
runTestSuite().catch(() => {
	log(`❌ Fatal error: ${error.message}`, "red");
	process.exit(1);
});
