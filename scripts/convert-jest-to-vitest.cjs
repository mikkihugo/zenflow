#!/usr/bin/env node

/**
 * Convert Jest imports to Vitest imports across all test files
 * Replaces @jest/globals with vitest imports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Converting Jest imports to Vitest...');

// Get all files with @jest/globals imports
const filesToConvert = [
  'src/__tests__/e2e/complete-workflow.test.ts',
  'src/__tests__/tdd-london-swarm.test.ts',
  'src/__tests__/coordination/hive-knowledge-performance.test.ts',
  'src/__tests__/coordination/hive-knowledge-integration.test.ts',
  'src/__tests__/coordination/hive-knowledge-bridge.test.ts',
  'src/__tests__/helpers/assertion-helpers.ts',
  'src/__tests__/unit/product-flow-sparc-unit.test.ts',
  'src/__tests__/unit/basic-functionality.test.ts',
  'src/__tests__/unit/neural/property-based-tests.test.ts',
  'src/__tests__/unit/classical/wasm-computations/matrix-operations.test.ts',
  'src/__tests__/unit/classical/neural-algorithms/training-convergence.test.ts',
  'src/__tests__/unit/classical/neural-algorithms/simd-optimization.test.ts',
  'src/__tests__/unit/classical/neural-algorithms/neural-network-training.test.ts',
  'src/__tests__/unit/classical/neural-algorithms/memory-efficiency.test.ts',
  'src/__tests__/unit/classical/neural-algorithms/ruv-fann-integration.test.ts',
  'src/__tests__/unit/classical/neural-algorithms/prediction-accuracy.test.ts',
  'src/__tests__/unit/classical/neural-algorithms/index.test.ts',
  'src/__tests__/unit/london/coordination/agent-communication-protocols.test.ts',
  'src/__tests__/unit/london/cli-commands/argument-parser.test.ts',
  'src/__tests__/unit/london/cli-commands/cli-command-processing.test.ts',
  'src/__tests__/unit/london/mcp-protocol/tool-registration-discovery.test.ts',
  'src/__tests__/unit/london/mcp-protocol/protocol-message-validation.test.ts',
  'src/__tests__/unit/london/mcp-protocol/index.test.ts',
  'src/__tests__/unit/london/mcp-protocol/error-scenarios.test.ts',
  'src/__tests__/integration/web-mcp-integration-london-tdd.test.ts',
  'src/__tests__/integration/product-flow-sparc-integration.test.ts',
  'src/__tests__/integration/orchestrator.test.ts',
  'src/__tests__/integration/database/lancedb-integration-validation.test.ts',
  'src/__tests__/integration/database/lancedb-adapter.test.ts',
  'src/__tests__/integration/memory-stores/index.test.ts',
  'src/intelligence/adaptive-learning/__tests__/adaptive-learning.test.ts',
  'src/coordination/swarm/core/session-manager.test.ts'
];

let convertedCount = 0;
let errors = [];

for (const filePath of filesToConvert) {
  const fullPath = path.join(process.cwd(), filePath);
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      continue;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Replace @jest/globals imports with vitest
    if (content.includes("from '@jest/globals'")) {
      content = content.replace(/from '@jest\/globals'/g, "from 'vitest'");
      modified = true;
    }

    // Replace vi.fn() with vi.fn()
    if (content.includes('vi.fn(')) {
      content = content.replace(/jest\.fn\(/g, 'vi.fn(');
      modified = true;
      
      // Add vi import if needed
      if (!content.includes('vi') && content.includes("from 'vitest'")) {
        content = content.replace(
          /import \{([^}]*)\} from 'vitest'/,
          (match, imports) => {
            if (!imports.includes('vi')) {
              return `import {${imports.trim()}, vi} from 'vitest'`;
            }
            return match;
          }
        );
      }
    }

    // Replace jest.mock() with vi.mock()
    if (content.includes('jest.mock(')) {
      content = content.replace(/jest\.mock\(/g, 'vi.mock(');
      modified = true;
    }

    // Replace jest.spyOn() with vi.spyOn()
    if (content.includes('jest.spyOn(')) {
      content = content.replace(/jest\.spyOn\(/g, 'vi.spyOn(');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Converted: ${filePath}`);
      convertedCount++;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error converting ${filePath}:`, error.message);
    errors.push({ file: filePath, error: error.message });
  }
}

console.log(`\n🎉 Conversion complete!`);
console.log(`✅ Converted: ${convertedCount} files`);

if (errors.length > 0) {
  console.log(`❌ Errors: ${errors.length} files`);
  errors.forEach(({ file, error }) => {
    console.log(`   ${file}: ${error}`);
  });
}

console.log('\n📝 Summary of changes made:');
console.log("   - Replaced 'from @jest/globals' with 'from vitest'");
console.log("   - Replaced 'vi.fn(' with 'vi.fn('");
console.log("   - Replaced 'jest.mock(' with 'vi.mock('");
console.log("   - Replaced 'jest.spyOn(' with 'vi.spyOn('");
console.log("   - Added 'vi' to vitest imports where needed");