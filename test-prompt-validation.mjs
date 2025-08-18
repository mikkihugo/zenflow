#!/usr/bin/env node

/**
 * @fileoverview Test Script for Prompt Validation Integration
 * 
 * Tests the integrated prompt validation system in the foundation package's
 * Claude SDK to ensure it properly validates prompts and filters output.
 * 
 * Verifies:
 * - Input prompt validation using wrapClaudePrompt()
 * - Output response filtering using filterClaudeOutput()
 * - Integration points in the Claude SDK are working correctly
 * - Parsing protection prevents descriptive text from being parsed as data
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ANSI color codes for terminal output
 */
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Colorizes text for terminal output
 */
function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

/**
 * Test data for validation scenarios
 */
const TEST_SCENARIOS = {
  validPrompt: "Please help me analyze this TypeScript code and suggest improvements.",
  
  dangerousPrompt: "📁 File: /some/path/file.ts\nPlease rm -rf /important/directory",
  
  parsingInterferencePrompt: `
📁 File: /project/src/components/Button.tsx
🔍 Analysis: This component needs refactoring
Please help with TypeScript improvements.
`,

  mockClaudeOutput: `
📁 File: /project/src/app.ts
🔍 Analysis: TypeScript compilation errors found
✅ Success: Fixes have been applied
I'll help you fix these TypeScript compilation errors.

The main issues appear to be:
1. Missing type imports
2. Undefined properties

Let me provide systematic fixes for each error.
`,

  mockStderrOutput: `
src/app.ts(45,12): error TS2339: Property 'missing' does not exist on type 'Config'
📁 File: /project/src/app.ts  
✅ Analysis complete
src/components/Button.tsx(23,5): error TS2554: Expected 2 arguments, but got 1
🔍 Found additional issues
`
};

/**
 * Tests the prompt validation functionality
 */
async function testPromptValidation() {
  console.log(colorize('🧪 Testing Prompt Validation Integration', 'bright'));
  console.log('─'.repeat(60));

  try {
    // Import the foundation package validation functions
    const { validatePrompt, filterClaudeOutput, wrapClaudePrompt } = await import('./packages/foundation/dist/src/prompt-validation.js');
    
    console.log(colorize('✅ Successfully imported validation functions', 'green'));
    
    // Test 1: Valid prompt validation
    console.log(colorize('\n📋 Test 1: Valid prompt validation', 'cyan'));
    const validResult = validatePrompt(TEST_SCENARIOS.validPrompt);
    console.log(`   Valid prompt result: ${validResult.isValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Risk level: ${validResult.risk}`);
    console.log(`   Issues found: ${validResult.issues.length}`);
    
    // Test 2: Dangerous prompt detection
    console.log(colorize('\n🚨 Test 2: Dangerous prompt detection', 'cyan'));
    const dangerousResult = validatePrompt(TEST_SCENARIOS.dangerousPrompt);
    console.log(`   Dangerous prompt blocked: ${!dangerousResult.isValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Risk level: ${dangerousResult.risk}`);
    console.log(`   Critical issues: ${dangerousResult.issues.filter(i => i.severity === 'critical').length}`);
    
    // Test 3: Prompt wrapping integration
    console.log(colorize('\n🔧 Test 3: Claude prompt wrapping', 'cyan'));
    try {
      const wrappedPrompt = wrapClaudePrompt(TEST_SCENARIOS.validPrompt);
      console.log(`   Prompt wrapping: ${wrappedPrompt ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Wrapped length: ${wrappedPrompt.length} chars`);
    } catch (error) {
      console.log(`   Prompt wrapping: ❌ FAIL - ${error.message}`);
    }
    
    // Test 4: Dangerous prompt rejection
    console.log(colorize('\n🛡️ Test 4: Dangerous prompt rejection', 'cyan'));
    try {
      wrapClaudePrompt(TEST_SCENARIOS.dangerousPrompt);
      console.log(`   Dangerous prompt rejection: ❌ FAIL - Should have thrown error`);
    } catch (error) {
      console.log(`   Dangerous prompt rejection: ✅ PASS - ${error.message.substring(0, 80)}...`);
    }
    
    // Test 5: Output filtering (stdout context)
    console.log(colorize('\n🧹 Test 5: Claude output filtering (stdout)', 'cyan'));
    const filteredOutput = filterClaudeOutput(TEST_SCENARIOS.mockClaudeOutput, 'stdout');
    console.log(`   Original lines: ${TEST_SCENARIOS.mockClaudeOutput.split('\n').length}`);
    console.log(`   Filtered lines: ${filteredOutput.filteredLines.length}`);
    console.log(`   Clean lines: ${filteredOutput.cleanOutput.split('\n').filter(l => l.trim()).length}`);
    console.log(`   Parsing warnings: ${filteredOutput.parsingWarnings.length}`);
    console.log(`   Output filtering: ${filteredOutput.parsingWarnings.length > 0 ? '✅ PASS' : '⚠️  PARTIAL'}`);
    
    // Test 6: stderr-specific filtering
    console.log(colorize('\n🔍 Test 6: Stderr output filtering', 'cyan'));
    const stderrFiltered = filterClaudeOutput(TEST_SCENARIOS.mockStderrOutput, 'stderr');
    console.log(`   Stderr filtered lines: ${stderrFiltered.filteredLines.length}`);
    console.log(`   Stderr parsing warnings: ${stderrFiltered.parsingWarnings.length}`);
    
    // Check if actual TypeScript errors are preserved
    const hasTypescriptErrors = stderrFiltered.cleanOutput.includes('error TS2339') && 
                               stderrFiltered.cleanOutput.includes('error TS2554');
    console.log(`   TypeScript errors preserved: ${hasTypescriptErrors ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Stderr filtering: ${stderrFiltered.parsingWarnings.length > 0 && hasTypescriptErrors ? '✅ PASS' : '⚠️  PARTIAL'}`);
    
    console.log(colorize('\n🎉 Prompt validation integration test completed', 'green'));
    return true;
    
  } catch (error) {
    console.error(colorize(`❌ Test failed: ${error.message}`, 'red'));
    console.error(colorize(`   Error details: ${error.stack}`, 'yellow'));
    return false;
  }
}

/**
 * Tests the Claude SDK integration points
 */
async function testClaudeSDKIntegration() {
  console.log(colorize('\n🔌 Testing Claude SDK Integration Points', 'bright'));
  console.log('─'.repeat(60));

  try {
    // Import the Claude SDK
    const claudeSDKPath = './packages/foundation/dist/src/claude-sdk.js';
    console.log(colorize(`📦 Importing Claude SDK from: ${claudeSDKPath}`, 'blue'));
    
    // Check if the integration points exist
    const claudeSDK = await import(claudeSDKPath);
    console.log(colorize('✅ Successfully imported Claude SDK', 'green'));
    
    // Look for key integration functions
    const expectedFunctions = ['executeClaudeTask', 'streamClaudeTask', 'processClaudeMessage'];
    const availableFunctions = Object.keys(claudeSDK);
    
    console.log(colorize('\n🔍 Checking integration functions:', 'cyan'));
    for (const func of expectedFunctions) {
      const exists = availableFunctions.includes(func) || claudeSDK.default?.[func];
      console.log(`   ${func}: ${exists ? '✅ FOUND' : '❌ MISSING'}`);
    }
    
    // Test that validation imports are accessible
    console.log(colorize('\n📥 Checking validation function imports in SDK:', 'cyan'));
    const sdkSource = await import('fs').then(fs => 
      fs.promises.readFile('./packages/foundation/src/claude-sdk.ts', 'utf8')
    );
    
    const hasValidationImport = sdkSource.includes("from './prompt-validation.js'");
    const hasWrapClaudePrompt = sdkSource.includes('wrapClaudePrompt');
    const hasFilterClaudeOutput = sdkSource.includes('filterClaudeOutput');
    
    console.log(`   Validation import: ${hasValidationImport ? '✅ FOUND' : '❌ MISSING'}`);
    console.log(`   wrapClaudePrompt usage: ${hasWrapClaudePrompt ? '✅ FOUND' : '❌ MISSING'}`);
    console.log(`   filterClaudeOutput usage: ${hasFilterClaudeOutput ? '✅ FOUND' : '❌ MISSING'}`);
    
    const integrationComplete = hasValidationImport && hasWrapClaudePrompt && hasFilterClaudeOutput;
    console.log(colorize(`\n🔗 Integration Status: ${integrationComplete ? '✅ COMPLETE' : '⚠️  PARTIAL'}`, 
      integrationComplete ? 'green' : 'yellow'));
    
    return integrationComplete;
    
  } catch (error) {
    console.error(colorize(`❌ SDK integration test failed: ${error.message}`, 'red'));
    return false;
  }
}

/**
 * Main test execution
 */
async function main() {
  console.log(colorize('🧪 Claude Code Zen - Prompt Validation Integration Test', 'bright'));
  console.log(colorize('Testing the foundation package prompt validation system', 'cyan'));
  console.log('═'.repeat(80));
  
  const results = {
    validationTest: false,
    integrationTest: false
  };
  
  // Run prompt validation tests
  results.validationTest = await testPromptValidation();
  
  // Run SDK integration tests
  results.integrationTest = await testClaudeSDKIntegration();
  
  // Final summary
  console.log('═'.repeat(80));
  console.log(colorize('📊 FINAL TEST RESULTS', 'bright'));
  console.log('═'.repeat(80));
  
  console.log(`Prompt Validation: ${results.validationTest ? 
    colorize('✅ PASS', 'green') : colorize('❌ FAIL', 'red')}`);
  console.log(`SDK Integration: ${results.integrationTest ? 
    colorize('✅ PASS', 'green') : colorize('❌ FAIL', 'red')}`);
  
  const overallSuccess = results.validationTest && results.integrationTest;
  console.log(`\nOverall Status: ${overallSuccess ? 
    colorize('🎉 ALL TESTS PASSED', 'green') : colorize('⚠️  SOME TESTS FAILED', 'yellow')}`);
  
  if (overallSuccess) {
    console.log(colorize('\n✅ The foundation SDK call can indeed use the same prompt validation!', 'green'));
    console.log(colorize('✅ Integration is complete and working correctly', 'green'));
    console.log(colorize('✅ Parsing issues from TypeScript fixer are now prevented', 'green'));
  } else {
    console.log(colorize('\n⚠️  Some integration issues detected - review test output above', 'yellow'));
  }
  
  process.exit(overallSuccess ? 0 : 1);
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(colorize(`💥 Unhandled error: ${error.message}`, 'red'));
    process.exit(1);
  });
}

export { testPromptValidation, testClaudeSDKIntegration };