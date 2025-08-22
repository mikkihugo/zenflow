/**
 * @fileoverview Essential SAFe 6.0 Readiness Assessment
 *
 * **REALISTIC ASSESSMENT OF TASKMASTER'S ESSENTIAL SAFe COVERAGE:**
 *
 * This assessment evaluates what TaskMaster actually provides for Essential SAFe 6.0
 * versus what's needed for complete implementation.
 */

import { getLogger } from '@claude-zen/foundation';
import {
  SafeConfigurationManager,
  SafeConfigurationLevel,
} from '../config/safe-configuration.js';

const logger = getLogger('EssentialSafeReadiness');

// ============================================================================
// ESSENTIAL SAFe 6.0 COMPONENTS ASSESSMENT
// ============================================================================

/**
 * Essential SAFe component with implementation status
 */
export interface EssentialSafeComponent {
  name: string;
  category: 'role | event|artifact|competency|practice';
  description: string;
  required: boolean;
  taskMasterSupport: 'complete | partial|missing';
  implementationGap: string;
  effortEstimate: 'low | medium|high';
}

/**
 * Complete Essential SAFe 6.0 component inventory
 */
export const ESSENTIAL_SAFE_COMPONENTS: EssentialSafeComponent[] = [
  // ============================================================================
  // CORE ROLES (What we HAVE)
  // ============================================================================
  {
    name: 'Release Train Engineer (RTE)',
    category: 'role',
    description: 'Servant leader and chief Scrum Master for the ART',
    required: true,
    taskMasterSupport: 'complete', // ✅ Role-based approval routing
    implementationGap:
      'None - TaskMaster handles RTE workflows via approval orchestration',
    effortEstimate: 'low',
  },
  {
    name: 'Business Owners',
    category: 'role',
    description: 'Stakeholders with business responsibility for ROI',
    required: true,
    taskMasterSupport: 'complete', // ✅ Stakeholder approval workflows
    implementationGap: 'None - Business Owner approval gates implemented',
    effortEstimate: 'low',
  },
  {
    name: 'Product Owners',
    category: 'role',
    description: 'Define features and content for the ART',
    required: true,
    taskMasterSupport: 'complete', // ✅ Product Owner approval workflows
    implementationGap: 'None - PO role and workflows implemented',
    effortEstimate: 'low',
  },
  {
    name: 'Scrum Masters/Team Coaches',
    category: 'role',
    description: 'Facilitate team processes and remove impediments',
    required: true,
    taskMasterSupport: 'complete', // ✅ Team lead approval workflows
    implementationGap: 'None - Scrum Master workflows via task approval system',
    effortEstimate: 'low',
  },
  {
    name: 'Agile Teams (5-15 teams)',
    category: 'role',
    description: 'Cross-functional teams delivering value',
    required: true,
    taskMasterSupport: 'complete', // ✅ Team-based approval routing
    implementationGap: 'None - Team approval workflows implemented',
    effortEstimate: 'low',
  },

  // ============================================================================
  // CORE ARTIFACTS (What we HAVE via Kanban)
  // ============================================================================
  {
    name: 'ART Backlog',
    category: 'artifact',
    description: 'Prioritized list of features for the ART',
    required: true,
    taskMasterSupport: 'complete', // ✅ Via approval gate kanban flow
    implementationGap: 'None - Backlog represented as approval workflow states',
    effortEstimate: 'low',
  },
  {
    name: 'Features',
    category: 'artifact',
    description: 'Services that fulfill stakeholder needs',
    required: true,
    taskMasterSupport: 'complete', // ✅ Feature approval gates with state flow
    implementationGap:
      'None - Features flow through approval gates (WIP→In Progress→Done)',
    effortEstimate: 'low',
  },
  {
    name: 'PI Objectives',
    category: 'artifact',
    description: 'Business and technical objectives for the Planning Interval',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Could be represented as approval gate outcomes
    implementationGap:
      'Need PI Objective template and tracking within approval system',
    effortEstimate: 'medium',
  },
  {
    name: 'Iteration Goals',
    category: 'artifact',
    description: 'Team commitments for upcoming iteration',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Team-level approval gate outcomes
    implementationGap:
      'Need iteration goal templates within team approval workflows',
    effortEstimate: 'medium',
  },
  {
    name: 'Vision',
    category: 'artifact',
    description: 'High-level description of intended solution',
    required: true,
    taskMasterSupport: 'missing', // ❌ No vision management
    implementationGap: 'Need vision artifact management and alignment tracking',
    effortEstimate: 'medium',
  },

  // ============================================================================
  // CORE EVENTS (What we NEED to build)
  // ============================================================================
  {
    name: 'Planning Interval (PI) Planning',
    category: 'event',
    description: 'Cadence-based event for ART planning and alignment',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Could use approval gates for PI planning workflow
    implementationGap:
      'Need PI planning event coordination and team breakout support',
    effortEstimate: 'high',
  },
  {
    name: 'ART Sync',
    category: 'event',
    description: 'Combined Coach and PO sync for ART alignment',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Cross-team approval coordination
    implementationGap: 'Need ART sync facilitation and dependency resolution',
    effortEstimate: 'medium',
  },
  {
    name: 'System Demo',
    category: 'event',
    description: 'Integrated system demonstration every iteration',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Demo approval gates
    implementationGap:
      'Need demo scheduling and stakeholder feedback collection',
    effortEstimate: 'medium',
  },
  {
    name: 'Inspect & Adapt',
    category: 'event',
    description: 'Improvement workshop at end of PI',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Learning system integration
    implementationGap: 'Need I&A facilitation and improvement tracking',
    effortEstimate: 'medium',
  },
  {
    name: 'Iteration Planning',
    category: 'event',
    description: 'Team event for iteration commitment',
    required: true,
    taskMasterSupport: 'complete', // ✅ Via team approval workflows
    implementationGap: 'None - Team planning via approval task creation',
    effortEstimate: 'low',
  },
  {
    name: 'Iteration Review',
    category: 'event',
    description: 'Team review of completed work',
    required: true,
    taskMasterSupport: 'complete', // ✅ Via completed approval gate review
    implementationGap: 'None - Review via approval gate completion workflows',
    effortEstimate: 'low',
  },

  // ============================================================================
  // CORE COMPETENCIES (What we NEED to build)
  // ============================================================================
  {
    name: 'Team and Technical Agility',
    category: 'competency',
    description: 'High-performing agile teams with technical practices',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Technical approval gates exist
    implementationGap:
      'Need technical practice guidance and team performance metrics',
    effortEstimate: 'high',
  },
  {
    name: 'Agile Product Delivery',
    category: 'competency',
    description: 'Customer-centric approach to product development',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Product approval workflows exist
    implementationGap:
      'Need customer feedback integration and product analytics',
    effortEstimate: 'high',
  },
  {
    name: 'Continuous Learning Culture',
    category: 'competency',
    description: 'Innovation and relentless improvement culture',
    required: true,
    taskMasterSupport: 'complete', // ✅ Learning system implemented
    implementationGap: 'None - Learning from approval decisions and outcomes',
    effortEstimate: 'low',
  },

  // ============================================================================
  // KEY PRACTICES (Mixed implementation)
  // ============================================================================
  {
    name: 'Kanban Visualization',
    category: 'practice',
    description: 'Visual workflow management',
    required: true,
    taskMasterSupport: 'complete', // ✅ Approval gate state visualization
    implementationGap:
      'None - Kanban via approval gate states and AGUI dashboard',
    effortEstimate: 'low',
  },
  {
    name: 'WIP Limits',
    category: 'practice',
    description: 'Work-in-progress constraints',
    required: true,
    taskMasterSupport: 'partial', // ⚠️ Could implement via approval thresholds
    implementationGap: 'Need WIP limit enforcement in approval gate system',
    effortEstimate: 'medium',
  },
  {
    name: 'Definition of Done',
    category: 'practice',
    description: 'Shared understanding of work completion',
    required: true,
    taskMasterSupport: 'complete', // ✅ DoD approval gates
    implementationGap: 'None - DoD via approval gate criteria and validation',
    effortEstimate: 'low',
  },
];

// ============================================================================
// READINESS ASSESSMENT ENGINE
// ============================================================================

/**
 * Essential SAFe readiness assessment
 */
export class EssentialSafeReadinessAssessment {
  private configManager: SafeConfigurationManager;

  constructor(configManager: SafeConfigurationManager) {
    this.configManager = configManager;
  }

  /**
   * Generate comprehensive readiness assessment
   */
  generateAssessment(): {
    overallReadiness: number;
    componentBreakdown: {
      complete: EssentialSafeComponent[];
      partial: EssentialSafeComponent[];
      missing: EssentialSafeComponent[];
    };
    implementationPlan: {
      phase: string;
      components: string[];
      effort: string;
      description: string;
    }[];
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
      componentBreakdown: { complete, partial, missing },
      implementationPlan: this.generateImplementationPlan(partial, missing),
      taskMasterStrengths: this.identifyTaskMasterStrengths(complete),
      criticalGaps: this.identifyCriticalGaps(missing, partial),
      timeToEssentialSafe: this.estimateTimeToCompletion(partial, missing),
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
        phase: 'Phase 1: Complete Partial Components (4-6 weeks)',
        components: partial.map((c) => c.name),
        effort: 'Medium',
        description:
          'Enhance existing TaskMaster capabilities to fully support Essential SAFe',
      },
      {
        phase: 'Phase 2: Build Missing Components (6-8 weeks)',
        components: missing.map((c) => c.name),
        effort: 'High',
        description:
          'Develop new capabilities for complete Essential SAFe support',
      },
      {
        phase: 'Phase 3: Integration & Testing (2-3 weeks)',
        components: ['End-to-end workflow testing', 'Performance optimization'],
        effort: 'Medium',
        description: 'Validate complete Essential SAFe implementation',
      },
    ];
  }

  private identifyTaskMasterStrengths(
    complete: EssentialSafeComponent[]
  ): string[] {
    return [
      'Universal approval gate orchestration across all SAFe levels',
      'AI-powered decision making with human oversight',
      'Complete audit trails and SOC2 compliance',
      'Role-based workflow coordination',
      'Kanban flow visualization via approval gate states',
      'Learning and continuous improvement from decisions',
      'Event-driven coordination and real-time updates',
      'AGUI dashboard for complete visibility',
    ];
  }

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

  private estimateTimeToCompletion(
    partial: EssentialSafeComponent[],
    missing: EssentialSafeComponent[]
  ): string {
    const partialEffort = partial.reduce((total, c) => {
      return (
        total +
        (c.effortEstimate === 'high'
          ? 3
          : c.effortEstimate === 'medium'
            ? 2
            : 1)
      );
    }, 0);

    const missingEffort = missing.reduce((total, c) => {
      return (
        total +
        (c.effortEstimate === 'high'
          ? 3
          : c.effortEstimate === 'medium'
            ? 2
            : 1)
      );
    }, 0);

    const totalWeeks = Math.ceil((partialEffort + missingEffort) * 1.5); // Buffer factor

    return `${totalWeeks - 4}-${totalWeeks} weeks`;
  }
}

export default EssentialSafeReadinessAssessment;
