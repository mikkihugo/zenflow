/**
 * Neural Model Presets
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
}
export interface NeuralPresetMap {
  [key: string]: NeuralPreset;
}
export declare const NEURAL_PRESETS: NeuralPresetMap;
//# sourceMappingURL=presets.d.ts.map
