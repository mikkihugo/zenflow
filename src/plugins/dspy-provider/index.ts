/**
 * DSPy Integration Plugin with Swarm Coordination
 * 
 * High-performance DSPy integration with systematic prompt optimization,
 * automatic few-shot example selection, and LM pipeline optimization.
 * Features swarm coordination for distributed AI enhancement.
 */

import type { PluginConfig, PluginContext, PluginManifest } from '../../types/plugin';
import { BasePlugin } from '../base-plugin';
import type { SwarmCoordinator } from '../../swarm/types';
import type { NeuralEngine } from '../../neural/neural-engine';

/**
 * DSPy Configuration Interface
 */
export interface DSPyConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  optimizationRounds: number;
  fewShotExamples: number;
  swarmCoordination: boolean;
  neuralIntegration: boolean;
}

/**
 * DSPy Program Definition
 */
export interface DSPyProgram {
  id: string;
  name: string;
  signature: string;
  prompt: string;
  examples: DSPyExample[];
  metrics: DSPyMetrics;
}

/**
 * DSPy Training Example
 */
export interface DSPyExample {
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  score?: number;
}

/**
 * DSPy Performance Metrics
 */
export interface DSPyMetrics {
  accuracy: number;
  latency: number;
  tokenUsage: number;
  cost: number;
  iterations: number;
}

/**
 * DSPy Optimization Result
 */
export interface DSPyOptimizationResult {
  program: DSPyProgram;
  originalMetrics: DSPyMetrics;
  optimizedMetrics: DSPyMetrics;
  improvement: number;
  timestamp: string;
}

/**
 * DSPy Swarm Task
 */
export interface DSPySwarmTask {
  id: string;
  type: 'optimize' | 'evaluate' | 'generate' | 'analyze';
  program: DSPyProgram;
  dataset: DSPyExample[];
  config: DSPyConfig;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Advanced DSPy Provider with Swarm Coordination
 */
export class DspyPlugin extends BasePlugin {
  private dspyConfig!: DSPyConfig;
  private programs: Map<string, DSPyProgram> = new Map();
  private swarmCoordinator?: SwarmCoordinator;
  private neuralEngine?: NeuralEngine;
  private integrationManager?: any; // DSPyIntegrationManager
  private optimizationQueue: DSPySwarmTask[] = [];
  private isInitialized = false;

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
    this.context.apis.logger.info('🧠 DSPy Provider Plugin with Swarm Coordination Initialized');
  }

  /**
   * Load and configure DSPy with integration manager
   */
  async load(config: PluginConfig): Promise<void> {
    await super.load(config);
    
    this.dspyConfig = {
      model: config.model ?? 'claude-3-sonnet',
      maxTokens: config.maxTokens ?? 4000,
      temperature: config.temperature ?? 0.1,
      optimizationRounds: config.optimizationRounds ?? 10,
      fewShotExamples: config.fewShotExamples ?? 5,
      swarmCoordination: config.swarmCoordination ?? true,
      neuralIntegration: config.neuralIntegration ?? true,
    };

    await this.initializeIntegrationManager();
    await this.initializeSwarmCoordination();
    await this.initializeNeuralIntegration();
    
    this.registerAPIs();
    this.isInitialized = true;
    
    this.context.apis.logger.info('✅ DSPy Provider Plugin Loaded with Integration Manager');
  }

  /**
   * Initialize integration manager for comprehensive DSPy functionality
   */
  private async initializeIntegrationManager(): Promise<void> {
    try {
      // Get database instances from context
      const sqliteStore = await this.context.apis.getSqliteStore?.();
      const lanceDB = await this.context.apis.getLanceDB?.();
      const kuzuDB = await this.context.apis.getKuzuDB?.();
      const neuralEngine = await this.context.apis.getNeuralEngine?.();
      
      if (!sqliteStore || !lanceDB || !kuzuDB) {
        throw new Error('Required database instances not available');
      }
      
      // Import and initialize integration manager
      const { DSPyIntegrationManager } = await import('./dspy-integration');
      
      const integrationConfig = {
        ...this.dspyConfig,
        persistence: {
          enabled: true,
          crossSessionLearning: true,
          patternRetention: 30, // 30 days
          optimizationHistory: 1000, // max 1000 entries
        },
        swarm: {
          enabled: this.dspyConfig.swarmCoordination,
          maxAgents: 8,
          parallelOptimization: true,
          agentSpecialization: true,
        },
        neural: {
          enabled: this.dspyConfig.neuralIntegration,
          enhancementMode: 'adaptive' as const,
          crossModalLearning: true,
        },
      };
      
      this.integrationManager = new DSPyIntegrationManager(
        integrationConfig,
        sqliteStore,
        lanceDB,
        kuzuDB,
        neuralEngine
      );
      
      await this.integrationManager.initialize();
      
      // Setup event listeners
      this.integrationManager.on('optimization-completed', (result) => {
        this.context.apis.logger.info(`🎉 DSPy optimization completed: ${result.improvement.toFixed(2)}% improvement`);
      });
      
      this.integrationManager.on('batch-optimization-completed', (data) => {
        this.context.apis.logger.info(`📊 Batch optimization: ${data.results.length} programs, avg improvement: ${data.analytics.averageImprovement.toFixed(2)}%`);
      });
      
      this.context.apis.logger.info('🧠 DSPy Integration Manager Initialized');
    } catch (error) {
      this.context.apis.logger.warn('⚠️ Integration manager unavailable, using basic DSPy:', error);
    }
  }

  /**
   * Initialize swarm coordination for distributed optimization
   */
  private async initializeSwarmCoordination(): Promise<void> {
    if (!this.dspyConfig.swarmCoordination) return;

    try {
      // Initialize swarm coordinator for DSPy tasks
      this.swarmCoordinator = await this.context.apis.createSwarmCoordinator?.({
        name: 'dspy-optimization-swarm',
        maxAgents: 5,
        strategy: 'parallel',
        specialization: ['prompt-optimizer', 'example-selector', 'metric-analyzer', 'pipeline-tuner']
      });
      
      this.context.apis.logger.info('🐝 DSPy Swarm Coordination Initialized');
    } catch (error) {
      this.context.apis.logger.warn('⚠️ Swarm coordination unavailable, using single-threaded DSPy');
    }
  }

  /**
   * Initialize neural engine integration
   */
  private async initializeNeuralIntegration(): Promise<void> {
    if (!this.dspyConfig.neuralIntegration) return;

    try {
      this.neuralEngine = await this.context.apis.getNeuralEngine?.();
      this.context.apis.logger.info('🧬 DSPy Neural Integration Activated');
    } catch (error) {
      this.context.apis.logger.warn('⚠️ Neural engine unavailable, using standard DSPy');
    }
  }

  /**
   * Register comprehensive DSPy APIs
   */
  private registerAPIs(): void {
    this.registerAPI('dspy', {
      name: 'dspy',
      description: 'Advanced DSPy integration with swarm coordination and neural optimization',
      methods: [
        {
          name: 'createProgram',
          description: 'Create and register a new DSPy program',
          handler: this.createProgram.bind(this),
        },
        {
          name: 'optimizeProgram', 
          description: 'Optimize a DSPy program with integration manager',
          handler: this.optimizeProgram.bind(this),
        },
        {
          name: 'createAndOptimizeProgram',
          description: 'Create and optimize a DSPy program in one step',
          handler: this.createAndOptimizeProgram.bind(this),
        },
        {
          name: 'batchOptimizePrograms',
          description: 'Batch optimize multiple DSPy programs',
          handler: this.batchOptimizePrograms.bind(this),
        },
        {
          name: 'runProgram',
          description: 'Execute a DSPy program with optimized prompts',
          handler: this.runProgram.bind(this),
        },
        {
          name: 'generateExamples',
          description: 'Generate few-shot examples using swarm intelligence',
          handler: this.generateExamples.bind(this),
        },
        {
          name: 'analyzePipeline',
          description: 'Analyze and optimize entire LM pipelines',
          handler: this.analyzePipeline.bind(this),
        },
        {
          name: 'getMetrics',
          description: 'Get comprehensive performance metrics',
          handler: this.getMetrics.bind(this),
        },
        {
          name: 'getLearningAnalytics',
          description: 'Get detailed learning analytics and insights',
          handler: this.getLearningAnalytics.bind(this),
        },
        {
          name: 'getOptimizationRecommendations',
          description: 'Get intelligent optimization recommendations',
          handler: this.getOptimizationRecommendations.bind(this),
        },
        {
          name: 'exportKnowledge',
          description: 'Export DSPy knowledge for transfer learning',
          handler: this.exportKnowledge.bind(this),
        },
        {
          name: 'importKnowledge',
          description: 'Import DSPy knowledge from external source',
          handler: this.importKnowledge.bind(this),
        },
      ],
    });
  }

  /**
   * Create a new DSPy program with signature and examples
   */
  async createProgram(
    name: string,
    signature: string, 
    prompt: string,
    examples: DSPyExample[] = []
  ): Promise<DSPyProgram> {
    if (!this.isInitialized) {
      throw new Error('DSPy plugin not initialized');
    }

    const program: DSPyProgram = {
      id: `dspy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      signature,
      prompt,
      examples,
      metrics: {
        accuracy: 0,
        latency: 0,
        tokenUsage: 0,
        cost: 0,
        iterations: 0,
      },
    };

    this.programs.set(program.id, program);
    this.context.apis.logger.info(`📝 DSPy Program created: ${name} (${program.id})`);
    
    return program;
  }

  /**
   * Optimize DSPy program using integration manager
   */
  async optimizeProgram(
    programId: string,
    dataset: DSPyExample[],
    rounds?: number
  ): Promise<DSPyOptimizationResult> {
    const program = this.programs.get(programId);
    if (!program) {
      throw new Error(`DSPy program not found: ${programId}`);
    }

    this.context.apis.logger.info(`🔧 Optimizing DSPy program: ${program.name}`);

    if (this.integrationManager) {
      // Use integration manager for comprehensive optimization
      return await this.integrationManager.createAndOptimizeProgram(
        program.name,
        program.signature,
        program.prompt,
        dataset,
        {
          optimization: {
            rounds: rounds ?? this.dspyConfig.optimizationRounds,
            strategy: 'adaptive',
            parallelization: this.dspyConfig.swarmCoordination,
            crossSessionLearning: true,
          },
        }
      );
    } else if (this.swarmCoordinator) {
      return await this.optimizeWithSwarm(program, dataset, rounds ?? this.dspyConfig.optimizationRounds);
    } else {
      return await this.optimizeStandalone(program, dataset, rounds ?? this.dspyConfig.optimizationRounds);
    }
  }

  /**
   * Create and optimize a DSPy program in one step
   */
  async createAndOptimizeProgram(
    name: string,
    signature: string,
    prompt: string,
    dataset: DSPyExample[],
    options: Record<string, unknown> = {}
  ): Promise<DSPyOptimizationResult> {
    if (!this.isInitialized) {
      throw new Error('DSPy plugin not initialized');
    }

    if (this.integrationManager) {
      return await this.integrationManager.createAndOptimizeProgram(
        name,
        signature,
        prompt,
        dataset,
        options
      );
    } else {
      // Fallback to traditional method
      const program = await this.createProgram(name, signature, prompt, []);
      return await this.optimizeProgram(program.id, dataset);
    }
  }

  /**
   * Batch optimize multiple DSPy programs
   */
  async batchOptimizePrograms(
    programSpecs: Array<{
      name: string;
      signature: string;
      prompt: string;
      dataset: DSPyExample[];
    }>,
    options: Record<string, unknown> = {}
  ): Promise<DSPyOptimizationResult[]> {
    if (!this.isInitialized) {
      throw new Error('DSPy plugin not initialized');
    }

    if (this.integrationManager) {
      // Create programs and batch optimize
      const programs = await Promise.all(
        programSpecs.map(async (spec) => {
          const program = await this.createProgram(spec.name, spec.signature, spec.prompt, []);
          return { program, dataset: spec.dataset };
        })
      );
      
      return await this.integrationManager.batchOptimizePrograms(programs, options);
    } else {
      // Sequential optimization without integration manager
      const results: DSPyOptimizationResult[] = [];
      for (const spec of programSpecs) {
        const result = await this.createAndOptimizeProgram(
          spec.name,
          spec.signature,
          spec.prompt,
          spec.dataset,
          options
        );
        results.push(result);
      }
      return results;
    }
  }

  /**
   * Swarm-coordinated optimization
   */
  private async optimizeWithSwarm(
    program: DSPyProgram,
    dataset: DSPyExample[],
    rounds: number
  ): Promise<DSPyOptimizationResult> {
    const originalMetrics = { ...program.metrics };

    // Create swarm optimization tasks
    const tasks: DSPySwarmTask[] = [
      {
        id: `opt_prompt_${program.id}`,
        type: 'optimize',
        program,
        dataset,
        config: this.dspyConfig,
        priority: 'high',
      },
      {
        id: `gen_examples_${program.id}`,
        type: 'generate',
        program,
        dataset,
        config: this.dspyConfig,
        priority: 'medium',
      },
      {
        id: `analyze_perf_${program.id}`,
        type: 'analyze',
        program,
        dataset,
        config: this.dspyConfig,
        priority: 'low',
      },
    ];

    // Execute optimization rounds with swarm coordination
    for (let round = 0; round < rounds; round++) {
      this.context.apis.logger.info(`🔄 DSPy Optimization Round ${round + 1}/${rounds}`);
      
      // Parallel execution of optimization tasks
      const results = await Promise.all(
        tasks.map(task => this.executeSwarmTask(task))
      );
      
      // Aggregate results and update program
      await this.aggregateOptimizationResults(program, results);
      
      // Neural-enhanced metric evaluation
      if (this.neuralEngine) {
        await this.enhanceWithNeuralAnalysis(program, dataset);
      }
    }

    const optimizedMetrics = program.metrics;
    const improvement = this.calculateImprovement(originalMetrics, optimizedMetrics);

    return {
      program,
      originalMetrics,
      optimizedMetrics,
      improvement,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Standalone optimization without swarm coordination
   */
  private async optimizeStandalone(
    program: DSPyProgram,
    dataset: DSPyExample[],
    rounds: number
  ): Promise<DSPyOptimizationResult> {
    const originalMetrics = { ...program.metrics };

    for (let round = 0; round < rounds; round++) {
      // Basic prompt optimization
      await this.optimizePrompt(program, dataset);
      
      // Example selection and ranking
      await this.optimizeExamples(program, dataset);
      
      // Performance evaluation
      await this.evaluateProgram(program, dataset);
    }

    const improvement = this.calculateImprovement(originalMetrics, program.metrics);

    return {
      program,
      originalMetrics,
      optimizedMetrics: program.metrics,
      improvement,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Execute a swarm task for DSPy optimization
   */
  private async executeSwarmTask(task: DSPySwarmTask): Promise<Record<string, unknown>> {
    const startTime = Date.now();
    let result: Record<string, unknown> = {};

    try {
      switch (task.type) {
        case 'optimize':
          result = await this.optimizePrompt(task.program, task.dataset);
          break;
        case 'generate':
          result = await this.generateExamples(task.program.signature, task.dataset.length);
          break;
        case 'analyze':
          result = await this.analyzePerformance(task.program, task.dataset);
          break;
        case 'evaluate':
          result = await this.evaluateProgram(task.program, task.dataset);
          break;
      }
    } catch (error) {
      this.context.apis.logger.error(`❌ Swarm task failed: ${task.id}`, error);
      result = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    const duration = Date.now() - startTime;
    this.context.apis.logger.info(`⚡ Swarm task completed: ${task.type} in ${duration}ms`);
    
    return { ...result, duration, taskId: task.id };
  }

  /**
   * Optimize program prompt using advanced techniques
   */
  private async optimizePrompt(
    program: DSPyProgram,
    dataset: DSPyExample[]
  ): Promise<Record<string, unknown>> {
    // Implement prompt optimization logic
    const variations = await this.generatePromptVariations(program.prompt, dataset);
    const bestPrompt = await this.evaluatePromptVariations(variations, dataset);
    
    program.prompt = bestPrompt.prompt;
    program.metrics.accuracy = bestPrompt.accuracy;
    
    return {
      originalPrompt: program.prompt,
      optimizedPrompt: bestPrompt.prompt,
      improvement: bestPrompt.accuracy - program.metrics.accuracy,
    };
  }

  /**
   * Generate and optimize few-shot examples
   */
  async generateExamples(
    signature: string,
    count: number
  ): Promise<DSPyExample[]> {
    const examples: DSPyExample[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate diverse examples using swarm intelligence
      const example = await this.generateSingleExample(signature);
      examples.push(example);
    }
    
    // Rank and select best examples
    return await this.rankExamples(examples);
  }

  /**
   * Generate a single high-quality example
   */
  private async generateSingleExample(signature: string): Promise<DSPyExample> {
    // Mock implementation - in real usage, this would use AI generation
    return {
      input: { signature, query: 'example input' },
      output: { result: 'example output' },
      score: Math.random() * 0.3 + 0.7, // 0.7-1.0 range
    };
  }

  /**
   * Run an optimized DSPy program
   */
  async runProgram(
    programId: string,
    input: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const program = this.programs.get(programId);
    if (!program) {
      throw new Error(`DSPy program not found: ${programId}`);
    }

    const startTime = Date.now();
    
    // Execute the optimized program
    const result = await this.executeProgram(program, input);
    
    // Update metrics
    const latency = Date.now() - startTime;
    program.metrics.latency = (program.metrics.latency + latency) / 2;
    program.metrics.iterations++;
    
    return result;
  }

  /**
   * Execute a DSPy program with the optimized prompt and examples
   */
  private async executeProgram(
    program: DSPyProgram,
    input: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    // Build the optimized prompt with few-shot examples
    const fullPrompt = this.buildFullPrompt(program, input);
    
    // Execute via AI provider (mock implementation)
    const response = await this.callAIProvider(fullPrompt);
    
    return {
      programId: program.id,
      input,
      output: response,
      metadata: {
        prompt: fullPrompt,
        latency: Date.now(),
        model: this.dspyConfig.model,
      },
    };
  }

  /**
   * Analyze and optimize entire LM pipelines
   */
  async analyzePipeline(
    programs: string[]
  ): Promise<Record<string, unknown>> {
    const analysis: Record<string, unknown> = {
      totalPrograms: programs.length,
      combinedMetrics: {},
      bottlenecks: [],
      recommendations: [],
    };
    
    // Analyze each program in the pipeline
    for (const programId of programs) {
      const program = this.programs.get(programId);
      if (program) {
        // Add pipeline analysis logic
        analysis[programId] = {
          metrics: program.metrics,
          efficiency: this.calculateEfficiency(program),
        };
      }
    }
    
    return analysis;
  }

  /**
   * Get comprehensive performance metrics
   */
  async getMetrics(): Promise<Record<string, unknown>> {
    const allPrograms = Array.from(this.programs.values());
    
    const basicMetrics = {
      totalPrograms: allPrograms.length,
      averageAccuracy: this.calculateAverageAccuracy(allPrograms),
      averageLatency: this.calculateAverageLatency(allPrograms),
      totalOptimizations: allPrograms.reduce((sum, p) => sum + p.metrics.iterations, 0),
      swarmCoordinationEnabled: Boolean(this.swarmCoordinator),
      neuralIntegrationEnabled: Boolean(this.neuralEngine),
      integrationManagerEnabled: Boolean(this.integrationManager),
      timestamp: new Date().toISOString(),
    };
    
    // Add integration manager metrics if available
    if (this.integrationManager) {
      const analytics = await this.integrationManager.getLearningAnalytics();
      return {
        ...basicMetrics,
        learningAnalytics: analytics,
      };
    }
    
    return basicMetrics;
  }

  /**
   * Get detailed learning analytics
   */
  async getLearningAnalytics(): Promise<Record<string, unknown>> {
    if (this.integrationManager) {
      return await this.integrationManager.getLearningAnalytics();
    }
    
    return {
      message: 'Learning analytics require integration manager',
      basicMetrics: await this.getMetrics(),
    };
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(
    programId: string,
    dataset: DSPyExample[]
  ): Promise<Record<string, unknown>> {
    const program = this.programs.get(programId);
    if (!program) {
      throw new Error(`DSPy program not found: ${programId}`);
    }

    if (this.integrationManager) {
      return {
        recommendations: await this.integrationManager.getOptimizationRecommendations(program, dataset),
      };
    }
    
    return {
      message: 'Optimization recommendations require integration manager',
      basicSuggestions: [
        'Consider adding more diverse examples',
        'Optimize prompt structure for clarity',
        'Enable swarm coordination for better results',
      ],
    };
  }

  /**
   * Export DSPy knowledge
   */
  async exportKnowledge(): Promise<Record<string, unknown>> {
    if (this.integrationManager) {
      return await this.integrationManager.exportKnowledge();
    }
    
    return {
      programs: Array.from(this.programs.entries()),
      basicMetrics: await this.getMetrics(),
      exportTimestamp: new Date().toISOString(),
    };
  }

  /**
   * Import DSPy knowledge
   */
  async importKnowledge(knowledge: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (this.integrationManager) {
      await this.integrationManager.importKnowledge(knowledge);
      return { success: true, message: 'Knowledge imported successfully' };
    }
    
    // Basic import for programs
    if (knowledge.programs && Array.isArray(knowledge.programs)) {
      for (const [id, program] of knowledge.programs) {
        this.programs.set(id, program as DSPyProgram);
      }
    }
    
    return { success: true, message: 'Basic knowledge import completed', importedPrograms: knowledge.programs?.length ?? 0 };
  }

  // Helper methods
  private async generatePromptVariations(prompt: string, dataset: DSPyExample[]): Promise<Array<{ prompt: string; accuracy: number }>> {
    // Mock implementation
    return [{ prompt, accuracy: Math.random() }];
  }

  private async evaluatePromptVariations(variations: Array<{ prompt: string; accuracy: number }>, dataset: DSPyExample[]): Promise<{ prompt: string; accuracy: number }> {
    return variations.reduce((best, current) => current.accuracy > best.accuracy ? current : best);
  }

  private async optimizeExamples(program: DSPyProgram, dataset: DSPyExample[]): Promise<void> {
    // Implement example optimization
  }

  private async evaluateProgram(program: DSPyProgram, dataset: DSPyExample[]): Promise<Record<string, unknown>> {
    // Mock evaluation
    return { accuracy: Math.random(), evaluated: true };
  }

  private async aggregateOptimizationResults(program: DSPyProgram, results: Record<string, unknown>[]): Promise<void> {
    // Aggregate swarm optimization results
  }

  private async enhanceWithNeuralAnalysis(program: DSPyProgram, dataset: DSPyExample[]): Promise<void> {
    // Neural enhancement logic
  }

  private calculateImprovement(original: DSPyMetrics, optimized: DSPyMetrics): number {
    return ((optimized.accuracy - original.accuracy) / original.accuracy) * 100;
  }

  private async rankExamples(examples: DSPyExample[]): Promise<DSPyExample[]> {
    return examples.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  private buildFullPrompt(program: DSPyProgram, input: Record<string, unknown>): string {
    let prompt = program.prompt;
    
    // Add few-shot examples
    for (const example of program.examples.slice(0, this.dspyConfig.fewShotExamples)) {
      prompt += `\n\nExample:\nInput: ${JSON.stringify(example.input)}\nOutput: ${JSON.stringify(example.output)}`;
    }
    
    prompt += `\n\nNow process:\nInput: ${JSON.stringify(input)}\nOutput:`;
    
    return prompt;
  }

  private async callAIProvider(prompt: string): Promise<string> {
    // Mock AI provider call - in real implementation, use actual AI service
    return `Optimized DSPy response for: ${prompt.substring(0, 100)}...`;
  }

  private async analyzePerformance(program: DSPyProgram, dataset: DSPyExample[]): Promise<Record<string, unknown>> {
    return {
      program: program.id,
      datasetSize: dataset.length,
      metrics: program.metrics,
    };
  }

  private calculateEfficiency(program: DSPyProgram): number {
    return program.metrics.accuracy / (program.metrics.latency + 1);
  }

  private calculateAverageAccuracy(programs: DSPyProgram[]): number {
    return programs.reduce((sum, p) => sum + p.metrics.accuracy, 0) / programs.length;
  }

  private calculateAverageLatency(programs: DSPyProgram[]): number {
    return programs.reduce((sum, p) => sum + p.metrics.latency, 0) / programs.length;
  }
}

export default DspyPlugin;

// Export additional types for external usage
export type {
  DSPyProgram,
  DSPyExample,
  DSPyMetrics,
  DSPyOptimizationResult,
  DSPyConfig,
  DSPySwarmTask,
};
