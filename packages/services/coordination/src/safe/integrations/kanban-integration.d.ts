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
import { type WorkflowKanbanConfig, type WorkflowTask } from '../../kanban';
import type { EventEmitter } from 'node: events';
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
import type { Feature, PortfolioEpic, Story } from '../types';
/**
 * Portfolio Kanban states for Epic lifecycle (SAFe-specific)
 */
export type SafePortfolioKanbanState = 'funnel';
/**
 * Program Kanban states for Feature flow (SAFe-specific)
 */
export type SafeProgramKanbanState = 'backlog';
/**
 * Team Kanban states for Story and Task flow (SAFe-specific)
 */
export type SafeTeamKanbanState = 'backlog';
/**
 * Solution Kanban states for large solution coordination (SAFe-specific)
 */
export type SafeSolutionKanbanState = 'vision';
/**
 * Create Portfolio Kanban configuration optimized for Epic lifecycle
 */
export declare function createSafePortfolioKanbanConfig(eventBus?: EventEmitter): WorkflowKanbanConfig;
/**
 * Create Program Kanban configuration optimized for Feature flow
 */
export declare function createSafeProgramKanbanConfig(eventBus?: EventEmitter): WorkflowKanbanConfig;
/**
 * Create Team Kanban configuration optimized for Story/Task flow
 */
export declare function createSafeTeamKanbanConfig(eventBus?: EventEmitter): WorkflowKanbanConfig;
/**
 * Create Portfolio Kanban for Epic lifecycle management
 */
export declare function createSafePortfolioKanban(logger: createSafePortfolioKanbanConfig): any;
/**
 * Convert PortfolioEpic to WorkflowTask for kanban processing
 */
export declare function portfolioEpicToKanbanTask(epic: PortfolioEpic, wsjf?: WSJFPriority): WorkflowTask;
/**
 * Convert Feature to WorkflowTask for program kanban
 */
export declare function featureToKanbanTask(feature: Feature): WorkflowTask;
/**
 * Convert Story to WorkflowTask for team kanban
 */
export declare function storyToKanbanTask(story: Story): WorkflowTask;
export {};
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
//# sourceMappingURL=kanban-integration.d.ts.map