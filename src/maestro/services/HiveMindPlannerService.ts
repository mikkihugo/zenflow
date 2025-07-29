/**
 * Hive Mind Planner Service - Integrated with AgentManager System
 * 
 * Leverages existing AgentManager task-planner template and AgentRegistry
 * for intelligent task planning. Follows KISS and SOLID principles.
 * 
 * Key Features:
 * - Uses AgentManager task-planner template (lines 501-552 in agent-manager.ts)
 * - Integrates with AgentRegistry for agent selection and coordination
 * - Falls back to hive mind agents when AgentManager agents unavailable
 * - Simple, focused interface following Single Responsibility
 */

import { HiveMind } from '../../hive-mind/core/HiveMind.js';
import { Agent } from '../../hive-mind/core/Agent.js';
import { TaskSubmitOptions, AgentCapability } from '../../hive-mind/types.js';
import { ILogger } from '../../core/logger.js';
import { AgentManager } from '../../agents/agent-manager.js';
import { AgentRegistry } from '../../agents/agent-registry.js';
import { AgentState } from '../../swarm/types.js';

export interface PlannerRequest {
  featureName: string;
  designContent: string;
  requirements?: string;
  timeoutMs?: number;
}

export interface PlannerResponse {
  success: boolean;
  taskMarkdown?: string;
  error?: string;
  agentUsed?: string;
  plannerType?: 'task-planner' | 'architect' | 'specialist' | 'fallback';
}

/**
 * Service that coordinates task planning using AgentManager and hive mind agents
 * Follows Single Responsibility Principle - only handles planning coordination
 */
export class HiveMindPlannerService {

  constructor(
    private hiveMind: HiveMind,
    private logger: ILogger,
    private agentManager?: AgentManager,
    private agentRegistry?: AgentRegistry
  ) {}

  /**
   * Generate task plan using AgentManager task-planner template or hive mind agents
   */
  async generateTaskPlan(request: PlannerRequest): Promise<PlannerResponse> {
    const { featureName, designContent, requirements, timeoutMs = 90000 } = request;

    this.logger.info(`Generating task plan for ${featureName} using integrated agent systems`);

    try {
      // First try AgentManager task-planner template
      if (this.agentManager && this.agentRegistry) {
        const agentManagerResult = await this.tryAgentManagerPlanning(request);
        if (agentManagerResult.success) {
          return agentManagerResult;
        }
        this.logger.info('AgentManager planning unavailable, falling back to hive mind agents');
      }

      // Fallback to hive mind agents
      const plannerAgent = await this.findBestHiveMindAgent(designContent);
      
      if (!plannerAgent) {
        this.logger.warn('No suitable agents available in either system');
        return {
          success: false,
          error: 'No suitable planner agents available',
          plannerType: 'fallback'
        };
      }

      // Submit planning task to the selected hive mind agent
      const taskOptions: TaskSubmitOptions = {
        description: `Generate implementation task breakdown for ${featureName}`,
        priority: 'medium',
        strategy: 'sequential',
        assignedAgent: plannerAgent.id,
        requiredCapabilities: this.getRequiredCapabilities(plannerAgent.type),
        metadata: {
          type: 'task_planning',
          featureName,
          designContent,
          requirements: requirements || '',
          plannerType: plannerAgent.type
        }
      };

      this.logger.info(`Submitting task planning to ${plannerAgent.type} agent: ${plannerAgent.id}`);
      const task = await this.hiveMind.submitTask(taskOptions);

      // Wait for completion
      const result = await this.waitForPlanningCompletion(task.id, timeoutMs);

      if (result.success && result.taskMarkdown) {
        this.logger.info(`Task plan generated successfully for ${featureName} using ${plannerAgent.type}`);
        return {
          success: true,
          taskMarkdown: result.taskMarkdown,
          agentUsed: plannerAgent.id,
          plannerType: plannerAgent.type as 'architect' | 'specialist'
        };
      }

      return {
        success: false,
        error: result.error || 'Planning task failed',
        agentUsed: plannerAgent.id,
        plannerType: plannerAgent.type as 'architect' | 'specialist'
      };

    } catch (error) {
      this.logger.error(`Hive mind task planning failed for ${featureName}: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        plannerType: 'fallback'
      };
    }
  }

  /**
   * Try using AgentManager task-planner template for planning
   */
  private async tryAgentManagerPlanning(request: PlannerRequest): Promise<PlannerResponse> {
    try {
      // Query for task-planner agents in registry
      const taskPlannerAgents = await this.agentRegistry!.queryAgents({
        type: 'task-planner' as any,
        status: 'idle',
        healthThreshold: 0.7
      });

      if (taskPlannerAgents.length === 0) {
        // Create new task-planner agent using AgentManager template
        this.logger.info('Creating new task-planner agent using AgentManager template');
        const agentId = await this.agentManager!.createAgent('task-planner', {
          name: `Task Planner for ${request.featureName}`,
          type: 'task-planner',
          capabilities: ['project-management', 'task-breakdown', 'agile-planning'],
          maxConcurrentTasks: 1,
          priority: 90
        });

        await this.agentManager!.startAgent(agentId);
        
        // Execute planning task
        const planningResult = await this.executePlanningWithAgentManager(agentId, request);
        
        // Cleanup agent after use
        await this.agentManager!.stopAgent(agentId);
        
        return {
          success: true,
          taskMarkdown: planningResult,
          agentUsed: agentId,
          plannerType: 'task-planner'
        };
      } else {
        // Use existing task-planner agent
        const agent = taskPlannerAgents[0];
        this.logger.info(`Using existing task-planner agent: ${agent.id.id}`);
        
        const planningResult = await this.executePlanningWithAgentManager(agent.id.id, request);
        
        return {
          success: true,
          taskMarkdown: planningResult,
          agentUsed: agent.id.id,
          plannerType: 'task-planner'
        };
      }
    } catch (error) {
      this.logger.warn(`AgentManager planning failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        plannerType: 'fallback'
      };
    }
  }

  /**
   * Execute planning task using AgentManager infrastructure
   */
  private async executePlanningWithAgentManager(agentId: string, request: PlannerRequest): Promise<string> {
    const planningPrompt = this.createPlanningPrompt(request);
    
    // Use AgentManager's task execution capabilities
    const task = {
      id: `planning-${request.featureName}-${Date.now()}`,
      type: 'task-planning',
      description: `Generate implementation tasks for ${request.featureName}`,
      input: {
        featureName: request.featureName,
        designContent: request.designContent,
        requirements: request.requirements || '',
        prompt: planningPrompt
      },
      priority: 90,
      metadata: {
        type: 'maestro_task_planning',
        featureName: request.featureName
      }
    };

    // Execute through AgentManager
    const result = await this.agentManager!.executeTask(agentId, task);
    
    if (result && result.output) {
      return this.formatAgentManagerResult(result.output, request.featureName);
    }
    
    return this.createFallbackTaskPlan(request.featureName);
  }

  /**
   * Create structured planning prompt for AgentManager agents
   */
  private createPlanningPrompt(request: PlannerRequest): string {
    return `
# Task Planning Request

## Feature: ${request.featureName}

## Design Content:
${request.designContent}

${request.requirements ? `## Requirements:\n${request.requirements}\n` : ''}
## Instructions:
Generate a comprehensive implementation task breakdown following these guidelines:

1. Create 5-10 specific, actionable tasks
2. Order tasks by dependency and logical sequence
3. Include acceptance criteria for each task
4. Focus on implementation details from the design
5. Consider testing, documentation, and deployment

## Output Format:
Provide structured markdown with:
- Task titles and descriptions
- Acceptance criteria as checkboxes
- Implementation notes and dependencies

Generate the task breakdown now:
`;
  }

  /**
   * Format AgentManager result into consistent markdown
   */
  private formatAgentManagerResult(output: any, featureName: string): string {
    if (typeof output === 'string' && output.includes('# Implementation Tasks')) {
      return output;
    }

    // Extract structured content if available
    if (output && output.tasks) {
      return this.createStructuredTaskMarkdown(featureName, output.tasks, 'AgentManager task-planner');
    }

    return this.createFallbackTaskPlan(featureName);
  }

  /**
   * Find the best available hive mind agent for task planning (fallback)
   * Prioritizes: architect > specialist > any available
   */
  private async findBestHiveMindAgent(designContent: string): Promise<Agent | null> {
    const agents = await this.hiveMind.getAgents();
    const availableAgents = agents.filter(agent => agent.status === 'idle');

    if (availableAgents.length === 0) {
      this.logger.warn('No idle agents available for task planning');
      return null;
    }

    // Priority 1: Look for architect agents (best for system design planning)
    const architects = availableAgents.filter(agent => agent.type === 'architect');
    if (architects.length > 0) {
      this.logger.info(`Found ${architects.length} available architect agent(s) for planning`);
      return architects[0]; // Return first available architect
    }

    // Priority 2: Look for specialist agents with relevant capabilities
    const specialists = availableAgents.filter(agent => 
      agent.type === 'specialist' && 
      this.hasRelevantCapabilities(agent, designContent)
    );
    if (specialists.length > 0) {
      this.logger.info(`Found ${specialists.length} relevant specialist agent(s) for planning`);
      return specialists[0];
    }

    // Priority 3: Use any available specialist
    const anySpecialists = availableAgents.filter(agent => agent.type === 'specialist');
    if (anySpecialists.length > 0) {
      this.logger.info(`Using available specialist agent for planning`);
      return anySpecialists[0];
    }

    // Priority 4: Use any available agent as fallback
    this.logger.info(`Using fallback agent for planning: ${availableAgents[0].type}`);
    return availableAgents[0];
  }

  /**
   * Check if agent has capabilities relevant to the design content
   */
  private hasRelevantCapabilities(agent: Agent, designContent: string): boolean {
    const capabilities = agent.capabilities || [];
    
    // Check for system design capabilities
    if (capabilities.includes('system_design' as AgentCapability) || 
        capabilities.includes('architecture_patterns' as AgentCapability)) {
      return true;
    }

    // Check for task management capabilities
    if (capabilities.includes('task_management' as AgentCapability)) {
      return true;
    }

    // Check for domain expertise based on design content
    const hasDatabase = /database|sql|storage/i.test(designContent);
    const hasAPI = /api|endpoint|rest/i.test(designContent);
    const hasAuth = /auth|security|permission/i.test(designContent);

    if (hasDatabase && capabilities.includes('data_analysis' as AgentCapability)) {
      return true;
    }

    if (hasAPI && capabilities.includes('integration_planning' as AgentCapability)) {
      return true;
    }

    return false;
  }

  /**
   * Get required capabilities based on agent type
   */
  private getRequiredCapabilities(agentType: string): AgentCapability[] {
    switch (agentType) {
      case 'architect':
        return ['system_design', 'architecture_patterns', 'integration_planning'];
      case 'specialist':
        return ['domain_expertise', 'problem_solving', 'task_management'];
      default:
        return ['task_management', 'information_gathering'];
    }
  }

  /**
   * Wait for planning task completion with timeout
   */
  private async waitForPlanningCompletion(taskId: string, timeoutMs: number): Promise<{
    success: boolean;
    taskMarkdown?: string;
    error?: string;
  }> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkInterval = setInterval(async () => {
        try {
          // Check timeout
          if (Date.now() - startTime > timeoutMs) {
            clearInterval(checkInterval);
            resolve({ success: false, error: 'Planning task timeout' });
            return;
          }

          // Check task status
          const task = await this.hiveMind.getTask(taskId);
          
          if (task.status === 'completed') {
            clearInterval(checkInterval);
            
            try {
              const result = task.result ? JSON.parse(task.result) : null;
              const taskMarkdown = this.formatPlanningResult(result, task.metadata);
              resolve({ success: true, taskMarkdown });
            } catch (parseError) {
              resolve({ success: false, error: 'Failed to parse planning result' });
            }
            
          } else if (task.status === 'failed') {
            clearInterval(checkInterval);
            resolve({ success: false, error: task.error || 'Planning task failed' });
          }
          
        } catch (error) {
          clearInterval(checkInterval);
          resolve({ success: false, error: error instanceof Error ? error.message : String(error) });
        }
      }, 3000); // Check every 3 seconds
    });
  }

  /**
   * Format planning result into structured markdown
   */
  private formatPlanningResult(result: any, metadata: any): string {
    const featureName = metadata?.featureName || 'Feature';
    const plannerType = metadata?.plannerType || 'agent';

    // If the result already contains structured markdown, use it
    if (result && typeof result === 'string' && result.includes('# Implementation Tasks')) {
      return result;
    }

    // If result contains task breakdown, format it
    if (result && result.tasks) {
      return this.createTaskMarkdown(featureName, result.tasks, plannerType);
    }

    // Create basic task structure from agent analysis
    return this.createBasicTaskMarkdown(featureName, result, plannerType);
  }

  /**
   * Create structured task markdown from AgentManager or hive mind results
   */
  private createStructuredTaskMarkdown(featureName: string, tasks: any[], plannerType: string): string {
    let markdown = `# Implementation Tasks for ${featureName}\n\n`;
    markdown += `*Generated by ${plannerType} agent*\n\n`;

    if (Array.isArray(tasks)) {
      tasks.forEach((task, index) => {
        markdown += `## Task ${index + 1}: ${task.title || task.name || `Task ${index + 1}`}\n\n`;
        if (task.description) {
          markdown += `${task.description}\n\n`;
        }
        if (task.acceptance && Array.isArray(task.acceptance)) {
          markdown += `**Acceptance Criteria:**\n`;
          task.acceptance.forEach(criteria => {
            markdown += `- [ ] ${criteria}\n`;
          });
          markdown += '\n';
        }
        if (task.dependencies) {
          markdown += `**Dependencies:** ${task.dependencies}\n\n`;
        }
      });
    }

    return markdown;
  }

  /**
   * Create structured task breakdown from detailed result (legacy method)
   */
  private createTaskMarkdown(featureName: string, tasks: any[], plannerType: string): string {
    let markdown = `# Implementation Tasks for ${featureName}\n\n`;
    markdown += `*Generated by hive mind ${plannerType} agent*\n\n`;

    if (Array.isArray(tasks)) {
      tasks.forEach((task, index) => {
        markdown += `## Task ${index + 1}: ${task.title || `Task ${index + 1}`}\n\n`;
        if (task.description) {
          markdown += `${task.description}\n\n`;
        }
        if (task.acceptance && Array.isArray(task.acceptance)) {
          markdown += `**Acceptance Criteria:**\n`;
          task.acceptance.forEach(criteria => {
            markdown += `- [ ] ${criteria}\n`;
          });
          markdown += '\n';
        }
      });
    }

    return markdown;
  }

  /**
   * Create fallback task plan when agents unavailable
   */
  private createFallbackTaskPlan(featureName: string): string {
    const basicTasks = [
      'Set up project structure and dependencies',
      'Implement core data models and interfaces', 
      'Create API endpoints and routing',
      'Implement business logic and validation',
      'Add comprehensive testing suite',
      'Create documentation and examples',
      'Integration testing and deployment preparation'
    ];

    let markdown = `# Implementation Tasks for ${featureName}\n\n`;
    markdown += `*Generated by fallback task generation*\n\n`;
    markdown += `## Task Breakdown\n\n`;
    
    basicTasks.forEach((task, index) => {
      markdown += `### ${index + 1}. ${task}\n\n`;
      markdown += `**Status**: Pending\n\n`;
      markdown += `**Acceptance Criteria:**\n`;
      markdown += `- [ ] Task completed successfully\n`;
      markdown += `- [ ] Code reviewed and tested\n\n`;
    });

    return markdown;
  }

  /**
   * Create basic task markdown from simple result (legacy method)
   */
  private createBasicTaskMarkdown(featureName: string, result: any, plannerType: string): string {
    const basicTasks = [
      'Set up project structure and dependencies',
      'Implement core data models and interfaces', 
      'Create API endpoints and routing',
      'Implement business logic and validation',
      'Add comprehensive testing suite',
      'Create documentation and examples',
      'Integration testing and deployment preparation'
    ];

    let markdown = `# Implementation Tasks for ${featureName}\n\n`;
    markdown += `*Generated by hive mind ${plannerType} agent*\n\n`;

    if (result && result.analysis) {
      markdown += `## Analysis\n\n${result.analysis}\n\n`;
    }

    markdown += `## Task Breakdown\n\n`;
    basicTasks.forEach((task, index) => {
      markdown += `### ${index + 1}. ${task}\n\n`;
      markdown += `**Status**: Pending\n\n`;
    });

    if (result && result.recommendations) {
      markdown += `## Recommendations\n\n${result.recommendations}\n\n`;
    }

    return markdown;
  }

  /**
   * Get status of integrated planning service
   */
  async getStatus(): Promise<{
    availableTaskPlanners: number;
    availableArchitects: number;
    availableSpecialists: number;
    totalAgents: number;
    agentManagerAvailable: boolean;
    agentRegistryAvailable: boolean;
  }> {
    try {
      let taskPlanners = 0;
      let agentManagerAvailable = false;
      let agentRegistryAvailable = false;

      // Check AgentManager system
      if (this.agentManager && this.agentRegistry) {
        try {
          const taskPlannerAgents = await this.agentRegistry.queryAgents({
            type: 'task-planner' as any,
            status: 'idle'
          });
          taskPlanners = taskPlannerAgents.length;
          agentManagerAvailable = true;
          agentRegistryAvailable = true;
        } catch (error) {
          this.logger.warn(`AgentRegistry query failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      // Check hive mind agents
      const agents = await this.hiveMind.getAgents();
      const idleAgents = agents.filter(agent => agent.status === 'idle');
      
      return {
        availableTaskPlanners: taskPlanners,
        availableArchitects: idleAgents.filter(a => a.type === 'architect').length,
        availableSpecialists: idleAgents.filter(a => a.type === 'specialist').length,
        totalAgents: agents.length + taskPlanners,
        agentManagerAvailable,
        agentRegistryAvailable
      };
    } catch (error) {
      this.logger.error(`Failed to get planner service status: ${error instanceof Error ? error.message : String(error)}`);
      return { 
        availableTaskPlanners: 0,
        availableArchitects: 0, 
        availableSpecialists: 0, 
        totalAgents: 0,
        agentManagerAvailable: false,
        agentRegistryAvailable: false
      };
    }
  }

  /**
   * Factory method to create service with AgentManager integration
   */
  static createWithAgentManager(
    hiveMind: HiveMind,
    logger: ILogger,
    agentManager: AgentManager,
    agentRegistry: AgentRegistry
  ): HiveMindPlannerService {
    return new HiveMindPlannerService(hiveMind, logger, agentManager, agentRegistry);
  }
}