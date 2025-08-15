/**
 * MCP Protocol Compliance Integration Test Suite
 * Comprehensive testing of both HTTP and Stdio MCP implementations
 */

import { StdioMcpServer } from '../../coordination/swarm/mcp/mcp-server';
import { HttpMcpServer } from '../../interfaces/mcp/http-mcp-server.ts';
import type { MCPRequest } from '../../interfaces/mcp/types.ts';
import { IntegrationTestSetup } from '../helpers/integration-test-setup.ts';
import { NetworkTestHelper } from '../helpers/network-test-helper.ts';

describe('MCP Protocol Compliance Integration Tests', () => {
  let httpMcpServer: HttpMcpServer;
  let stdioMcpServer: StdioMcpServer;
  let testSetup: IntegrationTestSetup;
  let networkHelper: NetworkTestHelper;

  const TEST_PORT = 3456;
  const TEST_TIMEOUT = 30000;

  beforeAll(async () => {
    testSetup = new IntegrationTestSetup();
    networkHelper = new NetworkTestHelper();

    await testSetup.initializeTestEnvironment();
  }, TEST_TIMEOUT);

  afterAll(async () => {
    await testSetup.cleanup();
  });

  describe('HTTP MCP Server Protocol Compliance', () => {
    beforeEach(async () => {
      httpMcpServer = new HttpMcpServer({
        port: TEST_PORT,
        host: 'localhost',
        cors: true,
        timeout: 5000,
      });

      await httpMcpServer.start();
    });

    afterEach(async () => {
      await httpMcpServer.stop();
    });

    it('should respond to health check with correct format', async () => {
      const response = await networkHelper.httpGet(
        `http://localhost:${TEST_PORT}/health`
      );

      expect(response?.status).toBe(200);
      expect(response?.data).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        version: expect.any(String),
      });
    });

    it('should return capabilities in MCP format', async () => {
      const response = await networkHelper.httpGet(
        `http://localhost:${TEST_PORT}/capabilities`
      );

      expect(response?.status).toBe(200);
      expect(response?.data).toMatchObject({
        protocolVersion: expect.stringMatching(/^\d+\.\d+\.\d+$/),
        capabilities: {
          tools: expect.any(Object),
          resources: expect.any(Object),
          prompts: expect.any(Object),
        },
        serverInfo: {
          name: 'claude-zen-mcp',
          version: expect.any(String),
        },
      });
    });

    it('should handle JSON-RPC 2.0 requests correctly', async () => {
      const mcpRequest: MCPRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {},
      };

      const response = await networkHelper.httpPost(
        `http://localhost:${TEST_PORT}/mcp`,
        mcpRequest
      );

      expect(response?.status).toBe(200);
      expect(response?.data).toMatchObject({
        jsonrpc: '2.0',
        id: 1,
        result: {
          tools: expect.any(Array),
        },
      });
    });

    it('should validate request parameters and return proper errors', async () => {
      const invalidRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'nonexistent_tool',
        },
      };

      const response = await networkHelper.httpPost(
        `http://localhost:${TEST_PORT}/mcp`,
        invalidRequest
      );

      expect(response?.status).toBe(200); // JSON-RPC errors return 200 with error in body
      expect(response?.data).toMatchObject({
        jsonrpc: '2.0',
        id: 2,
        error: {
          code: expect.any(Number),
          message: expect.stringContaining('Tool not found'),
          data: expect.any(Object),
        },
      });
    });

    it('should handle tool execution with proper request/response flow', async () => {
      const toolCallRequest: MCPRequest = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'system_info',
          arguments: {
            detailed: true,
          },
        },
      };

      const response = await networkHelper.httpPost(
        `http://localhost:${TEST_PORT}/mcp`,
        toolCallRequest
      );

      expect(response?.status).toBe(200);
      expect(response?.data).toMatchObject({
        jsonrpc: '2.0',
        id: 3,
        result: {
          content: expect.any(Array),
          isError: false,
        },
      });

      // Verify content structure
      const content = response?.data?.result?.content;
      expect(content[0]).toMatchObject({
        type: 'text',
        text: expect.stringContaining('Claude-Zen System Information'),
      });
    });

    it('should support streaming responses for long-running operations', async () => {
      const streamingRequest: MCPRequest = {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'swarm_init',
          arguments: {
            topology: 'mesh',
            agents: 5,
            streaming: true,
          },
        },
      };

      const responseStream = await networkHelper.httpPostStream(
        `http://localhost:${TEST_PORT}/mcp`,
        streamingRequest
      );

      const chunks: unknown[] = [];

      for await (const chunk of responseStream) {
        chunks.push(JSON.parse(chunk));
      }

      expect(chunks.length).toBeGreaterThan(1);

      // First chunk should be acknowledgment
      expect(chunks[0]).toMatchObject({
        jsonrpc: '2.0',
        id: 4,
        result: {
          streaming: true,
          status: 'initiated',
        },
      });

      // Last chunk should be completion
      const lastChunk = chunks[chunks.length - 1];
      expect(lastChunk).toMatchObject({
        jsonrpc: '2.0',
        id: 4,
        result: {
          streaming: true,
          status: 'completed',
          final_result: expect.any(Object),
        },
      });
    });

    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = Array.from({ length: 10 }, (_, i) => ({
        jsonrpc: '2.0',
        id: i + 10,
        method: 'tools/call',
        params: {
          name: 'system_info',
          arguments: { detailed: false },
        },
      }));

      const startTime = Date.now();

      const responses = await Promise.all(
        concurrentRequests?.map((req) =>
          networkHelper.httpPost(`http://localhost:${TEST_PORT}/mcp`, req)
        )
      );

      const totalTime = Date.now() - startTime;

      // All requests should succeed
      responses?.forEach((response, index) => {
        expect(response?.status).toBe(200);
        expect(response?.data?.id).toBe(index + 10);
        expect(response?.data?.result).toBeDefined();
      });

      // Should handle concurrent requests efficiently (< 5 seconds for 10 requests)
      expect(totalTime).toBeLessThan(5000);
    });

    it('should properly handle CORS for cross-origin requests', async () => {
      const corsResponse = await networkHelper.httpOptions(
        `http://localhost:${TEST_PORT}/mcp`,
        {
          Origin: 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        }
      );

      expect(corsResponse?.status).toBe(200);
      expect(corsResponse?.headers?.['access-control-allow-origin']).toBe('*');
      expect(corsResponse?.headers?.['access-control-allow-methods']).toContain(
        'POST'
      );
      expect(corsResponse?.headers?.['access-control-allow-headers']).toContain(
        'Content-Type'
      );
    });
  });

  describe('Stdio MCP Server Protocol Compliance', () => {
    beforeEach(async () => {
      stdioMcpServer = new StdioMcpServer({
        enableSwarmCoordination: true,
        memoryPersistence: true,
        logLevel: 'debug',
      });

      await stdioMcpServer.initialize();
    });

    afterEach(async () => {
      await stdioMcpServer.shutdown();
    });

    it('should handle stdin/stdout JSON-RPC communication', async () => {
      const request: MCPRequest = {
        jsonrpc: '2.0',
        id: 'test-1',
        method: 'tools/list',
        params: {},
      };

      const response = await stdioMcpServer.processMessage(
        JSON.stringify(request)
      );
      const parsedResponse = JSON.parse(response);

      expect(parsedResponse).toMatchObject({
        jsonrpc: '2.0',
        id: 'test-1',
        result: {
          tools: expect.arrayContaining([
            expect.objectContaining({
              name: expect.stringMatching(/^mcp__zen-swarm__/),
              description: expect.any(String),
              inputSchema: expect.any(Object),
            }),
          ]),
        },
      });
    });

    it('should support swarm coordination tools', async () => {
      const swarmInitRequest: MCPRequest = {
        jsonrpc: '2.0',
        id: 'swarm-1',
        method: 'tools/call',
        params: {
          name: 'mcp__zen-swarm__swarm_init',
          arguments: {
            topology: 'hierarchical',
            maxAgents: 5,
            strategy: 'parallel',
          },
        },
      };

      const response = await stdioMcpServer.processMessage(
        JSON.stringify(swarmInitRequest)
      );
      const parsedResponse = JSON.parse(response);

      expect(parsedResponse).toMatchObject({
        jsonrpc: '2.0',
        id: 'swarm-1',
        result: {
          content: expect.arrayContaining([
            expect.objectContaining({
              type: 'text',
              text: expect.stringContaining('Swarm initialized'),
            }),
          ]),
          isError: false,
        },
      });
    });

    it('should maintain session state across requests', async () => {
      // Initialize swarm
      const initRequest: MCPRequest = {
        jsonrpc: '2.0',
        id: 'session-1',
        method: 'tools/call',
        params: {
          name: 'mcp__zen-swarm__swarm_init',
          arguments: {
            topology: 'mesh',
            maxAgents: 3,
          },
        },
      };

      await stdioMcpServer.processMessage(JSON.stringify(initRequest));

      // Spawn agent in same session
      const spawnRequest: MCPRequest = {
        jsonrpc: '2.0',
        id: 'session-2',
        method: 'tools/call',
        params: {
          name: 'mcp__zen-swarm__agent_spawn',
          arguments: {
            type: 'coordinator',
            name: 'test-coordinator',
          },
        },
      };

      const spawnResponse = await stdioMcpServer.processMessage(
        JSON.stringify(spawnRequest)
      );
      const parsedSpawnResponse = JSON.parse(spawnResponse);

      expect(parsedSpawnResponse?.result?.isError).toBe(false);
      expect(parsedSpawnResponse?.result?.content?.[0]?.text).toContain(
        'Agent spawned successfully'
      );

      // Check swarm status to verify session persistence
      const statusRequest: MCPRequest = {
        jsonrpc: '2.0',
        id: 'session-3',
        method: 'tools/call',
        params: {
          name: 'mcp__zen-swarm__swarm_status',
          arguments: {},
        },
      };

      const statusResponse = await stdioMcpServer.processMessage(
        JSON.stringify(statusRequest)
      );
      const parsedStatusResponse = JSON.parse(statusResponse);

      expect(parsedStatusResponse?.result?.content?.[0]?.text).toContain(
        'test-coordinator'
      );
    });

    it('should handle memory persistence operations', async () => {
      const memoryStoreRequest: MCPRequest = {
        jsonrpc: '2.0',
        id: 'memory-1',
        method: 'tools/call',
        params: {
          name: 'mcp__zen-swarm__memory_usage',
          arguments: {
            action: 'store',
            key: 'test-session-data',
            value: {
              timestamp: Date.now(),
              sessionId: 'test-session-123',
              data: { important: true },
            },
          },
        },
      };

      const storeResponse = await stdioMcpServer.processMessage(
        JSON.stringify(memoryStoreRequest)
      );
      const parsedStoreResponse = JSON.parse(storeResponse);

      expect(parsedStoreResponse?.result?.isError).toBe(false);

      // Retrieve stored data
      const memoryRetrieveRequest: MCPRequest = {
        jsonrpc: '2.0',
        id: 'memory-2',
        method: 'tools/call',
        params: {
          name: 'mcp__zen-swarm__memory_usage',
          arguments: {
            action: 'retrieve',
            key: 'test-session-data',
          },
        },
      };

      const retrieveResponse = await stdioMcpServer.processMessage(
        JSON.stringify(memoryRetrieveRequest)
      );
      const parsedRetrieveResponse = JSON.parse(retrieveResponse);

      expect(parsedRetrieveResponse?.result?.isError).toBe(false);

      const retrievedData = JSON.parse(
        parsedRetrieveResponse?.result?.content?.[0]?.text
      );
      expect(retrievedData).toMatchObject({
        sessionId: 'test-session-123',
        data: { important: true },
      });
    });

    it('should handle task orchestration workflows', async () => {
      // Initialize swarm first
      await stdioMcpServer.processMessage(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 'orch-init',
          method: 'tools/call',
          params: {
            name: 'mcp__zen-swarm__swarm_init',
            arguments: { topology: 'hierarchical', maxAgents: 4 },
          },
        })
      );

      // Spawn multiple agents
      await Promise.all([
        stdioMcpServer.processMessage(
          JSON.stringify({
            jsonrpc: '2.0',
            id: 'orch-spawn-1',
            method: 'tools/call',
            params: {
              name: 'mcp__zen-swarm__agent_spawn',
              arguments: { type: 'coordinator', name: 'main-coord' },
            },
          })
        ),
        stdioMcpServer.processMessage(
          JSON.stringify({
            jsonrpc: '2.0',
            id: 'orch-spawn-2',
            method: 'tools/call',
            params: {
              name: 'mcp__zen-swarm__agent_spawn',
              arguments: { type: 'worker', name: 'worker-1' },
            },
          })
        ),
      ]);

      // Orchestrate task
      const orchestrateRequest: MCPRequest = {
        jsonrpc: '2.0',
        id: 'orch-task',
        method: 'tools/call',
        params: {
          name: 'mcp__zen-swarm__task_orchestrate',
          arguments: {
            task: 'Process complex data analysis',
            strategy: 'parallel',
            assignees: ['main-coord', 'worker-1'],
          },
        },
      };

      const orchestrateResponse = await stdioMcpServer.processMessage(
        JSON.stringify(orchestrateRequest)
      );
      const parsedOrchResponse = JSON.parse(orchestrateResponse);

      expect(parsedOrchResponse?.result?.isError).toBe(false);
      expect(parsedOrchResponse?.result?.content?.[0]?.text).toContain(
        'Task orchestration initiated'
      );
    });

    it('should validate tool parameters according to JSON schema', async () => {
      const invalidRequest: MCPRequest = {
        jsonrpc: '2.0',
        id: 'invalid-1',
        method: 'tools/call',
        params: {
          name: 'mcp__zen-swarm__swarm_init',
          arguments: {
            topology: 'invalid_topology', // Invalid value
            maxAgents: 'not_a_number', // Invalid type
          },
        },
      };

      const response = await stdioMcpServer.processMessage(
        JSON.stringify(invalidRequest)
      );
      const parsedResponse = JSON.parse(response);

      expect(parsedResponse).toMatchObject({
        jsonrpc: '2.0',
        id: 'invalid-1',
        error: {
          code: expect.any(Number),
          message: expect.stringContaining('Invalid parameters'),
          data: expect.objectContaining({
            validationErrors: expect.any(Array),
          }),
        },
      });
    });
  });

  describe('Cross-Protocol Integration', () => {
    it('should coordinate between HTTP and Stdio MCP servers', async () => {
      // Start both servers
      httpMcpServer = new HttpMcpServer({ port: TEST_PORT });
      stdioMcpServer = new StdioMcpServer({ enableSwarmCoordination: true });

      await Promise.all([httpMcpServer.start(), stdioMcpServer.initialize()]);

      try {
        // Initialize swarm via HTTP MCP
        const httpSwarmInit = await networkHelper.httpPost(
          `http://localhost:${TEST_PORT}/mcp`,
          {
            jsonrpc: '2.0',
            id: 'cross-1',
            method: 'tools/call',
            params: {
              name: 'system_info',
              arguments: { detailed: true },
            },
          }
        );

        expect(httpSwarmInit.status).toBe(200);

        // Use same session context in Stdio MCP
        const stdioResponse = await stdioMcpServer.processMessage(
          JSON.stringify({
            jsonrpc: '2.0',
            id: 'cross-2',
            method: 'tools/call',
            params: {
              name: 'mcp__zen-swarm__swarm_init',
              arguments: {
                topology: 'mesh',
                maxAgents: 3,
                contextFromHttp: true,
              },
            },
          })
        );

        const parsedStdioResponse = JSON.parse(stdioResponse);
        expect(parsedStdioResponse?.result?.isError).toBe(false);

        // Verify coordination between protocols
        const statusCheck = await networkHelper.httpPost(
          `http://localhost:${TEST_PORT}/mcp`,
          {
            jsonrpc: '2.0',
            id: 'cross-3',
            method: 'tools/call',
            params: {
              name: 'project_status',
              arguments: {},
            },
          }
        );

        expect(statusCheck.status).toBe(200);
        expect(statusCheck.data.result.content[0]?.text).toContain(
          'Swarm coordination active'
        );
      } finally {
        await Promise.all([httpMcpServer.stop(), stdioMcpServer.shutdown()]);
      }
    });

    it('should share session state between protocol implementations', async () => {
      // This test verifies that session data can be accessed across different MCP implementations
      const sessionId = 'cross-protocol-session-123';

      stdioMcpServer = new StdioMcpServer({
        enableSwarmCoordination: true,
        sessionId,
      });

      await stdioMcpServer.initialize();

      // Store data via Stdio MCP
      await stdioMcpServer.processMessage(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 'share-1',
          method: 'tools/call',
          params: {
            name: 'mcp__zen-swarm__memory_usage',
            arguments: {
              action: 'store',
              key: `session:${sessionId}:data`,
              value: { crossProtocolTest: true, timestamp: Date.now() },
            },
          },
        })
      );

      // Start HTTP MCP with same session context
      httpMcpServer = new HttpMcpServer({
        port: TEST_PORT,
        sessionId,
      });

      await httpMcpServer.start();

      try {
        // Retrieve data via HTTP MCP
        const httpResponse = await networkHelper.httpPost(
          `http://localhost:${TEST_PORT}/mcp`,
          {
            jsonrpc: '2.0',
            id: 'share-2',
            method: 'tools/call',
            params: {
              name: 'project_status',
              arguments: {
                includeSessionData: true,
                sessionKey: `session:${sessionId}:data`,
              },
            },
          }
        );

        expect(httpResponse?.status).toBe(200);
        expect(httpResponse?.data?.result?.content?.[0]?.text).toContain(
          'crossProtocolTest'
        );
      } finally {
        await Promise.all([httpMcpServer.stop(), stdioMcpServer.shutdown()]);
      }
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle high-frequency requests without degradation', async () => {
      httpMcpServer = new HttpMcpServer({ port: TEST_PORT });
      await httpMcpServer.start();

      try {
        const requestCount = 100;
        const batchSize = 10;
        const totalBatches = requestCount / batchSize;

        const results: number[] = [];

        for (let batch = 0; batch < totalBatches; batch++) {
          const batchStartTime = Date.now();

          const batchRequests = Array.from({ length: batchSize }, (_, i) =>
            networkHelper.httpPost(`http://localhost:${TEST_PORT}/mcp`, {
              jsonrpc: '2.0',
              id: `load-${batch}-${i}`,
              method: 'tools/call',
              params: {
                name: 'system_info',
                arguments: { detailed: false },
              },
            })
          );

          const batchResponses = await Promise.all(batchRequests);
          const batchTime = Date.now() - batchStartTime;

          results?.push(batchTime);

          // All requests in batch should succeed
          batchResponses?.forEach((response: unknown) => {
            expect(response?.status).toBe(200);
            expect(response?.data?.result).toBeDefined();
          });
        }

        // Performance should remain consistent across batches
        const avgBatchTime =
          results?.reduce((a, b) => a + b, 0) / results.length;
        const maxBatchTime = Math.max(...results);
        const minBatchTime = Math.min(...results);

        expect(avgBatchTime).toBeLessThan(2000); // Average batch should be under 2 seconds
        expect(maxBatchTime / minBatchTime).toBeLessThan(3); // Max shouldn't be more than 3x min
      } finally {
        await httpMcpServer.stop();
      }
    });

    it('should maintain memory efficiency under sustained load', async () => {
      stdioMcpServer = new StdioMcpServer({
        enableSwarmCoordination: true,
        memoryPersistence: true,
      });

      await stdioMcpServer.initialize();

      try {
        const initialMemory = process.memoryUsage();

        // Simulate sustained operation
        for (let i = 0; i < 50; i++) {
          await stdioMcpServer.processMessage(
            JSON.stringify({
              jsonrpc: '2.0',
              id: `memory-test-${i}`,
              method: 'tools/call',
              params: {
                name: 'mcp__zen-swarm__memory_usage',
                arguments: {
                  action: 'store',
                  key: `test-data-${i}`,
                  value: { iteration: i, data: new Array(1000).fill('test') },
                },
              },
            })
          );

          // Periodic cleanup simulation
          if (i % 10 === 0) {
            await stdioMcpServer.processMessage(
              JSON.stringify({
                jsonrpc: '2.0',
                id: `cleanup-${i}`,
                method: 'tools/call',
                params: {
                  name: 'mcp__zen-swarm__swarm_status',
                  arguments: { cleanup: true },
                },
              })
            );
          }
        }

        const finalMemory = process.memoryUsage();
        const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

        // Memory increase should be reasonable (less than 100MB)
        expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
      } finally {
        await stdioMcpServer.shutdown();
      }
    });
  });
});
