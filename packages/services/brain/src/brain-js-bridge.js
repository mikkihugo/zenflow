/**
 * @fileoverview Brain.js Neural Network Bridge
 *
 * JavaScript complement to the Rust/WASM neural network implementation.
 * Provides easy-to-use neural networks using the brain.js library for rapid
 * prototyping and JavaScript-native scenarios.
 *
 * Features:
 * - Simple neural network creation and training
 * - Feed-forward, RNN, LSTM, and GRU networks
 * - Foundation error handling patterns (Result types)
 * - Integration with existing neural coordination
 * - Professional Google TypeScript naming conventions
 *
 * @example Basic Usage
 * ```typescript`
 * const bridge = container.get(BrainJsBridge);
 * await bridge.initialize();
 *
 * const networkId = await bridge.createNeuralNet('classifier',    'feedforward', {
 *   hiddenLayers:[10, 5],
 *   activation:'relu') *});
 *
 * const result = await bridge.trainNeuralNet(networkId, trainingData);
 * ```
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
// Database access via infrastructure facade
import { ConfigurationError, err, getLogger, ok, safeAsync, ValidationError, withContext } from '@claude-zen/foundation';
import { DatabaseProvider } from '@claude-zen/database';
const brain = require('brain.js');
// Constants to avoid duplicate string literals
const NETWORK_NOT_FOUND_ERROR = 'Network not found';
/**
 * Brain.js Neural Network Bridge
 *
 * Provides JavaScript-native neural networks using brain.js as a complement
 * to the high-performance Rust/WASM implementation. Optimized for:
 * - Rapid prototyping and experimentation
 * - JavaScript-specific use cases
 * - Simple neural network scenarios
 * - Integration with existing coordination system
 *
 * @example Creating and training a feedforward network
 * ```typescript`
 * const bridge = container.get(BrainJsBridge);
 * await bridge.initialize();
 *
 * const result = await bridge.createNeuralNet('xor-classifier',    'feedforward', {
 *   hiddenLayers:[4],
 *   activation:'sigmoid') *});
 *
 * if (result.isOk()) {
 *   const trainingData = [
 *     { input:[0, 0], output:[0]},
 *     { input:[0, 1], output:[1]},
 *     { input:[1, 0], output:[1]},
 *     { input:[1, 1], output:[0]}
 *];
 *
 *   const trainResult = await bridge.trainNeuralNet(result.value, trainingData);
 *}
 * ````
 */
// @injectable() - removed dependency injection
export class BrainJsBridge {
    foundationLogger;
    networks = new Map();
    config;
    initialized = false;
    dbAccess = null; // DatabaseAccess via infrastructure facade
    constructor(foundationLogger, config = {}) {
        this.foundationLogger = foundationLogger;
        this.config = {
            learningRate: 0.3,
            iterations: 20000,
            errorThreshold: 0.005,
            gpu: false,
            logPeriod: 100,
            timeout: 300000, // 5 minutes
            memoryOptimization: true,
            ...config,
        };
        // Use foundationLogger for consistent logging throughout the bridge
        this.foundationLogger.debug('BrainJsBridge initialized with config', {
            learningRate: this.config.learningRate,
            iterations: this.config.iterations,
            errorThreshold: this.config.errorThreshold,
            gpuEnabled: this.config.gpu,
        });
    }
    /**
     * Initialize the brain.js bridge
     */
    async initialize() {
        if (this.initialized)
            return ok();
        return await safeAsync(async () => {
            this.foundationLogger.info('Initializing Brain.js Bridge with Foundation integration...');
        });
        // Initialize database access for network persistence
        this.dbAccess = new DatabaseProvider();
        await this.dbAccess.connect();
        // Initialize database schema
        await this.initializeDatabaseSchema();
        // Verify brain.js library availability
        if (!brain) {
            throw new ConfigurationError('brain.js library not available', {
                config: JSON.parse(JSON.stringify(this.config)),
            });
        }
        this.initialized = true;
        this.foundationLogger.info('Brain.js Bridge initialized successfully');
    }
    then() { }
}
(result) => result.mapErr((error) => withContext(error, {
    component: 'BrainJsBridge', operation: 'initialize', config: JSON.parse(JSON.stringify(this.config)),
}));
;
/**
 * Create a new brain.js neural network
 *
 * @param id - Unique network identifier
 * @param type - Type of neural network to create
 * @param config - Network configuration
 * @returns Result containing the network ID or error
 */
async;
createNeuralNet(id, string, type, BrainJsNetworkConfig['type'], config, Omit < BrainJsNetworkConfig, 'type' > ')  ):Promise<Result<string, ContextError>> {);
if (!this.initialized) {
    const initResult = await this.initialize();
    if (initResult.isErr())
        return err(initResult.error);
}
return await safeAsync(async () => {
    // Validate input parameters
    if (!id || typeof id !== 'string') {
        throw new ValidationError('Network ID must be a non-empty string', {
            id,
        });
    }
    if (this.networks.has(id)) {
        throw new ValidationError('Network with this ID already exists', {
            id,
        });
    }
    // Create network configuration
    const networkConfig = {
        type,
        ...config,
    };
    // Create the appropriate brain.js network
    let network;
    switch (type) {
        case 'feedforward':
            network = new brain.NeuralNetwork({
                hiddenLayers: networkConfig.hiddenLayers || [3],
                learningRate: networkConfig.learningRate || this.config.learningRate,
                binaryThresh: networkConfig.binaryThresh || 0.5,
                bias: networkConfig.bias !== false,
            });
            break;
        case 'rnn':
            network = new brain.Recurrent({
                inputSize: networkConfig.inputSize || 1,
                hiddenLayers: networkConfig.hiddenLayers || [20],
                outputSize: networkConfig.outputSize || 1,
                learningRate: networkConfig.learningRate || this.config.learningRate,
            });
            break;
        case 'lstm':
            network = new brain.LSTMTimeStep({
                inputSize: networkConfig.inputSize || 1,
                hiddenLayers: networkConfig.hiddenLayers || [20],
                outputSize: networkConfig.outputSize || 1,
                learningRate: networkConfig.learningRate || this.config.learningRate,
            });
            break;
        case 'gru':
            network = new brain.GRUTimeStep({
                inputSize: networkConfig.inputSize || 1,
                hiddenLayers: networkConfig.hiddenLayers || [20],
                outputSize: networkConfig.outputSize || 1,
                learningRate: networkConfig.learningRate || this.config.learningRate,
            });
            break;
        default:
            {
                throw new ValidationError('Unsupported network type', { type });
            }
            // Create network instance
            const networkInstance = {
                id,
                type,
                network,
                config: networkConfig,
                trainingState: {
                    isTrained: false,
                    isTraining: false,
                    iterations: 0,
                    error: 1.0,
                },
                metadata: {
                    created: new Date().toISOString(),
                    updated: new Date().toISOString(),
                },
            };
            // Store network instance
            this.networks.set(id, networkInstance);
            // Persist to database
            if (this.dbAccess) {
                const kv = await this.dbAccess.getKV('neural');
                await kv.set(`brainjs:metadata:${id}`, JSON.stringify({
                    id,
                    type,
                    config: networkConfig,
                    created: networkInstance.metadata.created,
                }));
            }
            this.foundationLogger.info(`Created brain.js neural network:${id} (${type})`, {
                networkId: id,
                type,
                config: networkConfig,
            });
            return id;
    }
}).then((result) => result.mapErr((error) => withContext(error, {
    component: 'BrainJsBridge', operation: 'createNeuralNet', networkId: id,
    type,
    config,
})));
/**
 * Train a brain.js neural network
 *
 * @param networkId - ID of the network to train
 * @param trainingData - Training data for the network
 * @param options - Training options
 * @returns Result containing training success status or error
 */
async;
trainNeuralNet(networkId, string, trainingData, readonly, BrainJsTrainingData[], options, BrainJsTrainingOptions = {});
Promise < Result < ModelMetrics, ContextError >> {
    const: networkInstance = this.networks.get(networkId),
    if(, networkInstance) {
        return err(new ValidationError(NETWORK_NOT_FOUND_ERROR, { networkId }));
    },
    return: await safeAsync(async () => {
        // Validate training data
        if (!trainingData || trainingData.length === 0) {
            throw new ValidationError('Training data cannot be empty', {
                networkId,
            });
        }
        // Update training state
        const updatedInstance = {
            ...networkInstance,
            trainingState: {
                ...networkInstance.trainingState,
                isTraining: true,
            },
        };
        this.networks.set(networkId, updatedInstance);
        this.foundationLogger.info(`Training brain.js network ${networkId} with ${trainingData.length} samples`);
        const startTime = Date.now();
        // Prepare training options
        const trainingOptions = {
            iterations: options.iterations || this.config.iterations,
            errorThreshold: options.errorThreshold || this.config.errorThreshold,
            logPeriod: options.logPeriod || this.config.logPeriod,
            learningRate: options.learningRate || this.config.learningRate,
            momentum: options.momentum || 0.1,
            callback: options.callback,
            callbackPeriod: options.callbackPeriod || 10,
            timeout: options.timeout || this.config.timeout,
        };
        // Train the network
        const stats = networkInstance.network.train(trainingData, trainingOptions);
        const trainingTime = Date.now() - startTime;
        // Update network instance with training results
        const finalInstance = {
            ...updatedInstance,
            trainingState: {
                isTrained: true,
                isTraining: false,
                iterations: stats.iterations,
                error: stats.error,
                lastTrainingTime: new Date().toISOString(),
            },
            metadata: {
                ...updatedInstance.metadata,
                updated: new Date().toISOString(),
            },
        };
        this.networks.set(networkId, finalInstance);
        // Store training metrics in database
        if (this.dbAccess) {
            const kv = await this.dbAccess.getKV('neural');
            await kv.set(`brainjs:training:${networkId}:${Date.now()}`, JSON.stringify({
                iterations: stats.iterations,
                error: stats.error,
                trainingTime,
                timestamp: new Date().toISOString(),
                dataSize: trainingData.length,
            }));
        }
        const metrics = {
            accuracy: 1 - stats.error, // Convert error to accuracy
            loss: stats.error,
            time: trainingTime,
            iterations: stats.iterations,
            errorRate: stats.error,
            convergence: stats.error < trainingOptions.errorThreshold,
        };
        this.foundationLogger.info(`Brain.js training completed for ${networkId} in ${trainingTime}ms`, {
            networkId,
            iterations: stats.iterations,
            finalError: stats.error,
            trainingTime,
        });
        return metrics;
    }).then((result) => result.mapErr((error) => {
        // Update training state to reflect error
        const networkInstance = this.networks.get(networkId);
        if (networkInstance) {
            const updatedInstance = {
                ...networkInstance,
                trainingState: {
                    ...networkInstance.trainingState,
                    isTraining: false,
                },
            };
            this.networks.set(networkId, updatedInstance);
        }
        return withContext(error, {
            component: 'BrainJsBridge', operation: 'trainNeuralNet', networkId,
            dataSize: trainingData.length,
        });
    }))
};
/**
 * Make a prediction with a brain.js neural network
 *
 * @param networkId - ID of the network to use for prediction
 * @param input - Input data for prediction
 * @returns Result containing prediction result or error
 */
async;
predictWithNeuralNet(networkId, string, input, number[] | (Record));
Promise < Result < BrainJsPredictionResult, ContextError >> {
    const: networkInstance = this.networks.get(networkId),
    if(, networkInstance) {
        return err(new ValidationError(NETWORK_NOT_FOUND_ERROR, { networkId }));
    },
    return: await safeAsync(async () => {
        if (!networkInstance.trainingState.isTrained) {
            throw new ValidationError('Network must be trained before making predictions', { networkId });
        }
        const startTime = Date.now();
        // Allow event loop processing for prediction
        await new Promise(resolve => setTimeout(resolve, 0));
        // Make prediction
        const output = networkInstance.network.run(input);
        const processingTime = Date.now() - startTime;
        const result = {
            output,
            processingTime,
            metadata: {
                networkId,
                networkType: networkInstance.type,
                inputSize: Array.isArray(input)
                    ? input.length
                    : Object.keys(input).length,
            },
        };
        return result;
    }).then((result) => result.mapErr((error) => withContext(error, {
        component: 'BrainJsBridge', operation: 'predictWithNeuralNet', networkId,
    })))
};
/**
 * Get network information
 *
 * @param networkId - ID of the network
 * @returns Result containing network instance or error
 */
getNetworkInfo(networkId, string);
Result < BrainJsNetworkInstance, ContextError > {
    const: networkInstance = this.networks.get(networkId),
    if(, networkInstance) {
        return err(new ValidationError(NETWORK_NOT_FOUND_ERROR, { networkId }));
    },
    return: ok(networkInstance)
};
/**
 * List all brain.js networks
 *
 * @returns Array of network instances
 */
listNetworks();
BrainJsNetworkInstance[];
{
    return Array.from(this.networks.values());
}
/**
 * Remove a brain.js network
 *
 * @param networkId - ID of the network to remove
 * @returns Success status
 */
async;
removeNetwork(networkId, string);
Promise < Result < boolean, ContextError >> {
    const: networkInstance = this.networks.get(networkId),
    if(, networkInstance) {
        return err(new ValidationError(NETWORK_NOT_FOUND_ERROR, { networkId }));
    },
    return: await safeAsync(async () => {
        // Remove from memory
        this.networks.delete(networkId);
        // Remove from database
        if (this.dbAccess) {
            const kv = await this.dbAccess.getKV('neural');
            await kv.delete(`brainjs:metadata:${networkId}`);
        }
        this.foundationLogger.info(`Removed brain.js network:${networkId}`);
        return true;
    }).then((result) => result.mapErr((error) => withContext(error, {
        component: 'BrainJsBridge', operation: 'removeNetwork', networkId,
    })))
};
/**
 * Export a trained network to JSON
 *
 * @param networkId - ID of the network to export
 * @returns Result containing JSON representation or error
 */
exportNetwork(networkId, string);
Result < object, ContextError > {
    const: networkInstance = this.networks.get(networkId),
    if(, networkInstance) {
        return err(new ValidationError(NETWORK_NOT_FOUND_ERROR, { networkId }));
    },
    if(, networkInstance) { }, : .trainingState.isTrained
};
{
    return err(new ValidationError('Network must be trained before export', {
        networkId,
    }));
}
try {
    const networkJson = networkInstance.network.toJSON();
    return ok({
        id: networkId,
        type: networkInstance.type,
        config: networkInstance.config,
        network: networkJson,
        metadata: networkInstance.metadata,
        trainingState: networkInstance.trainingState,
    });
}
catch (error) {
    return err(withContext(error, {
        component: 'BrainJsBridge', operation: 'exportNetwork', networkId,
    }));
}
/**
 * Import a network from JSON
 *
 * @param networkData - JSON representation of the network
 * @returns Result containing the network ID or error
 */
async;
importNetwork(networkData, any);
Promise < Result < string, ContextError >> {
    return: await safeAsync(async () => {
        // Validate input
        if (!networkData || !networkData.id || !networkData.type || !networkData.network) {
            throw new ValidationError('Invalid network data format');
        }
        const { id, type, config, network: networkJson, metadata, trainingState, } = networkData;
        if (this.networks.has(id)) {
            throw new ValidationError('Network with this ID already exists', {
                id,
            });
        }
        // Create network based on type
        let network;
        switch (type) {
            case 'feedforward':
                network = new brain.NeuralNetwork();
                break;
            case 'rnn':
                network = new brain.Recurrent();
                break;
            case 'lstm':
                network = new brain.LSTMTimeStep();
                break;
            case 'gru':
                network = new brain.GRUTimeStep();
                break;
            default:
                {
                    throw new ValidationError('Unsupported network type', { type });
                }
                // Load network from JSON
                network.fromJSON(networkJson);
                // Create network instance
                const networkInstance = {
                    id,
                    type,
                    network,
                    config: config || {},
                    trainingState: trainingState || {
                        isTrained: true,
                        isTraining: false,
                        iterations: 0,
                        error: 0,
                    },
                    metadata: metadata || {
                        created: new Date().toISOString(),
                        updated: new Date().toISOString(),
                    },
                };
                // Store network instance
                this.networks.set(id, networkInstance);
                // Persist to database
                if (this.dbAccess) {
                    const kv = await this.dbAccess.getKV('neural');
                    await kv.set(`brainjs:metadata:${id}`, JSON.stringify({
                        id,
                        type,
                        config,
                        imported: new Date().toISOString(),
                    }));
                }
                this.foundationLogger.info(`Imported brain.js neural network:${id} (${type})`);
                return id;
        }
    }).then((result) => result.mapErr((error) => withContext(error, {
        component: 'BrainJsBridge', operation: 'importNetwork',
    })))
};
/**
 * Get brain.js bridge statistics
 *
 * @returns Statistics about the bridge and networks
 */
getStats();
{
    totalNetworks: number;
    trainedNetworks: number;
    trainingNetworks: number;
    networkTypes: Record;
    memoryUsage: number;
}
{
    const networks = Array.from(this.networks.values());
    const networkTypes = {};
    for (const network of networks) {
        networkTypes[network.type] = (networkTypes[network.type] || 0) + 1;
    }
    return {
        totalNetworks: networks.length,
        trainedNetworks: networks.filter((n) => n.trainingState.isTrained).length,
        trainingNetworks: networks.filter((n) => n.trainingState.isTraining)
            .length,
        networkTypes,
        memoryUsage: this.estimateMemoryUsage(),
    };
}
/**
 * Shutdown the brain.js bridge
 */
async;
shutdown();
Promise < Result < void , ContextError >> {
    return: await safeAsync(async () => {
        this.foundationLogger.info('Shutting down Brain.js Bridge...');
        // Clear all networks
        this.networks.clear();
        this.initialized = false;
        // Allow cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        this.foundationLogger.info('Brain.js Bridge shutdown complete');
    }).then((result) => result.mapErr((error) => withContext(error, {
        component: 'BrainJsBridge', operation: 'shutdown',
    })))
};
async;
initializeDatabaseSchema();
Promise < void  > {
    : .dbAccess
};
{
    this.foundationLogger.warn('Database access not available, skipping schema initialization');
    ;
    return;
}
try {
    this.foundationLogger.info('Initializing brain.js database schema...');
    // The foundation database layer handles the actual schema creation
    // We just need to ensure our namespace is available
    await new Promise(resolve => setTimeout(resolve, 0));
    this.foundationLogger.info('Brain.js database schema initialized successfully');
    ;
}
catch (error) {
    this.foundationLogger.error('Failed to initialize brain.js database schema: ', '        error);
    throw error;
}
estimateParameterCount(networkInstance, BrainJsNetworkInstance);
number;
{
    // This is a rough estimation based on network type and configuration
    const config = networkInstance.config;
    switch (networkInstance.type) {
        case 'feedforward':
            if (config.hiddenLayers && Array.isArray(config.hiddenLayers)) {
                // Rough calculation:sum of (layer_size * next_layer_size) for weights + biases
                let params = 0;
                const layers = [1, ...config.hiddenLayers, 1]; // Input size 1, output size 1 (rough estimate)
                for (let i = 0; i < layers.length - 1; i++) {
                    params += layers[i] * layers[i + 1] + layers[i + 1]; // weights + biases
                }
                return params;
            }
            return 100; // Default estimate
        case 'rnn':
        case 'lstm':
        case 'gru': {
            const inputSize = config.inputSize || 1;
            const hiddenSize = Array.isArray(config.hiddenLayers)
                ? config.hiddenLayers[0]
                : 20;
            const outputSize = config.outputSize || 1;
            // Rough estimation for RNN variants
            const rnnParams = inputSize * hiddenSize +
                hiddenSize * hiddenSize +
                hiddenSize * outputSize;
            return networkInstance.type === 'lstm';
            rnnParams * 4; // LSTM has 4 gates
            networkInstance.type === 'gru';
            rnnParams * 3; // GRU has 3 gates
            rnnParams; // Simple RNN
        }
        default:
            return 100; // Default estimate
    }
}
estimateMemoryUsage();
number;
{
    let totalParams = 0;
    for (const network of this.networks.values()) {
        totalParams += this.estimateParameterCount(network);
    }
    // Rough estimate:4 bytes per parameter (float32)
    return totalParams * 4;
}
// Export convenience functions for easy usage
export async function createBrainJsNetwork(id, type, config, bridgeConfig) {
    const logger = getLogger('BrainJsBridge');
    const bridge = new BrainJsBridge(logger, bridgeConfig);
    await bridge.initialize();
    return bridge.createNeuralNet(id, type, config);
}
export async function trainBrainJsNetwork(bridge, networkId, trainingData, options) {
    return await bridge.trainNeuralNet(networkId, trainingData, options);
}
export async function predictWithBrainJsNetwork(bridge, networkId, input) {
    return await bridge.predictWithNeuralNet(networkId, input);
}
