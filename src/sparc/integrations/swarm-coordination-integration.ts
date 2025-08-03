/**
 * SPARC Swarm Coordination Integration
 *
 * Integrates SPARC methodology with Claude-Zen's sophisticated swarm coordination system.
 * Enables distributed SPARC development using existing agent types and coordination protocols.
 */

import { TaskAPI } from '../../coordination/api';
import {
  type EnhancedTaskConfig,
  EnhancedTaskTool,
} from '../../coordination/enhanced-task-tool';
import type { AgentType } from '../../types/agent-types';
import type { SPARCPhase, SPARCProject } from '../types/sparc-types';

// SPARC-specific agent types from existing 147+ agent types
export const SPARC_AGENT_TYPES: AgentType[] = [
  'sparc-coordinator',
  'implementer-sparc-coder',
  'requirements-analyst',
  'system-architect',
  'performance-engineer',
  'test-engineer',
  'security-engineer',
  'documentation-specialist',
];

export interface SPARCSwarmTask {
  sparcProjectId: string;
  phase: SPARCPhase;
  taskType: 'analysis' | 'design' | 'implementation' | 'testing' | 'documentation';
  agentType: AgentType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  estimatedEffort: number; // minutes
}

/**
 * Coordinates SPARC development using existing swarm intelligence
 */
export class SPARCSwarmCoordinator {
  private taskTool: EnhancedTaskTool;
  private taskAPI: TaskAPI;
  private activeSPARCSwarms: Map<string, Set<string>>;

  constructor() {
    this.taskTool = EnhancedTaskTool.getInstance();
    this.taskAPI = new TaskAPI();
    this.activeSPARCSwarms = new Map();
  }

  /**
   * Create a swarm for SPARC project development
   */
  async initializeSPARCSwarm(project: SPARCProject): Promise<string> {
    const swarmId = `sparc-${project.id}`;
    const agentTasks = new Set<string>();

    // Phase-specific agent assignments using existing coordination
    const phaseAgents = this.getPhaseAgents(project.currentPhase);

    for (const agentType of phaseAgents) {
      const taskConfig: EnhancedTaskConfig = {
        description: `SPARC ${project.currentPhase} phase for ${project.name}`,
        prompt: this.generatePhasePrompt(project, project.currentPhase, agentType),
        subagent_type: agentType,
        use_claude_subagent: true,
        domain_context: `SPARC methodology - ${project.domain}`,
        expected_output: this.getPhaseExpectedOutput(project.currentPhase, agentType),
        tools_required: this.getRequiredTools(project.currentPhase, agentType),
        priority: 'high',
        dependencies: [],
        timeout_minutes: this.getPhaseTimeout(project.currentPhase),
      };

      const taskId = await this.taskAPI.createTask({
        title: `${agentType} - ${project.currentPhase}`,
        description: taskConfig.description,
        component: `sparc-${project.domain}`,
        priority: 3,
        estimated_hours: taskConfig.timeout_minutes! / 60,
      });

      agentTasks.add(taskId);
    }

    this.activeSPARCSwarms.set(swarmId, agentTasks);
    return swarmId;
  }

  /**
   * Execute SPARC phase using coordinated swarm
   */
  async executeSPARCPhase(
    projectId: string,
    phase: SPARCPhase
  ): Promise<{ success: boolean; results: Map<AgentType, any> }> {
    const swarmId = `sparc-${projectId}`;
    const results = new Map<AgentType, any>();
    const phaseAgents = this.getPhaseAgents(phase);

    // Execute tasks in parallel using existing coordination
    const taskPromises = phaseAgents.map(async (agentType) => {
      const taskConfig: EnhancedTaskConfig = {
        description: `Execute ${phase} phase with ${agentType}`,
        prompt: this.generatePhasePrompt({ id: projectId } as SPARCProject, phase, agentType),
        subagent_type: agentType,
        use_claude_subagent: true,
        domain_context: 'SPARC methodology execution',
        priority: 'high',
        timeout_minutes: this.getPhaseTimeout(phase),
      };

      try {
        const result = await this.taskTool.executeTask(taskConfig);
        results.set(agentType, result);
        return result.success;
      } catch (error) {
        console.error(`SPARC phase execution failed for ${agentType}:`, error);
        return false;
      }
    });

    const successes = await Promise.all(taskPromises);
    const allSuccessful = successes.every((success) => success);

    return { success: allSuccessful, results };
  }

  /**
   * Get appropriate agents for each SPARC phase
   */
  private getPhaseAgents(phase: SPARCPhase): AgentType[] {
    const phaseAgentMap: Record<SPARCPhase, AgentType[]> = {
      specification: ['requirements-analyst', 'sparc-coordinator', 'documentation-specialist'],
      pseudocode: ['implementer-sparc-coder', 'system-architect', 'sparc-coordinator'],
      architecture: [
        'system-architect',
        'performance-engineer',
        'security-engineer',
        'sparc-coordinator',
      ],
      refinement: [
        'performance-engineer',
        'security-engineer',
        'test-engineer',
        'implementer-sparc-coder',
      ],
      completion: [
        'implementer-sparc-coder',
        'test-engineer',
        'documentation-specialist',
        'sparc-coordinator',
      ],
    };

    return phaseAgentMap[phase] || ['sparc-coordinator'];
  }

  /**
   * Generate phase-specific prompts for agents
   */
  private generatePhasePrompt(
    project: SPARCProject,
    phase: SPARCPhase,
    agentType: AgentType
  ): string {
    const basePrompt = `You are a ${agentType} working on SPARC methodology ${phase} phase for "${project.name}".`;

    const phasePrompts: Record<SPARCPhase, Record<string, string>> = {
      specification: {
        'requirements-analyst': `${basePrompt} Analyze requirements and create detailed specifications.`,
        'sparc-coordinator': `${basePrompt} Coordinate specification phase activities.`,
        'documentation-specialist': `${basePrompt} Document requirements and specifications.`,
      },
      pseudocode: {
        'implementer-sparc-coder': `${basePrompt} Create detailed pseudocode and algorithm design.`,
        'system-architect': `${basePrompt} Design system structure and component interactions.`,
        'sparc-coordinator': `${basePrompt} Coordinate pseudocode development activities.`,
      },
      architecture: {
        'system-architect': `${basePrompt} Design comprehensive system architecture.`,
        'performance-engineer': `${basePrompt} Analyze performance requirements and optimization opportunities.`,
        'security-engineer': `${basePrompt} Design security architecture and identify threats.`,
        'sparc-coordinator': `${basePrompt} Coordinate architecture design activities.`,
      },
      refinement: {
        'performance-engineer': `${basePrompt} Optimize performance and identify bottlenecks.`,
        'security-engineer': `${basePrompt} Enhance security measures and conduct threat analysis.`,
        'test-engineer': `${basePrompt} Design comprehensive testing strategy.`,
        'implementer-sparc-coder': `${basePrompt} Refine implementation based on feedback.`,
      },
      completion: {
        'implementer-sparc-coder': `${basePrompt} Generate production-ready code implementation.`,
        'test-engineer': `${basePrompt} Create comprehensive test suites and validation.`,
        'documentation-specialist': `${basePrompt} Create complete project documentation.`,
        'sparc-coordinator': `${basePrompt} Coordinate completion phase and final validation.`,
      },
    };

    return phasePrompts[phase][agentType] || `${basePrompt} Execute ${phase} phase tasks.`;
  }

  /**
   * Get expected output for each phase and agent combination
   */
  private getPhaseExpectedOutput(phase: SPARCPhase, agentType: AgentType): string {
    const outputMap: Record<string, string> = {
      'specification-requirements-analyst': 'Detailed requirements specification document',
      'specification-sparc-coordinator': 'Phase coordination summary and next steps',
      'pseudocode-implementer-sparc-coder': 'Detailed pseudocode with algorithm analysis',
      'architecture-system-architect': 'Comprehensive system architecture design',
      'refinement-performance-engineer': 'Performance optimization recommendations',
      'completion-implementer-sparc-coder': 'Production-ready code implementation',
    };

    return outputMap[`${phase}-${agentType}`] || `${phase} phase deliverable`;
  }

  /**
   * Get required tools for each phase and agent
   */
  private getRequiredTools(phase: SPARCPhase, agentType: AgentType): string[] {
    const baseTools = ['file_operations', 'code_analysis', 'documentation'];

    const agentTools: Record<AgentType, string[]> = {
      'implementer-sparc-coder': [...baseTools, 'code_generation', 'testing'],
      'system-architect': [...baseTools, 'design_tools', 'modeling'],
      'performance-engineer': [...baseTools, 'profiling', 'benchmarking'],
      'security-engineer': [...baseTools, 'security_analysis', 'threat_modeling'],
      'test-engineer': [...baseTools, 'testing_frameworks', 'test_automation'],
      'requirements-analyst': [...baseTools, 'requirements_analysis'],
      'documentation-specialist': [...baseTools, 'documentation_generators'],
      'sparc-coordinator': [...baseTools, 'project_management', 'coordination'],
    };

    return agentTools[agentType] || baseTools;
  }

  /**
   * Get timeout for each phase in minutes
   */
  private getPhaseTimeout(phase: SPARCPhase): number {
    const timeouts: Record<SPARCPhase, number> = {
      specification: 60, // 1 hour
      pseudocode: 90, // 1.5 hours
      architecture: 120, // 2 hours
      refinement: 90, // 1.5 hours
      completion: 180, // 3 hours
    };

    return timeouts[phase] || 60;
  }

  /**
   * Monitor SPARC swarm progress
   */
  async getSPARCSwarmStatus(projectId: string): Promise<{
    swarmId: string;
    activeTasks: number;
    completedTasks: number;
    phase: SPARCPhase;
    progress: number;
  }> {
    const swarmId = `sparc-${projectId}`;
    const tasks = this.activeSPARCSwarms.get(swarmId) || new Set();

    // Get task statuses from TaskAPI
    const completedTasks = 0;
    for (const taskId of tasks) {
      // In a real implementation, we'd check task status via TaskAPI
      // For now, return mock data
    }

    return {
      swarmId,
      activeTasks: tasks.size,
      completedTasks,
      phase: 'specification', // Would come from project state
      progress: tasks.size > 0 ? (completedTasks / tasks.size) * 100 : 0,
    };
  }

  /**
   * Terminate SPARC swarm and cleanup resources
   */
  async terminateSPARCSwarm(projectId: string): Promise<void> {
    const swarmId = `sparc-${projectId}`;
    const tasks = this.activeSPARCSwarms.get(swarmId);

    if (tasks) {
      // Cancel active tasks
      for (const taskId of tasks) {
        // In real implementation, cancel via TaskAPI
      }

      this.activeSPARCSwarms.delete(swarmId);
    }
  }
}
