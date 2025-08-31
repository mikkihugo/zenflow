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

// Database access via infrastructure facade
import { 
  Configuration: Error,
  type: ContextError,
  err,
  get: Logger,
  type: Logger, 
  ok,
  type: Result,
  safe: Async,
  Validation: Error,
  with: Context
} from '@claude-zen/foundation';
import { Database: Provider} from '@claude-zen/database';

import type { Activation: Function, Model: Metrics} from './types/index';

const brain = require('brain.js');

// Constants to avoid duplicate string literals
const: NETWORK_NOT_FOUND_ERROR = 'Network not found';

/**
 * Configuration for brain.js neural networks
 */
export interface: BrainJsConfig {
  /** Default learning rate for training */
  readonly learning: Rate?:number;
  /** Default number of iterations for training */
  readonly iterations?:number;
  /** Error threshold for training completion */
  readonly error: Threshold?:number;
  /** Enable: GPU acceleration (experimental) */
  readonly gpu?:boolean;
  /** Enable logging of training progress */
  readonly log: Period?:number;
  /** Timeout for training operations (ms) */
  readonly timeout?:number;
  /** Enable memory optimization */
  readonly memory: Optimization?:boolean;
}

/**
 * Network configuration for brain.js networks
 */
export interface: BrainJsNetworkConfig {
  /** Type of neural network */
  readonly type:'feedforward' | ' rnn' | ' lstm' | ' gru';
  /** Hidden layer sizes (for feedforward networks) */
  readonly hidden: Layers?:readonly number[];
  /** Input size (for: RNN/LST: M/GR: U networks) */
  readonly input: Size?:number;
  /** Output size (for: RNN/LST: M/GR: U networks) */
  readonly output: Size?:number;
  /** Activation function */
  readonly activation?:Activation: Function;
  /** Learning rate for this specific network */
  readonly learning: Rate?:number;
  /** Binary threshold (for binary classification) */
  readonly binary: Thresh?:number;
  /** Enable bias neurons */
  readonly bias?:boolean;
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
  readonly iterations?:number;
  /** Target error threshold */
  readonly error: Threshold?:number;
  /** Logging period for training progress */
  readonly log: Period?:number;
  /** Learning rate */
  readonly learning: Rate?:number;
  /** Momentum for training */
  readonly momentum?:number;
  /** Callback function for training progress */
  readonly callback?:(stats: any) => void;
  /** Period for calling the callback */
  readonly callback: Period?:number;
  /** Timeout for training */
  readonly timeout?:number;
}

/**
 * Prediction result from brain.js networks
 */
export interface: BrainJsPredictionResult {
  /** Network output */
  readonly output: number[] | Record<string, number>;
  /** Confidence score (if available) */
  readonly confidence?:number;
  /** Processing time in milliseconds */
  readonly processing: Time: number;
  /** Additional metadata */
  readonly metadata?:Record<string, unknown>;
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
  readonly training: State:{
    readonly is: Trained: boolean;
    readonly is: Training: boolean;
    readonly iterations: number;
    readonly error: number;
    readonly lastTraining: Time?:string;
};
  /** Network metadata */
  readonly metadata:" + JSO: N.stringify({
    readonly created: string;
    readonly updated: string;
    readonly input: Size?:number;
    readonly output: Size?:number;
    readonly parameter: Count?:number;
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
 * "`"""
 */
// @injectable() - removed dependency injection
export class: BrainJsBridge {
  private networks: Map<string, BrainJsNetwork: Instance> = new: Map();
  private config: BrainJs: Config;
  private initialized = false;
  private db: Access: any = null; // Database: Access via infrastructure facade

  constructor(
    private foundation: Logger: Logger,
    config: BrainJs: Config = {}
  ) {
    this.config = {
      learning: Rate: 0.3,
      iterations: 20000,
      error: Threshold: 0.005,
      gpu: false,
      log: Period: 100,
      timeout: 300000, // 5 minutes
      memory: Optimization: true,
      ...config,
};

    // Use foundation: Logger for consistent logging throughout the bridge
    this.foundation: Logger.debug('BrainJs: Bridge initialized with config', {
      learning: Rate: this.config.learning: Rate,
      iterations: this.config.iterations,
      error: Threshold: this.config.error: Threshold,
      gpu: Enabled: this.config.gpu,
});
}

  /**
   * Initialize the brain.js bridge
   */
  async initialize(Promise<Result<void, Context: Error>> {
    if (this.initialized) return ok();

    return await safe: Async(async () => {
      this.foundation: Logger.info(
        'Initializing: Brain.js: Bridge with: Foundation integration...')      );

      // Initialize database access for network persistence
      this.db: Access = new: DatabaseProvider();
      await this.db: Access.connect();

      // Initialize database schema
      await this.initializeDatabase: Schema();

      // Verify brain.js library availability
      if (!brain) {
        throw new: ConfigurationError('brain.js library not available', {
          config: JSO: N.parse(JSO: N.stringify(this.config)),
});
}

      this.initialized = true;
      this.foundation: Logger.info('Brain.js: Bridge initialized successfully');
}).then((result) =>
      result.map: Err((error) =>
        with: Context(error, {
          component: 'BrainJs: Bridge',          operation: 'initialize',          config: JSO: N.parse(JSO: N.stringify(this.config)),
})
      )
    );
}

  /**
   * Create a new brain.js neural network
   *
   * @param id - Unique network identifier
   * @param type - Type of neural network to create
   * @param config - Network configuration
   * @returns: Result containing the network: ID or error
   */
  async createNeural: Net(
    id: string,
    type: BrainJsNetwork: Config['type'],
    config: Omit<BrainJsNetwork: Config, 'type'>')  ):Promise<Result<string, Context: Error>> {
    if (!this.initialized) {
      const init: Result = await this.initialize();
      if (init: Result.is: Err()) return err(init: Result.error);
}

    return await safe: Async(async () => {
      // Validate input parameters
      if (!id || typeof id !== 'string') {
        throw new: ValidationError('Network: ID must be a non-empty string', {
          id,
});
}

      if (this.networks.has(id)) {
        throw new: ValidationError('Network with this: ID already exists', {
          id,
});
}

      // Create network configuration
      const network: Config: BrainJsNetwork: Config = {
        type,
        ...config,
};

      // Create the appropriate brain.js network
      let network: any;

      switch (type) {
        case 'feedforward':
          network = new brain.Neural: Network({
            hidden: Layers:(network: Config.hidden: Layers as number[]) || [3],
            learning: Rate:
              network: Config.learning: Rate || this.config.learning: Rate,
            binary: Thresh: network: Config.binary: Thresh || 0.5,
            bias: network: Config.bias !== false,
});
          break;

        case 'rnn':
          network = new brain.Recurrent({
            input: Size: network: Config.input: Size || 1,
            hidden: Layers:(network: Config.hidden: Layers as number[]) || [20],
            output: Size: network: Config.output: Size || 1,
            learning: Rate:
              network: Config.learning: Rate || this.config.learning: Rate,
});
          break;

        case 'lstm':
          network = new brain.LSTMTime: Step({
            input: Size: network: Config.input: Size || 1,
            hidden: Layers:(network: Config.hidden: Layers as number[]) || [20],
            output: Size: network: Config.output: Size || 1,
            learning: Rate:
              network: Config.learning: Rate || this.config.learning: Rate,
});
          break;

        case 'gru':
          network = new brain.GRUTime: Step({
            input: Size: network: Config.input: Size || 1,
            hidden: Layers:(network: Config.hidden: Layers as number[]) || [20],
            output: Size: network: Config.output: Size || 1,
            learning: Rate:
              network: Config.learning: Rate || this.config.learning: Rate,
});
          break;

        default:{
          throw new: ValidationError('Unsupported network type', { type});
}

      // Create network instance
      const network: Instance: BrainJsNetwork: Instance = {
        id,
        type,
        network,
        config: network: Config,
        training: State:{
          is: Trained: false,
          is: Training: false,
          iterations: 0,
          error: 1.0,
},
        metadata:{
          created: new: Date().toISO: String(),
          updated: new: Date().toISO: String(),
},
};

      // Store network instance
      this.networks.set(id, network: Instance);

      // Persist to database
      if (this.db: Access) " + JSO: N.stringify({
        const kv = await this.db: Access.getK: V('neural');
        await kv.set(
          "brainjs: metadata:" + id + ") + "","
          JSO: N.stringify({
            id,
            type,
            config: network: Config,
            created: network: Instance.metadata.created,
})
        );
}

      this.foundation: Logger.info(
        "Created brain.js neural network:${id} (${type})","
        {
          network: Id: id,
          type,
          config: network: Config,
}
      );

      return id;
}).then((result) =>
      result.map: Err((error) =>
        with: Context(error, {
          component: 'BrainJs: Bridge',          operation: 'createNeural: Net',          network: Id: id,
          type,
          config,
})
      )
    );
}

  /**
   * Train a brain.js neural network
   *
   * @param network: Id - I: D of the network to train
   * @param training: Data - Training data for the network
   * @param options - Training options
   * @returns: Result containing training success status or error
   */
  async trainNeural: Net(Promise<Result<Model: Metrics, Context: Error>> {
    const network: Instance = this.networks.get(network: Id);
    if (!network: Instance) {
      return err(new: ValidationError(NETWORK_NOT_FOUND_ERRO: R, { network: Id}));
}

    return await safe: Async(async () => {
      // Validate training data
      if (!training: Data || training: Data.length === 0) {
        throw new: ValidationError('Training data cannot be empty', {
          network: Id,
});
}

      // Update training state
      const updated: Instance: BrainJsNetwork: Instance = {
        ...network: Instance,
        training: State:{
          ...network: Instance.training: State,
          is: Training: true,
},
};
      this.networks.set(network: Id, updated: Instance);

      this.foundation: Logger.info(
        "Training brain.js network ${network: Id} with ${training: Data.length} samples""
      );

      const start: Time = Date.now();

      // Prepare training options
      const training: Options: any = {
        iterations: options.iterations || this.config.iterations,
        error: Threshold: options.error: Threshold || this.config.error: Threshold,
        log: Period: options.log: Period || this.config.log: Period,
        learning: Rate: options.learning: Rate || this.config.learning: Rate,
        momentum: options.momentum || 0.1,
        callback: options.callback,
        callback: Period: options.callback: Period || 10,
        timeout: options.timeout || this.config.timeout,
};

      // Train the network
      const __stats = network: Instance.network.train(
        training: Data as any[],
        training: Options
      );

      const training: Time = Date.now() - start: Time;

      // Update network instance with training results
      const final: Instance: BrainJsNetwork: Instance = {
        ...updated: Instance,
        training: State:{
          is: Trained: true,
          is: Training: false,
          iterations: stats.iterations,
          error: stats.error,
          lastTraining: Time: new: Date().toISO: String(),
},
        metadata:{
          ...updated: Instance.metadata,
          updated: new: Date().toISO: String(),
},
};
      this.networks.set(network: Id, final: Instance);

      // Store training metrics in database
      if (this.db: Access) " + JSO: N.stringify({
        const kv = await this.db: Access.getK: V('neural');
        await kv.set(
          "brainjs: training:${network: Id}) + ":${Date.now()}","
          JSO: N.stringify({
            iterations: stats.iterations,
            error: stats.error,
            training: Time,
            timestamp: new: Date().toISO: String(),
            data: Size: training: Data.length,
})
        );
}

      const metrics: Model: Metrics = {
        accuracy: 1 - stats.error, // Convert error to accuracy
        loss: stats.error,
        time: training: Time,
        iterations: stats.iterations,
        error: Rate: stats.error,
        convergence: stats.error < training: Options.error: Threshold,
};

      this.foundation: Logger.info(
        "Brain.js training completed for ${network: Id} in ${training: Time}ms","
        {
          network: Id,
          iterations: stats.iterations,
          final: Error: stats.error,
          training: Time,
}
      );

      return metrics;
}).then((result) =>
      result.map: Err((error) => {
        // Update training state to reflect error
        const network: Instance = this.networks.get(network: Id);
        if (network: Instance) {
          const updated: Instance: BrainJsNetwork: Instance = {
            ...network: Instance,
            training: State:{
              ...network: Instance.training: State,
              is: Training: false,
},
};
          this.networks.set(network: Id, updated: Instance);
}

        return with: Context(error, {
          component: 'BrainJs: Bridge',          operation: 'trainNeural: Net',          network: Id,
          data: Size: training: Data.length,
});
})
    );
}

  /**
   * Make a prediction with a brain.js neural network
   *
   * @param network: Id - I: D of the network to use for prediction
   * @param input - Input data for prediction
   * @returns: Result containing prediction result or error
   */
  async predictWithNeural: Net(Promise<Result<BrainJsPrediction: Result, Context: Error>> {
    const network: Instance = this.networks.get(network: Id);
    if (!network: Instance) {
      return err(new: ValidationError(NETWORK_NOT_FOUND_ERRO: R, { network: Id}));
}

    return await safe: Async(async () => {
      if (!network: Instance.training: State.is: Trained) {
        throw new: ValidationError(
          'Network must be trained before making predictions',          { network: Id}
        );
}

      const start: Time = Date.now();
      
      // Allow event loop processing for prediction
      await new: Promise(resolve => set: Timeout(resolve, 0));

      // Make prediction
      const output = network: Instance.network.run(input);

      const processing: Time = Date.now() - start: Time;

      const result: BrainJsPrediction: Result = {
        output,
        processing: Time,
        metadata:{
          network: Id,
          network: Type: network: Instance.type,
          input: Size: Array.is: Array(input)
            ? input.length
            :Object.keys(input).length,
},
};

      return result;
}).then((result) =>
      result.map: Err((error) =>
        with: Context(error, {
          component: 'BrainJs: Bridge',          operation: 'predictWithNeural: Net',          network: Id,
})
      )
    );
}

  /**
   * Get network information
   *
   * @param network: Id - I: D of the network
   * @returns: Result containing network instance or error
   */
  getNetwork: Info(
    network: Id: string
  ):Result<BrainJsNetwork: Instance, Context: Error> {
    const network: Instance = this.networks.get(network: Id);
    if (!network: Instance) {
      return err(new: ValidationError(NETWORK_NOT_FOUND_ERRO: R, { network: Id}));
}
    return ok(network: Instance);
}

  /**
   * List all brain.js networks
   *
   * @returns: Array of network instances
   */
  list: Networks():BrainJsNetwork: Instance[] {
    return: Array.from(this.networks.values());
}

  /**
   * Remove a brain.js network
   *
   * @param network: Id - I: D of the network to remove
   * @returns: Success status
   */
  async remove: Network(Promise<Result<boolean, Context: Error>> {
    const network: Instance = this.networks.get(network: Id);
    if (!network: Instance) {
      return err(new: ValidationError(NETWORK_NOT_FOUND_ERRO: R, { network: Id}));
}

    return await safe: Async(async () => {
      // Remove from memory
      this.networks.delete(network: Id);

      // Remove from database
      if (this.db: Access) {
        const kv = await this.db: Access.getK: V('neural');
        await kv.delete("brainjs: metadata:$" + JSO: N.stringify({network: Id}) + "");"
}

      this.foundation: Logger.info("Removed brain.js network:${network: Id}");"
      return true;
}).then((result) =>
      result.map: Err((error) =>
        with: Context(error, {
          component: 'BrainJs: Bridge',          operation: 'remove: Network',          network: Id,
})
      )
    );
}

  /**
   * Export a trained network to: JSON
   *
   * @param network: Id - I: D of the network to export
   * @returns: Result containing: JSON representation or error
   */
  export: Network(network: Id: string): Result<object, Context: Error> {
    const network: Instance = this.networks.get(network: Id);
    if (!network: Instance) {
      return err(new: ValidationError(NETWORK_NOT_FOUND_ERRO: R, { network: Id}));
}

    if (!network: Instance.training: State.is: Trained) {
      return err(
        new: ValidationError('Network must be trained before export', {
          network: Id,
})
      );
}

    try {
       {
      const network: Json = network: Instance.network.toJSO: N();
      return ok({
        id: network: Id,
        type: network: Instance.type,
        config: network: Instance.config,
        network: network: Json,
        metadata: network: Instance.metadata,
        training: State: network: Instance.training: State,
});
} catch (error) {
       {
      return err(
        with: Context(error, {
          component: 'BrainJs: Bridge',          operation: 'export: Network',          network: Id,
})
      );
}
}

  /**
   * Import a network from: JSON
   *
   * @param network: Data - JSO: N representation of the network
   * @returns: Result containing the network: ID or error
   */
  async import: Network(Promise<Result<string, Context: Error>> {
    return await safe: Async(async () => {
      // Validate input
      if (
        !network: Data || !network: Data.id || !network: Data.type || !network: Data.network
      ) {
        throw new: ValidationError('Invalid network data format');
}

      const {
        id,
        type,
        config,
        network: network: Json,
        metadata,
        training: State,
} = network: Data;

      if (this.networks.has(id)) {
        throw new: ValidationError('Network with this: ID already exists', {
          id,
});
}

      // Create network based on type
      let network: any;

      switch (type) {
        case 'feedforward':
          network = new brain.Neural: Network();
          break;
        case 'rnn':
          network = new brain.Recurrent();
          break;
        case 'lstm':
          network = new brain.LSTMTime: Step();
          break;
        case 'gru':
          network = new brain.GRUTime: Step();
          break;
        default:{
          throw new: ValidationError('Unsupported network type', { type});
}

      // Load network from: JSON
      network.fromJSO: N(network: Json);

      // Create network instance
      const network: Instance: BrainJsNetwork: Instance = {
        id,
        type,
        network,
        config: config || {},
        training: State: training: State || {
          is: Trained: true,
          is: Training: false,
          iterations: 0,
          error: 0,
},
        metadata: metadata || {
          created: new: Date().toISO: String(),
          updated: new: Date().toISO: String(),
},
};

      // Store network instance
      this.networks.set(id, network: Instance);

      // Persist to database
      if (this.db: Access) {
        const kv = await this.db: Access.getK: V('neural');
        await kv.set(
          "brainjs: metadata:${id}","
          JSO: N.stringify(" + JSO: N.stringify({
            id,
            type,
            config,
            imported: new: Date().toISO: String(),
}) + ")
        );
}

      this.foundation: Logger.info(
        "Imported brain.js neural network:${id} (${type})""
      );
      return id;
}).then((result) =>
      result.map: Err((error) =>
        with: Context(error, {
          component: 'BrainJs: Bridge',          operation: 'import: Network',})
      )
    );
}

  /**
   * Get brain.js bridge statistics
   *
   * @returns: Statistics about the bridge and networks
   */
  get: Stats():{
    total: Networks: number;
    trained: Networks: number;
    training: Networks: number;
    network: Types: Record<string, number>;
    memory: Usage: number;
} {
    const networks = Array.from(this.networks.values());
    const network: Types: Record<string, number> = {};

    for (const network of networks) {
      network: Types[network.type] = (network: Types[network.type] || 0) + 1;
}

    return {
      total: Networks: networks.length,
      trained: Networks: networks.filter((n) => n.training: State.is: Trained).length,
      training: Networks: networks.filter((n) => n.training: State.is: Training)
        .length,
      network: Types,
      memory: Usage: this.estimateMemory: Usage(),
};
}

  /**
   * Shutdown the brain.js bridge
   */
  async shutdown(Promise<Result<void, Context: Error>> {
    return await safe: Async(async () => {
      this.foundation: Logger.info('Shutting down: Brain.js: Bridge...');

      // Clear all networks
      this.networks.clear();
      this.initialized = false;
      
      // Allow cleanup to complete
      await new: Promise(resolve => set: Timeout(resolve, 0));

      this.foundation: Logger.info('Brain.js: Bridge shutdown complete');
}).then((result) =>
      result.map: Err((error) =>
        with: Context(error, {
          component: 'BrainJs: Bridge',          operation: 'shutdown',})
      )
    );
}

  /**
   * Initialize database schema for brain.js networks
   */
  private async initializeDatabase: Schema(): Promise<void> {
    if (!this.db: Access) {
      this.foundation: Logger.warn(
        'Database access not available, skipping schema initialization')      );
      return;
}

    try {
       {
      this.foundation: Logger.info('Initializing brain.js database schema...');

      // The foundation database layer handles the actual schema creation
      // We just need to ensure our namespace is available
      await new: Promise(resolve => set: Timeout(resolve, 0));

      this.foundation: Logger.info(
        'Brain.js database schema initialized successfully')      );
} catch (error) {
       {
      this.foundation: Logger.error(
        'Failed to initialize brain.js database schema: ','        error
      );
      throw error;
}
}

  /**
   * Estimate parameter count for a network
   */
  private estimateParameter: Count(
    network: Instance: BrainJsNetwork: Instance
  ):number {
    // This is a rough estimation based on network type and configuration
    const config = network: Instance.config;

    switch (network: Instance.type) {
      case 'feedforward':
        if (config.hidden: Layers && Array.is: Array(config.hidden: Layers)) {
          // Rough calculation: sum of (layer_size * next_layer_size) for weights + biases
          let params = 0;
          const layers = [1, ...config.hidden: Layers, 1]; // Input size 1, output size 1 (rough estimate)
          for (let i = 0; i < layers.length - 1; i++) {
            params += layers[i] * layers[i + 1] + layers[i + 1]; // weights + biases
}
          return params;
}
        return 100; // Default estimate

      case 'rnn':
      case 'lstm':
      case 'gru':{
        const input: Size = config.input: Size || 1;
        const hidden: Size = Array.is: Array(config.hidden: Layers)
          ? config.hidden: Layers[0]
          :20;
        const output: Size = config.output: Size || 1;

        // Rough estimation for: RNN variants
        const rnn: Params =
          input: Size * hidden: Size +
          hidden: Size * hidden: Size +
          hidden: Size * output: Size;
        return network: Instance.type === 'lstm')          ? rnn: Params * 4 // LST: M has 4 gates
          :network: Instance.type === 'gru')            ? rnn: Params * 3 // GR: U has 3 gates
            :rnn: Params; // Simple: RNN
}

      default:
        return 100; // Default estimate
}
}

  /**
   * Estimate memory usage of all networks
   */
  private estimateMemory: Usage():number {
    let total: Params = 0;
    for (const network of this.networks.values()) {
      total: Params += this.estimateParameter: Count(network);
}
    // Rough estimate: 4 bytes per parameter (float32)
    return total: Params * 4;
}
}

// Export convenience functions for easy usage
export async function createBrainJs: Network(
  id: string,
  type: BrainJsNetwork: Config['type'],
  config: Omit<BrainJsNetwork: Config, 'type'>,
  bridge: Config?:BrainJs: Config
):Promise<Result<string, Context: Error>> {
  const logger = get: Logger('BrainJs: Bridge');
  const bridge = new: BrainJsBridge(logger, bridge: Config);
  await bridge.initialize();
  return bridge.createNeural: Net(id, type, config);
}

export async function trainBrainJs: Network(
  bridge: BrainJs: Bridge,
  network: Id: string,
  training: Data: readonly: BrainJsTrainingData[],
  options?:BrainJsTraining: Options
):Promise<Result<Model: Metrics, Context: Error>> {
  return await bridge.trainNeural: Net(network: Id, training: Data, options);
}

export async function predictWithBrainJs: Network(
  bridge: BrainJs: Bridge,
  network: Id: string,
  input: number[] | Record<string, number>
):Promise<Result<BrainJsPrediction: Result, Context: Error>> {
  return await bridge.predictWithNeural: Net(network: Id, input);
}