/**
 * @fileoverview SAFe Framework Kanban Integration
 *
 * Integrates SAFe framework with @claude-zen/kanban XState package.
 * Provides specialized SAFe workflow configurations and state machines for: * - Portfolio Kanban (Epic lifecycle management)
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
  ALL_WORKFLOW_STATES,
  KanbanEngine,
  DEFAULT_WORKFLOW_STATES,
  type TaskPriority,
  type TaskState,
  type WIPLimits,
  type WorkflowKanbanConfig,
  type WorkflowTask,
} from '../../kanban');
// Use foundation's typed EventEmitter for better type safety
import type { EventEmitter, Logger } from '@claude-zen/foundation';

// Define WSJFPriority type locally since it's not exported yet
interface WSJFPriority {
  businessValue: number;
  urgency: number;
  riskReduction: number;
  opportunityEnablement: number;
  size: number;
  wsjfScore: number;
  lastUpdated: Date;
  confidence: number;
}
import type {
  Feature,
  PortfolioEpic,
  Story,
} from '../types')'; 
// SAFE-SPECIFIC KANBAN CONFIGURATIONS
// ============================================================================
/**
 * Portfolio Kanban states for Epic lifecycle (SAFe-specific)
 */
export type SafePortfolioKanbanState =|'funnel'// Ideas and opportunities|' analyzing'// Business case analysis and WSJF|' portfolio_backlog'// Prioritized and approved epics|' implementing'// Active development across ARTs| ' done'; // Epic completed and value delivered';
/**
 * Program Kanban states for Feature flow (SAFe-specific)
 */
export type SafeProgramKanbanState =|'backlog'// Feature backlog|' analysis'// Feature analysis and acceptance criteria|' development'// Implementation across teams|' testing'// Integration and system testing|' review'// Demo and stakeholder review|' deployment'// Production deployment| ' done'; // Feature delivered';
/**
 * Team Kanban states for Story and Task flow (SAFe-specific)
 */
export type SafeTeamKanbanState =|'backlog'// Product backlog|' analysis'// Story analysis and task breakdown|' development'// Implementation|' testing'// Unit and integration testing|' review'// Code review and acceptance|' deployment'// Deployment and verification| ' done'; // Story complete';
/**
 * Solution Kanban states for large solution coordination (SAFe-specific)
 */
export type SafeSolutionKanbanState =|'vision'// Solution vision and architecture|' analysis'// Solution analysis and capability mapping|' development'// Cross-ART development coordination|' integration'// Solution integration and testing|' validation'// Solution validation and demo|' deployment'// Solution deployment| ' done'; // Solution capability delivered';
// ============================================================================
// SAFE WORKFLOW CONFIGURATIONS
// ============================================================================
/**
 * Create Portfolio Kanban configuration optimized for Epic lifecycle
 */
export function createSafePortfolioKanbanConfig(): void {
  return {
    // Portfolio-specific workflow states (maps to Epic lifecycle)
    workflowStates: [
     'funnel,// → analyzing → portfolio_backlog → implementing → done')analyzing,';
     'portfolio_backlog,')implementing,';
     'done,';
] as TaskState[],
    // WIP limits optimized for portfolio management
    defaultWIPLimits:  {
      funnel: 50, // Many ideas can be in the funnel
      analyzing: 5, // Limited business case analysis capacity
      portfolio_backlog: 20, // Prioritized and ready epics
      implementing: 8, // Limited implementation capacity across ARTs
      done: 1000, // No limit on completed epics
      blocked: 5, // Limited blocked epics (escalate quickly)
      expedite: 1, // Maximum 1 expedited epic
} as WIPLimits,
    // Portfolio-specific intelligent WIP optimization
    intelligentWIPConfig:  {
      enabled: true,
      optimizationInterval: 24 * 60 * 60 * 1000, // Daily optimization
      learningRate: 0.05, // Conservative learning for portfolio level
      performanceWindow: 30, // 30-day performance window
      minWipAdjustment: 1, // Minimum adjustment
      maxWipAdjustment: 3, // Maximum adjustment
},
    // Bottleneck detection optimized for epic flow
    bottleneckDetectionConfig:  {
      enabled: true,
      thresholds:  {
        cycleTimeIncrease: 2.0, // Alert if cycle time doubles
        wipUtilization: 0.9, // Alert at 90% WIP utilization
        throughputDecrease: 0.3, // Alert if throughput drops 30%
        ageThreshold: 90 * 24 * 60 * 60 * 1000, // 90 days for epics
},
      analysisInterval: 24 * 60 * 60 * 1000, // Daily analysis
      reportingEnabled: true,
},
    // Flow optimization for value delivery
    flowOptimizationConfig:  {
      enabled: true,
      strategies: [';];
       'wip_reduction,// Reduce WIP to improve flow')bottleneck_removal,// Remove portfolio bottlenecks';
       'parallel_processing,// Parallelize epic analysis';
],
      optimizationInterval: 7 * 24 * 60 * 60 * 1000, // Weekly optimization
},
    // Event integration
    eventBus,
    // Monitoring and metrics
    metricsConfig:  {
      enabled: true,
      collectionInterval: 60 * 60 * 1000, // Hourly metrics collection
      retentionDays: 365, // 1-year retention for portfolio metrics
      exportInterval: 24 * 60 * 60 * 1000, // Daily export
},
};
}
/**
 * Create Program Kanban configuration optimized for Feature flow
 */
export function createSafeProgramKanbanConfig(): void {
  return {
    workflowStates: DEFAULT_WORKFLOW_STATES, // Standard workflow suitable for features
    defaultWIPLimits:  {
      backlog: 100, // Feature backlog
      analysis: 10, // Feature analysis capacity
      development: 15, // Active development
      testing: 12, // Testing capacity
      review: 8, // Review capacity
      deployment: 5, // Deployment pipeline capacity
      done: 1000, // Unlimited completed features
      blocked: 8, // Blocked feature limit
      expedite: 2, // Maximum 2 expedited features
} as WIPLimits,
    intelligentWIPConfig:  {
      enabled: true,
      optimizationInterval: 12 * 60 * 60 * 1000, // Twice daily
      learningRate: 0.1, // Moderate learning for program level
      performanceWindow: 14, // 2-week performance window
      minWipAdjustment: 1,
      maxWipAdjustment: 5,
},
    bottleneckDetectionConfig:  {
      enabled: true,
      thresholds:  {
        cycleTimeIncrease: 1.5,
        wipUtilization: 0.85,
        throughputDecrease: 0.25,
        ageThreshold: 30 * 24 * 60 * 60 * 1000, // 30 days for features
},
      analysisInterval: 12 * 60 * 60 * 1000,
      reportingEnabled: true,
},
    eventBus,
    metricsConfig:  {
      enabled: true,
      collectionInterval: 30 * 60 * 1000, // 30-minute collection
      retentionDays: 180, // 6-month retention
      exportInterval: 12 * 60 * 60 * 1000, // Twice daily export
},
};
}
/**
 * Create Team Kanban configuration optimized for Story/Task flow
 */
export function createSafeTeamKanbanConfig(): void {
  return {
    workflowStates: DEFAULT_WORKFLOW_STATES, // Standard workflow for stories
    defaultWIPLimits:  {
      backlog: 200, // Story backlog
      analysis: 8, // Story analysis (refinement)
      development: 12, // Development capacity
      testing: 10, // Testing capacity
      review: 6, // Review capacity
      deployment: 4, // CI/CD pipeline capacity
      done: 1000, // Unlimited completed stories
      blocked: 5, // Blocked story limit
      expedite: 1, // Maximum 1 expedited story
} as WIPLimits,
    intelligentWIPConfig:  {
      enabled: true,
      optimizationInterval: 4 * 60 * 60 * 1000, // Every 4 hours
      learningRate: 0.15, // Faster learning at team level
      performanceWindow: 7, // 1-week performance window
      minWipAdjustment: 1,
      maxWipAdjustment: 3,
},
    bottleneckDetectionConfig:  {
      enabled: true,
      thresholds:  {
        cycleTimeIncrease: 1.3,
        wipUtilization: 0.8,
        throughputDecrease: 0.2,
        ageThreshold: 14 * 24 * 60 * 60 * 1000, // 14 days for stories
},
      analysisInterval: 4 * 60 * 60 * 1000,
      reportingEnabled: true,
},
    eventBus,
    metricsConfig:  {
      enabled: true,
      collectionInterval: 15 * 60 * 1000, // 15-minute collection
      retentionDays: 90, // 3-month retention
      exportInterval: 4 * 60 * 60 * 1000, // Every 4 hours export
},
};
}
// ============================================================================
// SAFE KANBAN FACTORY FUNCTIONS
// ============================================================================
/**
 * Create Portfolio Kanban for Epic lifecycle management
 */
export async function createSafePortfolioKanban(): void {';
    wipLimits: createSafeProgramKanbanConfig(): void {';
    wipLimits: createSafeTeamKanbanConfig(): void {';
    wipLimits: config.defaultWIPLimits,
    states: config.workflowStates,');
});
  await kanban.initialize(): void {';
    ')Portfolio Epic created,';
      epicId: task.id,
      title: task.title,
      priority: task.priority,);');
});
  // WSJF calculation events')task: moved,(_task, _fromState, toState) => {';
    ')analyzing){';
    ')Epic entered analysis,';
        epicId: task.id,');
        wsjfCalculationNeeded: true,);')portfolio_backlog){';
    ')Epic approved for portfolio backlog,';
        epicId: task.id,
        wsjfScore: task.metadata?.wsjfScore,);');
}
});
  // Portfolio bottleneck alerts')bottleneck: detected,(_bottleneck) => {';
    ')Portfolio bottleneck detected,';
      state: bottleneck.state,
      severity: bottleneck.severity,
      recommendedAction: bottleneck.recommendations[0],);');
});
  // WIP limit enforcement at portfolio level')wip: exceeded,(_state, _count, _limit) => {';
    ')Portfolio WIP limit exceeded,';
      state,
      currentCount: 'Block new epics until capacity available,);',)});')task: created,(_task) => {';
    ')Program Feature created,';
      featureId: task.id,
      title: task.title,
      pi: task.metadata?.programIncrement,);');
});')bottleneck: detected,(_bottleneck) => {';
    ')Program bottleneck detected,';
      state: bottleneck.state,');
      impact,      severity: bottleneck.severity,);'))  kanban.on(): void {';
    ')Program WIP limit exceeded,';
      state,
      currentCount: 'Feature delivery may be delayed,);',)});')task: created,(_task) => {';
    ')Team Story created,';
      storyId: task.id,
      title: task.title,
      storyPoints: task.metadata?.storyPoints,);');
});')bottleneck: detected,(_bottleneck) => {';
    ')Team bottleneck detected,';
      state: bottleneck.state,');
      impact,      severity: bottleneck.severity,);'))  kanban.on(): void {';
    ')Team WIP limit exceeded,';
      state,
      currentCount: 'Sprint velocity may decrease,);',)});')unassigned,';
    createdAt: (epic as any).createdAt|| new Date(): void {
      wsjfScore: wsjf?.wsjfScore,
      businessValue: epic.businessValue,
      timeCriticality: (epic as any).timeCriticality|| 0,
      jobSize: (epic as any).jobSize|| 1,
      valueStream: (epic as any).valueStream?.name||'default,';
},
};
}
/**
 * Convert Feature to WorkflowTask for program kanban
 */
export function featureToKanbanTask(): void {
  return {
    id: feature.id,
    title: (feature as any).title|| feature.id,
    description: feature.description,
    state: (feature.status as TaskState)||'backlog,';
    priority: ((feature as any).priority as TaskPriority)||medium,
    estimatedEffort: (feature as any).storyPoints|| 1,
    assignedTo: (feature as any).owner|| (feature as any).assignee||'unassigned,';
    createdAt: new Date(): void {
    '];
      epicId: (feature as any).epicId|| feature.piId,')current,';
      acceptanceCriteria: (feature as any).acceptanceCriteria|| [],
},
};
}
/**
 * Convert Story to WorkflowTask for team kanban
 */
export function storyToKanbanTask(): void {
  return {
    id: story.id,
    title: (story as any).title|| story.id,
    description: story.description,
    state: (story.status as TaskState)||'backlog,';
    priority: (story.priority as TaskPriority)||medium,
    estimatedEffort: story.storyPoints|| 1,
    assignedTo: (story as any).assignee||'unassigned,';
    createdAt: new Date(): void {
      featureId: story.featureId,
      acceptanceCriteria: story.acceptanceCriteria,
      testCases: (story as any).testCases|| [],'];
},
};)};
// ============================================================================
// STATE MAPPING UTILITIES
// ============================================================================
/**
 * Map portfolio epic states to kanban workflow states
 */
function mapPortfolioStateToKanbanState(portfolioState:  {
    funnel : 'backlog')analysis')backlog')development')backlog')critical')high')medium')low')};
// ============================================================================
// EXPORT SUMMARY
// ============================================================================
/**
 * SAFe Kanban Integration Summary
 *
 * This integration provides: * - XState-powered SAFe workflows (Portfolio, Program, Team, Solution)
 * - @claude-zen/kanban foundation integration
 * - SAFe-specific WIP limits and optimization strategies
 * - Bottleneck detection for value streams
 * - Event-driven integration with existing SAFe managers
 * - Adapters for Epic/Feature/Story conversion
 * - Flow metrics optimized for SAFe practices
 * - Comprehensive logging and monitoring integration
 */
