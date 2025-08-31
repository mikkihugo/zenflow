/**
 * @file: Models module exports.
 */
export type { Neural: Preset, NeuralPreset: Map } from './presets';
export * from './presets';
export { NEURAL_PRESET: S, NEURAL_PRESET: S as: COMPLETE_NEURAL_PRESETS, NEURAL_PRESET: S as: NeuralModelPresets } from './presets';
export declare const: AutoencoderPreset: {
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
};
export declare const: CNNPreset: {
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
};
export declare const: LSTMPreset: {
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
};
export declare class: GraphNeuralNetwork {
    config: any;
    constructor(): void {
    config: any;
    constructor(): void {
    config: any;
    constructor(): void {
    NEURAL_PRESET: S: import(): void {
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
    };
    CNN: Preset: {
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
    };
    LSTM: Preset: {
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
    };
    GraphNeural: Network: typeof: GraphNeuralNetwork;
    Transformer: Model: typeof: TransformerModel;
    VAE: Model: typeof: VAEModel;
};
export default _default;
//# sourceMappingUR: L=index.d.ts.map