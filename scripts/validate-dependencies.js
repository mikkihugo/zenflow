#!/usr/bin/env node

/**
 * Package.json Dependencies Validation - Foundation Enforcement
 *
 * Prevents packages from adding direct dependencies on libraries that should be used through foundation
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Dependencies that should NOT be directly added to package.json files
// (except for foundation itself)
const FORBIDDEN_DEPENDENCIES = {
	lodash: "Use @claude-zen/foundation instead",
	events: "Use @claude-zen/foundation EventEmitter instead",
	winston: "Use @claude-zen/foundation getLogger instead",
	pino: "Use @claude-zen/foundation getLogger instead",
	nanoid: "Use @claude-zen/foundation generateNanoId instead",
	uuid: "Use @claude-zen/foundation generateUUID instead",
	"date-fns": "Use @claude-zen/foundation date utilities instead",
	zod: "Use @claude-zen/foundation validation instead",
	commander: "Use @claude-zen/foundation Command instead",
	awilix: "Use @claude-zen/foundation DI instead",
	neverthrow: "Use @claude-zen/foundation Result instead",
	envalid: "Use @claude-zen/foundation env validation instead",
	dotenv: "Use @claude-zen/foundation getConfig instead",
	eventemitter3: "Use @claude-zen/foundation EventEmitter instead",
	mitt: "Use @claude-zen/foundation EventEmitter instead",
	axios: "Use native fetch or foundation HTTP utilities",
	"node-fetch": "Use native fetch",
	"cross-fetch": "Use native fetch",
	"isomorphic-fetch": "Use native fetch",
	chalk: "Use @claude-zen/foundation structured logging instead",
	kleur: "Use @claude-zen/foundation structured logging instead",
	colors: "Use @claude-zen/foundation structured logging instead",
	"p-timeout": "Use @claude-zen/foundation withTimeout instead",
	"p-retry": "Use @claude-zen/foundation withRetry instead",
	"p-queue": "Use @claude-zen/foundation async utilities instead",
	"p-limit": "Use @claude-zen/foundation async utilities instead",
	inversify: "Use @claude-zen/foundation DI instead",
	tsyringe: "Use @claude-zen/foundation DI instead",
	"fp-ts": "Use @claude-zen/foundation Result pattern instead",
	rxjs: "Use @claude-zen/foundation EventEmitter or native Promises",
	"cross-env": "Use @claude-zen/foundation env utilities instead",
	"env-var": "Use @claude-zen/foundation env utilities instead",
};

// Packages that are allowed to have these dependencies
const ALLOWED_PACKAGES = [
	"packages/public-api/core/foundation", // Foundation can have these dependencies
	"apps/claude-code-zen-server", // Main apps can have some direct dependencies if needed
	"scripts", // Scripts can have utility dependencies
];

let violations = 0;

/**
 * Check if package should be skipped
 */
function shouldSkip(packagePath) {
	const relativePath = relative(projectRoot, packagePath);
	return ALLOWED_PACKAGES.some((allowed) => relativePath.includes(allowed));
}

/**
 * Find all package.json files
 */
function findPackageJsonFiles(dir, files = []) {
	try {
		const entries = readdirSync(dir);

		for (const entry of entries) {
			const fullPath = join(dir, entry);

			// Skip node_modules and other build directories
			if (
				entry === "node_modules" ||
				entry === "dist" ||
				entry === ".git" ||
				entry === "coverage"
			) {
				continue;
			}

			const stats = statSync(fullPath);

			if (stats.isDirectory()) {
				findPackageJsonFiles(fullPath, files);
			} else if (entry === "package.json") {
				files.push(fullPath);
			}
		}
	} catch (_error) {
		// Skip inaccessible directories
	}

	return files;
}

/**
 * Check package.json for forbidden dependencies
 */
function checkPackageJson(packagePath) {
	if (shouldSkip(packagePath)) {
		return; // Skip allowed packages
	}

	try {
		const content = readFileSync(packagePath, "utf8");
		const packageJson = JSON.parse(content);
		const relativePath = relative(projectRoot, packagePath);

		// Check both dependencies and devDependencies
		const depTypes = [
			"dependencies",
			"devDependencies",
			"peerDependencies",
			"optionalDependencies",
		];

		for (const depType of depTypes) {
			const deps = packageJson[depType];
			if (!deps) continue;

			for (const [depName, version] of Object.entries(deps)) {
				if (FORBIDDEN_DEPENDENCIES[depName]) {
					logger.error(`❌ ${relativePath}`);
					logger.error(`   Forbidden ${depType}: ${depName}@${version}`);
					logger.error(`   ${FORBIDDEN_DEPENDENCIES[depName]}`);
					logger.error("");
					violations++;
				}
			}
		}

		// Also check if the package is missing @claude-zen/foundation dependency
		// (but doesn't have any forbidden deps, suggesting they should add foundation)
		const hasForbiddenDeps = depTypes.some((depType) => {
			const deps = packageJson[depType];
			return (
				deps && Object.keys(deps).some((dep) => FORBIDDEN_DEPENDENCIES[dep])
			);
		});

		const hasFoundation = depTypes.some((depType) => {
			const deps = packageJson[depType];
			return deps?.["@claude-zen/foundation"];
		});

		if (hasForbiddenDeps && !hasFoundation) {
			logger.warn(`⚠️  ${relativePath}`);
			logger.warn(`   Consider adding @claude-zen/foundation as a dependency`);
			logger.warn("");
		}
	} catch (error) {
		logger.warn(
			`⚠️ Could not read package.json: ${packagePath} - ${error.message}`,
		);
	}
}

/**
 * Main validation function
 */
function validateDependencies() {
	logger.info(
		"🔍 Validating package.json dependencies for foundation compliance...\n",
	);

	const packageFiles = findPackageJsonFiles(projectRoot);

	logger.info(`Found ${packageFiles.length} package.json files to check\n`);

	for (const file of packageFiles) {
		checkPackageJson(file);
	}

	if (violations === 0) {
		logger.info(
			"✅ All package.json files are compliant with foundation requirements!",
		);
		return true;
	} else {
		logger.error(`❌ Found ${violations} forbidden dependency/dependencies`);
		logger.error(
			"\n💡 Add @claude-zen/foundation instead of direct utility dependencies",
		);
		logger.error(
			"💡 Remove forbidden dependencies and use foundation equivalents",
		);
		return false;
	}
}

// Run validation
const isValid = validateDependencies();
process.exit(isValid ? 0 : 1);
