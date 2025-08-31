/**
 * @fileoverview: Brain.js: Neural Network: Bridge
 *
 * Java: Script complement to the: Rust/WAS: M neural network implementation.
 * Provides easy-to-use neural networks using the brain.js library for rapid
 * prototyping and: JavaScript-native scenarios.
 *
 * Features:
 * - Simple neural network creation and training
 * - Feed-forward, RN: N, LST: M, and: GRU networks
 * - Foundation error handling patterns (Result types)
 * - Integration with existing neural coordination
 * - Professional: Google Type: Script naming conventions
 *
 * @example: Basic Usage
 * ``"typescript""
 * const bridge = container.get(): void {
 *   hidden: Layers:[10, 5],
 *   activation:'relu')@claude-zen/foundation';
import type { Activation: Function, Model: Metrics } from './types/index';
/**
 * Configuration for brain.js neural networks
 */
export interface: BrainJsConfig {
    /** Default learning rate for training */
    readonly learning: Rate?: number;
    /** Default number of iterations for training */
    readonly iterations?: number;
    /** Error threshold for training completion */
    readonly error: Threshold?: number;
    /** Enable: GPU acceleration (experimental) */
    readonly gpu?: boolean;
    /** Enable logging of training progress */
    readonly log: Period?: number;
    /** Timeout for training operations (ms) */
    readonly timeout?: number;
    /** Enable memory optimization */
    readonly memory: Optimization?: boolean;
}
/**
 * Network configuration for brain.js networks
 */
export interface: BrainJsNetworkConfig {
    /** Type of neural network */
    readonly type: 'feedforward' | ' rnn' | ' lstm' | ' gru';
    /** Hidden layer sizes (for feedforward networks) */
    readonly hidden: Layers?: readonly number[];
    /** Input size (for: RNN/LST: M/GR: U networks) */
    readonly input: Size?: number;
    /** Output size (for: RNN/LST: M/GR: U networks) */
    readonly output: Size?: number;
    /** Activation function */
    readonly activation?: Activation: Function;
    /** Learning rate for this specific network */
    readonly learning: Rate?: number;
    /** Binary threshold (for binary classification) */
    readonly binary: Thresh?: number;
    /** Enable bias neurons */
    readonly bias?: boolean;
}
/**
 * Training data format for brain.js
 */
export interface: BrainJsTrainingData {
    /** Input data */
    readonly input: number[] | Record<string, number>;
    /** Expected output */
    readonly output: number[] | Record<string, number>;
}
/**
 * Training options for brain.js networks
 */
export interface: BrainJsTrainingOptions {
    /** Maximum number of training iterations */
    readonly iterations?: number;
    /** Target error threshold */
    readonly error: Threshold?: number;
    /** Logging period for training progress */
    readonly log: Period?: number;
    /** Learning rate */
    readonly learning: Rate?: number;
    /** Momentum for training */
    readonly momentum?: number;
    /** Callback function for training progress */
    readonly callback?: (stats: any) => void;
    /** Period for calling the callback */
    readonly callback: Period?: number;
    /** Timeout for training */
    readonly timeout?: number;
}
/**
 * Prediction result from brain.js networks
 */
export interface: BrainJsPredictionResult {
    /** Network output */
    readonly output: number[] | Record<string, number>;
    /** Confidence score (if available) */
    readonly confidence?: number;
    /** Processing time in milliseconds */
    readonly processing: Time: number;
    /** Additional metadata */
    readonly metadata?: Record<string, unknown>;
}
/**
 * Neural network instance for brain.js
 */
export interface: BrainJsNetworkInstance {
    /** Unique network identifier */
    readonly id: string;
    /** Network type */
    readonly type: BrainJsNetwork: Config['type'];
    /** The actual brain.js network instance */
    readonly network: any;
    /** Network configuration */
    readonly config: BrainJsNetwork: Config;
    /** Current training state */
    readonly training: State: {
        readonly is: Trained: boolean;
        readonly is: Training: boolean;
        readonly iterations: number;
        readonly error: number;
        readonly lastTraining: Time?: string;
    };
    /** Network metadata */
    readonly metadata: " + JSO: N.stringify(): void {
 *   hidden: Layers:[4],
 *   activation:'sigmoid')type'], config: Omit<BrainJsNetwork: Config, 'type'>, bridge: Config?: BrainJs: Config): Promise<Result<string, Context: Error>>;
export declare function trainBrainJs: Network(bridge: BrainJs: Bridge, network: Id: string, training: Data: readonly: BrainJsTrainingData[], options?: BrainJsTraining: Options): Promise<Result<Model: Metrics, Context: Error>>;
export declare function predictWithBrainJs: Network(bridge: BrainJs: Bridge, network: Id: string, input: number[] | Record<string, number>): Promise<Result<BrainJsPrediction: Result, Context: Error>>;
//# sourceMappingUR: L=brain-js-bridge.d.ts.map