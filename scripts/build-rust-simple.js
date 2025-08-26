#!/usr/bin/env node

/**
 * Simple Rust Build Script
 * Builds Rust projects with smart skipping of heavy dependencies
 */

import { execSync } from "node:child_process";
import path from "node:path";

console.log("🦀 Building Rust Projects (Smart Mode)...\n");

// Known problematic packages to skip or build differently
const HEAVY_PACKAGES = [
	"neural-core",
	"claude-zen-neural-core",
	"claude-zen-neural-models",
	"claude-zen-neural-training",
];

const SKIP_PACKAGES = [
	// Add any packages that consistently fail
];

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
	console.log("⚠️ No Rust projects found");
	process.exit(0);
}

console.log(`📦 Found ${cargoProjects.length} Rust projects`);
console.log("");

let successCount = 0;
let skippedCount = 0;
let failureCount = 0;

// Build each project with smart handling
for (const cargoPath of cargoProjects) {
	const projectDir = path.dirname(cargoPath);
	const projectName = path.basename(projectDir);

	// Check if should skip
	if (SKIP_PACKAGES.includes(projectName)) {
		console.log(`⏭️ Skipping ${projectName} (known issues)`);
		skippedCount++;
		continue;
	}

	console.log(`🔧 Building ${projectName}...`);

	try {
		// Heavy packages: build with minimal features
		if (HEAVY_PACKAGES.includes(projectName)) {
			console.log(`   📦 Heavy package detected, using minimal build...`);
			execSync("cargo build --release --no-default-features --features std", {
				cwd: projectDir,
				stdio: "inherit",
				timeout: 120000, // 2 minute timeout
			});
		}
		// WASM packages: try wasm-pack first
		else if (cargoPath.includes("wasm") || projectName.includes("wasm")) {
			console.log(`   🌐 WASM package, trying wasm-pack...`);
			try {
				execSync(
					"wasm-pack build --target web --out-dir ./pkg --scope claude-zen --dev",
					{
						cwd: projectDir,
						stdio: "inherit",
						timeout: 60000,
					},
				);
			} catch (_wasmError) {
				console.log(`   ⚠️ wasm-pack failed, trying cargo build...`);
				execSync("cargo build --release", {
					cwd: projectDir,
					stdio: "inherit",
					timeout: 60000,
				});
			}
		}
		// Regular packages: standard build
		else {
			execSync("cargo build --release", {
				cwd: projectDir,
				stdio: "inherit",
				timeout: 60000, // 1 minute timeout
			});
		}

		console.log(`   ✅ ${projectName} built successfully\n`);
		successCount++;
	} catch (error) {
		console.log(
			`   ❌ ${projectName} failed: ${error.message.split("\n")[0]}\n`,
		);
		failureCount++;
	}
}

// Summary
console.log("🦀 Rust Build Summary");
console.log("═".repeat(40));
console.log(`✅ Successful: ${successCount}`);
console.log(`❌ Failed: ${failureCount}`);
console.log(`⏭️ Skipped: ${skippedCount}`);
console.log(`📊 Total: ${cargoProjects.length}`);

if (successCount > 0) {
	console.log("\n🎉 Some Rust builds completed successfully!");
} else if (failureCount === cargoProjects.length) {
	console.log("\n💔 All builds failed");
	process.exit(1);
}

process.exit(0);
