/**
 * Enhanced Task Tool with Claude Code Sub-Agent Integration
 * Extends the existing Task tool to leverage Claude Code's sub-agent system
 */

import type { AgentType } from '../types/agent-types.js';
import { generateSubAgentConfig, mapToClaudeSubAgent } from './sub-agent-generator.js';

export interface EnhancedTaskConfig {
  description: string;
  prompt: string;
  subagent_type: AgentType;
  use_claude_subagent?: boolean;
  domain_context?: string;
  expected_output?: string;
  tools_required?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dependencies?: string[];
  timeout_minutes?: number;
}

export interface TaskResult {
  success: boolean;
  output?: string;
  agent_used: string;
  execution_time_ms: number;
  tools_used: string[];
  error?: string;
}

/**
 * Enhanced Task execution with Claude Code sub-agent integration
 */
export class EnhancedTaskTool {
  private static instance: EnhancedTaskTool;
  private taskHistory: Map<string, TaskResult> = new Map();
  private activeSubAgents: Set<string> = new Set();

  static getInstance(): EnhancedTaskTool {
    if (!EnhancedTaskTool.instance) {
      EnhancedTaskTool.instance = new EnhancedTaskTool();
    }
    return EnhancedTaskTool.instance;
  }

  /**
   * Execute task with optimal agent selection
   */
  async executeTask(config: EnhancedTaskConfig): Promise<TaskResult> {
    const startTime = Date.now();
    const taskId = this.generateTaskId(config);

    try {
      // Determine optimal agent strategy
      const agentStrategy = this.selectAgentStrategy(config);

      // Prepare task execution context
      const executionContext = this.prepareExecutionContext(config, agentStrategy);

      // Execute with appropriate agent
      const result = await this.executeWithAgent(executionContext);

      // Record results
      const taskResult: TaskResult = {
        success: true,
        output: result.output,
        agent_used: agentStrategy.agent_name,
        execution_time_ms: Date.now() - startTime,
        tools_used: agentStrategy.tools,
      };

      this.taskHistory.set(taskId, taskResult);
      return taskResult;
    } catch (error) {
      const taskResult: TaskResult = {
        success: false,
        agent_used: config.subagent_type,
        execution_time_ms: Date.now() - startTime,
        tools_used: [],
        error: error instanceof Error ? error.message : String(error),
      };

      this.taskHistory.set(taskId, taskResult);
      return taskResult;
    }
  }

  /**
   * Select optimal agent strategy based on task requirements
   */
  private selectAgentStrategy(config: EnhancedTaskConfig): AgentStrategy {
    const claudeSubAgent = mapToClaudeSubAgent(config.subagent_type);
    const subAgentConfig = generateSubAgentConfig(config.subagent_type);

    // Determine if Claude Code sub-agent should be used
    const useClaudeSubAgent =
      config.use_claude_subagent !== false && this.isClaudeSubAgentOptimal(config);

    return {
      agent_type: config.subagent_type,
      agent_name: useClaudeSubAgent ? claudeSubAgent : config.subagent_type,
      use_claude_subagent: useClaudeSubAgent,
      tools: config.tools_required || subAgentConfig.tools,
      capabilities: subAgentConfig.capabilities,
      system_prompt: subAgentConfig.systemPrompt,
    };
  }

  /**
   * Determine if Claude Code sub-agent is optimal for this task
   */
  private isClaudeSubAgentOptimal(config: EnhancedTaskConfig): boolean {
    // High-priority tasks benefit from specialized sub-agents
    if (config.priority === 'high' || config.priority === 'critical') {
      return true;
    }

    // Complex tasks with multiple dependencies
    if (config.dependencies && config.dependencies.length > 2) {
      return true;
    }

    // Domain-specific tasks that benefit from specialization
    const specializedDomains = [
      'code-review-swarm',
      'debug',
      'ai-ml-specialist',
      'database-architect',
      'system-architect',
      'security-analyzer',
    ];

    return specializedDomains.includes(config.subagent_type);
  }

  /**
   * Prepare execution context for agent
   */
  private prepareExecutionContext(
    config: EnhancedTaskConfig,
    strategy: AgentStrategy
  ): ExecutionContext {
    let enhancedPrompt = config.prompt;

    // Add domain context if provided
    if (config.domain_context) {
      enhancedPrompt += `
      \n**Domain Context**: ${config.domain_context}`;
    }

    // Add expected output format if specified
    if (config.expected_output) {
      enhancedPrompt += `
      \n**Expected Output**: ${config.expected_output}`;
    }

    // Add Claude Code sub-agent instructions if using sub-agent
    if (strategy.use_claude_subagent) {
      enhancedPrompt += `
      \n**Specialized Focus**: ${strategy.system_prompt}`;
    }

    return {
      task_id: this.generateTaskId(config),
      description: config.description,
      prompt: enhancedPrompt,
      agent_strategy: strategy,
      timeout_ms: (config.timeout_minutes || 10) * 60 * 1000,
      priority: config.priority || 'medium',
    };
  }

  /**
   * Execute task with selected agent
   */
  private async executeWithAgent(context: ExecutionContext): Promise<{ output: string }> {
    // Track active sub-agent
    this.activeSubAgents.add(context.agent_strategy.agent_name);

    try {
      // Simulate task execution (in real implementation, this would call the actual Task tool)
      console.log(`Executing task with ${context.agent_strategy.agent_name}`);
      console.log(`Task: ${context.description}`);
      console.log(`Using Claude Sub-Agent: ${context.agent_strategy.use_claude_subagent}`);

      // This would be replaced with actual Task tool call
      const output = `Task completed by ${context.agent_strategy.agent_name}: ${context.description}`;

      return { output };
    } finally {
      this.activeSubAgents.delete(context.agent_strategy.agent_name);
    }
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(config: EnhancedTaskConfig): string {
    const timestamp = Date.now();
    const hash = this.simpleHash(config.description + config.subagent_type);
    return `task_${timestamp}_${hash}`;
  }

  /**
   * Simple hash function for task IDs
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Get task execution history
   */
  getTaskHistory(): Map<string, TaskResult> {
    return new Map(this.taskHistory);
  }

  /**
   * Get currently active sub-agents
   */
  getActiveSubAgents(): string[] {
    return Array.from(this.activeSubAgents);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): TaskPerformanceMetrics {
    const tasks = Array.from(this.taskHistory.values());
    const successful = tasks.filter((t) => t.success);
    const failed = tasks.filter((t) => !t.success);

    return {
      total_tasks: tasks.length,
      successful_tasks: successful.length,
      failed_tasks: failed.length,
      success_rate: tasks.length > 0 ? successful.length / tasks.length : 0,
      average_execution_time_ms:
        successful.length > 0
          ? successful.reduce((sum, t) => sum + t.execution_time_ms, 0) / successful.length
          : 0,
      most_used_agents: this.getMostUsedAgents(tasks),
      tools_usage: this.getToolsUsage(tasks),
    };
  }

  private getMostUsedAgents(tasks: TaskResult[]): Record<string, number> {
    const agentCounts: Record<string, number> = {};
    tasks.forEach((task) => {
      agentCounts[task.agent_used] = (agentCounts[task.agent_used] || 0) + 1;
    });
    return agentCounts;
  }

  private getToolsUsage(tasks: TaskResult[]): Record<string, number> {
    const toolCounts: Record<string, number> = {};
    tasks.forEach((task) => {
      task.tools_used.forEach((tool) => {
        toolCounts[tool] = (toolCounts[tool] || 0) + 1;
      });
    });
    return toolCounts;
  }
}

// Supporting interfaces
interface AgentStrategy {
  agent_type: AgentType;
  agent_name: string;
  use_claude_subagent: boolean;
  tools: string[];
  capabilities: Record<string, boolean>;
  system_prompt: string;
}

interface ExecutionContext {
  task_id: string;
  description: string;
  prompt: string;
  agent_strategy: AgentStrategy;
  timeout_ms: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface TaskPerformanceMetrics {
  total_tasks: number;
  successful_tasks: number;
  failed_tasks: number;
  success_rate: number;
  average_execution_time_ms: number;
  most_used_agents: Record<string, number>;
  tools_usage: Record<string, number>;
}

/**
 * Convenience function for quick task execution
 */
export async function executeEnhancedTask(config: EnhancedTaskConfig): Promise<TaskResult> {
  const taskTool = EnhancedTaskTool.getInstance();
  return await taskTool.executeTask(config);
}

/**
 * Batch task execution with parallel processing
 */
export async function executeBatchTasks(configs: EnhancedTaskConfig[]): Promise<TaskResult[]> {
  const taskTool = EnhancedTaskTool.getInstance();

  // Execute tasks in parallel for better performance
  const promises = configs.map((config) => taskTool.executeTask(config));

  return await Promise.all(promises);
}

export default EnhancedTaskTool;
