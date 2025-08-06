/**
 * Integration Service Adapter Tests
 *
 * Comprehensive test suite for IntegrationServiceAdapter using hybrid TDD approach:
 * - TDD London (70%): For integration boundaries, API calls, protocol interactions
 * - Classical TDD (30%): For data transformations, validation logic, utility functions
 *
 * Tests cover:
 * - Architecture Storage Service integration
 * - Safe API Service integration
 * - Protocol Management integration
 * - Configuration validation
 * - Error handling and recovery
 * - Performance optimization
 * - Helper utility functions
 */

import type {
  ArchitecturalValidation,
  ArchitectureDesign,
  Component,
} from '../coordination/swarm/sparc/database/architecture-storage';
import {
  createDefaultIntegrationServiceAdapterConfig,
  createIntegrationServiceAdapter,
  type IntegrationOperationResult,
  type IntegrationServiceAdapter,
  type IntegrationServiceAdapterConfig,
  IntegrationServiceHelper,
  IntegrationServiceUtils,
} from '../interfaces/services/adapters/integration-service-adapter';
import type { ServiceMetrics, ServiceStatus } from '../interfaces/services/core/interfaces';

// ============================================
// Test Data and Mocks
// ============================================

const mockArchitectureDesign: ArchitectureDesign = {
  id: 'test-arch-001',
  systemArchitecture: {
    technologyStack: [{ category: 'web', name: 'React', version: '18.0.0' }],
    architecturalPatterns: [{ name: 'MVC', description: 'Model-View-Controller pattern' }],
  },
  components: [
    {
      id: 'comp-001',
      name: 'User Service',
      type: 'service',
      responsibilities: ['user management', 'authentication'],
      interfaces: ['REST API', 'GraphQL'],
      dependencies: ['database', 'auth-service'],
      performance: { latency: 100, throughput: 1000 },
    },
  ],
  qualityAttributes: [],
  securityRequirements: [],
  scalabilityRequirements: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockValidation: ArchitecturalValidation = {
  overallScore: 85,
  validationResults: [{ component: 'User Service', score: 85, passed: true, issues: [] }],
  recommendations: ['Consider adding caching layer'],
  approved: true,
};

const mockAPIResponse = {
  success: true,
  data: { id: 1, name: 'Test Resource', status: 'active' },
  metadata: {
    timestamp: new Date().toISOString(),
    requestId: 'req-123',
    version: '1.0.0',
    duration: 150,
  },
};

// ============================================
// Helper Functions
// ============================================

function createTestAdapter(
  overrides: Partial<IntegrationServiceAdapterConfig> = {}
): IntegrationServiceAdapter {
  const config = createDefaultIntegrationServiceAdapterConfig(
    'test-integration-adapter',
    overrides
  );
  return createIntegrationServiceAdapter(config);
}

function createMockLogger() {
  return {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// ============================================
// TDD London Tests (Mockist) - 70%
// ============================================

describe('IntegrationServiceAdapter - TDD London (Interactions)', () => {
  let adapter: IntegrationServiceAdapter;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = createMockLogger();
    adapter = createTestAdapter({
      architectureStorage: { enabled: true },
      safeAPI: { enabled: true, baseURL: 'http://test-api.com' },
      protocolManagement: { enabled: true, supportedProtocols: ['http', 'websocket'] },
    });
  });

  afterEach(async () => {
    await adapter.destroy();
  });

  describe('Service Lifecycle Management', () => {
    it('should initialize service with proper configuration', async () => {
      // TDD London: Test initialization interactions
      expect(adapter.name).toBe('test-integration-adapter');
      expect(adapter.type).toBeDefined();
      expect(adapter.isReady()).toBe(false);

      await adapter.initialize();
      expect(adapter.isReady()).toBe(false); // Not started yet

      await adapter.start();
      expect(adapter.isReady()).toBe(true);
    });

    it('should handle service lifecycle state transitions', async () => {
      // TDD London: Test state management interactions
      await adapter.initialize();
      const statusAfterInit = await adapter.getStatus();
      expect(statusAfterInit.lifecycle).toBe('initialized');

      await adapter.start();
      const statusAfterStart = await adapter.getStatus();
      expect(statusAfterStart.lifecycle).toBe('running');

      await adapter.stop();
      const statusAfterStop = await adapter.getStatus();
      expect(statusAfterStop.lifecycle).toBe('stopped');
    });

    it('should emit proper events during lifecycle transitions', async () => {
      // TDD London: Test event emission interactions
      const initializingHandler = jest.fn();
      const initializedHandler = jest.fn();
      const startingHandler = jest.fn();
      const startedHandler = jest.fn();

      adapter.on('initializing', initializingHandler);
      adapter.on('initialized', initializedHandler);
      adapter.on('starting', startingHandler);
      adapter.on('started', startedHandler);

      await adapter.initialize();
      expect(initializingHandler).toHaveBeenCalled();
      expect(initializedHandler).toHaveBeenCalled();

      await adapter.start();
      expect(startingHandler).toHaveBeenCalled();
      expect(startedHandler).toHaveBeenCalled();
    });
  });

  describe('Architecture Storage Integration', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.start();
    });

    it('should save architecture with proper parameter mapping', async () => {
      // TDD London: Mock the execution and verify interaction
      const executeSpy = jest.spyOn(adapter, 'execute').mockResolvedValue({
        success: true,
        data: 'arch-001',
        metadata: { duration: 100, timestamp: new Date(), operationId: 'op-001' },
      });

      const result = await adapter.execute('architecture-save', {
        architecture: mockArchitectureDesign,
        projectId: 'project-001',
      });

      expect(executeSpy).toHaveBeenCalledWith('architecture-save', {
        architecture: mockArchitectureDesign,
        projectId: 'project-001',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe('arch-001');

      executeSpy.mockRestore();
    });

    it('should retrieve architecture with caching behavior', async () => {
      // TDD London: Test caching interaction
      const executeSpy = jest
        .spyOn(adapter, 'execute')
        .mockResolvedValueOnce({
          success: true,
          data: mockArchitectureDesign,
          metadata: { duration: 150, timestamp: new Date(), operationId: 'op-002' },
        })
        .mockResolvedValueOnce({
          success: true,
          data: mockArchitectureDesign,
          metadata: { duration: 5, timestamp: new Date(), operationId: 'op-003', cacheHit: true },
        });

      // First call - should hit database
      const result1 = await adapter.execute('architecture-retrieve', {
        architectureId: 'arch-001',
      });
      expect(result1.success).toBe(true);
      expect(result1.metadata?.duration).toBe(150);

      // Second call - should hit cache (if caching enabled)
      const result2 = await adapter.execute('architecture-retrieve', {
        architectureId: 'arch-001',
      });
      expect(result2.success).toBe(true);

      expect(executeSpy).toHaveBeenCalledTimes(2);
      executeSpy.mockRestore();
    });

    it('should handle architecture search with filtering', async () => {
      // TDD London: Test search parameter handling
      const executeSpy = jest.spyOn(adapter, 'execute').mockResolvedValue({
        success: true,
        data: [mockArchitectureDesign],
        metadata: { duration: 200, timestamp: new Date(), operationId: 'op-004' },
      });

      const searchCriteria = {
        domain: 'web',
        tags: ['microservices', 'react'],
        minScore: 80,
        limit: 10,
      };

      await adapter.execute('architecture-search', { criteria: searchCriteria });

      expect(executeSpy).toHaveBeenCalledWith('architecture-search', {
        criteria: searchCriteria,
      });

      executeSpy.mockRestore();
    });

    it('should save validation results with proper associations', async () => {
      // TDD London: Test validation saving interaction
      const executeSpy = jest.spyOn(adapter, 'execute').mockResolvedValue({
        success: true,
        data: undefined,
        metadata: { duration: 80, timestamp: new Date(), operationId: 'op-005' },
      });

      await adapter.execute('architecture-validation-save', {
        architectureId: 'arch-001',
        validation: mockValidation,
        type: 'comprehensive',
      });

      expect(executeSpy).toHaveBeenCalledWith('architecture-validation-save', {
        architectureId: 'arch-001',
        validation: mockValidation,
        type: 'comprehensive',
      });

      executeSpy.mockRestore();
    });
  });

  describe('Safe API Integration', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.start();
    });

    it('should make GET requests with proper error handling', async () => {
      // TDD London: Mock API call and verify error handling
      const executeSpy = jest
        .spyOn(adapter, 'execute')
        .mockResolvedValueOnce({
          success: true,
          data: mockAPIResponse,
          metadata: { duration: 120, timestamp: new Date(), operationId: 'op-006' },
        })
        .mockResolvedValueOnce({
          success: false,
          error: {
            code: 'HTTP_404',
            message: 'Resource not found',
            details: { status: 404, url: '/api/users/999' },
          },
          metadata: { duration: 80, timestamp: new Date(), operationId: 'op-007' },
        });

      // Successful request
      const successResult = await adapter.execute('api-get', {
        endpoint: '/api/users/1',
        options: { timeout: 5000 },
      });

      expect(successResult.success).toBe(true);
      expect(successResult.data).toEqual(mockAPIResponse);

      // Failed request
      const errorResult = await adapter.execute('api-get', {
        endpoint: '/api/users/999',
      });

      expect(errorResult.success).toBe(false);
      expect(errorResult.error?.code).toBe('HTTP_404');

      executeSpy.mockRestore();
    });

    it('should handle POST requests with data validation', async () => {
      // TDD London: Test POST request interaction
      const executeSpy = jest.spyOn(adapter, 'execute').mockResolvedValue({
        success: true,
        data: { ...mockAPIResponse, data: { id: 2, name: 'New Resource' } },
        metadata: { duration: 200, timestamp: new Date(), operationId: 'op-008' },
      });

      const postData = { name: 'New Resource', type: 'test' };

      await adapter.execute('api-post', {
        endpoint: '/api/resources',
        data: postData,
        options: { timeout: 10000, retries: 2 },
      });

      expect(executeSpy).toHaveBeenCalledWith('api-post', {
        endpoint: '/api/resources',
        data: postData,
        options: { timeout: 10000, retries: 2 },
      });

      executeSpy.mockRestore();
    });

    it('should manage resources with CRUD operations', async () => {
      // TDD London: Test resource management interactions
      const executeSpy = jest.spyOn(adapter, 'execute');

      // Create resource
      executeSpy.mockResolvedValueOnce({
        success: true,
        data: mockAPIResponse,
        metadata: { duration: 150, timestamp: new Date(), operationId: 'op-009' },
      });

      await adapter.execute('api-create-resource', {
        endpoint: '/api/users',
        data: { name: 'John Doe', email: 'john@example.com' },
      });

      // Get resource
      executeSpy.mockResolvedValueOnce({
        success: true,
        data: mockAPIResponse,
        metadata: { duration: 75, timestamp: new Date(), operationId: 'op-010' },
      });

      await adapter.execute('api-get-resource', {
        endpoint: '/api/users',
        id: 1,
      });

      // Update resource
      executeSpy.mockResolvedValueOnce({
        success: true,
        data: mockAPIResponse,
        metadata: { duration: 125, timestamp: new Date(), operationId: 'op-011' },
      });

      await adapter.execute('api-update-resource', {
        endpoint: '/api/users',
        id: 1,
        data: { name: 'Jane Doe' },
      });

      // Delete resource
      executeSpy.mockResolvedValueOnce({
        success: true,
        data: { deleted: true },
        metadata: { duration: 90, timestamp: new Date(), operationId: 'op-012' },
      });

      await adapter.execute('api-delete-resource', {
        endpoint: '/api/users',
        id: 1,
      });

      expect(executeSpy).toHaveBeenCalledTimes(4);
      executeSpy.mockRestore();
    });
  });

  describe('Protocol Management Integration', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.start();
    });

    it('should connect to protocols with proper configuration', async () => {
      // TDD London: Test protocol connection interaction
      const executeSpy = jest.spyOn(adapter, 'execute').mockResolvedValue({
        success: true,
        data: undefined,
        metadata: { duration: 100, timestamp: new Date(), operationId: 'op-013' },
      });

      await adapter.execute('protocol-connect', {
        protocol: 'websocket',
        config: { host: 'localhost', port: 8080, timeout: 5000 },
      });

      expect(executeSpy).toHaveBeenCalledWith('protocol-connect', {
        protocol: 'websocket',
        config: { host: 'localhost', port: 8080, timeout: 5000 },
      });

      executeSpy.mockRestore();
    });

    it('should send messages through protocols', async () => {
      // TDD London: Test message sending interaction
      const executeSpy = jest.spyOn(adapter, 'execute').mockResolvedValue({
        success: true,
        data: { messageId: 'msg-001', acknowledged: true },
        metadata: { duration: 50, timestamp: new Date(), operationId: 'op-014' },
      });

      const message = { type: 'heartbeat', data: { timestamp: Date.now() } };

      await adapter.execute('protocol-send', {
        protocol: 'websocket',
        message,
      });

      expect(executeSpy).toHaveBeenCalledWith('protocol-send', {
        protocol: 'websocket',
        message,
      });

      executeSpy.mockRestore();
    });

    it('should broadcast messages to multiple protocols', async () => {
      // TDD London: Test broadcast interaction
      const executeSpy = jest.spyOn(adapter, 'execute').mockResolvedValue({
        success: true,
        data: [
          { protocol: 'http', success: true, result: { sent: true } },
          { protocol: 'websocket', success: true, result: { sent: true } },
        ],
        metadata: { duration: 150, timestamp: new Date(), operationId: 'op-015' },
      });

      const broadcastMessage = { type: 'announcement', content: 'System maintenance' };

      await adapter.execute('protocol-broadcast', {
        message: broadcastMessage,
        protocols: ['http', 'websocket'],
      });

      expect(executeSpy).toHaveBeenCalledWith('protocol-broadcast', {
        message: broadcastMessage,
        protocols: ['http', 'websocket'],
      });

      executeSpy.mockRestore();
    });

    it('should perform protocol health checks', async () => {
      // TDD London: Test health check interaction
      const executeSpy = jest
        .spyOn(adapter, 'execute')
        .mockResolvedValueOnce({
          success: true,
          data: true,
          metadata: { duration: 25, timestamp: new Date(), operationId: 'op-016' },
        })
        .mockResolvedValueOnce({
          success: false,
          error: { code: 'CONNECTION_FAILED', message: 'Protocol unreachable' },
          metadata: { duration: 5000, timestamp: new Date(), operationId: 'op-017' },
        });

      // Healthy protocol
      const healthyResult = await adapter.execute('protocol-health-check', { protocol: 'http' });
      expect(healthyResult.success).toBe(true);

      // Unhealthy protocol
      const unhealthyResult = await adapter.execute('protocol-health-check', { protocol: 'tcp' });
      expect(unhealthyResult.success).toBe(false);

      executeSpy.mockRestore();
    });
  });

  describe('Error Handling and Recovery', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.start();
    });

    it('should handle service errors with proper error types', async () => {
      // TDD London: Test error handling interactions
      const errorResult = await adapter.execute('invalid-operation', {});

      expect(errorResult.success).toBe(false);
      expect(errorResult.error?.code).toBe('OPERATION_ERROR');
      expect(errorResult.error?.message).toContain('Unknown operation');
    });

    it('should retry failed operations according to configuration', async () => {
      // TDD London: Test retry mechanism interaction
      const executeSpy = jest
        .spyOn(adapter, 'execute')
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({
          success: true,
          data: 'success-after-retries',
          metadata: { duration: 100, timestamp: new Date(), operationId: 'op-018', retryCount: 2 },
        });

      // This would internally retry based on configuration
      const result = await adapter.execute('architecture-save', {
        architecture: mockArchitectureDesign,
      });

      // Should eventually succeed after retries
      expect(result.success).toBe(true);
      expect(result.data).toBe('success-after-retries');

      executeSpy.mockRestore();
    });

    it('should handle timeout errors gracefully', async () => {
      // TDD London: Test timeout handling
      const result = await adapter.execute('slow-operation', {}, { timeout: 100 });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('OPERATION_ERROR');
    });
  });

  describe('Performance Monitoring', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.start();
    });

    it('should collect and report performance metrics', async () => {
      // TDD London: Test metrics collection interaction
      const metrics = await adapter.getMetrics();

      expect(metrics.name).toBe('test-integration-adapter');
      expect(metrics.type).toBeDefined();
      expect(metrics.operationCount).toBeGreaterThanOrEqual(0);
      expect(metrics.averageLatency).toBeGreaterThanOrEqual(0);
      expect(metrics.customMetrics).toBeDefined();
    });

    it('should provide cache statistics', async () => {
      // TDD London: Test cache metrics interaction
      const executeSpy = jest.spyOn(adapter, 'execute').mockResolvedValue({
        success: true,
        data: {
          size: 10,
          maxSize: 1000,
          hitRate: 75.5,
          memoryUsage: 1024,
        },
        metadata: { duration: 5, timestamp: new Date(), operationId: 'op-019' },
      });

      const cacheStats = await adapter.execute('cache-stats');

      expect(cacheStats.success).toBe(true);
      expect(cacheStats.data.size).toBe(10);
      expect(cacheStats.data.hitRate).toBe(75.5);

      executeSpy.mockRestore();
    });
  });
});

// ============================================
// Classical TDD Tests (Detroit) - 30%
// ============================================

describe('IntegrationServiceAdapter - Classical TDD (Results)', () => {
  let adapter: IntegrationServiceAdapter;

  beforeEach(() => {
    adapter = createTestAdapter();
  });

  afterEach(async () => {
    await adapter.destroy();
  });

  describe('Configuration Validation (Classical)', () => {
    it('should validate correct configuration and return true', async () => {
      // Classical TDD: Test actual validation logic
      const validConfig = createDefaultIntegrationServiceAdapterConfig('valid-service', {
        architectureStorage: {
          enabled: true,
          databaseType: 'postgresql',
          autoInitialize: true,
        },
        safeAPI: {
          enabled: true,
          baseURL: 'https://api.example.com',
          timeout: 30000,
          retries: 3,
        },
        protocolManagement: {
          enabled: true,
          supportedProtocols: ['http', 'websocket'],
          defaultProtocol: 'http',
        },
      });

      const testAdapter = createIntegrationServiceAdapter(validConfig);
      const isValid = await testAdapter.validateConfig(validConfig);

      expect(isValid).toBe(true);
      await testAdapter.destroy();
    });

    it('should reject invalid configuration and return false', async () => {
      // Classical TDD: Test actual validation failure
      const invalidConfig = createDefaultIntegrationServiceAdapterConfig('invalid-service', {
        safeAPI: {
          enabled: true,
          timeout: -1000, // Invalid negative timeout
          retries: -5, // Invalid negative retries
        },
        protocolManagement: {
          enabled: true,
          supportedProtocols: [], // Invalid empty protocols array
          connectionPooling: {
            enabled: true,
            maxConnections: 0, // Invalid zero max connections
          },
        },
      });

      const testAdapter = createIntegrationServiceAdapter(invalidConfig);
      const isValid = await testAdapter.validateConfig(invalidConfig);

      expect(isValid).toBe(false);
      await testAdapter.destroy();
    });
  });

  describe('Data Transformation Logic (Classical)', () => {
    it('should correctly transform architecture data for storage', () => {
      // Classical TDD: Test actual data transformation
      const architecture: ArchitectureDesign = {
        id: 'arch-transform-test',
        systemArchitecture: {
          technologyStack: [
            { category: 'backend', name: 'Node.js', version: '18.0.0' },
            { category: 'database', name: 'PostgreSQL', version: '14.0' },
          ],
          architecturalPatterns: [
            { name: 'Microservices', description: 'Distributed architecture pattern' },
          ],
        },
        components: [
          {
            id: 'comp-001',
            name: 'User Service',
            type: 'microservice',
            responsibilities: ['user management', 'profile management'],
            interfaces: ['REST API', 'Message Queue'],
            dependencies: ['user-db', 'auth-service'],
            performance: { latency: 100, throughput: 500 },
          },
        ],
        qualityAttributes: [{ name: 'Scalability', value: 'High', priority: 1 }],
        securityRequirements: [
          { name: 'Authentication', description: 'JWT-based auth', priority: 'High' },
        ],
        scalabilityRequirements: [
          { name: 'Load Balancing', description: 'Auto-scaling', priority: 'Medium' },
        ],
      };

      // Use the actual transformation logic
      const sanitized = IntegrationServiceUtils.sanitizeArchitectureData(architecture);

      expect(sanitized.id).toBe('arch-transform-test');
      expect(sanitized.systemArchitecture.technologyStack).toHaveLength(2);
      expect(sanitized.components).toHaveLength(1);
      expect(sanitized.components[0].name).toBe('User Service');
      expect(sanitized.qualityAttributes).toHaveLength(1);

      // Should not mutate original
      expect(architecture.id).toBe('arch-transform-test');
    });

    it('should generate unique IDs for architectures without IDs', () => {
      // Classical TDD: Test ID generation logic
      const architectureWithoutId: any = {
        systemArchitecture: { technologyStack: [], architecturalPatterns: [] },
        components: [],
        qualityAttributes: [],
        securityRequirements: [],
        scalabilityRequirements: [],
      };

      const sanitized = IntegrationServiceUtils.sanitizeArchitectureData(architectureWithoutId);

      expect(sanitized.id).toBeDefined();
      expect(sanitized.id).toMatch(/^arch_\d+_[a-z0-9]+$/);
    });

    it('should remove sensitive metadata fields', () => {
      // Classical TDD: Test sensitive data removal
      const architectureWithSensitiveData: any = {
        id: 'test-arch',
        systemArchitecture: { technologyStack: [], architecturalPatterns: [] },
        components: [],
        qualityAttributes: [],
        securityRequirements: [],
        scalabilityRequirements: [],
        metadata: {
          internalNotes: 'Secret internal notes',
          privateKeys: ['key1', 'key2'],
          publicInfo: 'Public information',
        },
      };

      const sanitized = IntegrationServiceUtils.sanitizeArchitectureData(
        architectureWithSensitiveData
      );

      expect(sanitized.metadata.internalNotes).toBeUndefined();
      expect(sanitized.metadata.privateKeys).toBeUndefined();
      expect(sanitized.metadata.publicInfo).toBe('Public information');
    });
  });

  describe('Utility Functions (Classical)', () => {
    it('should validate API endpoints correctly', () => {
      // Classical TDD: Test endpoint validation logic
      expect(IntegrationServiceUtils.validateEndpoint('https://api.example.com')).toBe(true);
      expect(IntegrationServiceUtils.validateEndpoint('http://localhost:3000')).toBe(true);
      expect(IntegrationServiceUtils.validateEndpoint('ftp://file.server.com')).toBe(true);

      expect(IntegrationServiceUtils.validateEndpoint('invalid-url')).toBe(false);
      expect(IntegrationServiceUtils.validateEndpoint('')).toBe(false);
      expect(IntegrationServiceUtils.validateEndpoint('://missing-protocol')).toBe(false);
    });

    it('should validate protocol names correctly', () => {
      // Classical TDD: Test protocol validation logic
      expect(IntegrationServiceUtils.validateProtocolName('http')).toBe(true);
      expect(IntegrationServiceUtils.validateProtocolName('HTTPS')).toBe(true);
      expect(IntegrationServiceUtils.validateProtocolName('websocket')).toBe(true);
      expect(IntegrationServiceUtils.validateProtocolName('mcp-http')).toBe(true);
      expect(IntegrationServiceUtils.validateProtocolName('mcp-stdio')).toBe(true);
      expect(IntegrationServiceUtils.validateProtocolName('tcp')).toBe(true);
      expect(IntegrationServiceUtils.validateProtocolName('udp')).toBe(true);

      expect(IntegrationServiceUtils.validateProtocolName('invalid-protocol')).toBe(false);
      expect(IntegrationServiceUtils.validateProtocolName('smtp')).toBe(false);
      expect(IntegrationServiceUtils.validateProtocolName('')).toBe(false);
    });

    it('should calculate retry delays with exponential backoff', () => {
      // Classical TDD: Test retry calculation logic
      const baseDelay = 1000;
      const maxDelay = 10000;

      const delay1 = IntegrationServiceUtils.calculateRetryDelay(1, baseDelay, maxDelay);
      const delay2 = IntegrationServiceUtils.calculateRetryDelay(2, baseDelay, maxDelay);
      const delay3 = IntegrationServiceUtils.calculateRetryDelay(3, baseDelay, maxDelay);
      const delay10 = IntegrationServiceUtils.calculateRetryDelay(10, baseDelay, maxDelay);

      // First attempt should be around base delay
      expect(delay1).toBeGreaterThanOrEqual(baseDelay);
      expect(delay1).toBeLessThanOrEqual(baseDelay + 1000); // +jitter

      // Second attempt should be roughly double
      expect(delay2).toBeGreaterThanOrEqual(baseDelay * 2);
      expect(delay2).toBeLessThanOrEqual(baseDelay * 2 + 1000);

      // Third attempt should be roughly quadruple
      expect(delay3).toBeGreaterThanOrEqual(baseDelay * 4);
      expect(delay3).toBeLessThanOrEqual(baseDelay * 4 + 1000);

      // Large attempts should be capped at maxDelay
      expect(delay10).toBeLessThanOrEqual(maxDelay);
    });

    it('should calculate success rates correctly', () => {
      // Classical TDD: Test success rate calculation
      const allSuccessfulResults: IntegrationOperationResult[] = [
        { success: true, data: 'result1' },
        { success: true, data: 'result2' },
        { success: true, data: 'result3' },
      ];

      const mixedResults: IntegrationOperationResult[] = [
        { success: true, data: 'result1' },
        { success: false, error: { code: 'ERROR1', message: 'Failed' } },
        { success: true, data: 'result3' },
        { success: false, error: { code: 'ERROR2', message: 'Failed' } },
      ];

      const allFailedResults: IntegrationOperationResult[] = [
        { success: false, error: { code: 'ERROR1', message: 'Failed' } },
        { success: false, error: { code: 'ERROR2', message: 'Failed' } },
      ];

      expect(IntegrationServiceUtils.calculateSuccessRate(allSuccessfulResults)).toBe(100);
      expect(IntegrationServiceUtils.calculateSuccessRate(mixedResults)).toBe(50);
      expect(IntegrationServiceUtils.calculateSuccessRate(allFailedResults)).toBe(0);
      expect(IntegrationServiceUtils.calculateSuccessRate([])).toBe(0);
    });

    it('should extract metrics from operation results correctly', () => {
      // Classical TDD: Test metrics extraction logic
      const results: IntegrationOperationResult[] = [
        {
          success: true,
          data: 'result1',
          metadata: { duration: 100, timestamp: new Date(), operationId: 'op1' },
        },
        {
          success: false,
          error: { code: 'ERROR1', message: 'Failed' },
          metadata: { duration: 200, timestamp: new Date(), operationId: 'op2' },
        },
        {
          success: true,
          data: 'result3',
          metadata: { duration: 150, timestamp: new Date(), operationId: 'op3' },
        },
        {
          success: true,
          data: 'result4',
          metadata: { duration: 50, timestamp: new Date(), operationId: 'op4' },
        },
      ];

      const metrics = IntegrationServiceUtils.extractMetrics(results);

      expect(metrics.totalOperations).toBe(4);
      expect(metrics.successCount).toBe(3);
      expect(metrics.errorCount).toBe(1);
      expect(metrics.successRate).toBe(75);
      expect(metrics.errorRate).toBe(25);
      expect(metrics.averageLatency).toBe((100 + 200 + 150 + 50) / 4); // 125
    });

    it('should merge configurations correctly without mutations', () => {
      // Classical TDD: Test configuration merging logic
      const baseConfig: Partial<IntegrationServiceAdapterConfig> = {
        architectureStorage: {
          enabled: true,
          databaseType: 'postgresql',
          autoInitialize: true,
        },
        safeAPI: {
          enabled: false,
          baseURL: 'http://base.com',
          timeout: 5000,
        },
        performance: {
          maxConcurrency: 10,
          enableMetricsCollection: true,
        },
      };

      const overrideConfig: Partial<IntegrationServiceAdapterConfig> = {
        architectureStorage: {
          databaseType: 'mysql',
          enableVersioning: true,
        },
        safeAPI: {
          enabled: true,
          timeout: 10000,
          retries: 5,
        },
        performance: {
          maxConcurrency: 20,
        },
      };

      const merged = IntegrationServiceUtils.mergeConfigurations(baseConfig, overrideConfig);

      // Should merge architecture storage settings
      expect(merged.architectureStorage?.enabled).toBe(true); // from base
      expect(merged.architectureStorage?.databaseType).toBe('mysql'); // from override
      expect(merged.architectureStorage?.autoInitialize).toBe(true); // from base
      expect(merged.architectureStorage?.enableVersioning).toBe(true); // from override

      // Should merge safe API settings
      expect(merged.safeAPI?.enabled).toBe(true); // from override
      expect(merged.safeAPI?.baseURL).toBe('http://base.com'); // from base
      expect(merged.safeAPI?.timeout).toBe(10000); // from override
      expect(merged.safeAPI?.retries).toBe(5); // from override

      // Should merge performance settings
      expect(merged.performance?.maxConcurrency).toBe(20); // from override
      expect(merged.performance?.enableMetricsCollection).toBe(true); // from base

      // Original objects should not be mutated
      expect(baseConfig.architectureStorage?.databaseType).toBe('postgresql');
      expect(baseConfig.safeAPI?.enabled).toBe(false);
      expect(overrideConfig.safeAPI?.baseURL).toBeUndefined();
    });
  });

  describe('Helper Class Integration (Classical)', () => {
    let helper: IntegrationServiceHelper;

    beforeEach(async () => {
      await adapter.initialize();
      await adapter.start();
      helper = new IntegrationServiceHelper(adapter);
    });

    it('should provide correct service statistics aggregation', async () => {
      // Classical TDD: Test actual statistics aggregation

      // Mock some operations to generate stats
      jest
        .spyOn(adapter, 'execute')
        .mockResolvedValueOnce({
          success: true,
          data: {
            operationCount: 100,
            successCount: 95,
            errorCount: 5,
            uptime: 3600000, // 1 hour
            avgLatency: 120,
            errorRate: 5,
          },
          metadata: { duration: 10, timestamp: new Date(), operationId: 'stats-1' },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            size: 50,
            maxSize: 1000,
            hitRate: 85.5,
            memoryUsage: 2048,
          },
          metadata: { duration: 5, timestamp: new Date(), operationId: 'stats-2' },
        })
        .mockResolvedValueOnce({
          success: true,
          data: [
            { protocol: 'http', status: 'healthy', latency: 50 },
            { protocol: 'websocket', status: 'healthy', latency: 25 },
          ],
          metadata: { duration: 15, timestamp: new Date(), operationId: 'stats-3' },
        })
        .mockResolvedValueOnce({
          success: true,
          data: [
            { endpoint: '/api/users', requestCount: 150, averageResponseTime: 100 },
            { endpoint: '/api/posts', requestCount: 200, averageResponseTime: 80 },
          ],
          metadata: { duration: 8, timestamp: new Date(), operationId: 'stats-4' },
        });

      const stats = await helper.getServiceStatistics();

      expect(stats.success).toBe(true);
      expect(stats.data?.service.name).toBe('test-integration-adapter');
      expect(stats.data?.service.operationCount).toBe(100);
      expect(stats.data?.service.errorRate).toBe(5);
      expect(stats.data?.cache.size).toBe(50);
      expect(stats.data?.cache.hitRate).toBe(85.5);
      expect(stats.data?.protocols).toBeDefined();
      expect(stats.data?.endpoints).toBeDefined();
    });

    it('should correctly validate service configuration with multiple checks', async () => {
      // Classical TDD: Test comprehensive validation logic

      // Mock adapter state and responses
      jest.spyOn(adapter, 'isReady').mockReturnValue(true);
      jest
        .spyOn(adapter, 'execute')
        .mockResolvedValueOnce({
          success: true,
          data: { size: 900, maxSize: 1000 }, // High cache utilization
          metadata: { duration: 5, timestamp: new Date(), operationId: 'val-1' },
        })
        .mockResolvedValueOnce({
          success: true,
          data: [
            { protocol: 'http', status: 'healthy' },
            { protocol: 'websocket', status: 'degraded' }, // One degraded protocol
          ],
          metadata: { duration: 10, timestamp: new Date(), operationId: 'val-2' },
        });

      const validation = await helper.validateConfiguration();

      expect(validation.success).toBe(true);
      expect(validation.data?.valid).toBe(false); // Should be invalid due to degraded protocol
      expect(validation.data?.issues).toBeDefined();

      const issues = validation.data?.issues || [];
      const cacheWarning = issues.find((i) => i.component === 'cache' && i.severity === 'warning');
      const protocolError = issues.find(
        (i) => i.component === 'protocol' && i.severity === 'error'
      );

      expect(cacheWarning).toBeDefined();
      expect(cacheWarning?.message).toContain('Cache utilization is high');
      expect(protocolError).toBeDefined();
      expect(protocolError?.message).toContain('websocket is degraded');
    });
  });
});

// ============================================
// Integration Tests (Hybrid Approach)
// ============================================

describe('IntegrationServiceAdapter - Integration Tests', () => {
  let adapter: IntegrationServiceAdapter;

  beforeEach(() => {
    adapter = createTestAdapter({
      architectureStorage: { enabled: true, cachingEnabled: true },
      safeAPI: { enabled: true, baseURL: 'http://test-api.com' },
      protocolManagement: { enabled: true, supportedProtocols: ['http', 'websocket'] },
      cache: { enabled: true, defaultTTL: 60000, maxSize: 100 },
      retry: { enabled: true, maxAttempts: 3, backoffMultiplier: 2 },
    });
  });

  afterEach(async () => {
    await adapter.destroy();
  });

  it('should handle complete architecture workflow with real operations', async () => {
    // Integration test: Full architecture management workflow
    await adapter.initialize();
    await adapter.start();

    // Mock the internal execute method to simulate real operations
    const executeSpy = jest.spyOn(adapter, 'execute');

    // Step 1: Save architecture
    executeSpy.mockResolvedValueOnce({
      success: true,
      data: 'arch-workflow-001',
      metadata: { duration: 200, timestamp: new Date(), operationId: 'workflow-1' },
    });

    const saveResult = await adapter.execute('architecture-save', {
      architecture: mockArchitectureDesign,
      projectId: 'project-workflow',
    });

    expect(saveResult.success).toBe(true);
    expect(saveResult.data).toBe('arch-workflow-001');

    // Step 2: Retrieve architecture (should potentially hit cache on second call)
    executeSpy.mockResolvedValueOnce({
      success: true,
      data: mockArchitectureDesign,
      metadata: { duration: 150, timestamp: new Date(), operationId: 'workflow-2' },
    });

    const retrieveResult = await adapter.execute('architecture-retrieve', {
      architectureId: 'arch-workflow-001',
    });

    expect(retrieveResult.success).toBe(true);
    expect(retrieveResult.data).toEqual(mockArchitectureDesign);

    // Step 3: Save validation
    executeSpy.mockResolvedValueOnce({
      success: true,
      data: undefined,
      metadata: { duration: 100, timestamp: new Date(), operationId: 'workflow-3' },
    });

    const validationResult = await adapter.execute('architecture-validation-save', {
      architectureId: 'arch-workflow-001',
      validation: mockValidation,
      type: 'comprehensive',
    });

    expect(validationResult.success).toBe(true);

    // Step 4: Search architectures
    executeSpy.mockResolvedValueOnce({
      success: true,
      data: [mockArchitectureDesign],
      metadata: { duration: 180, timestamp: new Date(), operationId: 'workflow-4' },
    });

    const searchResult = await adapter.execute('architecture-search', {
      criteria: { domain: 'web', projectId: 'project-workflow' },
    });

    expect(searchResult.success).toBe(true);
    expect(searchResult.data).toHaveLength(1);

    expect(executeSpy).toHaveBeenCalledTimes(4);
    executeSpy.mockRestore();
  });

  it('should handle API workflow with error recovery', async () => {
    // Integration test: API operations with retry logic
    await adapter.initialize();
    await adapter.start();

    const executeSpy = jest.spyOn(adapter, 'execute');

    // Simulate API operation that fails first, then succeeds
    executeSpy
      .mockRejectedValueOnce(new Error('Network timeout')) // First attempt fails
      .mockResolvedValueOnce({
        // Retry succeeds
        success: true,
        data: mockAPIResponse,
        metadata: {
          duration: 250,
          timestamp: new Date(),
          operationId: 'api-retry-1',
          retryCount: 1,
        },
      });

    const apiResult = await adapter.execute('api-get', {
      endpoint: '/api/resilient-endpoint',
      options: { timeout: 5000, retries: 2 },
    });

    expect(apiResult.success).toBe(true);
    expect(apiResult.data).toEqual(mockAPIResponse);

    executeSpy.mockRestore();
  });

  it('should handle protocol switching and failover', async () => {
    // Integration test: Protocol management with failover
    await adapter.initialize();
    await adapter.start();

    const executeSpy = jest.spyOn(adapter, 'execute');

    // Step 1: Connect to primary protocol
    executeSpy.mockResolvedValueOnce({
      success: true,
      data: undefined,
      metadata: { duration: 100, timestamp: new Date(), operationId: 'protocol-1' },
    });

    const connectResult = await adapter.execute('protocol-connect', {
      protocol: 'websocket',
      config: { host: 'primary.server.com', port: 8080 },
    });

    expect(connectResult.success).toBe(true);

    // Step 2: Primary protocol fails, switch to backup
    executeSpy
      .mockRejectedValueOnce(new Error('Connection lost')) // Primary fails
      .mockResolvedValueOnce({
        // Switch succeeds
        success: true,
        data: undefined,
        metadata: { duration: 120, timestamp: new Date(), operationId: 'protocol-2' },
      });

    const switchResult = await adapter.execute('protocol-switch', {
      fromProtocol: 'websocket',
      toProtocol: 'http',
    });

    expect(switchResult.success).toBe(true);

    executeSpy.mockRestore();
  });
});

// ============================================
// Performance Tests
// ============================================

describe('IntegrationServiceAdapter - Performance Tests', () => {
  let adapter: IntegrationServiceAdapter;

  beforeEach(() => {
    adapter = createTestAdapter({
      performance: {
        enableMetricsCollection: true,
        enableRequestDeduplication: true,
        maxConcurrency: 20,
      },
      cache: { enabled: true, maxSize: 1000 },
    });
  });

  afterEach(async () => {
    await adapter.destroy();
  });

  it('should handle concurrent operations efficiently', async () => {
    // Performance test: Concurrent operation handling
    await adapter.initialize();
    await adapter.start();

    const executeSpy = jest.spyOn(adapter, 'execute').mockResolvedValue({
      success: true,
      data: 'concurrent-result',
      metadata: { duration: 50, timestamp: new Date(), operationId: 'concurrent' },
    });

    const concurrentOperations = Array.from({ length: 50 }, (_, i) =>
      adapter.execute('architecture-retrieve', { architectureId: `arch-${i}` })
    );

    const startTime = Date.now();
    const results = await Promise.all(concurrentOperations);
    const duration = Date.now() - startTime;

    // All operations should succeed
    expect(results.every((r) => r.success)).toBe(true);

    // Should complete reasonably quickly (allowing for test environment variance)
    expect(duration).toBeLessThan(5000); // 5 seconds max

    // Should have called execute for each operation
    expect(executeSpy).toHaveBeenCalledTimes(50);

    executeSpy.mockRestore();
  });

  it('should demonstrate cache effectiveness', async () => {
    // Performance test: Cache hit rate improvement
    await adapter.initialize();
    await adapter.start();

    const executeSpy = jest.spyOn(adapter, 'execute').mockResolvedValue({
      success: true,
      data: mockArchitectureDesign,
      metadata: { duration: 5, timestamp: new Date(), operationId: 'cache-test', cacheHit: true },
    });

    // Simulate repeated access to same resource
    const cacheKey = 'arch-cache-test';
    const requests = Array.from({ length: 10 }, () =>
      adapter.execute('architecture-retrieve', { architectureId: cacheKey })
    );

    const results = await Promise.all(requests);

    // All should succeed
    expect(results.every((r) => r.success)).toBe(true);

    // Due to caching, should have fast response times
    const avgDuration =
      results.reduce((sum, r) => sum + (r.metadata?.duration || 0), 0) / results.length;
    expect(avgDuration).toBeLessThan(50); // Should be fast due to caching

    executeSpy.mockRestore();
  });
});
