/**
 * @fileoverview Architecture Runway Manager - Comprehensive SAFe architecture management.
 * 
 * Lightweight facade for architecture runway management that delegates to specialized services
 * for runway item management, technical debt tracking, architecture decisions, and capability management.
 * 
 * Delegates to:
 * - RunwayItemManagementService for architecture runway items and backlog management
 * - TechnicalDebtManagementService for technical debt tracking and remediation
 * - ArchitectureDecisionManagementService for architecture decision records (ADRs) 
 * - CapabilityManagementService for architecture capability tracking and development
 * 
 * REDUCTION: 650 → 630 lines (3.1% reduction) through service delegation and code cleanup
 * 
 * Part of the @claude-zen/safe-framework package providing comprehensive
 * Scaled Agile Framework (SAFe) integration capabilities.
 */

import { TypedEventBase } from '@claude-zen/foundation';
import type { Logger, MemorySystem, TypeSafeEventBus } from '../types';
import { getLogger, createEvent, EventPriority } from '../types';

// ============================================================================
// ARCHITECTURE RUNWAY CONFIGURATION
// ============================================================================

/**
 * Architecture Runway Manager configuration
 */
export interface ArchitectureRunwayConfig {
  readonly enableAGUIIntegration: boolean;
  readonly enableAutomatedTracking: boolean;
  readonly enableTechnicalDebtManagement: boolean;
  readonly enableArchitectureGovernance: boolean;
  readonly enableRunwayPlanning: boolean;
  readonly enableCapabilityTracking: boolean;
  readonly maxRunwayItems: number;
  readonly runwayPlanningHorizon: number; // in days
  readonly technicalDebtThreshold: number;
  readonly governanceApprovalThreshold: number;
}

/**
 * Architecture Runway Item
 */
export interface ArchitectureRunwayItem {
  id: string;
  title: string;
  description: string;
  type: 'infrastructure' | 'platform' | 'enabler' | 'technical-debt';
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: number; // story points or hours
  dependencies: string[];
  status: 'backlog' | 'planned' | 'in-progress' | 'completed' | 'blocked';
  assignedTo?: string;
  targetPI?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Technical Debt Item
 */
export interface TechnicalDebtItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  effort: number;
  component: string;
  status: 'identified' | 'approved' | 'planned' | 'in-progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Architecture Decision Record
 */
export interface ArchitectureDecisionRecord {
  id: string;
  title: string;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  context: string;
  decision: string;
  consequences: string[];
  alternatives: string[];
  createdAt: Date;
  updatedAt: Date;
  author: string;
  stakeholders: string[];
}

/**
 * Architecture Capability
 */
export interface ArchitectureCapability {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'technology' | 'process';
  maturityLevel: number; // 1-5 scale
  status: 'developing' | 'active' | 'retiring' | 'deprecated';
  enablers: string[]; // References to runway items
  dependencies: string[];
  kpis: CapabilityKPI[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Capability KPI
 */
export interface CapabilityKPI {
  id: string;
  name: string;
  description: string;
  metric: string;
  target: number;
  current: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
}

/**
 * Architecture Runway Manager - Comprehensive SAFe architecture management.
 * 
 * Lightweight facade that delegates to specialized services for architecture runway management,
 * technical debt tracking, architecture decisions, and capability management.
 *
 * @example Basic usage
 * ```typescript
 * const runwayManager = new ArchitectureRunwayManager(memory, eventBus, config);
 * await runwayManager.initialize();
 * 
 * const item = await runwayManager.addRunwayItem({
 *   title: 'API Gateway Implementation',
 *   type: 'infrastructure',
 *   priority: 'high',
 *   effort: 13
 * });
 * ```
 */
export class ArchitectureRunwayManager extends TypedEventBase {
  private logger: Logger;
  private memory: MemorySystem;
  private eventBus: TypeSafeEventBus;
  private config: ArchitectureRunwayConfig;
  
  // Specialized services (lazy-loaded)
  private runwayItemService?: any;
  private technicalDebtService?: any;
  private architectureDecisionService?: any;
  private capabilityService?: any;
  private initialized = false;

  constructor(
    memory: MemorySystem,
    eventBus: TypeSafeEventBus,
    config: Partial<ArchitectureRunwayConfig> = {}
  ) {
    super();
    this.logger = getLogger('ArchitectureRunwayManager');
    this.memory = memory;
    this.eventBus = eventBus;
    
    this.config = {
      enableAGUIIntegration: true,
      enableAutomatedTracking: true,
      enableTechnicalDebtManagement: true,
      enableArchitectureGovernance: true,
      enableRunwayPlanning: true,
      enableCapabilityTracking: true,
      maxRunwayItems: 100,
      runwayPlanningHorizon: 180, // 6 months
      technicalDebtThreshold: 80, // 80% threshold
      governanceApprovalThreshold: 1000, // effort threshold
      ...config,
    };
  }

  /**
   * Initialize with service delegation - LAZY LOADING
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.logger.info('Initializing Architecture Runway Manager');

      // Delegate to RunwayItemManagementService
      const { RunwayItemManagementService } = await import('../services/architecture/runway-item-management-service');
      this.runwayItemService = new RunwayItemManagementService(this.logger);
      await this.runwayItemService.initialize();

      // Delegate to TechnicalDebtManagementService
      const { TechnicalDebtManagementService } = await import('../services/architecture/technical-debt-management-service');
      this.technicalDebtService = new TechnicalDebtManagementService(this.logger);
      await this.technicalDebtService.initialize();

      // Delegate to ArchitectureDecisionManagementService
      const { ArchitectureDecisionManagementService } = await import('../services/architecture/architecture-decision-management-service');
      this.architectureDecisionService = new ArchitectureDecisionManagementService(this.logger);
      await this.architectureDecisionService.initialize();

      // Delegate to CapabilityManagementService
      const { CapabilityManagementService } = await import('../services/architecture/capability-management-service');
      this.capabilityService = new CapabilityManagementService(this.logger);
      await this.capabilityService.initialize();

      // Emit initialization event
      this.eventBus.emit('architecture-runway:initialized', createEvent(
        'architecture-runway:initialized',
        { timestamp: Date.now() },
        EventPriority.NORMAL
      ));

      this.initialized = true;
      this.logger.info('Architecture Runway Manager initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize Architecture Runway Manager:', error);
      throw error;
    }
  }

  /**
   * Add Runway Item - Delegates to RunwayItemManagementService
   */
  async addRunwayItem(
    item: Omit<ArchitectureRunwayItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<ArchitectureRunwayItem> {
    if (!this.initialized) await this.initialize();

    try {
      // Delegate to specialized service
      const runwayItem = await this.runwayItemService.addRunwayItem(item);

      // Emit local events for backward compatibility
      this.emit('runway-item:added', { item: runwayItem });
      this.eventBus.emit('architecture-runway:item:added', createEvent(
        'architecture-runway:item:added',
        { itemId: runwayItem.id, type: runwayItem.type, priority: runwayItem.priority }
      ));

      return runwayItem;

    } catch (error) {
      this.logger.error('Failed to add runway item:', error);
      throw error;
    }
  }

  /**
   * Update Runway Item Status - Delegates to RunwayItemManagementService
   */
  async updateRunwayItemStatus(
    itemId: string,
    status: ArchitectureRunwayItem['status'],
    context?: any
  ): Promise<ArchitectureRunwayItem | null> {
    if (!this.initialized) await this.initialize();

    try {
      // Delegate to specialized service
      const updatedItem = await this.runwayItemService.updateRunwayItemStatus(itemId, status, context);
      
      if (updatedItem) {
        // Emit local events for backward compatibility
        this.emit('runway-item:status-updated', { item: updatedItem, oldStatus: status });
        this.eventBus.emit('architecture-runway:item:status-updated', createEvent(
          'architecture-runway:item:status-updated',
          { itemId, oldStatus: status, newStatus: updatedItem.status }
        ));
      }

      return updatedItem;

    } catch (error) {
      this.logger.error('Failed to update runway item status:', error);
      throw error;
    }
  }

  /**
   * Add Technical Debt Item - Delegates to TechnicalDebtManagementService
   */
  async addTechnicalDebtItem(
    item: Omit<TechnicalDebtItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<TechnicalDebtItem> {
    if (!this.initialized) await this.initialize();
    if (!this.config.enableTechnicalDebtManagement) {
      throw new Error('Technical debt management is not enabled');
    }

    try {
      // Delegate to specialized service
      const debtItem = await this.technicalDebtService.addTechnicalDebtItem(item);

      // Emit local events for backward compatibility
      this.emit('technical-debt:added', { item: debtItem });
      this.eventBus.emit('architecture-runway:debt:added', createEvent(
        'architecture-runway:debt:added',
        { itemId: debtItem.id, severity: debtItem.severity, component: debtItem.component }
      ));

      return debtItem;

    } catch (error) {
      this.logger.error('Failed to add technical debt item:', error);
      throw error;
    }
  }

  /**
   * Create Architecture Decision Record - Delegates to ArchitectureDecisionManagementService
   */
  async createArchitectureDecisionRecord(
    decision: Omit<ArchitectureDecisionRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<ArchitectureDecisionRecord> {
    if (!this.initialized) await this.initialize();

    try {
      // Delegate to specialized service
      const adr = await this.architectureDecisionService.createArchitectureDecisionRecord(decision);

      // Emit local events for backward compatibility
      this.emit('architecture-decision:created', { adr });
      this.eventBus.emit('architecture-runway:adr:created', createEvent(
        'architecture-runway:adr:created',
        { adrId: adr.id, title: adr.title, author: adr.author }
      ));

      return adr;

    } catch (error) {
      this.logger.error('Failed to create architecture decision record:', error);
      throw error;
    }
  }

  /**
   * Add Architecture Capability - Delegates to CapabilityManagementService
   */
  async addCapability(
    capability: Omit<ArchitectureCapability, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ArchitectureCapability> {
    if (!this.initialized) await this.initialize();
    if (!this.config.enableCapabilityTracking) {
      throw new Error('Capability tracking is not enabled');
    }

    try {
      // Delegate to specialized service
      const cap = await this.capabilityService.addCapability(capability);

      // Emit local events for backward compatibility
      this.emit('capability:added', { capability: cap });
      this.eventBus.emit('architecture-runway:capability:added', createEvent(
        'architecture-runway:capability:added',
        { capabilityId: cap.id, name: cap.name, category: cap.category }
      ));

      return cap;

    } catch (error) {
      this.logger.error('Failed to add capability:', error);
      throw error;
    }
  }

  /**
   * Get Runway Planning Dashboard - Delegates to specialized services
   */
  async getRunwayPlanningDashboard(): Promise<any> {
    if (!this.initialized) await this.initialize();

    try {
      // Get dashboard data from each specialized service
      const [runwayDashboard, debtDashboard, adrDashboard, capabilityDashboard] = await Promise.all([
        this.runwayItemService.getRunwayDashboard(),
        this.technicalDebtService.getTechnicalDebtDashboard(),
        this.architectureDecisionService.getADRDashboard(),
        this.capabilityService.getCapabilityDashboard()
      ]);

      // Combine all dashboard data
      return {
        runwayItems: {
          total: runwayDashboard.totalItems,
          byStatus: runwayDashboard.itemsByStatus,
          byPriority: runwayDashboard.itemsByPriority,
          byType: runwayDashboard.itemsByType
        },
        technicalDebt: {
          total: debtDashboard.totalDebtItems,
          bySeverity: debtDashboard.debtBySeverity,
          byStatus: debtDashboard.debtByStatus,
          totalEffort: debtDashboard.totalEffortRequired
        },
        capabilities: {
          total: capabilityDashboard.totalCapabilities,
          byCategory: capabilityDashboard.capabilitiesByCategory,
          byStatus: capabilityDashboard.capabilitiesByStatus,
          avgMaturity: capabilityDashboard.averageMaturity
        },
        decisions: {
          total: adrDashboard.totalDecisions,
          byStatus: adrDashboard.decisionsByStatus
        },
        lastUpdated: new Date()
      };

    } catch (error) {
      this.logger.error('Failed to get runway planning dashboard:', error);
      throw error;
    }
  }

  /**
   * Request Architecture Decision - Delegates to ArchitectureDecisionManagementService
   */
  async requestArchitectureDecision(
    decision: {
      title: string;
      description: string;
      options: Array<{ title: string; description: string; pros: string[]; cons: string[] }>;
      impact: 'low' | 'medium' | 'high' | 'critical';
      deadline?: Date;
    }
  ): Promise<{ approved: boolean; selectedOption?: number; comments?: string }> {
    if (!this.initialized) await this.initialize();

    try {
      // Transform request to service format
      const decisionRequest = {
        title: decision.title,
        description: decision.description,
        context: `Architecture decision requested with ${decision.options.length} options`,
        options: decision.options.map(opt => ({
          title: opt.title,
          description: opt.description,
          pros: opt.pros,
          cons: opt.cons,
          estimatedCost: 1000, // Default cost
          estimatedEffort: 40,  // Default effort
          riskLevel: decision.impact === 'critical' ? 'high' : 'medium' as 'low' | 'medium' | 'high'
        })),
        requester: 'architecture-runway-manager',
        stakeholders: ['architect', 'tech-lead'],
        deadline: decision.deadline,
        priority: decision.impact as 'low' | 'medium' | 'high' | 'critical',
        businessJustification: `Architecture decision with ${decision.impact} impact`
      };

      // Delegate to specialized service
      const result = await this.architectureDecisionService.requestArchitectureDecision(decisionRequest);

      // Emit event for decision tracking
      this.eventBus.emit('architecture-runway:decision:requested', createEvent(
        'architecture-runway:decision:requested',
        { title: decision.title, impact: decision.impact, optionsCount: decision.options.length }
      ));

      return {
        approved: result.approved,
        selectedOption: result.selectedOption,
        comments: result.comments
      };

    } catch (error) {
      this.logger.error('Failed to request architecture decision:', error);
      throw error;
    }
  }

  /**
   * Get Analytics - Delegates to specialized services
   */
  async getAnalytics(): Promise<any> {
    if (!this.initialized) await this.initialize();
    
    try {
      // Get analytics from each specialized service
      const [runwayAnalytics, debtAnalytics, adrAnalytics, capabilityAnalytics] = await Promise.all([
        this.runwayItemService.getRunwayAnalytics(),
        this.technicalDebtService.getTechnicalDebtDashboard(), 
        this.architectureDecisionService.getADRDashboard(),
        this.capabilityService.getCapabilityAnalytics()
      ]);

      return {
        runway: {
          totalItems: runwayAnalytics?.totalItems || 0,
          itemsByStatus: runwayAnalytics?.itemsByStatus || {},
          itemsByPriority: runwayAnalytics?.itemsByPriority || {}
        },
        technicalDebt: {
          totalDebt: debtAnalytics.totalDebtItems,
          debtByStatus: debtAnalytics.debtByStatus,
          debtBySeverity: debtAnalytics.debtBySeverity
        },
        capabilities: {
          totalCapabilities: capabilityAnalytics?.totalCapabilities || 0,
          capabilitiesByCategory: capabilityAnalytics?.capabilitiesByCategory || {}
        },
        decisions: {
          totalDecisions: adrAnalytics.totalDecisions,
          decisionsByStatus: adrAnalytics.decisionsByStatus
        }
      };
    } catch (error) {
      this.logger.error('Failed to get analytics:', error);
      throw error;
    }
  }

  /**
   * Get runway item by ID - Delegates to RunwayItemManagementService
   */
  getRunwayItem(itemId: string): ArchitectureRunwayItem | undefined {
    if (!this.initialized) return undefined;
    return this.runwayItemService?.getRunwayItem(itemId);
  }

  /**
   * Get all runway items - Delegates to RunwayItemManagementService
   */
  getAllRunwayItems(): ArchitectureRunwayItem[] {
    if (!this.initialized) return [];
    return this.runwayItemService?.getAllRunwayItems() || [];
  }

  /**
   * Get technical debt item by ID - Delegates to TechnicalDebtManagementService
   */
  getTechnicalDebtItem(itemId: string): TechnicalDebtItem | undefined {
    if (!this.initialized) return undefined;
    return this.technicalDebtService?.getDebtItem(itemId);
  }

  /**
   * Get all technical debt items - Delegates to TechnicalDebtManagementService
   */
  getAllTechnicalDebtItems(): TechnicalDebtItem[] {
    if (!this.initialized) return [];
    return this.technicalDebtService?.getAllDebtItems() || [];
  }

  /**
   * Get architecture decision record by ID - Delegates to ArchitectureDecisionManagementService
   */
  getArchitectureDecisionRecord(adrId: string): ArchitectureDecisionRecord | undefined {
    if (!this.initialized) return undefined;
    return this.architectureDecisionService?.getDecisionRecord(adrId);
  }

  /**
   * Get all architecture decision records - Delegates to ArchitectureDecisionManagementService
   */
  getAllArchitectureDecisionRecords(): ArchitectureDecisionRecord[] {
    if (!this.initialized) return [];
    return this.architectureDecisionService?.getAllDecisionRecords() || [];
  }

  /**
   * Get capability by ID - Delegates to CapabilityManagementService
   */
  getCapability(capabilityId: string): ArchitectureCapability | undefined {
    if (!this.initialized) return undefined;
    return this.capabilityService?.getCapability(capabilityId);
  }

  /**
   * Get all capabilities - Delegates to CapabilityManagementService
   */
  getAllCapabilities(): ArchitectureCapability[] {
    if (!this.initialized) return [];
    return this.capabilityService?.getAllCapabilities() || [];
  }

  // ============================================================================
  // SERVICE DELEGATION - All complex logic moved to specialized services
  // ============================================================================
  // 
  // This facade delegates all operations to:
  // - RunwayItemManagementService: Architecture runway items and backlog management
  // - TechnicalDebtManagementService: Technical debt tracking and remediation
  // - ArchitectureDecisionManagementService: Architecture decision records (ADRs)
  // - CapabilityManagementService: Architecture capability tracking and development
  //
  // Private helper methods are no longer needed as services handle all implementation details.

  /**
   * Cleanup resources - Delegates shutdown to specialized services
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Architecture Runway Manager');
    
    try {
      // Shutdown all specialized services
      if (this.runwayItemService?.shutdown) {
        await this.runwayItemService.shutdown();
      }
      if (this.technicalDebtService?.shutdown) {
        await this.technicalDebtService.shutdown();
      }
      if (this.architectureDecisionService?.shutdown) {
        await this.architectureDecisionService.shutdown();
      }
      if (this.capabilityService?.shutdown) {
        await this.capabilityService.shutdown();
      }

      this.initialized = false;

      this.eventBus.emit('architecture-runway:shutdown', createEvent(
        'architecture-runway:shutdown',
        { timestamp: Date.now() }
      ));

      this.logger.info('Architecture Runway Manager shutdown complete');
      
    } catch (error) {
      this.logger.error('Error during Architecture Runway Manager shutdown:', error);
      throw error;
    }
  }
}

export default ArchitectureRunwayManager;