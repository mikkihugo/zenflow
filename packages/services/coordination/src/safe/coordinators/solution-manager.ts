/**
 * @fileoverview Solution Manager - Strategic SAFe Orchestration Brain
 * 
 * The central strategic orchestrator for SAFe 6.0 coordination:
 * - Portfolio strategy → Solution intent → Program execution
 * - Cross-ART coordination and value stream optimization
 * - Strategic decomposition: Themes → Epics → Features → Stories
 * - Integration with TaskMaster for enterprise approval workflows
 * - Event-driven coordination across all SAFe levels
 * 
 * This is the main SAFe brain that coordinates portfolio, solution, and program levels,
 * integrating with SPARC methodology when implementation begins.
 * 
 * @author Claude-Zen SAFe Team
 * @since 1.0.0
 */

import { EventBus, getLogger } from '@claude-zen/foundation';
import type { 
  PortfolioEpic,
  ProgramIncrement,
  Feature,
  Story,
  ValueStream
} from '../types';
const logger = getLogger('safe-solution-manager'');

export interface SolutionManagerEvents {
 'strategy:theme_analyzed: {
    strategicTheme: string;
    businessValue: number;
    technicalImpact: number;
    portfolioEpics: PortfolioEpic[];
    timestamp: number;
  };
 'solution:intent_created: {
    solutionId: string;
    intent: string;
    capabilities: string[];
    valueProposition: string;
    timestamp: number;
  };
 'portfolio:epic_decomposed: {
    portfolioEpic: PortfolioEpic;
    programEpics: any[];
    features: Feature[];
    estimatedValue: number;
    timestamp: number;
  };
 'program:pi_recommended: {
    programIncrement: ProgramIncrement;
    features: Feature[];
    dependencies: any[];
    riskLevel:'low'|'medium'|'high';
    timestamp: number;
  };
 'implementation:sparc_triggered: {
    features: Feature[];
    sparcPhase:'specification'|'pseudocode'|'architecture'|'refinement'|'completion';
    taskMasterWorkflow: string;
    timestamp: number;
  };
 'coordination:cross_art_sync: {
    involvedARTs: string[];
    synchronizationPoints: string[];
    dependencies: any[];
    timestamp: number;
  };
 'metrics:solution_health: {
    solutionId: string;
    flowMetrics: Record<string, number>;
    businessMetrics: Record<string, number>;
    technicalMetrics: Record<string, number>;
    timestamp: number;
  };
}

export interface StrategicDecomposition {
  strategicTheme: string;
  portfolioEpics: PortfolioEpic[];
  programEpics: any[];
  features: Feature[];
  stories: Story[];
  businessValue: number;
  implementationComplexity: number;
  recommendedApproach:'agile'|'lean'|'safe'|'sparc';
}

export interface SolutionDashboard {
  solutionId: string;
  strategicAlignment: number; // 0-1
  portfolioHealth: number; // 0-1  
  programPredictability: number; // 0-1
  valueDeliveryRate: number; // features per PI
  flowEfficiency: number; // 0-1
  technicalDebt: number; // 0-1
  riskExposure:'low'|'medium'|'high';
  nextRecommendedActions: string[];
  lastUpdated: Date;
}

export class SolutionManager extends EventBus<SolutionManagerEvents> {
  private strategicThemes: Map<string, StrategicDecomposition> = new Map();
  private solutionIntents: Map<string, any> = new Map();
  private valueStreams: Map<string, ValueStream> = new Map();

  constructor() {
    super();
    logger.info('SolutionManager - SAFe Strategic Orchestration Brain initialized'');
  }

  /**
   * Analyze strategic theme and decompose into actionable portfolio work
   * This is the entry point for strategic planning → execution flow
   */
  async analyzeStrategicTheme(
    theme: string,
    businessContext: string,
    strategicGoals: string[]
  ): Promise<StrategicDecomposition> {
    logger.info(`Analyzing strategic theme: ${theme}`);

    // Strategic analysis - determine business value and technical impact
    const businessValue = this.calculateBusinessValue(strategicGoals);
    const technicalImpact = this.assessTechnicalImpact(theme, businessContext);

    // Decompose theme into portfolio epics
    const portfolioEpics = await this.decomposeIntoPortfolioEpics(
      theme,
      strategicGoals,
      businessValue
    );

    // Further decompose into program-level work
    const programEpics = await this.decomposeIntoProgramEpics(portfolioEpics);
    const features = await this.decomposeIntoFeatures(programEpics);
    const stories = await this.decomposeIntoStories(features);

    const decomposition: StrategicDecomposition = {
      strategicTheme: theme,
      portfolioEpics,
      programEpics,
      features,
      stories,
      businessValue,
      implementationComplexity: this.calculateComplexity(features),
      recommendedApproach: this.recommendImplementationApproach(businessValue, technicalImpact)
    };

    this.strategicThemes.set(theme, decomposition);

    await this.emitSafe('strategy:theme_analyzed,{
      strategicTheme: theme,
      businessValue,
      technicalImpact,
      portfolioEpics,
      timestamp: Date.now()
    });

    logger.info(`Strategic decomposition completed: ${portfolioEpics.length} epics, ${features.length} features`);
    return decomposition;
  }

  /**
   * Create solution intent from portfolio epics
   * Bridges portfolio strategy with program execution
   */
  async createSolutionIntent(
    solutionId: string,
    portfolioEpics: PortfolioEpic[],
    businessObjectives: string[]
  ): Promise<void> {
    const intent = this.synthesizeSolutionIntent(portfolioEpics, businessObjectives);
    const capabilities = this.identifyRequiredCapabilities(portfolioEpics);
    const valueProposition = this.articulateValueProposition(portfolioEpics);

    const solutionIntent = {
      id: solutionId,
      intent,
      capabilities,
      valueProposition,
      portfolioEpics,
      createdAt: new Date()
    };

    this.solutionIntents.set(solutionId, solutionIntent);

    await this.emitSafe('solution:intent_created,{
      solutionId,
      intent,
      capabilities,
      valueProposition,
      timestamp: Date.now()
    });

    logger.info(`Solution intent created: ${solutionId}`);
  }

  /**
   * Decompose portfolio epic into program-level features with PI planning
   */
  async decomposePortfolioEpic(epicId: string): Promise<Feature[]> {
    // Find the epic in our strategic decompositions
    let portfolioEpic: PortfolioEpic| undefined;
    let parentDecomposition: StrategicDecomposition| undefined;

    for (const [theme, decomposition] of this.strategicThemes.entries()) {
      const epic = decomposition.portfolioEpics.find(e => e.id === epicId);
      if (epic) {
        portfolioEpic = epic;
        parentDecomposition = decomposition;
        break;
      }
    }

    if (!portfolioEpic|| !parentDecomposition) {
      throw new Error(`Portfolio epic not found: ${epicId}`);
    }

    // Decompose into features with business value estimation
    const features = parentDecomposition.features.filter(f => 
      (f as any).portfolioEpicId === epicId
    );

    const programEpics = parentDecomposition.programEpics.filter(pe => 
      (pe as any).portfolioEpicId === epicId
    );

    const estimatedValue = this.calculateEpicBusinessValue(portfolioEpic, features);

    await this.emitSafe('portfolio:epic_decomposed,{
      portfolioEpic,
      programEpics,
      features,
      estimatedValue,
      timestamp: Date.now()
    });

    logger.info(`Portfolio epic decomposed: ${portfolioEpic.title} → ${features.length} features`);
    return features;
  }

  /**
   * Recommend Program Increment planning based on feature portfolio
   */
  async recommendPIPlan(
    features: Feature[],
    teamCapacity: number,
    piDuration: number = 10 // weeks
  ): Promise<ProgramIncrement> {
    const sortedFeatures = this.prioritizeFeatures(features);
    const piFeatures = this.selectFeaturesForPI(sortedFeatures, teamCapacity);
    const dependencies = this.identifyDependencies(piFeatures);
    const riskLevel = this.assessPIRisk(piFeatures, dependencies);

    // Create PI recommendation
    const programIncrement: ProgramIncrement = {
      id: `pi-${Date.now()}`,
      title: `PI ${new Date().getFullYear()}.${Math.ceil(Date.now() / (1000 * 60 * 60 * 24 * 7 / 10))}`,
      startDate: new Date(),
      endDate: new Date(Date.now() + (piDuration * 7 * 24 * 60 * 60 * 1000)),
      objectives: piFeatures.map(f => ({
        id: `obj-${f.id}`,
        title: f.title,
        description: f.description,
        businessValue: f.businessValue|| 0,
        piId: `pi-${Date.now()}`,
        ownerId:'product-owner,
        status:'draft 'as const
      })),
      status:'planning
    };

    await this.emitSafe('program:pi_recommended,{
      programIncrement,
      features: piFeatures,
      dependencies,
      riskLevel,
      timestamp: Date.now()
    });

    logger.info(`PI plan recommended: ${piFeatures.length} features, risk: ${riskLevel}`);
    return programIncrement;
  }

  /**
   * Trigger SPARC implementation process for ready features
   * This is where SAFe planning hands off to SPARC execution
   */
  async triggerSPARCImplementation(features: Feature[]): Promise<void> {
    const readyFeatures = features.filter(f => this.isReadyForImplementation(f);
    
    if (readyFeatures.length === 0) {
      logger.warn('No features ready for SPARC implementation'');
      return;
    }

    // Start with SPARC Specification phase
    const sparcPhase = 'specification';
    const taskMasterWorkflow = 'sparc-feature-implementation';
    await this.emitSafe('implementation:sparc_triggered,{
      features: readyFeatures,
      sparcPhase,
      taskMasterWorkflow,
      timestamp: Date.now()
    });

    logger.info(`SPARC implementation triggered for ${readyFeatures.length} features`);
  }

  /**
   * Coordinate cross-ART synchronization for large solutions
   */
  async coordinateAcrossARTs(
    involvedARTs: string[],
    synchronizationNeeds: string[]
  ): Promise<void> {
    const dependencies = this.identifyCrossARTDependencies(involvedARTs);
    const syncPoints = this.defineSynchronizationPoints(synchronizationNeeds);

    await this.emitSafe('coordination:cross_art_sync,{
      involvedARTs,
      synchronizationPoints: syncPoints,
      dependencies,
      timestamp: Date.now()
    });

    logger.info(`Cross-ART coordination initiated for ${involvedARTs.length} ARTs`);
  }

  /**
   * Generate comprehensive solution health dashboard
   */
  async generateSolutionDashboard(solutionId: string): Promise<SolutionDashboard> {
    const flowMetrics = this.calculateFlowMetrics(solutionId);
    const businessMetrics = this.calculateBusinessMetrics(solutionId);
    const technicalMetrics = this.calculateTechnicalMetrics(solutionId);

    const dashboard: SolutionDashboard = {
      solutionId,
      strategicAlignment: flowMetrics.alignment|| 0.8,
      portfolioHealth: businessMetrics.health|| 0.7,
      programPredictability: flowMetrics.predictability|| 0.75,
      valueDeliveryRate: businessMetrics.deliveryRate|| 5,
      flowEfficiency: flowMetrics.efficiency|| 0.65,
      technicalDebt: technicalMetrics.debt|| 0.3,
      riskExposure: this.assessOverallRisk(flowMetrics, businessMetrics),
      nextRecommendedActions: this.generateRecommendations(solutionId),
      lastUpdated: new Date()
    };

    await this.emitSafe('metrics:solution_health,{
      solutionId,
      flowMetrics,
      businessMetrics,
      technicalMetrics,
      timestamp: Date.now()
    });

    return dashboard;
  }

  // Private strategic analysis methods
  
  private calculateBusinessValue(goals: string[]): number {
    // Simplified business value calculation
    return Math.min(goals.length * 0.2, 1.0);
  }

  private assessTechnicalImpact(theme: string, context: string): number {
    // Simplified technical impact assessment
    const complexity = theme.toLowerCase().includes('platform)? 0.8 : 0.5';
    return Math.min(complexity, 1.0);
  }

  private async decomposeIntoPortfolioEpics(
    theme: string, 
    goals: string[], 
    businessValue: number
  ): Promise<PortfolioEpic[]> {
    return goals.map((goal, index) => ({
      id: `epic-${theme.toLowerCase().replace(/\s+/g,'-')}-${index}`,
      title: goal,
      description: `Strategic epic for: ${goal}`,
      businessValue: businessValue * (1 - index * 0.1),
      status:'backlog 'as const,
      priority: index + 1
    });
  }

  private async decomposeIntoProgramEpics(portfolioEpics: PortfolioEpic[]): Promise<any[]> {
    // Simplified program epic decomposition
    return portfolioEpics.flatMap(epic => 
      Array.from({ length: 2 }, (_, i) => ({
        id: `program-epic-${epic.id}-${i}`,
        portfolioEpicId: epic.id,
        title: `Implementation Phase ${i + 1}: ${epic.title}`,
        description: `Program-level implementation of ${epic.description}`
      }))
    );
  }

  private async decomposeIntoFeatures(programEpics: any[]): Promise<Feature[]> {
    // Simplified feature decomposition
    return programEpics.flatMap(epic => 
      Array.from({ length: 3 }, (_, i) => ({
        id: `feature-${epic.id}-${i}`,
        title: `Feature ${i + 1}: ${epic.title}`,
        description: `Feature implementation: ${epic.description}`,
        status:'backlog 'as const,
        businessValue: Math.random() * 100,
        storyPoints: Math.floor(Math.random() * 13) + 1,
        portfolioEpicId: (epic as any).portfolioEpicId
      } as Feature))
    );
  }

  private async decomposeIntoStories(features: Feature[]): Promise<Story[]> {
    // Simplified story decomposition
    return features.flatMap(feature => 
      Array.from({ length: 5 }, (_, i) => ({
        id: `story-${feature.id}-${i}`,
        title: `User Story ${i + 1}: ${feature.title}`,
        description: `As a user, I want ${feature.description}`,
        acceptanceCriteria: [`Given..., When..., Then...`],
        status:'backlog 'as const,
        storyPoints: Math.floor(Math.random() * 8) + 1,
        featureId: feature.id
      }))
    );
  }

  private calculateComplexity(features: Feature[]): number {
    const totalPoints = features.reduce((sum, f) => sum + (f.storyPoints|| 0), 0);
    return Math.min(totalPoints / 100, 1.0);
  }

  private recommendImplementationApproach(
    businessValue: number, 
    technicalImpact: number
  ):'agile'|'lean'|'safe'|'sparc '{
    if (businessValue > 0.8 && technicalImpact > 0.7) return'safe';
    if (technicalImpact > 0.8) return'sparc';
    if (businessValue > 0.6) return'lean';
    return'agile';
  }

  // Additional helper methods for solution management...
  
  private synthesizeSolutionIntent(epics: PortfolioEpic[], objectives: string[]): string {
    return `Solution intent synthesized from ${epics.length} portfolio epics`;
  }

  private identifyRequiredCapabilities(epics: PortfolioEpic[]): string[] {
    return ['Capability 1,'Capability 2,'Capability 3]; // Simplified
  }

  private articulateValueProposition(epics: PortfolioEpic[]): string {
    const totalValue = epics.reduce((sum, epic) => sum + epic.businessValue, 0);
    return `Delivers $${totalValue}M in business value`;
  }

  private calculateEpicBusinessValue(epic: PortfolioEpic, features: Feature[]): number {
    return epic.businessValue + features.reduce((sum, f) => sum + (f.businessValue|| 0), 0);
  }

  private prioritizeFeatures(features: Feature[]): Feature[] {
    return features.sort((a, b) => (b.businessValue|| 0) - (a.businessValue|| 0);
  }

  private selectFeaturesForPI(features: Feature[], capacity: number): Feature[] {
    let remainingCapacity = capacity;
    return features.filter(feature => {
      if (remainingCapacity >= (feature.storyPoints|| 0)) {
        remainingCapacity -= (feature.storyPoints|| 0);
        return true;
      }
      return false;
    });
  }

  private identifyDependencies(features: Feature[]): any[] {
    return []; // Simplified - would analyze actual dependencies
  }

  private assessPIRisk(features: Feature[], dependencies: any[]):'low'|'medium'|'high '{
    if (dependencies.length > 5) return'high';
    if (features.some(f => (f.storyPoints|| 0) > 8)) return'medium';
    return'low';
  }

  private isReadyForImplementation(feature: Feature): boolean {
    return feature.status ==='backlog '&& (feature.storyPoints|| '0) > 0';
  }

  private identifyCrossARTDependencies(arts: string[]): any[] {
    return []; // Simplified
  }

  private defineSynchronizationPoints(needs: string[]): string[] {
    return needs.map(need => `Sync Point: ${need}`);
  }

  private calculateFlowMetrics(solutionId: string): Record<string, number> {
    return {
      alignment: 0.8,
      predictability: 0.75,
      efficiency: 0.65
    };
  }

  private calculateBusinessMetrics(solutionId: string): Record<string, number> {
    return {
      health: 0.7,
      deliveryRate: 5
    };
  }

  private calculateTechnicalMetrics(solutionId: string): Record<string, number> {
    return {
      debt: 0.3
    };
  }

  private assessOverallRisk(
    flowMetrics: Record<string, number>, 
    businessMetrics: Record<string, number>
  ):'low'|'medium'|'high '{
    const avgHealth = (flowMetrics.efficiency + businessMetrics.health) / 2;
    if (avgHealth > 0.8) return'low';
    if (avgHealth > 0.6) return'medium';
    return'high';
  }

  private generateRecommendations(solutionId: string): string[] {
    return [
     'Focus on high-value features in next PI,
     'Address cross-ART dependencies,
     'Improve flow efficiency through value stream mapping
    ];
  }
}

// Legacy compatibility - the old DocumentTaskVisionCoordinator
export const DocumentTaskVisionCoordinator = SolutionManager;

export default SolutionManager;