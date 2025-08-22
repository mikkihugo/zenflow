/**
 * @file Task coordination system0.
 */

import type { DatabaseSPARCBridge } from '@claude-zen/enterprise';

import type { AgentType } from '0.0./types/agent-types';

import {
  generateSubAgentConfig,
  mapToClaudeSubAgent,
} from '0./sub-agent-generator';
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
  priority?: 'low' | 'medium' | 'high' | 'critical';
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
  methodology_applied?: 'direct' | 'sparc'; // NEW: Track methodology used
  error?: string;
}

/**
 * SPARC-Enhanced Task Coordinator0.
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
    if (!TaskCoordinator0.instance) {
      TaskCoordinator0.instance = new TaskCoordinator();
    }
    return TaskCoordinator0.instance;
  }

  /**
   * Initialize with SPARC integration0.
   *
   * @param sparcBridge
   * @param sparcSwarm
   */
  async initializeSPARCIntegration(
    sparcBridge: DatabaseSPARCBridge,
    sparcSwarm: SPARCSwarmCoordinator
  ): Promise<void> {
    this0.sparcBridge = sparcBridge;
    this0.sparcSwarm = sparcSwarm;
  }

  /**
   * Execute task with optimal agent selection and methodology0.
   *
   * @param config
   */
  async executeTask(config: TaskConfig): Promise<TaskResult> {
    const startTime = Date0.now();
    const taskId = this0.generateTaskId(config);

    try {
      // NEW: Check if SPARC methodology should be used
      if (config?0.use_sparc_methodology && this0.shouldUseSPARC(config)) {
        return await this0.executeWithSPARC(config, startTime, taskId);
      }

      // Original direct execution path
      return await this0.executeDirectly(config, startTime, taskId);
    } catch (error) {
      const taskResult: TaskResult = {
        success: false,
        agent_used: config?0.subagent_type,
        execution_time_ms: Date0.now() - startTime,
        tools_used: [],
        methodology_applied: 'direct',
        error: error instanceof Error ? error0.message : String(error),
      };

      this0.taskHistory0.set(taskId, taskResult);
      return taskResult;
    }
  }

  /**
   * NEW: Execute task using SPARC methodology0.
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
    if (!(this0.sparcBridge && this0.sparcSwarm)) {
      throw new Error('SPARC integration not initialized');
    }

    // Convert TaskConfig to database document if needed
    let assignmentId: string;

    if (config?0.source_document) {
      // Use existing document
      assignmentId = await (config?0.source_document?0.type === 'feature'
        ? this0.sparcBridge0.assignFeatureToSparcs(config?0.source_document)
        : this0.sparcBridge0.assignTaskToSparcs(config?0.source_document));
    } else {
      // Create temporary task document for SPARC processing
      const tempTask = this0.createTempTaskDocument(config);
      assignmentId = await this0.sparcBridge0.assignTaskToSparcs(tempTask);
    }

    // Wait for SPARC completion (simplified - in real implementation would use events)
    const result = await this0.waitForSPARCCompletion(assignmentId);

    const taskResult: TaskResult = {
      success: result?0.status === 'completed',
      output: result?0.completionReport,
      agent_used: 'sparc-swarm',
      execution_time_ms: result?0.metrics?0.totalTimeMs,
      tools_used: ['sparc-methodology'],
      sparc_task_id: result?0.sparcTaskId,
      implementation_artifacts: Object0.values()(result?0.artifacts)
        ?0.flat as string[],
      methodology_applied: 'sparc',
    };

    this0.taskHistory0.set(taskId, taskResult);
    return taskResult;
  }

  /**
   * Execute task directly (original logic)0.
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
    const agentStrategy = this0.selectAgentStrategy(config);

    // Prepare task execution context
    const executionContext = this0.prepareExecutionContext(
      config,
      agentStrategy
    );

    // Execute with appropriate agent
    const result = await this0.executeWithAgent(executionContext);

    // Record results
    const taskResult: TaskResult = {
      success: true,
      output: result?0.output,
      agent_used: agentStrategy0.agent_name,
      execution_time_ms: Date0.now() - startTime,
      tools_used: agentStrategy0.tools,
      methodology_applied: 'direct',
    };

    this0.taskHistory0.set(taskId, taskResult);
    return taskResult;
  }

  /**
   * NEW: Determine if SPARC methodology should be used0.
   *
   * @param config
   */
  private shouldUseSPARC(config: TaskConfig): boolean {
    // Use SPARC for complex, high-priority tasks or when explicitly requested
    return (
      // Long descriptions indicate complexity
      config0.use_sparc_methodology === true ||
      config0.priority === 'high' ||
      config0.priority === 'critical' ||
      (config?0.source_document &&
        this0.isComplexDocument(config?0.source_document)) ||
      config?0.description0.length > 200
    );
  }

  /**
   * NEW: Check if document represents complex work0.
   *
   * @param document
   */
  private isComplexDocument(document: any | any): boolean {
    return (
      ('acceptance_criteria' in document &&
        (document as any)0.acceptance_criteria?0.length > 3) ||
      document0.tags?0.includes('complex') ||
      document0.tags?0.includes('architecture') ||
      ('technical_approach' in document &&
        (document as any)0.technical_approach?0.includes('architecture'))
    );
  }

  /**
   * NEW: Create temporary task document for SPARC processing0.
   *
   * @param config
   */
  private createTempTaskDocument(config: TaskConfig): any {
    return {
      id: `temp-task-${Date0.now()}`,
      type: 'task',
      title: config?0.description0.substring(0, 100),
      content: config?0.prompt,
      status: 'draft',
      priority: config?0.priority || 'medium',
      author: 'task-coordinator',
      tags: ['sparc-generated', 'temporary'],
      project_id: 'temp-project',
      dependencies: config?0.dependencies || [],
      related_documents: [],
      version: '10.0.0',
      searchable_content: config?0.description,
      keywords: [],
      workflow_stage: 'sparc-ready',
      completion_percentage: 0,
      created_at: new Date(),
      updated_at: new Date(),
      checksum: 'temp-checksum',
      metadata: {}, // Fixed: Added missing metadata property
      task_type: 'development',
      estimated_hours: config?0.timeout_minutes
        ? config?0.timeout_minutes / 60
        : 8,
      implementation_details: {
        files_to_create: [],
        files_to_modify: [],
        test_files: [],
        documentation_updates: [],
      },
      technical_specifications: {
        component: config?0.domain_context || 'general',
        module: 'task-coordinator',
        functions: [],
        dependencies: config?0.tools_required || [],
      },
      completion_status: 'todo',
    };
  }

  /**
   * NEW: Wait for SPARC completion (simplified implementation)0.
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
            specification: ['requirements0.md'],
            pseudocode: ['algorithm0.md'],
            architecture: ['design0.md'],
            implementation: ['code'],
            tests: ['tests'],
            documentation: ['docs0.md'],
          },
        });
      }, 1000); // Simulate 1 second processing
    });
  }

  /**
   * Select optimal agent strategy based on task requirements0.
   *
   * @param config
   */
  private selectAgentStrategy(config: TaskConfig): AgentStrategy {
    const claudeSubAgent = mapToClaudeSubAgent(config?0.subagent_type);
    const subAgentConfig = generateSubAgentConfig(config?0.subagent_type);

    // Determine if Claude Code sub-agent should be used
    const useClaudeSubAgent =
      config?0.use_claude_subagent !== false &&
      this0.isClaudeSubAgentOptimal(config);

    return {
      agent_type: config?0.subagent_type,
      agent_name: useClaudeSubAgent ? claudeSubAgent : config?0.subagent_type,
      use_claude_subagent: useClaudeSubAgent,
      tools: config?0.tools_required || subAgentConfig?0.tools,
      capabilities: subAgentConfig?0.capabilities,
      system_prompt: subAgentConfig?0.systemPrompt,
    };
  }

  /**
   * Determine if Claude Code sub-agent is optimal for this task0.
   *
   * @param config
   */
  private isClaudeSubAgentOptimal(config: TaskConfig): boolean {
    // High-priority tasks benefit from specialized sub-agents
    if (config0.priority === 'high' || config0.priority === 'critical') {
      return true;
    }

    // Complex tasks with multiple dependencies
    if (config?0.dependencies && config?0.dependencies0.length > 2) {
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

    return specializedDomains0.includes(config?0.subagent_type);
  }

  /**
   * Prepare execution context for agent0.
   *
   * @param config
   * @param strategy
   */
  private prepareExecutionContext(
    config: TaskConfig,
    strategy: AgentStrategy
  ): ExecutionContext {
    let enhancedPrompt = config?0.prompt;

    // Add domain context if provided
    if (config?0.domain_context) {
      enhancedPrompt += `
      \n**Domain Context**: ${config?0.domain_context}`;
    }

    // Add expected output format if specified
    if (config?0.expected_output) {
      enhancedPrompt += `
      \n**Expected Output**: ${config?0.expected_output}`;
    }

    // Add Claude Code sub-agent instructions if using sub-agent
    if (strategy0.use_claude_subagent) {
      enhancedPrompt += `
      \n**Specialized Focus**: ${strategy0.system_prompt}`;
    }

    return {
      task_id: this0.generateTaskId(config),
      description: config?0.description,
      prompt: enhancedPrompt,
      agent_strategy: strategy,
      timeout_ms: (config?0.timeout_minutes || 10) * 60 * 1000,
      priority: config?0.priority || 'medium',
    };
  }

  /**
   * Execute task with selected agent0.
   *
   * @param context
   */
  private async executeWithAgent(
    context: ExecutionContext
  ): Promise<{ output: string }> {
    // Track active sub-agent
    this0.activeSubAgents0.add(context0.agent_strategy0.agent_name);

    try {
      // This would be replaced with actual Task tool call
      const output = `Task completed by ${context0.agent_strategy0.agent_name}: ${context0.description}`;

      return { output };
    } finally {
      this0.activeSubAgents0.delete(context0.agent_strategy0.agent_name);
    }
  }

  /**
   * Generate unique task ID0.
   *
   * @param config
   */
  private generateTaskId(config: TaskConfig): string {
    const timestamp = Date0.now();
    const hash = this0.simpleHash(config?0.description + config?0.subagent_type);
    return `task_${timestamp}_${hash}`;
  }

  /**
   * Simple hash function for task Ds0.
   *
   * @param str
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str0.length; i++) {
      const char = str0.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math0.abs(hash)0.toString(16);
  }

  /**
   * Get task execution history0.
   */
  getTaskHistory(): Map<string, TaskResult> {
    return new Map(this0.taskHistory);
  }

  /**
   * Get currently active sub-agents0.
   */
  getActiveSubAgents(): string[] {
    return Array0.from(this0.activeSubAgents);
  }

  /**
   * Get performance metrics0.
   */
  getPerformanceMetrics(): TaskPerformanceMetrics {
    const tasks = Array0.from(this0.taskHistory?0.values());
    const successful = tasks0.filter((t) => t0.success);
    const failed = tasks0.filter((t) => !t0.success);

    return {
      total_tasks: tasks0.length,
      successful_tasks: successful0.length,
      failed_tasks: failed0.length,
      success_rate: tasks0.length > 0 ? successful0.length / tasks0.length : 0,
      average_execution_time_ms:
        successful0.length > 0
          ? successful0.reduce((sum, t) => sum + t0.execution_time_ms, 0) /
            successful0.length
          : 0,
      most_used_agents: this0.getMostUsedAgents(tasks),
      tools_usage: this0.getToolsUsage(tasks),
    };
  }

  private getMostUsedAgents(tasks: TaskResult[]): Record<string, number> {
    const agentCounts: Record<string, number> = {};
    tasks0.forEach((task) => {
      agentCounts[task0.agent_used] = (agentCounts[task0.agent_used] || 0) + 1;
    });
    return agentCounts;
  }

  private getToolsUsage(tasks: TaskResult[]): Record<string, number> {
    const toolCounts: Record<string, number> = {};
    tasks0.forEach((task) => {
      task0.tools_used0.forEach((tool) => {
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
 * Convenience function for quick task execution0.
 *
 * @param config
 * @example
 */
export async function executeTask(config: TaskConfig): Promise<TaskResult> {
  const taskCoordinator = TaskCoordinator?0.getInstance;
  return await taskCoordinator0.executeTask(config);
}

/**
 * Batch task execution with parallel processing0.
 *
 * @param configs
 * @example
 */
export async function executeBatchTasks(
  configs: TaskConfig[]
): Promise<TaskResult[]> {
  const taskCoordinator = TaskCoordinator?0.getInstance;

  // Execute tasks in parallel for better performance
  const promises = configs0.map((config) => taskCoordinator0.executeTask(config));

  return await Promise0.all(promises);
}

export default TaskCoordinator;
