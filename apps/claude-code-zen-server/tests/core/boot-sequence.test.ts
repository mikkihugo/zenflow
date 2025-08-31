/**
 * @fileoverview Boot Sequence Tests
 * 
 * Tests for core system and application coordinator boot sequence.
 * Validates that the server can start and stop without errors.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { System } from '../../src/core/core-system';
import { ApplicationCoordinator } from '../../src/core/application-coordinator';

describe('Boot Sequence Tests', () => {
  describe('Core System', () => {
    let system: System;

    afterEach(async () => {
      if (system) {
        try {
          await system.shutdown();
        } catch (_error) {
          // Ignore shutdown errors in tests
        }
      }
    });

    it('should create core system with default config', () => {
      system = new System();
      expect(system).toBeDefined();
      expect(typeof system.initialize).toBe('function');
      expect(typeof system.launch).toBe('function');
      expect(typeof system.shutdown).toBe('function');
    });

    it('should initialize core system successfully', async () => {
      system = new System({
        websocket: {
          enableEventStreaming: true,
          heartbeatInterval: 5000,
        },
        interface: {
          enableWebSocket: true,
          defaultMode: 'web',
        },
      });

      await expect(system.initialize()).resolves.not.toThrow();
      
      const status = await system.getSystemStatus();
      expect(status.status).toBe('ready');
      expect(status.version).toContain('websocket-enabled');
      expect(status.components.websocket.status).toBe('ready');
    });

    it('should launch core system without errors', async () => {
      system = new System({
        websocket: { enableEventStreaming: true },
        interface: { enableWebSocket: true },
      });

      await system.initialize();
      await expect(system.launch()).resolves.not.toThrow();
    });

    it('should shutdown gracefully', async () => {
      system = new System();
      await system.initialize();
      await system.launch();
      
      await expect(system.shutdown()).resolves.not.toThrow();
      
      const status = await system.getSystemStatus();
      expect(status.status).toBe('shutdown');
    });

    it('should handle double initialization gracefully', async () => {
      system = new System();
      await system.initialize();
      
      // Second initialization should not throw
      await expect(system.initialize()).resolves.not.toThrow();
    });

    it('should provide system components', async () => {
      system = new System();
      await system.initialize();
      
      const components = system.getComponents();
      expect(components).toBeDefined();
      expect(components.container).toBeDefined();
      expect(typeof components.activeConnections).toBe('number');
    });
  });

  describe('Application Coordinator', () => {
    let coordinator: ApplicationCoordinator;

    afterEach(async () => {
      if (coordinator) {
        try {
          await coordinator.shutdown();
        } catch (_error) {
          // Ignore shutdown errors in tests
        }
      }
    });

    it('should create application coordinator with default config', () => {
      coordinator = new ApplicationCoordinator();
      expect(coordinator).toBeDefined();
      expect(typeof coordinator.initialize).toBe('function');
      expect(typeof coordinator.launch).toBe('function');
      expect(typeof coordinator.shutdown).toBe('function');
    });

    it('should initialize application coordinator successfully', async () => {
      coordinator = new ApplicationCoordinator({
        websocket: {
          enableEventStreaming: true,
          enableBroadcasting: true,
        },
        interface: {
          enableWebSocket: true,
          enableRealTime: true,
        },
        memory: {
          enableCache: true,
        },
        workflow: {
          enableRealtime: true,
        },
      });

      await expect(coordinator.initialize()).resolves.not.toThrow();
      
      const status = coordinator.getSystemStatus();
      expect(status.status).toBe('ready');
      expect(status.version).toContain('websocket-enabled');
      expect(status.components.websocket.status).toBe('ready');
      expect(status.components.websocket.broadcasting).toBe(true);
    });

    it('should launch application coordinator without errors', async () => {
      coordinator = new ApplicationCoordinator({
        websocket: { enableBroadcasting: true },
        interface: { enableWebSocket: true },
      });

      await coordinator.initialize();
      await expect(coordinator.launch()).resolves.not.toThrow();
    });

    it('should generate system report', async () => {
      coordinator = new ApplicationCoordinator();
      await coordinator.initialize();
      
      const report = await coordinator.generateSystemReport();
      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      expect(report).toContain('WebSocket Enabled');
      expect(report).toContain('Active WebSocket Connections');
    });

    it('should process documents', async () => {
      coordinator = new ApplicationCoordinator();
      await coordinator.initialize();
      
      const result = await coordinator.processDocument('/test/path.md');
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.workflowIds)).toBe(true);
    });

    it('should export system data', async () => {
      coordinator = new ApplicationCoordinator();
      await coordinator.initialize();
      
      const result = await coordinator.exportSystemData('json');
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.filename).toBeDefined();
      expect(result.filename).toMatch(/\.json$/);
    });

    it('should shutdown gracefully', async () => {
      coordinator = new ApplicationCoordinator();
      await coordinator.initialize();
      await coordinator.launch();
      
      await expect(coordinator.shutdown()).resolves.not.toThrow();
      
      const status = coordinator.getSystemStatus();
      expect(status.status).toBe('shutdown');
    });

    it('should provide comprehensive system status', async () => {
      coordinator = new ApplicationCoordinator({
        websocket: { enableEventStreaming: true },
        memory: { enableCache: true },
        workflow: { enableRealtime: true },
        export: { enableStreaming: true },
      });
      
      await coordinator.initialize();
      
      const status = coordinator.getSystemStatus();
      expect(status).toBeDefined();
      expect(status.status).toBe('ready');
      expect(status.components).toBeDefined();
      expect(status.components.websocket).toBeDefined();
      expect(status.components.memory.cacheEnabled).toBe(true);
      expect(status.components.workflow.realtimeEnabled).toBe(true);
      expect(status.components.export.streamingEnabled).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    let system: System;
    let coordinator: ApplicationCoordinator;

    afterEach(async () => {
      const shutdownPromises = [];
      if (coordinator) {
        shutdownPromises.push(coordinator.shutdown().catch(() => {}));
      }
      if (system) {
        shutdownPromises.push(system.shutdown().catch(() => {}));
      }
      await Promise.allSettled(shutdownPromises);
    });

    it('should create both system and coordinator', async () => {
      system = new System();
      coordinator = new ApplicationCoordinator();

      await Promise.all([
        system.initialize(),
        coordinator.initialize(),
      ]);

      expect(system.getSystemStatus().then(s => s.status)).resolves.toBe('ready');
      expect(coordinator.getSystemStatus().status).toBe('ready');
    });

    it('should handle quick start methods', async () => {
      system = await System.quickStart({
        websocket: { enableEventStreaming: true },
        interface: { enableWebSocket: true },
      });

      coordinator = await ApplicationCoordinator.quickStart({
        websocket: { enableBroadcasting: true },
        interface: { enableWebSocket: true },
      });

      expect(system).toBeDefined();
      expect(coordinator).toBeDefined();
      
      const systemStatus = await system.getSystemStatus();
      const coordinatorStatus = coordinator.getSystemStatus();
      
      expect(systemStatus.status).toBe('ready');
      expect(coordinatorStatus.status).toBe('ready');
    });
  });
});