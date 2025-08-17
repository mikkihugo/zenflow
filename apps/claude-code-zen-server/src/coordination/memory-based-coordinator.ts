/**
 * @fileoverview Memory-Based Swarm Coordination System
 * 
 * Provides agent coordination through TypeScript memory providers instead of bash hooks.
 * Agents coordinate by storing/retrieving progress, decisions, and results via MCP memory tools.
 */

import { EventEmitter } from 'events';
import type { Logger } from '../core/types';
import { getLogger } from '../config/logging-config';
import type { AgentConfig, SwarmConfig, TaskOrchestrationConfig } from '../types/swarm-types';
import type { AgentType } from '../types/agent-types';

/**
 * Agent progress tracking interface
 */
export interface AgentProgress {
  agentId: string;
  swarmId: string;
  status: 'initializing' | 'working' | 'waiting' | 'completed' | 'error';
  currentTask?: string;
  completedTasks: string[];
  filesModified: string[];
  toolsUsed: string[];
  lastUpdate: Date;
  nextAction?: string;
}

/**
 * Shared decision interface for cross-agent coordination
 */
export interface SharedDecision {
  id: string;
  swarmId: string;
  agentId: string;
  decision: string;
  context: Record<string, any>;
  timestamp: Date;
  affectedAgents?: string[];
}

/**
 * Coordination instruction template for spawned agents
 */
export interface CoordinationInstructions {
  swarmId: string;
  agentId: string;
  memoryKeys: {
    progress: string;
    decisions: string;
    results: string;
    shared: string;
  };
  coordinationPrompt: string;
}

/**
 * Memory-based swarm coordination system.
 * 
 * Instead of bash hooks that interfere with the main Claude Code instance,
 * this system coordinates agents through:
 * 1. Shared TypeScript memory providers (SQLite/LanceDB/In-memory)
 * 2. MCP tool calls within agent prompts
 * 3. Event-driven progress tracking
 */
export class SwarmMemoryCoordinator extends EventEmitter {
  private logger: Logger;
  private activeSwarms: Map<string, SwarmConfig> = new Map();
  private agentProgress: Map<string, AgentProgress> = new Map();
  private sharedDecisions: Map<string, SharedDecision[]> = new Map();
  private coordinationInstructions: Map<string, CoordinationInstructions> = new Map();

  constructor() {
    super();
    this.logger = getLogger('SwarmMemoryCoordinator');
  }

  /**
   * Initialize swarm with memory-based coordination
   */
  async initializeSwarm(config: SwarmConfig): Promise<string> {
    const swarmId = config.id || this.generateSwarmId();
    
    this.activeSwarms.set(swarmId, { ...config, id: swarmId });
    this.sharedDecisions.set(swarmId, []);
    
    this.logger.info(`Initialized swarm ${swarmId} with memory-based coordination`, {
      topology: config.topology,
      maxAgents: config.maxAgents
    });

    this.emit('swarm:initialized', { swarmId, config });
    return swarmId;
  }

  /**
   * Generate coordination instructions for a spawned agent.
   * These instructions are embedded in the agent's prompt, not bash hooks.
   */
  generateCoordinationInstructions(swarmId: string, agentId: string, agentType: AgentType): CoordinationInstructions {
    const memoryKeys = {
      progress: `swarm/${swarmId}/agent/${agentId}/progress`,
      decisions: `swarm/${swarmId}/agent/${agentId}/decisions`, 
      results: `swarm/${swarmId}/agent/${agentId}/results`,
      shared: `swarm/${swarmId}/shared`
    };

    const coordinationPrompt = this.buildCoordinationPrompt(swarmId, agentId, agentType, memoryKeys);

    const instructions: CoordinationInstructions = {
      swarmId,
      agentId,
      memoryKeys,
      coordinationPrompt
    };

    this.coordinationInstructions.set(agentId, instructions);
    return instructions;
  }

  /**
   * Build coordination prompt template that agents receive
   */
  private buildCoordinationPrompt(
    swarmId: string, 
    agentId: string, 
    agentType: AgentType, 
    memoryKeys: CoordinationInstructions['memoryKeys']
  ): string {
    return `
🤖 SWARM COORDINATION PROTOCOL - ${agentType.toUpperCase()} AGENT

You are agent "${agentId}" in swarm "${swarmId}". Coordinate with other agents via memory, NOT bash hooks.

MANDATORY COORDINATION STEPS:

1️⃣ BEFORE STARTING ANY WORK:
   - Check swarm progress: mcp__claude-zen__memory_usage { "action": "retrieve", "key": "${memoryKeys.shared}/progress" }
   - Check shared decisions: mcp__claude-zen__memory_usage { "action": "retrieve", "key": "${memoryKeys.shared}/decisions" }
   - Store your initialization: mcp__claude-zen__memory_usage { "action": "store", "key": "${memoryKeys.progress}", "value": { "status": "initializing", "agentId": "${agentId}", "timestamp": "$(date -Iseconds)" } }

2️⃣ DURING WORK (After EVERY major step):
   - Store progress updates: mcp__claude-zen__memory_usage { "action": "store", "key": "${memoryKeys.progress}", "value": { "status": "working", "currentTask": "[describe task]", "filesModified": ["file1.ts"], "toolsUsed": ["Write", "Edit"] } }
   - Store important decisions: mcp__claude-zen__memory_usage { "action": "store", "key": "${memoryKeys.decisions}", "value": { "decision": "[what you decided]", "context": {...}, "timestamp": "$(date -Iseconds)" } }

3️⃣ COORDINATE WITH OTHER AGENTS:
   - Before making major decisions, check: mcp__claude-zen__memory_usage { "action": "list", "pattern": "swarm/${swarmId}/agent/*/decisions" }
   - Share decisions that affect others: mcp__claude-zen__memory_usage { "action": "store", "key": "${memoryKeys.shared}/decisions", "value": { "agentId": "${agentId}", "decision": "[decision]", "affectedAgents": ["agent1", "agent2"] } }

4️⃣ AFTER COMPLETION:
   - Store final results: mcp__claude-zen__memory_usage { "action": "store", "key": "${memoryKeys.results}", "value": { "status": "completed", "summary": "[what was accomplished]", "artifacts": ["file1.ts", "file2.ts"], "nextSteps": ["suggestions for other agents"] } }
   - Update swarm progress: mcp__claude-zen__memory_usage { "action": "store", "key": "${memoryKeys.shared}/progress", "value": { "agentId": "${agentId}", "completed": true, "timestamp": "$(date -Iseconds)" } }

COORDINATION EXAMPLES:
✅ Good: "Before implementing auth, let me check what other agents decided: mcp__claude-zen__memory_usage..."
✅ Good: "I'll store this API design decision: mcp__claude-zen__memory_usage..."
❌ Wrong: Working in isolation without checking/storing coordination data

Remember: Coordination happens through MCP memory tools, not bash commands!
`;
  }

  /**
   * Create a coordination-aware agent spawn configuration
   */
  async createCoordinatedAgentConfig(
    swarmId: string,
    agentType: AgentType,
    taskDescription: string,
    additionalConfig?: Partial<AgentConfig>
  ): Promise<{ agentId: string; spawnConfig: any; instructions: CoordinationInstructions }> {
    const agentId = this.generateAgentId(agentType);
    const instructions = this.generateCoordinationInstructions(swarmId, agentId, agentType);

    // Initialize agent progress tracking
    const progress: AgentProgress = {
      agentId,
      swarmId,
      status: 'initializing',
      currentTask: taskDescription,
      completedTasks: [],
      filesModified: [],
      toolsUsed: [],
      lastUpdate: new Date()
    };

    this.agentProgress.set(agentId, progress);

    // Build the spawn configuration that includes coordination instructions
    const spawnConfig = {
      description: `${agentType} agent for: ${taskDescription}`,
      prompt: `${instructions.coordinationPrompt}

YOUR SPECIFIC TASK: ${taskDescription}

${additionalConfig?.systemPrompt || this.getDefaultSystemPrompt(agentType)}

Remember to follow the coordination protocol throughout your work!`,
      subagent_type: agentType,
      ...additionalConfig
    };

    this.logger.info(`Created coordinated agent config`, {
      agentId,
      swarmId,
      agentType,
      taskDescription
    });

    this.emit('agent:configured', { agentId, swarmId, agentType, spawnConfig });

    return { agentId, spawnConfig, instructions };
  }

  /**
   * Process memory updates from agents (called by MCP tools)
   */
  async processAgentMemoryUpdate(
    agentId: string,
    memoryKey: string,
    value: any
  ): Promise<void> {
    const [, swarmId, , , type] = memoryKey.split('/');
    
    if (type === 'progress') {
      await this.updateAgentProgress(agentId, value);
    } else if (type === 'decisions') {
      await this.recordSharedDecision(swarmId, agentId, value);
    } else if (type === 'results') {
      await this.processAgentResults(agentId, value);
    }

    this.emit('memory:updated', { agentId, swarmId, memoryKey, value });
  }

  /**
   * Update agent progress tracking
   */
  private async updateAgentProgress(agentId: string, progressUpdate: Partial<AgentProgress>): Promise<void> {
    const currentProgress = this.agentProgress.get(agentId);
    if (!currentProgress) {
      this.logger.warn(`No progress tracking found for agent ${agentId}`);
      return;
    }

    const updatedProgress: AgentProgress = {
      ...currentProgress,
      ...progressUpdate,
      lastUpdate: new Date()
    };

    this.agentProgress.set(agentId, updatedProgress);
    this.emit('agent:progress', updatedProgress);

    this.logger.debug(`Updated progress for agent ${agentId}`, updatedProgress);
  }

  /**
   * Record shared decisions for cross-agent coordination
   */
  private async recordSharedDecision(swarmId: string, agentId: string, decision: any): Promise<void> {
    const sharedDecision: SharedDecision = {
      id: this.generateDecisionId(),
      swarmId,
      agentId,
      decision: decision.decision || decision,
      context: decision.context || {},
      timestamp: new Date(),
      affectedAgents: decision.affectedAgents
    };

    const swarmDecisions = this.sharedDecisions.get(swarmId) || [];
    swarmDecisions.push(sharedDecision);
    this.sharedDecisions.set(swarmId, swarmDecisions);

    this.emit('decision:shared', sharedDecision);
    this.logger.info(`Recorded shared decision in swarm ${swarmId}`, sharedDecision);
  }

  /**
   * Process agent completion results
   */
  private async processAgentResults(agentId: string, results: any): Promise<void> {
    await this.updateAgentProgress(agentId, { 
      status: 'completed',
      currentTask: undefined,
      completedTasks: [...(this.agentProgress.get(agentId)?.completedTasks || []), results.summary]
    });

    this.emit('agent:completed', { agentId, results });
    this.logger.info(`Agent ${agentId} completed work`, results);
  }

  /**
   * Get current swarm status including all agent progress
   */
  getSwarmStatus(swarmId: string): {
    config: SwarmConfig | undefined;
    agents: AgentProgress[];
    decisions: SharedDecision[];
    summary: {
      totalAgents: number;
      activeAgents: number;
      completedAgents: number;
    };
  } {
    const config = this.activeSwarms.get(swarmId);
    const agents = Array.from(this.agentProgress.values()).filter(a => a.swarmId === swarmId);
    const decisions = this.sharedDecisions.get(swarmId) || [];

    const summary = {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'working').length,
      completedAgents: agents.filter(a => a.status === 'completed').length
    };

    return { config, agents, decisions, summary };
  }

  /**
   * Get agent-specific coordination data for MCP tools
   */
  getAgentCoordinationData(agentId: string): {
    progress: AgentProgress | undefined;
    instructions: CoordinationInstructions | undefined;
  } {
    return {
      progress: this.agentProgress.get(agentId),
      instructions: this.coordinationInstructions.get(agentId)
    };
  }

  // Utility methods
  private generateSwarmId(): string {
    return `swarm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAgentId(agentType: AgentType): string {
    return `${agentType}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  private generateDecisionId(): string {
    return `decision-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  private getDefaultSystemPrompt(agentType: AgentType): string {
    const prompts: Record<string, string> = {
      coder: 'You are a senior software developer focused on clean, maintainable code with comprehensive testing.',
      analyst: 'You are a business analyst specializing in requirements gathering and system analysis.',
      researcher: 'You are a research specialist expert at finding and analyzing information.',
      tester: 'You are a QA engineer focused on comprehensive testing and quality assurance.',
      architect: 'You are a software architect focused on scalable, maintainable system design.',
      coordinator: 'You are a coordination specialist focused on managing and optimizing team workflows.'
    };

    return prompts[agentType] || `You are a ${agentType} specialist focused on high-quality deliverables.`;
  }
}