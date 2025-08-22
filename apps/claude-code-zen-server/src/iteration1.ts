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
 * npx tsx src/iteration1.ts
 * ```
 *
 * **WHAT IT DOES:**
 * 1. Creates a test epic (Customer Analytics Platform)
 * 2. Runs it through all 5 SAFe roles with LLMProvider decisions
 * 3. If approved, executes SPARC methodology with Claude SDK
 * 4. Generates actual code files using Claude Code tools
 * 5. Shows results and file paths
 *
 * **SUCCESS CRITERIA:**
 * - All 5 SAFe roles make decisions using LLMProvider
 * - SPARC generates actual files using Claude SDK
 * - End-to-end flow completes without errors
 */

import('/workflows/safe-sparc-standalone');

async function main() {
  console.log('🎯 ITERATION 1: SAFe-SPARC Workflow Test');
  console.log('=====================================\n');

  console.log('📋 Goal: Prove end-to-end SAFe→SPARC→Code Generation works');
  console.log(
    '🔧 Tech: LLMProvider for decisions, Claude SDK for code generation'
  );
  console.log('✨ Expected: Real generated files from approved epic\n');

  try {
    // Run the standalone workflow test
    await testSafeSparcWorkflow();

    console.log('\n🎉 ITERATION 1 SUCCESS!');
    console.log('✅ SAFe role decisions working with LLMProvider');
    console.log('✅ SPARC methodology executing with Claude SDK');
    console.log('✅ End-to-end workflow functional');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ITERATION 1 FAILED:');
    console.error(error);

    console.log('\n🔧 Debug Steps:');
    console.log('1. Check if @claude-zen/foundation is available');
    console.log('2. Verify LLMProvider can make simple text calls');
    console.log('3. Confirm Claude SDK can execute with tools');
    console.log('4. Review error logs above for specific failure point');

    process.exit(1);
  }
}

// Self-executing when run directly (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main as runIteration1 };
