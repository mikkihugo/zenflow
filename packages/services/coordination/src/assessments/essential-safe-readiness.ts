/**
 * @fileoverview Essential SAFe 6.0 Readiness Assessment
 *
 * REALISTIC ASSESSMENT OF TASKMASTER'S ESSENTIAL SAFe COVERAGE
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('EssentialSafeReadiness');

// Constants for SAFe categories
const CORE_ROLES = 'Core Roles';
const CORE_ARTIFACTS = 'Core Artifacts';
const CORE_EVENTS = 'Core Events';
const CORE_COMPETENCIES = 'Core Competencies';
const KEY_PRACTICES = 'Key Practices';

// Configuration manager interface
interface ConfigManager {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
}

// Implementation plan item interface
interface ImplementationPlanItem {
  component: string;
  priority: 'high' | 'medium' | 'low';
  estimatedEffort: string;
  dependencies: string[];
  description: string;
}

// ============================================================================
// ESSENTIAL SAFe 6.0 COMPONENTS ASSESSMENT
// ============================================================================

/**
 * Essential SAFe component with implementation status
 */
export interface EssentialSafeComponent {
  name: string;
  category: string;
  description: string;
  required: boolean;
  taskMasterSupport: 'complete' | 'partial' | 'missing';
  implementationGap: string;
  effortEstimate: 'low' | 'medium' | 'high';
}

/**
 * Essential SAFe 6.0 components assessment
 */
export const ESSENTIAL_SAFE_COMPONENTS: EssentialSafeComponent[] = [
  // ============================================================================
  // CORE ROLES (What we HAVE)
  // ============================================================================
  {
    name: 'Release Train Engineer',
    category: CORE_ROLES,
    description: 'Facilitates PI planning and execution',
    required: true,
    taskMasterSupport: 'complete', // ✅ Role-based approval routing
    implementationGap: 'None - TaskMaster handles RTE workflows via approval orchestration',
    effortEstimate: 'low'
  },
  {
    name: 'Product Owner',
    category: CORE_ROLES,
    description: 'Defines and prioritizes features',
    required: true,
    taskMasterSupport: 'complete', // ✅ Stakeholder approval workflows
    implementationGap: 'None - Product Owner approval workflows integrated',
    effortEstimate: 'low'
  },
  {
    name: 'Scrum Master',
    category: CORE_ROLES,
    description: 'Facilitates team processes',
    required: true,
    taskMasterSupport: 'complete', // ✅ Product Owner approval workflows
    implementationGap: 'None - Team lead approval workflows available',
    effortEstimate: 'low'
  },
  {
    name: 'Development Team',
    category: CORE_ROLES,
    description: 'Delivers working software',
    required: true,
    taskMasterSupport: 'complete', // ✅ Team lead approval workflows
    implementationGap: 'None - Team-based approval routing implemented',
    effortEstimate: 'low'
  },
  {
    name: 'Business Owner',
    category: CORE_ROLES,
    description: 'Provides business context',
    required: true,
    taskMasterSupport: 'complete', // ✅ Team-based approval routing
    implementationGap: 'None - Business stakeholder approval workflows available',
    effortEstimate: 'low'
  },

  // ============================================================================
  // CORE ARTIFACTS (What we HAVE via Kanban)
  // ============================================================================
  {
    name: 'Program Backlog',
    category: CORE_ARTIFACTS,
    description: 'Prioritized list of features',
    required: true,
    taskMasterSupport: 'complete', // ✅ Via approval gate kanban flow
    implementationGap: 'None - Backlog managed through approval gates',
    effortEstimate: 'low'
  },
  {
    name: 'Features',
    category: CORE_ARTIFACTS,
    description: 'Services requirements for PI planning',
    required: true,
    taskMasterSupport: 'complete', // ✅ Feature approval gates with state flow
    implementationGap: 'None - Features flow through approval gates (WIP→In Progress→Done)',
    effortEstimate: 'low'
  },
  {
    name: 'PI Objectives',
    category: CORE_ARTIFACTS,
    description: 'Business and team objectives for PI',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Could be represented as approval gate outcomes
    implementationGap: 'Need PI Objective template and tracking within approval system',
    effortEstimate: 'medium'
  },
  {
    name: 'Team PI Objectives',
    category: CORE_ARTIFACTS,
    description: 'Team-level objectives and commitments',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Team-level approval gate outcomes
    implementationGap: 'Need iteration goal templates within team approval workflows',
    effortEstimate: 'medium'
  },
  {
    name: 'Vision',
    category: CORE_ARTIFACTS,
    description: 'Future state description',
    required: true,
    taskMasterSupport: 'missing', // ❌ No vision management
    implementationGap: 'Need vision management and stakeholder alignment tools',
    effortEstimate: 'high'
  },

  // ============================================================================
  // CORE EVENTS (What we NEED to build)
  // ============================================================================
  {
    name: 'PI Planning',
    category: CORE_EVENTS,
    description: 'Quarterly planning event',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Could use approval gates for PI planning workflow
    implementationGap: 'Need PI planning event coordination and team breakout support',
    effortEstimate: 'high'
  },
  {
    name: 'Scrum of Scrums',
    category: CORE_EVENTS,
    description: 'ART sync coordination',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Cross-team approval coordination
    implementationGap: 'Need cross-team impediment tracking and dependency coordination',
    effortEstimate: 'medium'
  },
  {
    name: 'System Demo',
    category: CORE_EVENTS,
    description: 'End-of-iteration demo',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Demo approval gates
    implementationGap: 'Need demo scheduling and stakeholder feedback collection',
    effortEstimate: 'medium'
  },
  {
    name: 'Inspect and Adapt',
    category: CORE_EVENTS,
    description: 'PI retrospective and improvement',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Learning system integration
    implementationGap: 'Need structured retrospective and improvement tracking',
    effortEstimate: 'medium'
  },
  {
    name: 'Iteration Planning',
    category: CORE_EVENTS,
    description: 'Sprint planning within PI',
    required: true,
    taskMasterSupport: 'complete', // ✅ Via team approval workflows
    implementationGap: 'None - Sprint planning supported through approval workflows',
    effortEstimate: 'low'
  },
  {
    name: 'Iteration Review',
    category: CORE_EVENTS,
    description: 'Sprint review and demo',
    required: true,
    taskMasterSupport: 'complete', // ✅ Via completed approval gate review
    implementationGap: 'None - Review supported through approval gate completion',
    effortEstimate: 'low'
  },

  // ============================================================================
  // CORE COMPETENCIES (What we NEED to build)
  // ============================================================================
  {
    name: 'Team and Technical Agility',
    category: CORE_COMPETENCIES,
    description: 'High-performing agile teams',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Technical approval gates exist
    implementationGap: 'Need technical practice guidance and team performance metrics',
    effortEstimate: 'high'
  },
  {
    name: 'Agile Product Delivery',
    category: CORE_COMPETENCIES,
    description: 'Customer-centric product development',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Product approval workflows exist
    implementationGap: 'Need customer feedback integration and product analytics',
    effortEstimate: 'high'
  },
  {
    name: 'Lean-Agile Leadership',
    category: CORE_COMPETENCIES,
    description: 'Leadership mindset and approach',
    required: true,
    taskMasterSupport: 'complete', // ✅ Learning system implemented
    implementationGap: 'None - Leadership workflows supported through approval system',
    effortEstimate: 'low'
  },

  // ============================================================================
  // KEY PRACTICES (Mixed implementation)
  // ============================================================================
  {
    name: 'Program Kanban',
    category: KEY_PRACTICES,
    description: 'Visual workflow management',
    required: true,
    taskMasterSupport: 'complete', // ✅ Approval gate state visualization
    implementationGap: 'None - Kanban via approval gate states and AGUI dashboard',
    effortEstimate: 'low'
  },
  {
    name: 'WSJF Prioritization',
    category: KEY_PRACTICES,
    description: 'Weighted Shortest Job First',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Could implement via approval thresholds
    implementationGap: 'Need WSJF scoring integration with approval prioritization',
    effortEstimate: 'medium'
  },
  {
    name: 'Definition of Done',
    category: KEY_PRACTICES,
    description: 'Quality standards and acceptance criteria',
    required: true,
    taskMasterSupport: 'complete', // ✅ DoD approval gates
    implementationGap: 'None - DoD enforced through approval gate criteria',
    effortEstimate: 'low'
  }
];

// ============================================================================
// READINESS ASSESSMENT ENGINE
// ============================================================================

/**
 * Essential SAFe readiness assessment
 */
export class EssentialSafeReadinessAssessment {
  private configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    logger.info('EssentialSafeReadinessAssessment initialized');
  }

  /**
   * Generate comprehensive readiness assessment
   */
  generateAssessment():  {
    overallReadiness: number;
    componentBreakdown:  {
      complete: EssentialSafeComponent[];
      partial: EssentialSafeComponent[];
      missing: EssentialSafeComponent[];
    };
    implementationPlan: ImplementationPlanItem[];
    taskMasterStrengths: string[];
    criticalGaps: string[];
    timeToEssentialSafe: string;
  } {
    const complete = ESSENTIAL_SAFE_COMPONENTS.filter(
      (c) => c.taskMasterSupport === 'complete'
    );
    const partial = ESSENTIAL_SAFE_COMPONENTS.filter(
      (c) => c.taskMasterSupport === 'partial'
    );
    const missing = ESSENTIAL_SAFE_COMPONENTS.filter(
      (c) => c.taskMasterSupport === 'missing'
    );

    const overallReadiness = Math.round(
      ((complete.length * 1.0 + partial.length * 0.5 + missing.length * 0.0) /
        ESSENTIAL_SAFE_COMPONENTS.length) *
        100
    );

    return {
      overallReadiness,
      componentBreakdown:  { complete, partial, missing },
      implementationPlan: this.generateImplementationPlan(partial, missing),
      taskMasterStrengths: this.identifyTaskMasterStrengths(complete),
      criticalGaps: this.identifyCriticalGaps(missing, partial),
      timeToEssentialSafe: this.estimateTimeToCompletion(partial, missing)
    };
  }

  /**
   * Generate realistic implementation plan
   */
  private generateImplementationPlan(
    partial: EssentialSafeComponent[],
    missing: EssentialSafeComponent[]
  ) {
    return [
      {
        phase: 'Phase 1: Enhancement',
        components: partial.map((c) => c.name),
        effort: '4-6 weeks',
        description: 'Enhance existing TaskMaster capabilities to fully support Essential SAFe'
      },
      {
        phase: 'Phase 2: Development',
        components: missing.map((c) => c.name),
        effort: '8-12 weeks',
        description: 'Develop new capabilities for complete Essential SAFe support'
      },
      {
        phase: 'Phase 3: Integration',
        components: ['End-to-end workflow validation', 'User training', 'Change management'],
        effort: '2-4 weeks',
        description: 'Integration testing and organizational change management'
      }
    ];
  }

  /**
   * Identify TaskMaster strengths
   */
  private identifyTaskMasterStrengths(complete: EssentialSafeComponent[]): string[] {
    return complete.map(c => `${c.name}: ${c.implementationGap}`);
  }

  /**
   * Identify critical gaps
   */
  private identifyCriticalGaps(
    missing: EssentialSafeComponent[],
    partial: EssentialSafeComponent[]
  ): string[] {
    const criticalMissing = missing
      .filter((c) => c.required)
      .map((c) => c.name);
    
    const criticalPartial = partial
      .filter((c) => c.effortEstimate === 'high')
      .map((c) => c.name);
    
    return [...criticalMissing, ...criticalPartial];
  }

  /**
   * Estimate time to completion
   */
  private estimateTimeToCompletion(
    partial: EssentialSafeComponent[],
    missing: EssentialSafeComponent[]
  ): string {
    const partialEffort = partial.reduce((total, c) => total + (c.effortEstimate === 'high' ? 3 
        : c.effortEstimate === 'medium' ? 2 
        : 1), 0);

    const missingEffort = missing.reduce((total, c) => total + (c.effortEstimate === 'high' ? 3 
        : c.effortEstimate === 'medium' ? 2 
        : 1), 0);

    const totalWeeks = Math.ceil((partialEffort + missingEffort) * 1.5); // Buffer factor
    return `${totalWeeks - 4}-${totalWeeks} weeks`;
  }
}

export default EssentialSafeReadinessAssessment;