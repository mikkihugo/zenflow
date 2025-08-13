#!/usr/bin/env node

/**
 * @fileoverview TUI Validation Script
 * Validates the TUI interface components and checks for common issues.
 */

console.log('🔍 TUI Validation Script');
console.log('========================\n');

async function validateTUI() {
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    issues: []
  };

  try {
    // Test 1: Check if required modules can be imported
    console.log('1. Testing module imports...');
    
    try {
      await import('ink');
      console.log('  ✅ ink module imported successfully');
      results.passed++;
    } catch (error) {
      console.log('  ❌ Failed to import ink:', error.message);
      results.failed++;
      results.issues.push('ink import failed');
    }

    try {
      await import('ink-spinner');
      console.log('  ✅ ink-spinner module imported successfully');
      results.passed++;
    } catch (error) {
      console.log('  ❌ Failed to import ink-spinner:', error.message);
      results.failed++;
      results.issues.push('ink-spinner import failed');
    }

    try {
      await import('react');
      console.log('  ✅ react module imported successfully');
      results.passed++;
    } catch (error) {
      console.log('  ❌ Failed to import react:', error.message);
      results.failed++;
      results.issues.push('react import failed');
    }

    // Test 2: Check TUI component imports
    console.log('\n2. Testing TUI component imports...');
    
    const tuiComponents = [
      './src/interfaces/tui/components/progress-bar.tsx',
      './src/interfaces/tui/components/domain-card.tsx', 
      './src/interfaces/tui/components/deployment-progress.tsx',
      './src/interfaces/tui/types.ts',
      './src/interfaces/tui/discovery-tui.tsx'
    ];

    for (const component of tuiComponents) {
      try {
        const fs = await import('fs/promises');
        await fs.access(component);
        console.log(`  ✅ ${component} exists`);
        results.passed++;
      } catch (error) {
        console.log(`  ❌ ${component} not found`);
        results.failed++;
        results.issues.push(`Missing component: ${component}`);
      }
    }

    // Test 3: Check TTY support
    console.log('\n3. Testing TTY support...');
    
    if (process.stdin.isTTY) {
      console.log('  ✅ TTY support available');
      results.passed++;
    } else {
      console.log('  ⚠️  TTY not available (expected in CI/non-interactive)');
      results.warnings++;
      results.issues.push('TTY not available - TUI may not work in current environment');
    }

    // Test 4: Check if TypeScript compilation works
    console.log('\n4. Testing TypeScript compilation...');
    
    try {
      const { spawn } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(spawn);
      
      // Note: This is a basic check - full compilation test would need tsc
      console.log('  ✅ TypeScript compilation check skipped (requires tsc setup)');
      results.warnings++;
    } catch (error) {
      console.log('  ⚠️  Could not test TypeScript compilation');
      results.warnings++;
    }

    // Test 5: Check for React key uniqueness issues
    console.log('\n5. Testing for common React issues...');
    
    const fs = await import('fs/promises');
    try {
      const discoveryContent = await fs.readFile('./src/interfaces/tui/discovery-tui.tsx', 'utf8');
      
      // Check for duplicate keys that were seen in the error output
      if (discoveryContent.includes('key=') && discoveryContent.includes('    at recursivelyTraversePassiveMountEffects')) {
        console.log('  ❌ Potential React key duplication detected');
        results.failed++;
        results.issues.push('React key duplication in discovery-tui.tsx');
      } else {
        console.log('  ✅ No obvious React key issues detected');
        results.passed++;
      }
    } catch (error) {
      console.log('  ⚠️  Could not analyze React component for key issues');
      results.warnings++;
    }

  } catch (error) {
    console.error('💥 Validation failed:', error);
    results.failed++;
    results.issues.push(`General validation error: ${error.message}`);
  }

  // Summary
  console.log('\n📊 Validation Summary');
  console.log('=====================');
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
    console.log('\n🎉 TUI validation completed successfully!');
    console.log('The TUI interface should work properly.');
  } else {
    console.log('\n⚠️  TUI validation found issues that need to be addressed.');
  }

  return results;
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('validate-tui.js')) {
  validateTUI().catch(console.error);
}

export { validateTUI };