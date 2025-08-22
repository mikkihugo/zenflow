/**
 * @fileoverview SAFe Configuration Management - Feature Toggles for Different SAFe Configurations
 * 
 * **SAFe 6.0 CONFIGURATION LEVELS:**
 * 
 * 🎯 **Essential SAFe** (Step 1 - Complete Implementation Target)
 * - ART coordination with 5-15 Agile teams ✅ HAVE: Approval gate orchestration
 * - Core roles: RTE, Business Owners, Agile Teams, Scrum Masters, Product Owners ✅ HAVE: Role definitions and workflows
 * - Core events: ART Sync, PO Sync, PI Planning, Iteration Planning/Review ⚠️ PARTIAL: Event coordination via gates
 * - Core artifacts: Features, ART Backlog, PI Objectives, Vision ✅ HAVE: Kanban flow via approval gates (WIP, In Progress, Done)
 * - Two core competencies: Team and Technical Agility, Agile Product Delivery ⚠️ PARTIAL: Practice frameworks needed
 * 
 * 🏗️ **Large Solution SAFe** (Step 2)
 * - Adds Solution Train, Solution Management, Suppliers
 * - Additional events: Pre/Post-PI Planning, Solution Demo
 * - Additional artifacts: Capabilities, Solution Intent, Solution Backlog
 * 
 * 🏢 **Portfolio SAFe** (Step 3)  
 * - Adds Portfolio level, Epic Owners, Lean Portfolio Management
 * - Portfolio events: Strategic Planning, Portfolio Sync
 * - Portfolio artifacts: Epics, Strategic Themes, Portfolio Kanban
 * 
 * 🌐 **Full SAFe** (Step 4)
 * - All configurations combined with spanning palette
 * - Complete organizational transformation
 * - All competencies and practices
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
  ESSENTIAL = 'essential',     // Step 1: ART-focused, minimal viable SAFe
  LARGE_SOLUTION = 'large_solution', // Step 2: Adds solution coordination
  PORTFOLIO = 'portfolio',     // Step 3: Adds portfolio management
  FULL = 'full'               // Step 4: Complete enterprise transformation
}

/**
 * Feature toggles for SAFe configurations
 */
export interface SafeFeatureToggles {
  // Essential SAFe Features (Always enabled for Step 1+)
  essential: {
    artCoordination: boolean;           // ART Sync, PI Planning, team coordination
    coreRoles: boolean;                 // RTE, Business Owners, Agile Teams
    coreEvents: boolean;                // Essential events only
    coreArtifacts: boolean;             // Features, ART Backlog, PI Objectives
    teamTechnicalAgility: boolean;      // Core competency
    agileProductDelivery: boolean;      // Core competency
    continuousLearningCulture: boolean; // NEW in SAFe 6.0 - added to foundation
  };
  
  // Large Solution Features (Step 2+)
  largeSolution: {
    solutionTrain: boolean;             // Solution Train coordination
    solutionManagement: boolean;        // Solution Manager, Solution Architect
    supplierManagement: boolean;        // External supplier coordination
    solutionEvents: boolean;            // Pre/Post-PI Planning, Solution Demo
    solutionArtifacts: boolean;         // Capabilities, Solution Intent
    enterpriseSolutionDelivery: boolean; // Large solution competency
  };
  
  // Portfolio Features (Step 3+)
  portfolio: {
    portfolioManagement: boolean;       // Portfolio level governance
    epicManagement: boolean;            // Epic Owners, epic lifecycle
    strategicThemes: boolean;           // Strategic theme management
    leanBudgets: boolean;               // Lean portfolio budgets
    portfolioEvents: boolean;           // Strategic Planning, Portfolio Sync
    portfolioArtifacts: boolean;        // Epics, Strategic Themes, Portfolio Kanban
    leanPortfolioManagement: boolean;   // Portfolio competency
  };
  
  // Full SAFe Features (Step 4)
  full: {
    organizationalAgility: boolean;     // Complete org transformation
    leanAgileLeadership: boolean;       // Leadership transformation
    spanningPalette: boolean;           // All spanning palette elements
    culturalTransformation: boolean;    // Complete cultural change
    allCompetencies: boolean;           // All 7 core competencies
    advancedPractices: boolean;         // Advanced SAFe practices
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
    // Essential SAFe - ALL enabled for Step 1 complete implementation
    essential: {
      artCoordination: true,           // ✅ ART coordination (our strength)
      coreRoles: true,                 // ✅ RTE, Business Owners, Teams
      coreEvents: true,                // ✅ ART Sync, PI Planning, Iteration events
      coreArtifacts: true,             // ✅ Features, ART Backlog, PI Objectives
      teamTechnicalAgility: true,      // ✅ Core competency
      agileProductDelivery: true,      // ✅ Core competency  
      continuousLearningCulture: true  // ✅ NEW SAFe 6.0 foundation competency
    },
    
    // Large Solution - DISABLED for Essential SAFe
    largeSolution: {
      solutionTrain: false,
      solutionManagement: false,
      supplierManagement: false,
      solutionEvents: false,
      solutionArtifacts: false,
      enterpriseSolutionDelivery: false
    },
    
    // Portfolio - DISABLED for Essential SAFe
    portfolio: {
      portfolioManagement: false,
      epicManagement: false,
      strategicThemes: false,
      leanBudgets: false,
      portfolioEvents: false,
      portfolioArtifacts: false,
      leanPortfolioManagement: false
    },
    
    // Full SAFe - DISABLED for Essential SAFe
    full: {
      organizationalAgility: false,
      leanAgileLeadership: false,
      spanningPalette: false,
      culturalTransformation: false,
      allCompetencies: false,
      advancedPractices: false
    }
  },
  
  customizations: {
    organizationSize: 'medium',        // Typical Essential SAFe target
    industry: 'software',
    complianceRequirements: ['basic'],
    aiIntegrationLevel: 'advanced'     // Our AI strength
  },
  
  metadata: {
    version: '6.0',
    lastUpdated: new Date(),
    configuredBy: 'TaskMaster',
    targetGoDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  }
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
      level: config.level,
      enabledFeatures: this.getEnabledFeatureCount()
    });
  }
  
  /**
   * Get current configuration
   */
  getCurrentConfiguration(): SafeConfiguration {
    return { ...this.currentConfig };
  }
  
  /**
   * Check if a specific feature is enabled
   */
  isFeatureEnabled(featureCategory: keyof SafeFeatureToggles, featureName: string): boolean {
    const category = this.currentConfig.features[featureCategory] as Record<string, boolean>;
    return category?.[featureName] ?? false;
  }
  
  /**
   * Enable specific SAFe configuration level
   */
  enableConfigurationLevel(level: SafeConfigurationLevel): void {
    logger.info(`Enabling SAFe configuration level: ${level}`);
    
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
    
    this.currentConfig.level = level;
    this.currentConfig.metadata.lastUpdated = new Date();
  }
  
  /**
   * Get configuration readiness assessment
   */
  getConfigurationReadiness(): {
    level: SafeConfigurationLevel;
    readinessScore: number;
    implementedFeatures: number;
    totalFeatures: number;
    missingFeatures: string[];
    nextSteps: string[];
  } {
    const enabledFeatures = this.getEnabledFeatureCount();
    const totalFeatures = this.getTotalFeatureCount();
    const missingFeatures = this.getMissingFeatures();
    
    return {
      level: this.currentConfig.level,
      readinessScore: Math.round((enabledFeatures / totalFeatures) * 100),
      implementedFeatures: enabledFeatures,
      totalFeatures,
      missingFeatures,
      nextSteps: this.generateNextSteps()
    };
  }
  
  /**
   * Generate implementation plan for current configuration
   */
  generateImplementationPlan(): {
    phase: string;
    description: string;
    features: string[];
    estimatedEffort: string;
    dependencies: string[];
  }[] {
    const level = this.currentConfig.level;
    
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
    Object.keys(this.currentConfig.features.essential).forEach(feature => {
      (this.currentConfig.features.essential as any)[feature] = true;
    });
  }
  
  private enableLargeSolutionSafe(): void {
    Object.keys(this.currentConfig.features.largeSolution).forEach(feature => {
      (this.currentConfig.features.largeSolution as any)[feature] = true;
    });
  }
  
  private enablePortfolioSafe(): void {
    Object.keys(this.currentConfig.features.portfolio).forEach(feature => {
      (this.currentConfig.features.portfolio as any)[feature] = true;
    });
  }
  
  private enableFullSafe(): void {
    this.enableEssentialSafe();
    this.enableLargeSolutionSafe();
    this.enablePortfolioSafe();
    Object.keys(this.currentConfig.features.full).forEach(feature => {
      (this.currentConfig.features.full as any)[feature] = true;
    });
  }
  
  private getEnabledFeatureCount(): number {
    let count = 0;
    Object.values(this.currentConfig.features).forEach(category => {
      Object.values(category).forEach(enabled => {
        if (enabled) count++;
      });
    });
    return count;
  }
  
  private getTotalFeatureCount(): number {
    let count = 0;
    Object.values(this.currentConfig.features).forEach(category => {
      count += Object.keys(category).length;
    });
    return count;
  }
  
  private getMissingFeatures(): string[] {
    const missing: string[] = [];
    Object.entries(this.currentConfig.features).forEach(([categoryName, category]) => {
      Object.entries(category).forEach(([featureName, enabled]) => {
        if (!enabled) {
          missing.push(`${categoryName}.${featureName}`);
        }
      });
    });
    return missing;
  }
  
  private generateNextSteps(): string[] {
    const level = this.currentConfig.level;
    
    switch (level) {
      case SafeConfigurationLevel.ESSENTIAL:
        return [
          'Complete ART coordination implementation',
          'Implement core SAFe events (ART Sync, PI Planning)',
          'Build core artifact management (Features, ART Backlog)',
          'Establish core roles and responsibilities',
          'Enable Team and Technical Agility competency'
        ];
      case SafeConfigurationLevel.LARGE_SOLUTION:
        return [
          'Add Solution Train coordination',
          'Implement solution-level events and artifacts',
          'Enable supplier management capabilities'
        ];
      case SafeConfigurationLevel.PORTFOLIO:
        return [
          'Implement portfolio-level governance',
          'Add epic management and strategic themes',
          'Enable lean portfolio management practices'
        ];
      case SafeConfigurationLevel.FULL:
        return [
          'Complete organizational agility implementation',
          'Enable all spanning palette elements',
          'Implement cultural transformation support'
        ];
      default:
        return [];
    }
  }
  
  private generateEssentialImplementationPlan(): any[] {
    return [
      {
        phase: 'Phase 1: ART Foundation',
        description: 'Establish basic ART coordination and core roles',
        features: ['artCoordination', 'coreRoles'],
        estimatedEffort: '4-6 weeks',
        dependencies: ['Approval gate system', 'Event coordination']
      },
      {
        phase: 'Phase 2: Core Events',
        description: 'Implement ART Sync, PI Planning, and iteration events',
        features: ['coreEvents'],
        estimatedEffort: '6-8 weeks',
        dependencies: ['Phase 1', 'Event scheduling system']
      },
      {
        phase: 'Phase 3: Artifacts & Workflows',
        description: 'Build feature management and ART backlog workflows',
        features: ['coreArtifacts'],
        estimatedEffort: '4-6 weeks',
        dependencies: ['Phase 2', 'Artifact lifecycle management']
      },
      {
        phase: 'Phase 4: Core Competencies',
        description: 'Enable Team and Technical Agility and Agile Product Delivery',
        features: ['teamTechnicalAgility', 'agileProductDelivery'],
        estimatedEffort: '6-8 weeks',
        dependencies: ['Phase 3', 'Learning and measurement systems']
      }
    ];
  }
  
  private generateLargeSolutionImplementationPlan(): any[] {
    return [
      {
        phase: 'Phase 5: Solution Train',
        description: 'Add solution-level coordination and management',
        features: ['solutionTrain', 'solutionManagement'],
        estimatedEffort: '8-10 weeks',
        dependencies: ['Essential SAFe complete']
      }
    ];
  }
  
  private generatePortfolioImplementationPlan(): any[] {
    return [
      {
        phase: 'Phase 6: Portfolio Management',
        description: 'Add portfolio-level governance and epic management',
        features: ['portfolioManagement', 'epicManagement'],
        estimatedEffort: '10-12 weeks',
        dependencies: ['Large Solution SAFe complete']
      }
    ];
  }
  
  private generateFullImplementationPlan(): any[] {
    return [
      {
        phase: 'Phase 7: Full Transformation',
        description: 'Complete organizational agility and cultural transformation',
        features: ['organizationalAgility', 'culturalTransformation'],
        estimatedEffort: '16-20 weeks',
        dependencies: ['Portfolio SAFe complete']
      }
    ];
  }
}

export default SafeConfigurationManager;