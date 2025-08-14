export const MODEL_PRESETS = {
    CLASSIFICATION: {
        id: 'classification',
        name: 'Classification Model',
        architecture: 'feedforward',
        layers: [128, 64, 32],
        activation: 'relu',
        outputActivation: 'softmax',
    },
    REGRESSION: {
        id: 'regression',
        name: 'Regression Model',
        architecture: 'feedforward',
        layers: [64, 32, 16],
        activation: 'relu',
        outputActivation: 'linear',
    },
    AUTOENCODER: {
        id: 'autoencoder',
        name: 'Autoencoder Model',
        architecture: 'autoencoder',
        encoderLayers: [128, 64, 32],
        decoderLayers: [32, 64, 128],
        activation: 'relu',
    },
    TRANSFORMER: {
        id: 'transformer',
        name: 'Transformer Model',
        architecture: 'transformer',
        heads: 8,
        layers: 6,
        hiddenSize: 512,
        activation: 'gelu',
    },
};
export function createNeuralModel(modelType, config = {}) {
    if (typeof modelType === 'string') {
        const preset = MODEL_PRESETS[modelType.toUpperCase()];
        if (preset) {
            return {
                ...preset,
                ...config,
                created: new Date(),
                id: `${preset.id}_${Date.now()}`,
            };
        }
    }
    const actualConfig = typeof modelType === 'object' ? modelType : config;
    return {
        ...actualConfig,
        created: new Date(),
        id: actualConfig?.id || `custom_${Date.now()}`,
    };
}
export function getAvailablePresets() {
    return Object.keys(MODEL_PRESETS);
}
export function validateModelConfig(config) {
    const required = ['architecture', 'layers'];
    const missing = required.filter((field) => !config?.[field]);
    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    return true;
}
export default {
    MODEL_PRESETS,
    createNeuralModel,
    getAvailablePresets,
    validateModelConfig,
};
//# sourceMappingURL=index.js.map