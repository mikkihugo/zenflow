/**
 * @file Models module exports.
 */
export { NEURAL_PRESETS } from './presets';
export type { NeuralPreset, NeuralPresetMap } from './presets';
export * from './presets';
export { NEURAL_PRESETS as COMPLETE_NEURAL_PRESETS } from './presets';
export { NEURAL_PRESETS as NeuralModelPresets } from './presets';
export declare const AutoencoderPreset: {
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
};
export declare const CNNPreset: {
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
};
export declare const LSTMPreset: {
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
};
export declare class GraphNeuralNetwork {
    config: any;
    constructor(config?: any);
    train(data: any): Promise<void>;
    predict(input: any): Promise<any>;
}
export declare class TransformerModel {
    config: any;
    constructor(config?: any);
    train(data: any): Promise<void>;
    predict(input: any): Promise<any>;
}
export declare class VAEModel {
    config: any;
    constructor(config?: any);
    train(data: any): Promise<void>;
    predict(input: any): Promise<any>;
}
declare const _default: {
    NEURAL_PRESETS: import("./presets").NeuralPresetMap;
    NeuralModelPresets: import("./presets").NeuralPresetMap;
    AutoencoderPreset: {
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
    };
    CNNPreset: {
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
    };
    LSTMPreset: {
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
    };
    GraphNeuralNetwork: typeof GraphNeuralNetwork;
    TransformerModel: typeof TransformerModel;
    VAEModel: typeof VAEModel;
};
export default _default;
//# sourceMappingURL=index.d.ts.map