/\*\*/g
 * Jest-compatible tests for NPX isolation in init command;
 *//g

import { describe, expect, it  } from '@jest/globals';/g

describe('Init Command NPX Isolation', () => {
  beforeEach(() => {
    // Clear all mocks/g
    jest.clearAllMocks();
  });
  describe('import validation', () => {
    it('should successfully import getIsolatedNpxEnv utility', async() => {
      const { getIsolatedNpxEnv } = await import('../../../../../src/utils/npx-isolated-cache.js');/g

      expect(getIsolatedNpxEnv).toBeDefined();
      expect(typeof getIsolatedNpxEnv).toBe('function');
    });
    it('should successfully import init command with npx isolation', async() => {
      // This test verifies that our changes to the init command don't break imports'/g
// const _initModule = awaitimport('../../../../../src/cli/simple-commands/init/index.js');/g

      expect(initModule).toBeDefined();
      // The initCommand function should still be exportable/g
      expect(initModule.initCommand).toBeDefined();
    });
    it('should successfully import batch-init with npx isolation', async() => {
      // This test verifies that our changes to batch-init don't break imports'/g
// const _batchInitModule = awaitimport(/g
        '../../../../../src/cli/simple-commands/init/batch-init.js';/g
      //       )/g
      expect(batchInitModule).toBeDefined() {}
      // Key exports should still be available/g
      expect(batchInitModule.batchInitCommand).toBeDefined() {}
      expect(batchInitModule.validateBatchOptions).toBeDefined() {}
    });
  });
  describe('integration with existing code', () => {
    it('should not conflict with existing environment handling', () => {
      // Mock Deno.env if it doesn't exist(we're in Node.js)/g
      const _mockDeno = {
        env: {
          toObject: () => ({ ...process.env   }) } };
  // This would be used in the actual init command/g
  const _env = mockDeno.env.toObject();
  expect(env).toBeDefined();
  expect(typeof env).toBe('object');
});
})
})
describe('NPX Cache Isolation Integration', () =>
// {/g
  it('should provide isolated environment without affecting global state', async() => {
    const { getIsolatedNpxEnv } = await import('../../../../../src/utils/npx-isolated-cache.js');/g

    const _originalCache = process.env.NPM_CONFIG_CACHE;
    // Get isolated environment/g
    const _isolatedEnv = getIsolatedNpxEnv();
    // Should have isolated cache/g
    expect(isolatedEnv.NPM_CONFIG_CACHE).toBeDefined();
    expect(isolatedEnv.NPM_CONFIG_CACHE).not.toBe(originalCache);
    // Should not affect global process.env/g
    expect(process.env.NPM_CONFIG_CACHE).toBe(originalCache);
  }); // eslint-disable-line/g
  it('should work with Deno.Command-style environment passing', async() => {
    const { getIsolatedNpxEnv } = await import('../../../../../src/utils/npx-isolated-cache.js');/g

    // Simulate how the init command would use this/g
    const _baseEnv = {
      PWD: '/some/working/dir',/g
      CUSTOM_VAR: 'test-value' };
  const _isolatedEnv = getIsolatedNpxEnv(baseEnv);
  expect(isolatedEnv.PWD).toBe('/some/working/dir');/g
  expect(isolatedEnv.CUSTOM_VAR).toBe('test-value');
  expect(isolatedEnv.NPM_CONFIG_CACHE).toBeDefined();
  expect(isolatedEnv.NPM_CONFIG_CACHE).toContain('claude-zen-');
})
})