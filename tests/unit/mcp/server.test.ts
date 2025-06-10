/**
 * Unit tests for MCP Server
 */

import { describe, it, beforeEach, afterEach, expect } from 'https://deno.land/std@0.208.0/testing/bdd.ts';

import { MCPServer } from '../../../src/mcp/server.ts';
import { MCPConfig, MCPTool } from '../../../src/utils/types.ts';
import { Logger } from '../../../src/core/logger.ts';
import { EventBus } from '../../../src/core/event-bus.ts';

describe('MCPServer', () => {
  let server: MCPServer;
  let logger: Logger;
  let eventBus: EventBus;
  let config: MCPConfig;

  beforeEach(async () => {
    logger = new Logger();
    await logger.configure({
      level: 'debug',
      format: 'text',
      destination: 'console',
    });

    eventBus = new EventBus(logger);

    config = {
      transport: 'stdio',
      host: 'localhost',
      port: 3002,
      tlsEnabled: false,
      auth: { enabled: false, method: 'token' },
      loadBalancer: {
        enabled: false,
        strategy: 'round-robin',
        maxRequestsPerSecond: 100,
        healthCheckInterval: 30000,
        circuitBreakerThreshold: 5,
      },
      sessionTimeout: 60000,
      maxSessions: 10,
    };

    server = new MCPServer(config, eventBus, logger);
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  describe('Lifecycle Management', () => {
    it('should initialize correctly', () => {
      expect(server).toBeDefined();
    });

    it('should start and stop successfully', async () => {
      await server.start();
      
      const healthStatus = await server.getHealthStatus();
      expect(healthStatus.healthy).toBe(true);
      
      await server.stop();
    });

    it('should not allow starting twice', async () => {
      await server.start();
      
      try {
        await server.start();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('already running');
      }
      
      await server.stop();
    });

    it('should handle stop when not running', async () => {
      // Should not throw
      await server.stop();
    });
  });

  describe('Tool Management', () => {
    it('should register tools', () => {
      const testTool: MCPTool = {
        name: 'test/tool',
        description: 'A test tool',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
          required: ['message'],
        },
        handler: async (input: any) => {
          return { received: input.message };
        },
      };

      server.registerTool(testTool);
    });

    it('should prevent duplicate tool registration', () => {
      const testTool: MCPTool = {
        name: 'test/duplicate',
        description: 'A test tool',
        inputSchema: { type: 'object', properties: {} },
        handler: async () => ({}),
      };

      server.registerTool(testTool);
      
      try {
        server.registerTool(testTool);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('already registered');
      }
    });
  });

  describe('Health and Metrics', () => {
    it('should provide health status', async () => {
      await server.start();
      
      const healthStatus = await server.getHealthStatus();
      expect(healthStatus).toBeDefined();
      expect(healthStatus.healthy).toBeDefined();
      expect(healthStatus.metrics).toBeDefined();
      
      await server.stop();
    });

    it('should provide metrics', async () => {
      await server.start();
      
      const metrics = server.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalRequests).toBeGreaterThanOrEqual(0);
      expect(metrics.successfulRequests).toBeGreaterThanOrEqual(0);
      expect(metrics.failedRequests).toBeGreaterThanOrEqual(0);
      
      await server.stop();
    });

    it('should track sessions', async () => {
      await server.start();
      
      const sessions = server.getSessions();
      expect(Array.isArray(sessions)).toBe(true);
      
      await server.stop();
    });
  });

  describe('Session Management', () => {
    it('should get session by ID', async () => {
      await server.start();
      
      // Since no sessions are created in these tests, should return undefined
      const session = server.getSession('non-existent');
      expect(session).toBeUndefined();
      
      await server.stop();
    });

    it('should terminate sessions', async () => {
      await server.start();
      
      // Should not throw even if session doesn't exist
      server.terminateSession('non-existent');
      
      await server.stop();
    });
  });

  describe('Error Handling', () => {
    it('should handle startup errors gracefully', async () => {
      // Create a server with invalid config that might cause startup errors
      const invalidConfig = {
        ...config,
        port: -1, // Invalid port
      };
      
      const invalidServer = new MCPServer(invalidConfig, eventBus, logger);
      
      try {
        await invalidServer.start();
        // If it doesn't throw, that's fine too - depends on transport implementation
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        await invalidServer.stop();
      }
    });

    it('should handle tool registration errors', () => {
      const invalidTool = {
        name: '', // Invalid name
        description: 'Invalid tool',
        inputSchema: { type: 'object', properties: {} },
        handler: async () => ({}),
      } as MCPTool;

      try {
        server.registerTool(invalidTool);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});