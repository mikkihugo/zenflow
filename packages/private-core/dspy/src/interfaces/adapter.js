/**
 * @fileoverview DSPy Adapter Interface - Production Grade
 *
 * Core adapter interface for formatting data for different use cases.
 * 100% compatible with Stanford DSPy's adapter system.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 */
/**
 * Base adapter class with common functionality
 */
export class BaseAdapter {
	config;
	constructor(config = {}) {
		this.config = { ...config };
	}
	/**
	 * Get adapter configuration
	 */
	getConfig() {
		return { ...this.config };
	}
	/**
	 * Format demonstration examples into text
	 */
	formatDemos(demos, signature) {
		if (!demos || demos.length === 0) {
			return "";
		}
		const formattedDemos = demos
			.map((demo) => {
				const inputs = this.extractInputs(demo, signature);
				const outputs = this.extractOutputs(demo, signature);
				return this.formatExample(inputs, outputs);
			})
			.join("\n\n");
		return formattedDemos;
	}
	/**
	 * Extract input fields from example based on signature
	 */
	extractInputs(example, signature) {
		const inputs = {};
		if (signature.inputs) {
			for (const [key, _spec] of Object.entries(signature.inputs)) {
				if (example.has(key)) {
					inputs[key] = example.get(key);
				}
			}
		} else {
			// If no input specification, try common input fields
			const commonInputs = ["question", "query", "input", "text", "prompt"];
			for (const field of commonInputs) {
				if (example.has(field)) {
					inputs[field] = example.get(field);
				}
			}
		}
		return inputs;
	}
	/**
	 * Extract output fields from example based on signature
	 */
	extractOutputs(example, signature) {
		const outputs = {};
		if (signature.outputs) {
			for (const [key, _spec] of Object.entries(signature.outputs)) {
				if (example.has(key)) {
					outputs[key] = example.get(key);
				}
			}
		} else {
			// If no output specification, try common output fields
			const commonOutputs = [
				"answer",
				"response",
				"output",
				"result",
				"completion",
			];
			for (const field of commonOutputs) {
				if (example.has(field)) {
					outputs[field] = example.get(field);
				}
			}
		}
		return outputs;
	}
	/**
	 * Format a single example (input/output pair)
	 */
	formatExample(inputs, outputs) {
		const inputParts = Object.entries(inputs).map(
			([key, value]) => `${key}: ${value}`,
		);
		const outputParts = Object.entries(outputs).map(
			([key, value]) => `${key}: ${value}`,
		);
		return `Input: ${inputParts.join(", ")}\nOutput: ${outputParts.join(", ")}`;
	}
	/**
	 * Create system message from signature instructions
	 */
	createSystemMessage(signature) {
		const instructions =
			signature.instructions || "Follow the examples and complete the task.";
		let message = instructions;
		// Add input/output field descriptions if available
		if (signature.inputs || signature.outputs) {
			message += "\n\nFields:";
			if (signature.inputs) {
				message += "\nInputs:";
				for (const [key, _spec] of Object.entries(signature.inputs)) {
					message += `\n- ${key}: ${_spec.description || "No description"}`;
				}
			}
			if (signature.outputs) {
				message += "\nOutputs:";
				for (const [key, spec] of Object.entries(signature.outputs)) {
					message += `\n- ${key}: ${spec.description || "No description"}`;
				}
			}
		}
		return message;
	}
	/**
	 * Validate adapter input data
	 */
	validateInput(data, requiredFields) {
		for (const field of requiredFields) {
			if (!(field in data) || data[field] === undefined) {
				throw new Error(`Missing required field: ${field}`);
			}
		}
	}
}
