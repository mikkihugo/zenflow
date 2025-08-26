/**
 * Neural Network Presets Index.
 * Collection of predefined neural network configurations.
 */
/**
 * @file Presets module exports.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEURAL_PRESETS = void 0;
exports.getPreset = getPreset;
exports.getRecommendedPreset = getRecommendedPreset;
exports.searchPresetsByUseCase = searchPresetsByUseCase;
exports.getCategoryPresets = getCategoryPresets;
exports.validatePresetConfig = validatePresetConfig;
exports.NEURAL_PRESETS = {
	// Basic presets
	BASIC_CLASSIFIER: {
		id: "basic_classifier",
		name: "Basic Classification Network",
		type: "classification",
		architecture: "feedforward",
		layers: [128, 64, 32],
		activation: "relu",
		outputActivation: "softmax",
		learningRate: 0.001,
		batchSize: 32,
		useCase: ["image_classification", "text_classification"],
	},
	REGRESSION_MODEL: {
		id: "regression_model",
		name: "Regression Network",
		type: "regression",
		architecture: "feedforward",
		layers: [64, 32, 16],
		activation: "relu",
		outputActivation: "linear",
		learningRate: 0.001,
		batchSize: 32,
		useCase: ["price_prediction", "value_estimation"],
	},
	// Advanced presets
	DEEP_LEARNING: {
		id: "deep_learning",
		name: "Deep Learning Network",
		type: "deep",
		architecture: "feedforward",
		layers: [512, 256, 128, 64, 32],
		activation: "leaky_relu",
		outputActivation: "softmax",
		learningRate: 0.0001,
		batchSize: 64,
		dropout: 0.3,
		useCase: ["complex_classification", "feature_learning"],
	},
};
/**
 * Get preset by category and name.
 *
 * @param category
 * @param presetName
 * @example
 */
function getPreset(category, presetName) {
	if (presetName) {
		// Two-argument version - look by category and preset name
		const presets = Object.values(exports.NEURAL_PRESETS);
		return presets.find(
			(preset) =>
				preset.type === category &&
				(preset.id === presetName ||
					preset.name.toLowerCase().includes(presetName.toLowerCase())),
		);
	}
	// Single-argument version (legacy) - category is actually presetId
	return exports.NEURAL_PRESETS[category.toUpperCase()];
}
/**
 * Get recommended preset for use case.
 *
 * @param useCase
 * @example
 */
function getRecommendedPreset(useCase) {
	const presets = Object.values(exports.NEURAL_PRESETS);
	const found = presets.find((preset) => preset.useCase.includes(useCase));
	// Fallback to a known safe baseline preset
	return found !== null && found !== void 0
		? found
		: exports.NEURAL_PRESETS.BASIC_CLASSIFIER;
}
/**
 * Search presets by use case.
 *
 * @param useCase
 * @example
 */
function searchPresetsByUseCase(useCase) {
	const presets = Object.values(exports.NEURAL_PRESETS);
	return presets.filter((preset) => preset.useCase.includes(useCase));
}
/**
 * Get presets by category.
 *
 * @param category
 * @example
 */
function getCategoryPresets(category) {
	const presets = Object.values(exports.NEURAL_PRESETS);
	return presets.filter((preset) => preset.type === category);
}
/**
 * Validate preset configuration.
 *
 * @param config
 * @example
 */
function validatePresetConfig(config) {
	const required = ["id", "architecture", "layers"];
	const missing = required.filter(
		(field) => !(field in config) || config[field] == null,
	);
	if (missing.length > 0) {
		throw new Error(
			"Invalid preset configuration. Missing: ".concat(missing.join(", ")),
		);
	}
	if (
		!Array.isArray(
			config === null || config === void 0 ? void 0 : config.layers,
		) ||
		(config === null || config === void 0 ? void 0 : config.layers.length) === 0
	) {
		throw new Error("Layers must be a non-empty array");
	}
	return true;
}
exports.default = {
	NEURAL_PRESETS: exports.NEURAL_PRESETS,
	getPreset: getPreset,
	getRecommendedPreset: getRecommendedPreset,
	searchPresetsByUseCase: searchPresetsByUseCase,
	getCategoryPresets: getCategoryPresets,
	validatePresetConfig: validatePresetConfig,
};
