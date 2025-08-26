/**
 * Neural Types - Barrel Export.
 *
 * Central export point for all neural system types and utilities.
 */
const __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? (o, m, k, k2) => {
				if (k2 === undefined) k2 = k;
				let desc = Object.getOwnPropertyDescriptor(m, k);
				if (
					!desc ||
					("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
				) {
					desc = {
						enumerable: true,
						get: () => m[k],
					};
				}
				Object.defineProperty(o, k2, desc);
			}
		: (o, m, k, k2) => {
				if (k2 === undefined) k2 = k;
				o[k2] = m[k];
			});
const __exportStar =
	(this && this.__exportStar) ||
	((m, exports) => {
		for (const p in m)
			if (p !== "default" && !Object.hasOwn(exports, p))
				__createBinding(exports, m, p);
	});
Object.defineProperty(exports, "__esModule", { value: true });
// DSPy types - optional import to avoid circular dependencies
try {
	const dspy = require("@claude-zen/dspy");
	// Export types only if dspy is available
	if (dspy) {
		module.exports.DSPyExample = dspy.Example;
		module.exports.DSPyPrediction = dspy.Prediction;
		module.exports.DSPyModule = dspy.DSPyModule;
	}
} catch {
	// DSPy not available - provide fallback types
}
// Note: Signature and Teleprompter types will be enabled when those modules are ready
// Main neural types from comprehensive types.ts
__exportStar(require("../types"), exports);
