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
 * Part of the coordination package providing comprehensive
 * Scaled Agile Framework (SAFe) integration capabilities.
 */
import { EventBus} from '@claude-zen/foundation')../types')../types')'; 
// ARCHITECTURE RUNWAY CONFIGURATION
// ============================================================================
/**
 * Architecture Runway Manager configuration
 */
export interface ArchitectureRunwayConfig {
  readonly enableAGUIIntegration: 'identified| approved| planned| in-progress||',resolved')infrastructure,'
 *   priority: false;
  constructor(): void {
    '))    this.logger = getLogger(): void {
        // Emit local events for backward compatibility
        this.emit(): void {';
            itemId,
            oldStatus: status,
            newStatus: updatedItem.status,');
};
        );
}
      return updatedItem;
} catch (error) {
    ')Failed to update runway item status:, error');): Promise<void> {
    if (!this.initialized) await this.initialize(): void {
      throw new Error(): void { item: debtItem};);
      this.eventBus.emit(): void {
    ')Failed to add technical debt item:, error')): Promise<void> {
    if (!this.initialized) await this.initialize(): void {
      // Delegate to specialized service
      const adr =
        await this.architectureDecisionService.createArchitectureDecisionRecord(): void {
        runwayItems:  {
        title: decision.title,
        description: decision.description`";"
        context,    ');
          title: opt.title,
          description: opt.description,
          pros: opt.pros,
          cons: opt.cons,
          estimatedCost: 1000, // Default cost
          estimatedEffort: 40, // Default effort
          riskLevel: decision.impact ==='critical')high' :(' medium 'as' low| medium| high');
})),')architecture-runway-manager')architect,' tech-lead'],';
        deadline: decision.deadline,') | ' medium'|' high|"critical";
        businessJustification,    ')architecture-runway: await Promise.all(): void {
        runway:  {
          totalItems: runwayAnalytics?.totalItems|| 0,
          itemsByStatus: runwayAnalytics?.itemsByStatus|| {},
          itemsByPriority: runwayAnalytics?.itemsByPriority|| {},
},
        technicalDebt:  {
          totalDebt: debtAnalytics.totalDebtItems,
          debtByStatus: debtAnalytics.debtByStatus,
          debtBySeverity: debtAnalytics.debtBySeverity,
},
        capabilities:  {
          totalCapabilities: capabilityAnalytics?.totalCapabilities|| 0,
          capabilitiesByCategory: capabilityAnalytics?.capabilitiesByCategory|| {},
},
        decisions:  {
          totalDecisions: adrAnalytics.totalDecisions,
          decisionsByStatus: adrAnalytics.decisionsByStatus,
},
};
} catch (error) {
    ')Failed to get analytics:, error');)';
       'architecture-runway: shutdown,';
        createEvent('architecture-runway: shutdown,{ timestamp: Date.now()})';
      );')Architecture Runway Manager shutdown complete')');
       'Error during Architecture Runway Manager shutdown:,';
        error
      );
      throw error;
}
};)};
export default ArchitectureRunwayManager;
');