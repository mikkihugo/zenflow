#!/usr/bin/env node

/**
 * Centralized Rust Build Script
 * Builds all Rust projects in the workspace with proper coordination
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

console.log("🦀 Building All Rust Projects...\n");

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
	console.log("⚠️ No Rust projects found or find command failed");
	process.exit(0);
}

if (cargoProjects.length === 0) {
	console.log("⚠️ No Cargo.toml files found");
	process.exit(0);
}

console.log(`📦 Found ${cargoProjects.length} Rust projects:`);
cargoProjects.forEach((project) => console.log(`   📄 ${project}`));
console.log("");

let successCount = 0;
let failureCount = 0;
const failures = [];

// Build each Rust project
for (const cargoPath of cargoProjects) {
	const projectDir = path.dirname(cargoPath);
	const projectName = path.basename(projectDir);

	console.log(`🔧 Building ${projectName} (${projectDir})...`);

	try {
		// Check if it's a WASM project
		const isWasmProject =
			cargoPath.includes("wasm") ||
			existsSync(path.join(projectDir, ".cargo", "config.toml"));

		if (isWasmProject) {
			console.log(`   🌐 WASM project detected, using wasm-pack...`);
			try {
				execSync(
					"wasm-pack build --target web --out-dir ../../wasm --scope claude-zen",
					{
						cwd: projectDir,
						stdio: "pipe",
					},
				);
				console.log(`   ✅ ${projectName} WASM build completed`);
			} catch (_wasmError) {
				// Fallback to regular cargo build
				console.log(`   ⚠️ wasm-pack failed, trying cargo build...`);
				execSync("cargo build --release", {
					cwd: projectDir,
					stdio: "pipe",
				});
				console.log(`   ✅ ${projectName} cargo build completed`);
			}
		} else {
			// Regular Rust project
			execSync("cargo build --release", {
				cwd: projectDir,
				stdio: "pipe",
			});
			console.log(`   ✅ ${projectName} build completed`);
		}

		successCount++;
	} catch (error) {
		console.log(`   ❌ ${projectName} build failed:`);
		console.log(`   📄 Error: ${error.message.split("\n")[0]}`);
		failureCount++;
		failures.push({ project: projectName, error: error.message });
	}

	console.log("");
}

// Summary
console.log("🦀 Rust Build Summary");
console.log("═".repeat(50));
console.log(`✅ Successful builds: ${successCount}`);
console.log(`❌ Failed builds: ${failureCount}`);
console.log(`📊 Total projects: ${cargoProjects.length}`);

if (failures.length > 0) {
	console.log("\n❌ Build Failures:");
	failures.forEach(({ project, error }) => {
		console.log(`   • ${project}: ${error.split("\n")[0]}`);
	});
}

if (successCount > 0) {
	console.log("\n🎉 Rust builds completed!");

	// Show where artifacts are located
	console.log("\n📁 Build artifacts located in:");
	cargoProjects.forEach((cargoPath) => {
		const projectDir = path.dirname(cargoPath);
		const targetDir = path.join(projectDir, "target/release");
		if (existsSync(targetDir)) {
			console.log(`   📦 ${targetDir}`);
		}
	});
}

// Exit with appropriate code
process.exit(failureCount > 0 ? 1 : 0);
