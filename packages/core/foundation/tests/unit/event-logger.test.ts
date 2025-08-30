/**
 * @fileoverview Event Logger Tests
 * 
 * Tests for the EventLogger class to ensure proper functionality
 * of event-based logging system.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('EventLogger', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env['NODE_ENV'];
    delete process.env['CLAUDE_EVENT_LOGGING'];
    vi.clearAllMocks();
    
    // Clear module cache to get fresh instance with new env vars
    vi.resetModules();
  });

  describe('Environment-based enablement', () => {
    it('should be enabled in development environment', async () => {
      process.env['NODE_ENV'] = 'development';
      
      // Dynamically import to get fresh environment check
      const { EventLogger } = await import('../../src/events/event-logger.js');
      
      expect(EventLogger.isEnabled()).toBe(true);
    });

    it('should be disabled in production environment by default', async () => {
      process.env['NODE_ENV'] = 'production';
      
      const { EventLogger } = await import('../../src/events/event-logger.js');
      
      expect(EventLogger.isEnabled()).toBe(false);
    });

    it('should be enabled when CLAUDE_EVENT_LOGGING is true', async () => {
      process.env['NODE_ENV'] = 'production';
      process.env['CLAUDE_EVENT_LOGGING'] = 'true';
      
      const { EventLogger } = await import('../../src/events/event-logger.js');
      
      expect(EventLogger.isEnabled()).toBe(true);
    });

    it('should be disabled when CLAUDE_EVENT_LOGGING is false', async () => {
      process.env['NODE_ENV'] = 'production';
      process.env['CLAUDE_EVENT_LOGGING'] = 'false';
      
      const { EventLogger } = await import('../../src/events/event-logger.js');
      
      expect(EventLogger.isEnabled()).toBe(false);
    });

    it('should not be enabled with broken space in environment variable', async () => {
      // Test the bug fix - ensure spaces in env var values don't match
      process.env['NODE_ENV'] = ' development'; // with space
      process.env['CLAUDE_EVENT_LOGGING'] = ' true'; // with space
      
      const { EventLogger } = await import('../../src/events/event-logger.js');
      
      expect(EventLogger.isEnabled()).toBe(false);
    });
  });

  describe('Force enablement', () => {
    it('should enable logging when force enabled', async () => {
      process.env['NODE_ENV'] = 'production';
      
      const { EventLogger } = await import('../../src/events/event-logger.js');
      
      expect(EventLogger.isEnabled()).toBe(false);
      
      EventLogger.enable();
      expect(EventLogger.isEnabled()).toBe(true);
      
      EventLogger.disable();
      expect(EventLogger.isEnabled()).toBe(false);
    });
  });

  describe('Basic functionality', () => {
    it('should have all required methods', async () => {
      const { EventLogger } = await import('../../src/events/event-logger.js');
      
      expect(typeof EventLogger.log).toBe('function');
      expect(typeof EventLogger.logFlow).toBe('function');
      expect(typeof EventLogger.logWithContext).toBe('function');
      expect(typeof EventLogger.logError).toBe('function');
      expect(typeof EventLogger.enable).toBe('function');
      expect(typeof EventLogger.disable).toBe('function');
      expect(typeof EventLogger.isEnabled).toBe('function');
    });

    it('should not throw when logging while disabled', async () => {
      process.env['NODE_ENV'] = 'production';
      const { EventLogger } = await import('../../src/events/event-logger.js');
      
      expect(() => {
        EventLogger.log('test-event', { data: 'test' });
        EventLogger.logFlow('A', 'B', 'test');
        EventLogger.logError('error', 'test error');
        EventLogger.logWithContext('context', { data: 'test' }, { component: 'Test' });
      }).not.toThrow();
    });

    it('should not throw when logging while enabled', async () => {
      process.env['NODE_ENV'] = 'development';
      const { EventLogger } = await import('../../src/events/event-logger.js');
      
      expect(() => {
        EventLogger.log('test-event', { data: 'test' });
        EventLogger.logFlow('A', 'B', 'test');
        EventLogger.logError('error', 'test error');
        EventLogger.logWithContext('context', { data: 'test' }, { component: 'Test' });
      }).not.toThrow();
    });
  });

  describe('Convenience functions', () => {
    it('should export convenience functions', async () => {
      const module = await import('../../src/events/event-logger.js');
      
      expect(typeof module.logEvent).toBe('function');
      expect(typeof module.logFlow).toBe('function');
      expect(typeof module.logError).toBe('function');
    });

    it('should not throw when calling convenience functions', async () => {
      process.env['NODE_ENV'] = 'development';
      const { logEvent, logFlow, logError } = await import('../../src/events/event-logger.js');
      
      expect(() => {
        logEvent('convenience-test');
        logFlow('A', 'B', 'transfer');
        logError('convenience-error', 'test error', 'TestComponent');
      }).not.toThrow();
    });
  });
});