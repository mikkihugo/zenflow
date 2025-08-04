#!/usr/bin/env node

/**
 * Comprehensive test script for validating neural pattern fixes
 * Tests: Pattern parsing, memory optimization, and persistence indicators
 */

import { exec } from 'node:child_process';
import util from 'node:util';

const execPromise = util.promisify(exec);

import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Test result tracking
const testResults = {
  passed: [],
  failed: [],
  warnings: [],
};

// Helper function to run command and capture output
async function runCommand(command) {
  try {
    const { stdout, stderr } = await execPromise(command, {
      cwd: path.join(__dirname, '..'),
    });
    return { success: true, stdout, stderr };
  } catch (error) {
    return {
      success: false,
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      error: error.message,
    };
  }
}

// Helper function to check if output contains expected text
function assertContains(output, expected, testName) {
  if (output.includes(expected)) {
    testResults.passed.push(`${testName}: Found "${expected}"`);
    return true;
  }
  testResults.failed.push(`${testName}: Missing "${expected}"`);
  return false;
}

// Helper function to check pattern in output
function assertPattern(output, pattern, testName) {
  if (pattern.test(output)) {
    testResults.passed.push(`${testName}: Pattern matched`);
    return true;
  }
  testResults.failed.push(`${testName}: Pattern not matched`);
  return false;
}

// Test 1: Pattern Parsing Fix Validation
async function testPatternParsing() {
  const result1 = await runCommand('npx ruv-swarm neural patterns --pattern all');

  if (result1.success) {
    assertContains(result1.stdout, 'All Patterns', 'All patterns header');
    assertContains(result1.stdout, 'Cognitive Patterns:', 'Cognitive patterns section');
    assertContains(result1.stdout, 'Neural Model Patterns:', 'Neural model patterns section');

    // Check all 6 cognitive patterns
    const cognitivePatterns = [
      'Convergent',
      'Divergent',
      'Lateral',
      'Systems',
      'Critical',
      'Abstract',
    ];
    for (const pattern of cognitivePatterns) {
      assertContains(result1.stdout, `${pattern} Pattern:`, `${pattern} pattern presence`);
    }

    // Check neural models
    const neuralModels = ['Attention', 'Lstm', 'Transformer'];
    for (const model of neuralModels) {
      assertContains(result1.stdout, `${model} Model:`, `${model} model presence`);
    }
  } else {
    testResults.failed.push('All patterns command failed to execute');
  }
  const result2 = await runCommand('npx ruv-swarm neural patterns --pattern convergent');

  if (result2.success) {
    assertContains(result2.stdout, 'Convergent Pattern', 'Convergent pattern header');
    assertContains(result2.stdout, 'Cognitive Patterns:', 'Cognitive patterns category');
    assertContains(result2.stdout, 'Focused problem-solving', 'Convergent pattern content');

    // Should NOT contain other patterns
    if (!result2.stdout.includes('Divergent Pattern:')) {
      testResults.passed.push('Convergent: Correctly excludes other patterns');
    } else {
      testResults.failed.push('Convergent: Incorrectly includes other patterns');
    }
  } else {
    testResults.failed.push('Convergent pattern command failed');
  }
  const result3 = await runCommand('npx ruv-swarm neural patterns --pattern invalid');

  if (result3.success) {
    assertContains(result3.stdout, 'Unknown pattern type:', 'Invalid pattern error message');
    assertContains(result3.stdout, 'Available patterns:', 'Available patterns list');
    assertContains(
      result3.stdout,
      'Cognitive: convergent, divergent, lateral, systems, critical, abstract',
      'Cognitive patterns list',
    );
    assertContains(result3.stdout, 'Models: attention, lstm, transformer', 'Model patterns list');
  } else {
    testResults.failed.push('Invalid pattern handling failed');
  }
}

// Test 2: Memory Optimization Validation
async function testMemoryOptimization() {
  const patterns = ['convergent', 'divergent', 'lateral', 'systems', 'critical', 'abstract'];
  const memoryValues = [];

  for (const pattern of patterns) {
    const result = await runCommand(`npx ruv-swarm neural patterns --pattern ${pattern}`);

    if (result.success) {
      // Extract memory usage
      const memoryMatch = result.stdout.match(/Memory Usage:\s*(\d+)\s*MB/);
      if (memoryMatch) {
        const memoryUsage = parseInt(memoryMatch[1], 10);
        memoryValues.push({ pattern, memory: memoryUsage });

        // Check if memory is in optimized range (250-300 MB)
        if (memoryUsage >= 250 && memoryUsage <= 300) {
          testResults.passed.push(`${pattern}: Memory optimized (${memoryUsage} MB)`);
        } else if (memoryUsage >= 200 && memoryUsage <= 350) {
          testResults.warnings.push(
            `${pattern}: Memory slightly outside target (${memoryUsage} MB)`,
          );
        } else {
          testResults.failed.push(`${pattern}: Memory not optimized (${memoryUsage} MB)`);
        }
      } else {
        testResults.failed.push(`${pattern}: Could not extract memory usage`);
      }
    } else {
      testResults.failed.push(`${pattern}: Pattern command failed`);
    }
  }

  // Calculate memory variance
  if (memoryValues.length > 0) {
    const memoryNumbers = memoryValues.map((v) => v.memory);
    const minMemory = Math.min(...memoryNumbers);
    const maxMemory = Math.max(...memoryNumbers);
    const variance = maxMemory - minMemory;

    if (variance < 100) {
      testResults.passed.push(`Memory variance under 100 MB (${variance} MB)`);
    } else {
      testResults.failed.push(`Memory variance exceeds 100 MB (${variance} MB)`);
    }
  }
}

// Test 3: Persistence Indicators Validation
async function testPersistenceIndicators() {
  await runCommand('npx ruv-swarm neural train --model attention --iterations 5');
  const result = await runCommand('npx ruv-swarm neural status');

  if (result.success) {
    // Check for training session count
    assertPattern(
      result.stdout,
      /Training Sessions:\s*\d+\s*sessions/,
      'Training sessions display',
    );

    // Check for saved models count with 📁 indicator
    assertPattern(result.stdout, /📁\s*\d+\s*saved models/, 'Saved models indicator');

    // Check for model status indicators
    assertContains(result.stdout, '✅ Trained', 'Trained indicator');

    // Check for persistence indicators in model lines
    const persistenceIndicators = ['✅', '📁', '🔄'];
    let foundIndicators = 0;
    for (const indicator of persistenceIndicators) {
      if (result.stdout.includes(indicator)) {
        foundIndicators++;
      }
    }

    if (foundIndicators >= 2) {
      testResults.passed.push(`Found ${foundIndicators}/3 persistence indicators`);
    } else {
      testResults.failed.push(`Only found ${foundIndicators}/3 persistence indicators`);
    }

    // Check for session continuity section
    if (result.stdout.includes('Session Continuity:')) {
      testResults.passed.push('Session continuity section present');
      assertContains(result.stdout, 'Models loaded from previous session:', 'Session loading info');
      assertContains(result.stdout, 'Persistent memory:', 'Persistent memory info');
    }

    // Check for performance metrics
    assertContains(result.stdout, 'Performance Metrics:', 'Performance metrics section');
    assertContains(result.stdout, 'Total Training Time:', 'Training time display');
    assertContains(result.stdout, 'Average Accuracy:', 'Average accuracy display');
    assertContains(result.stdout, 'Best Model:', 'Best model display');
  } else {
    testResults.failed.push('Neural status command failed');
  }
}

// Additional test: Pattern switching memory efficiency
async function testPatternSwitching() {
  const patterns = ['convergent', 'divergent', 'lateral'];
  const memorySamples = [];

  // Switch between patterns multiple times
  for (let i = 0; i < 3; i++) {
    for (const pattern of patterns) {
      const result = await runCommand(`npx ruv-swarm neural patterns --pattern ${pattern}`);
      if (result.success) {
        const memoryMatch = result.stdout.match(/Memory Usage:\s*(\d+)\s*MB/);
        if (memoryMatch) {
          memorySamples.push({
            iteration: i,
            pattern,
            memory: parseInt(memoryMatch[1], 10),
          });
        }
      }
    }
  }

  // Analyze memory stability
  if (memorySamples.length > 0) {
    const patternMemoryAvg = {};

    for (const pattern of patterns) {
      const samples = memorySamples.filter((s) => s.pattern === pattern);
      if (samples.length > 0) {
        const avg = samples.reduce((sum, s) => sum + s.memory, 0) / samples.length;
        const variance =
          Math.max(...samples.map((s) => s.memory)) - Math.min(...samples.map((s) => s.memory));
        patternMemoryAvg[pattern] = { avg, variance };

        if (variance < 50) {
          testResults.passed.push(
            `${pattern}: Stable memory across switches (variance: ${variance} MB)`,
          );
        } else {
          testResults.warnings.push(`${pattern}: Higher memory variance (${variance} MB)`);
        }
      }
    }
  }
}

// Main test runner
async function runAllTests() {
  try {
    // Run all tests
    await testPatternParsing();
    await testMemoryOptimization();
    await testPersistenceIndicators();
    await testPatternSwitching();
    testResults.passed.forEach((_test) => {});

    if (testResults.warnings.length > 0) {
      testResults.warnings.forEach((_test) => {});
    }

    if (testResults.failed.length > 0) {
      testResults.failed.forEach((_test) => {});
    }

    // Overall status
    const totalTests = testResults.passed.length + testResults.failed.length;
    const _passRate =
      totalTests > 0 ? ((testResults.passed.length / totalTests) * 100).toFixed(1) : 0;

    if (testResults.failed.length === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n${colors.red}${colors.bold}Fatal Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the tests
runAllTests();
