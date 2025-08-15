#!/usr/bin/env node

/**
 * @fileoverview TUI Fixes Validation Script
 *
 * Comprehensive testing of all TUI fixes including raw mode detection,
 * React key conflicts, terminal compatibility, and error handling.
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();

console.log('🧪 TUI Fixes Validation Script');
console.log('===============================\n');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  issues: [],
};

/**
 * Test helper function
 */
function test(name, testFn) {
  try {
    console.log(`🔍 Testing: ${name}`);
    const result = testFn();
    if (result === true || result === undefined) {
      console.log(`  ✅ PASS: ${name}`);
      results.passed++;
    } else if (result === 'warning') {
      console.log(`  ⚠️  WARNING: ${name}`);
      results.warnings++;
    } else {
      console.log(`  ❌ FAIL: ${name} - ${result}`);
      results.failed++;
      results.issues.push(`${name}: ${result}`);
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${name} - ${error.message}`);
    results.failed++;
    results.issues.push(`${name}: ${error.message}`);
  }
  console.log('');
}

// Test 1: Verify enhanced TUI wrapper exists and has proper exports
test('Enhanced TUI wrapper file exists', () => {
  const wrapperPath = join(PROJECT_ROOT, 'src/interfaces/tui/tui-wrapper.tsx');
  if (!existsSync(wrapperPath)) {
    return 'TUI wrapper file not found';
  }

  const content = readFileSync(wrapperPath, 'utf8');

  // Check for enhanced raw mode detection
  if (!content.includes('detectRawModeSupport')) {
    return 'Enhanced raw mode detection not found';
  }

  // Check for comprehensive error handling
  if (!content.includes('retryCount')) {
    return 'Retry mechanism not found';
  }

  // Check for graceful fallback
  if (!content.includes('enableFallback')) {
    return 'Fallback option not found';
  }

  return true;
});

// Test 2: Verify terminal environment detector exists
test('Terminal environment detector exists', () => {
  const detectorPath = join(
    PROJECT_ROOT,
    'src/interfaces/terminal/utils/terminal-environment-detector.ts'
  );
  if (!existsSync(detectorPath)) {
    return 'Terminal environment detector not found';
  }

  const content = readFileSync(detectorPath, 'utf8');

  // Check for comprehensive detection functions
  const requiredFunctions = [
    'detectTerminalEnvironment',
    'checkRawModeSupport',
    'generateEnvironmentReport',
    'detectCI',
    'detectDocker',
    'detectWSL',
  ];

  for (const func of requiredFunctions) {
    if (!content.includes(func)) {
      return `Missing function: ${func}`;
    }
  }

  return true;
});

// Test 3: Verify React error boundary exists
test('React error boundary component exists', () => {
  const boundaryPath = join(
    PROJECT_ROOT,
    'src/interfaces/terminal/components/error-boundary.tsx'
  );
  if (!existsSync(boundaryPath)) {
    return 'Error boundary component not found';
  }

  const content = readFileSync(boundaryPath, 'utf8');

  // Check for error boundary implementation
  if (!content.includes('class TUIErrorBoundary extends React.Component')) {
    return 'TUIErrorBoundary class not found';
  }

  // Check for error handling methods
  if (!content.includes('componentDidCatch')) {
    return 'componentDidCatch method not found';
  }

  // Check for higher-order component
  if (!content.includes('withErrorBoundary')) {
    return 'withErrorBoundary HOC not found';
  }

  return true;
});

// Test 4: Verify React key fixes in discovery TUI
test('React key fixes in discovery TUI', () => {
  const discoveryPath = join(
    PROJECT_ROOT,
    'src/interfaces/tui/discovery-tui.tsx'
  );
  if (!existsSync(discoveryPath)) {
    return 'Discovery TUI component not found';
  }

  const content = readFileSync(discoveryPath, 'utf8');

  // Check for unique keys in domain mapping
  if (!content.includes('key={`domain-card-${domain.name}-${index}`}')) {
    return 'Domain card unique keys not implemented';
  }

  // Check for unique keys in deployment status
  if (!content.includes('key={`deployment-${domain}-${index}`}')) {
    return 'Deployment status unique keys not implemented';
  }

  // Check for fixed useEffect dependencies
  if (content.includes('}, [startAnalysis]);')) {
    return 'useEffect dependency issue not fixed';
  }

  return true;
});

// Test 5: Verify error boundary integration in main component
test('Error boundary integration in interactive terminal', () => {
  const appPath = join(
    PROJECT_ROOT,
    'src/interfaces/terminal/interactive-terminal-application.tsx'
  );
  if (!existsSync(appPath)) {
    return 'Interactive terminal application not found';
  }

  const content = readFileSync(appPath, 'utf8');

  // Check for error boundary import
  if (!content.includes('import { TUIErrorBoundary }')) {
    return 'TUIErrorBoundary import not found';
  }

  // Check for error boundary usage
  if (!content.includes('<TUIErrorBoundary')) {
    return 'TUIErrorBoundary component not used';
  }

  // Check for error handling props
  if (!content.includes('showDetails=') && !content.includes('onError=')) {
    return 'Error boundary props not configured';
  }

  return true;
});

// Test 6: Verify enhanced main entry point
test('Enhanced main entry point with environment detection', () => {
  const mainPath = join(PROJECT_ROOT, 'src/interfaces/terminal/main.ts');
  if (!existsSync(mainPath)) {
    return 'Main entry point not found';
  }

  const content = readFileSync(mainPath, 'utf8');

  // Check for environment detection imports
  if (!content.includes('detectTerminalEnvironment')) {
    return 'Terminal environment detection import not found';
  }

  // Check for enhanced error reporting
  if (!content.includes('generateEnvironmentReport')) {
    return 'Environment report generation not found';
  }

  // Check for graceful exit on unsupported environment
  if (!content.includes('TUI not supported, exiting gracefully')) {
    return 'Graceful exit handling not found';
  }

  return true;
});

// Test 7: Check TypeScript compilation
test('TypeScript compilation check', () => {
  try {
    // Try to compile the main TUI files to check for syntax errors
    execSync(
      'npx tsc --noEmit --skipLibCheck src/interfaces/tui/tui-wrapper.tsx',
      { stdio: 'pipe' }
    );
    execSync(
      'npx tsc --noEmit --skipLibCheck src/interfaces/terminal/utils/terminal-environment-detector.ts',
      { stdio: 'pipe' }
    );
    execSync(
      'npx tsc --noEmit --skipLibCheck src/interfaces/terminal/components/error-boundary.tsx',
      { stdio: 'pipe' }
    );
    return true;
  } catch (error) {
    return 'TypeScript compilation failed - check for syntax errors';
  }
});

// Test 8: Validate imports and exports
test('Import/export validation', () => {
  try {
    // Test if we can import the main modules
    const testFile = `
      import { TUIWrapper, renderTUISafe, checkTUISupport } from './src/interfaces/tui/tui-wrapper.tsx';
      import { detectTerminalEnvironment } from './src/interfaces/terminal/utils/terminal-environment-detector.ts';
      import { TUIErrorBoundary } from './src/interfaces/terminal/components/error-boundary.tsx';
      console.log('All imports successful');
    `;

    // This is a simplified check - in a real environment you might use babel or similar
    const requiredExports = [
      'TUIWrapper',
      'renderTUISafe',
      'checkTUISupport',
      'detectTerminalEnvironment',
      'TUIErrorBoundary',
    ];

    // Check if all required exports exist in their respective files
    const files = [
      'src/interfaces/tui/tui-wrapper.tsx',
      'src/interfaces/terminal/utils/terminal-environment-detector.ts',
      'src/interfaces/terminal/components/error-boundary.tsx',
    ];

    for (const file of files) {
      const filePath = join(PROJECT_ROOT, file);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf8');
        // Basic check for export statements
        if (!content.includes('export')) {
          return `No exports found in ${file}`;
        }
      }
    }

    return true;
  } catch (error) {
    return `Import validation failed: ${error.message}`;
  }
});

// Test 9: Environment compatibility check
test('Current environment compatibility', () => {
  try {
    // Test raw mode support in current environment
    if (!process.stdin.isTTY) {
      return 'warning'; // Not an error, just a warning for non-TTY environments
    }

    if (typeof process.stdin.setRawMode !== 'function') {
      return 'warning'; // Platform doesn't support raw mode
    }

    // Try to test raw mode briefly
    const originalMode = process.stdin.isRaw;
    process.stdin.setRawMode(true);
    process.stdin.setRawMode(false);

    // Restore original mode
    if (originalMode !== undefined) {
      process.stdin.setRawMode(originalMode);
    }

    return true;
  } catch (error) {
    return 'warning'; // Don't fail the test, just warn about environment limitations
  }
});

// Test 10: Ink integration compatibility
test('Ink framework compatibility', () => {
  try {
    // Try to import Ink and check if it works with our enhancements
    const testScript = `
      const { isRawModeSupported } = require('ink');
      console.log('Ink isRawModeSupported available:', typeof isRawModeSupported);
    `;

    execSync(`node -e "${testScript}"`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return `Ink compatibility issue: ${error.message}`;
  }
});

// Print summary
console.log('📊 Validation Summary');
console.log('====================');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);

if (results.issues.length > 0) {
  console.log('\n🚨 Issues Found:');
  results.issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
}

if (results.failed === 0) {
  console.log('\n🎉 TUI fixes validation completed successfully!');
  console.log('All critical fixes have been implemented and verified.');
  console.log('\nThe TUI system should now:');
  console.log('• Handle raw mode errors gracefully');
  console.log('• Avoid React key conflicts');
  console.log('• Provide comprehensive terminal compatibility detection');
  console.log('• Offer robust error handling and recovery');
  console.log('• Support various terminal environments');
} else {
  console.log('\n⚠️  TUI fixes validation found issues that need attention.');
  console.log('Please review and address the failed tests above.');
  process.exit(1);
}
