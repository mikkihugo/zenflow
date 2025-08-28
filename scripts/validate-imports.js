#!/usr/bin/env node

/**
 * Import Validation Script - Foundation Enforcement
 *
 * Prevents direct imports of libraries that should be used through @claude-zen/foundation
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Define forbidden imports that should use foundation instead
const FORBIDDEN_IMPORTS = {
	lodash: 'Use: import { _, lodash } from "@claude-zen/foundation"',
	events: 'Use: import { EventEmitter } from "@claude-zen/foundation"',
	winston: 'Use: import { getLogger } from "@claude-zen/foundation"',
	pino: 'Use: import { getLogger } from "@claude-zen/foundation"',
	nanoid: 'Use: import { generateNanoId } from "@claude-zen/foundation"',
	uuid: 'Use: import { generateUUID } from "@claude-zen/foundation"',
	"date-fns":
		'Use: import { dateFns, format, addDays } from "@claude-zen/foundation"',
	zod: 'Use: import { z, validateInput } from "@claude-zen/foundation"',
	commander: 'Use: import { Command, program } from "@claude-zen/foundation"',
	awilix:
		'Use: import { createContainer, inject } from "@claude-zen/foundation"',
	neverthrow: 'Use: import { Result, ok, err } from "@claude-zen/foundation"',
	envalid: 'Use: import { str, num, bool } from "@claude-zen/foundation"',
	dotenv: 'Use: import { getConfig } from "@claude-zen/foundation"',
};

// Files/directories to skip
const SKIP_PATTERNS = [
	"node_modules",
	"dist",
	".git",
	"coverage",
	"build",
	"packages/public-api/core/foundation", // Allow foundation to import these directly
	"scripts/validate-imports.js", // Allow this script itself
	"scripts/validate-dependencies.js", // Allow validation scripts
];

let violations = 0;

/**
 * Check if path should be skipped
 */
function shouldSkip(filePath) {
	const relativePath = relative(projectRoot, filePath);
	return SKIP_PATTERNS.some((pattern) => relativePath.includes(pattern));
}

/**
 * Find TypeScript and JavaScript files recursively
 */
function findSourceFiles(dir, files = []) {
	if (shouldSkip(dir)) return files;

	try {
		const entries = readdirSync(dir);

		for (const entry of entries) {
			const fullPath = join(dir, entry);

			if (shouldSkip(fullPath)) continue;

			const stats = statSync(fullPath);

			if (stats.isDirectory()) {
				findSourceFiles(fullPath, files);
			} else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
				files.push(fullPath);
			}
		}
	} catch (_error) {
		// Skip inaccessible directories
	}

	return files;
}

/**
 * Check file for forbidden imports
 */
function checkFile(filePath) {
	try {
		const content = readFileSync(filePath, "utf8");
		const lines = content.split("\n");
		const relativePath = relative(projectRoot, filePath);

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			// Check for import statements
			const importMatch = line.match(/^import.*from\s+['"]([\w-/]+)['"];?/);
			if (importMatch) {
				const importedModule = importMatch[1];

				// Check if this is a forbidden import
				if (FORBIDDEN_IMPORTS[importedModule]) {
					logger.error(`❌ ${relativePath}:${i + 1}`);
					logger.error(`   Direct import: ${importedModule}`);
					logger.error(`   ${FORBIDDEN_IMPORTS[importedModule]}`);
					logger.error("");
					violations++;
				}
			}

			// Also check require statements
			const requireMatch = line.match(/require\(['"]([\w-/]+)['"]\)/);
			if (requireMatch) {
				const requiredModule = requireMatch[1];

				if (FORBIDDEN_IMPORTS[requiredModule]) {
					logger.error(`❌ ${relativePath}:${i + 1}`);
					logger.error(`   Direct require: ${requiredModule}`);
					logger.error(`   ${FORBIDDEN_IMPORTS[requiredModule]}`);
					logger.error("");
					violations++;
				}
			}
		}
	} catch (_error) {
		logger.warn(`⚠️ Could not read file: ${filePath}`);
	}
}

/**
 * Main validation function
 */
function validateImports() {
	logger.info("🔍 Validating imports for foundation compliance...\n");

	const sourceFiles = findSourceFiles(projectRoot);

	logger.info(`Found ${sourceFiles.length} source files to check\n`);

	for (const file of sourceFiles) {
		checkFile(file);
	}

	if (violations === 0) {
		logger.info("✅ All imports are compliant with foundation requirements!");
		return true;
	} else {
		logger.error(`❌ Found ${violations} forbidden import(s)`);
		logger.error(
			"\n💡 Use @claude-zen/foundation for centralized utilities instead of direct imports",
		);
		return false;
	}
}

// Run validation
const isValid = validateImports();
process.exit(isValid ? 0 : 1);
