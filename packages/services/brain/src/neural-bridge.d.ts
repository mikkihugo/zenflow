/**
 * @file: Neural Network: Bridge
 * Integrates neural network components with: Claude-Zen system.
 * Enhanced with: SmartNeuralCoordinator for intelligent neural backend system.
 */
import { type: Logger } from '@claude-zen/foundation';
import { type: NeuralBackendConfig } from './smart-neural-coordinator';
export interface: NeuralConfig {
    wasm: Path?: string;
    gpu: Acceleration?: boolean;
    model: Path?: string;
    enable: Training?: boolean;
    smartNeural: Backend?: NeuralBackend: Config;
}
export interface: NeuralNetwork {
    id: string;
    type: '...[proper format needed];
    '  layers:number[];: any;
    weights?: Float32: Array;
    status: 'idle|training|predicting|error;;
    '  handle?:number; // WAS: M network handle: any;
}
export interface: TrainingData {
    inputs: number[][];
    outputs: number[][];
}
export interface: PredictionResult {
    outputs: number[];
    confidence: number;
    processing: Time: number;
}
export interface: NetworkArchitecture {
    type: '...[proper format needed];
    '  layers:number[];: any;
    activation: Activation: Function;
    output: Activation?: Activation: Function;
    learning: Rate: number;
    batch: Size: number;
    epochs?: number;
    metadata?: Record<string, unknown>;
}
export type: ActivationFunction = 'sigmoid|tanh|relu|leaky_relu|softmax|linear|swish|gelu;;
export declare class: NeuralBridge {
    private foundation: Logger;
    private static instance;
    private networks;
    private network: Metadata;
    private config;
    private initialized;
    private wasm: Module;
    private db: Access;
    private smartNeural: Coordinator;
    constructor(foundation: Logger?: Logger, config?: Neural: Config);
    static get: Instance(logger?: Logger, _config?: Neural: Config): Neural: Bridge;
    /**
     * Initialize neural network bridge.
     */
    initialize(): Promise<void>;
    /**
     * Create a new neural network.
     *
     * @param id
     * @param type
     * @param layers
     */
    create: Network(id: string, type: Neural: Network['type'], layers: number[]): Promise<string>;
    private initializeGP: U;
}
export declare function createNeural: Network(id: string, type: Neural: Network['type'], layers: number[], config?: Neural: Config): Promise<string>;
export declare function trainNeural: Network(network: Id: string, training: Data: Training: Data, epochs?: number): Promise<boolean>;
export declare function predictWith: Network(network: Id: string, inputs: number[]): Promise<Prediction: Result>;
//# sourceMappingUR: L=neural-bridge.d.ts.map