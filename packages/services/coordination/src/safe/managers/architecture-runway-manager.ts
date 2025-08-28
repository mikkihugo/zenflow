/**
 * @fileoverview Architecture Runway Manager - Comprehensive SAFe architecture management.
 *
 * Lightweight facade for architecture runway management that delegates to specialized services
 * for runway item management, technical debt tracking, architecture decisions, and capability management.
 *
 * Delegates to: * - RunwayItemManagementService for architecture runway items and backlog management
 * - TechnicalDebtManagementService for technical debt tracking and remediation
 * - ArchitectureDecisionManagementService for architecture decision records (ADRs)
 * - CapabilityManagementService for architecture capability tracking and development
 *
 * REDUCTION: 650 → 630 lines (3.1% reduction) through service delegation and code cleanup
 *
 * Part of the @claude-zen/safe-framework package providing comprehensive
 * Scaled Agile Framework (SAFe) integration capabilities.
 */
import { EventBus} from '@claude-zen/foundation')import type { Logger, MemorySystem, EventBus} from '../types')import { createEvent, EventPriority, getLogger} from '../types')// =========================================================================== = ''; 
// ARCHITECTURE RUNWAY CONFIGURATION
// ============================================================================
/**
 * Architecture Runway Manager configuration
 */
export interface ArchitectureRunwayConfig {
  readonly enableAGUIIntegration: 'identified| approved| planned| in-progress||',resolved')  createdAt: new ArchitectureRunwayManager(memory, eventBus, config);
 * await runwayManager.initialize();
 *
 * const item = await runwayManager.addRunwayItem({
 *   title, *   type : 'infrastructure,'
 *   priority: false;
  constructor(
    memory: {},
    eventBus: EventBus,
    config: ArchitectureRunwayConfig = {}
  ) {
    ')    super();')    this.logger = getLogger('ArchitectureRunwayManager');
    this.memory = memory;
    this.eventBus = eventBus;
    this.config = {
      enableAGUIIntegration: await import(';')';
       '../services/architecture/runway-item-management-service'));
      this.runwayItemService = new RunwayItemManagementService(this.logger);
      await this.runwayItemService.initialize();
      // Delegate to TechnicalDebtManagementService
      const { TechnicalDebtManagementService} = await import(
       '../services/architecture/technical-debt-management-service'));
      this.technicalDebtService = new TechnicalDebtManagementService(
        this.logger
      );
      await this.technicalDebtService.initialize();
      // Delegate to ArchitectureDecisionManagementService
      const { ArchitectureDecisionManagementService} = await import(';')';
       '../services/architecture/architecture-decision-management-service'));
      this.architectureDecisionService =
        new ArchitectureDecisionManagementService(this.logger);
      await this.architectureDecisionService.initialize();
      // Delegate to CapabilityManagementService
      const { CapabilityManagementService} = await import(
       '../services/architecture/capability-management-service'));
      this.capabilityService = new CapabilityManagementService(this.logger);
      await this.capabilityService.initialize();
      // Emit initialization event
      this.eventBus.emit(';')';
       'architecture-runway: true;')      this.logger.info('Architecture Runway Manager initialized successfully');
} catch (error) {
      this.logger.error(';')';
       'Failed to initialize Architecture Runway Manager:,';
        error
      );
      throw error;
}
}
  /**
   * Add Runway Item - Delegates to RunwayItemManagementService
   */
  async addRunwayItem(
    item: await this.runwayItemService.addRunwayItem(item);
      // Emit local events for backward compatibility')      this.emit('runway-item: await this.runwayItemService.updateRunwayItemStatus(
        itemId,
        status,
        context;
      );
      if (updatedItem) {
        // Emit local events for backward compatibility
        this.emit('runway-item: status-updated,{';
          item: updatedItem,
          oldStatus: status,')';
});
        this.eventBus.emit(';')';
         'architecture-runway: item: status-updated,';
          createEvent('architecture-runway: item: status-updated,{';
            itemId,
            oldStatus: status,
            newStatus: updatedItem.status,')';
};
        );
}
      return updatedItem;
} catch (error) {
    ')      this.logger.error('Failed to update runway item status:, error');
      throw error;
}
}
  /**
   * Add Technical Debt Item - Delegates to TechnicalDebtManagementService
   */
  async addTechnicalDebtItem(';')';
    item: Omit<TechnicalDebtItem,'id| createdAt| updatedAt| status'>';
  ):Promise<TechnicalDebtItem> {
    if (!this.initialized) await this.initialize();
    if (!this.config.enableTechnicalDebtManagement) {
      throw new Error('Technical debt management is not enabled');
}
    try {
      // Delegate to specialized service
      const debtItem =;
        await this.technicalDebtService.addTechnicalDebtItem(item);')      // Emit local events for backward compatibility')      this.emit('technical-debt: added,{ item: debtItem};);
      this.eventBus.emit(';')';
       'architecture-runway: debt: added,';
        createEvent('architecture-runway: debt: added,';
          itemId: debtItem.id,
          severity: debtItem.severity,
          component: debtItem.component,));
      return debtItem;')';
} catch (error) {
    ')      this.logger.error('Failed to add technical debt item:, error');
      throw error;
}
}
  /**
   * Create Architecture Decision Record - Delegates to ArchitectureDecisionManagementService
   */
  async createArchitectureDecisionRecord(
    decision: Omit<
      ArchitectureDecisionRecord,')     'id| createdAt| updatedAt| status')    >';
  ):Promise<ArchitectureDecisionRecord> {
    if (!this.initialized) await this.initialize();
    try {
      // Delegate to specialized service
      const adr =
        await this.architectureDecisionService.createArchitectureDecisionRecord(
          decision;
        );
      // Emit local events for backward compatibility
      this.emit('architecture-decision: await this.capabilityService.addCapability(capability);')      // Emit local events for backward compatibility')      this.emit('capability: await Promise.all([
        this.runwayItemService.getRunwayDashboard(),
        this.technicalDebtService.getTechnicalDebtDashboard(),
        this.architectureDecisionService.getADRDashboard(),
        this.capabilityService.getCapabilityDashboard(),
]);
      // Combine all dashboard data
      return {
        runwayItems: {
        title: decision.title,
        description: decision.description``;
        context,    ')        options: decision.options.map((opt) => ({';
          title: opt.title,
          description: opt.description,
          pros: opt.pros,
          cons: opt.cons,
          estimatedCost: 1000, // Default cost
          estimatedEffort: 40, // Default effort
          riskLevel: decision.impact ==='critical')              ? 'high' :(' medium 'as' low| medium| high'),';
})),')        requester : 'architecture-runway-manager')        stakeholders:['architect,' tech-lead'],';
        deadline: decision.deadline,')        priority: decision.impact aslow' | ' medium'|' high|`critical,`;
        businessJustification,    ')};;
      // Delegate to specialized service
      const result =
        await this.architectureDecisionService.requestArchitectureDecision(
          decisionRequest;
        );
      // Emit event for decision tracking
      this.eventBus.emit(
       'architecture-runway: await Promise.all([
        this.runwayItemService.getRunwayAnalytics(),
        this.technicalDebtService.getTechnicalDebtDashboard(),
        this.architectureDecisionService.getADRDashboard(),
        this.capabilityService.getCapabilityAnalytics(),
]);
      return {
        runway: {
          totalItems: runwayAnalytics?.totalItems|| 0,
          itemsByStatus: runwayAnalytics?.itemsByStatus|| {},
          itemsByPriority: runwayAnalytics?.itemsByPriority|| {},
},
        technicalDebt: {
          totalDebt: debtAnalytics.totalDebtItems,
          debtByStatus: debtAnalytics.debtByStatus,
          debtBySeverity: debtAnalytics.debtBySeverity,
},
        capabilities: {
          totalCapabilities: capabilityAnalytics?.totalCapabilities|| 0,
          capabilitiesByCategory: capabilityAnalytics?.capabilitiesByCategory|| {},
},
        decisions: {
          totalDecisions: adrAnalytics.totalDecisions,
          decisionsByStatus: adrAnalytics.decisionsByStatus,
},
};
} catch (error) {
    ')      this.logger.error('Failed to get analytics:, error');
      throw error;
}
}
  /**
   * Get runway item by ID - Delegates to RunwayItemManagementService
   */
  getRunwayItem(itemId: string): ArchitectureRunwayItem| undefined {
    if (!this.initialized) return undefined;
    return this.runwayItemService?.getRunwayItem(itemId);
}
  /**
   * Get all runway items - Delegates to RunwayItemManagementService
   */
  getAllRunwayItems():ArchitectureRunwayItem[] {
    if (!this.initialized) return [];
    return this.runwayItemService?.getAllRunwayItems()|| [];
}
  /**
   * Get technical debt item by ID - Delegates to TechnicalDebtManagementService
   */
  getTechnicalDebtItem(itemId: string): TechnicalDebtItem| undefined {
    if (!this.initialized) return undefined;
    return this.technicalDebtService?.getDebtItem(itemId);
}
  /**
   * Get all technical debt items - Delegates to TechnicalDebtManagementService
   */
  getAllTechnicalDebtItems():TechnicalDebtItem[] {
    if (!this.initialized) return [];
    return this.technicalDebtService?.getAllDebtItems()|| [];
}
  /**
   * Get architecture decision record by ID - Delegates to ArchitectureDecisionManagementService
   */
  getArchitectureDecisionRecord(
    adrId: string
  ):ArchitectureDecisionRecord| undefined {
    if (!this.initialized) return undefined;
    return this.architectureDecisionService?.getDecisionRecord(adrId);
}
  /**
   * Get all architecture decision records - Delegates to ArchitectureDecisionManagementService
   */
  getAllArchitectureDecisionRecords():ArchitectureDecisionRecord[] {
    if (!this.initialized) return [];
    return this.architectureDecisionService?.getAllDecisionRecords()|| [];
}
  /**
   * Get capability by ID - Delegates to CapabilityManagementService
   */
  getCapability(capabilityId: string): ArchitectureCapability| undefined {
    if (!this.initialized) return undefined;
    return this.capabilityService?.getCapability(capabilityId);
}
  /**
   * Get all capabilities - Delegates to CapabilityManagementService
   */
  getAllCapabilities():ArchitectureCapability[] {
    if (!this.initialized) return [];
    return this.capabilityService?.getAllCapabilities()|| [];
}
  // ============================================================================
  // SERVICE DELEGATION - All complex logic moved to specialized services
  // ============================================================================
  //
  // This facade delegates all operations to: false;
      this.eventBus.emit(';')';
       'architecture-runway: shutdown,';
        createEvent('architecture-runway: shutdown,{ timestamp: Date.now()})';
      );')      this.logger.info('Architecture Runway Manager shutdown complete');
} catch (error) {
      this.logger.error('')';
       'Error during Architecture Runway Manager shutdown:,';
        error
      );
      throw error;
}
};)};;
export default ArchitectureRunwayManager;
')';