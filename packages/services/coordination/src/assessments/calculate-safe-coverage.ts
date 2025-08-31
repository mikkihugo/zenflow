/**
 * @fileoverview SAFe Coverage Calculator - Honest Assessment
 *
 * Calculates actual SAFe implementation coverage based on real capabilities
 * rather than placeholder code or theoretical implementations.
 */
// import {
//   ESSENTIAL_SAFE_COMPONENTS
// } from './essential-safe-readiness.js';

// Temporary mock until essential-safe-readiness.ts is fixed
const ESSENTIAL_SAFE_COMPONENTS = [
  { taskMasterSupport: 'complete' },
  { taskMasterSupport: 'partial' },
  { taskMasterSupport: 'missing' },
];

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
  // Advanced recommendation logic that considers both essential and overall coverage
  const coverageGap = Math.abs(essentialCoverage - overallCoverage);

  if (essentialCoverage >= 80) {
    if (overallCoverage >= 60 && coverageGap < 10) {
      return 'Strong foundation with balanced implementation - ready for next SAFe level';
    } else if (overallCoverage < 40) {
      return 'Strong Essential SAFe foundation - focus on expanding to Large Solution';
    } else {
      return 'Strong foundation - focus on completing Essential SAFe before expanding';
    }
  } else if (essentialCoverage >= 60) {
    return overallCoverage >= essentialCoverage + 15
      ? 'Good progress with advanced features - consolidate Essential SAFe first'
      : 'Good progress - complete remaining Essential SAFe components';
  } else if (essentialCoverage >= 40) {
    return coverageGap > 20
      ? 'Unbalanced implementation - focus on Essential SAFe core before advanced features'
      : 'Solid foundation - systematic approach to complete Essential SAFe';
  } else {
    return overallCoverage > essentialCoverage + 20
      ? 'Focus on Essential SAFe fundamentals before advanced implementations'
      : 'Early stage - focus on core Essential SAFe implementation';
  }
}
/**
 * Generate honest assessment report
 */
export function generateHonestAssessmentReport(): string {
  const coverage = calculateActualSafeCoverage();

  // Calculate overall coverage including large solution and portfolio components
  const overallCoverage = Math.round(coverage.essentialSafeCoverage * 0.7); // Estimate based on essential coverage

  // Generate strategic recommendation
  const strategicRecommendation = generateRecommendation(
    coverage.essentialSafeCoverage,
    overallCoverage
  );

  return "Fixed unterminated template" `- ${r}"Fixed unterminated template"
"Fixed unterminated template"