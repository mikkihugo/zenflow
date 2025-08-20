/**
 * @fileoverview SAFe Micro Prototype Manager - Actual SAFe Roles Implementation
 * 
 * Coordinates the complete SAFe-SPARC micro prototype with ACTUAL SAFe roles:
 * - Lean Portfolio Manager (LPM) - Strategic investment decisions
 * - Release Train Engineer (RTE) - Program execution coordination  
 * - Product Manager (PM) - Product vision and roadmap
 * - System Architect (SA) - Architecture and technical guidance
 * - Epic Owner (EO) - Epic development and analysis
 * - SPARC Methodology using @claude-zen/sparc
 * - AGUI Human Oversight using @claude-zen/agui
 * 
 * Uses simple LLM-based decisions rather than complex neural networks.
 * This is a minimal viable prototype that demonstrates proper SAFe implementation.
 */

import { EventEmitter } from 'node:events';

import type { Logger } from '@claude-zen/foundation';
import { getLogger } from '../../config/logging-config';

import { BasicSparcWorkflow } from './basic-sparc-workflow';
import { SafeRolesAgent, type SafeRoleDecisionContext, type SafeRoleType } from './safe-roles-agent';
import { BasicAguiInterface } from './basic-agui-interface';

// Core interfaces for the SAFe micro prototype
export interface EpicProposal {
  id: string;
  title: string;
  businessCase: string;
  estimatedValue: number;
  estimatedCost: number;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface SafeRoleDecision {
  roleType: SafeRoleType;
  decision: 'approve' | 'reject' | 'defer' | 'more-information';
  confidence: number;
  reasoning: string;
  recommendations: string[];
  requiredActions: string[];
  humanOversightRequired: boolean;
  metadata: Record<string, any>;
}

export interface SafeProcessResult {
  epicId: string;
  roleDecisions: SafeRoleDecision[];
  overallDecision: 'approve' | 'reject' | 'defer' | 'more-information';
  consensusReached: boolean;
  sparcArtifacts?: any;
  humanApprovals: any[];
}

export interface SparcArtifacts {
  specification?: string;
  architecture?: string;
  implementation?: string;
  status: 'pending' | 'in_progress' | 'complete';
}

/**
 * SAFe Micro Prototype Manager - Orchestrates actual SAFe roles with simple LLM decisions
 */
export class SafeMicroPrototypeManager extends EventEmitter {
  private logger: Logger;
  private initialized = false;
  
  // Actual SAFe role agents
  private leanPortfolioManager: SafeRolesAgent;
  private releaseTrainEngineer: SafeRolesAgent;
  private productManager: SafeRolesAgent;
  private systemArchitect: SafeRolesAgent;
  private epicOwner: SafeRolesAgent;
  
  // Supporting services
  private sparcWorkflow: BasicSparcWorkflow;
  private aguiInterface: BasicAguiInterface;
  
  // Process tracking
  private processedEpics: EpicProposal[] = [];
  private roleDecisionHistory: SafeRoleDecision[] = [];

  constructor() {
    super();
    this.logger = getLogger('SafeMicroPrototypeManager');
    this.logger.info('SAFe Micro Prototype Manager initialized with actual SAFe roles');
  }

  /**
   * Initialize the micro prototype with actual SAFe roles
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.logger.info('Initializing SAFe micro prototype with actual SAFe framework roles...');

      // Initialize actual SAFe role agents
      await this.initializeSafeRoles();
      
      // Initialize supporting services
      await this.initializeSupportingServices();

      this.initialized = true;
      this.logger.info('SAFe micro prototype initialized successfully with actual SAFe roles');

      // Emit initialization complete event
      this.emit('safe-prototype-initialized', { 
        timestamp: new Date().toISOString(),
        safeRoles: ['lean-portfolio-manager', 'release-train-engineer', 'product-manager', 'system-architect', 'epic-owner'],
        supportingServices: ['sparc-workflow', 'agui-interface']
      });

    } catch (error) {
      this.logger.error('Failed to initialize SAFe micro prototype:', error);
      throw error;
    }
  }

  /**
   * Execute the complete SAFe process for an epic proposal with actual SAFe roles
   */
  async processSafeEpic(epicProposal: EpicProposal): Promise<SafeProcessResult> {
    if (!this.initialized) await this.initialize();

    this.logger.info(`Processing epic with SAFe roles: ${epicProposal.title}`);

    try {
      // Step 1: Sequential SAFe role decisions (proper SAFe governance)
      const roleDecisions = await this.conductSafeRoleDecisions(epicProposal);
      
      // Step 2: Determine overall decision based on SAFe role consensus
      const overallDecision = this.determineSafeConsensus(roleDecisions);
      const consensusReached = this.assessConsensusQuality(roleDecisions);
      
      // Step 3: Handle human oversight for critical decisions
      const humanApprovals = await this.handleHumanOversight(epicProposal, roleDecisions);
      
      // Step 4: Execute SPARC workflow if approved
      let sparcArtifacts: SparcArtifacts = { status: 'pending' };
      if (overallDecision === 'approve') {
        this.logger.info('SAFe roles approved epic - executing SPARC workflow...');
        sparcArtifacts = await this.sparcWorkflow.executeSparcProcess({
          epic: epicProposal,
          portfolioDecision: this.convertToPortfolioDecision(roleDecisions, overallDecision)
        });
      }

      // Step 5: Record results and emit events
      const result: SafeProcessResult = {
        epicId: epicProposal.id,
        roleDecisions,
        overallDecision,
        consensusReached,
        sparcArtifacts,
        humanApprovals
      };

      this.processedEpics.push(epicProposal);
      this.roleDecisionHistory.push(...roleDecisions);

      this.emit('safe-process-complete', { epicProposal, result });
      
      this.logger.info(`SAFe process complete for epic: ${epicProposal.title} - Overall decision: ${overallDecision}`);
      return result;

    } catch (error) {
      this.logger.error('Failed to process SAFe epic:', error);
      throw error;
    }
  }

  /**
   * Get current prototype status with SAFe role metrics
   */
  async getSafePrototypeStatus(): Promise<{
    initialized: boolean;
    safeRolesHealthy: boolean;
    processedEpics: number;
    rolePerformance: Record<SafeRoleType, any>;
    consensusMetrics: any;
  }> {
    return {
      initialized: this.initialized,
      safeRolesHealthy: await this.checkSafeRolesHealth(),
      processedEpics: this.processedEpics.length,
      rolePerformance: await this.getSafeRolePerformance(),
      consensusMetrics: this.getConsensusMetrics()
    };
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async initializeSafeRoles(): Promise<void> {
    const baseRoleConfig = {
      decisionThresholds: {
        approvalBudgetLimit: 500000, // $500K
        riskTolerance: 'medium' as const,
        confidenceThreshold: 0.7
      },
      enableLLMDecisions: true,
      llmProvider: 'simple' as const
    };

    // Initialize Lean Portfolio Manager
    this.leanPortfolioManager = new SafeRolesAgent({
      ...baseRoleConfig,
      roleType: 'lean-portfolio-manager',
      decisionThresholds: {
        ...baseRoleConfig.decisionThresholds,
        approvalBudgetLimit: 1000000 // Higher limit for LPM
      }
    });
    await this.leanPortfolioManager.initialize();

    // Initialize Release Train Engineer
    this.releaseTrainEngineer = new SafeRolesAgent({
      ...baseRoleConfig,
      roleType: 'release-train-engineer'
    });
    await this.releaseTrainEngineer.initialize();

    // Initialize Product Manager
    this.productManager = new SafeRolesAgent({
      ...baseRoleConfig,
      roleType: 'product-manager'
    });
    await this.productManager.initialize();

    // Initialize System Architect
    this.systemArchitect = new SafeRolesAgent({
      ...baseRoleConfig,
      roleType: 'system-architect'
    });
    await this.systemArchitect.initialize();

    // Initialize Epic Owner
    this.epicOwner = new SafeRolesAgent({
      ...baseRoleConfig,
      roleType: 'epic-owner'
    });
    await this.epicOwner.initialize();

    this.logger.info('All SAFe role agents initialized successfully');
  }

  private async initializeSupportingServices(): Promise<void> {
    // Initialize SPARC Workflow
    this.sparcWorkflow = new BasicSparcWorkflow({
      workflowId: 'safe-sparc-workflow',
      enableAutomation: true,
      qualityGates: ['specification-review', 'architecture-validation', 'safe-compliance']
    });
    await this.sparcWorkflow.initialize();

    // Initialize AGUI Interface
    this.aguiInterface = new BasicAguiInterface({
      interfaceId: 'safe-human-oversight',
      timeoutMinutes: 120, // 2 hours for SAFe decisions
      escalationRules: ['lpm-escalation', 'rte-escalation']
    });
    await this.aguiInterface.initialize();

    this.logger.info('Supporting services initialized successfully');
  }

  private async conductSafeRoleDecisions(epicProposal: EpicProposal): Promise<SafeRoleDecision[]> {
    const decisions: SafeRoleDecision[] = [];
    
    // Sequential decision making following SAFe governance (order matters)
    const roleOrder: SafeRoleType[] = [
      'epic-owner',           // 1. Epic Owner develops business case
      'lean-portfolio-manager', // 2. LPM makes investment decision
      'product-manager',      // 3. PM validates customer/market fit  
      'system-architect',     // 4. SA assesses technical feasibility
      'release-train-engineer' // 5. RTE evaluates program capacity
    ];

    for (const roleType of roleOrder) {
      this.logger.info(`Requesting decision from ${roleType} for epic: ${epicProposal.title}`);
      
      const agent = this.getSafeRoleAgent(roleType);
      const context: SafeRoleDecisionContext = {
        role: roleType,
        epic: epicProposal,
        decisionType: 'epic-evaluation',
        context: {
          previousDecisions: decisions, // Pass context of previous decisions
          processStage: roleType
        }
      };

      try {
        const roleDecisionResult = await agent.makeRoleDecision(context);
        
        const roleDecision: SafeRoleDecision = {
          roleType,
          decision: roleDecisionResult.decision,
          confidence: roleDecisionResult.confidence,
          reasoning: roleDecisionResult.reasoning,
          recommendations: roleDecisionResult.recommendations,
          requiredActions: roleDecisionResult.requiredActions,
          humanOversightRequired: roleDecisionResult.humanOversightRequired,
          metadata: {
            ...roleDecisionResult.metadata,
            timestamp: new Date().toISOString(),
            processingOrder: decisions.length + 1
          }
        };

        decisions.push(roleDecision);
        
        this.emit('safe-role-decision', { epicProposal, roleDecision });
        
        // Early termination if critical role rejects
        if (roleType === 'lean-portfolio-manager' && roleDecision.decision === 'reject') {
          this.logger.info('LPM rejected epic - terminating SAFe process early');
          break;
        }

      } catch (error) {
        this.logger.error(`Failed to get decision from ${roleType}:`, error);
        
        // Add error decision
        decisions.push({
          roleType,
          decision: 'defer',
          confidence: 0,
          reasoning: `Error in ${roleType} decision process: ${error.message}`,
          recommendations: [`Retry ${roleType} decision after resolving technical issues`],
          requiredActions: [`Fix ${roleType} agent configuration`],
          humanOversightRequired: true,
          metadata: {
            error: error.message,
            timestamp: new Date().toISOString(),
            processingOrder: decisions.length + 1
          }
        });
      }
    }

    return decisions;
  }

  private determineSafeConsensus(roleDecisions: SafeRoleDecision[]): 'approve' | 'reject' | 'defer' | 'more-information' {
    const decisions = roleDecisions.map(rd => rd.decision);
    const decisionCounts = {
      approve: decisions.filter(d => d === 'approve').length,
      reject: decisions.filter(d => d === 'reject').length,
      defer: decisions.filter(d => d === 'defer').length,
      'more-information': decisions.filter(d => d === 'more-information').length
    };

    // SAFe governance rules
    const lpmDecision = roleDecisions.find(rd => rd.roleType === 'lean-portfolio-manager');
    
    // LPM rejection is final
    if (lpmDecision?.decision === 'reject') {
      return 'reject';
    }

    // Majority approval with LPM approval
    if (lpmDecision?.decision === 'approve' && decisionCounts.approve >= 3) {
      return 'approve';
    }

    // Multiple deferrals or information requests
    if (decisionCounts.defer >= 2 || decisionCounts['more-information'] >= 2) {
      return 'more-information';
    }

    // Default to defer if no clear consensus
    return 'defer';
  }

  private assessConsensusQuality(roleDecisions: SafeRoleDecision[]): boolean {
    const confidenceScores = roleDecisions.map(rd => rd.confidence);
    const averageConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;
    
    const unanimousDirection = new Set(roleDecisions.map(rd => rd.decision)).size === 1;
    
    return averageConfidence >= 0.7 && unanimousDirection;
  }

  private async handleHumanOversight(epicProposal: EpicProposal, roleDecisions: SafeRoleDecision[]): Promise<any[]> {
    const humanApprovals: any[] = [];
    
    // Check which roles require human oversight
    const rolesRequiringOversight = roleDecisions.filter(rd => rd.humanOversightRequired);
    
    for (const roleDecision of rolesRequiringOversight) {
      this.logger.info(`Human oversight required for ${roleDecision.roleType} decision`);
      
      try {
        const humanApproval = await this.aguiInterface.presentDecision({
          decisionType: `${roleDecision.roleType}-oversight`,
          aiRecommendation: {
            decision: roleDecision.decision,
            reasoning: [roleDecision.reasoning],
            confidence: roleDecision.confidence
          },
          context: {
            epic: epicProposal,
            roleDecision,
            allRoleDecisions: roleDecisions
          },
          timeoutMinutes: 120
        });
        
        humanApprovals.push({
          roleType: roleDecision.roleType,
          ...humanApproval
        });

        this.emit('human-oversight-complete', { epicProposal, roleDecision, humanApproval });

      } catch (error) {
        this.logger.error(`Failed to get human oversight for ${roleDecision.roleType}:`, error);
      }
    }

    return humanApprovals;
  }

  private convertToPortfolioDecision(roleDecisions: SafeRoleDecision[], overallDecision: string): any {
    const lpmDecision = roleDecisions.find(rd => rd.roleType === 'lean-portfolio-manager');
    
    return {
      epicId: 'converted',
      decision: overallDecision,
      confidence: lpmDecision?.confidence || 0.7,
      reasoning: roleDecisions.map(rd => `${rd.roleType}: ${rd.reasoning}`),
      humanOversightRequired: roleDecisions.some(rd => rd.humanOversightRequired),
      estimatedROI: 2.5 // Placeholder
    };
  }

  private getSafeRoleAgent(roleType: SafeRoleType): SafeRolesAgent {
    switch (roleType) {
      case 'lean-portfolio-manager':
        return this.leanPortfolioManager;
      case 'release-train-engineer':
        return this.releaseTrainEngineer;
      case 'product-manager':
        return this.productManager;
      case 'system-architect':
        return this.systemArchitect;
      case 'epic-owner':
        return this.epicOwner;
      default:
        throw new Error(`Unknown SAFe role type: ${roleType}`);
    }
  }

  private async checkSafeRolesHealth(): Promise<boolean> {
    if (!this.initialized) return false;

    try {
      const healthChecks = await Promise.all([
        this.leanPortfolioManager.healthCheck(),
        this.releaseTrainEngineer.healthCheck(),
        this.productManager.healthCheck(),
        this.systemArchitect.healthCheck(),
        this.epicOwner.healthCheck()
      ]);

      return healthChecks.every(health => health);
    } catch (error) {
      this.logger.error('SAFe roles health check failed:', error);
      return false;
    }
  }

  private async getSafeRolePerformance(): Promise<Record<SafeRoleType, any>> {
    const roles: SafeRoleType[] = ['lean-portfolio-manager', 'release-train-engineer', 'product-manager', 'system-architect', 'epic-owner'];
    const performance: Record<SafeRoleType, any> = {} as Record<SafeRoleType, any>;

    for (const roleType of roles) {
      const roleDecisions = this.roleDecisionHistory.filter(rd => rd.roleType === roleType);
      
      performance[roleType] = {
        totalDecisions: roleDecisions.length,
        averageConfidence: roleDecisions.length > 0 
          ? roleDecisions.reduce((sum, rd) => sum + rd.confidence, 0) / roleDecisions.length 
          : 0,
        approvalRate: roleDecisions.length > 0 
          ? roleDecisions.filter(rd => rd.decision === 'approve').length / roleDecisions.length 
          : 0,
        humanOversightRate: roleDecisions.length > 0 
          ? roleDecisions.filter(rd => rd.humanOversightRequired).length / roleDecisions.length 
          : 0
      };
    }

    return performance;
  }

  private getConsensusMetrics(): any {
    const processedCount = this.processedEpics.length;
    
    if (processedCount === 0) {
      return {
        totalProcessed: 0,
        consensusRate: 0,
        averageProcessingTime: 0
      };
    }

    // Simple metrics - in real implementation would track more detailed data
    return {
      totalProcessed: processedCount,
      consensusRate: 0.8, // Placeholder
      averageProcessingTime: 5000, // 5 seconds placeholder
      roleParticipation: {
        'lean-portfolio-manager': processedCount,
        'release-train-engineer': processedCount,
        'product-manager': processedCount,
        'system-architect': processedCount,
        'epic-owner': processedCount
      }
    };
  }
}