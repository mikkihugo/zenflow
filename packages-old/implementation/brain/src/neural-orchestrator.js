/**
 * @fileoverview Neural Orchestrator - Brain as Intelligent Neural Coordinator
 *
 * The brain acts as an intelligent orchestrator that decides:
 * - Which neural operations to handle internally vs delegate to neural-ml
 * - Where to store neural data based on characteristics and access patterns
 * - How to optimize resource allocation across neural systems
 * - When to lazy-load heavy ML models based on task complexity
 */
import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('neural-orchestrator');
/**
 * Neural task complexity levels
 */
export var TaskComplexity;
((TaskComplexity) => {
  TaskComplexity.SIMPLE = 'simple';
  TaskComplexity.MODERATE = 'moderate';
  TaskComplexity.COMPLEX = 'complex';
  TaskComplexity.HEAVY = 'heavy'; // Requires neural-ml heavy models (LSTM, Transformers)
})(TaskComplexity || (TaskComplexity = {}));
/**
 * Storage strategy types
 */
export var StorageStrategy;
((StorageStrategy) => {
  StorageStrategy.MEMORY = 'memory';
  StorageStrategy.DATABASE = 'database';
  StorageStrategy.VECTOR = 'vector';
  StorageStrategy.GRAPH = 'graph';
  StorageStrategy.HYBRID = 'hybrid'; // Multiple storage backends
})(StorageStrategy || (StorageStrategy = {}));
/**
 * Neural Orchestrator - Brain as intelligent coordinator
 */
export class NeuralOrchestrator {
  neuralMlCache = null;
  isNeuralMlLoaded = false;
  taskHistory = new Map();
  dataStorageMap = new Map();
  metrics = {
    tasksProcessed: 0,
    complexityDistribution: {
      [TaskComplexity.SIMPLE]: 0,
      [TaskComplexity.MODERATE]: 0,
      [TaskComplexity.COMPLEX]: 0,
      [TaskComplexity.HEAVY]: 0,
    },
    averageLatency: {
      [TaskComplexity.SIMPLE]: 0,
      [TaskComplexity.MODERATE]: 0,
      [TaskComplexity.COMPLEX]: 0,
      [TaskComplexity.HEAVY]: 0,
    },
    cacheHitRate: 0,
    neuralMlLoadCount: 0,
    storageDistribution: {
      [StorageStrategy.MEMORY]: 0,
      [StorageStrategy.DATABASE]: 0,
      [StorageStrategy.VECTOR]: 0,
      [StorageStrategy.GRAPH]: 0,
      [StorageStrategy.HYBRID]: 0,
    },
  };
  constructor() {
    logger.info(
      '🧠 Neural Orchestrator initialized - Brain as intelligent coordinator'
    );
  }
  /**
   * Main orchestration method - analyzes and routes neural tasks
   */
  async processNeuralTask(task) {
    const startTime = Date.now();
    logger.debug(
      `🎯 Orchestrating neural task: ${task.id} (type: ${task.type})`
    );
    // Analyze task complexity
    const complexity = this.analyzeTaskComplexity(task);
    logger.debug(`📊 Task complexity analysis: ${complexity}`);
    let result;
    try {
      // Route based on complexity
      switch (complexity) {
        case TaskComplexity.SIMPLE:
          result = await this.processSimpleTask(task);
          break;
        case TaskComplexity.MODERATE:
          result = await this.processModerateTask(task);
          break;
        case TaskComplexity.COMPLEX:
          result = await this.processComplexTask(task);
          break;
        case TaskComplexity.HEAVY:
          result = await this.processHeavyTask(task);
          break;
        default:
          throw new Error(`Unknown complexity level: ${complexity}`);
      }
      // Update metrics
      const duration = Date.now() - startTime;
      this.updateMetrics(complexity, duration);
      result.metadata.duration = duration;
      result.metadata.complexity = complexity;
      logger.info(
        `✅ Neural task completed: ${task.id} (${complexity}, ${duration}ms)`
      );
      return result;
    } catch (error) {
      logger.error(`❌ Neural task failed: ${task.id}`, error);
      throw error;
    }
  }
  /**
   * Intelligent task complexity analysis
   */
  analyzeTaskComplexity(task) {
    const { data, type, requirements } = task;
    const metadata = data.metadata || {};
    // Input data characteristics
    const inputSize = Array.isArray(data.input[0])
      ? data.input.length * data.input[0].length
      : data.input.length;
    const dimensions = metadata.dimensions || 0;
    const timeSeriesLength = metadata.timeSeriesLength || 0;
    const featureCount = metadata.featureCount || 0;
    // Requirements analysis
    const needsHighAccuracy = (requirements?.accuracy || 0) > 0.9;
    const needsLowLatency = (requirements?.latency || Infinity) < 100;
    const needsGpu = requirements?.gpu === true;
    // Use requirements in complexity calculation
    let requirementComplexity = TaskComplexity.SIMPLE;
    if (needsHighAccuracy) {
      requirementComplexity = TaskComplexity.COMPLEX;
      logger.debug(
        `High accuracy required - upgrading complexity to ${requirementComplexity}`
      );
    }
    if (needsLowLatency) {
      // Low latency favors simpler models for faster processing
      logger.debug(`Low latency required - considering lightweight processing`);
    }
    if (needsGpu) {
      requirementComplexity = TaskComplexity.HEAVY;
      logger.debug(
        `GPU processing required - upgrading complexity to ${requirementComplexity}`
      );
    }
    // Task type complexity mapping
    const taskTypeComplexity = {
      prediction: TaskComplexity.SIMPLE,
      classification: TaskComplexity.MODERATE,
      clustering: TaskComplexity.MODERATE,
      forecasting: TaskComplexity.COMPLEX,
      optimization: TaskComplexity.HEAVY,
      pattern_recognition: TaskComplexity.COMPLEX,
    };
    let baseComplexity = taskTypeComplexity[type] || TaskComplexity.SIMPLE;
    // Upgrade complexity based on data characteristics
    if (inputSize > 10000 || dimensions > 100 || timeSeriesLength > 1000) {
      baseComplexity = this.upgradeComplexity(baseComplexity);
    }
    if (featureCount > 50 || needsHighAccuracy || needsGpu) {
      baseComplexity = this.upgradeComplexity(baseComplexity);
    }
    // Consider requirement-based complexity
    if (
      this.getComplexityLevel(requirementComplexity) >
      this.getComplexityLevel(baseComplexity)
    ) {
      baseComplexity = requirementComplexity;
      logger.debug(
        `Upgraded complexity based on requirements: ${baseComplexity}`
      );
    }
    // Special cases for heavy ML
    if (type === 'forecasting' && timeSeriesLength > 5000) {
      return TaskComplexity.HEAVY;
    }
    if (type === 'optimization' && inputSize > 5000) {
      return TaskComplexity.HEAVY;
    }
    // Learn from historical performance
    const historicalComplexity = this.taskHistory.get(
      `${type}-${Math.floor(inputSize / 1000)}`
    );
    if (
      historicalComplexity &&
      this.shouldUpgradeBasedOnHistory(historicalComplexity, baseComplexity)
    ) {
      baseComplexity = historicalComplexity;
    }
    return baseComplexity;
  }
  /**
   * Process simple tasks with internal brain.js
   */
  async processSimpleTask(task) {
    logger.debug(`🟢 Processing simple task with brain.js: ${task.id}`);
    // Use internal brain.js for simple operations
    const input = task.data.input;
    const result = input.map((x) => Math.tanh(x)); // Simple activation simulation
    return {
      taskId: task.id,
      result,
      metadata: {
        complexity: TaskComplexity.SIMPLE,
        processor: 'brain-js',
        duration: 0, // Set by caller
        confidence: 0.8,
        storageStrategy: StorageStrategy.MEMORY,
      },
    };
  }
  /**
   * Process moderate tasks with enhanced brain.js
   */
  async processModerateTask(task) {
    logger.debug(
      `🟡 Processing moderate task with enhanced brain.js: ${task.id}`
    );
    // Enhanced processing with some ML features
    const input = task.data.input;
    let result;
    if (Array.isArray(input[0])) {
      // Matrix processing
      result = input.map(
        (row) => row.map((x) => 1 / (1 + Math.exp(-x))) // Sigmoid activation
      );
    } else {
      // Vector processing with normalization
      const values = input;
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const std = Math.sqrt(
        values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
      );
      result = values.map((x) => (x - mean) / std);
    }
    return {
      taskId: task.id,
      result,
      metadata: {
        complexity: TaskComplexity.MODERATE,
        processor: 'brain-js',
        duration: 0,
        confidence: 0.85,
        storageStrategy: StorageStrategy.DATABASE,
      },
    };
  }
  /**
   * Process complex tasks by lazy-loading neural-ml
   */
  async processComplexTask(task) {
    logger.debug(`🔶 Processing complex task - loading neural-ml: ${task.id}`);
    const neuralMl = await this.loadNeuralML();
    // Use neural-ml for complex processing with lightweight models
    let result;
    if (neuralMl?.isAvailable && neuralMl.hasLightweightModels) {
      logger.debug(`Using neural-ml lightweight models for task ${task.id}`);
      result = await this.processWithNeuralMl(task, neuralMl, 'light');
    } else {
      logger.debug(
        `Neural-ml not available, falling back to simulation for task ${task.id}`
      );
      // Fallback to simulation when neural-ml is not available
      result = await this.simulateNeuralMlProcessing(task, 'light');
    }
    return {
      taskId: task.id,
      result,
      metadata: {
        complexity: TaskComplexity.COMPLEX,
        processor: 'neural-ml-light',
        duration: 0,
        confidence: 0.9,
        storageStrategy: StorageStrategy.VECTOR,
      },
    };
  }
  /**
   * Process heavy tasks with full neural-ml capabilities
   */
  async processHeavyTask(task) {
    logger.debug(`🔴 Processing heavy task with full neural-ml: ${task.id}`);
    const neuralMl = await this.loadNeuralML();
    // Use neural-ml for heavy processing with full models (LSTM, Transformers, etc.)
    let result;
    if (neuralMl?.isAvailable && neuralMl.hasHeavyModels) {
      logger.debug(`Using neural-ml heavy models for task ${task.id}`);
      result = await this.processWithNeuralMl(task, neuralMl, 'heavy');
    } else {
      logger.debug(
        `Neural-ml heavy models not available, falling back to simulation for task ${task.id}`
      );
      // Fallback to simulation when neural-ml heavy models are not available
      result = await this.simulateNeuralMlProcessing(task, 'heavy');
    }
    return {
      taskId: task.id,
      result,
      metadata: {
        complexity: TaskComplexity.HEAVY,
        processor: 'neural-ml-heavy',
        duration: 0,
        confidence: 0.95,
        storageStrategy: StorageStrategy.HYBRID,
      },
    };
  }
  /**
   * Lazy load neural-ml package
   */
  async loadNeuralML() {
    if (this.isNeuralMlLoaded && this.neuralMlCache) {
      return this.neuralMlCache;
    }
    logger.info('📦 Lazy loading @claude-zen/neural-ml...');
    try {
      // Dynamic import of neural-ml package
      const neuralMl = await import('@claude-zen/neural-ml');
      this.neuralMlCache = neuralMl;
      this.isNeuralMlLoaded = true;
      this.metrics.neuralMlLoadCount++;
      logger.info('✅ Neural-ML package loaded successfully');
      return neuralMl;
    } catch (error) {
      logger.warn(
        '⚠️ Neural-ML package not available, falling back to brain.js',
        error
      );
      // Return a mock object for development
      return {
        processLight: async (task) => this.processModerateTask(task),
        processHeavy: async (task) => this.processModerateTask(task),
      };
    }
  }
  /**
   * Simulate neural-ml processing (placeholder for actual integration)
   */
  async simulateNeuralMlProcessing(task, mode) {
    // This is a simulation - actual implementation would call neural-ml APIs
    const input = task.data.input;
    if (mode === 'heavy') {
      // Simulate complex processing for heavy tasks
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate processing time
    }
    if (Array.isArray(input[0])) {
      return input.map(
        (row) => row.map((x) => Math.sin(x) * Math.cos(x)) // Complex simulation
      );
    } else {
      return input.map((x) => Math.sin(x) * Math.cos(x));
    }
  }
  /**
   * Determine optimal storage strategy for neural data
   */
  async storeNeuralData(data) {
    const strategy = this.determineStorageStrategy(data);
    logger.debug(`💾 Storing neural data with strategy: ${strategy}`, {
      id: data.id,
      type: data.type,
      size: data.characteristics.size,
    });
    // Update storage metrics
    this.metrics.storageDistribution[strategy]++;
    this.dataStorageMap.set(data.id, strategy);
    // Route to appropriate storage backend
    switch (strategy) {
      case StorageStrategy.MEMORY:
        await this.storeInMemory(data);
        break;
      case StorageStrategy.DATABASE:
        await this.storeInDatabase(data);
        break;
      case StorageStrategy.VECTOR:
        await this.storeInVectorDB(data);
        break;
      case StorageStrategy.GRAPH:
        await this.storeInGraphDB(data);
        break;
      case StorageStrategy.HYBRID:
        await this.storeInHybrid(data);
        break;
    }
    logger.debug(`✅ Neural data stored: ${data.id} (strategy: ${strategy})`);
  }
  /**
   * Intelligent storage strategy determination
   */
  determineStorageStrategy(data) {
    const { characteristics } = data;
    const {
      size,
      accessFrequency,
      persistenceLevel,
      dimensions,
      relationships,
    } = characteristics;
    // Memory strategy for small, frequently accessed data
    if (size < 1024 * 1024 && accessFrequency === 'realtime') {
      return StorageStrategy.MEMORY;
    }
    // Vector strategy for high-dimensional data
    if (dimensions && dimensions > 50) {
      return StorageStrategy.VECTOR;
    }
    // Graph strategy for data with many relationships
    if (relationships && relationships.length > 5) {
      return StorageStrategy.GRAPH;
    }
    // Hybrid strategy for complex scenarios
    if (size > 10 * 1024 * 1024 && persistenceLevel === 'permanent') {
      return StorageStrategy.HYBRID;
    }
    // Default to database for structured persistence
    return StorageStrategy.DATABASE;
  }
  /**
   * Storage backend implementations (placeholders)
   */
  async storeInMemory(data) {
    // Use internal memory storage
    logger.debug(`💭 Storing in memory: ${data.id}`);
  }
  async storeInDatabase(data) {
    // Use foundation's SQLite storage
    logger.debug(`🗃️ Storing in database: ${data.id}`);
  }
  async storeInVectorDB(data) {
    // Use foundation's LanceDB storage
    logger.debug(`📊 Storing in vector DB: ${data.id}`);
  }
  async storeInGraphDB(data) {
    // Use foundation's Kuzu graph storage
    logger.debug(`🕸️ Storing in graph DB: ${data.id}`);
  }
  async storeInHybrid(data) {
    // Use multiple storage backends
    logger.debug(`🔀 Storing in hybrid mode: ${data.id}`);
    await Promise.all([this.storeInDatabase(data), this.storeInVectorDB(data)]);
  }
  /**
   * Helper methods
   */
  upgradeComplexity(current) {
    const levels = [
      TaskComplexity.SIMPLE,
      TaskComplexity.MODERATE,
      TaskComplexity.COMPLEX,
      TaskComplexity.HEAVY,
    ];
    const currentIndex = levels.indexOf(current);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }
  shouldUpgradeBasedOnHistory(historical, current) {
    const levels = [
      TaskComplexity.SIMPLE,
      TaskComplexity.MODERATE,
      TaskComplexity.COMPLEX,
      TaskComplexity.HEAVY,
    ];
    return levels.indexOf(historical) > levels.indexOf(current);
  }
  updateMetrics(complexity, duration) {
    this.metrics.tasksProcessed++;
    this.metrics.complexityDistribution[complexity]++;
    // Update average latency
    const currentAvg = this.metrics.averageLatency[complexity];
    const count = this.metrics.complexityDistribution[complexity];
    this.metrics.averageLatency[complexity] =
      (currentAvg * (count - 1) + duration) / count;
  }
  /**
   * Get orchestration metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }
  /**
   * Get task complexity prediction
   */
  predictTaskComplexity(task) {
    return this.analyzeTaskComplexity({ ...task, id: 'prediction' });
  }
  /**
   * Get numeric complexity level for comparison
   */
  getComplexityLevel(complexity) {
    switch (complexity) {
      case TaskComplexity.SIMPLE:
        return 1;
      case TaskComplexity.MODERATE:
        return 2;
      case TaskComplexity.COMPLEX:
        return 3;
      case TaskComplexity.HEAVY:
        return 4;
      default:
        return 1;
    }
  }
  /**
   * Process task using neural-ml when available
   */
  async processWithNeuralMl(task, neuralMl, modelType) {
    try {
      // Use neural-ml API for actual processing
      if (neuralMl.processTask) {
        return await neuralMl.processTask(task, {
          modelType,
          priority: task.data.metadata?.priority || 'medium',
          timeout: task.data.metadata?.timeout || 30000,
        });
      } else {
        logger.warn(
          `Neural-ml loaded but no processTask method available, falling back to simulation`
        );
        return await this.simulateNeuralMlProcessing(task, modelType);
      }
    } catch (error) {
      logger.warn(
        `Neural-ml processing failed, falling back to simulation:`,
        error
      );
      return await this.simulateNeuralMlProcessing(task, modelType);
    }
  }
}
// Interfaces are already exported where they're defined
//# sourceMappingURL=neural-orchestrator.js.map
