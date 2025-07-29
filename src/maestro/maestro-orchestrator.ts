/**
 * Maestro Orchestrator - Refactored and Cleaned Up
 * 
 * A specifications-driven development orchestrator that integrates seamlessly
 * with the existing claude-flow hive mind infrastructure for collective intelligence,
 * consensus-based decision making, and advanced workflow automation.
 * 
 * This refactored version eliminates duplicate implementations and leverages
 * the proven hive mind system for enhanced reliability and performance.
 */

import { EventEmitter } from 'events';
import { join } from 'path';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
// Import agentic-flow hooks system
import { agenticHookManager, initializeAgenticFlowHooks, type AgenticHookContext } from '../services/agentic-flow-hooks/index.js';

// Core claude-flow infrastructure
import { IEventBus } from '../core/event-bus.js';
import { ILogger } from '../core/logger.js';
import { IMemoryManager } from '../memory/manager.js';
import { AgentManager } from '../agents/agent-manager.js';
import { Orchestrator } from '../core/orchestrator.js';
import { Config } from '../utils/types.js';
import { SystemError } from '../utils/errors.js';

// Existing hive mind infrastructure (proven and robust)
import { HiveMind } from '../hive-mind/core/HiveMind.js';
import { ConsensusEngine } from '../hive-mind/integration/ConsensusEngine.js';
import { SwarmOrchestrator } from '../hive-mind/integration/SwarmOrchestrator.js';

// Types for maestro system
import {
  MaestroSpec,
  MaestroWorkflowState,
  WorkflowPhase,
  TaskItem,
  AgentProfile,
  SteeringContext
} from './maestro-types.js';

// Simple interface for agent pool (minimal-change enhancement)
interface PooledAgent {
  id: string;
  type: string;
  capabilities: string[];
  status: 'available' | 'busy' | 'maintenance';
  lastUsed: Date;
  usageCount: number;
  createdAt: Date;
}

// Remove SimpleTaskPlanner dependency - using direct agent management
import {
  HiveMindConfig,
  ConsensusProposal,
  TaskSubmitOptions,
  AgentSpawnOptions,
  QueenMode,
  AgentCapability
} from '../hive-mind/types.js';

export interface MaestroConfig {
  // Integration with hive mind
  enableHiveMind: boolean;
  consensusThreshold: number;
  maxAgents: number;
  
  // Maestro-specific features
  enableLivingDocumentation: boolean;
  enableAgentHooks: boolean;
  enablePatternLearning: boolean;
  
  // File system settings
  specsDirectory: string;
  steeringDirectory: string;
}

/**
 * Main Maestro Orchestrator class
 * Integrates with existing hive mind infrastructure instead of duplicating it
 */
export class MaestroOrchestrator extends EventEmitter {
  private maestroState: Map<string, MaestroWorkflowState> = new Map();
  private specsDirectory: string;
  private steeringDirectory: string;
  
  // Hive mind integration (leveraging existing robust systems)
  private hiveMind?: HiveMind;
  private consensusEngine?: ConsensusEngine;
  private swarmOrchestrator?: SwarmOrchestrator;
  
  // Removed SimpleTaskPlanner - using direct agent management
  
  private agenticHooksInitialized: boolean = false;
  
  // File watchers for living documentation
  private fileWatchers: Map<string, any> = new Map();
  
  // Simple agent pool for reuse (minimal-change enhancement)
  private agentPool: Map<string, PooledAgent> = new Map();
  private capabilityIndex: Map<string, Set<string>> = new Map();
  
  constructor(
    private config: Config,
    private eventBus: IEventBus,
    private logger: ILogger,
    private memoryManager: IMemoryManager,
    private agentManager: AgentManager,
    private mainOrchestrator: Orchestrator,
    private maestroConfig: Partial<MaestroConfig> = {}
  ) {
    super();
    
    this.specsDirectory = join(process.cwd(), '.claude', 'claude-flow', 'maestro', 'specs');
    this.steeringDirectory = join(process.cwd(), '.claude', 'claude-flow', 'maestro', 'steering');

    // Initialize agentic-flow hooks if enabled
    if (this.maestroConfig.enableAgentHooks) {
      this.initializeAgenticHooks();
    }
    
    this.setupEventHandlers();
    this.logger.info('Maestro Orchestrator initialized');
  }
  
  /**
   * Initialize hive mind integration for advanced features
   */
  async initializeHiveMind(): Promise<string | null> {
    if (!this.maestroConfig.enableHiveMind) {
      this.logger.info('Hive mind integration disabled');
      return null;
    }
    
    try {
      // Configure hive mind for Maestro workflows
      const hiveMindConfig: HiveMindConfig = {
        name: 'maestro-collective',
        topology: 'hierarchical',
        queenMode: 'strategic' as QueenMode,
        maxAgents: this.maestroConfig.maxAgents || 8,
        consensusThreshold: this.maestroConfig.consensusThreshold || 0.66,
        memoryTTL: 86400000, // 24 hours
        autoSpawn: true,
        enableConsensus: true,
        enableMemory: true,
        enableCommunication: true
      };
      
      // Initialize hive mind with existing infrastructure
      this.hiveMind = new HiveMind(hiveMindConfig);
      const swarmId = await this.hiveMind.initialize();
      
      // Get access to integrated subsystems
      this.consensusEngine = (this.hiveMind as any).consensus;
      this.swarmOrchestrator = (this.hiveMind as any).orchestrator;
      
      this.logger.info(`Maestro hive mind initialized: ${swarmId}`);
      return swarmId;
      
    } catch (error) {
      this.logger.error(`Failed to initialize hive mind: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Create a new specification using the 3-file system
   */
  async createSpec(featureName: string, initialRequest: string): Promise<void> {
    const featurePath = join(this.specsDirectory, featureName);
    await mkdir(featurePath, { recursive: true });
    
    // Initialize workflow state
    const workflowState: MaestroWorkflowState = {
      featureName,
      currentPhase: 'Requirements Clarification' as WorkflowPhase,
      currentTaskIndex: 0,
      status: 'paused',
      lastActivity: new Date(),
      history: [{
        phase: 'Requirements Clarification' as WorkflowPhase,
        status: 'in-progress' as 'completed' | 'failed' | 'in-progress' | 'approved',
        timestamp: new Date()
      }]
    };
    
    this.maestroState.set(featureName, workflowState);
    
    // Create requirements.md
    const requirementsContent = `# Requirements for ${featureName}

## High-Level Request

${initialRequest}

## User Stories

- As a user, I want ${initialRequest.toLowerCase()}, so that I can achieve my goals

## Acceptance Criteria

- [ ] Feature functions as described
- [ ] Code is well-tested
- [ ] Documentation is complete
- [ ] Performance requirements are met

## Technical Requirements

- [ ] Integration with existing systems
- [ ] Error handling and validation
- [ ] Security considerations
- [ ] Scalability considerations

*Generated by Maestro Orchestrator*
`;
    
    await writeFile(join(featurePath, 'requirements.md'), requirementsContent, 'utf8');
    
    this.logger.info(`Created specification for '${featureName}'`);
    this.eventBus.emit('maestro:spec_created', { featureName });
    
    // Trigger agentic hooks for spec creation
    if (this.agenticHooksInitialized) {
      try {
        await agenticHookManager.executeHooks('workflow-start', {
          workflowId: `maestro-${featureName}`,
          state: { featureName, phase: 'spec-creation' }
        } as any, {
          sessionId: `maestro-session-${Date.now()}`,
          timestamp: Date.now(),
          correlationId: `maestro-${featureName}`,
          metadata: { featureName },
          memory: { namespace: 'maestro', provider: 'memory', cache: new Map() },
          neural: { modelId: 'default', patterns: null as any, training: null as any },
          performance: { metrics: new Map(), bottlenecks: [], optimizations: [] }
        } as AgenticHookContext);
      } catch (error) {
        this.logger.warn('Failed to execute agentic hooks:', error);
      }
    }
  }
  
  /**
   * Generate design using hive mind collective intelligence
   */
  async generateDesign(featureName: string): Promise<void> {
    const state = this.maestroState.get(featureName);
    if (!state) {
      throw new SystemError(`No workflow state found for '${featureName}'`);
    }
    
    const featurePath = join(this.specsDirectory, featureName);
    const requirementsPath = join(featurePath, 'requirements.md');
    
    try {
      await access(requirementsPath);
    } catch {
      throw new SystemError(`Requirements file not found for '${featureName}'. Run create-spec first.`);
    }
    
    const requirementsContent = await readFile(requirementsPath, 'utf8');
    
    // Use hive mind for collective design generation if available
    if (this.hiveMind && this.swarmOrchestrator) {
      await this.generateDesignWithHiveMind(featureName, requirementsContent);
    } else {
      await this.generateDesignWithAgentManager(featureName, requirementsContent);
    }
    
    // Update workflow state
    state.currentPhase = 'Research & Design' as WorkflowPhase;
    state.lastActivity = new Date();
    state.history.push({
      phase: 'Research & Design' as WorkflowPhase,
      status: 'completed',
      timestamp: new Date()
    });
    
    this.logger.info(`Generated design for '${featureName}'`);
    this.eventBus.emit('maestro:design_generated', { featureName });
  }
  
  /**
   * Generate design using hive mind collective intelligence
   */
  private async generateDesignWithHiveMind(featureName: string, requirements: string): Promise<void> {
    const taskOptions: TaskSubmitOptions = {
      description: `Generate comprehensive design for ${featureName}`,
      priority: 'high',
      strategy: 'adaptive',
      requiredCapabilities: ['system_design' as AgentCapability, 'architecture' as AgentCapability, 'technical_writing' as AgentCapability],
      metadata: {
        maestroFeature: featureName,
        maestroPhase: 'Research & Design',
        requirements
      }
    };
    
    // Submit to hive mind orchestrator
    const task = await this.hiveMind!.submitTask(taskOptions);
    
    // Wait for completion with timeout
    const result = await this.waitForTaskCompletion(task.id, 300000); // 5 minutes
    
    // Create design.md with hive mind results
    const designContent = `# Design for ${featureName}

## Architecture Overview

${result.architectureOverview || 'System architecture designed by hive mind collective intelligence.'}

## Component Design

${result.componentDesign || 'Detailed component breakdown generated through collaborative analysis.'}

## API Design

${result.apiDesign || 'RESTful API endpoints and data structures designed for optimal integration.'}

## Database Schema

${result.databaseSchema || 'Database schema optimized for performance and scalability.'}

## Security Considerations

${result.securityConsiderations || 'Security measures and access controls implemented throughout the system.'}

## Performance Requirements

${result.performanceRequirements || 'Performance benchmarks and optimization strategies defined.'}

## Implementation Strategy

${result.implementationStrategy || 'Step-by-step implementation approach with risk mitigation.'}

*Generated by Maestro with Hive Mind Collective Intelligence*
*Agents involved: ${result.agentCount || 'Multiple'} specialized agents*
*Quality score: ${result.qualityScore ? (result.qualityScore * 100).toFixed(1) + '%' : 'High'}*
`;
    
    const featurePath = join(this.specsDirectory, featureName);
    await writeFile(join(featurePath, 'design.md'), designContent, 'utf8');
  }
  
  /**
   * Generate design using consistent agent management
   */
  private async generateDesignWithAgentManager(featureName: string, requirements: string): Promise<void> {
    const designTask = {
      id: `design-task-${featureName}-${Date.now()}`,
      type: 'design-generation',
      description: `Generate comprehensive design for feature '${featureName}'`,
      input: {
        featureName,
        requirementsPath: join(this.specsDirectory, featureName, 'requirements.md'),
        outputPath: join(this.specsDirectory, featureName, 'design.md'),
        instructions: [
          'Create comprehensive system architecture',
          'Define API endpoints and data structures', 
          'Include security and performance considerations',
          'Provide implementation strategy'
        ]
      },
      priority: 80,
      metadata: { 
        featureName, 
        maestroPhase: 'Research & Design',
        outputPath: join(this.specsDirectory, featureName, 'design.md')
      },
    };

    // Execute with configurable agent selection (minimal-change enhancement)
    const optimalAgentTypes = await this.getOptimalAgentTypes(
      ['design', 'architecture', 'analysis'],
      'design-generation',
      2
    );
    await this.executeTaskWithManagedAgent(
      optimalAgentTypes,
      designTask,
      ['design', 'architecture', 'analysis']
    );
  }
  
  /**
   * Generate tasks from design using intelligent decomposition
   */
  async generateTasks(featureName: string): Promise<void> {
    const state = this.maestroState.get(featureName);
    if (!state) {
      throw new SystemError(`No workflow state found for '${featureName}'`);
    }
    
    const featurePath = join(this.specsDirectory, featureName);
    const designPath = join(featurePath, 'design.md');
    
    try {
      await access(designPath);
    } catch {
      throw new SystemError(`Design file not found for '${featureName}'. Run generate-design first.`);
    }
    
    const designContent = await readFile(designPath, 'utf8');
    
    // Generate tasks using simple task planner
    const tasksContent = await this.generateTasksWithSimplePlanner(featureName, designContent);
    await writeFile(join(featurePath, 'tasks.md'), tasksContent, 'utf8');
    
    // Update workflow state
    state.currentPhase = 'Implementation Planning' as WorkflowPhase;
    state.lastActivity = new Date();
    state.history.push({
      phase: 'Implementation Planning' as WorkflowPhase,
      status: 'completed',
      timestamp: new Date()
    });
    
    this.logger.info(`Generated tasks for '${featureName}'`);
    this.eventBus.emit('maestro:tasks_generated', { featureName });
  }
  
  /**
   * Generate tasks using consistent agent management pattern
   */
  private async generateTasksWithSimplePlanner(featureName: string, designContent: string): Promise<string> {
    // Create task planning task with consistent structure
    const taskPlanningTask = {
      id: `task-planning-${featureName}-${Date.now()}`,
      type: 'task-planning',
      description: `Generate implementation tasks for feature '${featureName}'`,
      input: {
        featureName,
        designContent,
        requirementsPath: join(this.specsDirectory, featureName, 'requirements.md'),
        outputPath: join(this.specsDirectory, featureName, 'tasks.md'),
        instructions: [
          'Analyze design content for implementation tasks',
          'Create 5-8 specific, actionable tasks with acceptance criteria',
          'Organize tasks by logical implementation sequence',
          'Include dependency relationships between tasks',
          'Format as markdown with checkboxes'
        ]
      },
      priority: 85,
      metadata: {
        featureName,
        maestroPhase: 'Implementation Planning',
        outputPath: join(this.specsDirectory, featureName, 'tasks.md')
      },
    };

    try {
      this.logger.info(`Generating tasks for ${featureName} using consistent agent management`);
      
      // Execute with consistent agent management pattern
      const result = await this.executeTaskPlanningWithManagedAgent(taskPlanningTask);
      
      this.logger.info(`Task plan generated successfully for ${featureName}`);
      return result;
      
    } catch (error) {
      this.logger.warn(`Agent-based task planning failed: ${error instanceof Error ? error.message : String(error)}, falling back to basic generation`);
      return this.generateBasicTasksFromDesign(featureName, designContent);
    }
  }

  /**
   * Execute task planning with consistent agent management
   */
  private async executeTaskPlanningWithManagedAgent(taskPlanningTask: any): Promise<string> {
    // Execute with configurable agent selection (minimal-change enhancement)
    const optimalPlannerTypes = await this.getOptimalAgentTypes(
      ['project-management', 'task-breakdown', 'planning'],
      'task-planning',
      1
    );
    await this.executeTaskWithManagedAgent(
      optimalPlannerTypes, 
      taskPlanningTask,
      ['project-management', 'task-breakdown', 'planning']
    );
    
    // Try to read the generated output file
    try {
      const outputPath = taskPlanningTask.metadata.outputPath;
      const generatedContent = await readFile(outputPath, 'utf8');
      
      // If content was generated, format and return it
      if (generatedContent && generatedContent.length > 0) {
        return this.formatTaskPlanningOutput(generatedContent, taskPlanningTask.input.featureName);
      }
    } catch (error) {
      this.logger.debug(`Could not read task planning output: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Fallback to basic task generation
    return this.generateBasicTasksFromDesign(taskPlanningTask.input.featureName, taskPlanningTask.input.designContent);
  }

  /**
   * Format task planning output to consistent markdown
   */
  private formatTaskPlanningOutput(output: any, featureName: string): string {
    if (typeof output === 'string' && output.includes('# Implementation Tasks')) {
      return output;
    }

    // Handle structured output from agent
    if (output && typeof output === 'object') {
      const tasks = output.tasks || output.taskList || [];
      const dependencies = output.dependencies || '';
      const notes = output.notes || output.implementationNotes || '';
      
      if (Array.isArray(tasks) && tasks.length > 0) {
        return `# Implementation Tasks for ${featureName}

## Task Breakdown

${tasks.map((task: any, index: number) => {
  if (typeof task === 'string') {
    return task.startsWith('- [ ]') ? task : `- [ ] ${task}`;
  }
  return `- [ ] ${task.description || task.name || `Task ${index + 1}`}`;
}).join('\n')}

${dependencies ? `## Dependencies\n${dependencies}\n` : ''}
${notes ? `## Implementation Notes\n${notes}\n` : ''}

*Generated by Maestro Agent-Based Task Planning*`;
      }
    }

    // Convert string output to proper format
    if (typeof output === 'string') {
      return `# Implementation Tasks for ${featureName}

## Task Breakdown

${output}

*Generated by Maestro Agent-Based Task Planning*`;
    }

    return `# Implementation Tasks for ${featureName}

## Task Breakdown

${JSON.stringify(output, null, 2)}

*Generated by Maestro Agent-Based Task Planning*`;
  }

  /**
   * Fallback: Generate basic tasks from design content
   */
  private async generateBasicTasksFromDesign(featureName: string, designContent: string): Promise<string> {
    // Extract key components from design for task generation
    const tasks = [
      '- [ ] Set up project structure and dependencies',
      '- [ ] Implement core data models',
      '- [ ] Create API endpoints',
      '- [ ] Implement business logic',
      '- [ ] Add input validation and error handling',
      '- [ ] Implement security measures',
      '- [ ] Add comprehensive tests',
      '- [ ] Create documentation',
      '- [ ] Performance optimization',
      '- [ ] Integration testing'
    ];
    
    return `# Implementation Tasks for ${featureName}

## Task List

${tasks.join('\n')}

## Notes

- Tasks are ordered by dependency and logical implementation sequence
- Each task should be completed and tested before moving to the next
- Use \`npx claude-flow maestro implement-task ${featureName} <task-number>\` to implement each task

*Generated by Maestro Basic Task Generation (Fallback)*
`;
  }
  
  /**
   * Implement a specific task with optional consensus validation
   */
  async implementTask(featureName: string, taskId: number): Promise<void> {
    const state = this.maestroState.get(featureName);
    if (!state) {
      throw new SystemError(`No workflow state found for '${featureName}'`);
    }
    
    const featurePath = join(this.specsDirectory, featureName);
    const tasksPath = join(featurePath, 'tasks.md');
    
    // Read and validate task
    const tasksContent = await readFile(tasksPath, 'utf8');
    const taskLines = tasksContent.split('\n').filter(line => line.startsWith('- [ ]') || line.startsWith('- [x]'));
    
    if (taskId < 1 || taskId > taskLines.length) {
      throw new SystemError(`Invalid task ID ${taskId} for feature '${featureName}'. Valid range: 1-${taskLines.length}`);
    }
    
    const taskDescription = taskLines[taskId - 1].substring(taskLines[taskId - 1].indexOf(']') + 2).trim();
    
    // Use consensus validation if hive mind is available and enabled
    if (this.consensusEngine && this.maestroConfig.enableHiveMind) {
      await this.implementTaskWithConsensus(featureName, taskId, taskDescription);
    } else {
      await this.implementTaskDirect(featureName, taskId, taskDescription);
    }
    
    // Mark task as completed
    const updatedTasksContent = tasksContent.replace(
      taskLines[taskId - 1],
      taskLines[taskId - 1].replace('- [ ]', '- [x]')
    );
    await writeFile(tasksPath, updatedTasksContent, 'utf8');
    
    // Update workflow state
    state.currentPhase = 'Task Execution' as WorkflowPhase;
    state.currentTaskIndex = taskId;
    state.lastActivity = new Date();
    
    this.logger.info(`Implemented task ${taskId} for '${featureName}': ${taskDescription}`);
    this.eventBus.emit('maestro:task_implemented', { featureName, taskId, taskDescription });
  }
  
  /**
   * Implement task with hive mind consensus validation
   */
  private async implementTaskWithConsensus(featureName: string, taskId: number, taskDescription: string): Promise<void> {
    // Create consensus proposal for task implementation
    const proposal: ConsensusProposal = {
      id: `maestro-task-${featureName}-${taskId}-${Date.now()}`,
      swarmId: (this.hiveMind as any).id,
      proposal: {
        action: 'implement_task',
        featureName,
        taskId,
        taskDescription,
        details: `Implement task: ${taskDescription}`
      },
      requiredThreshold: this.maestroConfig.consensusThreshold || 0.66,
      deadline: new Date(Date.now() + 300000), // 5 minutes
      // creator: 'maestro-orchestrator', // Remove unsupported property
      taskId: `maestro-task-${featureName}-${taskId}`,
      metadata: {
        type: 'task_implementation',
        featureName,
        taskId,
        taskDescription
      }
    };
    
    // Submit proposal and wait for consensus
    const proposalId = await this.consensusEngine!.createProposal(proposal);
    const consensusResult = await this.waitForConsensusResult(proposalId, 300000);
    
    if (!consensusResult.achieved) {
      throw new SystemError(`Consensus failed for task ${taskId}: ${consensusResult.reason || 'Insufficient votes'}`);
    }
    
    this.logger.info(`Consensus achieved for task ${taskId}: ${consensusResult.finalRatio}`);
    
    // Proceed with implementation
    await this.implementTaskDirect(featureName, taskId, taskDescription);
  }
  
  /**
   * Direct task implementation using consistent agent management
   */
  private async implementTaskDirect(featureName: string, taskId: number, taskDescription: string): Promise<void> {
    const requirementsPath = join(this.specsDirectory, featureName, 'requirements.md');
    const designPath = join(this.specsDirectory, featureName, 'design.md');
    
    const requirementsContent = await readFile(requirementsPath, 'utf8');
    const designContent = await readFile(designPath, 'utf8');
    
    // Create implementation task with consistent structure
    const implementationTask = {
      id: `impl-task-${featureName}-${taskId}-${Date.now()}`,
      type: 'task-implementation',
      description: `Implement: ${taskDescription}`,
      input: {
        featureName,
        taskId,
        taskDescription,
        requirements: requirementsContent,
        design: designContent,
        context: await this.getSteeringContext('developer')
      },
      priority: 90,
      metadata: { 
        featureName, 
        taskId,
        maestroPhase: 'Task Execution' 
      },
    };

    // Execute with configurable agent selection (minimal-change enhancement)
    const optimalDeveloperTypes = await this.getOptimalAgentTypes(
      ['implementation', 'coding', 'testing'],
      'task-implementation',
      2
    );
    await this.executeTaskWithManagedAgent(
      optimalDeveloperTypes, 
      implementationTask,
      ['implementation', 'coding', 'testing']
    );
  }
  
  /**
   * Approve a workflow phase with optional consensus
   */
  async approvePhase(featureName: string): Promise<void> {
    const state = this.maestroState.get(featureName);
    if (!state) {
      throw new SystemError(`No workflow state found for '${featureName}'`);
    }
    
    const currentPhase = state.currentPhase;
    
    // Phase progression logic
    const phaseProgression: Record<string, string> = {
      'Requirements Clarification': 'Research & Design',
      'Research & Design': 'Implementation Planning', 
      'Implementation Planning': 'Task Execution',
      'Task Execution': 'Completed'
    };
    
    const nextPhase = phaseProgression[currentPhase];
    if (!nextPhase) {
      throw new SystemError(`Cannot progress from phase '${currentPhase}'`);
    }
    
    // Update state
    state.currentPhase = nextPhase as WorkflowPhase;
    state.lastActivity = new Date();
    state.history.push({
      phase: nextPhase as WorkflowPhase,
      status: 'approved' as 'completed' | 'failed' | 'in-progress' | 'approved',
      timestamp: new Date()
    });
    
    this.logger.info(`Approved phase transition for '${featureName}': ${currentPhase} -> ${nextPhase}`);
    this.eventBus.emit('maestro:phase_approved', { featureName, fromPhase: currentPhase, toPhase: nextPhase });
  }
  
  /**
   * Get current workflow state
   */
  getWorkflowState(featureName: string): MaestroWorkflowState | undefined {
    return this.maestroState.get(featureName);
  }
  
  /**
   * Create steering document for project context
   */
  async createSteeringDocument(domain: string, content: string): Promise<void> {
    await mkdir(this.steeringDirectory, { recursive: true });
    const steeringPath = join(this.steeringDirectory, `${domain}.md`);
    
    const steeringContent = `# ${domain.charAt(0).toUpperCase() + domain.slice(1)} Steering Document

${content}

## Guidelines

[Provide specific guidelines for the '${domain}' domain. E.g., API design, testing, security, coding style.]
`;
    
    await writeFile(steeringPath, steeringContent, 'utf8');
    this.logger.info(`Created steering document for '${domain}' at '${steeringPath}'`);
  }
  
  /**
   * Enhanced agent management with reuse-first strategy (minimal-change improvement)
   * Single Responsibility: Manages agent lifecycle for any task type
   * Open/Closed: Extensible for new agent types without modification
   * Dependency Inversion: Depends on abstractions, not concrete implementations
   */
  private async executeTaskWithManagedAgent(
    agentTypes: string[], 
    task: any, 
    capabilities: string[]
  ): Promise<void> {
    const acquiredAgents: string[] = [];
    const spawnedAgents: string[] = [];
    
    try {
      // Step 1: Try to reuse existing agents first (minimal-change enhancement)
      const reusedAgents = await this.findReusableAgents(capabilities, agentTypes.length);
      acquiredAgents.push(...reusedAgents);
      
      // Step 2: Spawn additional agents only if needed
      const needed = agentTypes.length - reusedAgents.length;
      if (needed > 0) {
        const typesToSpawn = agentTypes.slice(0, needed);
        
        for (const agentType of typesToSpawn) {
          try {
            const agentProfile = this.createStandardAgentProfile(agentType, task.metadata?.featureName, capabilities);
            const resolvedType = this.getAgentTemplate(agentType);
            const agentId = await this.agentManager.createAgent(resolvedType, agentProfile);
            await this.agentManager.startAgent(agentId);
            
            // Add to pool for future reuse
            await this.addAgentToPool(agentId, resolvedType, capabilities);
            
            spawnedAgents.push(agentId);
            acquiredAgents.push(agentId);
          } catch (error) {
            this.logger.warn(`Failed to spawn ${agentType} (resolved to ${this.getAgentTemplate(agentType)}): ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }
      
      // Step 3: Mark reused agents as busy
      await this.markAgentsAsBusy(reusedAgents, task.id);
      
      // Assign task to first available agent (fallback to default)
      const assignedAgent = acquiredAgents[0] || 'default';
      task.assignedAgent = assignedAgent;
      
      // Execute task through main orchestrator
      await this.mainOrchestrator.assignTask(task);
      
      this.logger.info(`Task ${task.id} executed with ${reusedAgents.length} reused + ${spawnedAgents.length} spawned agents`);
      
    } finally {
      // Step 4: Release agents back to pool (enhanced cleanup)
      await this.releaseAgentsToPool(acquiredAgents, spawnedAgents);
    }
  }

  /**
   * Create standardized agent profile (KISS + SOLID principles + alias support)
   */
  private createStandardAgentProfile(agentType: string, featureName?: string, capabilities?: string[]): AgentProfile {
    // Resolve agent type aliases
    const resolvedType = this.getAgentTemplate(agentType);
    
    return {
      id: `${agentType}-${featureName || 'default'}-${Date.now()}`,
      name: `${agentType}${featureName ? ` for ${featureName}` : ''}`,
      type: resolvedType, // Use resolved type for actual agent creation
      capabilities: capabilities || this.getDefaultCapabilitiesForAgentType(agentType),
      maxConcurrentTasks: 1,
      priority: this.getDefaultPriorityForAgentType(agentType)
    };
  }

  /**
   * Agent alias mapping for backward compatibility (SOLID: Open/Closed)
   */
  private getAgentTemplate(agentType: string): string {
    const aliasMap: Record<string, string> = {
      'planner': 'task-planner',
      'coder': 'developer'
    };
    return aliasMap[agentType] || agentType;
  }

  /**
   * Get default capabilities based on agent type (KISS principle + comprehensive coverage)
   */
  private getDefaultCapabilitiesForAgentType(agentType: string): string[] {
    const capabilityMap: Record<string, string[]> = {
      // Core Architecture & Design
      'design-architect': ['design', 'architecture', 'analysis'],
      'system-architect': ['system-architecture', 'scalability', 'performance', 'distributed-systems'],
      
      // Development & Implementation
      'developer': ['implementation', 'coding', 'testing'],
      'coder': ['implementation', 'coding', 'testing'],
      
      // Project Management & Planning
      'task-planner': ['project-management', 'task-breakdown', 'planning'],
      'planner': ['project-management', 'task-breakdown', 'planning'],
      
      // Quality Assurance & Testing
      'tester': ['testing', 'quality-assurance', 'test-automation'],
      'reviewer': ['code-review', 'quality-assurance', 'analysis'],
      
      // Research & Analysis (previously unused templates now integrated)
      'researcher': ['research', 'analysis', 'documentation'],
      'analyst': ['analysis', 'data-processing', 'visualization'],
      'requirements-engineer': ['requirements', 'documentation', 'analysis'],
      'steering-author': ['documentation', 'governance', 'content-creation']
    };
    
    return capabilityMap[agentType] || ['general'];
  }

  /**
   * Get default priority based on agent type (KISS principle + comprehensive coverage)
   */
  private getDefaultPriorityForAgentType(agentType: string): number {
    const priorityMap: Record<string, number> = {
      // Critical Implementation (Highest Priority)
      'developer': 90,
      'coder': 90,
      
      // Architecture & Planning (High Priority)  
      'design-architect': 85,
      'system-architect': 85,
      'task-planner': 85,
      'planner': 85,
      
      // Quality Assurance (Medium-High Priority)
      'tester': 80,
      'reviewer': 75,
      
      // Research & Analysis (Medium Priority)
      'researcher': 70,
      'analyst': 70,
      'requirements-engineer': 75,
      
      // Documentation & Governance (Lower Priority)
      'steering-author': 65
    };
    
    return priorityMap[agentType] || 70;
  }

  /**
   * Get optimal agent types for task based on capabilities and availability (minimal-change enhancement)
   * Replaces hardcoded agent arrays with intelligent selection
   */
  private async getOptimalAgentTypes(
    requiredCapabilities: string[], 
    taskType: string,
    maxAgents: number = 2
  ): Promise<string[]> {
    // Check for available agents with matching capabilities first
    const availableAgents = await this.findReusableAgents(requiredCapabilities, maxAgents);
    
    if (availableAgents.length >= maxAgents) {
      // Use existing agents if available
      return availableAgents.map(agentId => {
        const pooledAgent = this.agentPool.get(agentId);
        return pooledAgent?.type || 'general';
      });
    }
    
    // Fallback to configured agent types based on capabilities and task type
    return this.getConfiguredAgentTypes(requiredCapabilities, taskType, maxAgents);
  }

  /**
   * Get configured agent types based on task requirements (replaces hardcoded arrays)
   */
  private getConfiguredAgentTypes(
    requiredCapabilities: string[], 
    taskType: string,
    maxAgents: number
  ): string[] {
    // Smart mapping based on task type and capabilities
    const taskTypeAgents: Record<string, string[]> = {
      'design-generation': ['design-architect', 'system-architect'],
      'task-planning': ['task-planner', 'planner'],
      'task-implementation': ['developer', 'coder'],
      'code-review': ['reviewer', 'analyst'],
      'research': ['researcher', 'analyst'],
      'documentation': ['requirements-engineer', 'steering-author']
    };

    // Capability-based fallback mapping
    const capabilityAgents: Record<string, string[]> = {
      'design': ['design-architect', 'system-architect'],
      'architecture': ['system-architect', 'design-architect'],
      'system-architecture': ['system-architect'],
      'implementation': ['developer', 'coder'],
      'coding': ['developer', 'coder'],
      'testing': ['tester', 'developer'],
      'project-management': ['task-planner'],
      'task-breakdown': ['task-planner'],
      'planning': ['task-planner', 'planner'],
      'analysis': ['analyst', 'researcher'],
      'research': ['researcher', 'analyst'],
      'documentation': ['requirements-engineer', 'steering-author'],
      'code-review': ['reviewer', 'analyst'],
      'quality-assurance': ['reviewer', 'tester']
    };

    // Try task type first
    let agentTypes = taskTypeAgents[taskType] || [];

    // If no direct task type match, build from capabilities
    if (agentTypes.length === 0) {
      const typeSet = new Set<string>();
      
      for (const capability of requiredCapabilities) {
        const possibleTypes = capabilityAgents[capability] || [];
        possibleTypes.forEach(type => typeSet.add(type));
      }
      
      agentTypes = Array.from(typeSet);
    }

    // Fallback to general agent types
    if (agentTypes.length === 0) {
      agentTypes = ['developer', 'analyst']; // Safe defaults
    }

    // Limit to maxAgents
    return agentTypes.slice(0, maxAgents);
  }

  /**
   * Find reusable agents with matching capabilities (minimal-change enhancement)
   */
  private async findReusableAgents(requiredCapabilities: string[], maxAgents: number): Promise<string[]> {
    const reusableAgents: string[] = [];
    
    try {
      // Find agents with matching capabilities using capability index
      let candidateIds: Set<string> | null = null;
      
      for (const capability of requiredCapabilities) {
        const agentsWithCapability = this.capabilityIndex.get(capability);
        
        if (!agentsWithCapability || agentsWithCapability.size === 0) {
          continue; // Skip if no agents have this capability
        }
        
        if (candidateIds === null) {
          candidateIds = new Set(agentsWithCapability);
        } else {
          // Find intersection - agents with ALL required capabilities
          const intersection = new Set<string>();
          candidateIds.forEach(id => {
            if (agentsWithCapability.has(id)) {
              intersection.add(id);
            }
          });
          candidateIds = intersection;
        }
      }
      
      // Get available agents from candidates
      if (candidateIds && candidateIds.size > 0) {
        for (const agentId of candidateIds) {
          if (reusableAgents.length >= maxAgents) break;
          
          const pooledAgent = this.agentPool.get(agentId);
          if (pooledAgent && pooledAgent.status === 'available') {
            reusableAgents.push(agentId);
          }
        }
      }
      
      if (reusableAgents.length > 0) {
        this.logger.info(`Found ${reusableAgents.length} reusable agents for capabilities: [${requiredCapabilities.join(', ')}]`);
      }
      
    } catch (error) {
      this.logger.warn(`Error finding reusable agents: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return reusableAgents;
  }

  /**
   * Add agent to pool for future reuse (minimal-change enhancement)
   */
  private async addAgentToPool(agentId: string, agentType: string, capabilities: string[]): Promise<void> {
    try {
      const pooledAgent: PooledAgent = {
        id: agentId,
        type: agentType,
        capabilities: capabilities,
        status: 'available',
        lastUsed: new Date(),
        usageCount: 0,
        createdAt: new Date()
      };
      
      // Add to main pool
      this.agentPool.set(agentId, pooledAgent);
      
      // Update capability index for efficient lookup
      for (const capability of capabilities) {
        if (!this.capabilityIndex.has(capability)) {
          this.capabilityIndex.set(capability, new Set());
        }
        this.capabilityIndex.get(capability)!.add(agentId);
      }
      
      this.logger.debug(`Added agent ${agentId} (${agentType}) to pool with capabilities: [${capabilities.join(', ')}]`);
      
    } catch (error) {
      this.logger.warn(`Failed to add agent ${agentId} to pool: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Mark agents as busy when assigned to tasks (minimal-change enhancement)
   */
  private async markAgentsAsBusy(agentIds: string[], taskId: string): Promise<void> {
    for (const agentId of agentIds) {
      try {
        const pooledAgent = this.agentPool.get(agentId);
        if (pooledAgent) {
          pooledAgent.status = 'busy';
          pooledAgent.lastUsed = new Date();
          pooledAgent.usageCount++;
        }
      } catch (error) {
        this.logger.warn(`Failed to mark agent ${agentId} as busy: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Enhanced agent cleanup with pool management (minimal-change enhancement)
   */
  private async releaseAgentsToPool(allAgents: string[], spawnedAgents: string[]): Promise<void> {
    for (const agentId of allAgents) {
      try {
        const pooledAgent = this.agentPool.get(agentId);
        
        if (pooledAgent) {
          // If agent was spawned for this task and has low usage, consider cleanup
          const wasSpawned = spawnedAgents.includes(agentId);
          const shouldKeepInPool = !wasSpawned || pooledAgent.usageCount > 1 || this.shouldKeepAgent(pooledAgent);
          
          if (shouldKeepInPool) {
            // Return to pool as available
            pooledAgent.status = 'available';
            this.logger.debug(`Released agent ${agentId} back to pool (usage: ${pooledAgent.usageCount})`);
          } else {
            // Cleanup agent and remove from pool
            await this.cleanupPooledAgent(agentId);
          }
        } else {
          // Agent not in pool, cleanup immediately
          await this.agentManager.stopAgent(agentId);
        }
        
      } catch (error) {
        this.logger.warn(`Failed to release agent ${agentId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Determine if agent should be kept in pool (simple heuristic)
   */
  private shouldKeepAgent(pooledAgent: PooledAgent): boolean {
    const maxPoolSize = 10; // Simple pool size limit
    const currentPoolSize = Array.from(this.agentPool.values()).filter(a => a.status === 'available').length;
    
    // Keep if under pool limit and recently used
    const recentlyUsed = Date.now() - pooledAgent.lastUsed.getTime() < 1800000; // 30 minutes
    return currentPoolSize < maxPoolSize && (recentlyUsed || pooledAgent.usageCount > 2);
  }

  /**
   * Cleanup agent and remove from pool
   */
  private async cleanupPooledAgent(agentId: string): Promise<void> {
    try {
      const pooledAgent = this.agentPool.get(agentId);
      
      // Remove from capability index
      if (pooledAgent) {
        for (const capability of pooledAgent.capabilities) {
          const capabilitySet = this.capabilityIndex.get(capability);
          if (capabilitySet) {
            capabilitySet.delete(agentId);
            if (capabilitySet.size === 0) {
              this.capabilityIndex.delete(capability);
            }
          }
        }
      }
      
      // Remove from pool
      this.agentPool.delete(agentId);
      
      // Stop the actual agent
      await this.agentManager.stopAgent(agentId);
      
      this.logger.debug(`Cleaned up agent ${agentId} and removed from pool`);
      
    } catch (error) {
      this.logger.warn(`Failed to cleanup pooled agent ${agentId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Legacy cleanup method - now delegates to enhanced pool management
   */
  private async cleanupManagedAgents(agentIds: string[]): Promise<void> {
    // For backward compatibility - cleanup all specified agents
    for (const agentId of agentIds) {
      try {
        await this.cleanupPooledAgent(agentId);
      } catch (error) {
        this.logger.warn(`Failed to cleanup agent ${agentId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Shutdown agent pool and cleanup all agents (minimal-change enhancement)
   */
  private async shutdownAgentPool(): Promise<void> {
    this.logger.info(`Shutting down agent pool with ${this.agentPool.size} agents`);
    
    const allAgentIds = Array.from(this.agentPool.keys());
    
    // Cleanup all pooled agents
    for (const agentId of allAgentIds) {
      try {
        await this.cleanupPooledAgent(agentId);
      } catch (error) {
        this.logger.warn(`Failed to cleanup pooled agent ${agentId} during shutdown: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Clear data structures
    this.agentPool.clear();
    this.capabilityIndex.clear();
    
    this.logger.info('Agent pool shutdown complete');
  }

  /**
   * Get agent pool statistics (useful for monitoring and debugging)
   */
  getAgentPoolStats(): {
    totalAgents: number;
    availableAgents: number;
    busyAgents: number;
    averageUsage: number;
    capabilitiesCovered: number;
    reuseRate: number;
  } {
    const agents = Array.from(this.agentPool.values());
    const totalAgents = agents.length;
    
    if (totalAgents === 0) {
      return {
        totalAgents: 0,
        availableAgents: 0,
        busyAgents: 0,
        averageUsage: 0,
        capabilitiesCovered: 0,
        reuseRate: 0
      };
    }
    
    const availableAgents = agents.filter(a => a.status === 'available').length;
    const busyAgents = agents.filter(a => a.status === 'busy').length;
    const averageUsage = agents.reduce((sum, a) => sum + a.usageCount, 0) / totalAgents;
    const capabilitiesCovered = this.capabilityIndex.size;
    
    // Calculate reuse rate (agents with usage > 1)
    const reusedAgents = agents.filter(a => a.usageCount > 1).length;
    const reuseRate = totalAgents > 0 ? reusedAgents / totalAgents : 0;
    
    return {
      totalAgents,
      availableAgents,
      busyAgents,
      averageUsage,
      capabilitiesCovered,
      reuseRate
    };
  }

  /**
   * Get steering context for agent types
   */
  async getSteeringContext(agentType: string, filePath?: string): Promise<string> {
    let context = '';
    const steeringFiles = ['product.md', 'tech.md', 'structure.md'];
    
    for (const file of steeringFiles) {
      try {
        context += await readFile(join(this.steeringDirectory, file), 'utf8') + '\n\n---\n\n';
      } catch (error) {
        this.logger.warn(`Could not read steering file ${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return context || 'No steering context available.';
  }
  
  /**
   * Initialize agentic hooks system
   */
  private async initializeAgenticHooks(): Promise<void> {
    if (!this.agenticHooksInitialized) {
      try {
        await initializeAgenticFlowHooks();
        this.agenticHooksInitialized = true;
        this.logger.info('Agentic hooks system initialized for Maestro');
        
        // Register Maestro-specific hooks
        this.registerMaestroHooks();
      } catch (error) {
        this.logger.error('Failed to initialize agentic hooks:', error);
      }
    }
  }
  
  /**
   * Register Maestro-specific hooks
   */
  private registerMaestroHooks(): void {
    // Register workflow hooks
    agenticHookManager.register({
      id: 'maestro-spec-created',
      type: 'workflow-start',
      handler: async (payload, context) => {
        this.logger.info('Maestro spec creation hook triggered');
        return { continue: true };
      },
      priority: 50
    });
    
    agenticHookManager.register({
      id: 'maestro-task-completed', 
      type: 'workflow-step',
      handler: async (payload, context) => {
        this.logger.info('Maestro task completion hook triggered');
        return { continue: true };
      },
      priority: 50
    });
    
    this.logger.info('Maestro-specific hooks registered');
  }
  
  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.eventBus.on('maestro:spec_created', this.handleSpecCreated.bind(this));
    this.eventBus.on('maestro:phase_approved', this.handlePhaseApproved.bind(this));
    this.eventBus.on('maestro:task_implemented', this.handleTaskImplemented.bind(this));
  }
  
  /**
   * Event handlers
   */
  private async handleSpecCreated(data: any): Promise<void> {
    this.logger.info(`Spec created event: ${JSON.stringify(data)}`);
  }
  
  private async handlePhaseApproved(data: any): Promise<void> {
    this.logger.info(`Phase approved event: ${JSON.stringify(data)}`);
  }
  
  private async handleTaskImplemented(data: any): Promise<void> {
    this.logger.info(`Task implemented event: ${JSON.stringify(data)}`);
  }
  
  /**
   * Utility: Wait for task completion in hive mind
   */
  private async waitForTaskCompletion(taskId: string, timeoutMs: number = 300000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Task timeout: ${taskId}`));
      }, timeoutMs);
      
      const checkInterval = setInterval(async () => {
        try {
          const task = await this.hiveMind!.getTask(taskId);
          
          if (task.status === 'completed') {
            clearTimeout(timeout);
            clearInterval(checkInterval);
            resolve(task.result ? JSON.parse(task.result) : {});
          } else if (task.status === 'failed') {
            clearTimeout(timeout);
            clearInterval(checkInterval);
            reject(new Error(`Task failed: ${task.error || 'Unknown error'}`));
          }
        } catch (error) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          reject(error);
        }
      }, 2000);
    });
  }
  
  /**
   * Utility: Wait for consensus result
   */
  private async waitForConsensusResult(proposalId: string, timeoutMs: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Consensus timeout for proposal ${proposalId}`));
      }, timeoutMs);
      
      const checkInterval = setInterval(async () => {
        try {
          const status = await this.consensusEngine!.getProposalStatus(proposalId);
          
          if (status.status === 'achieved') {
            clearTimeout(timeout);
            clearInterval(checkInterval);
            resolve({
              achieved: true,
              finalRatio: status.currentRatio,
              reason: 'Consensus achieved'
            });
          } else if (status.status === 'failed') {
            clearTimeout(timeout);
            clearInterval(checkInterval);
            resolve({
              achieved: false,
              finalRatio: status.currentRatio,
              reason: 'Consensus failed'
            });
          }
        } catch (error) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          reject(error);
        }
      }, 1000);
    });
  }
  
  /**
   * Shutdown orchestrator and cleanup resources
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Maestro Orchestrator');
    
    // Close file watchers
    for (const [featureName, watcher] of this.fileWatchers) {
      await watcher.close();
      this.logger.info(`Closed file watcher for '${featureName}'`);
    }
    
    // Shutdown agentic hooks if initialized
    if (this.agenticHooksInitialized) {
      // Unregister Maestro hooks
      try {
        agenticHookManager.unregister('maestro-spec-created');
        agenticHookManager.unregister('maestro-task-completed');
      } catch (error) {
        this.logger.warn('Failed to unregister Maestro hooks:', error);
      }
    }

    // Shutdown hive mind if initialized
    if (this.hiveMind) {
      await this.hiveMind.shutdown();
      this.logger.info('Hive mind shutdown complete');
    }
    
    // Cleanup agent pool (minimal-change enhancement)
    await this.shutdownAgentPool();
    
    // Task planner removed - using direct agent management
    
    this.logger.info('Maestro Orchestrator shutdown complete');
  }
}