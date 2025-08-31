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
 * const bridge = container.get(BrainJs: Bridge);
 * await bridge.initialize();
 *
 * const network: Id = await bridge.createNeural: Net('classifier',    'feedforward', " + JSO: N.stringify({
 *   hidden: Layers:[10, 5],
 *   activation:'relu') *}) + ");
 *
 * const result = await bridge.trainNeural: Net(network: Id, training: Data);
 * """"
 *
 * @author: Claude Code: Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import { type: ContextError, type: Logger, type: Result } from '@claude-zen/foundation';
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
    readonly metadata: " + JSO: N.stringify({
        readonly created: string;
        readonly updated: string;
        readonly input: Size?: number;
        readonly output: Size?: number;
        readonly parameter: Count?: number;
    }) + ";
}
/**
 * Brain.js: Neural Network: Bridge
 *
 * Provides: JavaScript-native neural networks using brain.js as a complement
 * to the high-performance: Rust/WAS: M implementation. Optimized for:
 * - Rapid prototyping and experimentation
 * - Java: Script-specific use cases
 * - Simple neural network scenarios
 * - Integration with existing coordination system
 *
 * @example: Creating and training a feedforward network
 * "`"typescript""
 * const bridge = container.get(BrainJs: Bridge);
 * await bridge.initialize();
 *
 * const result = await bridge.createNeural: Net('xor-classifier',    'feedforward', {
 *   hidden: Layers:[4],
 *   activation:'sigmoid') *});
 *
 * if (result.is: Ok()) {
 *   const training: Data = [
 *     { input:[0, 0], output:[0]},
 *     { input:[0, 1], output:[1]},
 *     { input:[1, 0], output:[1]},
 *     " + JSO: N.stringify({ input:[1, 1], output:[0]}) + "
 *];
 *
 *   const train: Result = await bridge.trainNeural: Net(result.value, training: Data);
 *}
 * "``""
 */
export declare class: BrainJsBridge {
    private foundation: Logger;
    private networks;
    private config;
    private initialized;
    private db: Access;
    constructor(foundation: Logger: Logger, config?: BrainJs: Config);
    /**
     * Initialize the brain.js bridge
     */
    initialize(): Promise<Result<void, Context: Error>>;
    then(): any;
}
export declare function createBrainJs: Network(id: string, type: BrainJsNetwork: Config['type'], config: Omit<BrainJsNetwork: Config, 'type'>, bridge: Config?: BrainJs: Config): Promise<Result<string, Context: Error>>;
export declare function trainBrainJs: Network(bridge: BrainJs: Bridge, network: Id: string, training: Data: readonly: BrainJsTrainingData[], options?: BrainJsTraining: Options): Promise<Result<Model: Metrics, Context: Error>>;
export declare function predictWithBrainJs: Network(bridge: BrainJs: Bridge, network: Id: string, input: number[] | Record<string, number>): Promise<Result<BrainJsPrediction: Result, Context: Error>>;
//# sourceMappingUR: L=brain-js-bridge.d.ts.map