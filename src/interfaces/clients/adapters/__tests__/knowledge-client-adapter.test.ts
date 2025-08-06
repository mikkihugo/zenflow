/**
 * UACL Knowledge Client Adapter Tests
 *
 * Tests for the Knowledge Client Adapter that converts FACT integration
 * to the UACL interface pattern. Uses hybrid TDD approach:
 * - TDD London (70%): Mock external dependencies, test interactions
 * - Classical TDD (30%): Test actual computation and data transformation
 */

import { EventEmitter } from 'node:events';
import { ClientStatuses, ProtocolTypes } from '../../types';
import {
  createCustomKnowledgeClient,
  createFACTClient,
  KnowledgeClientAdapter,
  type KnowledgeClientConfig,
  KnowledgeClientFactory,
  KnowledgeHelpers,
  type KnowledgeRequest,
  type KnowledgeResponse,
} from '../knowledge-client-adapter';

// Mock the FACT integration
jest.mock('../../../../knowledge/knowledge-client', () => {
  const mockFACTIntegration = {
    initialize: jest.fn().mockResolvedValue(undefined),
    shutdown: jest.fn().mockResolvedValue(undefined),
    query: jest.fn(),
    getMetrics: jest.fn(),
    on: jest.fn(),
    emit: jest.fn(),
  };

  return {
    FACTIntegration: jest.fn().mockImplementation(() => mockFACTIntegration),
    __mockFACTIntegration: mockFACTIntegration,
  };
});

// Import the mock for access in tests
const { __mockFACTIntegration } = require('../../../../knowledge/knowledge-client');

describe('KnowledgeClientAdapter', () => {
  let knowledgeConfig: KnowledgeClientConfig;
  let knowledgeClient: KnowledgeClientAdapter;

  beforeEach(() => {
    jest.clearAllMocks();

    knowledgeConfig = {
      protocol: ProtocolTypes.CUSTOM,
      url: 'fact://test',
      provider: 'fact',
      factConfig: {
        factRepoPath: './test-fact',
        anthropicApiKey: 'test-key',
        pythonPath: 'python3',
      },
      caching: {
        enabled: true,
        prefix: 'test-cache',
        ttlSeconds: 1800,
        minTokens: 300,
      },
      tools: ['web_scraper', 'documentation_parser'],
      timeout: 30000,
    };

    knowledgeClient = new KnowledgeClientAdapter(knowledgeConfig);
  });

  afterEach(async () => {
    if (knowledgeClient?.isConnected()) {
      await knowledgeClient.disconnect();
    }
  });

  describe('TDD London Tests (Interaction-based)', () => {
    describe('Client Initialization', () => {
      it('should create FACT integration with converted config', () => {
        expect(
          require('../../../../knowledge/knowledge-client').FACTIntegration
        ).toHaveBeenCalledWith({
          pythonPath: 'python3',
          factRepoPath: './test-fact',
          anthropicApiKey: 'test-key',
          cacheConfig: {
            prefix: 'test-cache',
            minTokens: 300,
            maxSize: '100MB',
            ttlSeconds: 1800,
          },
          enableCache: true,
          databasePath: './data/knowledge.db',
        });
      });

      it('should setup event forwarding from FACT integration', () => {
        expect(__mockFACTIntegration.on).toHaveBeenCalledWith('initialized', expect.any(Function));
        expect(__mockFACTIntegration.on).toHaveBeenCalledWith(
          'queryCompleted',
          expect.any(Function)
        );
        expect(__mockFACTIntegration.on).toHaveBeenCalledWith('queryError', expect.any(Function));
        expect(__mockFACTIntegration.on).toHaveBeenCalledWith('shutdown', expect.any(Function));
      });
    });

    describe('Connection Management', () => {
      it('should call FACT initialize on connect', async () => {
        await knowledgeClient.connect();

        expect(__mockFACTIntegration.initialize).toHaveBeenCalledTimes(1);
        expect(knowledgeClient.isConnected()).toBe(true);
      });

      it('should call FACT shutdown on disconnect', async () => {
        await knowledgeClient.connect();
        await knowledgeClient.disconnect();

        expect(__mockFACTIntegration.shutdown).toHaveBeenCalledTimes(1);
        expect(knowledgeClient.isConnected()).toBe(false);
      });

      it('should emit connection events', async () => {
        const connectSpy = jest.fn();
        const disconnectSpy = jest.fn();

        knowledgeClient.on('connect', connectSpy);
        knowledgeClient.on('disconnect', disconnectSpy);

        await knowledgeClient.connect();
        await knowledgeClient.disconnect();

        expect(connectSpy).toHaveBeenCalledTimes(1);
        expect(disconnectSpy).toHaveBeenCalledTimes(1);
      });

      it('should handle connection errors', async () => {
        const error = new Error('Connection failed');
        __mockFACTIntegration.initialize.mockRejectedValueOnce(error);

        const errorSpy = jest.fn();
        knowledgeClient.on('error', errorSpy);

        await expect(knowledgeClient.connect()).rejects.toThrow('Connection failed');
        expect(errorSpy).toHaveBeenCalledWith(error);
        expect(knowledgeClient.isConnected()).toBe(false);
      });
    });

    describe('Query Execution', () => {
      beforeEach(async () => {
        await knowledgeClient.connect();
      });

      it('should convert UACL request to FACT query and call FACT integration', async () => {
        const mockFACTResult = {
          queryId: 'test-query-123',
          response: 'Test response',
          executionTimeMs: 1500,
          cacheHit: true,
          toolsUsed: ['web_scraper'],
          cost: 0.05,
          metadata: { test: true },
        };

        __mockFACTIntegration.query.mockResolvedValueOnce(mockFACTResult);

        const request: KnowledgeRequest = {
          query: 'Test query',
          type: 'semantic',
          tools: ['web_scraper'],
          metadata: { category: 'test' },
        };

        await knowledgeClient.send(request);

        expect(__mockFACTIntegration.query).toHaveBeenCalledWith({
          query: 'Test query',
          tools: ['web_scraper'],
          useCache: true,
          metadata: { category: 'test' },
        });
      });

      it('should handle query errors and update metrics', async () => {
        const error = new Error('Query failed');
        __mockFACTIntegration.query.mockRejectedValueOnce(error);

        const request: KnowledgeRequest = {
          query: 'Test query',
          type: 'semantic',
        };

        await expect(knowledgeClient.send(request)).rejects.toThrow('Query failed');

        const metadata = await knowledgeClient.getMetadata();
        expect(metadata.metrics.failedRequests).toBe(1);
        expect(metadata.metrics.totalRequests).toBe(1);
      });
    });

    describe('IKnowledgeClient Interface Methods', () => {
      beforeEach(async () => {
        await knowledgeClient.connect();

        // Mock FACT query response
        __mockFACTIntegration.query.mockResolvedValue({
          queryId: 'test-123',
          response: 'Mock response',
          executionTimeMs: 1000,
          cacheHit: false,
          toolsUsed: ['web_scraper'],
          metadata: {},
        });
      });

      it('should call FACT integration through query method', async () => {
        await knowledgeClient.query('Test query', { limit: 5 });

        expect(__mockFACTIntegration.query).toHaveBeenCalledWith({
          query: 'Test query',
          tools: ['web_scraper', 'documentation_parser'],
          useCache: true,
          metadata: { queryType: 'knowledge_query' },
          options: { limit: 5 },
        });
      });

      it('should call FACT integration through search method', async () => {
        await knowledgeClient.search('search term', { fuzzy: true });

        expect(__mockFACTIntegration.query).toHaveBeenCalledWith({
          query: 'search term',
          tools: ['web_scraper', 'documentation_parser'],
          useCache: true,
          metadata: { queryType: 'search' },
          options: { fuzzy: true },
        });
      });

      it('should call FACT integration through semanticSearch method', async () => {
        await knowledgeClient.semanticSearch('semantic query', { vectorSearch: true });

        expect(__mockFACTIntegration.query).toHaveBeenCalledWith({
          query: 'semantic query',
          tools: ['vector_search', 'semantic_analyzer'],
          useCache: true,
          metadata: { queryType: 'semantic_search', vectorSearch: true },
          options: { vectorSearch: true },
        });
      });
    });

    describe('Health Checking', () => {
      it('should return false when disconnected', async () => {
        const health = await knowledgeClient.health();
        expect(health).toBe(false);
      });

      it('should perform health check query when connected', async () => {
        await knowledgeClient.connect();

        __mockFACTIntegration.query.mockResolvedValueOnce({
          queryId: 'health-check',
          response: 'OK',
          executionTimeMs: 100,
          cacheHit: false,
          toolsUsed: [],
          metadata: {},
        });

        const health = await knowledgeClient.health();

        expect(health).toBe(true);
        expect(__mockFACTIntegration.query).toHaveBeenCalledWith({
          query: 'health check',
          tools: [],
          useCache: true,
          metadata: { type: 'health_check' },
        });
      });
    });
  });

  describe('Classical TDD Tests (Result-based)', () => {
    describe('Configuration Conversion', () => {
      it('should correctly convert UACL config to FACT config', () => {
        const uaclConfig: KnowledgeClientConfig = {
          protocol: ProtocolTypes.HTTPS,
          url: 'https://knowledge.api',
          provider: 'fact',
          factConfig: {
            factRepoPath: '/path/to/fact',
            anthropicApiKey: 'sk-test-key',
            pythonPath: 'python3.9',
          },
          caching: {
            enabled: false,
            prefix: 'custom-prefix',
            ttlSeconds: 7200,
            minTokens: 1000,
          },
          timeout: 45000,
        };

        const adapter = new KnowledgeClientAdapter(uaclConfig);

        // Verify the FACT integration was created with correct config
        expect(
          require('../../../../knowledge/knowledge-client').FACTIntegration
        ).toHaveBeenCalledWith({
          pythonPath: 'python3.9',
          factRepoPath: '/path/to/fact',
          anthropicApiKey: 'sk-test-key',
          cacheConfig: {
            prefix: 'custom-prefix',
            minTokens: 1000,
            maxSize: '100MB',
            ttlSeconds: 7200,
          },
          enableCache: false,
          databasePath: './data/knowledge.db',
        });
      });

      it('should use environment variable for API key when not provided', () => {
        const originalEnv = process.env.ANTHROPIC_API_KEY;
        process.env.ANTHROPIC_API_KEY = 'env-test-key';

        const uaclConfig: KnowledgeClientConfig = {
          protocol: ProtocolTypes.CUSTOM,
          url: 'fact://test',
          provider: 'fact',
          factConfig: {
            factRepoPath: './fact',
            // No anthropicApiKey provided
          },
        };

        new KnowledgeClientAdapter(uaclConfig);

        expect(
          require('../../../../knowledge/knowledge-client').FACTIntegration
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            anthropicApiKey: 'env-test-key',
          })
        );

        process.env.ANTHROPIC_API_KEY = originalEnv;
      });
    });

    describe('Response Transformation', () => {
      it('should correctly transform FACT result to UACL response', async () => {
        await knowledgeClient.connect();

        const mockFACTResult = {
          queryId: 'fact-query-456',
          response: 'Detailed FACT response content',
          executionTimeMs: 2500,
          cacheHit: true,
          toolsUsed: ['web_scraper', 'documentation_parser'],
          cost: 0.12,
          metadata: { source: 'stackoverflow', tags: ['javascript', 'nodejs'] },
        };

        __mockFACTIntegration.query.mockResolvedValueOnce(mockFACTResult);

        const request: KnowledgeRequest = {
          query: 'Test transformation',
          type: 'semantic',
        };

        const response = await knowledgeClient.send<KnowledgeResponse>(request);

        // Verify response structure and content
        expect(response).toEqual({
          response: 'Detailed FACT response content',
          queryId: 'fact-query-456',
          executionTimeMs: 2500,
          cacheHit: true,
          toolsUsed: ['web_scraper', 'documentation_parser'],
          cost: 0.12,
          confidence: expect.any(Number),
          sources: expect.any(Array),
          metadata: { source: 'stackoverflow', tags: ['javascript', 'nodejs'] },
        });

        // Verify confidence calculation
        expect(response.confidence).toBeGreaterThan(0.5);
        expect(response.confidence).toBeLessThanOrEqual(1.0);

        // Verify sources extraction
        expect(response.sources).toHaveLength(2);
        expect(response.sources![0]).toEqual({
          title: 'web_scraper result',
          url: 'fact://tool/web_scraper',
          relevance: 1.0,
        });
        expect(response.sources![1]).toEqual({
          title: 'documentation_parser result',
          url: 'fact://tool/documentation_parser',
          relevance: 0.9,
        });
      });
    });

    describe('Metrics Calculation', () => {
      it('should correctly calculate and update performance metrics', async () => {
        await knowledgeClient.connect();

        // Simulate multiple requests with different response times
        const requests = [
          { time: 1000, success: true },
          { time: 2000, success: true },
          { time: 1500, success: false },
          { time: 800, success: true },
        ];

        for (const [index, req] of requests.entries()) {
          if (req.success) {
            __mockFACTIntegration.query.mockResolvedValueOnce({
              queryId: `query-${index}`,
              response: 'Response',
              executionTimeMs: req.time,
              cacheHit: false,
              toolsUsed: [],
              metadata: {},
            });
          } else {
            __mockFACTIntegration.query.mockRejectedValueOnce(new Error('Query failed'));
          }

          const request: KnowledgeRequest = {
            query: `Test query ${index}`,
            type: 'exact',
          };

          try {
            await knowledgeClient.send(request);
          } catch {
            // Expected for failed requests
          }
        }

        const metadata = await knowledgeClient.getMetadata();

        // Verify metrics calculations
        expect(metadata.metrics.totalRequests).toBe(4);
        expect(metadata.metrics.successfulRequests).toBe(3);
        expect(metadata.metrics.failedRequests).toBe(1);

        // Average response time should be (1000 + 2000 + 1500 + 800) / 4 = 1325
        expect(metadata.metrics.averageResponseTime).toBeCloseTo(1325, 0);

        expect(metadata.metrics.lastRequestTime).toBeInstanceOf(Date);
        expect(metadata.metrics.uptime).toBeGreaterThan(0);
      });
    });

    describe('Knowledge Stats Transformation', () => {
      it('should correctly transform FACT metrics to knowledge stats', async () => {
        await knowledgeClient.connect();

        const mockFACTMetrics = {
          totalQueries: 150,
          cacheHitRate: 0.65,
          averageLatency: 1250,
          costSavings: 2.75,
          toolExecutions: 300,
          errorRate: 0.05,
        };

        __mockFACTIntegration.getMetrics.mockResolvedValueOnce(mockFACTMetrics);

        const stats = await knowledgeClient.getKnowledgeStats();

        expect(stats).toEqual({
          totalEntries: 150,
          totalSize: 0,
          lastUpdated: expect.any(Date),
          categories: {
            'fact-queries': 150,
            'cached-results': Math.floor(150 * 0.65), // 97
          },
          averageResponseTime: 1250,
          indexHealth: 1.0, // Error rate < 0.1, so health = 1.0
        });

        expect(stats.categories['cached-results']).toBe(97);
      });
    });

    describe('Confidence Score Calculation', () => {
      it('should calculate confidence based on result characteristics', async () => {
        await knowledgeClient.connect();

        const testCases = [
          {
            result: { cacheHit: true, toolsUsed: ['tool1', 'tool2'], executionTimeMs: 1000 },
            expectedConfidence: 0.9, // 0.5 + 0.2 (cache) + 0.2 (tools)
          },
          {
            result: { cacheHit: false, toolsUsed: ['tool1'], executionTimeMs: 3000 },
            expectedConfidence: 0.7, // 0.5 + 0.2 (tools)
          },
          {
            result: { cacheHit: true, toolsUsed: [], executionTimeMs: 8000 },
            expectedConfidence: 0.7, // 0.5 + 0.2 (cache)
          },
          {
            result: { cacheHit: false, toolsUsed: [], executionTimeMs: 10000 },
            expectedConfidence: 0.5, // Base confidence only
          },
        ];

        for (const [index, testCase] of testCases.entries()) {
          __mockFACTIntegration.query.mockResolvedValueOnce({
            queryId: `confidence-test-${index}`,
            response: 'Test response',
            ...testCase.result,
            metadata: {},
          });

          const request: KnowledgeRequest = {
            query: `Confidence test ${index}`,
            type: 'exact',
          };

          const response = await knowledgeClient.send<KnowledgeResponse>(request);
          expect(response.confidence).toBeCloseTo(testCase.expectedConfidence, 1);
        }
      });
    });
  });

  describe('Factory Tests', () => {
    let factory: KnowledgeClientFactory;

    beforeEach(() => {
      factory = new KnowledgeClientFactory();
    });

    describe('Protocol Support', () => {
      it('should support HTTP, HTTPS, and CUSTOM protocols', () => {
        expect(factory.supports(ProtocolTypes.HTTP)).toBe(true);
        expect(factory.supports(ProtocolTypes.HTTPS)).toBe(true);
        expect(factory.supports(ProtocolTypes.CUSTOM)).toBe(true);
        expect(factory.supports(ProtocolTypes.WS)).toBe(false);
        expect(factory.supports(ProtocolTypes.TCP)).toBe(false);
      });

      it('should return correct supported protocols', () => {
        const protocols = factory.getSupportedProtocols();
        expect(protocols).toEqual([ProtocolTypes.HTTP, ProtocolTypes.HTTPS, ProtocolTypes.CUSTOM]);
      });
    });

    describe('Configuration Validation', () => {
      it('should validate required fields', () => {
        const validConfig: KnowledgeClientConfig = {
          protocol: ProtocolTypes.CUSTOM,
          url: 'fact://test',
          provider: 'fact',
          factConfig: {
            factRepoPath: './fact',
            anthropicApiKey: 'test-key',
          },
        };

        expect(factory.validateConfig(ProtocolTypes.CUSTOM, validConfig)).toBe(true);
      });

      it('should reject invalid configurations', () => {
        const invalidConfigs = [
          // Missing URL
          {
            protocol: ProtocolTypes.CUSTOM,
            provider: 'fact',
            factConfig: { factRepoPath: './fact', anthropicApiKey: 'key' },
          },
          // Missing FACT config for FACT provider
          {
            protocol: ProtocolTypes.CUSTOM,
            url: 'fact://test',
            provider: 'fact',
          },
          // Missing required FACT fields
          {
            protocol: ProtocolTypes.CUSTOM,
            url: 'fact://test',
            provider: 'fact',
            factConfig: { anthropicApiKey: 'key' }, // Missing factRepoPath
          },
        ];

        for (const config of invalidConfigs) {
          expect(factory.validateConfig(ProtocolTypes.CUSTOM, config as any)).toBe(false);
        }
      });

      it('should reject unsupported protocols', () => {
        const config: KnowledgeClientConfig = {
          protocol: ProtocolTypes.WS,
          url: 'ws://test',
          provider: 'fact',
          factConfig: {
            factRepoPath: './fact',
            anthropicApiKey: 'key',
          },
        };

        expect(factory.validateConfig(ProtocolTypes.WS, config)).toBe(false);
      });
    });

    describe('Client Creation', () => {
      it('should create knowledge client with valid configuration', async () => {
        const config: KnowledgeClientConfig = {
          protocol: ProtocolTypes.CUSTOM,
          url: 'fact://test',
          provider: 'fact',
          factConfig: {
            factRepoPath: './fact',
            anthropicApiKey: 'test-key',
          },
        };

        const client = await factory.create(ProtocolTypes.CUSTOM, config);

        expect(client).toBeInstanceOf(KnowledgeClientAdapter);
        expect(client.getConfig()).toEqual(config);
      });

      it('should throw error for invalid configuration', async () => {
        const invalidConfig = {
          protocol: ProtocolTypes.CUSTOM,
          url: '', // Invalid URL
          provider: 'fact',
        };

        await expect(factory.create(ProtocolTypes.CUSTOM, invalidConfig as any)).rejects.toThrow(
          'Invalid configuration for Knowledge client'
        );
      });
    });
  });

  describe('Convenience Functions', () => {
    describe('createFACTClient', () => {
      it('should create FACT client with correct configuration', async () => {
        const client = await createFACTClient('./test-fact', 'test-api-key', {
          timeout: 45000,
          tools: ['custom_tool'],
        });

        expect(client).toBeInstanceOf(KnowledgeClientAdapter);

        const config = client.getConfig() as KnowledgeClientConfig;
        expect(config.protocol).toBe(ProtocolTypes.CUSTOM);
        expect(config.url).toBe('fact://local');
        expect(config.provider).toBe('fact');
        expect(config.factConfig?.factRepoPath).toBe('./test-fact');
        expect(config.factConfig?.anthropicApiKey).toBe('test-api-key');
        expect(config.timeout).toBe(45000);
        expect(config.tools).toContain('custom_tool');
      });
    });

    describe('createCustomKnowledgeClient', () => {
      it('should create custom knowledge client with correct configuration', async () => {
        const client = await createCustomKnowledgeClient('https://knowledge.api.com', {
          timeout: 20000,
        });

        expect(client).toBeInstanceOf(KnowledgeClientAdapter);

        const config = client.getConfig() as KnowledgeClientConfig;
        expect(config.protocol).toBe(ProtocolTypes.HTTPS);
        expect(config.url).toBe('https://knowledge.api.com');
        expect(config.provider).toBe('custom');
        expect(config.timeout).toBe(20000);
      });
    });
  });
});

describe('KnowledgeHelpers', () => {
  let mockClient: jest.Mocked<KnowledgeClientAdapter>;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      search: jest.fn(),
    } as any;
  });

  describe('getDocumentation', () => {
    it('should call client query with documentation parameters', async () => {
      const mockResponse = { queryId: 'doc-123', response: 'Documentation content' };
      mockClient.query.mockResolvedValueOnce(mockResponse);

      const result = await KnowledgeHelpers.getDocumentation(mockClient, 'react', '18');

      expect(mockClient.query).toHaveBeenCalledWith(
        'Get comprehensive documentation for react version 18',
        {
          includeMetadata: true,
          filters: { type: 'documentation', framework: 'react', version: '18' },
        }
      );
      expect(result).toBe(mockResponse);
    });
  });

  describe('getAPIReference', () => {
    it('should call client query with API reference parameters', async () => {
      const mockResponse = { queryId: 'api-123', response: 'API reference content' };
      mockClient.query.mockResolvedValueOnce(mockResponse);

      const result = await KnowledgeHelpers.getAPIReference(mockClient, 'express', 'app.use');

      expect(mockClient.query).toHaveBeenCalledWith(
        'Get detailed API reference for express endpoint: app.use',
        {
          includeMetadata: true,
          filters: { type: 'api_reference', api: 'express', endpoint: 'app.use' },
        }
      );
      expect(result).toBe(mockResponse);
    });
  });

  describe('searchCommunity', () => {
    it('should call client search with community parameters', async () => {
      const mockResponse = [{ queryId: 'community-123', response: 'Community content' }];
      mockClient.search.mockResolvedValueOnce(mockResponse);

      const result = await KnowledgeHelpers.searchCommunity(mockClient, 'docker optimization', [
        'docker',
        'performance',
      ]);

      expect(mockClient.search).toHaveBeenCalledWith(
        'Search developer communities for: docker optimization tags: docker, performance',
        {
          fuzzy: true,
          fields: ['title', 'content', 'tags'],
          filters: {
            type: 'community',
            topic: 'docker optimization',
            tags: ['docker', 'performance'],
          },
        }
      );
      expect(result).toBe(mockResponse);
    });
  });
});
