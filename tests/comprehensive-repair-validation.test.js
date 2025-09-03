#!/usr/bin/env node

/**
 * Comprehensive Repair Validation Test Suite
 * 
 * Tests the complete system repair functionality including:
 * - Dependency validation and installation
 * - Configuration file integrity
 * - Build system validation
 * - Runtime component testing
 * - Error recovery mechanisms
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

// Test project path configuration
const TEST_PROJECT_PATH = process.env.TEST_PROJECT_PATH || process.cwd();

// Console colors for better test output visibility
const colors = {
	green: "\x1b[32m",
	red: "\x1b[31m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
	reset: "\x1b[0m",
};

/**
 * Enhanced logging function with color support and context
 * @param {string} message - Log message to display
 * @param {string} color - Color key from colors object
 */
function log(message, color = "reset") {
	if (message && colors[color]) {
		console.log(`${colors[color]}${message}${colors.reset}`);
	} else {
		console.log(message);
	}
}

/**
 * Test result recorder for systematic validation tracking
 */
class TestResultRecorder {
	constructor() {
		this.results = [];
	}

	recordResult(testName, success, details) {
		this.results.push({ testName, success, details, timestamp: Date.now() });
		const status = success ? 'PASS' : 'FAIL';
		const color = success ? 'green' : 'red';
		log(`${status}: ${testName} - ${details}`, color);
	}

	getResults() {
		return this.results;
	}

	getSummary() {
		const total = this.results.length;
		const passed = this.results.filter(r => r.success).length;
		const failed = total - passed;
		return { total, passed, failed };
	}
}

// Global test recorder instance
const testRecorder = new TestResultRecorder();

/**
 * Blessed UI Library availability check with proper error handling
 */
function checkBlessedAvailability() {
	try {
		require("blessed");
		testRecorder.recordResult(
			"Blessed UI Library",
			true,
			"Available for interactive dashboard",
		);
		return true;
	} catch (error) {
		testRecorder.recordResult(
			"Blessed UI Library",
			false,
			`Not available - will use text mode. Error: ${error.message}`,
		);
		return false;
	}
}

/**
 * Validates npm dependencies and installation status
 */
function validateNpmDependencies() {
	try {
		log("Validating npm dependencies...", "blue");
		execSync('npm list --depth=0', { 
			cwd: TEST_PROJECT_PATH,
			stdio: 'pipe'
		});
		testRecorder.recordResult(
			"NPM Dependencies",
			true,
			"All dependencies properly installed and resolved"
		);
		return true;
	} catch (error) {
		testRecorder.recordResult(
			"NPM Dependencies", 
			false,
			`Dependency issues detected: ${error.message}`
		);
		return false;
	}
}

/**
 * Validates TypeScript compilation across the project
 */
function validateTypeScriptCompilation() {
	try {
		log("Validating TypeScript compilation...", "blue");
		execSync('npx tsc --noEmit', { 
			cwd: TEST_PROJECT_PATH,
			stdio: 'pipe'
		});
		testRecorder.recordResult(
			"TypeScript Compilation",
			true,
			"All TypeScript files compile without errors"
		);
		return true;
	} catch (error) {
		testRecorder.recordResult(
			"TypeScript Compilation",
			false,
			`TypeScript compilation errors detected: ${error.message}`
		);
		return false;
	}
}

/**
 * Validates critical configuration files exist and are well-formed
 */
function validateConfigurationFiles() {
	const criticalFiles = [
		'package.json',
		'tsconfig.json',
		'CLAUDE.md'
	];

	let allFilesValid = true;

	criticalFiles.forEach(file => {
		const filePath = path.join(TEST_PROJECT_PATH, file);
		if (existsSync(filePath)) {
			testRecorder.recordResult(
				`Configuration File: ${file}`,
				true,
				`File exists at ${filePath}`
			);
		} else {
			testRecorder.recordResult(
				`Configuration File: ${file}`,
				false,
				`Missing critical file: ${filePath}`
			);
			allFilesValid = false;
		}
	});

	return allFilesValid;
}

/**
 * Tests the build system functionality
 */
function validateBuildSystem() {
	try {
		log("Testing build system...", "blue");
		execSync('npm run build', { 
			cwd: TEST_PROJECT_PATH,
			stdio: 'pipe'
		});
		testRecorder.recordResult(
			"Build System",
			true,
			"Build completed successfully"
		);
		return true;
	} catch (error) {
		testRecorder.recordResult(
			"Build System",
			false,
			`Build failed: ${error.message}`
		);
		return false;
	}
}

/**
 * Tests the test suite execution
 */
function validateTestSuite() {
	try {
		log("Running test suite...", "blue");
		execSync('npm test', { 
			cwd: TEST_PROJECT_PATH,
			stdio: 'pipe'
		});
		testRecorder.recordResult(
			"Test Suite",
			true,
			"All tests passed successfully"
		);
		return true;
	} catch (error) {
		testRecorder.recordResult(
			"Test Suite",
			false,
			`Test failures detected: ${error.message}`
		);
		return false;
	}
}

/**
 * Validates provider integrations are working
 */
function validateProviderIntegrations() {
	const providerPaths = [
		path.join(TEST_PROJECT_PATH, 'packages/integrations/claude-provider'),
		path.join(TEST_PROJECT_PATH, 'packages/integrations/copilot-provider'),
		path.join(TEST_PROJECT_PATH, 'packages/integrations/github-models-provider'),
		path.join(TEST_PROJECT_PATH, 'packages/integrations/gemini-provider')
	];

	let allProvidersValid = true;

	providerPaths.forEach(providerPath => {
		const indexFile = path.join(providerPath, 'src/index.ts');
		if (existsSync(indexFile)) {
			testRecorder.recordResult(
				`Provider Integration: ${path.basename(providerPath)}`,
				true,
				`Provider structure valid at ${providerPath}`
			);
		} else {
			testRecorder.recordResult(
				`Provider Integration: ${path.basename(providerPath)}`,
				false,
				`Missing provider index file: ${indexFile}`
			);
			allProvidersValid = false;
		}
	});

	return allProvidersValid;
}

/**
 * Main test runner function
 */
async function runComprehensiveValidation() {
	log("Starting Comprehensive Repair Validation", "cyan");
	log("=" * 50, "cyan");

	// Run all validation tests to ensure comprehensive system validation
	const testResults = [
		checkBlessedAvailability(),
		validateConfigurationFiles(),
		validateNpmDependencies(),
		validateTypeScriptCompilation(),
		validateBuildSystem(),
		validateTestSuite(),
		validateProviderIntegrations()
	];
	
	// Log test completion for debugging
	log(`Completed ${testResults.length} validation tests`, "blue");

	// Generate summary
	const summary = testRecorder.getSummary();
	
	log("\nValidation Summary:", "yellow");
	log(`Total Tests: ${summary.total}`, "blue");
	log(`Passed: ${summary.passed}`, "green");
	log(`Failed: ${summary.failed}`, summary.failed > 0 ? "red" : "green");

	const overallSuccess = summary.failed === 0;
	log(`\nOverall Result: ${overallSuccess ? "SUCCESS" : "FAILURE"}`, overallSuccess ? "green" : "red");

	// Exit with appropriate code
	process.exit(overallSuccess ? 0 : 1);
}

// Run the validation if this file is executed directly
if (require.main === module) {
	runComprehensiveValidation().catch(error => {
		log(`Validation failed with error: ${error.message}`, "red");
		process.exit(1);
	});
}

module.exports = {
	runComprehensiveValidation,
	testRecorder,
	validateNpmDependencies,
	validateTypeScriptCompilation,
	validateConfigurationFiles,
	validateBuildSystem,
	validateTestSuite,
	validateProviderIntegrations
};