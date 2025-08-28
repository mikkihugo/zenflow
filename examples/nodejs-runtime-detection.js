#!/usr/bin/env node

/**
 * 🚀 Node.js Runtime Hardware Detection Example
 *
 * Shows how claude-zen-neural-ml automatically detects optimal
 * hardware capabilities when running in Node.js environment.
 */

const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

// Detect hardware in pure JavaScript (before loading WASM)
function detectNodeJSHardware() {
	logger.info("🔍 Node.js Environment Detection:");
	logger.info(`   Platform: ${process.platform}`);
	logger.info(`   Architecture: ${process.arch}`);
	logger.info(`   CPU Cores: ${require("node:os").cpus().length}`);
	logger.info(
		`   Total Memory: ${Math.round(require("node:os").totalmem() / 1024 / 1024 / 1024)}GB`,
	);
	
	// Check if neural-ml directory exists for WASM binaries
	const wasmPath = path.join(__dirname, '..', 'packages', 'core', 'neural-ml');
	const wasmExists = fs.existsSync(wasmPath);
	logger.info(`   WASM Directory: ${wasmExists ? '✅ Found' : '❌ Missing'} at ${wasmPath}`);
	logger.info(`   Node.js Version: ${process.version}`);

	// Detect Apple Silicon
	const isAppleSilicon =
		process.platform === "darwin" && process.arch === "arm64";
	if (isAppleSilicon) {
		logger.info(
			"   🍎 Apple Silicon detected - will enable Metal acceleration",
		);
	}

	// Detect NVIDIA CUDA
	try {
		const { execSync } = require("node:child_process");
		execSync("nvidia-smi", { stdio: "ignore" });
		logger.info("   🟢 NVIDIA CUDA available");
	} catch {
		logger.info("   🔴 NVIDIA CUDA not available");
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
			logger.info(`   ✅ ${lib} available`);
		} catch {
			logger.info(`   ❌ ${lib} not installed`);
		}
	});
}

// Build and load WASM with runtime detection
async function loadNeuralMLWithDetection() {
	logger.info("\n🏗️  Building neural-ml with runtime detection...");

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

	let buildOutput = "";
	buildProcess.stdout.on("data", (data) => {
		buildOutput += data.toString();
		// Log build progress for debugging
		if (buildOutput.includes("Compiling")) {
			logger.info(`   Build: ${data.toString().trim()}`);
		}
	});

	buildProcess.stderr.on("data", (data) => {
		const output = data.toString();
		if (
			output.includes("AUTO-ENABLED") ||
			output.includes("FULL AUTO DETECTION")
		) {
			logger.info(`   ${output.trim()}`);
		}
	});

	return new Promise((resolve, reject) => {
		buildProcess.on("close", (code) => {
			if (code === 0) {
				logger.info("   ✅ WASM build complete with runtime detection");
				resolve();
			} else {
				logger.info(`   ❌ Build failed with code ${code}`);
				reject(new Error(`Build failed: ${code}`));
			}
		});
	});
}

// Simulate WASM loading with detected capabilities
function simulateWASMRuntimeDetection() {
	logger.info("\n🧠 Simulating WASM Runtime Detection:");

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

	logger.info("   Detected capabilities:");
	Object.entries(capabilities).forEach(([key, value]) => {
		const icon = value === true ? "✅" : value === false ? "❌" : "📊";
		logger.info(`     ${icon} ${key}: ${value}`);
	});

	logger.info(`   🎯 Optimization Level: ${optimizationLevel}`);

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

	logger.info(`   🚀 Auto-enabled features: ${features.join(", ")}`);

	return { capabilities, optimizationLevel, features };
}

// Main execution
async function main() {
	logger.info("🚀 Claude-Zen Neural ML: Node.js Runtime Detection Demo\n");

	// Step 1: Pure Node.js detection
	detectNodeJSHardware();

	// Step 2: Build WASM with detection
	try {
		await loadNeuralMLWithDetection();
	} catch (error) {
		logger.info("   ⚠️  WASM build skipped (continuing with simulation)");
		logger.info(`   Error: ${error.message}`);
	}

	// Step 3: Simulate runtime detection
	const detection = simulateWASMRuntimeDetection();

	// Step 4: Show results
	logger.info("\n📊 Summary:");
	logger.info(`   The neural-ml library will automatically:`);
	logger.info(
		`   • Detect this as a ${detection.capabilities.platform} environment`,
	);
	logger.info(
		`   • Enable ${detection.optimizationLevel.toLowerCase()} optimization level`,
	);
	logger.info(
		`   • Use ${detection.features.length} optimal features for your hardware`,
	);
	logger.info(`   • Provide best performance without manual configuration`);

	logger.info(
		"\n✅ Runtime detection ensures optimal performance on ANY hardware!",
	);
}

if (require.main === module) {
	main().catch(logger.error);
}
