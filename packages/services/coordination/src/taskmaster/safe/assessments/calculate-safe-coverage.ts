/**
 * @fileoverview SAFe Coverage Calculator - Honest Assessment
 *
 * Calculates actual SAFe implementation coverage based on real capabilities
 * rather than placeholder code or theoretical implementations.
 */
import { ESSENTIAL_SAFE_COMPONENTS } from './essential-safe-readiness.js';

// ============================================================================
// COVERAGE CALCULATION ENGINE
// ============================================================================
/**
 * Calculate realistic SAFe coverage based on actual implementations
 */
export function calculateActualSafeCoverage(): {
  essentialSafeCoverage: number;
  implementedComponents: number;
  partialComponents: number;
  missingComponents: number;
  recommendations: string[];
} {
  const completeComponents = ESSENTIAL_SAFE_COMPONENTS.filter(
    (c) => c.taskMasterSupport === 'complete'
  );
  const partialComponents = ESSENTIAL_SAFE_COMPONENTS.filter(
    (c) => c.taskMasterSupport === 'partial'
  );
  const missingComponents = ESSENTIAL_SAFE_COMPONENTS.filter(
    (c) => c.taskMasterSupport === 'missing'
  );
  // Calculate Essential SAFe coverage (weighted: complete=1.0, partial=0.5, missing=0.0)
  const essentialSafeCoverage = Math.round(
    ((completeComponents.length * 1.0 + partialComponents.length * 0.5) /
      ESSENTIAL_SAFE_COMPONENTS.length) *
      100
  );

  return {
    essentialSafeCoverage,
    implementedComponents: completeComponents.length,
    partialComponents: partialComponents.length,
    missingComponents: missingComponents.length,
    recommendations: [
      'Focus on completing missing components for full Essential SAFe coverage',
      'Enhance partial implementations to achieve complete component coverage',
      'Consider progression to Large Solution SAFe once Essential SAFe is fully implemented',
    ],
  };
}

/**
 * Generate recommendations based on coverage analysis
 */
function generateRecommendation(
  essentialCoverage: number,
  overallCoverage: number
): string {
  if (essentialCoverage >= 80) {
    return 'Strong foundation - focus on completing Essential SAFe before expanding';
  } else if (essentialCoverage >= 60) {
    return 'Good progress - complete remaining Essential SAFe components';
  } else if (essentialCoverage >= 40) {
    return 'Solid foundation - systematic approach to complete Essential SAFe';
  } else {
    return 'Early stage - focus on core Essential SAFe implementation';
  }
}
/**
 * Generate honest assessment report
 */
export function generateHonestAssessmentReport(): string {
  const coverage = calculateActualSafeCoverage();

  return "# TaskMaster SAFe Implementation - Honest Assessment"

## Executive Summary
- **Essential SAFe Coverage**: ${coverage.essentialSafeCoverage}%
- **Implemented Components**: ${coverage.implementedComponents}
- **Partial Components**: ${coverage.partialComponents}  
- **Missing Components**: ${coverage.missingComponents}

## Recommendations
${coverage.recommendations.map((r) => `- ${r}").join('\n')}"

## Next Steps
Focus on completing missing components for full Essential SAFe coverage
";"
}
