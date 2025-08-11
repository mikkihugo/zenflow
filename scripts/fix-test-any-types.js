#!/usr/bin/env node

/**
 * Fix Test File 'any' Types Script
 * Replaces (globalThis as any) patterns with proper typed interfaces
 * Fixes hundreds of lint/suspicious/noExplicitAny violations in test files
 */

import fs from 'fs';
import { glob } from 'glob';
import path from 'path';

// Global test interface definitions
const GLOBAL_TEST_INTERFACE = `
// Global test utilities interface (auto-generated)
declare global {
  // London TDD utilities
  function createInteractionSpy(name: string): jest.Mock;
  function verifyInteractions(spy: jest.Mock, expectedCalls: ExpectedCall[]): void;
  function createMockFactory<T>(defaults?: Partial<T>): (overrides?: Partial<T>) => T;
  function waitForInteraction(spy: jest.Mock, timeout?: number): Promise<void>;
  function simulateProtocolHandshake(mockProtocol: jest.Mock): void;
  
  // Classical TDD utilities  
  const testStartTime: number;
  const testStartMemory: NodeJS.MemoryUsage | undefined;
  function generateNeuralTestData(config: NeuralTestConfig): NeuralTestData[];
  function expectNearlyEqual(actual: number, expected: number, tolerance?: number): void;
  function createCoordinationMock<T>(defaults?: Partial<T>): (overrides?: Partial<T>) => T;
  
  // Hybrid testing utilities
  function testWithApproach(approach: 'london' | 'classical', testFn: () => void | Promise<void>): void;
  function createMemoryTestScenario(type: 'sqlite' | 'lancedb' | 'json'): MemoryTestScenario;
  
  // Node.js garbage collection (optional)
  function gc?(): void;
  
  // Custom Vitest matchers
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledWithObjectContaining(expected: Record<string, unknown>): R;
    }
  }
}

// Supporting types
interface ExpectedCall {
  args: unknown[];
  times?: number;
}

interface NeuralTestConfig {
  type: 'xor' | 'linear' | 'classification';
  size: number;
}

interface NeuralTestData {
  input: number[];
  output: number[];
}

interface MemoryTestScenario {
  setup(): Promise<void>;
  cleanup(): Promise<void>;
  data: Record<string, unknown>;
}

interface ProtocolResponse {
  type: string;
  success: boolean;
  data?: unknown;
}
`;

class TestAnyTypeFixer {
  constructor() {
    this.baseDir = path.resolve(process.cwd());
    this.testDirs = ['tests', 'src/__tests__', '__tests__'];
    this.fixedFiles = [];
    this.createdFiles = [];
  }

  async fix() {
    // console.log('🔧 Fixing Test File "any" Types...');

    // Find all test files
    const testFiles = await this.findTestFiles();
    // console.log(`📁 Found ${testFiles.length} test files to check`);

    // Create global test types
    await this.createGlobalTestTypes();

    // Process each test file
    for (const filePath of testFiles) {
      await this.fixTestFile(filePath);
    }

    // console.log(`\n✅ Test file fixing complete:`);
    // console.log(`   📝 Fixed ${this.fixedFiles.length} test files`);
    // console.log(`   📦 Created ${this.createdFiles.length} type files`);
  }

  async findTestFiles() {
    const patterns = [
      'tests/**/*.{ts,tsx}',
      'src/__tests__/**/*.{ts,tsx}',
      '__tests__/**/*.{ts,tsx}',
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
    ];

    let allFiles = [];
    for (const pattern of patterns) {
      const files = await glob(pattern, {
        cwd: this.baseDir,
        ignore: ['node_modules/**', 'dist/**'],
      });
      allFiles = allFiles.concat(files.map((f) => path.join(this.baseDir, f)));
    }

    // Remove duplicates
    return [...new Set(allFiles)];
  }

  async createGlobalTestTypes() {
    // Create test types file
    const testTypesPath = path.join(this.baseDir, 'tests', 'global-types.d.ts');

    // Ensure tests directory exists
    const testsDir = path.dirname(testTypesPath);
    if (!fs.existsSync(testsDir)) {
      fs.mkdirSync(testsDir, { recursive: true });
    }

    fs.writeFileSync(testTypesPath, GLOBAL_TEST_INTERFACE);
    this.createdFiles.push('tests/global-types.d.ts');
    // console.log('   ✅ Created tests/global-types.d.ts');
  }

  async fixTestFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let changeCount = 0;

    // Define replacement patterns
    const replacements = [
      // Global test utilities (no casting needed)
      {
        pattern: /\(globalThis as any\)\.createInteractionSpy/g,
        replacement: 'createInteractionSpy',
        description: 'createInteractionSpy calls',
      },
      {
        pattern: /\(globalThis as any\)\.verifyInteractions/g,
        replacement: 'verifyInteractions',
        description: 'verifyInteractions calls',
      },
      {
        pattern: /\(globalThis as any\)\.createMockFactory/g,
        replacement: 'createMockFactory',
        description: 'createMockFactory calls',
      },
      {
        pattern: /\(globalThis as any\)\.waitForInteraction/g,
        replacement: 'waitForInteraction',
        description: 'waitForInteraction calls',
      },
      {
        pattern: /\(globalThis as any\)\.simulateProtocolHandshake/g,
        replacement: 'simulateProtocolHandshake',
        description: 'simulateProtocolHandshake calls',
      },
      {
        pattern: /\(globalThis as any\)\.generateNeuralTestData/g,
        replacement: 'generateNeuralTestData',
        description: 'generateNeuralTestData calls',
      },
      {
        pattern: /\(globalThis as any\)\.expectNearlyEqual/g,
        replacement: 'expectNearlyEqual',
        description: 'expectNearlyEqual calls',
      },
      {
        pattern: /\(globalThis as any\)\.createCoordinationMock/g,
        replacement: 'createCoordinationMock',
        description: 'createCoordinationMock calls',
      },
      {
        pattern: /\(globalThis as any\)\.testWithApproach/g,
        replacement: 'testWithApproach',
        description: 'testWithApproach calls',
      },
      {
        pattern: /\(globalThis as any\)\.createMemoryTestScenario/g,
        replacement: 'createMemoryTestScenario',
        description: 'createMemoryTestScenario calls',
      },

      // Property assignments (use proper globals)
      {
        pattern: /\(globalThis as any\)\.testStartTime\s*=/g,
        replacement: 'globalThis.testStartTime =',
        description: 'testStartTime assignments',
      },
      {
        pattern: /\(globalThis as any\)\.testStartMemory\s*=/g,
        replacement: 'globalThis.testStartMemory =',
        description: 'testStartMemory assignments',
      },

      // Garbage collection (optional global)
      {
        pattern: /\(globalThis as any\)\.gc\(/g,
        replacement: 'globalThis.gc?.(',
        description: 'gc calls with optional chaining',
      },
      {
        pattern: /typeof \(globalThis as any\)\.gc/g,
        replacement: 'typeof globalThis.gc',
        description: 'gc type checks',
      },

      // Function parameter any types
      {
        pattern: /\bmessage:\s*any\b/g,
        replacement: 'message: unknown',
        description: 'message parameter types',
      },
      {
        pattern: /\breceived:\s*any\b/g,
        replacement: 'received: jest.Mock',
        description: 'received parameter types',
      },
      {
        pattern: /\bexpected:\s*any\b/g,
        replacement: 'expected: unknown',
        description: 'expected parameter types',
      },
      {
        pattern: /\bcall:\s*any\[\]/g,
        replacement: 'call: unknown[]',
        description: 'call array types',
      },
    ];

    // Apply each replacement
    replacements.forEach(({ pattern, replacement, description }) => {
      const beforeCount = (updatedContent.match(pattern) || []).length;
      updatedContent = updatedContent.replace(pattern, replacement);
      const afterCount = (updatedContent.match(pattern) || []).length;
      const fixed = beforeCount - afterCount;

      if (fixed > 0) {
        changeCount += fixed;
        // console.log(`      • Fixed ${fixed} ${description}`);
      }
    });

    // Add type imports if needed and changes were made
    if (
      changeCount > 0 &&
      !updatedContent.includes('/// <reference types="./global-types"')
    ) {
      // Add reference to global types at the top
      const lines = updatedContent.split('\n');
      let insertIndex = 0;

      // Find appropriate location (after existing references/imports)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (
          line.startsWith('///') ||
          line.startsWith('import') ||
          line.startsWith('/*') ||
          line.startsWith(' *') ||
          line.startsWith('*/')
        ) {
          insertIndex = i + 1;
        } else if (line === '') {
        } else {
          break;
        }
      }

      lines.splice(insertIndex, 0, '/// <reference types="./global-types" />');
      updatedContent = lines.join('\n');
    }

    // Write back if changed
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent);
      this.fixedFiles.push({
        path: filePath,
        changes: changeCount,
      });

      const relative = path.relative(this.baseDir, filePath);
      // console.log(`   ✅ Fixed ${relative} (${changeCount} changes)`);
    }
  }
}

// Create tsconfig for tests to include global types
async function createTestTSConfig() {
  const testTsconfigPath = path.join(process.cwd(), 'tests', 'tsconfig.json');

  const testTsconfig = {
    extends: '../tsconfig.json',
    compilerOptions: {
      types: ['jest', 'node'],
      typeRoots: ['../node_modules/@types', '.'],
    },
    include: ['**/*.ts', '**/*.tsx', 'global-types.d.ts'],
  };

  // Only create if it doesn't exist
  if (!fs.existsSync(testTsconfigPath)) {
    fs.writeFileSync(testTsconfigPath, JSON.stringify(testTsconfig, null, 2));
    // console.log('   ✅ Created tests/tsconfig.json');
    return true;
  }

  return false;
}

// Main execution
async function main() {
  try {
    const fixer = new TestAnyTypeFixer();
    await fixer.fix();

    // Create test TypeScript config
    const createdTsconfig = await createTestTSConfig();
    if (createdTsconfig) {
      // console.log('   📦 Created test TypeScript configuration');
    }

    // console.log('\n🎉 Test file "any" type fixing complete!');
    // console.log('\n💡 Benefits:');
    // console.log('   • Removed hundreds of lint/suspicious/noExplicitAny violations');
    // console.log('   • Added proper type safety to test utilities');
    // console.log('   • Created reusable global test interface');

    // console.log('\n🔧 Next steps:');
    // console.log('   1. Run tests to verify functionality is preserved');
    // console.log('   2. Run linter to confirm "any" violations are fixed');
    // console.log('   3. Review and customize global-types.d.ts if needed');
  } catch (error) {
    // console.error('❌ Test file fixing failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TestAnyTypeFixer };
