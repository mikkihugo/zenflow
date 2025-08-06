/**
 * Data Service Adapter Test Suite
 *
 * Comprehensive test coverage for DataServiceAdapter following hybrid TDD approach:
 * - 70% London TDD (Mockist) for integration boundaries and service interactions
 * - 30% Classical TDD (Detroit) for business logic and data transformations
 *
 * Tests cover adapter functionality, service integration, error handling,
 * performance metrics, caching, retry logic, and helper functions.
 */

import { jest } from '@jest/globals';
import { WebDataService } from '../../../web/web-data-service';
import { ServiceType } from '../../types';
import {
  createDefaultDataServiceAdapterConfig,
  DataServiceAdapter,
  type DataServiceAdapterConfig,
} from '../data-service-adapter';
import { DataServiceFactory } from '../data-service-factory';
import { DataServiceHelper, DataServiceUtils } from '../data-service-helpers';

// Mock external dependencies
jest.mock('../../../web/web-data-service');
jest.mock('../../../../database/managers/document-manager');
jest.mock('../../../../utils/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

const MockedWebDataService = WebDataService as jest.MockedClass<typeof WebDataService>;
const MockedDocumentService = DocumentService as jest.MockedClass<typeof DocumentService>;

describe('DataServiceAdapter', () => {
  let adapter: DataServiceAdapter;
  let config: DataServiceAdapterConfig;
  let mockWebDataService: jest.Mocked<WebDataService>;
  let mockDocumentService: jest.Mocked<DocumentService>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create test configuration
    config = createDefaultDataServiceAdapterConfig('test-adapter', {
      webData: {
        enabled: true,
        mockData: true,
        cacheResponses: true,
        cacheTTL: 60000,
      },
      documentData: {
        enabled: true,
        databaseType: 'postgresql',
        autoInitialize: true,
      },
      cache: {
        enabled: true,
        strategy: 'memory',
        defaultTTL: 60000,
        maxSize: 100,
      },
      retry: {
        enabled: true,
        maxAttempts: 3,
        backoffMultiplier: 2,
        retryableOperations: ['system-status', 'document-get'],
      },
    });

    // Set up WebDataService mock
    mockWebDataService = {
      getSystemStatus: jest.fn(),
      getSwarms: jest.fn(),
      createSwarm: jest.fn(),
      getTasks: jest.fn(),
      createTask: jest.fn(),
      getDocuments: jest.fn(),
      executeCommand: jest.fn(),
      getServiceStats: jest.fn(),
    } as any;

    // Set up DocumentService mock
    mockDocumentService = {
      initialize: jest.fn(),
      createDocument: jest.fn(),
      getDocument: jest.fn(),
      updateDocument: jest.fn(),
      deleteDocument: jest.fn(),
      queryDocuments: jest.fn(),
      searchDocuments: jest.fn(),
      createProject: jest.fn(),
      getProjectWithDocuments: jest.fn(),
    } as any;

    MockedWebDataService.mockImplementation(() => mockWebDataService);
    MockedDocumentService.mockImplementation(() => mockDocumentService);

    adapter = new DataServiceAdapter(config);
  });

  afterEach(async () => {
    if (adapter?.isReady()) {
      await adapter.stop();
      await adapter.destroy();
    }
  });

  // ============================================
  // London TDD Tests (Service Interactions)
  // ============================================

  describe('Service Lifecycle (London TDD)', () => {
    it('should initialize with both services when both are enabled', async () => {
      // Arrange
      mockDocumentService.initialize.mockResolvedValue();

      // Act
      await adapter.initialize();

      // Assert - verify interactions
      expect(MockedWebDataService).toHaveBeenCalledTimes(1);
      expect(MockedDocumentService).toHaveBeenCalledWith('postgresql');
      expect(mockDocumentService.initialize).toHaveBeenCalledTimes(1);
    });

    it('should initialize only WebDataService when DocumentService is disabled', async () => {
      // Arrange
      config.documentData!.enabled = false;
      adapter = new DataServiceAdapter(config);

      // Act
      await adapter.initialize();

      // Assert - verify interactions
      expect(MockedWebDataService).toHaveBeenCalledTimes(1);
      expect(MockedDocumentService).not.toHaveBeenCalled();
    });

    it('should start service after successful initialization', async () => {
      // Arrange
      mockDocumentService.initialize.mockResolvedValue();
      await adapter.initialize();

      // Act
      await adapter.start();

      // Assert - verify state changes
      expect(adapter.isReady()).toBe(true);
    });

    it('should throw error when starting without initialization', async () => {
      // Act & Assert
      await expect(adapter.start()).rejects.toThrow('Cannot start service in uninitialized state');
    });

    it('should stop and destroy service gracefully', async () => {
      // Arrange
      mockDocumentService.initialize.mockResolvedValue();
      await adapter.initialize();
      await adapter.start();

      // Act
      await adapter.stop();
      await adapter.destroy();

      // Assert
      expect(adapter.isReady()).toBe(false);
    });
  });

  describe('WebDataService Integration (London TDD)', () => {
    beforeEach(async () => {
      mockDocumentService.initialize.mockResolvedValue();
      await adapter.initialize();
      await adapter.start();
    });

    it('should delegate system status calls to WebDataService', async () => {
      // Arrange
      const mockStatus = {
        system: 'healthy',
        version: '1.0.0',
        swarms: { active: 2, total: 5 },
        tasks: { pending: 3, active: 1, completed: 12 },
        resources: { cpu: '45%', memory: '67%', disk: '23%' },
        uptime: '120m',
      };
      mockWebDataService.getSystemStatus.mockResolvedValue(mockStatus);

      // Act
      const response = await adapter.execute('system-status');

      // Assert - verify interaction and response
      expect(mockWebDataService.getSystemStatus).toHaveBeenCalledTimes(1);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockStatus);
    });

    it('should delegate swarm operations to WebDataService', async () => {
      // Arrange
      const mockSwarms = [
        { id: 'swarm-1', name: 'Test Swarm', status: 'active', agents: 4, tasks: 8, progress: 75 },
      ];
      mockWebDataService.getSwarms.mockResolvedValue(mockSwarms);

      // Act
      const response = await adapter.execute('swarms');

      // Assert
      expect(mockWebDataService.getSwarms).toHaveBeenCalledTimes(1);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockSwarms);
    });

    it('should handle WebDataService errors gracefully', async () => {
      // Arrange
      const error = new Error('WebDataService connection failed');
      mockWebDataService.getSystemStatus.mockRejectedValue(error);

      // Act
      const response = await adapter.execute('system-status');

      // Assert
      expect(response.success).toBe(false);
      expect(response.error?.message).toBe('WebDataService connection failed');
    });
  });

  describe('DocumentService Integration (London TDD)', () => {
    beforeEach(async () => {
      mockDocumentService.initialize.mockResolvedValue();
      await adapter.initialize();
      await adapter.start();
    });

    it('should delegate document creation to DocumentService', async () => {
      // Arrange
      const mockDocument = { id: 'doc-1', title: 'Test Doc', content: 'Content' };
      const createdDocument = { ...mockDocument, created_at: new Date(), updated_at: new Date() };
      mockDocumentService.createDocument.mockResolvedValue(createdDocument as any);

      // Act
      const response = await adapter.execute('document-create', { document: mockDocument });

      // Assert
      expect(mockDocumentService.createDocument).toHaveBeenCalledWith(mockDocument, undefined);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(createdDocument);
    });

    it('should delegate document search to DocumentService', async () => {
      // Arrange
      const searchOptions = {
        searchType: 'fulltext' as const,
        query: 'test query',
        limit: 10,
      };
      const mockResults = {
        documents: [{ id: 'doc-1', title: 'Found Doc' }],
        total: 1,
        hasMore: false,
        searchMetadata: { searchType: 'fulltext', query: 'test query', processingTime: 50 },
      };
      mockDocumentService.searchDocuments.mockResolvedValue(mockResults as any);

      // Act
      const response = await adapter.execute('document-search', { searchOptions });

      // Assert
      expect(mockDocumentService.searchDocuments).toHaveBeenCalledWith(searchOptions);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockResults);
    });
  });

  describe('Error Handling and Retry Logic (London TDD)', () => {
    beforeEach(async () => {
      mockDocumentService.initialize.mockResolvedValue();
      await adapter.initialize();
      await adapter.start();
    });

    it('should retry failed operations according to configuration', async () => {
      // Arrange
      mockWebDataService.getSystemStatus
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Another failure'))
        .mockResolvedValue({ system: 'healthy', version: '1.0.0' } as any);

      // Act
      const response = await adapter.execute('system-status');

      // Assert - verify retry attempts
      expect(mockWebDataService.getSystemStatus).toHaveBeenCalledTimes(3);
      expect(response.success).toBe(true);
    });

    it('should not retry non-retryable operations', async () => {
      // Arrange
      mockWebDataService.createSwarm.mockRejectedValue(new Error('Creation failed'));

      // Act
      const response = await adapter.execute('create-swarm', { name: 'Test Swarm' });

      // Assert - no retries for non-retryable operations
      expect(mockWebDataService.createSwarm).toHaveBeenCalledTimes(1);
      expect(response.success).toBe(false);
    });

    it('should fail after max retry attempts', async () => {
      // Arrange
      const error = new Error('Persistent failure');
      mockWebDataService.getSystemStatus.mockRejectedValue(error);

      // Act
      const response = await adapter.execute('system-status');

      // Assert
      expect(mockWebDataService.getSystemStatus).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(response.success).toBe(false);
      expect(response.error?.message).toBe('Persistent failure');
    });
  });

  describe('Service Dependencies (London TDD)', () => {
    it('should check dependencies during health checks', async () => {
      // Arrange
      mockDocumentService.initialize.mockResolvedValue();
      mockWebDataService.getServiceStats.mockReturnValue({
        requestsServed: 100,
        averageResponseTime: 150,
        cacheHitRate: 0.85,
      });

      await adapter.initialize();
      await adapter.start();

      // Act
      const isHealthy = await adapter.healthCheck();

      // Assert
      expect(isHealthy).toBe(true);
      expect(mockWebDataService.getServiceStats).toHaveBeenCalled();
    });

    it('should fail health check when dependencies are unhealthy', async () => {
      // Arrange
      mockDocumentService.initialize.mockResolvedValue();
      mockWebDataService.getServiceStats.mockReturnValue({
        requestsServed: 100,
        averageResponseTime: 15000, // Exceeds threshold
        cacheHitRate: 0.85,
      });

      await adapter.initialize();
      await adapter.start();

      // Act
      const isHealthy = await adapter.healthCheck();

      // Assert
      expect(isHealthy).toBe(false);
    });
  });

  // ============================================
  // Classical TDD Tests (Business Logic)
  // ============================================

  describe('Configuration Validation (Classical TDD)', () => {
    it('should validate correct configuration', async () => {
      // Act
      const isValid = await adapter.validateConfig(config);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should reject configuration with missing required fields', async () => {
      // Arrange
      const invalidConfig = { ...config };
      delete (invalidConfig as any).name;

      // Act
      const isValid = await adapter.validateConfig(invalidConfig);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should reject configuration with invalid database type', async () => {
      // Arrange
      const invalidConfig = {
        ...config,
        documentData: {
          ...config.documentData!,
          databaseType: 'invalid-db' as any,
        },
      };

      // Act
      const isValid = await adapter.validateConfig(invalidConfig);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should reject configuration with invalid performance settings', async () => {
      // Arrange
      const invalidConfig = {
        ...config,
        performance: {
          ...config.performance!,
          maxConcurrency: 0, // Invalid value
        },
      };

      // Act
      const isValid = await adapter.validateConfig(invalidConfig);

      // Assert
      expect(isValid).toBe(false);
    });
  });

  describe('Cache Operations (Classical TDD)', () => {
    beforeEach(async () => {
      mockDocumentService.initialize.mockResolvedValue();
      await adapter.initialize();
      await adapter.start();
    });

    it('should cache successful operation results', async () => {
      // Arrange
      const mockStatus = { system: 'healthy', version: '1.0.0' };
      mockWebDataService.getSystemStatus.mockResolvedValue(mockStatus as any);

      // Act - First call
      const response1 = await adapter.execute('system-status');
      // Second call should use cache
      const response2 = await adapter.execute('system-status');

      // Assert
      expect(mockWebDataService.getSystemStatus).toHaveBeenCalledTimes(1); // Only first call hits service
      expect(response1.success).toBe(true);
      expect(response2.success).toBe(true);
      expect(response1.data).toEqual(response2.data);
    });

    it('should return cache statistics', async () => {
      // Act
      const response = await adapter.execute('cache-stats');

      // Assert
      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('size');
      expect(response.data).toHaveProperty('maxSize');
      expect(response.data).toHaveProperty('hitRate');
      expect(response.data).toHaveProperty('memoryUsage');
    });

    it('should clear cache when requested', async () => {
      // Arrange - Add some data to cache first
      mockWebDataService.getSystemStatus.mockResolvedValue({ system: 'healthy' } as any);
      await adapter.execute('system-status');

      // Act
      const response = await adapter.execute('clear-cache');

      // Assert
      expect(response.success).toBe(true);
      expect(response.data.cleared).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Metrics Collection (Classical TDD)', () => {
    beforeEach(async () => {
      mockDocumentService.initialize.mockResolvedValue();
      await adapter.initialize();
      await adapter.start();
    });

    it('should collect operation metrics', async () => {
      // Arrange
      mockWebDataService.getSystemStatus.mockResolvedValue({ system: 'healthy' } as any);

      // Act - Perform some operations
      await adapter.execute('system-status');
      await adapter.execute('system-status');

      const metrics = await adapter.getMetrics();

      // Assert
      expect(metrics.operationCount).toBe(2);
      expect(metrics.successCount).toBe(2);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.averageLatency).toBeGreaterThan(0);
      expect(metrics.throughput).toBeGreaterThanOrEqual(0);
    });

    it('should track error metrics', async () => {
      // Arrange
      mockWebDataService.getSystemStatus.mockRejectedValue(new Error('Test error'));

      // Act
      await adapter.execute('system-status');
      const metrics = await adapter.getMetrics();

      // Assert
      expect(metrics.operationCount).toBe(1);
      expect(metrics.successCount).toBe(0);
      expect(metrics.errorCount).toBe(1);
    });

    it('should calculate custom metrics correctly', async () => {
      // Arrange
      mockWebDataService.getSystemStatus.mockResolvedValue({ system: 'healthy' } as any);

      // Act - Hit cache to test cache hit rate
      await adapter.execute('system-status'); // Cache miss
      await adapter.execute('system-status'); // Cache hit

      const metrics = await adapter.getMetrics();

      // Assert
      expect(metrics.customMetrics).toHaveProperty('cacheHitRate');
      expect(metrics.customMetrics).toHaveProperty('pendingRequestsCount');
    });
  });

  describe('Status and Health Reporting (Classical TDD)', () => {
    beforeEach(async () => {
      mockDocumentService.initialize.mockResolvedValue();
      mockWebDataService.getServiceStats.mockReturnValue({
        requestsServed: 100,
        averageResponseTime: 150,
        cacheHitRate: 0.85,
      });
      await adapter.initialize();
      await adapter.start();
    });

    it('should report correct service status', async () => {
      // Act
      const status = await adapter.getStatus();

      // Assert
      expect(status.name).toBe('test-adapter');
      expect(status.type).toBe(ServiceType.DATA);
      expect(status.lifecycle).toBe('running');
      expect(status.health).toMatch(/healthy|degraded|unhealthy|unknown/);
      expect(status.uptime).toBeGreaterThanOrEqual(0);
      expect(status.dependencies).toBeDefined();
    });

    it('should include dependency status in service status', async () => {
      // Act
      const status = await adapter.getStatus();

      // Assert
      expect(status.dependencies).toHaveProperty('web-data-service');
      expect(status.dependencies).toHaveProperty('document-service');
      expect(status.dependencies?.['web-data-service'].status).toMatch(/healthy|unhealthy|unknown/);
    });

    it('should report metadata in service status', async () => {
      // Act
      const status = await adapter.getStatus();

      // Assert
      expect(status.metadata).toHaveProperty('webDataEnabled', true);
      expect(status.metadata).toHaveProperty('documentDataEnabled', true);
      expect(status.metadata).toHaveProperty('operationCount');
      expect(status.metadata).toHaveProperty('cacheSize');
    });
  });

  describe('Service Capabilities (Classical TDD)', () => {
    beforeEach(async () => {
      mockDocumentService.initialize.mockResolvedValue();
      await adapter.initialize();
    });

    it('should report correct capabilities when both services are enabled', () => {
      // Act
      const capabilities = adapter.getCapabilities();

      // Assert
      expect(capabilities).toContain('data-operations');
      expect(capabilities).toContain('system-status');
      expect(capabilities).toContain('swarm-management');
      expect(capabilities).toContain('document-crud');
      expect(capabilities).toContain('document-search');
      expect(capabilities).toContain('caching');
      expect(capabilities).toContain('retry-logic');
    });

    it('should report limited capabilities when only web data is enabled', async () => {
      // Arrange
      config.documentData!.enabled = false;
      adapter = new DataServiceAdapter(config);
      await adapter.initialize();

      // Act
      const capabilities = adapter.getCapabilities();

      // Assert
      expect(capabilities).toContain('data-operations');
      expect(capabilities).toContain('system-status');
      expect(capabilities).toContain('swarm-management');
      expect(capabilities).not.toContain('document-crud');
      expect(capabilities).not.toContain('document-search');
    });
  });
});

// ============================================
// DataServiceFactory Tests
// ============================================

describe('DataServiceFactory', () => {
  let factory: DataServiceFactory;

  beforeEach(() => {
    factory = new DataServiceFactory();
  });

  afterEach(async () => {
    await factory.shutdown();
  });

  describe('Factory Operations (London TDD)', () => {
    it('should create adapter instances correctly', async () => {
      // Arrange
      const config = createDefaultDataServiceAdapterConfig('test-factory-adapter');
      mockDocumentService.initialize.mockResolvedValue();

      // Act
      const adapter = await factory.create(config);

      // Assert
      expect(adapter).toBeInstanceOf(DataServiceAdapter);
      expect(adapter.name).toBe('test-factory-adapter');
      expect(factory.has('test-factory-adapter')).toBe(true);
    });

    it('should reject duplicate service names', async () => {
      // Arrange
      const config = createDefaultDataServiceAdapterConfig('duplicate-adapter');
      mockDocumentService.initialize.mockResolvedValue();
      await factory.create(config);

      // Act & Assert
      await expect(factory.create(config)).rejects.toThrow('Service with this name already exists');
    });

    it('should validate configuration before creating services', async () => {
      // Arrange
      const invalidConfig = {
        ...createDefaultDataServiceAdapterConfig('invalid-adapter'),
        documentData: {
          enabled: true,
          databaseType: 'invalid-db' as any,
        },
      };

      // Act & Assert
      await expect(factory.create(invalidConfig)).rejects.toThrow(
        'Invalid data service adapter configuration'
      );
    });
  });

  describe('Specialized Factory Methods (Classical TDD)', () => {
    beforeEach(() => {
      mockDocumentService.initialize.mockResolvedValue();
    });

    it('should create web data adapter with correct configuration', async () => {
      // Act
      const adapter = await factory.createWebDataAdapter('web-adapter');

      // Assert
      expect(adapter.type).toBe(ServiceType.WEB_DATA);
      expect(adapter.config.webData?.enabled).toBe(true);
      expect(adapter.config.documentData?.enabled).toBe(false);
    });

    it('should create document adapter with specified database type', async () => {
      // Act
      const adapter = await factory.createDocumentAdapter('doc-adapter', 'mysql');

      // Assert
      expect(adapter.type).toBe(ServiceType.DOCUMENT);
      expect(adapter.config.documentData?.enabled).toBe(true);
      expect(adapter.config.documentData?.databaseType).toBe('mysql');
      expect(adapter.config.webData?.enabled).toBe(false);
    });

    it('should create unified adapter with both services enabled', async () => {
      // Act
      const adapter = await factory.createUnifiedDataAdapter('unified-adapter', 'postgresql');

      // Assert
      expect(adapter.type).toBe(ServiceType.DATA);
      expect(adapter.config.webData?.enabled).toBe(true);
      expect(adapter.config.documentData?.enabled).toBe(true);
      expect(adapter.config.documentData?.databaseType).toBe('postgresql');
    });
  });

  describe('Factory Statistics (Classical TDD)', () => {
    beforeEach(() => {
      mockDocumentService.initialize.mockResolvedValue();
    });

    it('should provide factory statistics', async () => {
      // Arrange
      await factory.createWebDataAdapter('web-1');
      await factory.createDocumentAdapter('doc-1');
      await factory.createUnifiedDataAdapter('unified-1');

      // Act
      const stats = factory.getFactoryStats();

      // Assert
      expect(stats.totalServices).toBe(3);
      expect(stats.servicesByType[ServiceType.WEB_DATA]).toBe(1);
      expect(stats.servicesByType[ServiceType.DOCUMENT]).toBe(1);
      expect(stats.servicesByType[ServiceType.DATA]).toBe(1);
      expect(stats.healthyServices).toBeGreaterThanOrEqual(0);
      expect(stats.averageUptime).toBeGreaterThanOrEqual(0);
    });
  });
});

// ============================================
// DataServiceHelper Tests
// ============================================

describe('DataServiceHelper', () => {
  let adapter: DataServiceAdapter;
  let helper: DataServiceHelper;

  beforeEach(async () => {
    const config = createDefaultDataServiceAdapterConfig('helper-test-adapter');
    adapter = new DataServiceAdapter(config);
    helper = new DataServiceHelper(adapter);

    mockDocumentService.initialize.mockResolvedValue();
    await adapter.initialize();
    await adapter.start();
  });

  afterEach(async () => {
    await adapter.stop();
    await adapter.destroy();
  });

  describe('Helper Operations (Classical TDD)', () => {
    it('should get system status with metadata', async () => {
      // Arrange
      const mockStatus = { system: 'healthy', version: '1.0.0' };
      mockWebDataService.getSystemStatus.mockResolvedValue(mockStatus as any);

      // Act
      const result = await helper.getSystemStatus();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStatus);
      expect(result.metadata.operation).toBe('system-status');
      expect(result.metadata.duration).toBeGreaterThanOrEqual(0);
    });

    it('should filter swarms correctly', async () => {
      // Arrange
      const mockSwarms = [
        {
          id: 'swarm-1',
          name: 'Active Swarm',
          status: 'active',
          agents: 5,
          tasks: 10,
          progress: 75,
        },
        {
          id: 'swarm-2',
          name: 'Inactive Swarm',
          status: 'stopped',
          agents: 3,
          tasks: 5,
          progress: 100,
        },
      ];
      mockWebDataService.getSwarms.mockResolvedValue(mockSwarms as any);

      // Act
      const result = await helper.getSwarms({ status: 'active', minAgents: 4 });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].id).toBe('swarm-1');
    });

    it('should validate swarm configuration correctly', async () => {
      // Arrange
      const validConfig = { name: 'Test Swarm', agents: 5, timeout: 30000 };
      const invalidConfig = { name: '', agents: -1 };

      // Act
      const validResult = await helper.createSwarm(validConfig);
      const invalidResult = await helper.createSwarm(invalidConfig);

      // Assert
      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error).toContain('Validation failed');
    });
  });

  describe('Data Transformation (Classical TDD)', () => {
    it('should apply transformation pipeline correctly', () => {
      // Arrange
      const data = [
        { id: 1, name: 'Item 1', value: 10, active: true },
        { id: 2, name: 'Item 2', value: 20, active: false },
        { id: 3, name: 'Item 3', value: 30, active: true },
      ];

      const pipeline = [
        { type: 'filter' as const, config: { predicate: (item: any) => item.active } },
        { type: 'sort' as const, config: { field: 'value', direction: 'desc' } },
        {
          type: 'map' as const,
          config: { mapper: (item: any) => ({ ...item, doubled: item.value * 2 }) },
        },
      ];

      // Act
      const result = helper.transformData(data, pipeline);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(3); // Highest value after sort
      expect(result[0].doubled).toBe(60);
      expect(result[1].id).toBe(1);
      expect(result[1].doubled).toBe(20);
    });

    it('should export data in different formats', () => {
      // Arrange
      const data = [
        { id: 1, name: 'Item 1', value: 10 },
        { id: 2, name: 'Item 2', value: 20 },
      ];

      // Act
      const jsonExport = helper.exportData(data, 'json');
      const csvExport = helper.exportData(data, 'csv');

      // Assert
      expect(jsonExport).toContain('"id": 1');
      expect(csvExport).toContain('id,name,value');
      expect(csvExport).toContain('1,Item 1,10');
    });
  });
});

// ============================================
// DataServiceUtils Tests (Classical TDD)
// ============================================

describe('DataServiceUtils', () => {
  describe('Utility Functions (Classical TDD)', () => {
    it('should generate consistent cache keys', () => {
      // Arrange
      const operation = 'test-operation';
      const params1 = { key: 'value', num: 123 };
      const params2 = { num: 123, key: 'value' }; // Different order, same content

      // Act
      const key1 = DataServiceUtils.generateCacheKey(operation, params1);
      const key2 = DataServiceUtils.generateCacheKey(operation, params2);

      // Assert
      expect(key1).toBe(key2); // Should be the same due to JSON.stringify normalization
      expect(key1).toContain('test-operation');
    });

    it('should estimate data size correctly', () => {
      // Arrange
      const smallData = { key: 'value' };
      const largeData = { key: 'value'.repeat(1000) };

      // Act
      const smallSize = DataServiceUtils.estimateDataSize(smallData);
      const largeSize = DataServiceUtils.estimateDataSize(largeData);

      // Assert
      expect(smallSize).toBeGreaterThan(0);
      expect(largeSize).toBeGreaterThan(smallSize);
    });

    it('should deep clone objects correctly', () => {
      // Arrange
      const original = {
        level1: {
          level2: {
            value: 'test',
            array: [1, 2, 3],
          },
        },
      };

      // Act
      const cloned = DataServiceUtils.deepClone(original);
      cloned.level1.level2.value = 'modified';

      // Assert
      expect(original.level1.level2.value).toBe('test'); // Original unchanged
      expect(cloned.level1.level2.value).toBe('modified'); // Clone modified
    });

    it('should deep merge objects correctly', () => {
      // Arrange
      const target = { a: 1, b: { c: 2, d: 3 } };
      const source = { b: { c: 4, e: 5 }, f: 6 };

      // Act
      const result = DataServiceUtils.deepMerge(target, source);

      // Assert
      expect(result.a).toBe(1); // Preserved from target
      expect(result.b.c).toBe(4); // Overridden by source
      expect(result.b.d).toBe(3); // Preserved from target
      expect(result.b.e).toBe(5); // Added from source
      expect(result.f).toBe(6); // Added from source
    });

    it('should create working rate limiter', () => {
      // Arrange
      const rateLimiter = DataServiceUtils.createRateLimiter(3, 1000); // 3 requests per second

      // Act & Assert
      expect(rateLimiter('key1')).toBe(true); // 1st request - allowed
      expect(rateLimiter('key1')).toBe(true); // 2nd request - allowed
      expect(rateLimiter('key1')).toBe(true); // 3rd request - allowed
      expect(rateLimiter('key1')).toBe(false); // 4th request - blocked

      // Different key should be allowed
      expect(rateLimiter('key2')).toBe(true);
    });

    it('should validate configuration against schema', () => {
      // Arrange
      const schema = {
        required: ['name', 'type'],
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
        },
      };

      const validConfig = { name: 'test', type: 'data' };
      const invalidConfig = { name: 'test' }; // Missing 'type'

      // Act
      const validResult = DataServiceUtils.validateConfiguration(validConfig, schema);
      const invalidResult = DataServiceUtils.validateConfiguration(invalidConfig, schema);

      // Assert
      expect(validResult.valid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('Required field missing: type');
    });
  });
});
