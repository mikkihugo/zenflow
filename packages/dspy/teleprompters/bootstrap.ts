/**
 * @fileoverview Bootstrap Few-Shot Teleprompter Implementation
 * 
 * Core teleprompter for generating few-shot demonstrations by running a teacher model
 * on training examples and collecting successful traces. This is foundational to the
 * DSPy ecosystem and used by many other teleprompters.
 * 
 * Key Features:
 * - Teacher/Student model coordination for bootstrapping
 * - Metric-based validation of generated examples
 * - Iterative trace collection and compilation
 * - Integration with labeled examples
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import type { Example } from '../primitives/example';
import type { DSPyModule } from '../primitives/module';
import type { DSPyPredictor } from '../primitives/predictor';
import type { MetricFunction, TraceStep } from '../interfaces/types';
import { SeededRNG } from '../utils/rng';

/**
 * Configuration options for Bootstrap Few-Shot teleprompter
 */
export interface BootstrapConfig {
  /** Metric function to evaluate example quality */
  metric?: MetricFunction;
  /** Minimum threshold for metric acceptance */
  metricThreshold?: number;
  /** Settings for teacher model configuration */
  teacherSettings?: Record<string, any>;
  /** Maximum number of bootstrapped demonstrations */
  maxBootstrappedDemos?: number;
  /** Maximum number of labeled demonstrations */
  maxLabeledDemos?: number;
  /** Maximum rounds to attempt bootstrap generation */
  maxRounds?: number;
  /** Maximum errors before terminating */
  maxErrors?: number;
  /** Seed for reproducible results */
  seed?: number;
  /** Enable verbose logging */
  verbose?: boolean;
}

/**
 * Default configuration for Bootstrap teleprompter
 */
export const DEFAULT_BOOTSTRAP_CONFIG: Required<BootstrapConfig> = {
  metric: () => true, // Accept all by default
  metricThreshold: 0.0,
  teacherSettings: {},
  maxBootstrappedDemos: 4,
  maxLabeledDemos: 16,
  maxRounds: 1,
  maxErrors: 10,
  seed: 0,
  verbose: false
};

/**
 * Compilation options for Bootstrap teleprompter
 */
export interface BootstrapCompileOptions {
  /** Training examples for bootstrapping */
  trainset: Example[];
  /** Optional teacher model (defaults to student copy) */
  teacher?: DSPyModule;
  /** Validation set for evaluation */
  valset?: Example[];
}

/**
 * Internal tracking for predictor mappings
 */
interface PredictorMapping {
  name2predictor: Map<string, DSPyPredictor>;
  predictor2name: Map<string, string>;
  name2traces: Map<string, Example[]>;
}

/**
 * Bootstrap Few-Shot Teleprompter
 * 
 * Composes a set of demonstrations by running a teacher model on training examples
 * and collecting successful traces. These demonstrations are then used to improve
 * the student model's performance through few-shot learning.
 * 
 * Algorithm:
 * 1. Create teacher model (copy of student or provided)
 * 2. For each training example:
 *    - Run teacher model to generate prediction
 *    - Evaluate with metric function
 *    - If successful, extract demonstration from trace
 *    - Update teacher with new demonstrations
 * 3. Combine bootstrapped and labeled demonstrations
 * 4. Configure student model with final demonstration set
 */
export class BootstrapFewShot {
  private config: Required<BootstrapConfig>;
  private rng: SeededRNG;
  private errorCount: number = 0;
  
  // Internal state
  private student?: DSPyModule;
  private teacher?: DSPyModule;
  private trainset: Example[] = [];
  private validation: Example[] = [];
  private mapping?: PredictorMapping;

  constructor(config: BootstrapConfig = {}) {
    this.config = { ...DEFAULT_BOOTSTRAP_CONFIG, ...config };
    this.rng = new SeededRNG(this.config.seed);
  }

  /**
   * Compile the student module with bootstrap few-shot demonstrations
   * 
   * @param student - The module to be trained
   * @param options - Compilation options
   * @returns Compiled module with demonstrations
   */
  async compile(
    student: DSPyModule, 
    options: BootstrapCompileOptions
  ): Promise<DSPyModule> {
    this.trainset = options.trainset;
    
    // Reset state
    this.errorCount = 0;
    
    if (this.config.verbose) {
      console.log(`🎯 Bootstrap: Starting compilation with ${this.trainset.length} training examples`);
    }

    // Step 1: Prepare student and teacher models
    this._prepareStudentAndTeacher(student, options.teacher);
    
    // Step 2: Set up predictor mappings
    this._preparePredictorMappings();
    
    // Step 3: Bootstrap demonstrations
    await this._bootstrap();
    
    // Step 4: Train student with collected demonstrations
    this._train();
    
    // Mark as compiled
    this.student!.compiled = true;
    
    if (this.config.verbose) {
      console.log(`✅ Bootstrap: Compilation complete`);
    }
    
    return this.student!;
  }

  /**
   * Prepare student and teacher models for bootstrapping
   */
  private _prepareStudentAndTeacher(student: DSPyModule, teacher?: DSPyModule): void {
    // Create fresh copy of student (reset to base state)
    this.student = student.deepcopy();
    
    // Clear any existing demonstrations from student
    for (const predictor of this.student.predictors()) {
      predictor.clearDemos();
    }
    
    // Create teacher model (either provided or copy of student)
    this.teacher = teacher ? teacher.deepcopy() : student.deepcopy();
    
    // If teacher isn't already compiled and we want labeled demos, add them
    if (this.config.maxLabeledDemos > 0 && !this.teacher.compiled) {
      this._addLabeledDemosToTeacher();
    }
    
    if (this.config.verbose) {
      console.log(`👨‍🏫 Teacher prepared with ${this.teacher.predictors().length} predictors`);
    }
  }

  /**
   * Add labeled demonstrations to teacher model
   */
  private _addLabeledDemosToTeacher(): void {
    // Simple labeled few-shot: take first k examples as demonstrations
    const labeledDemos = this.trainset
      .slice(0, this.config.maxLabeledDemos)
      .map(example => {
        // Convert training example to demonstration format
        return example.copy({
          // Mark as labeled demonstration
          _source: 'labeled'
        });
      });

    // Add labeled demos to each teacher predictor
    for (const predictor of this.teacher!.predictors()) {
      predictor.updateDemos(labeledDemos);
    }
    
    if (this.config.verbose) {
      console.log(`📚 Added ${labeledDemos.length} labeled demonstrations to teacher`);
    }
  }

  /**
   * Set up mappings between student and teacher predictors
   */
  private _preparePredictorMappings(): void {
    const studentPredictors = this.student!.predictors();
    const teacherPredictors = this.teacher!.predictors();
    
    if (studentPredictors.length !== teacherPredictors.length) {
      throw new Error(
        `Student and teacher must have same number of predictors: ${studentPredictors.length} vs ${teacherPredictors.length}`
      );
    }
    
    const name2predictor = new Map<string, DSPyPredictor>();
    const predictor2name = new Map<string, string>();
    const name2traces = new Map<string, Example[]>();
    
    studentPredictors.forEach((studentPredictor, index) => {
      const teacherPredictor = teacherPredictors[index];
      const name = `predictor_${index}`;
      
      // Validate signature compatibility
      if (JSON.stringify(studentPredictor.signature) !== JSON.stringify(teacherPredictor.signature)) {
        throw new Error(`Predictor ${index} signatures must match between student and teacher`);
      }
      
      name2predictor.set(name, studentPredictor);
      predictor2name.set(`student_${index}`, name);
      predictor2name.set(`teacher_${index}`, name);
      name2traces.set(name, []);
    });
    
    this.mapping = { name2predictor, predictor2name, name2traces };
  }

  /**
   * Bootstrap demonstrations from training examples
   */
  private async _bootstrap(): Promise<void> {
    const maxBootstraps = this.config.maxBootstrappedDemos;
    let bootstrapAttempts = 0;
    const bootstrapped = new Set<number>();
    
    if (this.config.verbose) {
      console.log(`🔄 Starting bootstrap with max ${maxBootstraps} demonstrations`);
    }
    
    for (let exampleIdx = 0; exampleIdx < this.trainset.length; exampleIdx++) {
      if (bootstrapped.size >= maxBootstraps) {
        break;
      }
      
      const example = this.trainset[exampleIdx];
      
      for (let roundIdx = 0; roundIdx < this.config.maxRounds; roundIdx++) {
        bootstrapAttempts++;
        
        const success = await this._bootstrapOneExample(example, roundIdx);
        
        if (success) {
          bootstrapped.add(exampleIdx);
          break;
        }
      }
    }
    
    // Create validation set from non-bootstrapped examples
    this.validation = this.trainset.filter((_, idx) => !bootstrapped.has(idx));
    this.rng.shuffle(this.validation);
    
    if (this.config.verbose) {
      console.log(
        `📊 Bootstrapped ${bootstrapped.size} examples after ${bootstrapAttempts} attempts`
      );
      console.log(`📝 Created validation set with ${this.validation.length} examples`);
    }
  }

  /**
   * Bootstrap a single example
   */
  private async _bootstrapOneExample(example: Example, roundIdx: number): Promise<boolean> {
    try {
      // Slightly increase temperature for retry rounds
      const temperature = roundIdx > 0 ? 0.7 + 0.001 * roundIdx : 0.0;
      
      // Remove current example from teacher's demos to avoid leakage
      const teacherPredictors = this.teacher!.predictors();
      const originalDemos = teacherPredictors.map(p => [...p.demos]);
      
      try {
        // Remove current example from demos (prevent data leakage)
        teacherPredictors.forEach(predictor => {
          const filteredDemos = predictor.demos.filter(demo => 
            JSON.stringify(demo.data) !== JSON.stringify(example.data)
          );
          predictor.updateDemos(filteredDemos);
        });
        
        // Run teacher on example to generate trace
        const prediction = await this.teacher!.forward(example.inputs().data);
        
        // Simulate trace collection (in real implementation, this would come from the model)
        const trace: TraceStep[] = [
          {
            predictor: teacherPredictors[0],
            inputs: example.inputs().data,
            outputs: prediction,
            timestamp: Date.now()
          }
        ];
        
        // Evaluate with metric
        let success = true;
        if (this.config.metric) {
          const metricValue = this.config.metric(example, { 
            data: prediction, 
            score: 1.0,
            raw_response: JSON.stringify(prediction)
          }, trace);
          
          if (typeof metricValue === 'number') {
            success = metricValue >= this.config.metricThreshold;
          } else {
            success = Boolean(metricValue);
          }
        }
        
        // If successful, add demonstration to traces
        if (success) {
          this._addTraceToDemo(example, prediction, trace);
        }
        
        return success;
        
      } finally {
        // Restore original demos
        teacherPredictors.forEach((predictor, idx) => {
          predictor.updateDemos(originalDemos[idx]);
        });
      }
      
    } catch (error) {
      this.errorCount++;
      
      if (this.config.verbose) {
        console.warn(`⚠️ Failed to bootstrap example: ${error}`);
      }
      
      // Check if we've exceeded max errors AFTER incrementing
      if (this.errorCount >= this.config.maxErrors) {
        throw error;
      }
      
      return false;
    }
  }

  /**
   * Add successful trace as demonstration
   */
  private _addTraceToDemo(example: Example, prediction: any, trace: TraceStep[]): void {
    for (const step of trace) {
      // Create demonstration from trace step
      const demo = example.copy({
        ...step.inputs,
        ...step.outputs,
        _augmented: true,
        _source: 'bootstrap'
      });
      
      // Determine predictor name (simplified for single predictor case)
      const predictorName = 'predictor_0';
      
      if (this.mapping?.name2traces.has(predictorName)) {
        const traces = this.mapping.name2traces.get(predictorName)!;
        traces.push(demo);
        
        // Update teacher with new demonstration
        const teacherPredictors = this.teacher!.predictors();
        if (teacherPredictors.length > 0) {
          teacherPredictors[0].addDemo(demo);
        }
      }
    }
  }

  /**
   * Train student with collected demonstrations
   */
  private _train(): void {
    if (!this.student || !this.mapping) {
      throw new Error('Student and mapping must be initialized');
    }
    
    const studentPredictors = this.student.predictors();
    
    studentPredictors.forEach((predictor, index) => {
      const predictorName = `predictor_${index}`;
      const bootstrappedDemos = this.mapping!.name2traces.get(predictorName) || [];
      
      // Limit bootstrapped demos
      const maxBootstrapped = Math.min(bootstrappedDemos.length, this.config.maxBootstrappedDemos);
      const selectedBootstrapped = bootstrappedDemos.slice(0, maxBootstrapped);
      
      // Add labeled demos if space available
      const remainingSlots = this.config.maxLabeledDemos - selectedBootstrapped.length;
      const labeledDemos = remainingSlots > 0 
        ? this.rng.sample(this.validation, Math.min(remainingSlots, this.validation.length))
        : [];
      
      // Combine demonstrations
      const allDemos = [...selectedBootstrapped, ...labeledDemos];
      
      // Update predictor with demonstrations
      predictor.updateDemos(allDemos);
      
      if (this.config.verbose) {
        console.log(
          `🎯 Predictor ${index}: ${selectedBootstrapped.length} bootstrapped + ${labeledDemos.length} labeled = ${allDemos.length} total demos`
        );
      }
    });
  }
}

/**
 * Labeled Few-Shot Teleprompter
 * 
 * Simple teleprompter that uses labeled training examples as demonstrations.
 * Used as a component in Bootstrap and other teleprompters.
 */
export class LabeledFewShot {
  private k: number;
  private seed: number;

  constructor(k: number = 16, seed: number = 0) {
    this.k = k;
    this.seed = seed;
  }

  /**
   * Compile module with labeled few-shot examples
   */
  compile(student: DSPyModule, options: { trainset: Example[] }): DSPyModule {
    const compiled = student.deepcopy();
    const rng = new SeededRNG(this.seed);
    
    // Sample k examples from trainset
    const demos = rng.sample(options.trainset, Math.min(this.k, options.trainset.length));
    
    // Add to all predictors
    for (const predictor of compiled.predictors()) {
      predictor.updateDemos(demos);
    }
    
    compiled.compiled = true;
    return compiled;
  }
}