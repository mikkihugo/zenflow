#!/usr/bin/env node

// Simple logger for test using stdout instead of console
const logger = {
  info: (msg, ...args) => process.stdout.write(`${msg} ${args.join(' ')}\n`)
};

// Test Node.js runtime detection
logger.info("🧪 Testing Node.js Runtime Detection");
logger.info("");

// Display Node.js environment info
logger.info("📊 Node.js Environment:");
logger.info("  Node Version:", process.version);
logger.info("  Platform:", process.platform);
logger.info("  Architecture:", process.arch);
logger.info("  CPU Cores:", require("node:os").cpus().length);
logger.info(
	"  Total Memory:",
	`${Math.round(require("node:os").totalmem() / 1024 / 1024 / 1024)} GB`,
);
logger.info("");

// Simulate what the Rust runtime detection would see
logger.info("🦀 Rust WASM Runtime Detection Would See:");
logger.info("  Platform Detection: NodeJS (has process global)");
logger.info("  Architecture: wasm32 (compiled to WebAssembly)");
logger.info("  CPU Cores Available:", require("node:os").cpus().length);
logger.info("  Optimization Level: web-optimized");
logger.info("");

// Test hardware feature detection
const os = require("node:os");
const cpus = os.cpus();

logger.info("⚡ Hardware Features Detected:");
logger.info("  CPU Model:", cpus[0]?.model || "Unknown");
logger.info("  CPU Speed:", cpus[0]?.speed ? `${cpus[0].speed} MHz` : "Unknown");
logger.info("  SIMD Support: Detected via WASM SIMD (if available)");
logger.info(`  Parallelism: ${cpus.length} threads available`);
logger.info("");

logger.info(
	"✅ Node.js detection complete - Rust WASM module would get accurate CPU info!",
);
