/**
 * Neural Network Presets Index.
 * Collection of predefined neural network configurations.
 */
/**
 * @file Presets module exports.
 */
export interface NeuralPreset {
    id: string;
    name: string;
    type: string;
    architecture: string;
    layers: number[];
    activation: string;
    outputActivation: string;
    learningRate: number;
    batchSize: number;
    useCase: string[];
    dropout?: number;
    config?: Record<string, any>;
    model?: string;
    description?: string;
    performance?: {
        accuracy?: number;
        latency?: number;
        memoryUsage?: number;
        [key: string]: any;
    };
}
export type NeuralPresetMap = Record<string, NeuralPreset>;
export declare const NEURAL_PRESETS: NeuralPresetMap;
/**
 * Get preset by category and name.
 *
 * @param category
 * @param presetName
 * @example
 */
export declare function getPreset(category: string, presetName?: string): NeuralPreset | undefined;
/**
 * Get recommended preset for use case.
 *
 * @param useCase
 * @example
 */
export declare function getRecommendedPreset(useCase: string): NeuralPreset;
/**
 * Search presets by use case.
 *
 * @param useCase
 * @example
 */
export declare function searchPresetsByUseCase(useCase: string): NeuralPreset[];
/**
 * Get presets by category.
 *
 * @param category
 * @example
 */
export declare function getCategoryPresets(category: string): NeuralPreset[];
/**
 * Validate preset configuration.
 *
 * @param config
 * @example
 */
export declare function validatePresetConfig(config: Partial<NeuralPreset>): boolean;
declare const _default: {
    NEURAL_PRESETS: NeuralPresetMap;
    getPreset: typeof getPreset;
    getRecommendedPreset: typeof getRecommendedPreset;
    searchPresetsByUseCase: typeof searchPresetsByUseCase;
    getCategoryPresets: typeof getCategoryPresets;
    validatePresetConfig: typeof validatePresetConfig;
};
export default _default;
//# sourceMappingURL=index.d.ts.map