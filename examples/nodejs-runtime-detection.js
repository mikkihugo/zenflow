#!/usr/bin/env node

/**
 * 🚀 Node.js Runtime Hardware Detection Example
 *
 * Shows how claude-zen-neural-ml automatically detects optimal
 * hardware capabilities when running in Node.js environment.
 */

const { spawn } = require("node:child_process");
const _fs = require("node:fs");
const _path = require("node:path");

// Detect hardware in pure JavaScript (before loading WASM)
function detectNodeJSHardware() {
	console.log("🔍 Node.js Environment Detection:");
	console.log(`   Platform: ${process.platform}`);
	console.log(`   Architecture: ${process.arch}`);
	console.log(`   CPU Cores: ${require("node:os").cpus().length}`);
	console.log(
		`   Total Memory: ${Math.round(require("node:os").totalmem() / 1024 / 1024 / 1024)}GB`,
	);
	console.log(`   Node.js Version: ${process.version}`);

	// Detect Apple Silicon
	const isAppleSilicon =
		process.platform === "darwin" && process.arch === "arm64";
	if (isAppleSilicon) {
		console.log(
			"   🍎 Apple Silicon detected - will enable Metal acceleration",
		);
	}

	// Detect NVIDIA CUDA
	try {
		const { execSync } = require("node:child_process");
		execSync("nvidia-smi", { stdio: "ignore" });
		console.log("   🟢 NVIDIA CUDA available");
	} catch {
		console.log("   🔴 NVIDIA CUDA not available");
	}

	// Detect GPU libraries
	const gpuLibraries = [
		"@tensorflow/tfjs-node-gpu",
		"cuda-toolkit",
		"@gpu.js/gpu",
		"vulkan-validation-layers",
	];

	gpuLibraries.forEach((lib) => {
		try {
			require.resolve(lib);
			console.log(`   ✅ ${lib} available`);
		} catch {
			console.log(`   ❌ ${lib} not installed`);
		}
	});
}

// Build and load WASM with runtime detection
async function loadNeuralMLWithDetection() {
	console.log("\n🏗️  Building neural-ml with runtime detection...");

	const neuralMLPath = "packages/private-core/neural-ml/neural-core";

	// Build WASM with Node.js target
	const buildProcess = spawn(
		"cargo",
		[
			"build",
			"--target",
			"wasm32-unknown-unknown",
			"--release",
			"--features",
			"wasm,runtime-detection",
		],
		{
			cwd: neuralMLPath,
			stdio: "pipe",
		},
	);

	let _buildOutput = "";
	buildProcess.stdout.on("data", (data) => {
		_buildOutput += data.toString();
	});

	buildProcess.stderr.on("data", (data) => {
		const output = data.toString();
		if (
			output.includes("AUTO-ENABLED") ||
			output.includes("FULL AUTO DETECTION")
		) {
			console.log(`   ${output.trim()}`);
		}
	});

	return new Promise((resolve, reject) => {
		buildProcess.on("close", (code) => {
			if (code === 0) {
				console.log("   ✅ WASM build complete with runtime detection");
				resolve();
			} else {
				console.log(`   ❌ Build failed with code ${code}`);
				reject(new Error(`Build failed: ${code}`));
			}
		});
	});
}

// Simulate WASM loading with detected capabilities
function simulateWASMRuntimeDetection() {
	console.log("\n🧠 Simulating WASM Runtime Detection:");

	const capabilities = {
		platform: "NodeJS",
		architecture: process.arch === "x64" ? "X86_64" : "ARM64",
		cpuCores: require("node:os").cpus().length,
		hasSimd: process.arch === "x64" || process.arch === "arm64",
		hasGpu: process.platform === "darwin" && process.arch === "arm64",
		hasMetal: process.platform === "darwin" && process.arch === "arm64",
		hasCuda: false, // Would be detected via nvidia-smi
		isAppleSilicon: process.platform === "darwin" && process.arch === "arm64",
	};

	// Determine optimization level
	let optimizationLevel;
	if (capabilities.isAppleSilicon) {
		optimizationLevel = "Maximum";
	} else if (capabilities.cpuCores >= 8 && capabilities.hasGpu) {
		optimizationLevel = "High";
	} else if (capabilities.cpuCores >= 4) {
		optimizationLevel = "Medium";
	} else {
		optimizationLevel = "Minimal";
	}

	console.log("   Detected capabilities:");
	Object.entries(capabilities).forEach(([key, value]) => {
		const icon = value === true ? "✅" : value === false ? "❌" : "📊";
		console.log(`     ${icon} ${key}: ${value}`);
	});

	console.log(`   🎯 Optimization Level: ${optimizationLevel}`);

	// Determine optimal features
	const features = ["std"];

	if (capabilities.platform === "NodeJS") {
		features.push("async");

		if (capabilities.hasSimd) features.push("simd-acceleration");
		if (capabilities.hasGpu) features.push("gpu");
		if (capabilities.hasMetal) features.push("apple-acceleration");
		if (capabilities.hasCuda) features.push("cuda-support");

		if (optimizationLevel === "Maximum" || optimizationLevel === "High") {
			features.push(
				...[
					"ml-optimization",
					"bayesian-optimization",
					"dspy-ml",
					"production",
				],
			);
		} else if (optimizationLevel === "Medium") {
			features.push(...["ml-optimization", "statistical-analysis"]);
		}
	}

	console.log(`   🚀 Auto-enabled features: ${features.join(", ")}`);

	return { capabilities, optimizationLevel, features };
}

// Main execution
async function main() {
	console.log("🚀 Claude-Zen Neural ML: Node.js Runtime Detection Demo\n");

	// Step 1: Pure Node.js detection
	detectNodeJSHardware();

	// Step 2: Build WASM with detection
	try {
		await loadNeuralMLWithDetection();
	} catch (_error) {
		console.log("   ⚠️  WASM build skipped (continuing with simulation)");
	}

	// Step 3: Simulate runtime detection
	const detection = simulateWASMRuntimeDetection();

	// Step 4: Show results
	console.log("\n📊 Summary:");
	console.log(`   The neural-ml library will automatically:`);
	console.log(
		`   • Detect this as a ${detection.capabilities.platform} environment`,
	);
	console.log(
		`   • Enable ${detection.optimizationLevel.toLowerCase()} optimization level`,
	);
	console.log(
		`   • Use ${detection.features.length} optimal features for your hardware`,
	);
	console.log(`   • Provide best performance without manual configuration`);

	console.log(
		"\n✅ Runtime detection ensures optimal performance on ANY hardware!",
	);
}

if (require.main === module) {
	main().catch(console.error);
}
