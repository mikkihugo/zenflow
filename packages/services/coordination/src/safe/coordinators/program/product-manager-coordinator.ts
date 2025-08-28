/**
 * @fileoverview Product Manager Coordinator - Feature Backlog and Roadmap Management
 * 
 * Manages product strategy and program backlog:
 * - Feature prioritization and roadmap planning
 * - Customer needs analysis and market research
 * - Program backlog management and stakeholder communication
 * - Integration with TaskMaster for feature approval workflows
 * 
 * @author Claude-Zen SAFe Team
 * @since 1.0.0
 */

import { EventBus, getLogger } from '@claude-zen/foundation';
import type { 
  Feature,
  PIObjective,
  ProgramIncrement
} from '../../types';
const logger = getLogger('safe-product-manager-coordinator'');

interface CustomerNeed {
  id: string;
  description: string;
  priority: low'|'medium'|'high'|'critical';
  businessValue: number;
  marketSegment: string;
  validationStatus:'hypothesis'|'validated'|'rejected';
}

interface FeatureApprovalRequest {
  id: string;
  featureId: string;
  title: string;
  description: string;
  businessCase: string;
  requiredApprover: string;
  urgency:'low'|'medium'|'high';
  dueDate: Date;
  createdAt: Date;
}

export interface ProductManagerEvents {
 'feature:prioritized: {
    feature: Feature;
    priority: number;
    reasoning: string;
    businessValue: number;
    timestamp: number;
  };
 'backlog:updated: {
    addedFeatures: Feature[];
    removedFeatures: string[];
    reorderedFeatures: Feature[];
    programId: string;
    timestamp: number;
  };
 'customer:need_identified: {
    need: CustomerNeed;
    relatedFeatures: Feature[];
    marketOpportunity: number;
    timestamp: number;
  };
 'roadmap:updated: {
    programId: string;
    quarters: any[];
    milestones: any[];
    keyFeatures: Feature[];
    timestamp: number;
  };
 'feature:approval_requested: {
    feature: Feature;
    approvalRequest: FeatureApprovalRequest;
    businessJustification: string;
    timestamp: number;
  };
 'stakeholder:communicated: {
    stakeholderGroup: string;
    message: string;
    features: Feature[];
    feedback: string[];
    timestamp: number;
  };
}

export class ProductManagerCoordinator extends EventBus<ProductManagerEvents> {
  private programBacklog: Map<string, Feature[]> = new Map();
  private customerNeeds: Map<string, CustomerNeed> = new Map();
  private featurePriorities: Map<string, number> = new Map();
  private roadmaps: Map<string, any> = new Map();

  constructor() {
    super();
    logger.info('ProductManagerCoordinator initialized'');
  }

  /**
   * Prioritize feature using WSJF and business value analysis
   */
  async prioritizeFeature(
    feature: Feature,
    businessValue: number,
    urgency: number,
    jobSize: number,
    marketValidation: number
  ): Promise<void> {
    // WSJF calculation: (Business Value + Urgency + Market Validation) / Job Size
    const wsjfScore = (businessValue + urgency + marketValidation) / Math.max(jobSize, 1);
    
    this.featurePriorities.set(feature.id, wsjfScore);

    const reasoning = this.generatePrioritizationReasoning(
      businessValue, urgency, jobSize, marketValidation, wsjfScore
    );

    await this.emitSafe('feature:prioritized,{
      feature,
      priority: wsjfScore,
      reasoning,
      businessValue,
      timestamp: Date.now()
    });

    logger.info(`Feature prioritized: ${feature.title} - WSJF: ${wsjfScore.toFixed(2)}`);
  }

  /**
   * Update program backlog with new features and priorities
   */
  async updateProgramBacklog(
    programId: string,
    newFeatures: Feature[],
    removedFeatureIds: string[] = []
  ): Promise<void> {
    const existingBacklog = this.programBacklog.get(programId)|| [];
    
    // Remove features
    const updatedBacklog = existingBacklog.filter(f => !removedFeatureIds.includes(f.id);
    
    // Add new features
    updatedBacklog.push(...newFeatures);
    
    // Reorder by priority
    const reorderedFeatures = this.reorderBacklogByPriority(updatedBacklog);
    
    this.programBacklog.set(programId, reorderedFeatures);

    await this.emitSafe('backlog:updated,{
      addedFeatures: newFeatures,
      removedFeatures: removedFeatureIds,
      reorderedFeatures,
      programId,
      timestamp: Date.now()
    });

    logger.info(`Program backlog updated: ${programId} - ${reorderedFeatures.length} features`);
  }

  /**
   * Identify customer need and link to potential features
   */
  async identifyCustomerNeed(
    description: string,
    priority: low'|'medium'|'high'|'critical,
    marketSegment: string,
    businessValue: number
  ): Promise<CustomerNeed> {
    const need: CustomerNeed = {
      id: `need-${Date.now()}`,
      description,
      priority,
      businessValue,
      marketSegment,
      validationStatus:'hypothesis
    };

    this.customerNeeds.set(need.id, need);

    // Find related features in all program backlogs
    const relatedFeatures = this.findFeaturesForCustomerNeed(need);
    const marketOpportunity = this.calculateMarketOpportunity(need);

    await this.emitSafe('customer:need_identified,{
      need,
      relatedFeatures,
      marketOpportunity,
      timestamp: Date.now()
    });

    logger.info(`Customer need identified: ${description} - Market opportunity: $${marketOpportunity}M`);
    return need;
  }

  /**
   * Create and update product roadmap with key milestones
   */
  async updateProductRoadmap(
    programId: string,
    timeHorizon: number = 12 // months
  ): Promise<void> {
    const backlog = this.programBacklog.get(programId)|| [];
    const quarters = this.planFeaturesByQuarter(backlog, timeHorizon);
    const milestones = this.identifyKeyMilestones(quarters);
    const keyFeatures = this.selectKeyFeaturesForRoadmap(backlog);

    const roadmap = {
      programId,
      timeHorizon,
      quarters,
      milestones,
      keyFeatures,
      lastUpdated: new Date()
    };

    this.roadmaps.set(programId, roadmap);

    await this.emitSafe('roadmap:updated,{
      programId,
      quarters,
      milestones,
      keyFeatures,
      timestamp: Date.now()
    });

    logger.info(`Product roadmap updated: ${programId} - ${quarters.length} quarters planned`);
  }

  /**
   * Request feature approval via TaskMaster workflow
   */
  async requestFeatureApproval(
    feature: Feature,
    businessJustification: string,
    requiredApprover: string ='product-owner
  ): Promise<FeatureApprovalRequest> {
    const approvalRequest: FeatureApprovalRequest = {
      id: `approval-${feature.id}-${Date.now()}`,
      featureId: feature.id,
      title: `Feature Approval: ${feature.title}`,
      description: feature.description,
      businessCase: businessJustification,
      requiredApprover,
      urgency: this.determineFeatureUrgency(feature),
      dueDate: new Date(Date.now() + (5 * 24 * 60 * 60 * 1000)), // 5 days
      createdAt: new Date()
    };

    await this.emitSafe('feature:approval_requested,{
      feature,
      approvalRequest,
      businessJustification,
      timestamp: Date.now()
    });

    logger.info(`Feature approval requested: ${feature.title}`);
    return approvalRequest;
  }

  /**
   * Communicate with stakeholders about product updates
   */
  async communicateWithStakeholders(
    stakeholderGroup:'executives'|'customers'|'development_teams'|'sales,
    message: string,
    features: Feature[],
    requestFeedback: boolean = true
  ): Promise<void> {
    const feedback: string[] = requestFeedback ? 
      await this.collectStakeholderFeedback(stakeholderGroup, features) : [];

    await this.emitSafe('stakeholder:communicated,{
      stakeholderGroup,
      message,
      features,
      feedback,
      timestamp: Date.now()
    });

    logger.info(`Stakeholder communication sent to ${stakeholderGroup}: ${message}`);
  }

  /**
   * Get program backlog sorted by priority
   */
  getProgramBacklog(programId: string): Feature[] {
    return this.programBacklog.get(programId)|| [];
  }

  /**
   * Get customer needs by priority
   */
  getCustomerNeedsByPriority(): CustomerNeed[] {
    return Array.from(this.customerNeeds.values())
      .sort((a, b) => this.priorityToNumber(b.priority) - this.priorityToNumber(a.priority);
  }

  /**
   * Get product roadmap
   */
  getProductRoadmap(programId: string): any {
    return this.roadmaps.get(programId);
  }

  // Private helper methods

  private generatePrioritizationReasoning(
    businessValue: number,
    urgency: number,
    jobSize: number,
    marketValidation: number,
    wsjfScore: number
  ): string {
    return `WSJF Score: ${wsjfScore.toFixed(2)} - Business Value: ${businessValue}, ` +
           `Urgency: ${urgency}, Market Validation: ${marketValidation}, Job Size: ${jobSize}`;
  }

  private reorderBacklogByPriority(features: Feature[]): Feature[] {
    return features.sort((a, b) => {
      const priorityA = this.featurePriorities.get(a.id)|| 0;
      const priorityB = this.featurePriorities.get(b.id)|| 0;
      return priorityB - priorityA;
    });
  }

  private findFeaturesForCustomerNeed(need: CustomerNeed): Feature[] {
    const allFeatures: Feature[] = [];
    for (const backlog of this.programBacklog.values()) {
      allFeatures.push(...backlog);
    }

    // Simple keyword matching - would be more sophisticated in real implementation
    return allFeatures.filter(feature => 
      feature.description.toLowerCase().includes(need.description.toLowerCase())|| 
      feature.title.toLowerCase().includes(need.description.toLowerCase())
    );
  }

  private calculateMarketOpportunity(need: CustomerNeed): number {
    // Simplified market opportunity calculation
    const baseValue = need.businessValue;
    const priorityMultiplier = this.priorityToNumber(need.priority) / 10;
    return baseValue * priorityMultiplier;
  }

  private planFeaturesByQuarter(features: Feature[], months: number): any[] {
    const quarters = Math.ceil(months / 3);
    const featuresPerQuarter = Math.ceil(features.length / quarters);
    
    return Array.from({ length: quarters }, (_, i) => ({
      quarter: i + 1,
      features: features.slice(i * featuresPerQuarter, (i + 1) * featuresPerQuarter),
      startMonth: i * 3 + 1,
      endMonth: (i + 1) * 3
    });
  }

  private identifyKeyMilestones(quarters: any[]): any[] {
    return quarters.map((quarter, index) => ({
      id: `milestone-q${quarter.quarter}`,
      title: `Q${quarter.quarter} Release`,
      date: new Date(new Date().getFullYear(), quarter.endMonth - 1, 1),
      features: quarter.features.length,
      businessValue: quarter.features.reduce((sum: number, f: Feature) => sum + (f.businessValue|| 0), 0)
    });
  }

  private selectKeyFeaturesForRoadmap(features: Feature[]): Feature[] {
    return features
      .sort((a, b) => (this.featurePriorities.get(b.id)|| 0) - (this.featurePriorities.get(a.id)|| 0))
      .slice(0, 10); // Top 10 features
  }

  private determineFeatureUrgency(feature: Feature):'low'|'medium'|'high '{
    const priority = this.featurePriorities.get(feature.id)|| 0;
    if (priority > 8) return'high';
    if (priority > 5) return'medium';
    return'low';
  }

  private async collectStakeholderFeedback(
    stakeholderGroup: string,
    features: Feature[]
  ): Promise<string[]> {
    // Simulated feedback collection - would integrate with actual feedback systems
    return [
      `${{stakeholderGroup} feedback on feature priorities}`,
      `Suggestions for ${features.length} features`,
     'Market validation requested
    ];
  }

  private priorityToNumber(priority: low'|'medium'|'high'|'critical'): number {
    switch (priority) {
      case'critical: return 10';
      case'high: return 7';
      case'medium: return 4';
      case'low: return 1';
      default: return 0;
    }
  }
}

export default ProductManagerCoordinator;