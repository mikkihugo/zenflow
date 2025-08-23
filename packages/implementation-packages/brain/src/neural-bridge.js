/**
 * @file Neural Network Bridge
 * Integrates neural network components with Claude-Zen system.
 * Enhanced with SmartNeuralCoordinator for intelligent neural backend system.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if ((d = decorators[i])) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NeuralBridge_1;
import { getLogger, inject, TOKENS } from '@claude-zen/foundation';
import { SmartNeuralCoordinator } from './smart-neural-coordinator';
// @injectable - Temporarily removed due to constructor type incompatibility 
let NeuralBridge = class NeuralBridge {
    static { NeuralBridge_1 = this; }
    foundationLogger;
    static instance;
    networks = new Map(); // Now stores WASM networks
    networkMetadata = new Map(); // Stores metadata
    config;
    initialized = false;
    wasmModule = null; // Will hold the WASM module
    dbAccess = null; // DatabaseAccess via infrastructure facade
    smartNeuralCoordinator = null; // Smart neural backend
    constructor(foundationLogger, config = {}) {
        this.foundationLogger = foundationLogger;
        this.config = {
            wasmPath: './wasm/claude_zen_neural', // Points to neural/wasm/ directory
            gpuAcceleration: false,
            enableTraining: true,
            ...config,
        };
    }
    static getInstance(logger, config) {
        if (!NeuralBridge_1.instance) {
            // For singleton pattern with DI, we need to provide a logger
            const defaultLogger = logger || getLogger('Neural');
            NeuralBridge_1.instance = new NeuralBridge_1(defaultLogger, config);
        }
        return NeuralBridge_1.instance;
    }
    /**
     * Initialize neural network bridge.
     */
    async initialize() {
        if (this.initialized)
            return;
        this.foundationLogger.info('Initializing Neural Bridge with Foundation integration...');
        try {
            // Initialize database access for model persistence via infrastructure facade
            const { getDatabaseAccess } = await import('@claude-zen/strategic-facades/infrastructure');
            this.dbAccess = getDatabaseAccess();
            // Initialize SmartNeuralCoordinator for intelligent neural backend
            if (this.config.smartNeuralBackend !== undefined) {
                this.smartNeuralCoordinator = new SmartNeuralCoordinator(this.config.smartNeuralBackend || {});
                await this.smartNeuralCoordinator.initialize();
                this.foundationLogger.info('✅ SmartNeuralCoordinator integrated successfully');
            }
            // Load WASM module if available
            if (this.config.wasmPath) {
                await this.loadWasmModule();
            }
            // Initialize GPU acceleration if enabled
            if (this.config.gpuAcceleration) {
                await this.initializeGPU();
            }
            // Initialize database schema for neural networks
            await this.initializeDatabaseSchema();
            this.initialized = true;
            this.foundationLogger.info('Neural Bridge initialized successfully with database, metrics, and smart neural backend integration');
        }
        catch (error) {
            this.foundationLogger.error('Failed to initialize Neural Bridge:', error);
            throw error;
        }
    }
    /**
     * Create a new neural network.
     *
     * @param id
     * @param type
     * @param layers
     */
    async createNetwork(id, type, layers) {
        if (!this.initialized) {
            await this.initialize();
        }
        if (!this.wasmModule) {
            throw new Error('WASM module not loaded');
        }
        try {
            // Create the actual WASM network using our Rust implementation
            const layersArray = new Uint32Array(layers);
            const wasmNetwork = new this.wasmModule.WasmNetwork(layersArray);
            // Store the WASM network instance
            this.networks.set(id, wasmNetwork);
            // Store metadata separately for status tracking
            const metadata = {
                id,
                type,
                layers,
                status: 'idle',
            };
            this.networkMetadata.set(id, metadata);
            // Persist network metadata to database
            if (this.dbAccess) {
                const kv = await this.dbAccess.getKV('neural');
                await kv.set(`metadata:${id}`, JSON.stringify(metadata));
                await kv.set(`layers:${id}`, JSON.stringify(layers));
            }
            this.foundationLogger.info(`Created WASM neural network: ${id} (${type}) with layers: [${layers.join(', ')}]`);
            return id;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.foundationLogger.error(`Failed to create network ${id}:`, error);
            throw new Error(`Network creation failed: ${errorMessage}`);
        }
    }
    /**
     * Train a neural network.
     *
     * @param networkId
     * @param trainingData
     * @param epochs
     */
    async trainNetwork(networkId, trainingData, epochs = 1000) {
        const wasmNetwork = this.networks.get(networkId);
        const metadata = this.networkMetadata.get(networkId);
        if (!wasmNetwork || !metadata) {
            throw new Error(`Network not found: ${networkId}`);
        }
        if (!this.config.enableTraining) {
            throw new Error('Training is disabled in configuration');
        }
        metadata.status = 'training';
        this.foundationLogger.info(`Training WASM network ${networkId} for ${epochs} epochs`);
        try {
            const startTime = Date.now();
            // Flatten the training data into Float32Arrays for WASM
            const flatInputs = new Float32Array(trainingData.inputs.flat());
            const flatOutputs = new Float32Array(trainingData.outputs.flat());
            // Call the actual WASM training function
            const finalError = wasmNetwork.train(flatInputs, flatOutputs, epochs);
            const trainingTime = Date.now() - startTime;
            metadata.status = 'idle';
            // Store training metrics in database
            if (this.dbAccess) {
                const kv = await this.dbAccess.getKV('neural');
                await kv.set(`training:${networkId}:${Date.now()}`, JSON.stringify({
                    epochs,
                    finalError,
                    trainingTime,
                    timestamp: new Date().toISOString()
                }));
            }
            this.foundationLogger.info(`WASM training completed for ${networkId} in ${trainingTime}ms with final error: ${finalError}`);
            return true;
        }
        catch (error) {
            metadata.status = 'error';
            this.foundationLogger.error(`WASM training failed for ${networkId}:`, error);
            return false;
        }
    }
    /**
     * Make predictions with a neural network.
     *
     * @param networkId
     * @param inputs
     */
    async predict(networkId, inputs) {
        const wasmNetwork = this.networks.get(networkId);
        const metadata = this.networkMetadata.get(networkId);
        if (!wasmNetwork || !metadata) {
            throw new Error(`Network not found: ${networkId}`);
        }
        metadata.status = 'predicting';
        const startTime = Date.now();
        try {
            // Convert inputs to Float32Array for WASM
            const inputsArray = new Float32Array(inputs);
            // Call the actual WASM predict function
            const outputsArray = wasmNetwork.predict(inputsArray);
            // Convert the result back to a standard number array
            const outputs = Array.from(outputsArray);
            const processingTime = Date.now() - startTime;
            metadata.status = 'idle';
            return {
                outputs,
                confidence: this.calculateConfidence(outputs),
                processingTime,
            };
        }
        catch (error) {
            metadata.status = 'error';
            this.foundationLogger.error(`WASM prediction failed for ${networkId}:`, error);
            throw error;
        }
    }
    /**
     * Calculate confidence from network outputs.
     * For softmax outputs, this would be the max probability.
     * For regression, this could be based on output variance.
     *
     * @param outputs
     */
    calculateConfidence(outputs) {
        if (outputs.length === 0)
            return 0;
        // For classification (softmax-like outputs), use max value
        if (outputs.every(x => x >= 0 && x <= 1)) {
            return Math.max(...outputs);
        }
        // For regression or other outputs, use a different heuristic
        // This is a simple approach - could be more sophisticated
        const mean = outputs.reduce((a, b) => a + b, 0) / outputs.length;
        const variance = outputs.reduce((a, b) => a + (b - mean) ** 2, 0) / outputs.length;
        return Math.max(0, Math.min(1, 1 - variance)); // Lower variance = higher confidence
    }
    /**
     * Get network status.
     *
     * @param networkId
     */
    getNetworkStatus(networkId) {
        return this.networkMetadata.get(networkId);
    }
    /**
     * List all networks.
     */
    listNetworks() {
        return Array.from(this.networkMetadata.values());
    }
    /**
     * Remove a network.
     *
     * @param networkId
     */
    removeNetwork(networkId) {
        const wasmNetwork = this.networks.get(networkId);
        if (wasmNetwork) {
            // WASM networks are automatically cleaned up when they go out of scope
            // due to the Drop implementation in Rust
            this.networks.delete(networkId);
        }
        return this.networkMetadata.delete(networkId);
    }
    /**
     * Get neural system stats.
     */
    getStats() {
        const networks = Array.from(this.networkMetadata.values());
        return {
            totalNetworks: networks.length,
            activeNetworks: networks.filter((n) => n.status !== 'idle').length,
            trainingNetworks: networks.filter((n) => n.status === 'training').length,
            gpuEnabled: !!this.config.gpuAcceleration,
            wasmEnabled: !!this.wasmModule,
        };
    }
    async loadWasmModule() {
        this.foundationLogger.info('Loading WASM module...');
        try {
            // Dynamically import the WASM module generated by wasm-pack
            const wasmModule = await import(/* @vite-ignore */ `${this.config.wasmPath}/claude_zen_neural.js`);
            // Initialize the WASM module
            await wasmModule.default();
            // Store the module for later use
            this.wasmModule = wasmModule;
            this.foundationLogger.info('WASM module loaded and initialized successfully');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.foundationLogger.error('Failed to load WASM module:', error);
            throw new Error(`WASM module loading failed: ${errorMessage}`);
        }
    }
    async initializeGPU() {
        // In a real implementation, this would initialize GPU acceleration
        // using the WebGPU components from the integrated system
        this.foundationLogger.info('Initializing GPU acceleration...');
        // Simulate GPU initialization
        await new Promise((resolve) => setTimeout(resolve, 200));
        this.foundationLogger.info('GPU acceleration initialized');
    }
    /**
     * Initialize database schema for neural networks using foundation storage.
     */
    async initializeDatabaseSchema() {
        if (!this.dbAccess) {
            this.foundationLogger.warn('Database access not available, skipping schema initialization');
            return;
        }
        try {
            this.foundationLogger.info('Initializing neural network database schema...');
            // Initialize any required database tables or collections
            // The foundation database layer handles the actual schema creation
            this.foundationLogger.info('Neural network database schema initialized successfully');
        }
        catch (error) {
            this.foundationLogger.error('Failed to initialize database schema:', error);
            throw error;
        }
    }
    /**
     * Generate neural embeddings using SmartNeuralCoordinator
     *
     * @param text - Text to generate embeddings for
     * @param options - Optional embedding configuration
     * @returns Promise with embedding result
     */
    async generateEmbedding(text, options) {
        if (!this.smartNeuralCoordinator) {
            throw new Error('SmartNeuralCoordinator not initialized. Enable smartNeuralBackend in config.');
        }
        const request = {
            text,
            context: options?.context,
            priority: options?.priority || 'medium',
            qualityLevel: options?.qualityLevel || 'standard'
        };
        return await this.smartNeuralCoordinator.generateEmbedding(request);
    }
    /**
     * Get SmartNeuralCoordinator statistics
     */
    getSmartNeuralStats() {
        if (!this.smartNeuralCoordinator) {
            return {
                available: false,
                reason: 'SmartNeuralCoordinator not initialized'
            };
        }
        return {
            available: true,
            stats: this.smartNeuralCoordinator.getCoordinatorStats()
        };
    }
    /**
     * Clear SmartNeuralCoordinator cache
     */
    async clearSmartNeuralCache() {
        if (!this.smartNeuralCoordinator) {
            this.foundationLogger.warn('SmartNeuralCoordinator not available for cache clearing');
            return;
        }
        await this.smartNeuralCoordinator.clearCache();
        this.foundationLogger.info('SmartNeuralCoordinator cache cleared');
    }
    /**
     * Shutdown neural bridge.
     */
    async shutdown() {
        this.foundationLogger.info('Shutting down Neural Bridge...');
        // Shutdown SmartNeuralCoordinator
        if (this.smartNeuralCoordinator) {
            await this.smartNeuralCoordinator.shutdown();
            this.smartNeuralCoordinator = null;
        }
        // Stop all training processes by updating metadata
        for (const metadata of this.networkMetadata.values()) {
            if (metadata.status === 'training') {
                metadata.status = 'idle';
            }
        }
        // Clear WASM networks (will trigger Drop implementation in Rust)
        this.networks.clear();
        this.networkMetadata.clear();
        this.wasmModule = null;
        this.initialized = false;
        this.foundationLogger.info('Neural Bridge shutdown complete');
    }
};
NeuralBridge = NeuralBridge_1 = __decorate([
    __param(0, inject(TOKENS.Logger)),
    __metadata("design:paramtypes", [Object, Object])
], NeuralBridge);
export { NeuralBridge };
// Export convenience functions
export async function createNeuralNetwork(id, type, layers, config) {
    const logger = getLogger('Neural');
    const bridge = NeuralBridge.getInstance(logger, config);
    return await bridge.createNetwork(id, type, layers);
}
export async function trainNeuralNetwork(networkId, trainingData, epochs) {
    const logger = getLogger('Neural');
    const bridge = NeuralBridge.getInstance(logger);
    return await bridge.trainNetwork(networkId, trainingData, epochs);
}
export async function predictWithNetwork(networkId, inputs) {
    const logger = getLogger('Neural');
    const bridge = NeuralBridge.getInstance(logger);
    return await bridge.predict(networkId, inputs);
}
//# sourceMappingURL=neural-bridge.js.map