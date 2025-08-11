#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to convert from Jest to Vitest
const filesToConvert = [
  'src/__tests__/patterns/facade-pattern.test.ts',
  'src/__tests__/patterns/command-pattern.test.ts',
  'src/__tests__/patterns/composite-pattern.test.ts',
  'src/__tests__/core/type-safe-event-system.test.ts',
  'src/__tests__/performance/type-safe-event-performance.test.ts',
  'src/__tests__/coordination/workflows/comprehensive-gate-tests.test.ts',
  'src/__tests__/coordination/workflows/workflow-gates.test.ts',
  'src/__tests__/coordination/workflows/workflow-gate-request.test.ts',
  'src/__tests__/coordination/workflows/gate-pause-resume-tests.test.ts',
  'src/__tests__/coordination/orchestration/product-workflow-gates-integration.test.ts',
  'src/__tests__/performance/gate-performance-validation.test.ts',
  'src/__tests__/claude-zen-tdd-architecture.test.ts',
  'src/__tests__/tdd-london-swarm.test.ts',
  'src/__tests__/coordination/hive-knowledge-bridge.test.ts',
  'src/__tests__/coordination/hive-knowledge-integration.test.ts',
  'src/__tests__/coordination/hive-knowledge-performance.test.ts',
  'tests/setup-hybrid.ts',
  'tests/setup-london.ts',
  'tests/setup-classical.ts',
  'tests/setup.ts',
  'src/__tests__/helpers/mock-builder.ts',
  'src/__tests__/helpers/tdd-london-mock-coordination.ts',
  'src/__tests__/helpers/claude-zen-tdd-london-mocks.ts',
  'src/__tests__/helpers/common-tdd-london-mocks.ts',
  'src/__tests__/examples/tdd-london-conversion-example.ts',
];

const jestToVitestReplacements = [
  // Import replacements
  [
    /import\s+{\s*jest\s*}\s+from\s+['"]@jest\/globals['"];?/g,
    "import { vi } from 'vitest';",
  ],
  [
    /import\s+{\s*([^}]+),?\s*jest\s*}\s+from\s+['"]@jest\/globals['"];?/g,
    "import { $1, vi } from 'vitest';",
  ],
  [
    /import\s+{\s*jest\s*,\s*([^}]+)\s*}\s+from\s+['"]@jest\/globals['"];?/g,
    "import { vi, $1 } from 'vitest';",
  ],

  // Mock function replacements
  [/jest\.fn\(\)/g, 'vi.fn()'],
  [/jest\.fn\(/g, 'vi.fn('],
  [/jest\.mock\(/g, 'vi.mock('],
  [/jest\.unmock\(/g, 'vi.unmock('],
  [/jest\.clearAllMocks\(\)/g, 'vi.clearAllMocks()'],
  [/jest\.resetAllMocks\(\)/g, 'vi.resetAllMocks()'],
  [/jest\.restoreAllMocks\(\)/g, 'vi.restoreAllMocks()'],
  [/jest\.spyOn\(/g, 'vi.spyOn('],
  [/jest\.setTimeout\(/g, 'vi.setTimeout('],
  [/jest\.useFakeTimers\(\)/g, 'vi.useFakeTimers()'],
  [/jest\.useRealTimers\(\)/g, 'vi.useRealTimers()'],
  [/jest\.runOnlyPendingTimers\(\)/g, 'vi.runOnlyPendingTimers()'],
  [/jest\.runAllTimers\(\)/g, 'vi.runAllTimers()'],
  [/jest\.advanceTimersByTime\(/g, 'vi.advanceTimersByTime('],
  [/jest\.setSystemTime\(/g, 'vi.setSystemTime('],

  // Global variable replacements
  [/(?<!\/\*\s*)jest\.(?=\w)/g, 'vi.'],
];

function convertFile(filePath) {
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    // console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let hasChanges = false;

    // Apply all replacements
    for (const [pattern, replacement] of jestToVitestReplacements) {
      const originalContent = content;
      content = content.replace(pattern, replacement);
      if (content !== originalContent) {
        hasChanges = true;
      }
    }

    if (hasChanges) {
      fs.writeFileSync(fullPath, content, 'utf8');
      // console.log(`✅ Converted: ${filePath}`);
      return true;
    }
    // console.log(`ℹ️  No changes needed: ${filePath}`);
    return false;
  } catch (error) {
    // console.error(`❌ Error converting ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  // console.log('🔄 Converting Jest imports to Vitest...\n');

  let convertedCount = 0;
  let totalFiles = 0;

  // Convert specific files
  for (const file of filesToConvert) {
    totalFiles++;
    if (convertFile(file)) {
      convertedCount++;
    }
  }

  // Also find and convert any remaining files with Jest imports
  try {
    const grepResult = execSync(
      'grep -r "import.*@jest/globals" src/ tests/ 2>/dev/null || true',
      {
        encoding: 'utf8',
      },
    );
    const remainingFiles = grepResult
      .split('\n')
      .filter((line) => line.includes(':'))
      .map((line) => line.split(':')[0])
      .filter((file, index, arr) => arr.indexOf(file) === index) // Remove duplicates
      .filter((file) => !filesToConvert.includes(file)); // Skip already processed files

    for (const file of remainingFiles) {
      if (file && !file.includes('node_modules')) {
        totalFiles++;
        if (convertFile(file)) {
          convertedCount++;
        }
      }
    }
  } catch (error) {
    // grep command failed, continue anyway
  }

  // console.log(`\n📊 Conversion Summary:`);
  // console.log(`   Converted: ${convertedCount} files`);
  // console.log(`   Total processed: ${totalFiles} files`);
  // console.log(`\n✨ Jest to Vitest conversion complete!`);

  if (convertedCount > 0) {
    // console.log('\n📝 Next steps:');
    // console.log('   1. Run tests to verify conversions: npm run test');
    // console.log('   2. Fix any remaining test failures manually');
    // console.log('   3. Remove any remaining Jest dependencies');
  }
}

main();
