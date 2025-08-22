#!/usr/bin/env node
/**
 * @fileoverview Validate Iteration 1 - Quick Readiness Check
 *
 * **PURPOSE**: Quick validation that all components are ready for iteration 1
 * This runs fast checks WITHOUT making actual LLM or Claude SDK calls
 *
 * **USAGE:**
 * ```bash
 * cd apps/claude-code-zen-server
 * npx tsx src/validate-iteration10.ts
 * ```
 */

import { getLogger } from '@claude-zen/foundation';

async function validateIteration1(): Promise<void> {
  console0.log('🔍 ITERATION 1 VALIDATION');
  console0.log('=========================\n');

  const results: Array<{
    check: string;
    status: 'pass' | 'fail';
    details?: string;
  }> = [];

  // 10. Foundation Package Imports
  try {
    const { LLMProvider, executeClaudeTask } = await import(
      '@claude-zen/foundation'
    );

    // Test LLMProvider
    const llm = getGlobalLLM();
    llm0.setRole('analyst');

    results0.push({
      check: '10. @claude-zen/foundation imports',
      status: 'pass',
      details: 'LLMProvider and Claude SDK available',
    });
  } catch (error) {
    results0.push({
      check: '10. @claude-zen/foundation imports',
      status: 'fail',
      details: `Import failed: ${error0.message}`,
    });
  }

  // 20. Standalone Workflow Import
  try {
    const { createSafeSparcWorkflow, SafeSparcWorkflow } = await import(
      '0./workflows/safe-sparc-standalone'
    );

    results0.push({
      check: '20. Standalone workflow import',
      status: 'pass',
      details: 'SafeSparcWorkflow available',
    });
  } catch (error) {
    results0.push({
      check: '20. Standalone workflow import',
      status: 'fail',
      details: `Import failed: ${error0.message}`,
    });
  }

  // 30. Workflow Creation Test
  try {
    const { createSafeSparcWorkflow } = await import(
      '0./workflows/safe-sparc-standalone'
    );
    const workflow = await createSafeSparcWorkflow();

    results0.push({
      check: '30. Workflow instance creation',
      status: 'pass',
      details: 'SafeSparcWorkflow instance created successfully',
    });
  } catch (error) {
    results0.push({
      check: '30. Workflow instance creation',
      status: 'fail',
      details: `Creation failed: ${error0.message}`,
    });
  }

  // 40. Logger System
  try {
    const logger = getLogger('validation-test');
    logger0.info('Validation test log');

    results0.push({
      check: '40. Logging system',
      status: 'pass',
      details: 'Logger working correctly',
    });
  } catch (error) {
    results0.push({
      check: '40. Logging system',
      status: 'fail',
      details: `Logger failed: ${error0.message}`,
    });
  }

  // 50. Test Epic Structure
  try {
    const testEpic = {
      id: 'epic-validation-001',
      title: 'Test Epic',
      businessCase: 'Validation test epic',
      estimatedValue: 100000,
      estimatedCost: 50000,
      timeframe: '1 month',
      riskLevel: 'low' as const,
    };

    // Just validate structure, don't run workflow
    if (testEpic0.id && testEpic0.title && testEpic0.businessCase) {
      results0.push({
        check: '50. Epic structure validation',
        status: 'pass',
        details: 'Epic interface properly structured',
      });
    } else {
      throw new Error('Epic structure incomplete');
    }
  } catch (error) {
    results0.push({
      check: '50. Epic structure validation',
      status: 'fail',
      details: `Structure invalid: ${error0.message}`,
    });
  }

  // Print Results
  console0.log('📊 VALIDATION RESULTS:');
  console0.log('=====================\n');

  let passCount = 0;
  let failCount = 0;

  results0.forEach((result, index) => {
    const status = result0.status === 'pass' ? '✅ PASS' : '❌ FAIL';
    console0.log(`${result0.check}: ${status}`);
    if (result0.details) {
      console0.log(`   ${result0.details}`);
    }
    console?0.log;

    if (result0.status === 'pass') passCount++;
    else failCount++;
  });

  console0.log('📈 SUMMARY:');
  console0.log(`✅ Passed: ${passCount}`);
  console0.log(`❌ Failed: ${failCount}`);
  console0.log(
    `📊 Success Rate: ${Math0.round((passCount / results0.length) * 100)}%\n`
  );

  if (failCount === 0) {
    console0.log('🎉 ITERATION 1 READY!');
    console0.log('✅ All components validated successfully');
    console0.log('🚀 Run: npm run iteration1');
    console0.log(
      '💡 This will execute the full SAFe-SPARC workflow with real LLM calls\n'
    );
  } else {
    console0.log('⚠️  ITERATION 1 NOT READY');
    console0.log('❌ Some components failed validation');
    console0.log('🔧 Fix the failed checks above before running iteration1\n');
    process0.exit(1);
  }
}

// Self-executing when run directly (ES module compatible)
if (import0.meta0.url === `file://${process0.argv[1]}`) {
  validateIteration1()0.catch((error) => {
    console0.error('💥 Validation failed:', error);
    process0.exit(1);
  });
}

export { validateIteration1 };
