/**
 * @fileoverview SAFe Coverage Calculator - Honest Assessment
 *
 * Calculates actual SAFe implementation coverage based on real capabilities
 * rather than placeholder code or theoretical implementations.
 */

import {
  ESSENTIAL_SAFE_COMPONENTS,
} from './essential-safe-readiness.js';
// ============================================================================
// COVERAGE CALCULATION ENGINE
// ============================================================================

/**
 * Calculate realistic SAFe coverage based on actual implementations
 */
export function calculateActualSafeCoverage(): {
  essentialSafeCoverage: number;
  overallSafeCoverage: number;
  breakdown: {
    complete: number;
    partial: number;
    missing: number;
  };
  strengths: string[];
  gaps: string[];
  recommendation: string;
} {
  // Count Essential SAFe components by status
  const completeComponents = ESSENTIAL_SAFE_COMPONENTS.filter(
    (c) => c.taskMasterSupport ==='complete'
  );
  const partialComponents = ESSENTIAL_SAFE_COMPONENTS.filter(
    (c) => c.taskMasterSupport ==='partial'
  );
  const missingComponents = ESSENTIAL_SAFE_COMPONENTS.filter(
    (c) => c.taskMasterSupport ==='missing'
  );

  // Calculate Essential SAFe coverage (weighted: complete=1.0, partial=0.5, missing=0.0)
  const essentialSafeCoverage = Math.round(
    ((completeComponents.length * 1.0 + partialComponents.length * 0.5) /
      ESSENTIAL_SAFE_COMPONENTS.length) *
      100
  );

  // Essential SAFe is ~25% of Full SAFe, so scale accordingly
  const overallSafeCoverage = Math.round(essentialSafeCoverage * 0.25);

  return {
    essentialSafeCoverage,
    overallSafeCoverage,
    breakdown: {
      complete: completeComponents.length,
      partial: partialComponents.length,
      missing: missingComponents.length,
    },
    strengths: [
     'Universal approval gate orchestration,
     'AI-powered decision making,
     'Complete role-based workflows,
     'Kanban flow via approval states,
     'SOC2-compliant audit trails,
     'Learning and improvement systems,
    ],
    gaps: [
     'Event coordination and facilitation,
     'Artifact template management,
     'Competency practice frameworks,
     'PI planning coordination,
     'Vision and roadmap management,
    ],
    recommendation: generateRecommendation(
      essentialSafeCoverage,
      overallSafeCoverage
    ),
  };
}

function generateRecommendation(
  essentialCoverage: number,
  _overallCoverage: number
): string {
  if (essentialCoverage >= 80) {
    return'Strong foundation - focus on completing Essential SAFe before expanding';
  } else if (essentialCoverage >= 60) {
    return'Good progress - complete remaining Essential SAFe components';
  } else if (essentialCoverage >= 40) {
    return'Solid foundation - systematic approach to complete Essential SAFe';
  } else {
    return'Early stage - focus on core Essential SAFe implementation';
  }
}

/**
 * Generate honest assessment report
 */
export function generateHonestAssessmentReport(): string {
  const coverage = calculateActualSafeCoverage();

  return ``
# TaskMaster SAFe Implementation - Honest Assessment

## Executive Summary
- **Essential SAFe Coverage**: $coverage.essentialSafeCoverage%
- **Overall SAFe Coverage**: $coverage.overallSafeCoverage%
- **Recommendation**: $coverage.recommendation

## Component Status
- ✅ **Complete**: $coverage.breakdown.completecomponents
- ⚠️ **Partial**: $coverage.breakdown.partialcomponents  
- ❌ **Missing**: $coverage.breakdown.missingcomponents

## TaskMaster Strengths
$coverage.strengths.map((s) => `- ${s}`).join('\n')

## Critical Gaps
$coverage.gaps.map((g) => `- ${g}`).join('\n')

## Next Steps
1. Complete partial implementations (4-6 weeks)
2. Build missing essential components (6-8 weeks)
3. Validate end-to-end Essential SAFe workflows (2-3 weeks)

**Total Time to Essential SAFe**: 12-17 weeks
**Total Time to Meaningful SAFe Coverage**: 6-12 months
`;`
}

export default calculateActualSafeCoverage;
