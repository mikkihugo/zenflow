/**
 * @file Task coordination system.
 */

import type { DatabaseSPARCBridge } from '@claude-zen/enterprise');

import {
  generateSubAgentConfig,
  mapToClaudeSubAgent,
} from "./sub-agent-generator";
import type { AgentType } from './types/agent-types');

// Note: SPARC coordination is now handled via enterprise strategic facade

export interface TaskConfig {
  description: string;
  prompt: string;
  subagent_type: AgentType;
  use_claude_subagent?: boolean;
  use_sparc_methodology?: boolean; // NEW: Enable SPARC processing
  domain_context?: string;
  expected_output?: string;
  tools_required?: string[];
  priority?: 'low | medium' | 'high | critical');
  dependencies?: string[];
  timeout_minutes?: number;
  // NEW: Database document reference
  source_document?: any | any;
}

export interface TaskResult {
  success: boolean;
  output?: string;
  agent_used: string;
  execution_time_ms: number;
  tools_used: string[];
  sparc_task_id?: string; // NEW: Reference to SPARC task if methodology was used
  implementation_artifacts?: string[]; // NEW: Generated artifacts
  methodology_applied?: 'direct | sparc'); // NEW: Track methodology used
  error?: string;
}

/**
 * SPARC-Enhanced Task Coordinator.
 *
 * @example
 */
export class TaskCoordinator {
  private static instance: TaskCoordinator;
  private taskHistory: Map<string, TaskResult> = new Map();
  private activeSubAgents: Set<string> = new Set();
  private sparcBridge?: DatabaseSPARCBridge; // NEW: SPARC integration
  private sparcSwarm?: SPARCSwarmCoordinator; // NEW: SPARC swarm

  static getInstance(): TaskCoordinator {
    if (!TaskCoordinator.instance) {
      TaskCoordinator.instance = new TaskCoordinator();
    }
    return TaskCoordinator.instance;
  }

  /**
   * Initialize with SPARC integration.
   *
   * @param sparcBridge
   * @param sparcSwarm
   */
  async initializeSPARCIntegration(
    sparcBridge: DatabaseSPARCBridge,
    sparcSwarm: SPARCSwarmCoordinator
  ): Promise<void> {
    this.sparcBridge = sparcBridge;
    this.sparcSwarm = sparcSwarm;
  }

  /**
   * Execute task with optimal agent selection and methodology.
   *
   * @param config
   */
  async executeTask(config: TaskConfig): Promise<TaskResult> {
    const startTime = Date.now();
    const taskId = this.generateTaskId(config);

    try {
      // NEW: Check if SPARC methodology should be used
      if (config?.use_sparc_methodology && this.shouldUseSPARC(config)) {
        return await this.executeWithSPARC(config, startTime, taskId);
      }

      // Original direct execution path
      return await this.executeDirectly(config, startTime, taskId);
    } catch (error) {
      const taskResult: TaskResult = {
        success: false,
        agent_used: config?.subagent_type,
        execution_time_ms: Date.now() - startTime,
        tools_used: [],
        methodology_applied: 'direct',
        error: error instanceof Error ? error.message : String(error),
      };

      this.taskHistory.set(taskId, taskResult);
      return taskResult;
    }
  }

  /**
   * NEW: Execute task using SPARC methodology.
   *
   * @param config
   * @param startTime
   * @param _startTime
   * @param taskId
   */
  private async executeWithSPARC(
    config: TaskConfig,
    _startTime: number,
    taskId: string
  ): Promise<TaskResult> {
    if (!(this.sparcBridge && this.sparcSwarm)) {
      throw new Error('SPARC integration not initialized');
    }

    // Convert TaskConfig to database document if needed
    let assignmentId: string;

    if (config?.source_document) {
      // Use existing document
      assignmentId = await (config?.source_document?.type === 'feature'
        ? this.sparcBridge.assignFeatureToSparcs(config?.source_document)
        : this.sparcBridge.assignTaskToSparcs(config?.source_document));
    } else {
      // Create temporary task document for SPARC processing
      const tempTask = this.createTempTaskDocument(config);
      assignmentId = await this.sparcBridge.assignTaskToSparcs(tempTask);
    }

    // Wait for SPARC completion (simplified - in real implementation would use events)
    const result = await this.waitForSPARCCompletion(assignmentId);

    const taskResult: TaskResult = {
      success: result?.status === 'completed',
      output: result?.completionReport,
      agent_used: 'sparc-swarm',
      execution_time_ms: result?.metrics?.totalTimeMs,
      tools_used: ['sparc-methodology'],
      sparc_task_id: result?.sparcTaskId,
      implementation_artifacts: Object.values()(result?.artifacts)
        ?.flat as string[],
      methodology_applied: 'sparc',
    };

    this.taskHistory.set(taskId, taskResult);
    return taskResult;
  }

  /**
   * Execute task directly (original logic).
   *
   * @param config
   * @param startTime
   * @param taskId
   */
  private async executeDirectly(
    config: TaskConfig,
    startTime: number,
    taskId: string
  ): Promise<TaskResult> {
    // Determine optimal agent strategy
    const agentStrategy = this.selectAgentStrategy(config);

    // Prepare task execution context
    const executionContext = this.prepareExecutionContext(
      config,
      agentStrategy
    );

    // Execute with appropriate agent
    const result = await this.executeWithAgent(executionContext);

    // Record results
    const taskResult: TaskResult = {
      success: true,
      output: result?.output,
      agent_used: agentStrategy.agent_name,
      execution_time_ms: Date.now() - startTime,
      tools_used: agentStrategy.tools,
      methodology_applied: 'direct',
    };

    this.taskHistory.set(taskId, taskResult);
    return taskResult;
  }

  /**
   * NEW: Determine if SPARC methodology should be used.
   *
   * @param config
   */
  private shouldUseSPARC(config: TaskConfig): boolean {
    // Use SPARC for complex, high-priority tasks or when explicitly requested
    return (
      // Long descriptions indicate complexity
      config.use_sparc_methodology === true ||
      config.priority === 'high' ||
      config.priority === 'critical' ||
      (config?.source_document &&
        this.isComplexDocument(config?.source_document)) ||
      config?.description.length > 200
    );
  }

  /**
   * NEW: Check if document represents complex work.
   *
   * @param document
   */
  private isComplexDocument(document: any | any): boolean {
    return (
      ('acceptance_criteria' in document &&
        (document as any).acceptance_criteria?.length > 3) ||
      document.tags?.includes('complex') ||
      document.tags?.includes('architecture') ||
      ('technical_approach' in document &&
        (document as any).technical_approach?.includes('architecture'))
    );
  }

  /**
   * NEW: Create temporary task document for SPARC processing.
   *
   * @param config
   */
  private createTempTaskDocument(config: TaskConfig): any {
    return {
      id: `temp-task-${Date.now()}`,
      type: 'task',
      title: config?.description.substring(0, 100),
      content: config?.prompt,
      status: 'draft',
      priority: config?.priority || 'medium',
      author: 'task-coordinator',
      tags: ['sparc-generated, temporary'],
      project_id: 'temp-project',
      dependencies: config?.dependencies || [],
      related_documents: [],
      version: '1..0',
      searchable_content: config?.description,
      keywords: [],
      workflow_stage: 'sparc-ready',
      completion_percentage: 0,
      created_at: new Date(),
      updated_at: new Date(),
      checksum: 'temp-checksum',
      metadata: {}, // Fixed: Added missing metadata property
      task_type: 'development',
      estimated_hours: config?.timeout_minutes
        ? config?.timeout_minutes / 60
        : 8,
      implementation_details: {
        files_to_create: [],
        files_to_modify: [],
        test_files: [],
        documentation_updates: [],
      },
      technical_specifications: {
        component: config?.domain_context || 'general',
        module: 'task-coordinator',
        functions: [],
        dependencies: config?.tools_required || [],
      },
      completion_status: 'todo',
    };
  }

  /**
   * NEW: Wait for SPARC completion (simplified implementation).
   *
   * @param assignmentId
   */
  private async waitForSPARCCompletion(assignmentId: string): Promise<unknown> {
    // In a real implementation, this would use events/promises
    // For now, return a mock result
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'completed',
          sparcTaskId: `sparc-${assignmentId}`,
          completionReport: 'SPARC methodology completed successfully',
          metrics: {
            totalTimeMs: 30000, // 30 seconds
            agentsUsed: ['sparc-swarm'],
          },
          artifacts: {
            specification: ['requirements.md'],
            pseudocode: ['algorithm.md'],
            architecture: ['design.md'],
            implementation: ['code'],
            tests: ['tests'],
            documentation: ['docs.md'],
          },
        });
      }, 1000); // Simulate 1 second processing
    });
  }

  /**
   * Select optimal agent strategy based on task requirements.
   *
   * @param config
   */
  private selectAgentStrategy(config: TaskConfig): AgentStrategy {
    const claudeSubAgent = mapToClaudeSubAgent(config?.subagent_type);
    const subAgentConfig = generateSubAgentConfig(config?.subagent_type);

    // Determine if Claude Code sub-agent should be used
    const useClaudeSubAgent =
      config?.use_claude_subagent !== false &&
      this.isClaudeSubAgentOptimal(config);

    return {
      agent_type: config?.subagent_type,
      agent_name: useClaudeSubAgent ? claudeSubAgent : config?.subagent_type,
      use_claude_subagent: useClaudeSubAgent,
      tools: config?.tools_required || subAgentConfig?.tools,
      capabilities: subAgentConfig?.capabilities,
      system_prompt: subAgentConfig?.systemPrompt,
    };
  }

  /**
   * Determine if Claude Code sub-agent is optimal for this task.
   *
   * @param config
   */
  private isClaudeSubAgentOptimal(config: TaskConfig): boolean {
    // High-priority tasks benefit from specialized sub-agents
    if (config.priority === 'high || config.priority === critical') {
      return true;
    }

    // Complex tasks with multiple dependencies
    if (config?.dependencies && config?.dependencies.length > 2) {
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

    return specializedDomains.includes(config?.subagent_type);
  }

  /**
   * Prepare execution context for agent.
   *
   * @param config
   * @param strategy
   */
  private prepareExecutionContext(
    config: TaskConfig,
    strategy: AgentStrategy
  ): ExecutionContext {
    let enhancedPrompt = config?.prompt()

    // Add domain context if provided
    if (config?.domain_context) {
      enhancedPrompt += `
      \n**Domain Context**: ${config?.domain_context}`;
    }

    // Add expected output format if specified
    if (config?.expected_output) {
      enhancedPrompt += `
      \n**Expected Output**: ${config?.expected_output}`;
    }

    // Add Claude Code sub-agent instructions if using sub-agent
    if (strategy.use_claude_subagent) {
      enhancedPrompt += `
      \n**Specialized Focus**: ${strategy.system_prompt}`;
    }

    return {
      task_id: this.generateTaskId(config),
      description: config?.description,
      prompt: enhancedPrompt,
      agent_strategy: strategy,
      timeout_ms: (config?.timeout_minutes || 10) * 60 * 1000,
      priority: config?.priority || 'medium',
    };
  }

  /**
   * Execute task with selected agent.
   *
   * @param context
   */
  private async executeWithAgent(
    context: ExecutionContext
  ): Promise<{ output: string }> {
    // Track active sub-agent
    this.activeSubAgents.add(context.agent_strategy.agent_name);

    try {
      // This would be replaced with actual Task tool call
      const output = `Task completed by ${context.agent_strategy.agent_name}: ${context.description}`;

      return { output };
    } finally {
      this.activeSubAgents.delete(context.agent_strategy.agent_name);
    }
  }

  /**
   * Generate unique task ID.
   *
   * @param config
   */
  private generateTaskId(config: TaskConfig): string {
    const timestamp = Date.now();
    const hash = this.simpleHash(config?.description + config?.subagent_type);
    return `task_${timestamp}_${hash}`;
  }

  /**
   * Simple hash function for task Ds.
   *
   * @param str
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
   * Get task execution history.
   */
  getTaskHistory(): Map<string, TaskResult> {
    return new Map(this.taskHistory);
  }

  /**
   * Get currently active sub-agents.
   */
  getActiveSubAgents(): string[] {
    return Array.from(this.activeSubAgents);
  }

  /**
   * Get performance metrics.
   */
  getPerformanceMetrics(): TaskPerformanceMetrics {
    const tasks = Array.from(this.taskHistory?.values());
    const successful = tasks.filter((t) => t.success);
    const failed = tasks.filter((t) => !t.success);

    return {
      total_tasks: tasks.length,
      successful_tasks: successful.length,
      failed_tasks: failed.length,
      success_rate: tasks.length > 0 ? successful.length / tasks.length : 0,
      average_execution_time_ms:
        successful.length > 0
          ? successful.reduce((sum, t) => sum + t.execution_time_ms, 0) /
            successful.length
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
  priority: 'low | medium' | 'high | critical');
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
 * Convenience function for quick task execution.
 *
 * @param config
 * @example
 */
export async function executeTask(config: TaskConfig): Promise<TaskResult> {
  const taskCoordinator = TaskCoordinator?.getInstance()
  return await taskCoordinator.executeTask(config);
}

/**
 * Batch task execution with parallel processing.
 *
 * @param configs
 * @example
 */
export async function executeBatchTasks(
  configs: TaskConfig[]
): Promise<TaskResult[]> {
  const taskCoordinator = TaskCoordinator?.getInstance()

  // Execute tasks in parallel for better performance
  const promises = configs.map((config) => taskCoordinator.executeTask(config));

  return await Promise.all(promises);
}

export default TaskCoordinator;
