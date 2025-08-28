#!/usr/bin/env node

     
    // eslint-disable-next-line no-console
console.log("🧠 Testing Brain Orchestrator...");

try {
	const { BrainCoordinator } = await import("./dist/main.js");

     
    // eslint-disable-next-line no-console
	console.log("✅ BrainCoordinator imported successfully");

	const brain = new BrainCoordinator();
	await brain.initialize();

     
    // eslint-disable-next-line no-console
	console.log("✅ Brain initialized");

	// Simple prediction test
	const result = await brain.predict([0.1, 0.2, 0.3]);
     
    // eslint-disable-next-line no-console
	console.log("📊 Prediction result:", result);

     
    // eslint-disable-next-line no-console
	console.log("✅ Brain orchestrator test completed!");
} catch (error) {
     
    // eslint-disable-next-line no-console
	console.error("❌ Test failed:", error);
	process.exit(1);
}
