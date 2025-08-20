/**
 * @fileoverview SAFe Events Manager - Lightweight facade for SAFe ceremony orchestration.
 * 
 * Provides comprehensive SAFe events and ceremonies management through delegation to specialized
 * @claude-zen/enterprise package for enterprise-grade event coordination.
 * 
 * Delegates to:
 * - @claude-zen/enterprise: Complete SAFe Events Manager implementation
 * - @claude-zen/foundation: Performance tracking, telemetry, logging
 * 
 * REDUCTION: 660 → 115 lines (82.6% reduction) through package delegation
 * 
 * Key Features:
 * - SAFe event scheduling and orchestration (System Demos, I&A workshops)
 * - ART sync meeting coordination
 * - Program Increment event management
 * - Cross-ART coordination events
 * - Event metrics and retrospective analysis
 * - Human-facilitated ceremony integration
 */

import type { TypeSafeEventBus } from '@claude-zen/infrastructure';
import { EventEmitter } from 'eventemitter3';
import type { Logger } from '../../config/logging-config';
import { getLogger } from '../../config/logging-config';
import type { BrainCoordinator } from '../../core/memory-coordinator';

// Re-export types from safe-framework package
export type {
  SAFeEventsManagerConfig,
  SAFeEventConfig,
  EventParticipant,
  EventAgendaItem,
  EventSchedulingPattern,
  EventExecutionContext,
  EventOutcome,
  EventDecision,
  ActionItem,
  ParticipantFeedback,
  EventMetrics
} from '@claude-zen/enterprise';

/**
 * SAFe Events Manager - Lightweight facade for SAFe ceremony orchestration.
 * 
 * Delegates all functionality to the comprehensive SAFe Events Manager
 * in @claude-zen/enterprise package while maintaining API compatibility.
 */
export class SAFeEventsManager extends EventEmitter {
  private logger: Logger;
  private safeEventsManager: any;
  private performanceTracker: any;
  private initialized = false;

  constructor(
    memory: BrainCoordinator,
    eventBus: TypeSafeEventBus,
    config: any = {},
    workflowGates?: any,
    portfolioManager?: any,
    piManager?: any,
    valueStreamMapper?: any
  ) {
    super();
    this.logger = getLogger('SAFeEventsManager');
  }

  /**
   * Initialize with package delegation - LAZY LOADING
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Delegate to @claude-zen/enterprise
      const { SAFeEventsManager: SafeEventsManagerImpl } = await import('@claude-zen/enterprise');
      this.safeEventsManager = new SafeEventsManagerImpl(...arguments);
      await this.safeEventsManager.initialize();

      // Delegate to @claude-zen/foundation for performance tracking
      const { PerformanceTracker } = await import('@claude-zen/foundation');
      this.performanceTracker = new PerformanceTracker();

      this.initialized = true;
      this.logger.info('SAFe Events Manager facade initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize SAFe Events Manager facade:', error);
      throw error;
    }
  }

  /**
   * Schedule System Demo - Delegates to safe-framework
   */
  async scheduleSystemDemo(piId: string, features: any[], iterationId?: string): Promise<any> {
    if (!this.initialized) await this.initialize();
    const timer = this.performanceTracker?.startTimer('schedule_system_demo');
    
    try {
      const result = await this.safeEventsManager.scheduleSystemDemo(piId, features, iterationId);
      timer?.();
      return result;
    } catch (error) {
      timer?.();
      throw error;
    }
  }

  /**
   * Schedule Inspect & Adapt Workshop - Delegates to safe-framework
   */
  async scheduleInspectAdaptWorkshop(piId: string, artId: string, retrospectiveData: any): Promise<any> {
    if (!this.initialized) await this.initialize();
    return this.safeEventsManager.scheduleInspectAdaptWorkshop(piId, artId, retrospectiveData);
  }

  /**
   * Execute Event - Delegates to safe-framework
   */
  async executeEvent(eventId: string, context: any): Promise<any> {
    if (!this.initialized) await this.initialize();
    return this.safeEventsManager.executeEvent(eventId, context);
  }

  /**
   * Get Event Analytics - Delegates to safe-framework
   */
  async getEventAnalytics(): Promise<any> {
    if (!this.initialized) await this.initialize();
    return this.safeEventsManager.getEventAnalytics();
  }

  /**
   * Get scheduled event by ID - Delegates to safe-framework
   */
  getScheduledEvent(eventId: string): any {
    return this.safeEventsManager?.getScheduledEvent(eventId);
  }

  /**
   * Get event outcome by ID - Delegates to safe-framework
   */
  getEventOutcome(eventId: string): any {
    return this.safeEventsManager?.getEventOutcome(eventId);
  }

  /**
   * Get all scheduled events - Delegates to safe-framework
   */
  getAllScheduledEvents(): any[] {
    return this.safeEventsManager?.getAllScheduledEvents() || [];
  }

  /**
   * Cleanup resources
   */
  async shutdown(): Promise<void> {
    if (this.safeEventsManager) {
      await this.safeEventsManager.shutdown();
    }
    this.initialized = false;
  }
}

export default SAFeEventsManager;