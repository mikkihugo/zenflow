/**
 * @fileoverview DSPy Program of Thought Primitive
 * 
 * Program of Thought (PoT) primitive that generates and executes code
 * to solve problems requiring computational reasoning.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.45
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Reference
 */

import { Predictor, type Signature } from './predictor.js';
import { PredictionResult } from './prediction.js';
import type { Example } from '../interfaces/types.js';

/**
 * Code execution result
 */
export interface CodeExecutionResult {
  /** Execution output */
  output: any;
  /** Whether execution was successful */
  success: boolean;
  /** Error message if execution failed */
  error?: string;
  /** Execution time in milliseconds */
  execution_time?: number;
  /** Generated variables and their values */
  variables?: Record<string, any>;
}

/**
 * Code executor interface
 */
export interface CodeExecutor {
  /** Execute code and return result */
  execute(code: string, context?: Record<string, any>): Promise<CodeExecutionResult>;
  /** Get supported language */
  getLanguage(): string;
  /** Check if executor is available */
  isAvailable(): boolean;
}

/**
 * Safe JavaScript executor with limited capabilities
 */
export class SafeJavaScriptExecutor implements CodeExecutor {
  private timeout: number;
  private allowedFunctions: Set<string>;

  constructor(timeout: number = 5000) {
    this.timeout = timeout;
    this.allowedFunctions = new Set([
      'Math', 'parseInt', 'parseFloat', 'Number', 'String', 'Boolean',
      'Array', 'Object', 'JSON', 'console'
    ]);
  }

  async execute(code: string, context: Record<string, any> = {}): Promise<CodeExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Basic safety checks
      if (this.containsUnsafeCode(code)) {
        return {
          output: null,
          success: false,
          error: 'Code contains potentially unsafe operations',
          execution_time: Date.now() - startTime
        };
      }

      // Create safe execution context
      const safeContext = {
        Math,
        parseInt,
        parseFloat,
        Number,
        String,
        Boolean,
        Array,
        Object,
        JSON,
        console: {
          log: (...args: any[]) => args.join(' ')
        },
        ...context
      };

      // Execute with timeout
      const result = await this.executeWithTimeout(code, safeContext, this.timeout);
      
      return {
        output: result.output,
        success: true,
        execution_time: Date.now() - startTime,
        variables: result.variables
      };
      
    } catch (error) {
      return {
        output: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        execution_time: Date.now() - startTime
      };
    }
  }

  getLanguage(): string {
    return 'javascript';
  }

  isAvailable(): boolean {
    return true;
  }

  private containsUnsafeCode(code: string): boolean {
    const unsafePatterns = [
      /require\s*\(/,
      /import\s+/,
      /eval\s*\(/,
      /Function\s*\(/,
      /setTimeout|setInterval/,
      /process\./,
      /global\./,
      /window\./,
      /document\./,
      /fetch\s*\(/,
      /XMLHttpRequest/,
      /fs\./,
      /path\./,
      /os\./,
      /crypto\./,
      /child_process/
    ];

    return unsafePatterns.some(pattern => pattern.test(code));
  }

  private async executeWithTimeout(
    code: string, 
    context: Record<string, any>, 
    timeout: number
  ): Promise<{ output: any; variables: Record<string, any> }> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Code execution timeout'));
      }, timeout);

      try {
        // Create function with context
        const contextKeys = Object.keys(context);
        const contextValues = Object.values(context);
        
        // Wrap code to capture variables and return value
        const wrappedCode = `
          const __vars = {};
          let __result;
          
          ${code}
          
          // Try to capture the last expression as result
          if (typeof result !== 'undefined') {
            __result = result;
          }
          
          // Capture all declared variables
          ${contextKeys.map(key => `if (typeof ${key} !== 'undefined' && ${key} !== ${context[key]}) __vars['${key}'] = ${key};`).join('\n')}
          
          return { output: __result, variables: __vars };
        `;

        const func = new Function(...contextKeys, wrappedCode);
        const result = func(...contextValues);
        
        clearTimeout(timer);
        resolve(result);
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }
}

/**
 * Python-like pseudo executor (for demonstration)
 */
export class PythonPseudoExecutor implements CodeExecutor {
  async execute(code: string, context: Record<string, any> = {}): Promise<CodeExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Convert simple Python-like code to JavaScript
      const jsCode = this.convertPythonToJS(code);
      const jsExecutor = new SafeJavaScriptExecutor();
      
      const result = await jsExecutor.execute(jsCode, context);
      result.execution_time = Date.now() - startTime;
      
      return result;
    } catch (error) {
      return {
        output: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        execution_time: Date.now() - startTime
      };
    }
  }

  getLanguage(): string {
    return 'python';
  }

  isAvailable(): boolean {
    return true;
  }

  private convertPythonToJS(pythonCode: string): string {
    // Simple Python to JavaScript conversion for basic math operations
    let jsCode = pythonCode
      .replace(/print\s*\(([^)]+)\)/g, 'console.log($1)')
      .replace(/def\s+(\w+)\s*\(([^)]*)\):/g, 'function $1($2) {')
      .replace(/^\s*return\s+(.+)$/gm, 'return $1;')
      .replace(/^\s*(.+)$/gm, '$1;')
      .replace(/;\s*$/gm, ';')
      .replace(/:\s*$/gm, '')
      .replace(/elif/g, 'else if')
      .replace(/True/g, 'true')
      .replace(/False/g, 'false')
      .replace(/None/g, 'null');

    return jsCode;
  }
}

/**
 * Program of Thought configuration
 */
export interface ProgramOfThoughtConfig {
  /** Code field name */
  code_field?: string;
  /** Result field name */
  result_field?: string;
  /** Code executor */
  executor?: CodeExecutor;
  /** Whether to include code in output */
  include_code?: boolean;
  /** Whether to include execution details */
  include_execution_details?: boolean;
  /** Programming language hint */
  language?: string;
}

/**
 * Default PoT configuration
 */
const DEFAULT_POT_CONFIG: Required<ProgramOfThoughtConfig> = {
  code_field: 'code',
  result_field: 'result',
  executor: new SafeJavaScriptExecutor(),
  include_code: true,
  include_execution_details: false,
  language: 'javascript'
};

/**
 * Program of Thought Predictor
 * 
 * Generates and executes code to solve computational problems.
 * Useful for mathematical calculations, data processing, and algorithmic tasks.
 * 
 * @example
 * ```typescript
 * const signature: Signature = {
 *   inputs: { problem: "string" },
 *   outputs: { answer: "number" },
 *   instruction: "Write code to solve the mathematical problem."
 * };
 * 
 * const pot = new ProgramOfThought(signature);
 * pot.set_lm(languageModel);
 * 
 * const result = await pot.forward({ 
 *   problem: "Calculate the factorial of 5" 
 * });
 * 
 * console.log(result.code);   // "function factorial(n) { ... }"
 * console.log(result.result); // 120
 * console.log(result.answer); // 120
 * ```
 */
export class ProgramOfThought extends Predictor {
  private config: Required<ProgramOfThoughtConfig>;
  private originalSignature: Signature;

  constructor(signature: Signature, config: ProgramOfThoughtConfig = {}) {
    // Store original signature
    const originalSignature = { ...signature };
    
    // Create enhanced signature with code field
    const enhancedSignature = ProgramOfThought.enhanceSignature(signature, config);
    
    super(enhancedSignature);
    
    this.config = { ...DEFAULT_POT_CONFIG, ...config };
    this.originalSignature = originalSignature;

    // Add PoT-specific parameters
    this.addParameter('code_field', this.config.code_field, true, { type: 'pot' });
    this.addParameter('result_field', this.config.result_field, true, { type: 'pot' });
    this.addParameter('language', this.config.language, true, { type: 'pot' });
  }

  /**
   * Enhanced forward method with code generation and execution
   * 
   * @param inputs - Input values
   * @returns Prediction with executed code result
   */
  async forward(inputs: Record<string, any>): Promise<PredictionResult> {
    // Generate code using LM
    const llmResult = await this.aforward(inputs);
    
    // Extract generated code
    const code = llmResult.get(this.config.code_field) || '';
    
    if (!code.trim()) {
      throw new Error('No code was generated by the language model');
    }

    // Execute the code
    const executionResult = await this.config.executor.execute(code, inputs);
    
    // Create enhanced result
    const result = new PredictionResult({
      ...llmResult.outputs(),
      [this.config.result_field]: executionResult.output
    });

    // Map execution result to original output fields
    if (executionResult.success && executionResult.output !== null) {
      const originalOutputs = Object.keys(this.originalSignature.outputs);
      for (const field of originalOutputs) {
        if (!result.has(field)) {
          result.set(field, executionResult.output);
        }
      }
    }

    // Include execution details if requested
    if (this.config.include_execution_details) {
      result.updateMetadata({
        execution_success: executionResult.success,
        execution_time: executionResult.execution_time,
        execution_error: executionResult.error,
        variables: executionResult.variables
      });
    }

    // Remove code from output if not wanted
    if (!this.config.include_code) {
      delete result[this.config.code_field];
    }

    return result;
  }

  /**
   * Format prompt for code generation
   * 
   * @param inputs - Input values
   * @returns Formatted PoT prompt
   */
  formatPrompt(inputs: Record<string, any>): string {
    let prompt = '';

    // Add instruction with code generation guidance
    const instruction = this.instructions || this.originalSignature.instruction || '';
    prompt += `${instruction}\n\n`;
    prompt += `Write ${this.config.language} code to solve this problem. `;
    prompt += `Assign the final answer to a variable called 'result'.\n\n`;

    // Add demonstrations with code
    if (this.demos.length > 0) {
      prompt += 'Examples:\n';
      for (const demo of this.demos) {
        prompt += this.formatPoTExample(demo) + '\n\n';
      }
    }

    // Add current input
    prompt += this.formatInputs(inputs);

    // Add code field prompt
    prompt += `\n${this.config.code_field}: `;

    return prompt;
  }

  /**
   * Format a PoT example with code
   * 
   * @param example - Example to format
   * @returns Formatted PoT example
   */
  private formatPoTExample(example: Example): string {
    let formatted = '';

    // Format inputs
    const inputs = example.inputs();
    for (const [key, value] of Object.entries(inputs.data)) {
      if (key in this.originalSignature.inputs) {
        formatted += `${key}: ${value}\n`;
      }
    }

    // Add code if present
    const labels = example.labels();
    if (this.config.code_field in labels.data) {
      formatted += `${this.config.code_field}: ${labels.data[this.config.code_field]}\n`;
    }

    // Add result if present
    if (this.config.result_field in labels.data) {
      formatted += `${this.config.result_field}: ${labels.data[this.config.result_field]}\n`;
    }

    // Add original outputs
    for (const [key, value] of Object.entries(labels.data)) {
      if (key in this.originalSignature.outputs) {
        formatted += `${key}: ${value}\n`;
      }
    }

    return formatted.trim();
  }

  /**
   * Add a PoT demonstration with code
   * 
   * @param inputs - Input values
   * @param code - Generated code
   * @param result - Execution result
   * @param outputs - Final outputs
   */
  addPoTDemo(
    inputs: Record<string, any>, 
    code: string, 
    result: any,
    outputs: Record<string, any>
  ): void {
    const exampleData = {
      ...inputs,
      [this.config.code_field]: code,
      [this.config.result_field]: result,
      ...outputs
    };

    const example = {
      inputs: () => ({ data: inputs }),
      labels: () => ({ 
        data: { 
          [this.config.code_field]: code,
          [this.config.result_field]: result,
          ...outputs 
        } 
      })
    } as Example;

    this.addDemo(example);
  }

  /**
   * Execute code directly without LM generation
   * 
   * @param code - Code to execute
   * @param context - Execution context
   * @returns Execution result
   */
  async executeCode(
    code: string, 
    context: Record<string, any> = {}
  ): Promise<CodeExecutionResult> {
    return await this.config.executor.execute(code, context);
  }

  /**
   * Set code executor
   * 
   * @param executor - New executor
   */
  setExecutor(executor: CodeExecutor): void {
    this.config.executor = executor;
    this.updateParameter('language', executor.getLanguage());
  }

  /**
   * Get current executor
   * 
   * @returns Current executor
   */
  getExecutor(): CodeExecutor {
    return this.config.executor;
  }

  /**
   * Update PoT configuration
   * 
   * @param updates - Configuration updates
   */
  updateConfig(updates: Partial<ProgramOfThoughtConfig>): void {
    this.config = { ...this.config, ...updates };
    this.updateParameter('code_field', this.config.code_field);
    this.updateParameter('result_field', this.config.result_field);
    this.updateParameter('language', this.config.language);
  }

  /**
   * Create deep copy of PoT predictor
   * 
   * @returns Deep copy
   */
  deepcopy(): ProgramOfThought {
    const copy = new ProgramOfThought(this.originalSignature, this.config);
    
    // Copy predictor properties
    copy.demos = [...this.demos];
    copy.instructions = this.instructions;
    copy.set_lm(this._lm);
    
    // Reset state
    copy.history = [];
    copy._compiled = false;

    return copy;
  }

  /**
   * Get original signature (without code fields)
   * 
   * @returns Original signature
   */
  getOriginalSignature(): Signature {
    return { ...this.originalSignature };
  }

  /**
   * Enhance signature with code and result fields
   * 
   * @param signature - Original signature
   * @param config - PoT configuration
   * @returns Enhanced signature
   */
  private static enhanceSignature(
    signature: Signature, 
    config: ProgramOfThoughtConfig = {}
  ): Signature {
    const codeField = config.code_field || DEFAULT_POT_CONFIG.code_field;
    const resultField = config.result_field || DEFAULT_POT_CONFIG.result_field;
    
    return {
      ...signature,
      outputs: {
        [codeField]: 'string',
        [resultField]: 'any',
        ...signature.outputs
      },
      instruction: signature.instruction || 'Write code to solve this problem step by step.'
    };
  }
}

/**
 * Create a Program of Thought predictor
 * 
 * @param signature - Predictor signature
 * @param config - PoT configuration
 * @returns Configured ProgramOfThought instance
 */
export function createProgramOfThought(
  signature: Signature, 
  config: ProgramOfThoughtConfig = {}
): ProgramOfThought {
  return new ProgramOfThought(signature, config);
}

/**
 * Create a Program of Thought predictor with JavaScript executor
 * 
 * @param signature - Predictor signature
 * @returns Configured ProgramOfThought instance
 */
export function createJavaScriptPoT(signature: Signature): ProgramOfThought {
  return new ProgramOfThought(signature, {
    executor: new SafeJavaScriptExecutor(),
    language: 'javascript'
  });
}

/**
 * Create a Program of Thought predictor with Python-like executor
 * 
 * @param signature - Predictor signature
 * @returns Configured ProgramOfThought instance
 */
export function createPythonPoT(signature: Signature): ProgramOfThought {
  return new ProgramOfThought(signature, {
    executor: new PythonPseudoExecutor(),
    language: 'python'
  });
}