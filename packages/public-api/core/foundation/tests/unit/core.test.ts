/**
 * @fileoverview Core Foundation Tests
 */

import { describe, it, expect } from 'vitest';

describe('Foundation Core', () => {
  describe('Logging System', () => {
    it('should create loggers', async () => {
      const { getLogger } = await import('../../src/core/logging');

      const logger = getLogger('test');
      expect(logger).toBeDefined();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });

  describe('Configuration System', () => {
    it('should provide config access', async () => {
      const { getConfig } = await import('../../src/core/config');

      const config = getConfig();
      expect(config).toBeDefined();
    });

    it('should detect environment', async () => {
      const { isDevelopment, isProduction, isTest } = await import(
        '../../src/core/config'
      );

      expect(typeof isDevelopment).toBe('function');
      expect(typeof isProduction).toBe('function');
      expect(typeof isTest).toBe('function');

      const envStates = [isDevelopment(), isProduction(), isTest()];
      const activeEnvs = envStates.filter(Boolean);
      expect(activeEnvs).toHaveLength(1);
    });
  });

  describe('Service Container', () => {
    it('should create container', async () => {
      const { createContainer } = await import(
        '../../src/dependency-injection'
      );

      const container = createContainer();
      expect(container).toBeDefined();
      expect(typeof container.register).toBe('function');
      expect(typeof container.resolve).toBe('function');
      expect(typeof container.has).toBe('function');
    });

    it('should register and resolve services', async () => {
      const { createContainer } = await import(
        '../../src/dependency-injection'
      );

      const container = createContainer();

      // Register instance
      container.registerInstance('testService', { value: 'test' });
      expect(container.has('testService')).toBe(true);

      const resolved = container.resolve<{ value: string }>('testService');
      expect(resolved.value).toBe('test');
    });

    it('should handle service registration with metadata', async () => {
      const { createContainer } = await import(
        '../../src/dependency-injection'
      );

      const container = createContainer();

      container.registerInstance(
        'service1',
        { data: 'test' },
        {
          capabilities: ['testing'],
          tags: ['unit-test'],
        }
      );

      expect(container.has('service1')).toBe(true);
    });
  });
});
