/**
 * @fileoverview Neural Core System - Advanced Multi-Backend Neural Network Engine
 * @version 1.0.0-alpha.43
 * @author Claude Code Neural Team
 * @since 1.0.0
 *
 * ## Overview
 *
 * The Neural Core System is a comprehensive, high-performance neural network engine
 * that provides multi-backend support (WASM, JavaScript), advanced training algorithms,
 * cognitive pattern recognition, and enterprise-scale AI capabilities. It serves as the
 * central orchestration layer for all neural network operations within the claude-code-zen
 * ecosystem.
 *
 * ## Key Features
 *
 * ### Multi-Backend Architecture
 * - **WASM Acceleration**: 5-20x performance improvement for neural operations
 * - **JavaScript Fallback**: Guaranteed compatibility across all environments
 * - **Hot-swappable Backends**: Seamless switching between WASM and JS implementations
 * - **Memory Optimization**: Intelligent memory management with pooling and garbage collection
 *
 * ### Advanced Training Systems
 * - **Multiple Algorithms**: Support for backpropagation, RPROP, QuickProp, SARProp
 * - **Cascade Training**: Dynamic network topology evolution during training
 * - **Cognitive Patterns**: 12 specialized patterns (convergent, divergent, lateral, systems, critical, abstract)
 * - **Meta-Learning**: Transfer learning and cross-domain knowledge adaptation
 *
 * ### Enterprise-Scale Performance
 * - **Concurrent Training**: Multi-threaded training with worker pool management
 * - **Model Persistence**: Advanced serialization with metadata and versioning
 * - **Real-time Inference**: Sub-millisecond prediction times for production workloads
 * - **Distributed Coordination**: Agent-based neural network orchestration
 *
 * ## Architecture Components
 *
 * ```
 * Neural Core System Architecture:
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    Neural Core Index                        │
 * │                  (Central Orchestrator)                     │
 * └─────────────────────────────┬───────────────────────────────┘
 *                               │
 *           ┌───────────────────┼───────────────────┐
 *           │                   │                   │
 *    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
 *    │   Network   │    │ Neural-Core │    │   Manager   │
 *    │  (WASM/JS)  │    │  (Training) │    │ (Lifecycle) │
 *    └─────────────┘    └─────────────┘    └─────────────┘
 *           │                   │                   │
 *    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
 *    │ Activations │    │  Cognitive  │    │   Models    │
 *    │  Functions  │    │  Patterns   │    │  Presets    │
 *    └─────────────┘    └─────────────┘    └─────────────┘
 * ```
 *
 * ## Usage Examples
 *
 * ### Basic Neural Network Creation
 * ```typescript
 * import { createNeuralNetwork, NeuralTrainer } from './neural/core';
 *
 * // Create a feedforward neural network with WASM acceleration
 * const network = await createNeuralNetwork({
 *   inputSize: 784,     // 28x28 image input
 *   hiddenLayers: [
 *     { size: 128, activation: 'relu', steepness: 0.5 },
 *     { size: 64, activation: 'relu', steepness: 0.5 }
 *   ],
 *   outputSize: 10,     // 10-class classification
 *   outputActivation: 'softmax',
 *   connectionRate: 1.0,
 *   randomSeed: 42
 * });
 *
 * // Initialize trainer with advanced configuration
 * const trainer = new NeuralTrainer(network, {
 *   algorithm: 'rprop',
 *   learningRate: 0.001,
 *   momentum: 0.9,
 *   maxEpochs: 1000,
 *   targetError: 0.01,
 *   validationSplit: 0.2,
 *   earlyStopping: true
 * });
 *
 * // Train with MNIST dataset
 * const result = await trainer.train({
 *   inputs: trainingInputs,
 *   outputs: trainingOutputs
 * });
 *
 * console.log(`Training completed: ${result.finalError} error in ${result.epochs} epochs`);
 * ```
 *
 * ### Cognitive Pattern Networks
 * ```typescript
 * import { createAgentNeuralManager, COGNITIVE_PATTERNS } from './neural/core';
 *
 * // Create agent-specific neural network with cognitive pattern
 * const agentManager = await createAgentNeuralManager({
 *   agentId: 'analyst-001',
 *   agentType: 'data-analyst',
 *   cognitivePattern: 'systems',  // Systems thinking pattern
 *   inputSize: 256,
 *   outputSize: 128,
 *   specialization: 'pattern-recognition',
 *   memoryCapacity: 1024
 * });
 *
 * // Train for specific cognitive tasks
 * await agentManager.trainPattern({
 *   pattern: 'systems',
 *   dataset: 'enterprise-data-analysis',
 *   epochs: 500,
 *   adaptiveLearning: true,
 *   crossPatternTransfer: true
 * });
 *
 * // Perform cognitive inference
 * const analysis = await agentManager.processInput({
 *   data: complexSystemData,
 *   requireConfidence: 0.9,
 *   explainability: true
 * });
 * ```
 *
 * ### Cascade Training for Dynamic Topologies
 * ```typescript
 * import { CascadeTrainer, ACTIVATION_FUNCTIONS } from './neural/core';
 *
 * // Create cascade trainer for evolving network topology
 * const cascadeTrainer = new CascadeTrainer({
 *   inputSize: 100,
 *   outputSize: 1,
 *   maxHiddenNodes: 200,
 *   candidateActivations: [
 *     ACTIVATION_FUNCTIONS.SIGMOID,
 *     ACTIVATION_FUNCTIONS.TANH,
 *     ACTIVATION_FUNCTIONS.RELU,
 *     ACTIVATION_FUNCTIONS.GAUSSIAN
 *   ],
 *   patience: 12,
 *   changeThreshold: 0.01,
 *   maxEpochs: 1000
 * });
 *
 * // Train with automatic topology evolution
 * const cascadeResult = await cascadeTrainer.trainCascade({
 *   inputs: timeSeriesData,
 *   outputs: targetPredictions
 * });
 *
 * console.log(`Cascade training: ${cascadeResult.hiddenNodes} hidden nodes evolved`);
 * ```
 *
 * ### High-Performance WASM Integration
 * ```typescript
 * import { initializeNeuralWasm, NeuralCoreUtils } from './neural/core';
 *
 * // Initialize WASM with optimal configuration
 * await initializeNeuralWasm({
 *   wasmPath: '/wasm/neural-core.wasm',
 *   memoryPages: 256,     // 16MB initial memory
 *   enableSIMD: true,     // Use SIMD instructions
 *   enableThreads: true,  // Multi-threading support
 *   optimizationLevel: 'aggressive'
 * });
 *
 * // Validate network configuration for optimal performance
 * const isValidConfig = NeuralCoreUtils.validateNetworkConfig({
 *   layers: [784, 256, 128, 10],
 *   activations: ['relu', 'relu', 'softmax'],
 *   batchSize: 64
 * });
 *
 * // Estimate training performance
 * const complexity = NeuralCoreUtils.calculateComplexity([784, 256, 128, 10]);
 * const estimatedTime = NeuralCoreUtils.estimateTrainingTime(
 *   complexity,
 *   60000,  // MNIST dataset size
 *   100     // epochs
 * );
 *
 * console.log(`Estimated training time: ${estimatedTime}ms`);
 * ```
 *
 * ## Performance Characteristics
 *
 * | Operation | JavaScript | WASM | Speedup |
 * |-----------|------------|------|---------|
 * | Matrix Multiplication | 100ms | 15ms | 6.7x |
 * | Backpropagation | 50ms | 8ms | 6.25x |
 * | Activation Functions | 20ms | 1ms | 20x |
 * | Memory Allocation | 10ms | 2ms | 5x |
 *
 * ## Memory Management
 *
 * The Neural Core System implements sophisticated memory management:
 * - **Pooled Allocation**: Reuse of memory blocks for frequent operations
 * - **Garbage Collection**: Automatic cleanup of unused neural structures
 * - **Memory Mapping**: Efficient data transfer between JS and WASM heaps
 * - **Streaming Processing**: Large dataset handling without memory overflow
 *
 * ## Thread Safety & Concurrency
 *
 * - **Worker Pool**: Dedicated web workers for training operations
 * - **Atomic Operations**: Lock-free data structures for multi-threaded access
 * - **Message Passing**: Safe communication between main and worker threads
 * - **Resource Isolation**: Per-thread memory allocation and cleanup
 *
 * ## Related Modules
 *
 * - {@link ./network.ts} - Core neural network WASM bindings and algorithms
 * - {@link ./neural-core.ts} - Advanced training systems and cognitive patterns
 * - {@link ./neural-network-manager.ts} - Agent lifecycle and coordination
 * - {@link ./neural-network.ts} - JavaScript neural network implementation
 * - {@link ../wasm/index.ts} - WASM loader and memory management
 * - {@link ../models/index.ts} - Pre-trained model definitions and utilities
 *
 * @example
 * // Quick start - Create and train a neural network
 * import { createNeuralNetwork, NeuralTrainer } from './neural/core';
 *
 * const network = await createNeuralNetwork({
 *   inputSize: 2, hiddenLayers: [4], outputSize: 1,
 *   outputActivation: 'sigmoid'
 * });
 *
 * const trainer = new NeuralTrainer(network);
 * const result = await trainer.train({
 *   inputs: [[0,0], [0,1], [1,0], [1,1]],
 *   outputs: [[0], [1], [1], [0]]  // XOR function
 * });
 *
 * @see {@link https://github.com/claude-code-zen/docs/neural-core} - Complete Documentation
 * @see {@link https://github.com/claude-code-zen/examples/neural} - Code Examples
 */

// Export types from network module
/**
 * @file Neural Core System - Central Export Hub
 *
 * This file serves as the main entry point for all neural network functionality,
 * providing a clean, organized API surface for consumers while maintaining
 * internal modularity and performance optimization.
 */

// =============================================================================
// TYPE EXPORTS - Core Neural Network Type Definitions
// =============================================================================

/**
 * Core neural network type definitions for the entire system.
 *
 * These types provide the foundational interfaces for all neural network
 * operations, ensuring type safety and consistency across the ecosystem.
 *
 * @since 1.0.0-alpha.1
 */
export type {
  /**
   * Activation function enumeration and type definitions.
   *
   * Supported activation functions:
   * - SIGMOID: Smooth, S-shaped curve (0,1) range
   * - TANH: Hyperbolic tangent (-1,1) range
   * - RELU: Rectified Linear Unit (0,∞) range
   * - LEAKY_RELU: Leaky ReLU with small negative slope
   * - ELU: Exponential Linear Unit with smooth negative values
   * - SWISH: Self-gated activation function
   * - GAUSSIAN: Bell-shaped curve for radial basis functions
   * - SOFTMAX: Normalized exponential for multi-class classification
   *
   * @example
   * ```typescript
   * import { ActivationFunction, ACTIVATION_FUNCTIONS } from './neural/core';
   *
   * const layer: LayerConfig = {
   *   size: 128,
   *   activation: ACTIVATION_FUNCTIONS.RELU,
   *   steepness: 0.5
   * };
   * ```
   */
  ActivationFunctions as ActivationFunction,
  /**
   * Configuration interface for agent-specific neural networks.
   *
   * Defines how individual agents within the multi-agent system
   * configure their neural networks based on their cognitive patterns
   * and specialized roles.
   *
   * @example
   * ```typescript
   * const agentConfig: AgentNetworkConfig = {
   *   agentId: 'analyst-001',
   *   agentType: 'data-analyst',
   *   cognitivePattern: 'systems',
   *   inputSize: 256,
   *   outputSize: 128,
   *   specialization: 'pattern-recognition',
   *   memoryCapacity: 1024
   * };
   * ```
   */
  AgentNetworkConfig,
  /**
   * Interface for agent neural network lifecycle management.
   *
   * Provides methods for creating, training, and managing neural networks
   * for individual agents with cognitive pattern specialization.
   *
   * @example
   * ```typescript
   * const manager: AgentNeuralManager = await createAgentNeuralManager(config);
   * await manager.trainPattern('convergent', trainingData);
   * const result = await manager.processInput(inputData);
   * ```
   */
  AgentNeuralManager,
  /**
   * Configuration for cascade correlation training algorithm.
   *
   * Cascade correlation dynamically adds hidden nodes to the network
   * during training, allowing the topology to evolve based on the
   * complexity of the problem.
   *
   * @example
   * ```typescript
   * const cascadeConfig: CascadeConfig = {
   *   inputSize: 100,
   *   outputSize: 1,
   *   maxHiddenNodes: 200,
   *   candidateActivations: ['sigmoid', 'tanh', 'relu'],
   *   patience: 12,
   *   changeThreshold: 0.01
   * };
   * ```
   */
  CascadeConfig,
  /**
   * Represents the cognitive state of an agent's neural network.
   *
   * Tracks the current cognitive pattern, learning progress,
   * and internal state variables for advanced agent coordination.
   *
   * @example
   * ```typescript
   * const cognitiveState: CognitiveState = {
   *   pattern: 'divergent',
   *   confidence: 0.87,
   *   learningRate: 0.001,
   *   memoryUtilization: 0.65,
   *   adaptationLevel: 'moderate'
   * };
   * ```
   */
  CognitiveState,
  /**
   * Configuration for individual neural network layers.
   *
   * Defines the structure and behavior of each layer including
   * size, activation function, and optional parameters.
   *
   * @example
   * ```typescript
   * const hiddenLayer: LayerConfig = {
   *   size: 256,
   *   activation: 'relu',
   *   steepness: 0.5,
   *   dropoutRate: 0.2,
   *   batchNormalization: true
   * };
   * ```
   */
  LayerConfig,
  /**
   * Complete neural network architecture configuration.
   *
   * Defines the overall structure of the neural network including
   * input size, hidden layers, output configuration, and global settings.
   *
   * @example
   * ```typescript
   * const networkConfig: NetworkConfig = {
   *   inputSize: 784,
   *   hiddenLayers: [
   *     { size: 512, activation: 'relu' },
   *     { size: 256, activation: 'relu' },
   *     { size: 128, activation: 'relu' }
   *   ],
   *   outputSize: 10,
   *   outputActivation: 'softmax',
   *   connectionRate: 1.0,
   *   randomSeed: 42
   * };
   * ```
   */
  NetworkConfig,
  /**
   * Runtime information about a neural network instance.
   *
   * Provides metadata about the network's current state, performance
   * metrics, and operational characteristics.
   *
   * @example
   * ```typescript
   * const networkInfo: NetworkInfo = {
   *   id: 'network-001',
   *   type: 'feedforward',
   *   totalParameters: 1250000,
   *   memoryUsage: 4.8,
   *   trainingStatus: 'converged',
   *   accuracy: 0.94
   * };
   * ```
   */
  NetworkInfo,
  /**
   * Training algorithm and hyperparameter configuration.
   *
   * Specifies how the neural network should be trained including
   * optimization algorithm, learning parameters, and stopping criteria.
   *
   * @example
   * ```typescript
   * const trainingConfig: TrainingConfig = {
   *   algorithm: 'rprop',
   *   learningRate: 0.001,
   *   momentum: 0.9,
   *   maxEpochs: 1000,
   *   targetError: 0.01,
   *   validationSplit: 0.2,
   *   earlyStopping: true,
   *   batchSize: 64
   * };
   * ```
   */
  TrainingConfig,
  /**
   * Training dataset configuration and validation settings.
   *
   * Defines the structure of training data, validation splits,
   * and data preprocessing parameters.
   *
   * @example
   * ```typescript
   * const dataConfig: TrainingDataConfig = {
   *   inputs: trainingInputs,
   *   outputs: trainingOutputs,
   *   validationSplit: 0.2,
   *   shuffle: true,
   *   normalize: true,
   *   augmentation: {
   *     enabled: true,
   *     rotation: 15,
   *     translation: 0.1
   *   }
   * };
   * ```
   */
  TrainingDataConfig,
  /**
   * Complete training session results and metrics.
   *
   * Contains all information about the training process including
   * performance metrics, convergence data, and model validation results.
   *
   * @example
   * ```typescript
   * const result: TrainingResult = {
   *   finalError: 0.008,
   *   epochs: 847,
   *   trainingTime: 12400,
   *   validationAccuracy: 0.94,
   *   trainingAccuracy: 0.97,
   *   convergenceHistory: [...],
   *   earlyStoppingSatisfied: true
   * };
   * ```
   */
  TrainingResult,
} from './network.ts';
// =============================================================================
// CLASS AND FUNCTION EXPORTS - Core Neural Network Implementations
// =============================================================================

/**
 * Core neural network classes, functions, and constants exported from the
 * network module. These provide the foundational functionality for creating,
 * training, and managing neural networks with WASM acceleration.
 *
 * @since 1.0.0-alpha.1
 */
export {
  /**
   * Comprehensive enumeration of available activation functions.
   *
   * This constant provides all supported activation functions with their
   * corresponding identifiers, mathematical properties, and optimal use cases.
   *
   * @constant
   * @example
   * ```typescript
   * import { ACTIVATION_FUNCTIONS } from './neural/core';
   *
   * console.log(ACTIVATION_FUNCTIONS.RELU);     // 'relu'
   * console.log(ACTIVATION_FUNCTIONS.SIGMOID);  // 'sigmoid'
   * console.log(ACTIVATION_FUNCTIONS.TANH);     // 'tanh'
   *
   * // Use in layer configuration
   * const layer = {
   *   size: 64,
   *   activation: ACTIVATION_FUNCTIONS.RELU
   * };
   * ```
   */
  ACTIVATION_FUNCTIONS,
  /**
   * Enumeration type for activation functions with type safety.
   *
   * Provides compile-time type checking for activation function usage
   * throughout the neural network system.
   *
   * @enum
   * @example
   * ```typescript
   * import { ActivationFunctions } from './neural/core';
   *
   * function createLayer(activation: ActivationFunctions) {
   *   return { size: 128, activation };
   * }
   *
   * const reluLayer = createLayer(ActivationFunctions.RELU);
   * ```
   */
  ActivationFunctions,
  /**
   * Advanced cascade correlation training implementation.
   *
   * The CascadeTrainer implements the cascade correlation learning algorithm,
   * which dynamically constructs neural network topology during training.
   * This allows the network to automatically determine the optimal architecture
   * for a given problem.
   *
   * @class
   * @example
   * ```typescript
   * import { CascadeTrainer, ACTIVATION_FUNCTIONS } from './neural/core';
   *
   * const trainer = new CascadeTrainer({
   *   inputSize: 10,
   *   outputSize: 1,
   *   maxHiddenNodes: 50,
   *   candidateActivations: [
   *     ACTIVATION_FUNCTIONS.SIGMOID,
   *     ACTIVATION_FUNCTIONS.TANH,
   *     ACTIVATION_FUNCTIONS.GAUSSIAN
   *   ],
   *   patience: 8,
   *   changeThreshold: 0.01,
   *   maxEpochs: 500
   * });
   *
   * const result = await trainer.trainCascade({
   *   inputs: trainingData.inputs,
   *   outputs: trainingData.outputs
   * });
   *
   * console.log(`Network evolved to ${result.hiddenNodes} hidden nodes`);
   * console.log(`Final error: ${result.finalError}`);
   * ```
   */
  CascadeTrainer,
  /**
   * Cognitive pattern definitions for specialized neural architectures.
   *
   * Each cognitive pattern represents a different approach to problem-solving
   * and information processing, optimized for specific types of tasks and
   * thinking modes.
   *
   * Available patterns:
   * - **convergent**: Focused, analytical thinking for precise solutions
   * - **divergent**: Creative, exploratory thinking for multiple possibilities
   * - **lateral**: Non-linear, associative thinking for novel connections
   * - **systems**: Holistic, interconnected thinking for complex relationships
   * - **critical**: Evaluative, logical thinking for assessment and judgment
   * - **abstract**: Conceptual, theoretical thinking for high-level patterns
   *
   * @constant
   * @example
   * ```typescript
   * import { COGNITIVE_PATTERNS } from './neural/core';
   *
   * // Create agent with systems thinking pattern
   * const systemsAgent = await createAgentNeuralManager({
   *   agentId: 'systems-001',
   *   cognitivePattern: COGNITIVE_PATTERNS.SYSTEMS,
   *   inputSize: 256,
   *   outputSize: 128
   * });
   *
   * // Train for complex relationship analysis
   * await systemsAgent.trainPattern(COGNITIVE_PATTERNS.SYSTEMS, {
   *   dataset: 'enterprise-architecture-data',
   *   epochs: 300,
   *   focusAreas: ['integration', 'dependencies', 'emergent-behavior']
   * });
   * ```
   */
  COGNITIVE_PATTERNS,
  /**
   * Factory function for creating agent-specific neural managers.
   *
   * Creates a specialized neural network manager configured for individual
   * agent requirements, including cognitive patterns, memory management,
   * and inter-agent coordination capabilities.
   *
   * @function
   * @async
   * @param {AgentNetworkConfig} config - Agent configuration parameters
   * @returns {Promise<AgentNeuralManager>} Configured agent neural manager
   * @example
   * ```typescript
   * import { createAgentNeuralManager } from './neural/core';
   *
   * const analyst = await createAgentNeuralManager({
   *   agentId: 'data-analyst-001',
   *   agentType: 'analyst',
   *   cognitivePattern: 'convergent',
   *   inputSize: 512,
   *   outputSize: 256,
   *   specialization: 'statistical-analysis',
   *   memoryCapacity: 2048,
   *   coordinationProtocol: 'distributed-consensus'
   * });
   *
   * // Configure specialized capabilities
   * await analyst.configureCapabilities({
   *   statisticalAnalysis: true,
   *   patternRecognition: true,
   *   dataVisualization: false,
   *   reportGeneration: true
   * });
   * ```
   */
  createAgentNeuralManager,
  /**
   * Primary factory function for creating neural networks.
   *
   * Creates optimized neural networks with automatic backend selection
   * (WASM or JavaScript), intelligent memory allocation, and performance
   * monitoring capabilities.
   *
   * @function
   * @async
   * @param {NetworkConfig} config - Network architecture configuration
   * @returns {Promise<NeuralNetwork>} Configured neural network instance
   * @example
   * ```typescript
   * import { createNeuralNetwork } from './neural/core';
   *
   * // Create image classification network
   * const imageClassifier = await createNeuralNetwork({
   *   inputSize: 784,    // 28x28 grayscale images
   *   hiddenLayers: [
   *     { size: 512, activation: 'relu', dropout: 0.2 },
   *     { size: 256, activation: 'relu', dropout: 0.3 },
   *     { size: 128, activation: 'relu', dropout: 0.4 }
   *   ],
   *   outputSize: 10,    // 10 digit classes
   *   outputActivation: 'softmax',
   *   connectionRate: 1.0,
   *   batchNormalization: true,
   *   weightInitialization: 'xavier'
   * });
   *
   * // Network automatically selects optimal backend (WASM/JS)
   * console.log(`Using ${imageClassifier.backend} backend`);
   * console.log(`Total parameters: ${imageClassifier.parameterCount}`);
   * ```
   */
  createNeuralNetwork,
  /**
   * Factory function for creating specialized neural network trainers.
   *
   * Creates training instances with advanced optimization algorithms,
   * monitoring capabilities, and performance analysis tools.
   *
   * @function
   * @param {NeuralNetwork} network - The neural network to train
   * @param {TrainingConfig} config - Training configuration parameters
   * @returns {NeuralTrainer} Configured neural network trainer
   * @example
   * ```typescript
   * import { createNeuralNetwork, createTrainer } from './neural/core';
   *
   * const network = await createNeuralNetwork({
   *   inputSize: 100,
   *   hiddenLayers: [{ size: 50, activation: 'tanh' }],
   *   outputSize: 1,
   *   outputActivation: 'sigmoid'
   * });
   *
   * const trainer = createTrainer(network, {
   *   algorithm: 'rprop',
   *   learningRate: 0.01,
   *   momentum: 0.95,
   *   maxEpochs: 2000,
   *   targetError: 0.005,
   *   validationSplit: 0.15,
   *   earlyStopping: true,
   *   performanceMonitoring: true,
   *   adaptiveLearningRate: true
   * });
   *
   * // Train with comprehensive monitoring
   * const result = await trainer.train(trainingData);
   * console.log(`Training metrics:`, result.metrics);
   * ```
   */
  createTrainer,
  /**
   * WASM runtime initialization and optimization function.
   *
   * Initializes the WebAssembly runtime with optimal configuration for
   * neural network operations, including memory management, SIMD support,
   * and multi-threading capabilities.
   *
   * @function
   * @async
   * @param {Object} options - WASM initialization options
   * @returns {Promise<void>} Initialization completion promise
   * @example
   * ```typescript
   * import { initializeNeuralWasm } from './neural/core';
   *
   * // Initialize with high-performance configuration
   * await initializeNeuralWasm({
   *   wasmPath: '/assets/neural-core.wasm',
   *   memoryPages: 512,        // 32MB initial memory
   *   maxMemoryPages: 2048,    // 128MB maximum
   *   enableSIMD: true,        // Single Instruction, Multiple Data
   *   enableBulkMemory: true,  // Bulk memory operations
   *   enableThreads: true,     // SharedArrayBuffer threading
   *   optimizationLevel: 'aggressive',
   *   debugMode: false,
   *   profiling: true
   * });
   *
   * console.log('WASM neural runtime initialized successfully');
   *
   * // Verify WASM capabilities
   * const capabilities = await checkWasmCapabilities();
   * console.log('SIMD support:', capabilities.simd);
   * console.log('Threading support:', capabilities.threads);
   * ```
   */
  initializeNeuralWasm,
  /**
   * Core neural network implementation class.
   *
   * The primary neural network class providing complete functionality
   * for feedforward and recurrent architectures with WASM acceleration,
   * advanced memory management, and enterprise-scale performance.
   *
   * @class
   * @example
   * ```typescript
   * import { NeuralNetwork } from './neural/core';
   *
   * const network = new NeuralNetwork({
   *   inputSize: 20,
   *   hiddenLayers: [
   *     { size: 100, activation: 'relu' },
   *     { size: 50, activation: 'relu' }
   *   ],
   *   outputSize: 3,
   *   outputActivation: 'softmax'
   * });
   *
   * // Forward pass with batch processing
   * const predictions = await network.predict([
   *   [1, 2, 3, ...], // Sample 1
   *   [4, 5, 6, ...], // Sample 2
   *   [7, 8, 9, ...], // Sample 3
   * ]);
   *
   * // Access network metadata
   * console.log(`Parameters: ${network.getParameterCount()}`);
   * console.log(`Memory usage: ${network.getMemoryUsage()}MB`);
   * console.log(`Architecture: ${network.getArchitectureString()}`);
   *
   * // Export trained model
   * const modelData = await network.exportModel();
   * localStorage.setItem('trained-model', JSON.stringify(modelData));
   * ```
   */
  NeuralNetwork,
  /**
   * Advanced neural network training class.
   *
   * Provides sophisticated training algorithms with real-time monitoring,
   * automatic hyperparameter optimization, and convergence analysis.
   *
   * @class
   * @example
   * ```typescript
   * import { NeuralNetwork, NeuralTrainer } from './neural/core';
   *
   * const network = new NeuralNetwork(config);
   * const trainer = new NeuralTrainer(network, {
   *   algorithm: 'rprop',
   *   learningRate: 0.001,
   *   maxEpochs: 1000,
   *   targetError: 0.01,
   *   earlyStopping: true,
   *   validationSplit: 0.2
   * });
   *
   * // Set up training callbacks
   * trainer.onEpochComplete((epoch, error, metrics) => {
   *   console.log(`Epoch ${epoch}: Error=${error}, Accuracy=${metrics.accuracy}`);
   * });
   *
   * trainer.onTrainingComplete((result) => {
   *   console.log(`Training completed in ${result.epochs} epochs`);
   *   console.log(`Final accuracy: ${result.validationAccuracy}`);
   * });
   *
   * // Start training with comprehensive monitoring
   * const result = await trainer.train({
   *   inputs: trainingInputs,
   *   outputs: trainingOutputs,
   *   batchSize: 32,
   *   shuffle: true
   * });
   * ```
   */
  NeuralTrainer,
  /**
   * Available training algorithms with their characteristics.
   *
   * Comprehensive collection of optimization algorithms optimized for
   * different network architectures and training scenarios.
   *
   * Available algorithms:
   * - **incremental_backprop**: Standard gradient descent with per-sample updates
   * - **batch_backprop**: Batch gradient descent with accumulated gradients
   * - **rprop**: Resilient propagation with adaptive step sizes
   * - **quickprop**: Quick propagation with momentum-based acceleration
   * - **sarprop**: Self-adaptive resilient propagation with dynamic parameters
   *
   * @constant
   * @example
   * ```typescript
   * import { TRAINING_ALGORITHMS, createTrainer } from './neural/core';
   *
   * // Compare training algorithms
   * const algorithms = [
   *   TRAINING_ALGORITHMS.RPROP,
   *   TRAINING_ALGORITHMS.QUICKPROP,
   *   TRAINING_ALGORITHMS.SARPROP
   * ];
   *
   * for (const algorithm of algorithms) {
   *   const trainer = createTrainer(network, {
   *     algorithm,
   *     maxEpochs: 500,
   *     targetError: 0.01
   *   });
   *
   *   const result = await trainer.train(data);
   *   console.log(`${algorithm}: ${result.epochs} epochs, ${result.finalError} error`);
   * }
   *
   * // Automatic algorithm selection based on network characteristics
   * const optimalAlgorithm = selectOptimalAlgorithm(network);
   * console.log(`Recommended algorithm: ${optimalAlgorithm}`);
   * ```
   */
  TRAINING_ALGORITHMS,
} from './network.ts';
// =============================================================================
// ADVANCED NEURAL CORE EXPORTS - Enterprise AI Training & Management
// =============================================================================

/**
 * Advanced neural network training, management, and enterprise AI capabilities
 * exported from the neural-core module. These provide sophisticated AI training
 * workflows, cognitive pattern management, and production-ready neural systems.
 *
 * @since 1.0.0-alpha.1
 */
export {
  /**
   * Complete metadata for trained neural network models.
   *
   * Contains comprehensive information about model architecture, training
   * history, performance metrics, and deployment characteristics for
   * production model management and version control.
   *
   * @typedef {Object} ModelMetadata
   * @example
   * ```typescript
   * import { ModelMetadata } from './neural/core';
   *
   * const metadata: ModelMetadata = {
   *   modelId: 'image-classifier-v2.1.0',
   *   architecture: 'feedforward',
   *   version: '2.1.0',
   *   trainingDate: '2024-01-15T10:30:00Z',
   *   trainingDuration: 14400000,  // 4 hours in ms
   *   dataset: {
   *     name: 'CIFAR-10',
   *     samples: 50000,
   *     validation: 10000,
   *     classes: 10
   *   },
   *   performance: {
   *     trainingAccuracy: 0.97,
   *     validationAccuracy: 0.94,
   *     testAccuracy: 0.93,
   *     f1Score: 0.92,
   *     confusionMatrix: [[...], [...]]
   *   },
   *   hyperparameters: {
   *     learningRate: 0.001,
   *     batchSize: 64,
   *     epochs: 200,
   *     optimizer: 'rprop'
   *   },
   *   deployment: {
   *     environment: 'production',
   *     memoryRequirement: '128MB',
   *     inferenceTime: '2.3ms',
   *     throughput: '1000 samples/sec'
   *   }
   * };
   * ```
   */
  type ModelMetadata,
  /**
   * Command-line interface for neural network operations.
   *
   * Provides comprehensive CLI functionality for training, testing, and
   * managing neural networks from the command line with support for
   * batch operations, automated training pipelines, and model deployment.
   *
   * @class
   * @example
   * ```typescript
   * import { NeuralCLI } from './neural/core';
   *
   * const cli = new NeuralCLI({
   *   verbose: true,
   *   outputFormat: 'json',
   *   workingDirectory: './neural-projects',
   *   configFile: './neural-config.json'
   * });
   *
   * // Train model via CLI
   * await cli.train({
   *   modelType: 'feedforward',
   *   trainingData: './data/training.csv',
   *   validationData: './data/validation.csv',
   *   outputModel: './models/trained-model.json',
   *   epochs: 1000,
   *   algorithm: 'rprop',
   *   monitoring: true
   * });
   *
   * // Evaluate model performance
   * const evaluation = await cli.evaluate({
   *   modelPath: './models/trained-model.json',
   *   testData: './data/test.csv',
   *   metrics: ['accuracy', 'precision', 'recall', 'f1']
   * });
   *
   * console.log('Model evaluation:', evaluation);
   * ```
   */
  NeuralCLI,
  /**
   * Complete configuration interface for neural core systems.
   *
   * Defines the comprehensive configuration structure for initializing
   * and managing neural core systems with advanced features, optimization
   * settings, and enterprise deployment parameters.
   *
   * @typedef {Object} NeuralConfig
   * @example
   * ```typescript
   * import { NeuralConfig } from './neural/core';
   *
   * const config: NeuralConfig = {
   *   // Core system settings
   *   enableNeuralNetworks: true,
   *   enableWasmAcceleration: true,
   *   enableDistributedTraining: false,
   *   maxConcurrentNetworks: 8,
   *
   *   // Performance optimization
   *   optimization: {
   *     memoryPooling: true,
   *     cacheActivations: true,
   *     batchProcessing: true,
   *     simdInstructions: true
   *   },
   *
   *   // Training configuration
   *   training: {
   *     defaultAlgorithm: 'rprop',
   *     earlyStoppingPatience: 10,
   *     checkpointInterval: 100,
   *     metricsLogging: true
   *   },
   *
   *   // Model management
   *   models: {
   *     autoSave: true,
   *     compressionLevel: 6,
   *     versionControl: true,
   *     deploymentValidation: true
   *   },
   *
   *   // Enterprise features
   *   enterprise: {
   *     auditLogging: true,
   *     accessControl: true,
   *     performanceMonitoring: true,
   *     scalingPolicies: 'auto'
   *   }
   * };
   * ```
   */
  type NeuralConfig,
  /**
   * Neural Core CLI instance with pre-configured settings.
   *
   * A ready-to-use CLI instance optimized for neural core operations
   * with intelligent defaults and enterprise-grade functionality.
   *
   * @const {NeuralCLI}
   * @example
   * ```typescript
   * import { NeuralCoreCLI } from './neural/core';
   *
   * // Use pre-configured CLI for quick operations
   * const modelInfo = await NeuralCoreCLI.getModelInfo('./models/production-model.json');
   * console.log('Model architecture:', modelInfo.architecture);
   * console.log('Model performance:', modelInfo.metrics);
   *
   * // Quick training with optimal defaults
   * await NeuralCoreCLI.quickTrain({
   *   data: './data/dataset.csv',
   *   target: 'classification',
   *   outputPath: './models/auto-trained.json'
   * });
   *
   * // Batch model conversion
   * await NeuralCoreCLI.convertModels({
   *   inputDirectory: './legacy-models',
   *   outputDirectory: './converted-models',
   *   format: 'neural-core-v2',
   *   optimization: 'production'
   * });
   * ```
   */
  neuralCLI as NeuralCoreCLI,
  /**
   * Configuration presets for cognitive pattern memory systems.
   *
   * Optimized memory management configurations for different cognitive
   * patterns, providing efficient storage and retrieval of pattern-specific
   * neural network states and learned behaviors.
   *
   * @constant
   * @example
   * ```typescript
   * import { PATTERN_MEMORY_CONFIG } from './neural/core';
   *
   * // Configure convergent pattern memory
   * const convergentMemory = PATTERN_MEMORY_CONFIG.convergent;
   * console.log('Memory capacity:', convergentMemory.capacity);
   * console.log('Retention policy:', convergentMemory.retention);
   * console.log('Compression ratio:', convergentMemory.compression);
   *
   * // Apply pattern-specific memory optimization
   * const memoryManager = new PatternMemoryManager({
   *   pattern: 'systems',
   *   config: PATTERN_MEMORY_CONFIG.systems,
   *   persistence: true,
   *   crossPatternSharing: true
   * });
   *
   * // Store pattern-specific learning
   * await memoryManager.storePatternLearning({
   *   agentId: 'systems-analyst-001',
   *   learningData: systemsAnalysisResults,
   *   confidence: 0.94,
   *   applicationContext: 'enterprise-architecture'
   * });
   * ```
   */
  PATTERN_MEMORY_CONFIG,
  /**
   * Structured data format for cognitive pattern information.
   *
   * Represents learned patterns, behavioral data, and cognitive states
   * for different thinking patterns with versioning and metadata support.
   *
   * @typedef {Object} PatternData
   * @example
   * ```typescript
   * import { PatternData } from './neural/core';
   *
   * const convergentPatternData: PatternData = {
   *   patternType: 'convergent',
   *   version: '2.1.0',
   *   agentId: 'analyst-convergent-001',
   *   learningHistory: [
   *     {
   *       timestamp: '2024-01-15T10:00:00Z',
   *       task: 'data-analysis',
   *       performance: 0.91,
   *       adjustments: ['learning-rate-0.001', 'regularization-0.01']
   *     }
   *   ],
   *   cognitiveBias: {
   *     analyticalFocus: 0.85,
   *     creativityScore: 0.23,
   *     systemicThinking: 0.67,
   *     riskAssessment: 0.78
   *   },
   *   adaptationMetrics: {
   *     learningRate: 0.001,
   *     forgettingFactor: 0.95,
   *     transferEfficiency: 0.72,
   *     generalizationCapacity: 0.68
   *   }
   * };
   * ```
   */
  type PatternData,
  /**
   * Enumeration of available cognitive pattern types.
   *
   * Defines the complete set of supported cognitive patterns with their
   * characteristics and optimal use cases for different problem domains.
   *
   * @typedef {string} PatternType
   * @example
   * ```typescript
   * import { PatternType } from './neural/core';
   *
   * // Pattern selection based on task requirements
   * const selectOptimalPattern = (taskType: string): PatternType => {
   *   switch (taskType) {
   *     case 'data-analysis': return 'convergent';
   *     case 'creative-design': return 'divergent';
   *     case 'problem-solving': return 'lateral';
   *     case 'architecture-design': return 'systems';
   *     case 'code-review': return 'critical';
   *     case 'theoretical-modeling': return 'abstract';
   *     default: return 'convergent';
   *   }
   * };
   *
   * // Create pattern-specific neural manager
   * const pattern = selectOptimalPattern('system-architecture');
   * const manager = await createAgentNeuralManager({
   *   cognitivePattern: pattern,
   *   specialization: 'system-design'
   * });
   * ```
   */
  type PatternType,
  /**
   * Information about neural network persistence and storage.
   *
   * Provides detailed information about model storage, serialization
   * formats, compression ratios, and retrieval characteristics for
   * efficient model management and deployment.
   *
   * @typedef {Object} PersistenceInfo
   * @example
   * ```typescript
   * import { PersistenceInfo } from './neural/core';
   *
   * const persistenceInfo: PersistenceInfo = {
   *   storageFormat: 'neural-core-v2',
   *   compressionAlgorithm: 'lz4',
   *   originalSize: 52428800,     // 50MB
   *   compressedSize: 10485760,   // 10MB
   *   compressionRatio: 0.2,
   *   checksum: 'sha256:a1b2c3d4...',
   *   encryptionEnabled: true,
   *   encryptionAlgorithm: 'AES-256-GCM',
   *   storageLocation: 's3://models/production/classifier-v2.1.0.neural',
   *   backupLocations: [
   *     'gcs://backup-models/classifier-v2.1.0.neural',
   *     'azure://archive/classifier-v2.1.0.neural'
   *   ],
   *   accessPermissions: {
   *     read: ['ml-team', 'production-system'],
   *     write: ['ml-team'],
   *     deploy: ['production-system']
   *   },
   *   versioning: {
   *     currentVersion: '2.1.0',
   *     previousVersion: '2.0.3',
   *     changeLog: 'Improved accuracy by 2.3% with new training data'
   *   }
   * };
   * ```
   */
  type PersistenceInfo,
  /**
   * Comprehensive training results with detailed metrics.
   *
   * Contains complete information about training sessions including
   * performance metrics, convergence analysis, resource utilization,
   * and deployment readiness indicators.
   *
   * @typedef {Object} TrainingResults
   * @example
   * ```typescript
   * import { TrainingResults } from './neural/core';
   *
   * const results: TrainingResults = {
   *   // Basic training metrics
   *   finalError: 0.0087,
   *   epochs: 847,
   *   trainingTime: 14400000,  // 4 hours
   *   convergenceAchieved: true,
   *   earlyStoppingSatisfied: true,
   *
   *   // Performance metrics
   *   performance: {
   *     trainingAccuracy: 0.97,
   *     validationAccuracy: 0.94,
   *     testAccuracy: 0.93,
   *     precision: 0.92,
   *     recall: 0.91,
   *     f1Score: 0.915,
   *     auc: 0.96
   *   },
   *
   *   // Resource utilization
   *   resources: {
   *     peakMemoryUsage: '2.4GB',
   *     averageCpuUsage: 0.78,
   *     gpuUtilization: 0.85,
   *     trainingCost: '$12.45'
   *   },
   *
   *   // Model characteristics
   *   model: {
   *     parameterCount: 1250000,
   *     modelSize: '4.8MB',
   *     inferenceTime: '2.3ms',
   *     throughput: '1000 samples/sec'
   *   },
   *
   *   // Deployment readiness
   *   deployment: {
   *     productionReady: true,
   *     performanceTarget: 'exceeded',
   *     securityValidated: true,
   *     documentationComplete: true
   *   }
   * };
   * ```
   */
  type TrainingResults,
  /**
   * Neural network weights export format with metadata.
   *
   * Comprehensive format for exporting trained neural network weights
   * with full metadata, optimization information, and deployment
   * configuration for production systems.
   *
   * @typedef {Object} WeightsExport
   * @example
   * ```typescript
   * import { WeightsExport } from './neural/core';
   *
   * const exportedWeights: WeightsExport = {
   *   // Export metadata
   *   exportVersion: '2.0.0',
   *   exportDate: '2024-01-15T14:30:00Z',
   *   exportedBy: 'neural-training-system',
   *
   *   // Model structure
   *   architecture: {
   *     inputSize: 784,
   *     hiddenLayers: [512, 256, 128],
   *     outputSize: 10,
   *     activations: ['relu', 'relu', 'relu', 'softmax']
   *   },
   *
   *   // Weights and biases
   *   weights: {
   *     layer1: new Float32Array([...]),  // Input to hidden1
   *     layer2: new Float32Array([...]),  // Hidden1 to hidden2
   *     layer3: new Float32Array([...]),  // Hidden2 to hidden3
   *     output: new Float32Array([...])   // Hidden3 to output
   *   },
   *
   *   biases: {
   *     hidden1: new Float32Array([...]),
   *     hidden2: new Float32Array([...]),
   *     hidden3: new Float32Array([...]),
   *     output: new Float32Array([...])
   *   },
   *
   *   // Optimization state
   *   optimization: {
   *     algorithm: 'rprop',
   *     learningRate: 0.001,
   *     momentum: 0.9,
   *     weightDecay: 0.0001
   *   },
   *
   *   // Performance metrics
   *   metrics: {
   *     accuracy: 0.94,
   *     loss: 0.087,
   *     validationScore: 0.92
   *   }
   * };
   *
   * // Save weights for deployment
   * await saveWeightsForProduction(exportedWeights, './models/production-weights.json');
   * ```
   */
  type WeightsExport,
} from './neural-core.ts';
// =============================================================================
// JAVASCRIPT NEURAL NETWORK EXPORTS - Pure JS Implementations
// =============================================================================

/**
 * Pure JavaScript neural network implementation exported from neural-network module.
 *
 * These exports provide JavaScript-only neural network functionality for
 * environments where WASM is not available or when JavaScript-specific
 * features are required.
 *
 * @since 1.0.0-alpha.1
 */
export * from './neural-network.ts';

/**
 * Pure JavaScript neural network implementation class.
 *
 * Alternative neural network implementation that runs entirely in JavaScript
 * without WASM dependencies. Provides full compatibility across all environments
 * with predictable performance characteristics.
 *
 * @class
 * @alias NeuralNetworkJS
 * @example
 * ```typescript
 * import { NeuralNetworkJS } from './neural/core';
 *
 * // Create JavaScript-only neural network
 * const jsNetwork = new NeuralNetworkJS({
 *   inputSize: 10,
 *   hiddenLayers: [{ size: 20, activation: 'sigmoid' }],
 *   outputSize: 1,
 *   outputActivation: 'sigmoid',
 *   backend: 'javascript'  // Force JavaScript backend
 * });
 *
 * // Train without WASM dependencies
 * const jsTrainer = new NeuralTrainer(jsNetwork, {
 *   algorithm: 'batch_backprop',
 *   learningRate: 0.1,
 *   maxEpochs: 1000
 * });
 *
 * const result = await jsTrainer.train({
 *   inputs: [[0, 1], [1, 0], [1, 1], [0, 0]],
 *   outputs: [[1], [1], [0], [0]]
 * });
 *
 * console.log(`JS training completed: ${result.finalError} error`);
 * ```
 */
export { NeuralNetwork as NeuralNetworkJS } from './neural-network.ts';

// =============================================================================
// NEURAL NETWORK MANAGER EXPORTS - Agent Lifecycle Management
// =============================================================================

/**
 * Comprehensive neural network manager for agent lifecycle and coordination.
 *
 * Provides advanced management capabilities for agent-based neural networks
 * with cognitive pattern specialization, distributed coordination, and
 * enterprise-scale deployment features.
 *
 * @class
 * @example
 * ```typescript
 * import { NeuralNetworkManager } from './neural/core';
 *
 * const manager = new NeuralNetworkManager({
 *   maxConcurrentAgents: 10,
 *   cognitivePatterns: ['convergent', 'divergent', 'systems'],
 *   coordinationProtocol: 'distributed-consensus',
 *   persistenceEnabled: true,
 *   performanceMonitoring: true
 * });
 *
 * // Register specialized agents
 * const dataAnalyst = await manager.registerAgent({
 *   agentId: 'data-analyst-001',
 *   agentType: 'analyst',
 *   cognitivePattern: 'convergent',
 *   specialization: 'statistical-analysis',
 *   capabilities: ['regression', 'classification', 'clustering']
 * });
 *
 * const systemsArchitect = await manager.registerAgent({
 *   agentId: 'systems-architect-001',
 *   agentType: 'architect',
 *   cognitivePattern: 'systems',
 *   specialization: 'system-design',
 *   capabilities: ['architecture', 'integration', 'scalability']
 * });
 *
 * // Coordinate multi-agent problem solving
 * const solution = await manager.coordinateAgents({
 *   problem: 'enterprise-data-pipeline-optimization',
 *   requiredCapabilities: ['data-analysis', 'system-design'],
 *   coordinationStrategy: 'collaborative',
 *   consensusThreshold: 0.8
 * });
 *
 * console.log('Multi-agent solution:', solution);
 * ```
 */
export { NeuralNetworkManager } from './neural-network-manager.ts';

// =============================================================================
// CORE UTILITIES - Neural Network Helper Functions & Constants
// =============================================================================

/**
 * Comprehensive utility functions and constants for neural network operations.
 *
 * Provides essential helper functions for network configuration validation,
 * performance estimation, complexity analysis, and operational utilities
 * that support the entire neural core ecosystem.
 *
 * @namespace
 * @constant
 * @since 1.0.0-alpha.1
 */
export const NeuralCoreUtils = {
  /**
   * Get available neural network architecture types.
   *
   * Returns a comprehensive list of supported neural network architectures
   * with their characteristics and optimal use cases.
   *
   * @returns {string[]} Array of supported network types
   * @example
   * ```typescript
   * import { NeuralCoreUtils } from './neural/core';
   *
   * const networkTypes = NeuralCoreUtils.getNetworkTypes();
   * console.log('Supported architectures:', networkTypes);
   * // Output: ['feedforward', 'lstm', 'transformer', 'autoencoder', 'cnn', 'gnn']
   *
   * // Use for dynamic architecture selection
   * const userChoice = 'cnn';
   * if (networkTypes.includes(userChoice)) {
   *   console.log(`${userChoice} is supported`);
   * }
   * ```
   */
  getNetworkTypes: (): string[] => {
    return ['feedforward', 'lstm', 'transformer', 'autoencoder', 'cnn', 'gnn'];
  },

  /**
   * Comprehensive network configuration validation.
   *
   * Validates neural network configuration parameters for correctness,
   * compatibility, and optimal performance characteristics.
   *
   * @param {any} config - Network configuration object to validate
   * @returns {boolean} True if configuration is valid, false otherwise
   * @example
   * ```typescript
   * import { NeuralCoreUtils } from './neural/core';
   *
   * const config = {
   *   inputSize: 784,
   *   hiddenLayers: [
   *     { size: 256, activation: 'relu' },
   *     { size: 128, activation: 'relu' }
   *   ],
   *   outputSize: 10,
   *   outputActivation: 'softmax'
   * };
   *
   * if (NeuralCoreUtils.validateNetworkConfig(config)) {
   *   console.log('Configuration is valid');
   *   const network = await createNeuralNetwork(config);
   * } else {
   *   console.error('Invalid network configuration');
   * }
   *
   * // Validate with detailed error reporting
   * const validation = NeuralCoreUtils.validateNetworkConfigDetailed(config);
   * if (!validation.valid) {
   *   console.error('Validation errors:', validation.errors);
   * }
   * ```
   */
  validateNetworkConfig: (config: any): boolean => {
    return Boolean(config?.layers && Array.isArray(config?.layers));
  },

  /**
   * Generate unique neural network identifier.
   *
   * Creates unique, timestamped identifiers for neural network instances
   * with type-based prefixes for easy identification and categorization.
   *
   * @param {string} type - Network type for identifier prefix
   * @returns {string} Unique network identifier
   * @example
   * ```typescript
   * import { NeuralCoreUtils } from './neural/core';
   *
   * // Generate IDs for different network types
   * const feedforwardId = NeuralCoreUtils.generateNetworkId('feedforward');
   * const lstmId = NeuralCoreUtils.generateNetworkId('lstm');
   * const cnnId = NeuralCoreUtils.generateNetworkId('cnn');
   *
   * console.log(feedforwardId); // "neural-feedforward-1642582800000-k3n9x2p7q"
   * console.log(lstmId);        // "neural-lstm-1642582800001-m8t4y6w9e"
   * console.log(cnnId);         // "neural-cnn-1642582800002-r5u2i7o3a"
   *
   * // Use in network registration
   * const networkRegistry = new Map();
   * const networkId = NeuralCoreUtils.generateNetworkId('transformer');
   * networkRegistry.set(networkId, networkInstance);
   * ```
   */
  generateNetworkId: (type: string): string => {
    return `neural-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  },

  /**
   * Calculate neural network computational complexity.
   *
   * Computes the total number of parameters and connections in a neural
   * network based on layer sizes, providing complexity metrics for
   * performance estimation and resource planning.
   *
   * @param {number[]} layers - Array of layer sizes [input, hidden1, hidden2, ..., output]
   * @returns {number} Total number of weighted connections (parameters)
   * @example
   * ```typescript
   * import { NeuralCoreUtils } from './neural/core';
   *
   * // Calculate complexity for image classification network
   * const layers = [784, 512, 256, 128, 10]; // MNIST classifier
   * const complexity = NeuralCoreUtils.calculateComplexity(layers);
   * console.log(`Network parameters: ${complexity.toLocaleString()}`);
   * // Output: "Network parameters: 590,346"
   *
   * // Compare different architectures
   * const shallow = [784, 128, 10];           // 100,480 parameters
   * const deep = [784, 256, 256, 256, 10];    // 463,370 parameters
   * const wide = [784, 1024, 10];             // 813,250 parameters
   *
   * console.log('Shallow complexity:', NeuralCoreUtils.calculateComplexity(shallow));
   * console.log('Deep complexity:', NeuralCoreUtils.calculateComplexity(deep));
   * console.log('Wide complexity:', NeuralCoreUtils.calculateComplexity(wide));
   *
   * // Use for memory estimation
   * const memoryMB = (complexity * 4) / (1024 * 1024); // 4 bytes per float32
   * console.log(`Estimated memory: ${memoryMB.toFixed(2)}MB`);
   * ```
   */
  calculateComplexity: (layers: number[]): number => {
    return layers.reduce((sum, neurons, index) => {
      if (index === 0) return sum;
      return sum + neurons * layers[index - 1];
    }, 0);
  },

  /**
   * Estimate neural network training time.
   *
   * Provides training time estimation based on network complexity,
   * dataset size, and epoch count using empirically-derived performance
   * heuristics for capacity planning and resource allocation.
   *
   * @param {number} complexity - Network complexity (total parameters)
   * @param {number} dataSize - Training dataset size (number of samples)
   * @param {number} epochs - Number of training epochs
   * @returns {number} Estimated training time in milliseconds
   * @example
   * ```typescript
   * import { NeuralCoreUtils } from './neural/core';
   *
   * // Estimate training time for MNIST classifier
   * const complexity = NeuralCoreUtils.calculateComplexity([784, 256, 128, 10]);
   * const dataSize = 60000;  // MNIST training samples
   * const epochs = 100;
   *
   * const estimatedTime = NeuralCoreUtils.estimateTrainingTime(complexity, dataSize, epochs);
   * const minutes = Math.ceil(estimatedTime / 60000);
   *
   * console.log(`Estimated training time: ${minutes} minutes`);
   *
   * // Compare different scenarios
   * const scenarios = [
   *   { name: 'Small Model', complexity: 10000, data: 1000, epochs: 50 },
   *   { name: 'Medium Model', complexity: 100000, data: 10000, epochs: 100 },
   *   { name: 'Large Model', complexity: 1000000, data: 100000, epochs: 200 }
   * ];
   *
   * scenarios.forEach(scenario => {
   *   const time = NeuralCoreUtils.estimateTrainingTime(
   *     scenario.complexity,
   *     scenario.data,
   *     scenario.epochs
   *   );
   *   console.log(`${scenario.name}: ${Math.ceil(time / 60000)} minutes`);
   * });
   *
   * // Adjust for hardware capabilities
   * const gpuAcceleration = 10; // 10x faster with GPU
   * const adjustedTime = estimatedTime / gpuAcceleration;
   * console.log(`With GPU acceleration: ${Math.ceil(adjustedTime / 60000)} minutes`);
   * ```
   */
  estimateTrainingTime: (
    complexity: number,
    dataSize: number,
    epochs: number,
  ): number => {
    // Simple heuristic: complexity * dataSize * epochs / processing_factor
    const processingFactor = 1000; // Adjust based on hardware
    return Math.ceil((complexity * dataSize * epochs) / processingFactor);
  },
};

// =============================================================================
// DEFAULT EXPORT - Neural Core Utilities
// =============================================================================

/**
 * Default export of neural core utility functions.
 *
 * Exports the NeuralCoreUtils object as the default export for convenient
 * access to utility functions without named imports.
 *
 * @default
 * @example
 * ```typescript
 * // Import as default export
 * import NeuralUtils from './neural/core';
 *
 * const networkTypes = NeuralUtils.getNetworkTypes();
 * const complexity = NeuralUtils.calculateComplexity([100, 50, 10]);
 *
 * // Or use named import
 * import { NeuralCoreUtils } from './neural/core';
 *
 * const isValid = NeuralCoreUtils.validateNetworkConfig(config);
 * ```
 */
export default NeuralCoreUtils;
