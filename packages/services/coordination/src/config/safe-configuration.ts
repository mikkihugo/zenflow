/**
 * @fileoverview SAFe Configuration Management - Feature Toggles for Different SAFe Configurations
 *
 * **SAFe 6.0 CONFIGURATION LEVELS
 */

import { getLogger } from '@claude-zen/foundation';
const logger = getLogger('SafeConfiguration');
// ============================================================================
// SAFe CONFIGURATION TYPES
// ============================================================================
/**
 * SAFe 6.0 configuration levels with feature toggles
 */
export enum SafeConfigurationLevel {
  ESSENTIAL = 'essential', // Step 1: ART-focused, minimal viable SAFe
  LARGE_SOLUTION = 'large_solution', // Step 2: Adds solution coordination
  PORTFOLIO = 'portfolio', // Step 3: Adds portfolio management
  FULL = 'full', // Step 4: Complete enterprise transformation
}
/**
 * Feature toggles for SAFe configurations
 */
export interface SafeFeatureToggles {
  // Essential SAFe Features (Always enabled for Step 1+)
  essential: {
    artCoordination: boolean; // ART Sync, PI Planning, team coordination
    coreRoles: boolean; // RTE, Business Owners, Agile Teams
    coreEvents: boolean; // Essential events only
    coreArtifacts: boolean; // Features, ART Backlog, PI Objectives
    teamTechnicalAgility: boolean; // Core competency
    agileProductDelivery: boolean; // Core competency
    continuousLearningCulture: boolean; // NEW in SAFe 6.0 - added to foundation
  };
  // Large Solution Features (Step 2+)
  largeSolution: {
    solutionTrain: boolean; // Solution Train coordination
    solutionManagement: boolean; // Solution Manager, Solution Architect
    supplierManagement: boolean; // External supplier coordination
    solutionEvents: boolean; // Pre/Post-PI Planning, Solution Demo
    solutionArtifacts: boolean; // Capabilities, Solution Intent
    enterpriseSolutionDelivery: boolean; // Large solution competency
  };
  // Portfolio Features (Step 3+)
  portfolio: {
    portfolioManagement: boolean; // Portfolio level governance
    epicManagement: boolean; // Epic Owners, epic lifecycle
    strategicThemes: boolean; // Strategic theme management
    leanBudgets: boolean; // Lean portfolio budgets
    portfolioEvents: boolean; // Strategic Planning, Portfolio Sync
    portfolioArtifacts: boolean; // Epics, Strategic Themes, Portfolio Kanban
    leanPortfolioManagement: boolean; // Portfolio competency
  };
  // Full SAFe Features (Step 4)
  full: {
    organizationalAgility: boolean; // Complete org transformation
    leanAgileLeadership: boolean; // Leadership transformation
    spanningPalette: boolean; // All spanning palette elements
    culturalTransformation: boolean; // Complete cultural change
    allCompetencies: boolean; // All 7 core competencies
    advancedPractices: boolean; // Advanced SAFe practices
  };
}
/**
 * Complete SAFe configuration with feature toggles
 */
export interface SafeConfiguration {
  level: SafeConfigurationLevel;
  features: SafeFeatureToggles;
  customizations: {
    organizationSize: 'small' | 'medium' | 'large' | 'enterprise';
    industry: string;
    complianceRequirements: string[];
    aiIntegrationLevel: 'basic' | 'advanced' | 'full';
  };
  metadata: {
    version: string;
    lastUpdated: Date;
    configuredBy: string;
    targetGoDate: Date;
  };
}
// ============================================================================
// ESSENTIAL SAFe 6.0 TARGET CONFIGURATION (STEP 1)
// ============================================================================
/**
 * Essential SAFe 6.0 - Our complete Step 1 implementation target
 * This represents 100% coverage of Essential SAFe configuration
 */
export const ESSENTIAL_SAFE_6_0_CONFIG: SafeConfiguration = {
  level: SafeConfigurationLevel.ESSENTIAL,
  features: {
    essential: {
      artCoordination: true,
      coreRoles: true,
      coreEvents: true,
      coreArtifacts: true,
      teamTechnicalAgility: true,
      agileProductDelivery: true,
      continuousLearningCulture: true,
    },
    largeSolution: {
      solutionTrain: false,
      solutionManagement: false,
      supplierManagement: false,
      solutionEvents: false,
      solutionArtifacts: false,
      enterpriseSolutionDelivery: false,
    },
    portfolio: {
      portfolioManagement: false,
      epicManagement: false,
      strategicThemes: false,
      leanBudgets: false,
      portfolioEvents: false,
      portfolioArtifacts: false,
      leanPortfolioManagement: false,
    },
    full: {
      organizationalAgility: false,
      leanAgileLeadership: false,
      spanningPalette: false,
      culturalTransformation: false,
      allCompetencies: false,
      advancedPractices: false,
    },
  },
  customizations: {
    organizationSize: 'medium', // Typical Essential SAFe target
    industry: 'software',
    complianceRequirements: ['TaskMaster'],
    aiIntegrationLevel: 'advanced',
  },
  metadata: {
    version: '6.0.0',
    lastUpdated: new Date(),
    configuredBy: 'system',
    targetGoDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
  },
};
// ============================================================================
// CONFIGURATION MANAGEMENT
// ============================================================================
/**
 * SAFe Configuration Manager
 * Manages feature toggles and configuration levels
 */
export class SafeConfigurationManager {
  private currentConfig: SafeConfiguration;

  constructor(config: SafeConfiguration = ESSENTIAL_SAFE_6_0_CONFIG) {
    this.currentConfig = config;
    logger.info('SafeConfigurationManager initialized', {
      level: this.currentConfig.level,
    });
  }

  /**
   * Check if specific feature is enabled
   */
  isFeatureEnabled(
    featureCategory: keyof SafeFeatureToggles,
    featureName: string
  ): boolean {
    const category = this.currentConfig.features[featureCategory] as Record<
      string,
      boolean
    >;
    return category?.[featureName] ?? false;
  }
  /**
   * Enable specific SAFe configuration level
   */
  enableConfigurationLevel(level: SafeConfigurationLevel): void {
    this.currentConfig.level = level;

    switch (level) {
      case SafeConfigurationLevel.ESSENTIAL:
        this.enableEssentialSafe();
        break;
      case SafeConfigurationLevel.LARGE_SOLUTION:
        this.enableEssentialSafe();
        this.enableLargeSolutionSafe();
        break;
      case SafeConfigurationLevel.PORTFOLIO:
        this.enableEssentialSafe();
        this.enableLargeSolutionSafe();
        this.enablePortfolioSafe();
        break;
      case SafeConfigurationLevel.FULL:
        this.enableFullSafe();
        break;
    }

    this.currentConfig.metadata.lastUpdated = new Date();
  }
  /**
   * Get configuration readiness assessment
   */
  getConfigurationReadiness(): {
    level: SafeConfigurationLevel;
    enabledFeatures: number;
    totalFeatures: number;
    missingFeatures: string[];
    completionPercentage: number;
  } {
    const enabledFeatures = this.getEnabledFeatureCount();
    const totalFeatures = this.getTotalFeatureCount();
    const missingFeatures = this.getMissingFeatures();
    const completionPercentage = Math.round(
      (enabledFeatures / totalFeatures) * 100
    );

    return {
      level: this.currentConfig.level,
      enabledFeatures,
      totalFeatures,
      missingFeatures,
      completionPercentage,
    };
  }

  /**
   * Generate implementation plan
   */
  generateImplementationPlan(level: SafeConfigurationLevel): any[] {
    switch (level) {
      case SafeConfigurationLevel.ESSENTIAL:
        return this.generateEssentialImplementationPlan();
      case SafeConfigurationLevel.LARGE_SOLUTION:
        return this.generateLargeSolutionImplementationPlan();
      case SafeConfigurationLevel.PORTFOLIO:
        return this.generatePortfolioImplementationPlan();
      case SafeConfigurationLevel.FULL:
        return this.generateFullImplementationPlan();
      default:
        return [];
    }
  }
  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================
  private enableEssentialSafe(): void {
    for (const feature of Object.keys(this.currentConfig.features.essential)) {
      (this.currentConfig.features.essential as any)[feature] = true;
    }
  }
  private enableLargeSolutionSafe(): void {
    for (const feature of Object.keys(
      this.currentConfig.features.largeSolution
    )) {
      (this.currentConfig.features.largeSolution as any)[feature] = true;
    }
  }
  private enablePortfolioSafe(): void {
    for (const feature of Object.keys(this.currentConfig.features.portfolio)) {
      (this.currentConfig.features.portfolio as any)[feature] = true;
    }
  }
  private enableFullSafe(): void {
    this.enableEssentialSafe();
    this.enableLargeSolutionSafe();
    this.enablePortfolioSafe();
    for (const feature of Object.keys(this.currentConfig.features.full)) {
      (this.currentConfig.features.full as any)[feature] = true;
    }
  }
  private getEnabledFeatureCount(): number {
    let count = 0;
    for (const category of Object.values(this.currentConfig.features)) {
      for (const enabled of Object.values(category)) {
        if (enabled) count++;
      }
    }
    return count;
  }
  private getTotalFeatureCount(): number {
    let count = 0;
    for (const category of Object.values(this.currentConfig.features)) {
      count += Object.keys(category).length;
    }
    return count;
  }
  private getMissingFeatures(): string[] {
    const missing: string[] = [];
    for (const [categoryName, category] of Object.entries(
      this.currentConfig.features
    )) {
      for (const [featureName, enabled] of Object.entries(category)) {
        if (!enabled) {
          missing.push(`${categoryName}.${featureName}");"
        }
      }
    }

    return missing;
  }
  private generateEssentialImplementationPlan(): any[] {
    return [
      {
        phase: 'Phase 1',
        description: 'Establish basic ART coordination and core roles',
        features: ['artCoordination', 'coreRoles'],
        estimatedEffort: '4-6 weeks',
        dependencies: ['Approval gate system', 'Event coordination'],
      },
      {
        phase: 'Phase 2',
        description: 'Implement ART Sync, PI Planning, and iteration events',
        features: ['coreEvents', 'coreArtifacts'],
        estimatedEffort: '6-8 weeks',
        dependencies: ['Phase 1', 'Event scheduling system'],
      },
      {
        phase: 'Phase 3',
        description: 'Build feature management and ART backlog workflows',
        features: ['coreArtifacts'],
        estimatedEffort: '4-6 weeks',
        dependencies: ['Phase 2', 'Artifact lifecycle management'],
      },
      {
        phase: 'Phase 4',
        description:
          'Enable Team and Technical Agility and Agile Product Delivery',
        features: [
          'teamTechnicalAgility',
          'agileProductDelivery',
          'continuousLearningCulture',
        ],
        estimatedEffort: '6-8 weeks',
        dependencies: ['Phase 3', 'Learning and measurement systems'],
      },
    ];
  }

  private generateLargeSolutionImplementationPlan(): any[] {
    return [
      {
        phase: 'Phase 5',
        description: 'Add solution-level coordination and management',
        features: ['solutionTrain', 'solutionManagement'],
        estimatedEffort: '8-10 weeks',
        dependencies: ['Essential SAFe complete'],
      },
      {
        phase: 'Phase 6',
        description: 'Implement solution events and artifacts',
        features: ['solutionEvents', 'solutionArtifacts', 'supplierManagement'],
        estimatedEffort: '6-8 weeks',
        dependencies: ['Phase 5'],
      },
    ];
  }

  private generatePortfolioImplementationPlan(): any[] {
    return [
      {
        phase: 'Phase 7',
        description: 'Add portfolio-level governance and epic management',
        features: ['portfolioManagement', 'epicManagement'],
        estimatedEffort: '10-12 weeks',
        dependencies: ['Large Solution SAFe complete'],
      },
      {
        phase: 'Phase 8',
        description: 'Implement lean budgets and strategic themes',
        features: ['leanBudgets', 'strategicThemes', 'portfolioEvents'],
        estimatedEffort: '8-10 weeks',
        dependencies: ['Phase 7'],
      },
    ];
  }

  private generateFullImplementationPlan(): any[] {
    return [
      {
        phase: 'Phase 9',
        description: 'Complete organizational agility transformation',
        features: ['organizationalAgility', 'leanAgileLeadership'],
        estimatedEffort: '16-20 weeks',
        dependencies: ['Portfolio SAFe complete'],
      },
      {
        phase: 'Phase 10',
        description: 'Implement spanning palette and advanced practices',
        features: ['spanningPalette', 'advancedPractices', 'allCompetencies'],
        estimatedEffort: '12-16 weeks',
        dependencies: ['Phase 9'],
      },
    ];
  }
}

export default SafeConfigurationManager;
