#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// console.log('🚀 Implementing Test Suite Quick Wins...\n');

// 1. Update vitest config for better performance
const vitestConfigPath = 'vitest.config.ts';
let vitestConfig = fs.readFileSync(vitestConfigPath, 'utf8');

// Add concurrent test support
if (!vitestConfig.includes('maxConcurrency')) {
  vitestConfig = vitestConfig.replace(
    'testTimeout: 30000,',
    `testTimeout: 30000,
    maxConcurrency: 8, // Enable concurrent test execution
    sequence: {
      concurrent: true, // Run tests concurrently by default
    },`
  );
  fs.writeFileSync(vitestConfigPath, vitestConfig);
  // console.log('✅ Added concurrent test execution to vitest.config.ts');
}

// 2. Create test utilities file
const testUtilsContent = `// Test utilities and common patterns
import { vi } from 'vitest';

// Mock factory functions
export const createMockAgent = (overrides = {}) => ({
  id: 'test-agent-001',
  type: 'researcher',
  status: 'active',
  capabilities: ['search', 'analyze'],
  ...overrides
});

export const createMockTask = (overrides = {}) => ({
  id: 'test-task-001',
  type: 'research',
  status: 'pending',
  priority: 'medium',
  ...overrides
});

export const createMockSwarm = (overrides = {}) => ({
  swarmId: 'test-swarm-001',
  topology: 'mesh',
  agentCount: 3,
  status: 'active',
  ...overrides
});

// Custom matchers for domain objects
export const domainMatchers = {
  toBeValidAgent(received) {
    const pass = received && 
                 typeof received.id === 'string' &&
                 typeof received.type === 'string' &&
                 ['active', 'idle', 'busy'].includes(received.status);
    
    return {
      message: () => \`expected \${received} to be a valid agent\`,
      pass
    };
  },

  toBeValidTask(received) {
    const pass = received && 
                 typeof received.id === 'string' &&
                 typeof received.type === 'string' &&
                 ['pending', 'in-progress', 'completed'].includes(received.status);
    
    return {
      message: () => \`expected \${received} to be a valid task\`,
      pass
    };
  }
};

// Async test helpers
export const waitForAsyncOperation = (ms = 100) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const mockAsyncFunction = (returnValue, delay = 0) => 
  vi.fn().mockImplementation(async (...args) => {
    if (delay > 0) await waitForAsyncOperation(delay);
    return returnValue;
  });

// Test data cleanup
export const cleanupTestData = () => {
  // Clear any global state, mocks, etc.
  vi.clearAllMocks();
};
`;

const testUtilsPath = 'src/__tests__/helpers/test-utils.ts';
if (!fs.existsSync(testUtilsPath)) {
  fs.writeFileSync(testUtilsPath, testUtilsContent);
  // console.log('✅ Created test utilities at src/__tests__/helpers/test-utils.ts');
}

// 3. Update vitest setup to include custom matchers
const setupPath = 'tests/vitest-setup.ts';
if (fs.existsSync(setupPath)) {
  let setupContent = fs.readFileSync(setupPath, 'utf8');

  if (!setupContent.includes('domainMatchers')) {
    setupContent += `
// Add custom domain matchers
import { expect } from 'vitest';
import { domainMatchers } from '../src/__tests__/helpers/test-utils';

expect.extend(domainMatchers);
`;
    fs.writeFileSync(setupPath, setupContent);
    // console.log('✅ Added custom domain matchers to vitest setup');
  }
}

// console.log('\n🎯 Quick wins implemented! Next steps:');
// console.log('   1. Remove E2E tests: rm -rf src/__tests__/e2e/');
// console.log('   2. Fix API mismatches in failing tests');
// console.log('   3. Add test.concurrent() to independent async tests');
// console.log('   4. Use test utilities in existing tests');
