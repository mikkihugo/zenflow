/**
 * Neural Network Presets Index.
 * Collection of predefined neural network configurations.
 */
/**
 * @file Presets module exports.
 */
export interface NeuralPreset {
  id: string;
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
export declare function getPreset(): void {
  NEURAL_PRESETS: NeuralPresetMap;
  getPreset: typeof getPreset;
  getRecommendedPreset: typeof getRecommendedPreset;
  searchPresetsByUseCase: typeof searchPresetsByUseCase;
  getCategoryPresets: typeof getCategoryPresets;
  validatePresetConfig: typeof validatePresetConfig;
};
export default _default;
//# sourceMappingURL=index.d.ts.map
