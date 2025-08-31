#!/usr/bin/env node

/**
 * Centralized Rust Build Script
 * Builds all Rust projects in the workspace with proper coordination
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

logger.info(" Building All Rust Projects...\n");

// Find all Cargo.toml files
const cargoProjects = [];
try {
	const result = execSync(
		'find . -name "Cargo.toml" -not -path "*/node_modules/*" -not -path "*/target/*"',
		{
			encoding: "utf8",
		},
	);
	cargoProjects.push(...result.trim().split("\n").filter(Boolean));
} catch (_error) {
	logger.info(" No Rust projects found or find command failed");
	process.exit(0);
}

if (cargoProjects.length === 0) {
	logger.info(" No Cargo.toml files found");
	process.exit(0);
}

logger.info(` Found ${cargoProjects.length} Rust projects:`);
cargoProjects.forEach((project) => logger.info(`    ${project}`));
logger.info("");

let successCount = 0;
let failureCount = 0;
const failures = [];

// Build each Rust project
for (const cargoPath of cargoProjects) {
	const projectDir = path.dirname(cargoPath);
	const projectName = path.basename(projectDir);

	logger.info(` Building ${projectName} (${projectDir})...`);

	try {
		// Check if it's a WASM project
		const isWasmProject =
			cargoPath.includes("wasm") ||
			existsSync(path.join(projectDir, ".cargo", "config.toml"));

		if (isWasmProject) {
			logger.info(`    WASM project detected, using wasm-pack...`);
			try {
				execSync(
					"wasm-pack build --target web --out-dir ../../wasm --scope claude-zen",
					{
						cwd: projectDir,
						stdio: "pipe",
					},
				);
				logger.info(`    ${projectName} WASM build completed`);
			} catch (_wasmError) {
				// Fallback to regular cargo build
				logger.info(`    wasm-pack failed, trying cargo build...`);
				execSync("cargo build --release", {
					cwd: projectDir,
					stdio: "pipe",
				});
				logger.info(`    ${projectName} cargo build completed`);
			}
		} else {
			// Regular Rust project
			execSync("cargo build --release", {
				cwd: projectDir,
				stdio: "pipe",
			});
			logger.info(`    ${projectName} build completed`);
		}

		successCount++;
	} catch (error) {
		logger.info(`    ${projectName} build failed:`);
		logger.info(`    Error: ${error.message.split("\n")[0]}`);
		failureCount++;
		failures.push({ project: projectName, error: error.message });
	}

	logger.info("");
}

// Summary
logger.info(" Rust Build Summary");
logger.info("═".repeat(50));
logger.info(` Successful builds: ${successCount}`);
logger.info(` Failed builds: ${failureCount}`);
logger.info(` Total projects: ${cargoProjects.length}`);

if (failures.length > 0) {
	logger.info("\n Build Failures:");
	failures.forEach(({ project, error }) => {
		logger.info(`   • ${project}: ${error.split("\n")[0]}`);
	});
}

if (successCount > 0) {
	logger.info("\n Rust builds completed!");

	// Show where artifacts are located
	logger.info("\n Build artifacts located in:");
	cargoProjects.forEach((cargoPath) => {
		const projectDir = path.dirname(cargoPath);
		const targetDir = path.join(projectDir, "target/release");
		if (existsSync(targetDir)) {
			logger.info(`    ${targetDir}`);
		}
	});
}

// Exit with appropriate code
process.exit(failureCount > 0 ? 1 : 0);
