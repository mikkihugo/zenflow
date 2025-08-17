/**
 * @fileoverview CodeAct DSPy Module
 * 
 * Implementation of CodeAct that combines ReAct and ProgramOfThought to solve
 * problems using code generation and execution with predefined tools.
 * Based on Stanford DSPy's CodeAct implementation.
 * 
 * Key Features:
 * - Code generation and execution with tool integration
 * - Iterative code development with feedback
 * - JavaScript/Python code execution support
 * - Tool function integration
 * - Trajectory management and extraction
 * - Automatic completion detection
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.47
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Reference
 */

import { BaseModule } from './module.js';
import { Predictor } from './predictor.js';
import { ChainOfThought } from './chain-of-thought.js';
import type { Signature, EnhancedSignature } from './signature.js';
import type { PredictionResult } from './predictor.js';
import type { Tool } from './react.js';

/**
 * Code executor interface
 */
export interface CodeExecutor {
  /** Execute code and return result */
  execute(code: string): Promise<{ output: string; error?: string }>;
  /** Execute code synchronously */
  executeSync?(code: string): { output: string; error?: string };
  /** Shutdown the executor */
  shutdown(): void;
  /** Define a function in the executor context */
  defineFunction(name: string, func: Function): void;
}

/**
 * Configuration for CodeAct module
 */
export interface CodeActConfig {
  /** Maximum number of iterations (default: 5) */
  maxIters?: number;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Custom code executor */
  executor?: CodeExecutor;
  /** Custom instruction override */
  customInstruction?: string;
}

/**
 * CodeAct result with trajectory and code
 */
export interface CodeActResult extends PredictionResult {
  /** Full trajectory of code generation and execution */
  trajectory: Record<string, any>;
  /** Generated code snippets */
  generatedCode: string[];
  /** Code execution outputs */
  codeOutputs: string[];
  /** Whether the task was completed */
  finished: boolean;
}

/**
 * Simple JavaScript executor
 */
export class JavaScriptExecutor implements CodeExecutor {
  private context: Record<string, any> = {};
  private consoleOutput: string[] = [];

  async execute(code: string): Promise<{ output: string; error?: string }> {
    return this.executeSync(code);
  }

  executeSync(code: string): { output: string; error?: string } {
    try {
      this.consoleOutput = [];
      
      // Create a mock console that captures output
      const mockConsole = {
        log: (...args: any[]) => {
          this.consoleOutput.push(args.map(arg => String(arg)).join(' '));
        },
        error: (...args: any[]) => {
          this.consoleOutput.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
        },
        warn: (...args: any[]) => {
          this.consoleOutput.push('WARN: ' + args.map(arg => String(arg)).join(' '));
        }
      };

      // Create execution context
      const context = {
        ...this.context,
        console: mockConsole,
        Math,
        Date,
        JSON,
        Array,
        Object,
        String,
        Number,
        Boolean
      };

      // Create function with context
      const func = new Function(...Object.keys(context), code);
      
      // Execute with context
      const result = func(...Object.values(context));
      
      // If there's a return value, add it to output
      if (result !== undefined) {
        this.consoleOutput.push(String(result));
      }

      return {
        output: this.consoleOutput.join('\n')
      };

    } catch (error) {
      return {
        output: this.consoleOutput.join('\n'),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  shutdown(): void {
    this.context = {};
    this.consoleOutput = [];
  }

  defineFunction(name: string, func: Function): void {
    this.context[name] = func;
  }
}

/**
 * CodeAct Module - Code Generation and Execution
 * 
 * Combines reasoning and acting with code generation to solve problems
 * by writing and executing code with access to predefined tools.
 * 
 * Algorithm:
 * 1. Initialize with signature and available tools
 * 2. For each iteration:
 *    - Generate code based on current trajectory
 *    - Parse and validate the generated code
 *    - Execute code and capture output
 *    - Update trajectory with results
 *    - Check if task is finished
 * 3. Extract final answer from trajectory
 * 
 * @example
 * ```typescript
 * const factorial = (n: number): number => {
 *   return n <= 1 ? 1 : n * factorial(n - 1);
 * };
 * 
 * const codeAct = new CodeAct({
 *   inputs: { n: 'number' },
 *   outputs: { factorial: 'number' }
 * }, [factorial], { maxIters: 3 });
 * 
 * const result = await codeAct.forward({ n: 5 });
 * console.log(result.factorial); // 120
 * console.log(result.trajectory); // Full execution trace
 * ```
 */
export class CodeAct extends BaseModule {
  private signature: Signature;
  private tools: Map<string, Tool>;
  private maxIters: number;
  private verbose: boolean;
  private executor: CodeExecutor;
  private codeActPredictor: Predictor;
  private extractPredictor: ChainOfThought;

  /**
   * Initialize CodeAct module
   * 
   * @param signature - Input/output signature defining the task
   * @param tools - Available tools/functions for the agent
   * @param config - Configuration options
   */
  constructor(
    signature: Signature | EnhancedSignature,
    tools: (Tool | Function)[],
    config: CodeActConfig = {}
  ) {
    super();

    this.signature = this.ensureSignature(signature);
    this.maxIters = config.maxIters || 5;
    this.verbose = config.verbose || false;
    this.executor = config.executor || new JavaScriptExecutor();

    // Process and normalize tools
    this.tools = this.processTools(tools);

    // Define tools in executor
    for (const tool of this.tools.values()) {
      if (typeof tool.func === 'function') {
        this.executor.defineFunction(tool.name, tool.func);
      }
    }

    // Create predictors
    this.codeActPredictor = new Predictor(this.createCodeActSignature(config.customInstruction));
    this.extractPredictor = new ChainOfThought(this.createExtractSignature());

    // Add parameters
    this.addParameter('signature', this.signature, false);
    this.addParameter('tools', Array.from(this.tools.values()), false);
    this.addParameter('maxIters', this.maxIters, true);
    this.addParameter('executor', this.executor, false);
  }

  /**
   * Forward pass - execute CodeAct loop
   * 
   * @param inputs - Input arguments for the task
   * @returns CodeAct result with trajectory and code
   */
  async forward(inputs: Record<string, any>): Promise<CodeActResult> {
    const trajectory: Record<string, any> = {};
    const generatedCode: string[] = [];
    const codeOutputs: string[] = [];
    const maxIters = inputs.maxIters || this.maxIters;
    let finished = false;

    if (this.verbose) {
      console.log('💻 CodeAct: Starting code generation and execution loop');
      console.log(`🔧 Available tools: ${Array.from(this.tools.keys()).join(', ')}`);
    }

    // Main CodeAct loop
    for (let idx = 0; idx < maxIters; idx++) {
      try {
        if (this.verbose) {
          console.log(`🔄 CodeAct iteration ${idx + 1}/${maxIters}`);
        }

        // Generate code
        const codeData = await this.callWithTrajectoryTruncation(
          this.codeActPredictor,
          trajectory,
          inputs
        );

        if (!codeData) {
          console.warn('⚠️ CodeAct: Failed to generate code, ending execution');
          break;
        }

        // Extract code and finished flag
        const code = codeData.generated_code || '';
        const isFinished = codeData.finished || false;

        if (this.verbose) {
          console.log(`📝 Generated code (${code.length} chars)`);
          console.log(`🏁 Finished flag: ${isFinished}`);
        }

        // Parse code
        const { parsedCode, error: parseError } = this.parseCode(code);

        if (parseError) {
          trajectory[`observation_${idx}`] = `Failed to parse the generated code: ${parseError}`;
          if (this.verbose) {
            console.warn(`❌ Code parsing failed: ${parseError}`);
          }
          continue;
        }

        // Store generated code
        trajectory[`generated_code_${idx}`] = parsedCode;
        generatedCode.push(parsedCode);

        // Execute code
        const { output, error: execError } = await this.executeCode(parsedCode);

        if (!execError) {
          trajectory[`code_output_${idx}`] = output;
          codeOutputs.push(output);
          
          if (this.verbose) {
            console.log(`✅ Code executed successfully`);
            console.log(`📤 Output: ${output.slice(0, 100)}${output.length > 100 ? '...' : ''}`);
          }
        } else {
          trajectory[`observation_${idx}`] = `Failed to execute the generated code: ${execError}`;
          
          if (this.verbose) {
            console.warn(`❌ Code execution failed: ${execError}`);
          }
        }

        // Check if finished
        if (isFinished) {
          finished = true;
          if (this.verbose) {
            console.log('🎯 CodeAct: Task marked as finished');
          }
          break;
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        trajectory[`observation_${idx}`] = `CodeAct iteration error: ${errorMsg}`;
        
        if (this.verbose) {
          console.warn(`❌ CodeAct iteration ${idx + 1} failed: ${errorMsg}`);
        }
      }
    }

    // Extract final answer from trajectory
    const extractResult = await this.callWithTrajectoryTruncation(
      this.extractPredictor,
      trajectory,
      inputs
    );

    if (this.verbose) {
      console.log('🎯 CodeAct: Extracting final answer from trajectory');
    }

    // Shutdown executor
    this.executor.shutdown();

    // Return combined result
    return {
      ...extractResult,
      trajectory,
      generatedCode,
      codeOutputs,
      finished
    } as CodeActResult;
  }

  /**
   * Synchronous forward pass (not supported)
   */
  forwardSync(inputs: Record<string, any>): CodeActResult {
    throw new Error('Synchronous CodeAct execution not supported due to async code execution');
  }

  /**
   * Parse generated code from prediction
   */
  private parseCode(codeData: any): { parsedCode: string; error?: string } {
    try {
      let code = '';
      
      if (typeof codeData === 'string') {
        code = codeData;
      } else if (codeData && typeof codeData.generated_code === 'string') {
        code = codeData.generated_code;
      } else {
        return { parsedCode: '', error: 'No code found in prediction' };
      }

      // Extract code from markdown fenced blocks
      const fencedMatch = code.match(/```(?:javascript|js|python|py)?\n([\s\S]*?)\n```/);
      if (fencedMatch) {
        code = fencedMatch[1];
      }

      // Basic validation
      if (!code.trim()) {
        return { parsedCode: '', error: 'Empty code block' };
      }

      return { parsedCode: code.trim() };

    } catch (error) {
      return { 
        parsedCode: '', 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  /**
   * Execute code using the configured executor
   */
  private async executeCode(code: string): Promise<{ output: string; error?: string }> {
    try {
      return await this.executor.execute(code);
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Call predictor with trajectory truncation on context window exceeded
   */
  private async callWithTrajectoryTruncation(
    predictor: Predictor | ChainOfThought,
    trajectory: Record<string, any>,
    inputs: Record<string, any>,
    maxRetries: number = 3
  ): Promise<PredictionResult | null> {
    let currentTrajectory = { ...trajectory };

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const formattedTrajectory = this.formatTrajectory(currentTrajectory);
        
        return await predictor.aforward({
          ...inputs,
          trajectory: formattedTrajectory
        });

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        
        // Check if context window exceeded
        if (errorMsg.toLowerCase().includes('context') && 
            errorMsg.toLowerCase().includes('window')) {
          
          if (this.verbose) {
            console.warn('⚠️ CodeAct: Context window exceeded, truncating trajectory');
          }

          currentTrajectory = this.truncateTrajectory(currentTrajectory);
          
          if (Object.keys(currentTrajectory).length === 0) {
            console.error('❌ CodeAct: Cannot truncate trajectory further');
            return null;
          }
        } else {
          throw error;
        }
      }
    }

    console.error('❌ CodeAct: Failed after maximum retry attempts');
    return null;
  }

  /**
   * Format trajectory for display
   */
  private formatTrajectory(trajectory: Record<string, any>): string {
    const parts: string[] = [];
    const keys = Object.keys(trajectory).sort();

    let currentStep = 0;
    while (true) {
      const codeKey = `generated_code_${currentStep}`;
      const outputKey = `code_output_${currentStep}`;
      const obsKey = `observation_${currentStep}`;

      if (!trajectory[codeKey] && !trajectory[obsKey]) break;

      parts.push(`Step ${currentStep + 1}:`);
      
      if (trajectory[codeKey]) {
        parts.push(`Code:\n${trajectory[codeKey]}`);
      }
      
      if (trajectory[outputKey]) {
        parts.push(`Output: ${trajectory[outputKey]}`);
      }
      
      if (trajectory[obsKey]) {
        parts.push(`Observation: ${trajectory[obsKey]}`);
      }
      
      parts.push('');
      currentStep++;
    }

    return parts.join('\n');
  }

  /**
   * Truncate trajectory to fit context window
   */
  private truncateTrajectory(trajectory: Record<string, any>): Record<string, any> {
    const keys = Object.keys(trajectory);
    
    if (keys.length < 3) {
      // Can't truncate if less than one complete code execution
      return {};
    }

    // Remove the oldest code execution (first 3 keys)
    const truncated = { ...trajectory };
    const keysToRemove = keys.slice(0, 3);
    
    for (const key of keysToRemove) {
      delete truncated[key];
    }

    return truncated;
  }

  /**
   * Process and normalize tools
   */
  private processTools(tools: (Tool | Function)[]): Map<string, Tool> {
    const toolMap = new Map<string, Tool>();

    for (const tool of tools) {
      let normalizedTool: Tool;

      if (typeof tool === 'function') {
        // Convert function to Tool interface
        normalizedTool = {
          name: tool.name || 'unnamed_tool',
          description: `Tool function: ${tool.name}`,
          func: tool,
          args: {}
        };
      } else {
        // Already a Tool interface
        normalizedTool = tool;
      }

      // Validate that it's a function (CodeAct requirement)
      if (typeof normalizedTool.func !== 'function') {
        throw new Error(`CodeAct only accepts functions, not callable objects. Tool: ${normalizedTool.name}`);
      }

      toolMap.set(normalizedTool.name, normalizedTool);
    }

    return toolMap;
  }

  /**
   * Create signature for CodeAct predictor
   */
  private createCodeActSignature(customInstruction?: string): Signature {
    const inputs = Object.keys(this.signature.inputs).map(k => `\`${k}\``).join(', ');
    const outputs = Object.keys(this.signature.outputs).map(k => `\`${k}\``).join(', ');
    
    let instruction = customInstruction;
    
    if (!instruction) {
      const baseInstruction = this.signature.instruction ? `${this.signature.instruction}\n\n` : '';
      
      instruction = baseInstruction +
        `You are an intelligent agent. For each episode, you will receive the fields ${inputs} as input.\n` +
        `Your goal is to generate executable JavaScript code that collects any necessary information for producing ${outputs}.\n` +
        `For each iteration, you will generate a code snippet that either solves the task or progresses towards the solution.\n` +
        `Ensure any output you wish to extract from the code is printed to the console. The code should be enclosed in a fenced code block.\n` +
        `When all information for producing the outputs (${outputs}) are available to be extracted, mark \`finished=true\` besides the final JavaScript code.\n` +
        `You have access to the JavaScript Standard Library and the following functions:\n\n` +
        this.getToolsDescription();
    }

    return {
      inputs: {
        ...this.signature.inputs,
        trajectory: 'string'
      },
      outputs: {
        generated_code: 'string',
        finished: 'boolean'
      },
      instruction
    };
  }

  /**
   * Create signature for extraction predictor
   */
  private createExtractSignature(): Signature {
    return {
      inputs: {
        ...this.signature.inputs,
        ...this.signature.outputs,
        trajectory: 'string'
      },
      outputs: this.signature.outputs,
      instruction: this.signature.instruction || 'Extract the final answer from the code execution trajectory.'
    };
  }

  /**
   * Get formatted description of all tools
   */
  private getToolsDescription(): string {
    const descriptions: string[] = [];
    let index = 1;

    for (const tool of this.tools.values()) {
      descriptions.push(`(${index}) ${tool.name}: ${tool.description}`);
      index++;
    }

    return descriptions.join('\n');
  }

  /**
   * Ensure signature is properly formatted
   */
  private ensureSignature(signature: Signature | EnhancedSignature): Signature {
    if (this.isEnhancedSignature(signature)) {
      const basicInputs: Record<string, string> = {};
      const basicOutputs: Record<string, string> = {};

      for (const [key, spec] of Object.entries(signature.inputs)) {
        basicInputs[key] = spec.type;
      }

      for (const [key, spec] of Object.entries(signature.outputs)) {
        basicOutputs[key] = spec.type;
      }

      return {
        inputs: basicInputs,
        outputs: basicOutputs,
        instruction: signature.instruction,
        format: signature.format
      };
    }

    return signature as Signature;
  }

  /**
   * Check if signature is enhanced
   */
  private isEnhancedSignature(signature: any): signature is EnhancedSignature {
    return signature && 
           typeof signature === 'object' &&
           signature.inputs &&
           signature.outputs &&
           Object.values(signature.inputs).some((field: any) => 
             typeof field === 'object' && 'type' in field
           );
  }

  /**
   * Update maximum iterations
   */
  updateMaxIters(newMaxIters: number): void {
    this.maxIters = newMaxIters;
    this.updateParameter('maxIters', this.maxIters);
  }

  /**
   * Add a new tool
   */
  addTool(tool: Tool | Function): void {
    const normalizedTool = typeof tool === 'function' ? {
      name: tool.name || 'unnamed_tool',
      description: `Tool function: ${tool.name}`,
      func: tool,
      args: {}
    } : tool;

    this.tools.set(normalizedTool.name, normalizedTool);
    this.executor.defineFunction(normalizedTool.name, normalizedTool.func);
    this.updateParameter('tools', Array.from(this.tools.values()));
    
    // Recreate predictor with updated tools
    this.codeActPredictor = new Predictor(this.createCodeActSignature());
  }

  /**
   * Remove a tool
   */
  removeTool(toolName: string): boolean {
    const removed = this.tools.delete(toolName);
    if (removed) {
      this.updateParameter('tools', Array.from(this.tools.values()));
      this.codeActPredictor = new Predictor(this.createCodeActSignature());
    }
    return removed;
  }

  /**
   * Get available tools
   */
  getTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Create deep copy
   */
  deepcopy(): CodeAct {
    const copy = new CodeAct(this.signature, Array.from(this.tools.values()), {
      maxIters: this.maxIters,
      verbose: this.verbose
    });
    
    if (this._lm) {
      copy.set_lm(this._lm);
    }
    
    return copy;
  }
}

/**
 * Factory function to create CodeAct module
 */
export function createCodeAct(
  signature: Signature | EnhancedSignature,
  tools: (Tool | Function)[],
  config: CodeActConfig = {}
): CodeAct {
  return new CodeAct(signature, tools, config);
}

/**
 * Default export
 */
export default CodeAct;