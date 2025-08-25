/**
 * @fileoverview Simple Config Service Tests
 *
 * Tests for existing config functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getConfig,
  validateConfig,
  reloadConfig,
  isDebugMode,
  isDevelopment,
  isProduction,
  isTest,
  getEnv,
  requireEnv,
  shouldLog,
  configHelpers,
} from '../../src/core/config/config.service';

describe('Config Service - Working Features', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Basic Config Operations', () => {
    it('should get config', () => {
      const config = getConfig();
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });

    it('should validate config', () => {
      const isValid = validateConfig();
      expect(typeof isValid).toBe('boolean');
    });

    it('should reload config', () => {
      expect(() => reloadConfig()).not.toThrow();
    });

    it('should check debug mode', () => {
      const debugMode = isDebugMode();
      expect(typeof debugMode).toBe('boolean');
    });
  });

  describe('Environment Detection', () => {
    it('should detect development environment', () => {
      process.env.NODE_ENV = 'development';
      reloadConfig();
      expect(isDevelopment()).toBe(true);
      expect(isProduction()).toBe(false);
      expect(isTest()).toBe(false);
    });

    it('should detect production environment', () => {
      process.env.NODE_ENV = 'production';
      reloadConfig();
      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(true);
      expect(isTest()).toBe(false);
    });

    it('should detect test environment', () => {
      process.env.NODE_ENV = 'test';
      reloadConfig();
      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(false);
      expect(isTest()).toBe(true);
    });
  });

  describe('Environment Variable Helpers', () => {
    it('should get environment variable with default', () => {
      process.env.TEST_VAR = 'test-value';
      expect(getEnv('TEST_VAR')).toBe('test-value');
      expect(getEnv('MISSING_VAR', 'default')).toBe('default');
      expect(getEnv('MISSING_VAR')).toBe('');
    });

    it('should require environment variable', () => {
      process.env.REQUIRED_VAR = 'required-value';
      expect(requireEnv('REQUIRED_VAR')).toBe('required-value');

      // Test missing required var throws
      expect(() => requireEnv('MISSING_REQUIRED')).toThrow();
    });
  });

  describe('Logging Configuration', () => {
    it('should determine if logging level is enabled', () => {
      expect(typeof shouldLog('error')).toBe('boolean');
      expect(typeof shouldLog('warn')).toBe('boolean');
      expect(typeof shouldLog('info')).toBe('boolean');
      expect(typeof shouldLog('debug')).toBe('boolean');
    });

    it('should handle different log levels', () => {
      const levels = ['error', 'warn', 'info', 'debug'] as const;
      levels.forEach((level) => {
        const result = shouldLog(level);
        expect(typeof result).toBe('boolean');
      });
    });
  });

  describe('Config Helpers', () => {
    it('should provide config helpers', () => {
      expect(configHelpers).toBeDefined();
      expect(typeof configHelpers.get).toBe('function');
    });

    it('should get config values by key', () => {
      // These should not throw
      expect(() => configHelpers.get('env')).not.toThrow();
      expect(() => configHelpers.get('logging.level')).not.toThrow();
    });
  });

  describe('Config Structure', () => {
    it('should have expected config properties', () => {
      const config = getConfig();
      expect(config).toHaveProperty('env');
      expect(config).toHaveProperty('logging');
      expect(typeof config.env).toBe('string');
      expect(typeof config.logging).toBe('object');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined NODE_ENV', () => {
      delete process.env.NODE_ENV;
      reloadConfig();

      // Should not throw with undefined NODE_ENV
      expect(() => isDevelopment()).not.toThrow();
      expect(() => isProduction()).not.toThrow();
      expect(() => isTest()).not.toThrow();
    });
  });
});
