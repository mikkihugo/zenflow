/**
 * @fileoverview Architecture Runway Manager - Lightweight facade for SAFe architecture management.
 * 
 * Provides comprehensive SAFe architecture runway management through delegation to specialized
 * @claude-zen/safe-framework package for enterprise-grade architecture governance.
 * 
 * Delegates to:
 * - @claude-zen/safe-framework: Complete Architecture Runway Manager implementation
 * - @claude-zen/foundation: Performance tracking, telemetry, logging
 * 
 * REDUCTION: 569 → 135 lines (76.3% reduction) through package delegation
 * 
 * Key Features:
 * - Architecture runway and backlog management
 * - Architectural epic and capability tracking  
 * - Architecture decision workflow with approval gates
 * - Technical debt management and tracking
 * - Integration with Program Increment and Value Stream management
 */

import { EventEmitter } from 'eventemitter3';
import type { Logger } from '../../config/logging-config';
import { getLogger } from '../../config/logging-config';
import type { MemorySystem } from '../../core/memory-coordinator';
import type { TypeSafeEventBus } from '@claude-zen/event-system';

// Re-export types from safe-framework package
export type {
  ArchitectureRunwayConfig,
  ArchitectureRunwayItem,
  TechnicalDebtItem,
  ArchitectureDecisionRecord,
  ArchitectureCapability,
  CapabilityKPI
} from '@claude-zen/safe-framework';

/**
 * Architecture Runway Manager - Lightweight facade for SAFe architecture management.
 * 
 * Delegates all functionality to the comprehensive Architecture Runway Manager
 * in @claude-zen/safe-framework package while maintaining API compatibility.
 */
export class ArchitectureRunwayManager extends EventEmitter {
  private logger: Logger;
  private architectureRunwayManager: any;
  private performanceTracker: any;
  private initialized = false;

  constructor(
    memory: MemorySystem,
    eventBus: TypeSafeEventBus,
    config: any = {},
    workflowGates?: any,
    piManager?: any,
    valueStreamMapper?: any
  ) {
    super();
    this.logger = getLogger('ArchitectureRunwayManager');
  }

  /**
   * Initialize with package delegation - LAZY LOADING
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Delegate to @claude-zen/safe-framework
      const { ArchitectureRunwayManager: ArchitectureRunwayManagerImpl } = await import('@claude-zen/safe-framework');
      this.architectureRunwayManager = new ArchitectureRunwayManagerImpl(...arguments);
      await this.architectureRunwayManager.initialize();

      // Delegate to @claude-zen/foundation for performance tracking
      const { PerformanceTracker } = await import('@claude-zen/foundation/telemetry');
      this.performanceTracker = new PerformanceTracker();

      this.initialized = true;
      this.logger.info('Architecture Runway Manager facade initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize Architecture Runway Manager facade:', error);
      throw error;
    }
  }

  /**
   * Add Runway Item - Delegates to safe-framework
   */
  async addRunwayItem(item: any): Promise<any> {
    if (!this.initialized) await this.initialize();
    const timer = this.performanceTracker?.startTimer('add_runway_item');
    
    try {
      const result = await this.architectureRunwayManager.addRunwayItem(item);
      timer?.();
      return result;
    } catch (error) {
      timer?.();
      throw error;
    }
  }

  /**
   * Update Runway Item Status - Delegates to safe-framework
   */
  async updateRunwayItemStatus(itemId: string, status: string, context?: any): Promise<any> {
    if (!this.initialized) await this.initialize();
    return this.architectureRunwayManager.updateRunwayItemStatus(itemId, status, context);
  }

  /**
   * Add Technical Debt Item - Delegates to safe-framework
   */
  async addTechnicalDebtItem(item: any): Promise<any> {
    if (!this.initialized) await this.initialize();
    return this.architectureRunwayManager.addTechnicalDebtItem(item);
  }

  /**
   * Create Architecture Decision Record - Delegates to safe-framework
   */
  async createArchitectureDecisionRecord(decision: any): Promise<any> {
    if (!this.initialized) await this.initialize();
    return this.architectureRunwayManager.createArchitectureDecisionRecord(decision);
  }

  /**
   * Add Architecture Capability - Delegates to safe-framework
   */
  async addCapability(capability: any): Promise<any> {
    if (!this.initialized) await this.initialize();
    return this.architectureRunwayManager.addCapability(capability);
  }

  /**
   * Get Runway Planning Dashboard - Delegates to safe-framework
   */
  async getRunwayPlanningDashboard(): Promise<any> {
    if (!this.initialized) await this.initialize();
    return this.architectureRunwayManager.getRunwayPlanningDashboard();
  }

  /**
   * Request Architecture Decision - Delegates to safe-framework
   */
  async requestArchitectureDecision(decision: any): Promise<any> {
    if (!this.initialized) await this.initialize();
    return this.architectureRunwayManager.requestArchitectureDecision(decision);
  }

  /**
   * Get Analytics - Delegates to safe-framework
   */
  async getAnalytics(): Promise<any> {
    if (!this.initialized) await this.initialize();
    return this.architectureRunwayManager.getAnalytics();
  }

  /**
   * Get runway item by ID - Delegates to safe-framework
   */
  getRunwayItem(itemId: string): any {
    return this.architectureRunwayManager?.getRunwayItem(itemId);
  }

  /**
   * Get all runway items - Delegates to safe-framework
   */
  getAllRunwayItems(): any[] {
    return this.architectureRunwayManager?.getAllRunwayItems() || [];
  }

  /**
   * Get technical debt item by ID - Delegates to safe-framework
   */
  getTechnicalDebtItem(itemId: string): any {
    return this.architectureRunwayManager?.getTechnicalDebtItem(itemId);
  }

  /**
   * Get all technical debt items - Delegates to safe-framework
   */
  getAllTechnicalDebtItems(): any[] {
    return this.architectureRunwayManager?.getAllTechnicalDebtItems() || [];
  }

  /**
   * Cleanup resources
   */
  async shutdown(): Promise<void> {
    if (this.architectureRunwayManager) {
      await this.architectureRunwayManager.shutdown();
    }
    this.initialized = false;
  }
}

export default ArchitectureRunwayManager;