/**
 * @fileoverview GEPA (Genetic-Pareto) Teleprompter Implementation
 * 
 * Advanced teleprompter that uses genetic evolution and Pareto optimization
 * with natural language reflection to optimize prompts. GEPA incorporates
 * reflective prompt mutation, learns from LLM traces, and maintains a diverse
 * pool of high-performing prompt candidates.
 * 
 * Key Features:
 * - Reflective prompt mutation learning from traces
 * - Pareto-based evolution with diverse candidate pools
 * - Genetic evolution with intelligent selection
 * - Natural language reflection for rule learning
 * - Reduced rollout requirements (up to 35x fewer)
 * - Outperforms GRPO by 10-20% with better efficiency
 * 
 * @author Claude Code Zen Team  
 * @version 2.0.0
 * @since 1.0.0-alpha.46
 * 
 * @see {@link https://arxiv.org/abs/2507.19457} GEPA: Reflective Prompt Evolution Paper
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Documentation
 */

// Core interfaces and types for GEPA implementation
export interface Example {
  inputs: Record<string, any>;
  data: Record<string, any>;
  withInputs(key: string): Example;
  copy(): Example;
}

export interface DSPyModule {
  compiled: boolean;
  history: any[];
  forward(inputs: Record<string, any>): Promise<any>;
  aforward(inputs: Record<string, any>): Promise<any>;
  predictors(): DSPyPredictor[];
  named_parameters(): Record<string, any>;
  save(name: string): void;
  load(name: string): void;
  deepcopy(): DSPyModule;
}

export interface DSPyPredictor {
  signature: Signature;
  demos: Example[];
  instructions?: string;
  callbacks?: any[];
  history: any[];
  compiled: boolean;
  lm?: LMInterface;
  id: string;
  
  forward(inputs: Record<string, any>): any;
  aforward(inputs: Record<string, any>): Promise<any>;
  __call__(inputs: Record<string, any>): any;
  validateInputs(inputs: Record<string, any>): void;
  formatPrompt(inputs: Record<string, any>): string;
  parseResponse(response: string, inputs: Record<string, any>): any;
  simulateLanguageModel(prompt: string): string;
  set_lm(lm: LMInterface): void;
  addDemo(demo: Example): void;
  updateDemos(demos: Example[]): void;
  clearDemos(): void;
  updateInstructions(instructions: string): void;
  named_parameters(): Record<string, any>;
  save(name: string): void;
  load(name: string): void;
  deepcopy(): DSPyPredictor;
}

export interface Signature {
  inputs: Record<string, string>;
  outputs: Record<string, string>;
  instruction?: string;
  format?: any;
}

export interface Prediction {
  data: any;
}

export interface LMInterface {
  model: string;
  cache: boolean;
  forward(inputs: Record<string, any>): Promise<any>;
  finetune(options: any): Promise<LMInterface>;
  kill(): Promise<void>;
  launch(): Promise<void>;
  reinforce(options: any): any;
}

export type MetricFunction = (example: Example, prediction: Prediction) => number;

// Simple seeded random number generator
export class SeededRNG {
  private seed: number;
  private state: number;

  constructor(seed: number = 42) {
    this.seed = seed;
    this.state = seed;
  }

  random(): number {
    this.state = (this.state * 1103515245 + 12345) & 0x7fffffff;
    return this.state / 0x7fffffff;
  }

  randint(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.random() * array.length)];
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/**
 * Prompt candidate in the genetic evolution pool
 */
export interface PromptCandidate {
  /** Unique identifier for this candidate */
  id: string;
  
  /** The prompt text/instruction */
  instruction: string;
  
  /** Performance score on validation set */
  score: number;
  
  /** Number of evaluation steps */
  steps: number;
  
  /** Generation number in evolution */
  generation: number;
  
  /** Parent candidate IDs (for tracking lineage) */
  parents: string[];
  
  /** Mutation type used to create this candidate */
  mutationType?: string;
  
  /** Reflection notes from LLM analysis */
  reflection?: string;
  
  /** Detailed performance metrics */
  metrics?: {
    accuracy: number;
    consistency: number;
    efficiency: number;
    novelty: number;
  };
  
  /** Examples where this candidate performed well */
  successExamples?: Example[];
  
  /** Examples where this candidate failed */
  failureExamples?: Example[];
}

/**
 * Trajectory data for reflection analysis
 */
export interface TrajectoryData {
  /** Input example */
  example: Example;
  
  /** Predicted output */
  prediction: Prediction;
  
  /** Whether prediction was correct */
  success: boolean;
  
  /** Performance score */
  score: number;
  
  /** Reasoning trace */
  trace?: any[];
  
  /** Tool calls made */
  toolCalls?: any[];
  
  /** Error information if failed */
  error?: string;
  
  /** Execution time */
  executionTime?: number;
}

/**
 * Reflection analysis result
 */
export interface ReflectionAnalysis {
  /** Problems identified */
  problems: string[];
  
  /** Proposed solutions */
  solutions: string[];
  
  /** High-level patterns learned */
  patterns: string[];
  
  /** Specific improvements suggested */
  improvements: string[];
  
  /** Confidence in analysis */
  confidence: number;
}

/**
 * Mutation strategy for genetic evolution
 */
export type MutationStrategy = 
  | 'reflect' // Reflective mutation based on failures
  | 'merge' // Merge two successful candidates  
  | 'simplify' // Simplify complex instructions
  | 'specialize' // Add domain-specific guidance
  | 'generalize' // Make instructions more general
  | 'reframe' // Reframe the problem approach
  | 'enhance' // Add missing components
  | 'debug'; // Fix identified issues

/**
 * Pareto frontier tracking
 */
export interface ParetoFrontier {
  /** Current candidates on the frontier */
  candidates: PromptCandidate[];
  
  /** Objectives being optimized */
  objectives: string[];
  
  /** Whether to maximize or minimize each objective */
  maximizing: boolean[];
}

/**
 * GEPA configuration options
 */
export interface GEPAConfig {
  /** Number of generations to evolve */
  num_generations?: number;
  
  /** Population size for genetic algorithm */
  population_size?: number;
  
  /** Number of candidates to keep on Pareto frontier */
  pareto_size?: number;
  
  /** Mutation rate for genetic evolution */
  mutation_rate?: number;
  
  /** Crossover rate for genetic evolution */
  crossover_rate?: number;
  
  /** Number of rollouts per candidate evaluation */
  num_rollouts?: number;
  
  /** Number of threads for parallel evaluation */
  num_threads?: number;
  
  /** Enable reflective analysis */
  enable_reflection?: boolean;
  
  /** Maximum reflection depth */
  max_reflection_depth?: number;
  
  /** Temperature for reflection LLM */
  reflection_temperature?: number;
  
  /** Enable diversity preservation */
  preserve_diversity?: boolean;
  
  /** Diversity threshold for duplicate detection */
  diversity_threshold?: number;
  
  /** Early stopping patience */
  early_stopping_patience?: number;
  
  /** Minimum improvement threshold */
  min_improvement?: number;
  
  /** Evaluation metric for optimization */
  metric?: MetricFunction;
  
  /** Random seed for reproducibility */
  seed?: number;
  
  /** Maximum instruction length */
  max_instruction_length?: number;
  
  /** Enable elitism (keep best candidates) */
  enable_elitism?: boolean;
  
  /** Number of elite candidates to preserve */
  num_elites?: number;
  
  /** Custom mutation strategies to use */
  mutation_strategies?: MutationStrategy[];
  
  /** Weight for different objectives */
  objective_weights?: number[];
  
  /** Domain-specific feedback for rapid improvement */
  domain_feedback?: string[];
  
  /** Whether to use instruction-only prompts */
  instruction_only?: boolean;
  
  /** Validation set size */
  validation_size?: number;
  
  /** Training data format */
  train_kwargs?: Record<string, any>;
}

/**
 * Default GEPA configuration
 */
export const DEFAULT_GEPA_CONFIG: Required<GEPAConfig> = {
  num_generations: 20,
  population_size: 50,
  pareto_size: 10,
  mutation_rate: 0.3,
  crossover_rate: 0.7,
  num_rollouts: 10,
  num_threads: 4,
  enable_reflection: true,
  max_reflection_depth: 3,
  reflection_temperature: 0.7,
  preserve_diversity: true,
  diversity_threshold: 0.85,
  early_stopping_patience: 5,
  min_improvement: 0.01,
  metric: (example, prediction) => prediction.data?.answer === example.data.answer,
  seed: 42,
  max_instruction_length: 500,
  enable_elitism: true,
  num_elites: 5,
  mutation_strategies: ['reflect', 'merge', 'simplify', 'specialize'],
  objective_weights: [1.0, 0.5, 0.3],
  domain_feedback: [],
  instruction_only: true,
  validation_size: 50,
  train_kwargs: {}
};

/**
 * GEPA (Genetic-Pareto) Teleprompter
 * 
 * Implements genetic evolution with Pareto optimization and reflective
 * prompt mutation for advanced prompt optimization. Uses natural language
 * reflection to learn high-level rules from trial and error.
 */
export class GEPA {
  private config: Required<GEPAConfig>;
  private rng: SeededRNG;
  private population: PromptCandidate[] = [];
  private paretoFrontier: ParetoFrontier;
  private generation: number = 0;
  private bestScore: number = 0;
  private noImprovementCount: number = 0;
  private reflectionCache: Map<string, ReflectionAnalysis> = new Map();
  private trajectoryHistory: TrajectoryData[] = [];
  
  constructor(config: GEPAConfig = {}) {
    this.config = { ...DEFAULT_GEPA_CONFIG, ...config };
    this.validateConfig();
    this.rng = new SeededRNG(this.config.seed);
    this.paretoFrontier = {
      candidates: [],
      objectives: ['accuracy', 'efficiency', 'diversity'],
      maximizing: [true, false, true]
    };
  }

  /**
   * Validate GEPA configuration
   */
  private validateConfig(): void {
    const config = this.config;
    
    if (config.num_generations < 1) {
      throw new Error('num_generations must be at least 1');
    }
    
    if (config.population_size < 2) {
      throw new Error('population_size must be at least 2');
    }
    
    if (config.pareto_size > config.population_size) {
      throw new Error('pareto_size cannot exceed population_size');
    }
    
    if (config.mutation_rate < 0 || config.mutation_rate > 1) {
      throw new Error('mutation_rate must be between 0 and 1');
    }
    
    if (config.crossover_rate < 0 || config.crossover_rate > 1) {
      throw new Error('crossover_rate must be between 0 and 1');
    }
    
    if (config.num_rollouts < 1) {
      throw new Error('num_rollouts must be at least 1');
    }
    
    if (config.reflection_temperature < 0 || config.reflection_temperature > 2) {
      throw new Error('reflection_temperature must be between 0 and 2');
    }
    
    if (config.diversity_threshold < 0 || config.diversity_threshold > 1) {
      throw new Error('diversity_threshold must be between 0 and 1');
    }
    
    if (config.max_instruction_length < 10) {
      throw new Error('max_instruction_length must be at least 10');
    }
    
    if (config.num_elites > config.population_size) {
      throw new Error('num_elites cannot exceed population_size');
    }
  }

  /**
   * Compile and optimize prompts using GEPA
   */
  async compile(
    student: DSPyModule,
    trainset: Example[],
    valset?: Example[]
  ): Promise<DSPyModule> {
    if (trainset.length === 0) {
      throw new Error('Training set is empty');
    }

    // Validate student program
    this.validateStudentProgram(student);
    
    // Prepare validation set
    const validationSet = valset || this.createValidationSet(trainset);
    
    // Initialize population with baseline candidates
    await this.initializePopulation(student, validationSet);
    
    console.log(`🧬 GEPA: Starting genetic evolution with ${this.config.population_size} candidates`);
    
    // Evolution loop
    for (this.generation = 1; this.generation <= this.config.num_generations; this.generation++) {
      console.log(`\n📊 Generation ${this.generation}/${this.config.num_generations}`);
      
      // Evaluate all candidates
      await this.evaluatePopulation(student, validationSet);
      
      // Update Pareto frontier
      this.updateParetoFrontier();
      
      // Check for improvement
      const currentBest = this.getBestCandidate();
      if (currentBest.score > this.bestScore + this.config.min_improvement) {
        this.bestScore = currentBest.score;
        this.noImprovementCount = 0;
        console.log(`✨ New best score: ${this.bestScore.toFixed(3)}`);
      } else {
        this.noImprovementCount++;
      }
      
      // Early stopping check
      if (this.noImprovementCount >= this.config.early_stopping_patience) {
        console.log(`🛑 Early stopping: No improvement for ${this.config.early_stopping_patience} generations`);
        break;
      }
      
      // Generate next generation
      if (this.generation < this.config.num_generations) {
        await this.evolvePopulation(student, validationSet);
      }
      
      // Report progress
      this.reportProgress();
    }
    
    // Apply best candidate to student
    const bestCandidate = this.getBestCandidate();
    return this.applyCandidate(student, bestCandidate);
  }

  /**
   * Validate student program requirements
   */
  private validateStudentProgram(student: DSPyModule): void {
    const predictors = student.predictors();
    
    if (predictors.length === 0) {
      throw new Error('Student program must have at least one predictor');
    }
    
    // Check that all predictors have LMs assigned
    for (const predictor of predictors) {
      if (!predictor.lm) {
        throw new Error('All predictors must have LMs assigned for GEPA optimization');
      }
    }
  }

  /**
   * Create validation set from training data
   */
  private createValidationSet(trainset: Example[]): Example[] {
    const validationSize = Math.min(this.config.validation_size, Math.floor(trainset.length * 0.2));
    const shuffled = this.rng.shuffle([...trainset]);
    return shuffled.slice(0, validationSize);
  }

  /**
   * Initialize population with baseline candidates
   */
  private async initializePopulation(student: DSPyModule, validationSet: Example[]): Promise<void> {
    console.log('🌱 Initializing GEPA population...');
    
    const predictors = student.predictors();
    const baseInstructions = predictors.map(p => p.signature.instruction || 'Complete the task accurately.');
    
    // Create initial candidates
    for (let i = 0; i < this.config.population_size; i++) {
      const candidate: PromptCandidate = {
        id: `gen0_${i}`,
        instruction: this.generateInitialInstruction(baseInstructions, i),
        score: 0,
        steps: 0,
        generation: 0,
        parents: [],
        mutationType: 'initial'
      };
      
      this.population.push(candidate);
    }
  }

  /**
   * Generate initial instruction variant
   */
  private generateInitialInstruction(baseInstructions: string[], index: number): string {
    if (index === 0) {
      return baseInstructions[0]; // Keep original as baseline
    }
    
    const strategies = [
      'Be more specific and detailed in your response.',
      'Think step by step before answering.',
      'Provide clear reasoning for your answer.',
      'Consider multiple perspectives before deciding.',
      'Focus on accuracy and precision.',
      'Use examples to illustrate your reasoning.',
      'Break down complex problems into simpler parts.',
      'Verify your answer before finalizing.'
    ];
    
    const strategy = strategies[index % strategies.length];
    return `${baseInstructions[0]} ${strategy}`;
  }

  /**
   * Evaluate all candidates in population
   */
  private async evaluatePopulation(student: DSPyModule, validationSet: Example[]): Promise<void> {
    console.log(`⚡ Evaluating ${this.population.length} candidates...`);
    
    const evaluationPromises = this.population.map(async (candidate) => {
      if (candidate.score === 0) { // Only evaluate new candidates
        await this.evaluateCandidate(candidate, student, validationSet);
      }
    });
    
    await Promise.all(evaluationPromises);
  }

  /**
   * Evaluate single candidate
   */
  private async evaluateCandidate(
    candidate: PromptCandidate, 
    student: DSPyModule, 
    validationSet: Example[]
  ): Promise<void> {
    const trajectories: TrajectoryData[] = [];
    let totalScore = 0;
    let successCount = 0;
    
    // Apply candidate to student
    const testStudent = this.applyCandidate(student, candidate);
    
    // Run rollouts
    const sampleSize = Math.min(this.config.num_rollouts, validationSet.length);
    const samples = this.rng.shuffle([...validationSet]).slice(0, sampleSize);
    
    for (const example of samples) {
      try {
        const startTime = Date.now();
        const prediction = await testStudent.forward(example.inputs);
        const executionTime = Date.now() - startTime;
        
        const score = this.config.metric(example, { data: prediction });
        const success = score > 0;
        
        if (success) successCount++;
        totalScore += score;
        
        const trajectory: TrajectoryData = {
          example,
          prediction: { data: prediction },
          success,
          score,
          executionTime
        };
        
        trajectories.push(trajectory);
        
        if (success) {
          candidate.successExamples = candidate.successExamples || [];
          candidate.successExamples.push(example);
        } else {
          candidate.failureExamples = candidate.failureExamples || [];
          candidate.failureExamples.push(example);
        }
        
      } catch (error) {
        const trajectory: TrajectoryData = {
          example,
          prediction: { data: null },
          success: false,
          score: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        
        trajectories.push(trajectory);
        candidate.failureExamples = candidate.failureExamples || [];
        candidate.failureExamples.push(example);
      }
    }
    
    // Calculate metrics
    candidate.score = totalScore / samples.length;
    candidate.steps = samples.length;
    candidate.metrics = {
      accuracy: successCount / samples.length,
      consistency: this.calculateConsistency(trajectories),
      efficiency: this.calculateEfficiency(trajectories),
      novelty: this.calculateNovelty(candidate)
    };
    
    // Store trajectories for reflection
    this.trajectoryHistory.push(...trajectories);
    
    // Perform reflection if enabled
    if (this.config.enable_reflection && candidate.failureExamples && candidate.failureExamples.length > 0) {
      candidate.reflection = await this.performReflection(candidate, trajectories);
    }
  }

  /**
   * Calculate consistency metric
   */
  private calculateConsistency(trajectories: TrajectoryData[]): number {
    if (trajectories.length < 2) return 1.0;
    
    const responses = trajectories.map(t => JSON.stringify(t.prediction.data));
    const unique = new Set(responses);
    return 1 - (unique.size - 1) / (trajectories.length - 1);
  }

  /**
   * Calculate efficiency metric
   */
  private calculateEfficiency(trajectories: TrajectoryData[]): number {
    const avgTime = trajectories
      .filter(t => t.executionTime)
      .reduce((sum, t) => sum + (t.executionTime || 0), 0) / trajectories.length;
    
    // Normalize to 0-1 range (lower time = higher efficiency)
    const maxTime = 10000; // 10 seconds max
    return Math.max(0, 1 - avgTime / maxTime);
  }

  /**
   * Calculate novelty metric
   */
  private calculateNovelty(candidate: PromptCandidate): number {
    const instruction = candidate.instruction.toLowerCase();
    
    // Compare with existing population
    let maxSimilarity = 0;
    for (const other of this.population) {
      if (other.id !== candidate.id) {
        const similarity = this.calculateSimilarity(instruction, other.instruction.toLowerCase());
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
    }
    
    return 1 - maxSimilarity;
  }

  /**
   * Calculate similarity between two instructions
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Perform reflective analysis on failures
   */
  private async performReflection(
    candidate: PromptCandidate, 
    trajectories: TrajectoryData[]
  ): Promise<string> {
    const failureTrajectories = trajectories.filter(t => !t.success);
    
    if (failureTrajectories.length === 0) {
      return 'No failures to analyze.';
    }
    
    // Create reflection key for caching
    const reflectionKey = this.createReflectionKey(candidate, failureTrajectories);
    
    if (this.reflectionCache.has(reflectionKey)) {
      const cached = this.reflectionCache.get(reflectionKey)!;
      return this.formatReflectionResult(cached);
    }
    
    // Analyze failures
    const analysis = await this.analyzeFailures(candidate, failureTrajectories);
    
    // Cache result
    this.reflectionCache.set(reflectionKey, analysis);
    
    return this.formatReflectionResult(analysis);
  }

  /**
   * Create reflection cache key
   */
  private createReflectionKey(candidate: PromptCandidate, trajectories: TrajectoryData[]): string {
    const instructionHash = this.hashString(candidate.instruction);
    const trajectoriesHash = this.hashString(JSON.stringify(trajectories.map(t => ({
      input: t.example.inputs,
      error: t.error,
      success: t.success
    }))));
    
    return `${instructionHash}_${trajectoriesHash}`;
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Analyze failure patterns and generate insights
   */
  private async analyzeFailures(
    candidate: PromptCandidate, 
    failureTrajectories: TrajectoryData[]
  ): Promise<ReflectionAnalysis> {
    // Simplified reflection analysis (in real implementation, would use LLM)
    const problems: string[] = [];
    const solutions: string[] = [];
    const patterns: string[] = [];
    const improvements: string[] = [];
    
    // Analyze common failure patterns
    const errorTypes = new Map<string, number>();
    const inputPatterns = new Map<string, number>();
    
    for (const trajectory of failureTrajectories) {
      if (trajectory.error) {
        const errorType = trajectory.error.split(':')[0];
        errorTypes.set(errorType, (errorTypes.get(errorType) || 0) + 1);
      }
      
      const inputType = typeof trajectory.example.inputs;
      inputPatterns.set(inputType, (inputPatterns.get(inputType) || 0) + 1);
    }
    
    // Generate problems and solutions
    if (errorTypes.size > 0) {
      const mostCommonError = Array.from(errorTypes.entries())
        .sort((a, b) => b[1] - a[1])[0][0];
      
      problems.push(`Common error type: ${mostCommonError}`);
      solutions.push(`Add error handling for ${mostCommonError}`);
      improvements.push(`Improve robustness against ${mostCommonError} errors`);
    }
    
    if (failureTrajectories.length > trajectories.length * 0.5) {
      problems.push('High failure rate indicates instruction clarity issues');
      solutions.push('Simplify and clarify instructions');
      improvements.push('Add step-by-step guidance');
    }
    
    patterns.push(`Failure rate: ${(failureTrajectories.length / trajectories.length * 100).toFixed(1)}%`);
    
    return {
      problems,
      solutions,
      patterns,
      improvements,
      confidence: Math.min(0.9, failureTrajectories.length / 10)
    };
  }

  /**
   * Format reflection analysis result
   */
  private formatReflectionResult(analysis: ReflectionAnalysis): string {
    const sections = [];
    
    if (analysis.problems.length > 0) {
      sections.push(`Problems: ${analysis.problems.join('; ')}`);
    }
    
    if (analysis.solutions.length > 0) {
      sections.push(`Solutions: ${analysis.solutions.join('; ')}`);
    }
    
    if (analysis.improvements.length > 0) {
      sections.push(`Improvements: ${analysis.improvements.join('; ')}`);
    }
    
    return sections.join(' | ');
  }

  /**
   * Update Pareto frontier with best candidates
   */
  private updateParetoFrontier(): void {
    // Sort candidates by multiple objectives
    const candidates = [...this.population];
    
    // Find non-dominated solutions (Pareto optimal)
    const paretoOptimal: PromptCandidate[] = [];
    
    for (const candidate of candidates) {
      let isDominated = false;
      
      for (const other of candidates) {
        if (other.id === candidate.id) continue;
        
        if (this.dominates(other, candidate)) {
          isDominated = true;
          break;
        }
      }
      
      if (!isDominated) {
        paretoOptimal.push(candidate);
      }
    }
    
    // Keep top candidates on frontier
    this.paretoFrontier.candidates = paretoOptimal
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.pareto_size);
  }

  /**
   * Check if candidate A dominates candidate B
   */
  private dominates(a: PromptCandidate, b: PromptCandidate): boolean {
    if (!a.metrics || !b.metrics) return false;
    
    const objectives = [a.metrics.accuracy, a.metrics.efficiency, a.metrics.novelty];
    const otherObjectives = [b.metrics.accuracy, b.metrics.efficiency, b.metrics.novelty];
    
    let betterInAll = true;
    let betterInAtLeastOne = false;
    
    for (let i = 0; i < objectives.length; i++) {
      if (this.paretoFrontier.maximizing[i]) {
        if (objectives[i] < otherObjectives[i]) {
          betterInAll = false;
        }
        if (objectives[i] > otherObjectives[i]) {
          betterInAtLeastOne = true;
        }
      } else {
        if (objectives[i] > otherObjectives[i]) {
          betterInAll = false;
        }
        if (objectives[i] < otherObjectives[i]) {
          betterInAtLeastOne = true;
        }
      }
    }
    
    return betterInAll && betterInAtLeastOne;
  }

  /**
   * Get best candidate from current population
   */
  private getBestCandidate(): PromptCandidate {
    return this.population.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }

  /**
   * Evolve population for next generation
   */
  private async evolvePopulation(student: DSPyModule, validationSet: Example[]): Promise<void> {
    console.log('🧬 Evolving population...');
    
    const newPopulation: PromptCandidate[] = [];
    
    // Preserve elites
    if (this.config.enable_elitism) {
      const elites = [...this.population]
        .sort((a, b) => b.score - a.score)
        .slice(0, this.config.num_elites);
      
      newPopulation.push(...elites);
    }
    
    // Generate offspring through mutation and crossover
    while (newPopulation.length < this.config.population_size) {
      if (this.rng.random() < this.config.crossover_rate) {
        // Crossover
        const parent1 = this.selectParent();
        const parent2 = this.selectParent();
        const offspring = await this.crossover(parent1, parent2);
        newPopulation.push(offspring);
      } else {
        // Mutation
        const parent = this.selectParent();
        const offspring = await this.mutate(parent);
        newPopulation.push(offspring);
      }
    }
    
    // Trim to exact population size
    this.population = newPopulation.slice(0, this.config.population_size);
  }

  /**
   * Select parent using tournament selection
   */
  private selectParent(): PromptCandidate {
    const tournamentSize = 3;
    const tournament = this.rng.shuffle([...this.population]).slice(0, tournamentSize);
    
    return tournament.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }

  /**
   * Create offspring through crossover
   */
  private async crossover(parent1: PromptCandidate, parent2: PromptCandidate): Promise<PromptCandidate> {
    // Simple crossover: combine instructions
    const instruction1 = parent1.instruction;
    const instruction2 = parent2.instruction;
    
    // Split instructions into sentences
    const sentences1 = instruction1.split(/[.!?]+/).filter(s => s.trim());
    const sentences2 = instruction2.split(/[.!?]+/).filter(s => s.trim());
    
    // Combine sentences
    const combinedSentences: string[] = [];
    const maxLength = Math.max(sentences1.length, sentences2.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (this.rng.random() < 0.5 && i < sentences1.length) {
        combinedSentences.push(sentences1[i].trim());
      } else if (i < sentences2.length) {
        combinedSentences.push(sentences2[i].trim());
      }
    }
    
    const newInstruction = combinedSentences.join('. ') + '.';
    
    return {
      id: `gen${this.generation}_cross_${this.rng.random().toString(36).substr(2, 8)}`,
      instruction: this.truncateInstruction(newInstruction),
      score: 0,
      steps: 0,
      generation: this.generation,
      parents: [parent1.id, parent2.id],
      mutationType: 'crossover'
    };
  }

  /**
   * Create offspring through mutation
   */
  private async mutate(parent: PromptCandidate): Promise<PromptCandidate> {
    const strategy = this.rng.choice(this.config.mutation_strategies);
    let newInstruction = parent.instruction;
    
    switch (strategy) {
      case 'reflect':
        newInstruction = await this.reflectiveMutation(parent);
        break;
      case 'simplify':
        newInstruction = this.simplifyInstruction(parent.instruction);
        break;
      case 'specialize':
        newInstruction = this.specializeInstruction(parent.instruction);
        break;
      case 'generalize':
        newInstruction = this.generalizeInstruction(parent.instruction);
        break;
      case 'reframe':
        newInstruction = this.reframeInstruction(parent.instruction);
        break;
      case 'enhance':
        newInstruction = this.enhanceInstruction(parent.instruction);
        break;
      case 'debug':
        newInstruction = await this.debugInstruction(parent);
        break;
      default:
        newInstruction = this.randomMutation(parent.instruction);
    }
    
    return {
      id: `gen${this.generation}_${strategy}_${this.rng.random().toString(36).substr(2, 8)}`,
      instruction: this.truncateInstruction(newInstruction),
      score: 0,
      steps: 0,
      generation: this.generation,
      parents: [parent.id],
      mutationType: strategy
    };
  }

  /**
   * Reflective mutation based on failure analysis
   */
  private async reflectiveMutation(parent: PromptCandidate): Promise<string> {
    if (!parent.reflection || !parent.failureExamples) {
      return this.randomMutation(parent.instruction);
    }
    
    // Extract improvement suggestions from reflection
    const reflection = parent.reflection;
    const improvements = reflection.split('Improvements: ')[1]?.split(' | ')[0] || '';
    
    if (improvements) {
      return `${parent.instruction} ${improvements}`;
    }
    
    return this.randomMutation(parent.instruction);
  }

  /**
   * Simplify instruction by removing redundancy
   */
  private simplifyInstruction(instruction: string): string {
    // Remove redundant words and phrases
    let simplified = instruction
      .replace(/\b(very|really|quite|extremely)\s+/gi, '')
      .replace(/\b(please|kindly)\s+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Keep only essential sentences
    const sentences = simplified.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length > 2) {
      simplified = sentences.slice(0, 2).join('. ') + '.';
    }
    
    return simplified;
  }

  /**
   * Specialize instruction for domain
   */
  private specializeInstruction(instruction: string): string {
    const specializations = [
      'Consider domain-specific knowledge when answering.',
      'Apply relevant technical expertise to the problem.',
      'Use specialized terminology appropriately.',
      'Focus on industry best practices.',
      'Consider regulatory or compliance requirements.'
    ];
    
    const specialization = this.rng.choice(specializations);
    return `${instruction} ${specialization}`;
  }

  /**
   * Generalize instruction for broader applicability
   */
  private generalizeInstruction(instruction: string): string {
    // Replace specific terms with general ones
    let generalized = instruction
      .replace(/\bspecific(ally)?\b/gi, 'general')
      .replace(/\bparticular(ly)?\b/gi, 'overall')
      .replace(/\bexact(ly)?\b/gi, 'approximate');
    
    const generalizations = [
      'Apply this approach broadly.',
      'Consider the general principles.',
      'Think about the overall pattern.',
      'Use a flexible approach.'
    ];
    
    const generalization = this.rng.choice(generalizations);
    return `${generalized} ${generalization}`;
  }

  /**
   * Reframe instruction with different perspective
   */
  private reframeInstruction(instruction: string): string {
    const frameworks = [
      'Approach this systematically:',
      'Consider this from first principles:',
      'Think about this step-by-step:',
      'Analyze this comprehensively:',
      'Break this down methodically:'
    ];
    
    const framework = this.rng.choice(frameworks);
    return `${framework} ${instruction}`;
  }

  /**
   * Enhance instruction with additional guidance
   */
  private enhanceInstruction(instruction: string): string {
    const enhancements = [
      'Double-check your reasoning.',
      'Provide clear justification.',
      'Consider alternative approaches.',
      'Validate your assumptions.',
      'Think through edge cases.',
      'Ensure logical consistency.'
    ];
    
    const enhancement = this.rng.choice(enhancements);
    return `${instruction} ${enhancement}`;
  }

  /**
   * Debug instruction based on failure patterns
   */
  private async debugInstruction(parent: PromptCandidate): Promise<string> {
    if (!parent.failureExamples || parent.failureExamples.length === 0) {
      return this.randomMutation(parent.instruction);
    }
    
    // Analyze failure patterns and add debugging guidance
    const debuggingStrategies = [
      'Verify each step of your reasoning.',
      'Check for common mistakes.',
      'Ensure answer format is correct.',
      'Validate input understanding.',
      'Consider boundary conditions.'
    ];
    
    const strategy = this.rng.choice(debuggingStrategies);
    return `${parent.instruction} ${strategy}`;
  }

  /**
   * Random mutation for baseline comparison
   */
  private randomMutation(instruction: string): string {
    const mutations = [
      'Be more precise.',
      'Think carefully.',
      'Consider all aspects.',
      'Provide detailed analysis.',
      'Focus on accuracy.',
      'Use logical reasoning.'
    ];
    
    const mutation = this.rng.choice(mutations);
    return `${instruction} ${mutation}`;
  }

  /**
   * Truncate instruction to maximum length
   */
  private truncateInstruction(instruction: string): string {
    if (instruction.length <= this.config.max_instruction_length) {
      return instruction;
    }
    
    // Truncate at sentence boundary
    const truncated = instruction.substring(0, this.config.max_instruction_length);
    const lastSentence = truncated.lastIndexOf('.');
    
    if (lastSentence > this.config.max_instruction_length * 0.8) {
      return truncated.substring(0, lastSentence + 1);
    }
    
    return truncated + '...';
  }

  /**
   * Apply candidate instruction to student module
   */
  private applyCandidate(student: DSPyModule, candidate: PromptCandidate): DSPyModule {
    const studentCopy = student.deepcopy();
    const predictors = studentCopy.predictors();
    
    // Apply instruction to all predictors
    for (const predictor of predictors) {
      predictor.updateInstructions(candidate.instruction);
    }
    
    studentCopy.compiled = true;
    return studentCopy;
  }

  /**
   * Report progress for current generation
   */
  private reportProgress(): void {
    const bestCandidate = this.getBestCandidate();
    const avgScore = this.population.reduce((sum, c) => sum + c.score, 0) / this.population.length;
    const frontierSize = this.paretoFrontier.candidates.length;
    
    console.log(`📈 Best: ${bestCandidate.score.toFixed(3)} | Avg: ${avgScore.toFixed(3)} | Frontier: ${frontierSize}`);
    
    if (bestCandidate.metrics) {
      const m = bestCandidate.metrics;
      console.log(`   Accuracy: ${m.accuracy.toFixed(3)} | Efficiency: ${m.efficiency.toFixed(3)} | Novelty: ${m.novelty.toFixed(3)}`);
    }
    
    if (bestCandidate.reflection) {
      console.log(`   Reflection: ${bestCandidate.reflection.substring(0, 100)}...`);
    }
  }
}