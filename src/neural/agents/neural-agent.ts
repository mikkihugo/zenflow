/**
 * Neural Agent Module - Integrates ruv-FANN neural network capabilities
 * into agent processing for cognitive diversity and learning.
 */
/**
 * @file Neural network: neural-agent.
 */

import { EventEmitter } from 'node:events';

// Import these after class definitions to avoid circular dependency
let MemoryOptimizer:
  | typeof import('../../memory/optimization/performance-optimizer').PerformanceOptimizer
  | null = null;
let PATTERN_MEMORY_CONFIG: Record<string, unknown> | null = null;

// Cognitive diversity patterns for different agent types
const COGNITIVE_PATTERNS = {
  CONVERGENT: 'convergent', // Focused problem-solving, analytical
  DIVERGENT: 'divergent', // Creative exploration, idea generation
  LATERAL: 'lateral', // Non-linear thinking, pattern breaking
  SYSTEMS: 'systems', // Holistic view, interconnections
  CRITICAL: 'critical', // Evaluation, judgment, validation
  ABSTRACT: 'abstract', // Conceptual thinking, generalization
} as const;

type CognitivePattern =
  (typeof COGNITIVE_PATTERNS)[keyof typeof COGNITIVE_PATTERNS];

interface CognitiveProfile {
  primary: CognitivePattern;
  secondary: CognitivePattern;
  learningRate: number;
  momentum: number;
  networkLayers: number[];
  activationFunction: 'sigmoid' | 'tanh' | 'relu';
  advancedModel?: string;
}

interface NeuralNetworkConfig extends CognitiveProfile {
  cognitivePattern?: CognitivePattern;
}

interface PerformanceMetrics {
  accuracy: number;
  speed: number;
  creativity: number;
  efficiency: number;
  memoryEfficiency: number;
}

interface CognitiveState {
  attention: number;
  fatigue: number;
  confidence: number;
  exploration: number;
}

interface MemoryUsage {
  baseline: number;
  current: number;
  peak: number;
}

interface Task {
  id?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dependencies?: Array<{ id: string; type: string; description?: string }>;
}

interface TaskResult {
  success: boolean;
  metrics?: {
    linesOfCode?: number;
    testsPass?: number;
    timeElapsed?: number;
    memoryUsed?: number;
  };
}

interface LearningHistoryEntry {
  timestamp: number;
  task: string;
  performance: number;
  input: number[];
  target: number[];
}

interface TaskHistoryEntry {
  task: Task;
  performance: {
    overall: number;
  };
}

// Agent type to cognitive pattern mapping.
const AGENT_COGNITIVE_PROFILES: Record<string, CognitiveProfile> = {
  researcher: {
    primary: COGNITIVE_PATTERNS.DIVERGENT,
    secondary: COGNITIVE_PATTERNS.SYSTEMS,
    learningRate: 0.7,
    momentum: 0.3,
    networkLayers: [64, 128, 64, 32],
    activationFunction: 'sigmoid',
    advancedModel: 'transformer_nlp', // Use transformer for research tasks
  },
  coder: {
    primary: COGNITIVE_PATTERNS.CONVERGENT,
    secondary: COGNITIVE_PATTERNS.LATERAL,
    learningRate: 0.5,
    momentum: 0.2,
    networkLayers: [128, 256, 128, 64],
    activationFunction: 'relu',
    advancedModel: 'gru_sequence', // Use GRU for code generation
  },
  analyst: {
    primary: COGNITIVE_PATTERNS.CRITICAL,
    secondary: COGNITIVE_PATTERNS.ABSTRACT,
    learningRate: 0.6,
    momentum: 0.25,
    networkLayers: [96, 192, 96, 48],
    activationFunction: 'tanh',
    advancedModel: 'cnn_vision', // Use CNN for pattern analysis
  },
  optimizer: {
    primary: COGNITIVE_PATTERNS.SYSTEMS,
    secondary: COGNITIVE_PATTERNS.CONVERGENT,
    learningRate: 0.4,
    momentum: 0.35,
    networkLayers: [80, 160, 80, 40],
    activationFunction: 'sigmoid',
  },
  coordinator: {
    primary: COGNITIVE_PATTERNS.SYSTEMS,
    secondary: COGNITIVE_PATTERNS.CRITICAL,
    learningRate: 0.55,
    momentum: 0.3,
    networkLayers: [112, 224, 112, 56],
    activationFunction: 'relu',
  },
};

/**
 * Neural Network wrapper for agent cognitive processing.
 *
 * @example
 */
class NeuralNetwork {
  private config: NeuralNetworkConfig;
  private layers: number[];
  private activationFunction: string;
  private learningRate: number;
  private momentum: number;
  private memoryOptimizer: unknown;
  private weights: number[][][];
  private biases: number[][];
  private previousWeightDeltas: number[][][];
  private memoryAllocations: unknown[];

  constructor(config: NeuralNetworkConfig, memoryOptimizer: unknown = null) {
    this.config = config;
    this.layers = config?.networkLayers;
    this.activationFunction = config?.activationFunction;
    this.learningRate = config?.learningRate;
    this.momentum = config?.momentum;
    this.memoryOptimizer = memoryOptimizer;

    // Memory-optimized storage
    this.weights = [];
    this.biases = [];
    this.previousWeightDeltas = [];
    this.memoryAllocations = [];

    this._initializeNetwork();
  }

  private _initializeNetwork(): void {
    // Initialize weights and biases between layers with memory optimization
    for (let i = 0; i < this.layers.length - 1; i++) {
      const inputSize = this.layers[i];
      const outputSize = this.layers[i + 1];

      // Skip if layers are undefined
      if (inputSize === undefined || outputSize === undefined) {
        continue;
      }

      // Xavier/Glorot initialization
      const limit = Math.sqrt(6 / (inputSize + outputSize));

      // Try to allocate from memory pool if available
      if (this.memoryOptimizer?.isPoolInitialized()) {
        const weightSize = outputSize * inputSize * 4; // 4 bytes per float32
        const biasSize = outputSize * 4;

        const weightAlloc = this.memoryOptimizer.allocateFromPool(
          'weights',
          weightSize,
          this.config.cognitivePattern || 'default'
        );
        const biasAlloc = this.memoryOptimizer.allocateFromPool(
          'weights',
          biasSize,
          this.config.cognitivePattern || 'default'
        );

        if (weightAlloc && biasAlloc) {
          this.memoryAllocations.push(weightAlloc, biasAlloc);
        }
      }

      // Create matrices (in optimized implementation, these would use pooled memory)
      this.weights[i] = this._createMatrix(
        outputSize,
        inputSize,
        -limit,
        limit
      );
      this.biases[i] = this._createVector(outputSize, -0.1, 0.1);
      this.previousWeightDeltas[i] = this._createMatrix(
        outputSize,
        inputSize,
        0,
        0
      );
    }
  }

  private _createMatrix(
    rows: number,
    cols: number,
    min: number,
    max: number
  ): number[][] {
    const matrix: number[][] = [];
    for (let i = 0; i < rows; i++) {
      matrix[i] = [];
      for (let j = 0; j < cols; j++) {
        matrix[i]![j] = Math.random() * (max - min) + min;
      }
    }
    return matrix;
  }

  private _createVector(size: number, min: number, max: number): number[] {
    const vector: number[] = [];
    for (let i = 0; i < size; i++) {
      vector[i] = Math.random() * (max - min) + min;
    }
    return vector;
  }

  private _activation(x: number, derivative: boolean = false): number {
    switch (this.activationFunction) {
      case 'sigmoid':
        if (derivative) {
          const sig = 1 / (1 + Math.exp(-x));
          return sig * (1 - sig);
        }
        return 1 / (1 + Math.exp(-x));

      case 'tanh':
        if (derivative) {
          const tanh = Math.tanh(x);
          return 1 - tanh * tanh;
        }
        return Math.tanh(x);

      case 'relu':
        if (derivative) {
          return x > 0 ? 1 : 0;
        }
        return Math.max(0, x);

      default:
        return x;
    }
  }

  forward(input: number[]): { output: number[]; activations: number[][] } {
    const activations: number[][] = [input];
    let currentInput = input;

    // Forward propagation through layers
    for (let i = 0; i < this.weights.length; i++) {
      const weights = this.weights[i];
      const biases = this.biases[i];
      const output: number[] = [];

      if (!(weights && biases)) {
        continue;
      }

      for (let j = 0; j < weights.length; j++) {
        let sum = biases[j] || 0;
        for (let k = 0; k < currentInput.length; k++) {
          const weight = weights[j]?.[k];
          const input = currentInput[k];
          if (weight !== undefined && input !== undefined) {
            sum += weight * input;
          }
        }
        output[j] = this._activation(sum);
      }

      activations.push(output);
      currentInput = output;
    }

    return {
      output: currentInput,
      activations,
    };
  }

  train(input: number[], target: number[], learningRate?: number): number[] {
    const lr = learningRate || this.learningRate;
    const { activations } = this.forward(input);

    // Backward propagation
    const errors: number[][] = [];
    const output = activations[activations.length - 1];

    // Calculate output layer error
    const outputError: number[] = [];
    if (!output) {
      return [];
    }
    for (let i = 0; i < output.length; i++) {
      const targetValue = target?.[i] || 0;
      const outputValue = output[i] || 0;
      outputError[i] =
        (targetValue - outputValue) * this._activation(outputValue, true);
    }
    errors.unshift(outputError);

    // Backpropagate errors
    for (let i = this.weights.length - 1; i > 0; i--) {
      const layerError: number[] = [];
      const weights = this.weights[i];
      const prevError = errors[0];

      if (!(weights && prevError && this.weights[i - 1])) {
        continue;
      }

      for (let j = 0; j < (this.weights[i - 1]?.length || 0); j++) {
        let error = 0;
        for (let k = 0; k < weights.length; k++) {
          const weight = weights[k]?.[j];
          const prevErr = prevError[k];
          if (weight !== undefined && prevErr !== undefined) {
            error += weight * prevErr;
          }
        }
        const activationValue = activations[i]?.[j] || 0;
        layerError[j] = error * this._activation(activationValue, true);
      }
      errors.unshift(layerError);
    }

    // Update weights and biases
    for (let i = 0; i < this.weights.length; i++) {
      const weights = this.weights[i];
      const biases = this.biases[i];
      const layerError = errors[i + 1];
      const layerInput = activations[i];

      if (!(weights && biases && layerError && layerInput)) {
        continue;
      }

      for (let j = 0; j < weights.length; j++) {
        // Update bias
        const errorValue = layerError[j];
        if (errorValue !== undefined) {
          biases[j] = (biases[j] || 0) + lr * errorValue;
        }

        // Update weights with momentum
        for (let k = 0; k < (weights[j]?.length || 0); k++) {
          const layerErr = layerError[j];
          const inputVal = layerInput[k];
          if (layerErr !== undefined && inputVal !== undefined) {
            const delta = lr * layerErr * inputVal;
            const prevDelta = this.previousWeightDeltas[i]?.[j]?.[k] || 0;
            const momentumDelta = this.momentum * prevDelta;
            if (weights[j] && weights[j][k] !== undefined) {
              weights[j][k] += delta + momentumDelta;
            }
            if (this.previousWeightDeltas[i]?.[j]) {
              this.previousWeightDeltas[i]![j]![k] = delta;
            }
          }
        }
      }
    }

    return output || [];
  }

  save(): {
    config: NeuralNetworkConfig;
    weights: number[][][];
    biases: number[][];
  } {
    return {
      config: this.config,
      weights: this.weights,
      biases: this.biases,
    };
  }

  load(data: { weights: number[][][]; biases: number[][] }): void {
    this.weights = data?.weights;
    this.biases = data?.biases;
  }
}

/**
 * Neural Agent class that enhances base agents with neural network capabilities.
 *
 * @example
 */
class NeuralAgent extends EventEmitter {
  private agent: unknown;
  private agentType: string;
  private cognitiveProfile: CognitiveProfile;
  private memoryOptimizer: unknown;
  private neuralNetwork: NeuralNetwork;
  private learningHistory: LearningHistoryEntry[];
  private taskHistory: TaskHistoryEntry[];
  private performanceMetrics: PerformanceMetrics;
  private cognitiveState: CognitiveState;
  private memoryUsage: MemoryUsage;

  constructor(
    agent: unknown,
    agentType: string,
    memoryOptimizer: unknown = null
  ) {
    super();
    this.agent = agent;
    this.agentType = agentType;
    this.cognitiveProfile = AGENT_COGNITIVE_PROFILES[agentType] || {
      primary: COGNITIVE_PATTERNS.CONVERGENT,
      secondary: COGNITIVE_PATTERNS.LATERAL,
      learningRate: 0.5,
      momentum: 0.2,
      networkLayers: [128, 64, 32],
      activationFunction: 'sigmoid' as const,
    };
    this.memoryOptimizer =
      memoryOptimizer ||
      (MemoryOptimizer ? new (MemoryOptimizer as any)() : null);

    // Add cognitive pattern to neural network config for memory optimization
    const networkConfig: NeuralNetworkConfig = {
      ...this.cognitiveProfile,
      cognitivePattern: this.cognitiveProfile.primary,
    };

    // Initialize neural network with memory optimizer
    this.neuralNetwork = new NeuralNetwork(networkConfig, this.memoryOptimizer);

    // Learning history for feedback loops
    this.learningHistory = [];
    this.taskHistory = [];
    this.performanceMetrics = {
      accuracy: 0,
      speed: 0,
      creativity: 0,
      efficiency: 0,
      memoryEfficiency: 0,
    };

    // Cognitive state
    this.cognitiveState = {
      attention: 1.0,
      fatigue: 0.0,
      confidence: 0.5,
      exploration: 0.5,
    };

    // Track memory usage
    this.memoryUsage = {
      baseline: 0,
      current: 0,
      peak: 0,
    };

    this._initializeMemoryTracking();
  }

  /**
   * Process task through neural network for intelligent routing.
   *
   * @param task
   */
  async analyzeTask(task: Task): Promise<unknown> {
    // Convert task to neural input vector
    const inputVector = this._taskToVector(task);

    // Get neural network prediction
    const { output } = this.neuralNetwork.forward(inputVector);

    // Interpret output for task routing
    const analysis = {
      complexity: output[0],
      urgency: output[1],
      creativity: output[2],
      dataIntensity: output[3],
      collaborationNeeded: output[4],
      confidence: output[5],
    };

    // Apply cognitive pattern influence
    this._applyCognitivePattern(analysis);

    return analysis;
  }

  /**
   * Execute task with neural enhancement.
   *
   * @param task
   */
  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    // Analyze task
    const analysis = await this.analyzeTask(task);

    // Adjust cognitive state based on task
    this._updateCognitiveState(analysis);

    // Execute base agent task
    const result = await this.agent.execute({
      ...task,
      neuralAnalysis: analysis,
      cognitiveState: this.cognitiveState,
    });

    // Calculate performance
    const executionTime = Date.now() - startTime;
    const performance = this._calculatePerformance(task, result, executionTime);

    // Learn from the experience
    await this._learnFromExecution(task, result, performance);

    // Emit events for monitoring
    this.emit('taskCompleted', {
      task,
      result,
      performance,
      cognitiveState: this.cognitiveState,
    });

    return result;
  }

  /**
   * Convert task to neural network input vector.
   *
   * @param task
   */
  private _taskToVector(task: Task): number[] {
    const vector: number[] = [];

    // Task description features (simplified for example)
    const description = task.description || '';
    vector.push(
      description.length / 1000, // Length normalized
      (description.match(/\b\w+\b/g) || []).length / 100, // Word count
      (description.match(/[A-Z]/g) || []).length / description.length, // Capitalization ratio
      (description.match(/[0-9]/g) || []).length / description.length // Numeric ratio
    );

    // Task metadata
    const priorityMap: Record<string, number> = {
      low: 0.2,
      medium: 0.5,
      high: 0.8,
      critical: 1.0,
    };
    vector.push(priorityMap[task.priority || 'medium'] || 0.5);

    // Dependencies
    vector.push(Math.min(task.dependencies?.length || 0, 10) / 10);

    // Historical performance on similar tasks
    const similarTasks = this._findSimilarTasks(task);
    if (similarTasks.length > 0) {
      const avgPerformance =
        similarTasks.reduce((sum, t) => sum + t.performance.overall, 0) /
        similarTasks.length;
      vector.push(avgPerformance);
    } else {
      vector.push(0.5); // Neutral if no history
    }

    // Current cognitive state influence
    vector.push(
      this.cognitiveState.attention,
      this.cognitiveState.fatigue,
      this.cognitiveState.confidence,
      this.cognitiveState.exploration
    );

    // Pad or truncate to expected input size
    const inputSize = (this.neuralNetwork as any).layers?.[0] || 10; // Fallback to 10 if layers not accessible
    while (vector.length < inputSize) {
      vector.push(0);
    }
    return vector.slice(0, inputSize);
  }

  /**
   * Apply cognitive pattern to analysis.
   *
   * @param analysis
   */
  private _applyCognitivePattern(analysis: unknown): void {
    const primary = this.cognitiveProfile.primary;
    const secondary = this.cognitiveProfile.secondary;

    switch (primary) {
      case COGNITIVE_PATTERNS.CONVERGENT:
        analysis.complexity *= 0.9; // Simplify through focus
        analysis.confidence *= 1.1; // Higher confidence in solutions
        break;

      case COGNITIVE_PATTERNS.DIVERGENT:
        analysis.creativity *= 1.2; // Boost creative requirements
        analysis.exploration = 0.8; // High exploration tendency
        break;

      case COGNITIVE_PATTERNS.LATERAL:
        analysis.creativity *= 1.15; // Enhance creative thinking
        analysis.complexity *= 1.05; // See hidden complexity
        break;

      case COGNITIVE_PATTERNS.SYSTEMS:
        analysis.collaborationNeeded *= 1.2; // See interconnections
        analysis.dataIntensity *= 1.1; // Process more context
        break;

      case COGNITIVE_PATTERNS.CRITICAL:
        analysis.confidence *= 0.9; // More cautious
        analysis.complexity *= 1.1; // See more edge cases
        break;

      case COGNITIVE_PATTERNS.ABSTRACT:
        analysis.complexity *= 0.95; // Simplify through abstraction
        analysis.creativity *= 1.05; // Abstract thinking is creative
        break;
    }

    // Apply secondary pattern with lesser influence
    this._applySecondaryPattern(analysis, secondary);
  }

  /**
   * Update cognitive state based on task execution.
   *
   * @param analysis
   */
  private _updateCognitiveState(analysis: unknown): void {
    // Fatigue increases with complexity
    this.cognitiveState.fatigue = Math.min(
      this.cognitiveState.fatigue + analysis.complexity * 0.1,
      1.0
    );

    // Attention decreases with fatigue
    this.cognitiveState.attention = Math.max(
      1.0 - this.cognitiveState.fatigue * 0.5,
      0.3
    );

    // Confidence adjusts based on recent performance
    if (this.learningHistory.length > 0) {
      const recentPerformance =
        this.learningHistory
          .slice(-5)
          .reduce((sum, h) => sum + h.performance, 0) /
        Math.min(this.learningHistory.length, 5);
      this.cognitiveState.confidence = 0.3 + recentPerformance * 0.7;
    }

    // Exploration vs exploitation balance
    this.cognitiveState.exploration =
      0.2 + (1.0 - this.cognitiveState.confidence) * 0.6;
  }

  /**
   * Calculate performance metrics.
   *
   * @param _task
   * @param result
   * @param executionTime
   */
  private _calculatePerformance(
    _task: Task,
    result: TaskResult,
    executionTime: number
  ): unknown {
    const performance = {
      speed: Math.max(0, 1 - executionTime / 60000), // Normalize to 1 minute
      accuracy: result?.success ? 0.8 : 0.2,
      creativity: 0.5, // Default, should be evaluated based on result
      efficiency: 0.5,
      overall: 0.5,
    };

    // Adjust based on result quality indicators
    if (result?.metrics) {
      if (result?.metrics?.linesOfCode) {
        performance.efficiency = Math.min(
          1.0,
          100 / result?.metrics?.linesOfCode
        );
      }
      if (result?.metrics?.testsPass) {
        performance.accuracy = result?.metrics?.testsPass;
      }
    }

    // Calculate overall performance
    performance.overall =
      performance.speed * 0.2 +
      performance.accuracy * 0.4 +
      performance.creativity * 0.2 +
      performance.efficiency * 0.2;

    return performance;
  }

  /**
   * Learn from task execution.
   *
   * @param task
   * @param result
   * @param performance
   */
  private async _learnFromExecution(
    task: Task,
    result: TaskResult,
    performance: unknown
  ): Promise<void> {
    // Prepare training data
    const input = this._taskToVector(task);
    const target = [
      performance.overall,
      performance.speed,
      performance.accuracy,
      performance.creativity,
      performance.efficiency,
      result?.success ? 1.0 : 0.0,
    ];

    // Train neural network
    this.neuralNetwork.train(input, target);

    // Store in learning history
    this.learningHistory.push({
      timestamp: Date.now(),
      task: task.id || 'unknown',
      performance: performance.overall,
      input,
      target,
    });

    // Keep history size manageable
    if (this.learningHistory.length > 1000) {
      this.learningHistory = this.learningHistory.slice(-500);
    }

    // Update performance metrics
    this._updatePerformanceMetrics(performance);

    // Emit learning event
    this.emit('learning', {
      task: task.id,
      performance,
      networkState: this.neuralNetwork.save(),
    });
  }

  /**
   * Update overall performance metrics.
   *
   * @param performance
   */
  private _updatePerformanceMetrics(performance: unknown): void {
    const alpha = 0.1; // Learning rate for exponential moving average

    this.performanceMetrics.accuracy =
      (1 - alpha) * this.performanceMetrics.accuracy +
      alpha * performance.accuracy;
    this.performanceMetrics.speed =
      (1 - alpha) * this.performanceMetrics.speed + alpha * performance.speed;
    this.performanceMetrics.creativity =
      (1 - alpha) * this.performanceMetrics.creativity +
      alpha * performance.creativity;
    this.performanceMetrics.efficiency =
      (1 - alpha) * this.performanceMetrics.efficiency +
      alpha * performance.efficiency;

    // Calculate memory efficiency based on task completion vs memory usage
    const memoryRatio =
      this.memoryUsage.baseline / this.getCurrentMemoryUsage();
    const taskEfficiency = performance.overall;
    this.performanceMetrics.memoryEfficiency =
      (1 - alpha) * this.performanceMetrics.memoryEfficiency +
      alpha * (memoryRatio * taskEfficiency);
  }

  /**
   * Find similar tasks from history.
   *
   * @param task
   * @param limit
   */
  private _findSimilarTasks(task: Task, limit: number = 5): TaskHistoryEntry[] {
    if (this.taskHistory.length === 0) {
      return [];
    }

    // Simple similarity based on task properties
    const similarities = this.taskHistory.map((historicalTask) => {
      let similarity = 0;

      // Priority match
      if (historicalTask.task.priority === task.priority) {
        similarity += 0.3;
      }

      // Description similarity (simple word overlap)
      const currentWords = new Set(
        (task.description || '').toLowerCase().split(/\s+/)
      );
      const historicalWords = new Set(
        (historicalTask.task.description || '').toLowerCase().split(/\s+/)
      );
      const intersection = new Set(
        [...currentWords].filter((x) => historicalWords.has(x))
      );
      const union = new Set([...currentWords, ...historicalWords]);
      if (union.size > 0) {
        similarity += 0.7 * (intersection.size / union.size);
      }

      return {
        task: historicalTask,
        similarity,
      };
    });

    // Return top similar tasks
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .filter((s) => s.similarity > 0.3)
      .map((s) => s.task);
  }

  /**
   * Apply secondary cognitive pattern.
   *
   * @param analysis
   * @param pattern
   */
  private _applySecondaryPattern(
    analysis: unknown,
    pattern: CognitivePattern
  ): void {
    const influence = 0.5; // Secondary patterns have less influence

    switch (pattern) {
      case COGNITIVE_PATTERNS.CONVERGENT:
        analysis.complexity *= 1 - influence * 0.1;
        analysis.confidence *= 1 + influence * 0.1;
        break;

      case COGNITIVE_PATTERNS.DIVERGENT:
        analysis.creativity *= 1 + influence * 0.2;
        break;

      case COGNITIVE_PATTERNS.LATERAL:
        analysis.creativity *= 1 + influence * 0.15;
        break;

      case COGNITIVE_PATTERNS.SYSTEMS:
        analysis.collaborationNeeded *= 1 + influence * 0.2;
        break;

      case COGNITIVE_PATTERNS.CRITICAL:
        analysis.confidence *= 1 - influence * 0.1;
        break;

      case COGNITIVE_PATTERNS.ABSTRACT:
        analysis.complexity *= 1 - influence * 0.05;
        break;
    }
  }

  /**
   * Rest the agent to reduce fatigue.
   *
   * @param duration
   */
  rest(duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        this.cognitiveState.fatigue = Math.max(
          0,
          this.cognitiveState.fatigue - 0.3
        );
        this.cognitiveState.attention = Math.min(
          1.0,
          this.cognitiveState.attention + 0.2
        );

        // Perform garbage collection on memory pools during rest
        if (this.memoryOptimizer?.isPoolInitialized()) {
          const collected = await this.memoryOptimizer.garbageCollect();
          if (collected > 0) {
            // Recalculate memory usage after GC
            const patternConfig = PATTERN_MEMORY_CONFIG?.[
              this.cognitiveProfile.primary
            ] as any;
            this.memoryUsage.current =
              (patternConfig?.baseMemory || 100) *
              (1 - (patternConfig?.poolSharing || 0.5) * 0.5);
          }
        }

        resolve();
      }, duration);
    });
  }

  /**
   * Initialize memory tracking for the agent.
   */
  private _initializeMemoryTracking(): void {
    const patternConfig = (PATTERN_MEMORY_CONFIG?.[
      this.cognitiveProfile.primary
    ] as any) || {
      baseMemory: 100,
      poolSharing: 0.5,
    };
    this.memoryUsage.baseline = patternConfig.baseMemory || 100;
    this.memoryUsage.current = patternConfig.baseMemory || 100;

    // Initialize memory pools if not already done
    if (this.memoryOptimizer && !this.memoryOptimizer.isPoolInitialized()) {
      this.memoryOptimizer.initializePools().then(() => {
        // Recalculate memory usage with pooling
        this.memoryUsage.current =
          (patternConfig.baseMemory || 100) *
          (1 - (patternConfig.poolSharing || 0.5) * 0.5);
      });
    }
  }

  /**
   * Get current memory usage for this agent.
   */
  getCurrentMemoryUsage(): number {
    let memoryUsage = this.memoryUsage.current;

    // Adjust based on current activity
    if (this.cognitiveState.fatigue > 0.5) {
      memoryUsage *= 1.1; // 10% more memory when fatigued
    }

    if (this.taskHistory.length > 100) {
      memoryUsage *= 1.05; // 5% more for large history
    }

    // Update peak if necessary
    if (memoryUsage > this.memoryUsage.peak) {
      this.memoryUsage.peak = memoryUsage;
    }

    return memoryUsage;
  }

  /**
   * Get agent status including neural state.
   */
  getStatus(): unknown {
    return {
      ...this.agent,
      neuralState: {
        cognitiveProfile: this.cognitiveProfile,
        cognitiveState: this.cognitiveState,
        performanceMetrics: this.performanceMetrics,
        learningHistory: this.learningHistory.length,
        taskHistory: this.taskHistory.length,
        memoryUsage: {
          current: `${this.getCurrentMemoryUsage().toFixed(0)} MB`,
          baseline: `${this.memoryUsage.baseline.toFixed(0)} MB`,
          peak: `${this.memoryUsage.peak.toFixed(0)} MB`,
          efficiency: this.performanceMetrics.memoryEfficiency.toFixed(2),
        },
      },
    };
  }

  /**
   * Save neural state for persistence.
   */
  saveNeuralState(): unknown {
    return {
      agentType: this.agentType,
      neuralNetwork: this.neuralNetwork.save(),
      cognitiveState: this.cognitiveState,
      performanceMetrics: this.performanceMetrics,
      learningHistory: this.learningHistory.slice(-100), // Keep recent history
      taskHistory: this.taskHistory.slice(-100),
    };
  }

  /**
   * Load neural state from saved data.
   *
   * @param data
   */
  loadNeuralState(data: unknown): void {
    if (data?.neuralNetwork) {
      this.neuralNetwork.load(data?.neuralNetwork);
    }
    if (data?.cognitiveState) {
      this.cognitiveState = data?.cognitiveState;
    }
    if (data?.performanceMetrics) {
      this.performanceMetrics = data?.performanceMetrics;
    }
    if (data?.learningHistory) {
      this.learningHistory = data?.learningHistory;
    }
    if (data?.taskHistory) {
      this.taskHistory = data?.taskHistory;
    }
  }
}

/**
 * Neural Agent Factory.
 *
 * @example
 */
class NeuralAgentFactory {
  private static memoryOptimizer: unknown = null;

  static async initializeFactory(): Promise<void> {
    if (!NeuralAgentFactory.memoryOptimizer) {
      NeuralAgentFactory.memoryOptimizer = MemoryOptimizer
        ? new (MemoryOptimizer as any)()
        : null;
      if (NeuralAgentFactory.memoryOptimizer) {
        await NeuralAgentFactory.memoryOptimizer.initializePools();
      }
    }
  }

  static createNeuralAgent(baseAgent: unknown, agentType: string): NeuralAgent {
    if (!AGENT_COGNITIVE_PROFILES[agentType]) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    // Use shared memory optimizer for all agents
    return new NeuralAgent(
      baseAgent,
      agentType,
      NeuralAgentFactory.memoryOptimizer
    );
  }

  static getCognitiveProfiles(): Record<string, CognitiveProfile> {
    return AGENT_COGNITIVE_PROFILES;
  }

  static getCognitivePatterns(): typeof COGNITIVE_PATTERNS {
    return COGNITIVE_PATTERNS;
  }
}

// Lazy load to avoid circular dependency
setImmediate(() => {
  import('../core/network')
    .catch(() => import('../core/neural'))
    .catch(() => null)
    .then((neural) => {
      if (neural) {
        MemoryOptimizer = (neural as any).MemoryOptimizer || MemoryOptimizer;
        PATTERN_MEMORY_CONFIG =
          (neural as any).PATTERN_MEMORY_CONFIG || PATTERN_MEMORY_CONFIG;
      }
    })
    .catch(() => {
      // Fallback if neural module doesn't exist yet
      MemoryOptimizer = class MockMemoryOptimizer extends EventEmitter {
        static override once = EventEmitter.once;
        static override on = EventEmitter.on;
        static override listenerCount = EventEmitter.listenerCount;
        static override getEventListeners = EventEmitter.getEventListeners;
        static override getMaxListeners = EventEmitter.getMaxListeners;
        static override setMaxListeners = EventEmitter.setMaxListeners;
        static override addAbortListener = EventEmitter.addAbortListener;
        static override eventNames() {
          return [];
        }
        static override emit() {
          return false;
        }
        static override removeListener() {
          return MockMemoryOptimizer;
        }

        isPoolInitialized() {
          return false;
        }
        initializePools() {
          return Promise.resolve();
        }
        garbageCollect() {
          return Promise.resolve(0);
        }
      } as any;
      PATTERN_MEMORY_CONFIG = {
        convergent: { baseMemory: 100, poolSharing: 0.5 },
      };
    });
});

export {
  NeuralAgent,
  NeuralAgentFactory,
  NeuralNetwork,
  COGNITIVE_PATTERNS,
  AGENT_COGNITIVE_PROFILES,
  type CognitivePattern,
  type CognitiveProfile,
  type NeuralNetworkConfig,
  type PerformanceMetrics,
  type CognitiveState,
  type Task,
  type TaskResult,
};
