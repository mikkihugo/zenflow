/**
 * @fileoverview SAFe Framework Kanban Integration
 * 
 * Integrates SAFe framework with @claude-zen/kanban XState package.
 * Provides specialized SAFe workflow configurations and state machines for:
 * - Portfolio Kanban (Epic lifecycle management)
 * - Program Kanban (Feature flow management)
 * - Team Kanban (Story and task coordination)
 * - Solution Kanban (Solution epic coordination)
 * 
 * Features:
 * - Leverages @claude-zen/kanban XState foundation
 * - SAFe-specific workflow states and transitions
 * - WIP limits optimized for SAFe practices
 * - Bottleneck detection for SAFe value streams
 * - Integration with SAFe events and metrics
 * 
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import {
  WorkflowKanban,
  createWorkflowKanban,
  type WorkflowKanbanConfig,
  type TaskState,
  type TaskPriority,
  type WorkflowTask,
  type WIPLimits,
  type FlowMetrics,
  type WorkflowBottleneck,
  type WorkflowKanbanEvents,
  ALL_WORKFLOW_STATES,
  DEFAULT_WORKFLOW_STATES
} from '@claude-zen/kanban';

import type { 
  TypeSafeEventBus,
  Logger 
} from '@claude-zen/foundation';

import type {
  PortfolioEpic,
  Feature,
  Story,
  ProgramIncrement,
  ValueStream,
  WSJFPriority
} from '../types';

// ============================================================================
// SAFE-SPECIFIC KANBAN CONFIGURATIONS
// ============================================================================

/**
 * Portfolio Kanban states for Epic lifecycle (SAFe-specific)
 */
export type SafePortfolioKanbanState = 
  | 'funnel'           // Ideas and opportunities
  | 'analyzing'        // Business case analysis and WSJF
  | 'portfolio_backlog' // Prioritized and approved epics
  | 'implementing'     // Active development across ARTs
  | 'done';            // Epic completed and value delivered

/**
 * Program Kanban states for Feature flow (SAFe-specific)
 */
export type SafeProgramKanbanState =
  | 'backlog'          // Feature backlog
  | 'analysis'         // Feature analysis and acceptance criteria
  | 'development'      // Implementation across teams
  | 'testing'          // Integration and system testing
  | 'review'           // Demo and stakeholder review
  | 'deployment'       // Production deployment
  | 'done';           // Feature delivered

/**
 * Team Kanban states for Story and Task flow (SAFe-specific)
 */
export type SafeTeamKanbanState =
  | 'backlog'          // Product backlog
  | 'analysis'         // Story analysis and task breakdown
  | 'development'      // Implementation
  | 'testing'          // Unit and integration testing
  | 'review'           // Code review and acceptance
  | 'deployment'       // Deployment and verification
  | 'done';           // Story complete

/**
 * Solution Kanban states for large solution coordination (SAFe-specific)
 */
export type SafeSolutionKanbanState =
  | 'vision'           // Solution vision and architecture
  | 'analysis'         // Solution analysis and capability mapping
  | 'development'      // Cross-ART development coordination
  | 'integration'      // Solution integration and testing
  | 'validation'       // Solution validation and demo
  | 'deployment'       // Solution deployment
  | 'done';           // Solution capability delivered

// ============================================================================
// SAFE WORKFLOW CONFIGURATIONS
// ============================================================================

/**
 * Create Portfolio Kanban configuration optimized for Epic lifecycle
 */
export function createSafePortfolioKanbanConfig(eventBus?: TypeSafeEventBus): WorkflowKanbanConfig {
  return {
    // Portfolio-specific workflow states (maps to Epic lifecycle)
    workflowStates: [
      'funnel',           // → analyzing → portfolio_backlog → implementing → done
      'analyzing', 
      'portfolio_backlog',
      'implementing', 
      'done'
    ] as TaskState[],

    // WIP limits optimized for portfolio management
    defaultWIPLimits: {
      funnel: 50,              // Many ideas can be in the funnel
      analyzing: 5,            // Limited business case analysis capacity
      portfolio_backlog: 20,   // Prioritized and ready epics
      implementing: 8,         // Limited implementation capacity across ARTs
      done: 1000,             // No limit on completed epics
      blocked: 5,             // Limited blocked epics (escalate quickly)
      expedite: 1             // Maximum 1 expedited epic
    } as WIPLimits,

    // Portfolio-specific intelligent WIP optimization
    intelligentWIPConfig: {
      enabled: true,
      optimizationInterval: 24 * 60 * 60 * 1000,  // Daily optimization
      learningRate: 0.05,     // Conservative learning for portfolio level
      performanceWindow: 30,  // 30-day performance window
      minWipAdjustment: 1,    // Minimum adjustment
      maxWipAdjustment: 3     // Maximum adjustment
    },

    // Bottleneck detection optimized for epic flow
    bottleneckDetectionConfig: {
      enabled: true,
      thresholds: {
        cycleTimeIncrease: 2.0,      // Alert if cycle time doubles
        wipUtilization: 0.9,         // Alert at 90% WIP utilization
        throughputDecrease: 0.3,     // Alert if throughput drops 30%
        ageThreshold: 90 * 24 * 60 * 60 * 1000  // 90 days for epics
      },
      analysisInterval: 24 * 60 * 60 * 1000,   // Daily analysis
      reportingEnabled: true
    },

    // Flow optimization for value delivery
    flowOptimizationConfig: {
      enabled: true,
      strategies: [
        'wip_reduction',          // Reduce WIP to improve flow
        'bottleneck_removal',     // Remove portfolio bottlenecks
        'parallel_processing'     // Parallelize epic analysis
      ],
      optimizationInterval: 7 * 24 * 60 * 60 * 1000  // Weekly optimization
    },

    // Event integration
    eventBus,
    
    // Monitoring and metrics
    metricsConfig: {
      enabled: true,
      collectionInterval: 60 * 60 * 1000,  // Hourly metrics collection
      retentionDays: 365,                  // 1-year retention for portfolio metrics
      exportInterval: 24 * 60 * 60 * 1000  // Daily export
    }
  };
}

/**
 * Create Program Kanban configuration optimized for Feature flow
 */
export function createSafeProgramKanbanConfig(eventBus?: TypeSafeEventBus): WorkflowKanbanConfig {
  return {
    workflowStates: DEFAULT_WORKFLOW_STATES, // Standard workflow suitable for features
    
    defaultWIPLimits: {
      backlog: 100,        // Feature backlog
      analysis: 10,        // Feature analysis capacity
      development: 15,     // Active development
      testing: 12,         // Testing capacity
      review: 8,           // Review capacity
      deployment: 5,       // Deployment pipeline capacity
      done: 1000,         // Unlimited completed features
      blocked: 8,         // Blocked feature limit
      expedite: 2         // Maximum 2 expedited features
    } as WIPLimits,

    intelligentWIPConfig: {
      enabled: true,
      optimizationInterval: 12 * 60 * 60 * 1000,  // Twice daily
      learningRate: 0.1,      // Moderate learning for program level
      performanceWindow: 14,  // 2-week performance window
      minWipAdjustment: 1,
      maxWipAdjustment: 5
    },

    bottleneckDetectionConfig: {
      enabled: true,
      thresholds: {
        cycleTimeIncrease: 1.5,
        wipUtilization: 0.85,
        throughputDecrease: 0.25,
        ageThreshold: 30 * 24 * 60 * 60 * 1000  // 30 days for features
      },
      analysisInterval: 12 * 60 * 60 * 1000,
      reportingEnabled: true
    },

    eventBus,
    
    metricsConfig: {
      enabled: true,
      collectionInterval: 30 * 60 * 1000,   // 30-minute collection
      retentionDays: 180,                   // 6-month retention
      exportInterval: 12 * 60 * 60 * 1000   // Twice daily export
    }
  };
}

/**
 * Create Team Kanban configuration optimized for Story/Task flow  
 */
export function createSafeTeamKanbanConfig(eventBus?: TypeSafeEventBus): WorkflowKanbanConfig {
  return {
    workflowStates: DEFAULT_WORKFLOW_STATES, // Standard workflow for stories
    
    defaultWIPLimits: {
      backlog: 200,        // Story backlog
      analysis: 8,         // Story analysis (refinement)
      development: 12,     // Development capacity
      testing: 10,         // Testing capacity
      review: 6,           // Review capacity  
      deployment: 4,       // CI/CD pipeline capacity
      done: 1000,         // Unlimited completed stories
      blocked: 5,         // Blocked story limit
      expedite: 1         // Maximum 1 expedited story
    } as WIPLimits,

    intelligentWIPConfig: {
      enabled: true,
      optimizationInterval: 4 * 60 * 60 * 1000,  // Every 4 hours
      learningRate: 0.15,     // Faster learning at team level
      performanceWindow: 7,   // 1-week performance window
      minWipAdjustment: 1,
      maxWipAdjustment: 3
    },

    bottleneckDetectionConfig: {
      enabled: true,
      thresholds: {
        cycleTimeIncrease: 1.3,
        wipUtilization: 0.8,
        throughputDecrease: 0.2,
        ageThreshold: 14 * 24 * 60 * 60 * 1000  // 14 days for stories
      },
      analysisInterval: 4 * 60 * 60 * 1000,
      reportingEnabled: true
    },

    eventBus,
    
    metricsConfig: {
      enabled: true,
      collectionInterval: 15 * 60 * 1000,    // 15-minute collection
      retentionDays: 90,                     // 3-month retention
      exportInterval: 4 * 60 * 60 * 1000     // Every 4 hours export
    }
  };
}

// ============================================================================
// SAFE KANBAN FACTORY FUNCTIONS
// ============================================================================

/**
 * Create Portfolio Kanban for Epic lifecycle management
 */
export async function createSafePortfolioKanban(
  logger: Logger,
  eventBus?: TypeSafeEventBus
): Promise<WorkflowKanban> {
  const config = createSafePortfolioKanbanConfig(eventBus);
  const kanban = createWorkflowKanban(config);
  
  // Initialize with logging
  logger.info('Creating SAFe Portfolio Kanban', {
    wipLimits: config.defaultWIPLimits,
    states: config.workflowStates
  });
  
  await kanban.initialize();
  
  // Configure SAFe-specific event listeners
  configureSafePortfolioEvents(kanban, logger);
  
  return kanban;
}

/**
 * Create Program Kanban for Feature flow management
 */
export async function createSafeProgramKanban(
  logger: Logger,
  eventBus?: TypeSafeEventBus
): Promise<WorkflowKanban> {
  const config = createSafeProgramKanbanConfig(eventBus);
  const kanban = createWorkflowKanban(config);
  
  logger.info('Creating SAFe Program Kanban', {
    wipLimits: config.defaultWIPLimits,
    states: config.workflowStates
  });
  
  await kanban.initialize();
  configureSafeProgramEvents(kanban, logger);
  
  return kanban;
}

/**
 * Create Team Kanban for Story/Task flow management
 */
export async function createSafeTeamKanban(
  logger: Logger,
  eventBus?: TypeSafeEventBus
): Promise<WorkflowKanban> {
  const config = createSafeTeamKanbanConfig(eventBus);
  const kanban = createWorkflowKanban(config);
  
  logger.info('Creating SAFe Team Kanban', {
    wipLimits: config.defaultWIPLimits,
    states: config.workflowStates
  });
  
  await kanban.initialize();
  configureSafeTeamEvents(kanban, logger);
  
  return kanban;
}

// ============================================================================
// SAFE-SPECIFIC EVENT CONFIGURATION
// ============================================================================

/**
 * Configure Portfolio Kanban events for Epic lifecycle
 */
function configureSafePortfolioEvents(kanban: WorkflowKanban, logger: Logger): void {
  // Epic business case validation events
  kanban.on('task:created', (task) => {
    logger.info('Portfolio Epic created', { 
      epicId: task.id,
      title: task.title,
      priority: task.priority 
    });
  });

  // WSJF calculation events
  kanban.on('task:moved', (task, fromState, toState) => {
    if (toState === 'analyzing') {
      logger.info('Epic entered analysis', { 
        epicId: task.id,
        wsjfCalculationNeeded: true 
      });
    } else if (toState === 'portfolio_backlog') {
      logger.info('Epic approved for portfolio backlog', { 
        epicId: task.id,
        wsjfScore: task.metadata?.wsjfScore 
      });
    }
  });

  // Portfolio bottleneck alerts
  kanban.on('bottleneck:detected', (bottleneck) => {
    logger.warn('Portfolio bottleneck detected', {
      state: bottleneck.state,
      severity: bottleneck.severity,
      recommendedAction: bottleneck.recommendations[0]
    });
  });

  // WIP limit enforcement at portfolio level
  kanban.on('wip:exceeded', (state, count, limit) => {
    logger.warn('Portfolio WIP limit exceeded', {
      state,
      currentCount: count,
      limit,
      action: 'Block new epics until capacity available'
    });
  });
}

/**
 * Configure Program Kanban events for Feature flow
 */
function configureSafeProgramEvents(kanban: WorkflowKanban, logger: Logger): void {
  kanban.on('task:created', (task) => {
    logger.info('Program Feature created', { 
      featureId: task.id,
      title: task.title,
      pi: task.metadata?.programIncrement 
    });
  });

  kanban.on('bottleneck:detected', (bottleneck) => {
    logger.warn('Program bottleneck detected', {
      state: bottleneck.state,
      impact: 'May affect PI objectives',
      severity: bottleneck.severity
    });
  });

  kanban.on('wip:exceeded', (state, count, limit) => {
    logger.warn('Program WIP limit exceeded', {
      state,
      currentCount: count,
      limit,
      impact: 'Feature delivery may be delayed'
    });
  });
}

/**
 * Configure Team Kanban events for Story/Task flow
 */
function configureSafeTeamEvents(kanban: WorkflowKanban, logger: Logger): void {
  kanban.on('task:created', (task) => {
    logger.info('Team Story created', { 
      storyId: task.id,
      title: task.title,
      storyPoints: task.metadata?.storyPoints 
    });
  });

  kanban.on('bottleneck:detected', (bottleneck) => {
    logger.warn('Team bottleneck detected', {
      state: bottleneck.state,
      impact: 'Sprint commitment at risk',
      severity: bottleneck.severity
    });
  });

  kanban.on('wip:exceeded', (state, count, limit) => {
    logger.warn('Team WIP limit exceeded', {
      state,
      currentCount: count,
      limit,
      impact: 'Sprint velocity may decrease'
    });
  });
}

// ============================================================================
// SAFE WORKFLOW ADAPTERS
// ============================================================================

/**
 * Convert PortfolioEpic to WorkflowTask for kanban processing
 */
export function portfolioEpicToKanbanTask(epic: PortfolioEpic, wsjf?: WSJFPriority): WorkflowTask {
  return {
    id: epic.id,
    title: epic.title,
    description: epic.description,
    state: mapPortfolioStateToKanbanState(epic.state),
    priority: mapEpicPriorityToKanbanPriority(wsjf?.ranking || 5),
    estimatedEffort: epic.estimatedValue || 1,
    assignedTo: epic.epicOwner,
    createdAt: epic.createdAt,
    updatedAt: epic.lastModified,
    completedAt: epic.state === 'done' ? epic.lastModified : undefined,
    dependencies: epic.dependencies?.map(d => d.id) || [],
    tags: [epic.category || 'epic', ...(epic.themes || [])],
    metadata: {
      wsjfScore: wsjf?.wsjfScore,
      businessValue: epic.businessValue,
      timeCriticality: epic.timeCriticality,
      jobSize: epic.jobSize,
      valueStream: epic.valueStream?.name
    }
  };
}

/**
 * Convert Feature to WorkflowTask for program kanban
 */
export function featureToKanbanTask(feature: Feature): WorkflowTask {
  return {
    id: feature.id,
    title: feature.title,
    description: feature.description,
    state: feature.status as TaskState || 'backlog',
    priority: feature.priority as TaskPriority || 'medium',
    estimatedEffort: feature.storyPoints || 1,
    assignedTo: feature.owner,
    createdAt: new Date(feature.createdAt),
    updatedAt: new Date(feature.updatedAt),
    dependencies: feature.dependencies?.map(d => d.toString()) || [],
    tags: ['feature', ...(feature.labels || [])],
    metadata: {
      epicId: feature.epicId,
      programIncrement: feature.programIncrementId,
      acceptanceCriteria: feature.acceptanceCriteria
    }
  };
}

/**
 * Convert Story to WorkflowTask for team kanban
 */
export function storyToKanbanTask(story: Story): WorkflowTask {
  return {
    id: story.id,
    title: story.title,
    description: story.description,
    state: story.status as TaskState || 'backlog',
    priority: story.priority as TaskPriority || 'medium',
    estimatedEffort: story.storyPoints || 1,
    assignedTo: story.assignee,
    createdAt: new Date(story.createdDate),
    updatedAt: new Date(story.lastModified),
    dependencies: story.dependencies?.map(d => d.toString()) || [],
    tags: ['story', ...(story.labels || [])],
    metadata: {
      featureId: story.featureId,
      acceptanceCriteria: story.acceptanceCriteria,
      testCases: story.testCases
    }
  };
}

// ============================================================================
// STATE MAPPING UTILITIES
// ============================================================================

/**
 * Map portfolio epic states to kanban workflow states
 */
function mapPortfolioStateToKanbanState(portfolioState: string): TaskState {
  const stateMap: Record<string, TaskState> = {
    'funnel': 'backlog',
    'analyzing': 'analysis',
    'portfolio_backlog': 'backlog',
    'implementing': 'development',
    'done': 'done'
  };
  
  return stateMap[portfolioState] || 'backlog';
}

/**
 * Map epic priority ranking to kanban task priority
 */
function mapEpicPriorityToKanbanPriority(ranking: number): TaskPriority {
  if (ranking === 1) return 'critical';
  if (ranking <= 3) return 'high';
  if (ranking <= 7) return 'medium';
  return 'low';
}

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

/**
 * SAFe Kanban Integration Summary
 * 
 * This integration provides:
 * - XState-powered SAFe workflows (Portfolio, Program, Team, Solution)
 * - @claude-zen/kanban foundation integration
 * - SAFe-specific WIP limits and optimization strategies
 * - Bottleneck detection for value streams
 * - Event-driven integration with existing SAFe managers
 * - Adapters for Epic/Feature/Story conversion
 * - Flow metrics optimized for SAFe practices
 * - Comprehensive logging and monitoring integration
 */