/**
 * @fileoverview Main Exports Tests
 */

import { describe, expect, it } from 'vitest';

describe('Foundation Main Exports', () => {
  describe('Tree-shakable Entry Point', () => {
    it('should export essential utilities', async () => {
      const main = await import('../../src/index');

      // Core utilities
      expect(typeof main.getLogger).toBe('function');
      expect(typeof main.getConfig).toBe('function');

      // Environment detection
      expect(typeof main.isDevelopment).toBe('function');
      expect(typeof main.isProduction).toBe('function');
      expect(typeof main.isTest).toBe('function');

      // Result pattern
      expect(main.Result).toBeDefined();
      expect(typeof main.ok).toBe('function');
      expect(typeof main.err).toBe('function');
      expect(typeof main.safeAsync).toBe('function');
    });

    it('should maintain tree-shaking structure', async () => {
      const main = await import('../../src/index');
      const exportKeys = Object.keys(main);

      // Should have minimal exports for tree-shaking
      expect(exportKeys.length).toBeLessThan(15);

      // Should NOT include heavy utilities (they should be in specific modules)
      // TypedEventBase has been removed from foundation
      expect(exportKeys.includes('createServiceContainer')).toBe(false);
    });

    it('should work with logger creation', async () => {
      const { getLogger } = await import('../../src/index');

      const logger = getLogger('main-test');
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should work with configuration', async () => {
      const { getConfig, isDevelopment, isProduction, isTest } = await import(
        '../../src/index'
      );

      const config = getConfig();
      expect(config).toBeDefined();

      const envStates = [isDevelopment(), isProduction(), isTest()];
      const activeEnvs = envStates.filter(Boolean);
      expect(activeEnvs).toHaveLength(1);
    });

    it('should work with Result pattern', async () => {
      const { Result, ok, err, safeAsync } = await import('../../src/index');

      expect(Result).toBeDefined();

      const successResult = ok('test-success');
      const errorResult = err('test-error');

      expect(successResult.isOk()).toBe(true);
      expect(errorResult.isErr()).toBe(true);

      if (successResult.isOk()) {
        expect(successResult.value).toBe('test-success');
      }

      if (errorResult.isErr()) {
        expect(errorResult.error).toBe('test-error');
      }

      // Test safeAsync
      const asyncResult = await safeAsync(async () => 'async-test');
      expect(asyncResult.isOk()).toBe(true);

      if (asyncResult.isOk()) {
        expect(asyncResult.value).toBe('async-test');
      }
    });
  });

  describe('Module Exports', () => {
    it('should provide specific module exports', async () => {
      // Core modules
      const core = await import('../../src/core');
      expect(core).toBeDefined();

      // DI module
      const di = await import('../../src/di');
      expect(di).toBeDefined();

      // Utils module
      const utils = await import('../../src/utils');
      expect(utils).toBeDefined();

      // Resilience module
      const resilience = await import('../../src/resilience');
      expect(resilience).toBeDefined();
    });

    it('should maintain module separation', async () => {
      // Each module should have its own exports
      const events = await import('../../src/events');
      const errorHandling = await import('../../src/error-handling');
      const utilities = await import('../../src/utilities');

      expect(events).toBeDefined();
      expect(errorHandling).toBeDefined();
      expect(utilities).toBeDefined();

      // Modules should be separate
      expect(events).not.toBe(errorHandling);
      expect(errorHandling).not.toBe(utilities);
    });
  });
});
