/**
 * @fileoverview ReAct (Reasoning and Acting) DSPy Module
 * 
 * Implementation of the ReAct paradigm for building tool-using agents that can
 * reason about situations and act by calling tools to gather information.
 * Based on Stanford DSPy's ReAct implementation.
 * 
 * Key Features:
 * - Iterative reasoning and acting loop
 * - Tool integration with automatic finish detection
 * - Trajectory management and context window handling
 * - Async/sync execution support
 * - Configurable maximum iterations
 * - Error handling and recovery
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

/**
 * Tool interface for ReAct
 */
export interface Tool {
  /** Tool name/identifier */
  name: string;
  /** Tool description */
  description: string;
  /** Tool function */
  func: (...args: any[]) => any | Promise<any>;
  /** Async version of tool function */
  acall?: (...args: any[]) => Promise<any>;
  /** Tool argument schema */
  args: Record<string, any>;
  /** Tool metadata */
  metadata?: Record<string, any>;
}

/**
 * Configuration for ReAct module
 */
export interface ReActConfig {
  /** Maximum number of iterations (default: 10) */
  maxIters?: number;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Custom instruction override */
  customInstruction?: string;
}

/**
 * Trajectory entry for tracking reasoning and actions
 */
export interface TrajectoryEntry {
  thought: string;
  toolName: string;
  toolArgs: Record<string, any>;
  observation: string;
}

/**
 * ReAct prediction result with trajectory
 */
export interface ReActResult extends PredictionResult {
  /** Full trajectory of thoughts, actions, and observations */
  trajectory: Record<string, any>;
}

/**
 * Tool execution error
 */
export class ToolExecutionError extends Error {
  constructor(
    public toolName: string,
    public args: Record<string, any>,
    public originalError: Error
  ) {
    super(`Execution error in ${toolName}: ${originalError.message}`);
    this.name = 'ToolExecutionError';
  }
}

/**
 * ReAct Module - Reasoning and Acting
 * 
 * Implements the ReAct paradigm where an agent iteratively:
 * 1. Observes the current situation
 * 2. Reasons about what to do next (thought)
 * 3. Selects and executes a tool (action)
 * 4. Observes the result (observation)
 * 5. Repeats until task completion
 * 
 * Algorithm:
 * 1. Initialize with signature and available tools
 * 2. For each iteration:
 *    - Generate next thought based on current state
 *    - Select tool and arguments
 *    - Execute tool and capture observation
 *    - Update trajectory
 * 3. Extract final answer from trajectory
 * 
 * @example
 * ```typescript
 * const getWeather = {
 *   name: 'get_weather',
 *   description: 'Get weather information for a city',
 *   func: async (city: string) => `Weather in ${city}: sunny, 22°C`,
 *   args: { city: 'string' }
 * };
 * 
 * const react = new ReAct({
 *   inputs: { question: 'string' },
 *   outputs: { answer: 'string' }
 * }, [getWeather], { maxIters: 5 });
 * 
 * const result = await react.forward({ question: "What's the weather in Tokyo?" });
 * console.log(result.answer); // Final answer
 * console.log(result.trajectory); // Full reasoning trace
 * ```
 */
export class ReAct extends BaseModule {
  private signature: Signature;
  private tools: Map<string, Tool>;
  private maxIters: number;
  private verbose: boolean;
  private reactPredictor: Predictor;
  private extractPredictor: ChainOfThought;

  /**
   * Initialize ReAct module
   * 
   * @param signature - Input/output signature defining the task
   * @param tools - Available tools for the agent
   * @param config - Configuration options
   */
  constructor(
    signature: Signature | EnhancedSignature,
    tools: (Tool | Function)[],
    config: ReActConfig = {}
  ) {
    super();

    this.signature = this.ensureSignature(signature);
    this.maxIters = config.maxIters || 10;
    this.verbose = config.verbose || false;

    // Process and normalize tools
    this.tools = this.processTools(tools);
    
    // Add special "finish" tool
    this.addFinishTool();

    // Create predictors
    this.reactPredictor = new Predictor(this.createReactSignature(config.customInstruction));
    this.extractPredictor = new ChainOfThought(this.createExtractSignature());

    // Add parameters
    this.addParameter('signature', this.signature, false);
    this.addParameter('tools', Array.from(this.tools.values()), false);
    this.addParameter('maxIters', this.maxIters, true);
    this.addParameter('reactPredictor', this.reactPredictor, false);
    this.addParameter('extractPredictor', this.extractPredictor, false);
  }

  /**
   * Forward pass - execute ReAct reasoning loop
   * 
   * @param inputs - Input arguments for the task
   * @returns ReAct result with trajectory
   */
  async forward(inputs: Record<string, any>): Promise<ReActResult> {
    const trajectory: Record<string, any> = {};
    const maxIters = inputs.maxIters || this.maxIters;

    if (this.verbose) {
      console.log('🤖 ReAct: Starting reasoning and acting loop');
      console.log(`📋 Available tools: ${Array.from(this.tools.keys()).join(', ')}`);
    }

    // Main ReAct loop
    for (let idx = 0; idx < maxIters; idx++) {
      try {
        // Generate next thought, tool, and arguments
        const prediction = await this.callWithTrajectoryTruncation(
          this.reactPredictor,
          trajectory,
          inputs
        );

        if (!prediction) {
          console.warn('⚠️ ReAct: Failed to get prediction, ending trajectory');
          break;
        }

        // Extract prediction components
        const thought = prediction.next_thought || prediction.thought || '';
        const toolName = prediction.next_tool_name || prediction.tool_name || '';
        const toolArgs = prediction.next_tool_args || prediction.tool_args || {};

        // Update trajectory
        trajectory[`thought_${idx}`] = thought;
        trajectory[`tool_name_${idx}`] = toolName;
        trajectory[`tool_args_${idx}`] = toolArgs;

        if (this.verbose) {
          console.log(`💭 Thought ${idx}: ${thought}`);
          console.log(`🔧 Tool ${idx}: ${toolName}(${JSON.stringify(toolArgs)})`);
        }

        // Execute tool
        try {
          const tool = this.tools.get(toolName);
          if (!tool) {
            throw new Error(`Unknown tool: ${toolName}`);
          }

          const observation = await this.executeTool(tool, toolArgs);
          trajectory[`observation_${idx}`] = observation;

          if (this.verbose) {
            console.log(`👀 Observation ${idx}: ${observation}`);
          }

          // Check if finished
          if (toolName === 'finish') {
            if (this.verbose) {
              console.log('✅ ReAct: Task completed');
            }
            break;
          }

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          trajectory[`observation_${idx}`] = `Execution error in ${toolName}: ${errorMsg}`;
          
          if (this.verbose) {
            console.warn(`❌ Tool execution error: ${errorMsg}`);
          }
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️ ReAct: Agent failed to select valid tool: ${errorMsg}`);
        break;
      }
    }

    // Extract final answer from trajectory
    const extractResult = await this.callWithTrajectoryTruncation(
      this.extractPredictor,
      trajectory,
      inputs
    );

    if (this.verbose) {
      console.log('🎯 ReAct: Extracting final answer from trajectory');
    }

    // Return combined result
    return {
      ...extractResult,
      trajectory
    } as ReActResult;
  }

  /**
   * Synchronous forward pass
   */
  forwardSync(inputs: Record<string, any>): ReActResult {
    // Note: This is a simplified sync version
    // In practice, tool execution is often async
    throw new Error('Synchronous ReAct execution not supported due to tool async nature');
  }

  /**
   * Execute a tool with error handling
   */
  private async executeTool(tool: Tool, args: Record<string, any>): Promise<string> {
    try {
      let result;
      
      if (tool.acall) {
        // Use async version if available
        result = await tool.acall(args);
      } else if (typeof tool.func === 'function') {
        // Execute function (may be async)
        result = await Promise.resolve(tool.func(args));
      } else {
        throw new Error(`Tool ${tool.name} has no executable function`);
      }

      // Convert result to string
      return typeof result === 'string' ? result : JSON.stringify(result);

    } catch (error) {
      throw new ToolExecutionError(
        tool.name,
        args,
        error instanceof Error ? error : new Error(String(error))
      );
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
            console.warn('⚠️ ReAct: Context window exceeded, truncating trajectory');
          }

          currentTrajectory = this.truncateTrajectory(currentTrajectory);
          
          if (Object.keys(currentTrajectory).length === 0) {
            console.error('❌ ReAct: Cannot truncate trajectory further');
            return null;
          }
        } else {
          throw error;
        }
      }
    }

    console.error('❌ ReAct: Failed after maximum retry attempts');
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
      const thoughtKey = `thought_${currentStep}`;
      const toolKey = `tool_name_${currentStep}`;
      const argsKey = `tool_args_${currentStep}`;
      const obsKey = `observation_${currentStep}`;

      if (!trajectory[thoughtKey]) break;

      parts.push(`Step ${currentStep + 1}:`);
      parts.push(`Thought: ${trajectory[thoughtKey]}`);
      parts.push(`Action: ${trajectory[toolKey]}(${JSON.stringify(trajectory[argsKey] || {})})`);
      parts.push(`Observation: ${trajectory[obsKey] || 'Pending...'}`);
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
    
    if (keys.length < 4) {
      // Can't truncate if less than one complete tool call
      return {};
    }

    // Remove the oldest tool call (first 4 keys)
    const truncated = { ...trajectory };
    const keysToRemove = keys.slice(0, 4);
    
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

      toolMap.set(normalizedTool.name, normalizedTool);
    }

    return toolMap;
  }

  /**
   * Add the special "finish" tool
   */
  private addFinishTool(): void {
    const outputs = Object.keys(this.signature.outputs).map(k => `\`${k}\``).join(', ');
    
    this.tools.set('finish', {
      name: 'finish',
      description: `Marks the task as complete. Signals that all information for producing the outputs (${outputs}) is now available.`,
      func: () => 'Completed.',
      args: {}
    });
  }

  /**
   * Create signature for ReAct predictor
   */
  private createReactSignature(customInstruction?: string): Signature {
    const inputs = Object.keys(this.signature.inputs).map(k => `\`${k}\``).join(', ');
    const outputs = Object.keys(this.signature.outputs).map(k => `\`${k}\``).join(', ');
    
    let instruction = customInstruction;
    
    if (!instruction) {
      const baseInstruction = this.signature.instruction ? `${this.signature.instruction}\n\n` : '';
      
      instruction = baseInstruction +
        `You are an Agent. In each episode, you will be given the fields ${inputs} as input. ` +
        `You can see your past trajectory so far.\n\n` +
        `Your goal is to use one or more of the supplied tools to collect any necessary information for producing ${outputs}.\n\n` +
        `To do this, you will interleave next_thought, next_tool_name, and next_tool_args in each turn, ` +
        `and also when finishing the task.\n` +
        `After each tool call, you receive a resulting observation, which gets appended to your trajectory.\n\n` +
        `When writing next_thought, you may reason about the current situation and plan for future steps.\n` +
        `When selecting the next_tool_name and its next_tool_args, the tool must be one of:\n\n` +
        this.getToolsDescription() +
        `\nWhen providing \`next_tool_args\`, the value inside the field must be in JSON format.`;
    }

    return {
      inputs: {
        ...this.signature.inputs,
        trajectory: 'string'
      },
      outputs: {
        next_thought: 'string',
        next_tool_name: 'string',
        next_tool_args: 'object'
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
      instruction: this.signature.instruction || 'Extract the final answer from the trajectory.'
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
  addTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
    this.updateParameter('tools', Array.from(this.tools.values()));
    
    // Recreate react predictor with updated tools
    this.reactPredictor = new Predictor(this.createReactSignature());
  }

  /**
   * Remove a tool
   */
  removeTool(toolName: string): boolean {
    if (toolName === 'finish') {
      throw new Error('Cannot remove the special "finish" tool');
    }

    const removed = this.tools.delete(toolName);
    if (removed) {
      this.updateParameter('tools', Array.from(this.tools.values()));
      this.reactPredictor = new Predictor(this.createReactSignature());
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
  deepcopy(): ReAct {
    const copy = new ReAct(this.signature, Array.from(this.tools.values()), {
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
 * Factory function to create ReAct module
 */
export function createReAct(
  signature: Signature | EnhancedSignature,
  tools: (Tool | Function)[],
  config: ReActConfig = {}
): ReAct {
  return new ReAct(signature, tools, config);
}

/**
 * Default export
 */
export default ReAct;