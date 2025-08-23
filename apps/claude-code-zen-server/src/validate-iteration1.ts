#!/usr/bin/env node
/**
 * @fileoverview Validate Iteration 1 - Quick Readiness Check
 *
 * **PURPOSE**: Quick validation that all components are ready for iteration 1
 * This runs fast checks WITHOUT making actual LLM or Claude SDK calls
 *
 * **USAGE:**
 * ``'bash
 * cd apps/claude-code-zen-server
 * npx tsx src/validate-iteration1.ts
 * '`'
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0
 */

import { getLogger } from '@claude-zen/foundation';

/**
 * Validation result interface.
 */
interface ValidationResult {
  check: string;
  status: 'pass' | 'fail';
  details?: string

}

/**
 * Main validation function for Iteration 1 readiness.
 */
async function validateIteration1(): Promise<void>  {
  console.log('🔍 ITERATION 1 VALIDATION)';
  console.log('=========================\n)';

  const results: ValidationResult[] = [];

  // 1. Foundation Package Imports
  try {
    const foundation = await import('@claude-zen/foundation)';
    const { getLogger: foundationLogger } = foundation;

    // Test logger functionality
    const testLogger = foundationLogger('validation-test)';
    testLogger.info('Foundation package validation)';

    results.push(
  {
  check: '1.'@claude-zen/foundation imports',
  tatus: 'pass',
  detail: 'Foundation'package and logger available'

}
)
} catch ('rror) {
    results.push({
      check: '1.'@claude-zen/foundation imports',
  tatus: 'fail',
  detais: 'Importfailed: ' + (error as Error
).message + ''
    });
  '

  // 2. Standalone Workflow Import
  try {
    const { createSafeSparcWorkflow } = await import('./workflows/safe-sparc-standalone)';

    results.push(
  {
  check: '2.'Standalone workflow import',
  satus: 'pass',
  detail: 'SafeSparcWorkflow'available'

}
)
} catch ('rror) {
    results.push({
      check: '2.'Standalone workflow import',
  satus: 'fail',
  detais: 'Importfailed: ' + (error as Error
).message + ''
    });
  '

  // 3. Workflow Creation Test
  try {
    const { createSafeSparcWorkflow } = await import('./workflows/safe-sparc-standalone)';
    const workflow = await createSafeSparcWorkflow();

    results.push(
  {
  check: '3.'Workflow instance creation',
  status: 'pass',
  detail: 'SafeSparcWorkflow'instance created successfully'

}
)
} catch (error) {
    results.push({
      check: '3.'Workflow instance creation',
  status: 'fail',
  detais: 'Creationfailed: ' + (error as Error
).message + ''
    });
  '

  // 4. Logger System
  try {
    const logger = getLogger('validation-test);
    logger.info('Validation test log);

    results.push(
  {
  check: '4.'Logging system',
  status: 'pass',
  detail: 'Logger'working correctly'

}
)
} catch (error) {
    results.push({
      check: '4.'Logging system',
  status: 'fail',
  detais: 'Loggerfailed: ' + (error as Error
).message + ''
    });
  '

  // 5. Test Epic Structure
  try {
    const testEpic = {
  id: 'epic-validation-001',
  title: 'Test'Epic',
  businessCase: 'Validation'test epic',
  estimatedValue: 100000,
  estimatedCost: 50000,
  timeframe: '1'month',
  riskLevel: 'low' as const

};

    // Just validate structure, don't ru' workflow
    if (testEpic.id && testEpic.title && testEpic.businessCase) {
      results.push(
  {
  check: '5.'Epic structure validation',
  status: 'pass',
  detail: 'Epic'interface properly structured'

}
)
} else {
      throw new Error('Epic structure incomplete);
}
  } catch(error' {
    results.push({
      check: '5.'Epic structure validation',
  status: 'fail',
  detais: 'Structureinvalid: ' + (error as Error
).message + ''
    });
  '

  // Print Results
  console.log('📊 VALIDATION RESULTS:)';
  console.log('=====================\n)';

  let passCount = 0;
  let failCount = 0;

  results.forEach((result, index' => {
    const status = result.status === 'pass' ? '✅'PASS' : '❌'FAIL';
    console.log('' + result.check + : ${status})';

    if (result.details' {
      console.log('  ' + result.details + )'
}
    console.log();

    if(result.status === 'pass) pa'sCount++';
    else failCount'+
});

  console.log('📈 SUMMARY:)';
  console.log('✅ Passed: ' + passCount + ')';
  console.log('❌ Failed: ' + failCount + ')';
  console.log('📊 Success Rate: ' + Math.round'(passCount / results.length) * 100) + '%\n')';

  if(failCount === 0' {
  console.log('🎉 ITERATION 1 READY!)';
    console.log('✅ All components validated successfully)';
    console.log('🚀 Run: npm run iteration1)';
    console.log('💡 This will execute the full SAFe-SPARC workflow with real LLM calls\n)'

} else {
  console.log('⚠️  ITERATION 1 NOT READY)';
    console.log('❌ Some components failed validation)';
    console.log('🔧 Fix the failed checks above before running iteration1\n)';
    process.exit(1)

}
}

// Self-executing when run directly(ES module compatible'
if (import.meta.url === file://' + process.argv[1] + ) {
  validateIteration1().catch((error) => {
  console.error(`💥 Validation failed:','
  error);
    process.exit(1)

})
}

export { validateIteration1 };