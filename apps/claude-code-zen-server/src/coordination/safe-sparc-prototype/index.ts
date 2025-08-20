/**
 * @fileoverview SAFe-SPARC Micro Prototype - Complete Integration with Actual SAFe Roles
 * 
 * This micro prototype demonstrates proper SAFe implementation with:
 * - Actual SAFe Roles: LPM, RTE, PM, SA, EO (@claude-zen/safe-framework)
 * - SPARC Methodology (@claude-zen/sparc)  
 * - Simple LLM-based decisions (not complex neural networks)
 * - Workflow Engine (@claude-zen/workflows)
 * - AGUI Human Oversight (@claude-zen/agui)
 * 
 * The prototype shows how actual SAFe roles can make decisions using simple LLM calls
 * while maintaining human oversight for strategic decisions through AGUI interfaces.
 */

// ============================================================================
// ACTUAL SAFE ROLES IMPLEMENTATION (RECOMMENDED)
// ============================================================================

// Main SAFe micro prototype manager with actual SAFe roles
export { SafeMicroPrototypeManager } from './safe-micro-prototype-manager';
export type { 
  SafeRoleDecision,
  SafeProcessResult
} from './safe-micro-prototype-manager';

// SAFe roles agent with actual role implementations
export { SafeRolesAgent } from './safe-roles-agent';
export type { 
  SafeRoleType,
  SafeRoleConfig,
  SafeRoleDecisionContext,
  SafeRoleDecisionResult
} from './safe-roles-agent';

// SAFe test runner
export { SafeMicroPrototypeTest, runSafeMicroPrototypeTest } from './safe-micro-prototype-test';

// ============================================================================
// LEGACY GENERIC IMPLEMENTATION (DEPRECATED)
// ============================================================================

// Core prototype manager (DEPRECATED - use SafeMicroPrototypeManager instead)
export { MicroPrototypeManager } from './micro-prototype-manager';
export type { 
  EpicProposal, 
  PortfolioDecision, 
  SparcArtifacts 
} from './micro-prototype-manager';

// Individual components (DEPRECATED)
export { BasicPortfolioAgent } from './basic-portfolio-agent';
export type { BasicPortfolioConfig } from './basic-portfolio-agent';

export { BasicSparcWorkflow } from './basic-sparc-workflow';
export type { BasicSparcConfig, SparcExecutionResult } from './basic-sparc-workflow';

export { BasicAguiInterface } from './basic-agui-interface';
export type { BasicAguiConfig, HumanDecisionResponse } from './basic-agui-interface';

// Test runner (DEPRECATED)
export { MicroPrototypeTest, runMicroPrototypeTest } from './micro-prototype-test';

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

// Convenience factory function for SAFe roles implementation (RECOMMENDED)
export async function createSafePrototype(): Promise<SafeMicroPrototypeManager> {
  const manager = new SafeMicroPrototypeManager();
  await manager.initialize();
  return manager;
}

// Legacy factory function (DEPRECATED - use createSafePrototype instead)
export async function createSafeSparcPrototype(): Promise<MicroPrototypeManager> {
  const manager = new MicroPrototypeManager();
  await manager.initialize();
  return manager;
}

/**
 * Quick start example for the SAFe-SPARC micro prototype with actual SAFe roles
 * 
 * @example
 * ```typescript
 * import { createSafePrototype } from './coordination/safe-sparc-prototype';
 * 
 * const prototype = await createSafePrototype();
 * 
 * const epic = {
 *   id: 'epic-001',
 *   title: 'New Customer Portal',
 *   businessCase: 'Improve customer self-service capabilities',
 *   estimatedValue: 500000,
 *   estimatedCost: 150000,
 *   timeframe: '4 months',
 *   riskLevel: 'medium' as const
 * };
 * 
 * const result = await prototype.processSafeEpic(epic);
 * console.log('SAFe decision:', result.overallDecision);
 * console.log('Role decisions:', result.roleDecisions.map(rd => `${rd.roleType}: ${rd.decision}`));
 * ```
 */
export const SAFE_PROTOTYPE_INFO = {
  version: '2.0.0',
  name: 'SAFe-SPARC Micro Prototype with Actual SAFe Roles',
  description: 'Proper SAFe implementation with actual roles using simple LLM decisions',
  safeRoles: [
    'Lean Portfolio Manager (LPM) - Strategic investment decisions',
    'Release Train Engineer (RTE) - Program execution coordination',
    'Product Manager (PM) - Product vision and customer validation',
    'System Architect (SA) - Technical feasibility and architecture',
    'Epic Owner (EO) - Business case development and analysis'
  ],
  components: [
    'Actual SAFe Roles Implementation (LPM, RTE, PM, SA, EO)',
    'Simple LLM-based Decision Making (not complex neural networks)',
    'SPARC Methodology Engine (Specification→Pseudocode→Architecture→Refinement→Completion)',
    'SAFe Framework Integration (Continuous Delivery Pipeline Mapping)', 
    'AGUI Human Oversight (Strategic Decision Points)',
    'Workflow Orchestration (Task Management and Coordination)'
  ],
  packages: [
    '@claude-zen/safe-framework - Actual SAFe role managers and services',
    '@claude-zen/sparc - SPARC methodology implementation',
    '@claude-zen/workflows - Battle-tested workflow orchestration',
    '@claude-zen/agui - Human-in-the-loop interfaces',
    '@claude-zen/foundation - Core utilities and performance tracking'
  ],
  capabilities: [
    'Proper SAFe governance with all 5 key roles',
    'Sequential role-based decision making following SAFe methodology',
    'Simple LLM decisions without complex neural coordination',
    'Systematic development methodology through SPARC phases',
    'Continuous delivery pipeline integration via SAFe framework',
    'Human oversight for critical and high-risk decisions via AGUI',
    'SAFe consensus building and conflict resolution',
    'Role-specific performance tracking and metrics'
  ],
  safeGovernance: {
    decisionFlow: 'Epic Owner → LPM → Product Manager → System Architect → RTE',
    consensusRules: 'LPM rejection is final, majority approval with LPM support required',
    humanOversight: 'Triggered for high-risk, high-value, or low-confidence decisions',
    qualityGates: 'Role-specific validation and approval processes'
  },
  iterativeDesign: {
    principle: 'Start with core SAFe roles, extend iteratively without data loss',
    extensionPoints: [
      'Add additional SAFe roles (Solution Train Engineer, DevSecOps)',
      'Enhance role decision algorithms with more sophisticated reasoning',
      'Expand AGUI interfaces for different SAFe ceremonies',
      'Integrate SAFe metrics and Program Increment planning',
      'Add value stream mapping and optimization'
    ]
  }
} as const;

// Legacy info for backwards compatibility
export const MICRO_PROTOTYPE_INFO = SAFE_PROTOTYPE_INFO;