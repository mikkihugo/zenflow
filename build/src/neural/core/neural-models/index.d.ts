/**
 * Neural Models Index.
 * Central registry for neural network models and presets.
 */
/**
 * @file Neural-models module exports.
 */
export declare const MODEL_PRESETS: {
    CLASSIFICATION: {
        id: string;
        name: string;
        architecture: string;
        layers: number[];
        activation: string;
        outputActivation: string;
    };
    REGRESSION: {
        id: string;
        name: string;
        architecture: string;
        layers: number[];
        activation: string;
        outputActivation: string;
    };
    AUTOENCODER: {
        id: string;
        name: string;
        architecture: string;
        encoderLayers: number[];
        decoderLayers: number[];
        activation: string;
    };
    TRANSFORMER: {
        id: string;
        name: string;
        architecture: string;
        heads: number;
        layers: number;
        hiddenSize: number;
        activation: string;
    };
};
/**
 * Create a neural model from preset or custom configuration.
 *
 * @param modelType
 * @param config
 * @example
 */
export declare function createNeuralModel(modelType: any, config?: {}): any;
/**
 * Get available model presets.
 *
 * @example
 */
export declare function getAvailablePresets(): string[];
/**
 * Validate model configuration.
 *
 * @param config
 * @example
 */
export declare function validateModelConfig(config: any): boolean;
declare const _default: {
    MODEL_PRESETS: {
        CLASSIFICATION: {
            id: string;
            name: string;
            architecture: string;
            layers: number[];
            activation: string;
            outputActivation: string;
        };
        REGRESSION: {
            id: string;
            name: string;
            architecture: string;
            layers: number[];
            activation: string;
            outputActivation: string;
        };
        AUTOENCODER: {
            id: string;
            name: string;
            architecture: string;
            encoderLayers: number[];
            decoderLayers: number[];
            activation: string;
        };
        TRANSFORMER: {
            id: string;
            name: string;
            architecture: string;
            heads: number;
            layers: number;
            hiddenSize: number;
            activation: string;
        };
    };
    createNeuralModel: typeof createNeuralModel;
    getAvailablePresets: typeof getAvailablePresets;
    validateModelConfig: typeof validateModelConfig;
};
export default _default;
//# sourceMappingURL=index.d.ts.map