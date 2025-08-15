/**
 * @fileoverview Native Binding Integration Tests
 *
 * Tests for native binding loading, platform detection, and fallback mechanisms.
 * Ensures that zen-orchestrator integration works correctly with proper error handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getLogger } from '../config/logging-config.js';
import { ZenOrchestratorIntegration, resetBindingState } from '../zen-orchestrator-integration.js';

const logger = getLogger('NativeBindingTests');

describe('Native Binding Integration', () => {
  let orchestrator: ZenOrchestratorIntegration;

  beforeEach(() => {
    // Reset binding state between tests to ensure isolation
    resetBindingState();
    
    // Create a new orchestrator instance for each test
    orchestrator = new ZenOrchestratorIntegration({
      enabled: true,
      host: 'localhost',
      port: 4003,
    });
  });

  afterEach(async () => {
    // Clean up after each test
    if (orchestrator) {
      try {
        await orchestrator.shutdown();
      } catch (error) {
        logger.warn('Error during test cleanup:', error);
      }
    }
  });

  describe('Platform Detection', () => {
    it('should detect the current platform correctly', () => {
      const bindingInfo = orchestrator.getBindingInfo();
      expect(bindingInfo).toHaveProperty('mode');
      expect(['native', 'fallback']).toContain(bindingInfo.mode);
      
      if (bindingInfo.mode === 'native') {
        expect(bindingInfo).toHaveProperty('platform');
        expect(bindingInfo).toHaveProperty('arch');
        expect(typeof bindingInfo.platform).toBe('string');
        expect(typeof bindingInfo.arch).toBe('string');
      }
    });

    it('should provide binding information in status', async () => {
      try {
        await orchestrator.initialize();
        const status = await orchestrator.getStatus();
        
        expect(status.success).toBe(true);
        expect(status.data).toHaveProperty('binding');
        expect(status.data.binding).toHaveProperty('mode');
        expect(['native', 'fallback']).toContain(status.data.binding.mode);
        
        if (status.data.binding.mode === 'fallback') {
          expect(status.data).toHaveProperty('warnings');
          expect(Array.isArray(status.data.warnings)).toBe(true);
        }
      } catch (error) {
        // If initialization fails, we should still get fallback mode
        logger.info('Native binding unavailable, testing fallback mode');
        expect(orchestrator.isFallbackMode()).toBe(true);
      }
    });
  });

  describe('Native Binding Loading', () => {
    it('should handle native binding loading gracefully', async () => {
      // This test should pass whether native bindings are available or not
      try {
        await orchestrator.initialize();
        expect(await orchestrator.isReady()).toBe(true);
        
        // Test basic functionality
        const status = await orchestrator.getStatus();
        expect(status.success).toBe(true);
        expect(status.data).toBeDefined();
        
        logger.info('Native binding test successful');
      } catch (error) {
        logger.warn('Native binding failed, checking fallback:', error);
        
        // Should have fallen back to fallback mode
        expect(orchestrator.isFallbackMode()).toBe(true);
      }
    });

    it('should provide services list regardless of binding mode', async () => {
      await orchestrator.initialize();
      
      const servicesResult = await orchestrator.listServices();
      expect(servicesResult.success).toBe(true);
      expect(Array.isArray(servicesResult.data)).toBe(true);
      expect(servicesResult.data!.length).toBeGreaterThan(0);
      
      if (orchestrator.isFallbackMode()) {
        expect(servicesResult.data).toContain('fallback-echo');
      }
    });
  });

  describe('Fallback Mode', () => {
    it('should handle echo service in fallback mode', async () => {
      await orchestrator.initialize();
      
      if (orchestrator.isFallbackMode()) {
        const result = await orchestrator.executeService('echo', {
          message: 'test message'
        });
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data.mode).toBe('fallback');
        expect(result.executionTimeMs).toBeDefined();
      }
    });

    it('should return appropriate errors for unsupported services in fallback mode', async () => {
      await orchestrator.initialize();
      
      if (orchestrator.isFallbackMode()) {
        const result = await orchestrator.executeService('unsupported-service', {});
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('not available in fallback mode');
      }
    });

    it('should handle A2A messages gracefully in fallback mode', async () => {
      await orchestrator.initialize();
      
      if (orchestrator.isFallbackMode()) {
        const result = await orchestrator.sendA2AMessage('test', { data: 'test' });
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('not available in fallback mode');
      }
    });
  });

  describe('Neural Service Integration', () => {
    it('should handle neural service execution regardless of mode', async () => {
      await orchestrator.initialize();
      
      const result = await orchestrator.executeNeuralService(
        'neural-forward',
        { input: [1, 2, 3] }
      );
      
      expect(result.success).toBeDefined();
      expect(result.executionTimeMs).toBeDefined();
      
      if (orchestrator.isFallbackMode()) {
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data.mode).toBe('fallback');
      }
    });
  });

  describe('Metrics and Status', () => {
    it('should provide metrics regardless of binding mode', async () => {
      await orchestrator.initialize();
      
      const metricsResult = await orchestrator.getMetrics();
      expect(metricsResult.success).toBe(true);
      expect(metricsResult.data).toBeDefined();
      
      if (orchestrator.isFallbackMode()) {
        expect(metricsResult.data.mode).toBe('fallback');
      }
    });

    it('should provide A2A server status', async () => {
      await orchestrator.initialize();
      
      const statusResult = await orchestrator.getA2AServerStatus();
      
      if (orchestrator.isFallbackMode()) {
        // In fallback mode, A2A server is not available
        expect(statusResult.success).toBe(true);
        expect(statusResult.data).toBeDefined();
        expect(statusResult.data.mode).toBe('fallback');
        expect(statusResult.data.running).toBe(false);
      } else {
        // In native mode, A2A server should be available
        expect(statusResult.success).toBe(true);
        expect(statusResult.data).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization failures gracefully', async () => {
      // Test with invalid configuration
      const invalidOrchestrator = new ZenOrchestratorIntegration({
        enabled: true,
        host: 'invalid-host-that-does-not-exist',
        port: -1,
      });

      try {
        await invalidOrchestrator.initialize();
        
        // Should either succeed with fallback or fail gracefully
        if (await invalidOrchestrator.isReady()) {
          expect(invalidOrchestrator.isFallbackMode()).toBe(true);
        }
      } catch (error) {
        // Error is expected for invalid configuration
        expect(error).toBeDefined();
      } finally {
        await invalidOrchestrator.shutdown();
      }
    });

    it('should handle operations on uninitialized orchestrator', async () => {
      const uninitializedOrchestrator = new ZenOrchestratorIntegration();
      
      const statusResult = await uninitializedOrchestrator.getStatus();
      expect(statusResult.success).toBe(false);
      expect(statusResult.error).toContain('not initialized');
      
      const servicesResult = await uninitializedOrchestrator.listServices();
      expect(servicesResult.success).toBe(false);
      expect(servicesResult.error).toContain('not initialized');
    });
  });

  describe('Version and Shutdown', () => {
    it('should provide version information', () => {
      const version = orchestrator.getVersion();
      expect(typeof version).toBe('string');
      expect(version.length).toBeGreaterThan(0);
    });

    it('should handle shutdown gracefully', async () => {
      await orchestrator.initialize();
      
      // Check if initialization was successful
      const wasReady = await orchestrator.isReady();
      expect(wasReady).toBe(true);
      
      await orchestrator.shutdown();
      expect(await orchestrator.isReady()).toBe(false);
    });

    it('should handle multiple shutdowns gracefully', async () => {
      await orchestrator.initialize();
      
      // First shutdown
      await orchestrator.shutdown();
      expect(await orchestrator.isReady()).toBe(false);
      
      // Second shutdown should not throw
      await expect(orchestrator.shutdown()).resolves.not.toThrow();
    });
  });
});