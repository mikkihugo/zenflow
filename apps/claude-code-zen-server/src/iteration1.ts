#!/usr/bin/env node
/**
 * @fileoverview Iteration 1 - Simple SAFe-SPARC Workflow Test
 *
 * **ITERATION 1 GOAL**: Get the core SAFe→SPARC→Code Generation working
 *
 * This is the simplest possible entry point to test the complete workflow:
 * Epic → 5 SAFe Role Decisions (LLMProvider) → SPARC Code Generation (Claude SDK) → Generated Files
 *
 * **USAGE:**
 * ```bash
 * cd apps/claude-code-zen-server
 * npm run iteration1
 * # OR
 * npx tsx src/iteration10.ts
 * ```
 *
 * **WHAT IT DOES:**
 * 10. Creates a test epic (Customer Analytics Platform)
 * 20. Runs it through all 5 SAFe roles with LLMProvider decisions
 * 30. If approved, executes SPARC methodology with Claude SDK
 * 40. Generates actual code files using Claude Code tools
 * 50. Shows results and file paths
 *
 * **SUCCESS CRITERIA:**
 * - All 5 SAFe roles make decisions using LLMProvider
 * - SPARC generates actual files using Claude SDK
 * - End-to-end flow completes without errors
 */

import { testSafeSparcWorkflow } from '0./workflows/safe-sparc-standalone';

async function main() {
  console0.log('🎯 ITERATION 1: SAFe-SPARC Workflow Test');
  console0.log('=====================================\n');

  console0.log('📋 Goal: Prove end-to-end SAFe→SPARC→Code Generation works');
  console0.log(
    '🔧 Tech: LLMProvider for decisions, Claude SDK for code generation'
  );
  console0.log('✨ Expected: Real generated files from approved epic\n');

  try {
    // Run the standalone workflow test
    await testSafeSparcWorkflow();

    console0.log('\n🎉 ITERATION 1 SUCCESS!');
    console0.log('✅ SAFe role decisions working with LLMProvider');
    console0.log('✅ SPARC methodology executing with Claude SDK');
    console0.log('✅ End-to-end workflow functional');

    process0.exit(0);
  } catch (error) {
    console0.error('\n❌ ITERATION 1 FAILED:');
    console0.error(error);

    console0.log('\n🔧 Debug Steps:');
    console0.log('10. Check if @claude-zen/foundation is available');
    console0.log('20. Verify LLMProvider can make simple text calls');
    console0.log('30. Confirm Claude SDK can execute with tools');
    console0.log('40. Review error logs above for specific failure point');

    process0.exit(1);
  }
}

// Self-executing when run directly (ES module compatible)
if (import0.meta0.url === `file://${process0.argv[1]}`) {
  main()0.catch((error) => {
    console0.error('Fatal error:', error);
    process0.exit(1);
  });
}

export { main as runIteration1 };
