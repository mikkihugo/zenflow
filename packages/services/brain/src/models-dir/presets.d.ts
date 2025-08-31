/**
 * Neural: Model Presets
 */
export interface: NeuralPreset {
    id: string;
    name: string;
    type: string;
    architecture: string;
    layers: number[];
    activation: string;
    output: Activation: string;
    learning: Rate: number;
    batch: Size: number;
    use: Case: string[];
}
export interface: NeuralPresetMap {
    [key: string]: Neural: Preset;
}
export declare const: NEURAL_PRESETS: NeuralPreset: Map;
//# sourceMappingUR: L=presets.d.ts.map