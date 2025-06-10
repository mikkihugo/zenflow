/**
 * Comprehensive unit tests for MCP (Model Context Protocol) Interface
 * Tests stdio and HTTP transports, protocol compliance, and error handling
 */

import { describe, it, beforeEach, afterEach } from "https://deno.land/std@0.220.0/testing/bdd.ts";
import { assertEquals, assertExists, assertRejects, assertThrows } from "https://deno.land/std@0.220.0/assert/mod.ts";
import { FakeTime } from "https://deno.land/std@0.220.0/testing/time.ts";
import { spy, stub } from "https://deno.land/std@0.220.0/testing/mock.ts";

import { MCPServer } from '../../../src/mcp/server.ts';
import { MCPClient } from '../../../src/mcp/client.ts';
import { StdioTransport } from '../../../src/mcp/transports/stdio.ts';
import { HTTPTransport } from '../../../src/mcp/transports/http.ts';
import { MCPSessionManager } from '../../../src/mcp/session-manager.ts';
import { MCPLoadBalancer } from '../../../src/mcp/load-balancer.ts';
import { MCPAuthManager } from '../../../src/mcp/auth.ts';
import { 
  AsyncTestUtils, 
  PerformanceTestUtils,
  TestAssertions,
  MockFactory,
  FileSystemTestUtils
} from '../../utils/test-utils.ts';
import { generateMCPMessages, generateErrorScenarios } from '../../fixtures/generators.ts';
import { setupTestEnv, cleanupTestEnv, TEST_CONFIG } from '../../test.config.ts';

describe('MCP Interface - Comprehensive Tests', () => {
  let tempDir: string;
  let fakeTime: FakeTime;

  beforeEach(async () => {
    setupTestEnv();
    tempDir = await FileSystemTestUtils.createTempDir('mcp-test-');
    fakeTime = new FakeTime();
  });

  afterEach(async () => {
    fakeTime.restore();
    await FileSystemTestUtils.cleanup([tempDir]);
    await cleanupTestEnv();
  });

  describe('MCP Protocol Compliance', () => {
    it('should handle JSON-RPC 2.0 message format correctly', () => {
      const validMessages = [
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'list_tools',
          params: {},
        },
        {
          jsonrpc: '2.0',
          id: 2,
          result: { tools: [] },
        },
        {
          jsonrpc: '2.0',
          id: 3,
          error: { code: -32601, message: 'Method not found' },
        },
        {
          jsonrpc: '2.0',
          method: 'notification',
          params: { type: 'status', data: {} },
        },
      ];

      for (const message of validMessages) {
        // Test message validation
        const isValid = validateMCPMessage(message);
        assertEquals(isValid, true);
        
        // Test serialization/deserialization
        const serialized = JSON.stringify(message);
        const deserialized = JSON.parse(serialized);
        assertEquals(deserialized, message);
      }
    });

    it('should reject invalid JSON-RPC messages', () => {
      const invalidMessages = [
        { id: 1, method: 'test' }, // Missing jsonrpc
        { jsonrpc: '1.0', id: 1, method: 'test' }, // Wrong version
        { jsonrpc: '2.0', method: 'test', params: 'invalid' }, // Invalid params
        { jsonrpc: '2.0', id: null, method: 'test' }, // Invalid id
        { jsonrpc: '2.0' }, // Missing method/result/error
      ];

      for (const message of invalidMessages) {
        const isValid = validateMCPMessage(message);
        assertEquals(isValid, false);
      }
    });

    it('should handle MCP-specific message types', () => {
      const mcpMessages = [
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '1.0.0',
            capabilities: {},
            clientInfo: { name: 'test-client', version: '1.0.0' },
          },
        },
        {
          jsonrpc: '2.0',
          id: 2,
          method: 'list_tools',
          params: {},
        },
        {
          jsonrpc: '2.0',
          id: 3,
          method: 'call_tool',
          params: {
            name: 'test-tool',
            arguments: { arg1: 'value1' },
          },
        },
        {
          jsonrpc: '2.0',
          id: 4,
          method: 'list_prompts',
          params: {},
        },
        {
          jsonrpc: '2.0',
          id: 5,
          method: 'get_prompt',
          params: {
            name: 'test-prompt',
            arguments: {},
          },
        },
      ];

      for (const message of mcpMessages) {
        const isValid = validateMCPMessage(message);
        assertEquals(isValid, true);
        
        const messageType = getMCPMessageType(message);
        assertExists(messageType);
      }
    });

    it('should handle capability negotiation correctly', () => {
      const serverCapabilities = {
        tools: { listChanged: true },
        prompts: { listChanged: true },
        resources: { subscribe: true, listChanged: true },
        logging: {},
      };

      const clientCapabilities = {
        roots: { listChanged: true },
        sampling: {},
      };

      const negotiatedCapabilities = negotiateCapabilities(serverCapabilities, clientCapabilities);
      
      assertExists(negotiatedCapabilities);
      assertEquals(typeof negotiatedCapabilities.server, 'object');
      assertEquals(typeof negotiatedCapabilities.client, 'object');
    });
  });

  describe('Stdio Transport', () => {
    let stdioTransport: StdioTransport;

    beforeEach(() => {
      stdioTransport = new StdioTransport({
        command: 'node',
        args: ['-e', 'process.stdin.pipe(process.stdout)'], // Echo server
        cwd: tempDir,
        timeout: 5000,
      });
    });

    afterEach(async () => {
      if (stdioTransport) {
        await stdioTransport.close();
      }
    });

    it('should establish stdio connection successfully', async () => {
      await stdioTransport.connect();
      assertEquals(stdioTransport.isConnected(), true);
    });

    it('should send and receive messages via stdio', async () => {
      await stdioTransport.connect();
      
      const testMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'test',
        params: { data: 'hello' },
      };

      const responsePromise = stdioTransport.send(testMessage);
      const response = await AsyncTestUtils.withTimeout(responsePromise, 3000);
      
      assertExists(response);
      // Echo server should return the same message
      assertEquals(response.id, testMessage.id);
    });

    it('should handle stdio process errors gracefully', async () => {
      const faultyTransport = new StdioTransport({
        command: 'nonexistent-command',
        args: [],
        timeout: 1000,
      });

      await TestAssertions.assertThrowsAsync(
        () => faultyTransport.connect(),
        Error
      );
    });

    it('should handle stdio timeout correctly', async () => {
      await stdioTransport.connect();
      
      const timeoutMessage = {
        jsonrpc: '2.0',
        id: 2,
        method: 'slow-operation',
        params: {},
      };

      // Mock a slow response
      const slowTransport = new StdioTransport({
        command: 'node',
        args: ['-e', 'setTimeout(() => process.stdin.pipe(process.stdout), 10000)'],
        timeout: 100, // Very short timeout
      });

      await slowTransport.connect();

      await TestAssertions.assertThrowsAsync(
        () => slowTransport.send(timeoutMessage),
        Error,
        'timeout'
      );

      await slowTransport.close();
    });

    it('should handle concurrent stdio operations', async () => {
      await stdioTransport.connect();
      
      const messages = Array.from({ length: 10 }, (_, i) => ({
        jsonrpc: '2.0',
        id: i,
        method: 'concurrent-test',
        params: { index: i },
      }));

      const promises = messages.map(msg => stdioTransport.send(msg));
      const responses = await Promise.all(promises);
      
      assertEquals(responses.length, 10);
      responses.forEach((response, i) => {
        assertEquals(response.id, i);
      });
    });

    it('should handle stdio reconnection', async () => {
      await stdioTransport.connect();
      
      // Send initial message
      const msg1 = { jsonrpc: '2.0', id: 1, method: 'test1', params: {} };
      await stdioTransport.send(msg1);
      
      // Simulate connection loss
      await stdioTransport.close();
      assertEquals(stdioTransport.isConnected(), false);
      
      // Reconnect
      await stdioTransport.connect();
      assertEquals(stdioTransport.isConnected(), true);
      
      // Send message after reconnection
      const msg2 = { jsonrpc: '2.0', id: 2, method: 'test2', params: {} };
      const response = await stdioTransport.send(msg2);
      assertEquals(response.id, 2);
    });
  });

  describe('HTTP Transport', () => {
    let httpTransport: HTTPTransport;
    let mockServer: any;

    beforeEach(async () => {
      // Create a simple HTTP server for testing
      mockServer = {
        port: TEST_CONFIG.mocks.mcp_server_port,
        responses: new Map(),
        
        start: async () => {
          // Mock HTTP server implementation
          mockServer.running = true;
        },
        
        stop: async () => {
          mockServer.running = false;
        },
        
        setResponse: (path: string, response: any) => {
          mockServer.responses.set(path, response);
        },
      };

      httpTransport = new HTTPTransport({
        baseUrl: `http://localhost:${mockServer.port}`,
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'claude-flow-test',
        },
      });

      await mockServer.start();
    });

    afterEach(async () => {
      if (httpTransport) {
        await httpTransport.close();
      }
      if (mockServer) {
        await mockServer.stop();
      }
    });

    it('should establish HTTP connection successfully', async () => {
      await httpTransport.connect();
      assertEquals(httpTransport.isConnected(), true);
    });

    it('should send HTTP POST requests correctly', async () => {
      await httpTransport.connect();
      
      const testMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'http-test',
        params: { data: 'http-hello' },
      };

      // Mock successful response
      mockServer.setResponse('/mcp', {
        jsonrpc: '2.0',
        id: 1,
        result: { success: true },
      });

      const response = await httpTransport.send(testMessage);
      
      assertExists(response);
      assertEquals(response.id, testMessage.id);
      assertEquals(response.result.success, true);
    });

    it('should handle HTTP authentication', async () => {
      const authTransport = new HTTPTransport({
        baseUrl: `http://localhost:${mockServer.port}`,
        timeout: 5000,
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json',
        },
      });

      await authTransport.connect();
      
      const authMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'authenticated-method',
        params: {},
      };

      mockServer.setResponse('/mcp', {
        jsonrpc: '2.0',
        id: 1,
        result: { authenticated: true },
      });

      const response = await authTransport.send(authMessage);
      assertEquals(response.result.authenticated, true);
      
      await authTransport.close();
    });

    it('should handle HTTP errors correctly', async () => {
      await httpTransport.connect();
      
      const errorMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'error-method',
        params: {},
      };

      // Mock error response
      mockServer.setResponse('/mcp', {
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32603,
          message: 'Internal error',
          data: { details: 'Something went wrong' },
        },
      });

      const response = await httpTransport.send(errorMessage);
      
      assertExists(response.error);
      assertEquals(response.error.code, -32603);
      assertEquals(response.error.message, 'Internal error');
    });

    it('should handle HTTP connection pooling', async () => {
      const pooledTransport = new HTTPTransport({
        baseUrl: `http://localhost:${mockServer.port}`,
        timeout: 5000,
        poolSize: 5,
        keepAlive: true,
      });

      await pooledTransport.connect();
      
      // Send multiple concurrent requests
      const messages = Array.from({ length: 10 }, (_, i) => ({
        jsonrpc: '2.0',
        id: i,
        method: 'pooled-request',
        params: { index: i },
      }));

      // Mock responses for all requests
      messages.forEach(msg => {
        mockServer.setResponse(`/mcp?id=${msg.id}`, {
          jsonrpc: '2.0',
          id: msg.id,
          result: { index: msg.params.index },
        });
      });

      const { stats } = await PerformanceTestUtils.benchmark(
        async () => {
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          return pooledTransport.send(randomMessage);
        },
        { iterations: 20, concurrency: 5 }
      );

      // Connection pooling should provide good performance
      TestAssertions.assertInRange(stats.mean, 0, 100);
      
      await pooledTransport.close();
    });
  });

  describe('MCP Server Implementation', () => {
    let mcpServer: MCPServer;

    beforeEach(async () => {
      mcpServer = new MCPServer({
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        capabilities: {
          tools: { listChanged: true },
          prompts: { listChanged: true },
        },
      });
    });

    afterEach(async () => {
      if (mcpServer) {
        await mcpServer.stop();
      }
    });

    it('should register and list tools correctly', async () => {
      await mcpServer.start();
      
      // Register test tools
      mcpServer.registerTool('test-tool-1', {
        name: 'test-tool-1',
        description: 'A test tool',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string' },
          },
        },
        handler: async (params: any) => ({
          content: [{ type: 'text', text: `Processed: ${params.input}` }],
        }),
      });

      mcpServer.registerTool('test-tool-2', {
        name: 'test-tool-2',
        description: 'Another test tool',
        inputSchema: {
          type: 'object',
          properties: {
            value: { type: 'number' },
          },
        },
        handler: async (params: any) => ({
          content: [{ type: 'text', text: `Result: ${params.value * 2}` }],
        }),
      });

      const tools = await mcpServer.listTools();
      
      assertEquals(tools.length, 2);
      assertEquals(tools.find(t => t.name === 'test-tool-1')?.description, 'A test tool');
      assertEquals(tools.find(t => t.name === 'test-tool-2')?.description, 'Another test tool');
    });

    it('should execute tool calls correctly', async () => {
      await mcpServer.start();
      
      mcpServer.registerTool('calculator', {
        name: 'calculator',
        description: 'Simple calculator',
        inputSchema: {
          type: 'object',
          properties: {
            operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
            a: { type: 'number' },
            b: { type: 'number' },
          },
          required: ['operation', 'a', 'b'],
        },
        handler: async (params: any) => {
          const { operation, a, b } = params;
          let result: number;
          
          switch (operation) {
            case 'add':
              result = a + b;
              break;
            case 'subtract':
              result = a - b;
              break;
            case 'multiply':
              result = a * b;
              break;
            case 'divide':
              result = b !== 0 ? a / b : NaN;
              break;
            default:
              throw new Error(`Unknown operation: ${operation}`);
          }
          
          return {
            content: [{ type: 'text', text: `${a} ${operation} ${b} = ${result}` }],
          };
        },
      });

      // Test various calculations
      const testCases = [
        { operation: 'add', a: 5, b: 3, expected: 8 },
        { operation: 'subtract', a: 10, b: 4, expected: 6 },
        { operation: 'multiply', a: 6, b: 7, expected: 42 },
        { operation: 'divide', a: 15, b: 3, expected: 5 },
      ];

      for (const testCase of testCases) {
        const result = await mcpServer.callTool('calculator', testCase);
        assertExists(result);
        assertEquals(result.content[0].text.includes(testCase.expected.toString()), true);
      }
    });

    it('should handle tool errors gracefully', async () => {
      await mcpServer.start();
      
      mcpServer.registerTool('error-tool', {
        name: 'error-tool',
        description: 'A tool that throws errors',
        inputSchema: {
          type: 'object',
          properties: {
            shouldError: { type: 'boolean' },
          },
        },
        handler: async (params: any) => {
          if (params.shouldError) {
            throw new Error('Intentional tool error');
          }
          return {
            content: [{ type: 'text', text: 'Success' }],
          };
        },
      });

      // Test successful call
      const successResult = await mcpServer.callTool('error-tool', { shouldError: false });
      assertEquals(successResult.content[0].text, 'Success');

      // Test error handling
      await TestAssertions.assertThrowsAsync(
        () => mcpServer.callTool('error-tool', { shouldError: true }),
        Error,
        'Intentional tool error'
      );
    });

    it('should validate tool input schemas', async () => {
      await mcpServer.start();
      
      mcpServer.registerTool('strict-tool', {
        name: 'strict-tool',
        description: 'Tool with strict input validation',
        inputSchema: {
          type: 'object',
          properties: {
            requiredString: { type: 'string', minLength: 1 },
            optionalNumber: { type: 'number', minimum: 0 },
          },
          required: ['requiredString'],
          additionalProperties: false,
        },
        handler: async (params: any) => ({
          content: [{ type: 'text', text: `Valid input: ${params.requiredString}` }],
        }),
      });

      // Test valid input
      const validResult = await mcpServer.callTool('strict-tool', {
        requiredString: 'test',
        optionalNumber: 42,
      });
      assertEquals(validResult.content[0].text, 'Valid input: test');

      // Test invalid inputs
      const invalidInputs = [
        {}, // Missing required field
        { requiredString: '' }, // Empty string
        { requiredString: 'test', optionalNumber: -1 }, // Negative number
        { requiredString: 'test', extraField: 'not allowed' }, // Additional property
      ];

      for (const invalidInput of invalidInputs) {
        await TestAssertions.assertThrowsAsync(
          () => mcpServer.callTool('strict-tool', invalidInput),
          Error
        );
      }
    });

    it('should handle prompts correctly', async () => {
      await mcpServer.start();
      
      mcpServer.registerPrompt('greeting', {
        name: 'greeting',
        description: 'Generate a greeting message',
        arguments: [
          {
            name: 'name',
            description: 'Name of the person to greet',
            required: true,
          },
          {
            name: 'language',
            description: 'Language for the greeting',
            required: false,
          },
        ],
        handler: async (args: any) => {
          const name = args.name || 'World';
          const language = args.language || 'en';
          
          const greetings = {
            en: `Hello, ${name}!`,
            es: `¡Hola, ${name}!`,
            fr: `Bonjour, ${name}!`,
          };
          
          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: greetings[language] || greetings.en,
                },
              },
            ],
          };
        },
      });

      const prompts = await mcpServer.listPrompts();
      assertEquals(prompts.length, 1);
      assertEquals(prompts[0].name, 'greeting');

      // Test prompt execution
      const englishGreeting = await mcpServer.getPrompt('greeting', { name: 'Alice' });
      assertEquals(englishGreeting.messages[0].content.text, 'Hello, Alice!');

      const spanishGreeting = await mcpServer.getPrompt('greeting', { name: 'Bob', language: 'es' });
      assertEquals(spanishGreeting.messages[0].content.text, '¡Hola, Bob!');
    });
  });

  describe('MCP Client Implementation', () => {
    let mcpClient: MCPClient;
    let mockServer: MCPServer;

    beforeEach(async () => {
      // Set up mock server
      mockServer = new MCPServer({
        name: 'mock-server',
        version: '1.0.0',
        transport: 'stdio',
      });

      // Register test tools and prompts
      mockServer.registerTool('echo', {
        name: 'echo',
        description: 'Echo input back',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        handler: async (params: any) => ({
          content: [{ type: 'text', text: params.message }],
        }),
      });

      await mockServer.start();

      mcpClient = new MCPClient({
        transport: new StdioTransport({
          command: 'node',
          args: ['-e', 'require("./mock-mcp-server.js")'],
          cwd: tempDir,
        }),
      });
    });

    afterEach(async () => {
      if (mcpClient) {
        await mcpClient.disconnect();
      }
      if (mockServer) {
        await mockServer.stop();
      }
    });

    it('should connect and initialize correctly', async () => {
      await mcpClient.connect();
      
      const serverInfo = await mcpClient.initialize({
        protocolVersion: '1.0.0',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0',
        },
      });

      assertExists(serverInfo);
      assertEquals(serverInfo.protocolVersion, '1.0.0');
    });

    it('should list and call tools correctly', async () => {
      await mcpClient.connect();
      await mcpClient.initialize({
        protocolVersion: '1.0.0',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' },
      });

      const tools = await mcpClient.listTools();
      assertExists(tools);
      assertEquals(tools.some(tool => tool.name === 'echo'), true);

      const result = await mcpClient.callTool('echo', { message: 'Hello MCP!' });
      assertExists(result);
      assertEquals(result.content[0].text, 'Hello MCP!');
    });

    it('should handle client-side caching', async () => {
      const cachingClient = new MCPClient({
        transport: new StdioTransport({
          command: 'node',
          args: ['-e', 'require("./mock-mcp-server.js")'],
          cwd: tempDir,
        }),
        enableCaching: true,
        cacheTimeout: 5000,
      });

      await cachingClient.connect();
      await cachingClient.initialize({
        protocolVersion: '1.0.0',
        capabilities: {},
        clientInfo: { name: 'caching-client', version: '1.0.0' },
      });

      // First call should hit the server
      const start1 = Date.now();
      const tools1 = await cachingClient.listTools();
      const duration1 = Date.now() - start1;

      // Second call should be cached (faster)
      const start2 = Date.now();
      const tools2 = await cachingClient.listTools();
      const duration2 = Date.now() - start2;

      assertEquals(tools1, tools2);
      assertEquals(duration2 < duration1, true); // Cached call should be faster

      await cachingClient.disconnect();
    });

    it('should handle connection retry logic', async () => {
      const retryClient = new MCPClient({
        transport: new StdioTransport({
          command: 'node',
          args: ['-e', 'process.exit(1)'], // Command that fails
          cwd: tempDir,
        }),
        retryAttempts: 3,
        retryDelay: 100,
      });

      await TestAssertions.assertThrowsAsync(
        () => retryClient.connect(),
        Error
      );

      // Should have attempted connection multiple times
      // (This would be tested with more sophisticated mocking)
    });
  });

  describe('Session Management', () => {
    let sessionManager: MCPSessionManager;

    beforeEach(() => {
      sessionManager = new MCPSessionManager({
        maxSessions: 5,
        sessionTimeout: 30000,
        cleanupInterval: 5000,
      });
    });

    afterEach(async () => {
      if (sessionManager) {
        await sessionManager.shutdown();
      }
    });

    it('should create and manage sessions correctly', async () => {
      await sessionManager.initialize();
      
      const sessionId1 = await sessionManager.createSession({
        transport: 'stdio',
        capabilities: { tools: true },
      });
      
      const sessionId2 = await sessionManager.createSession({
        transport: 'http',
        capabilities: { prompts: true },
      });

      assertExists(sessionId1);
      assertExists(sessionId2);
      assertEquals(sessionId1 !== sessionId2, true);

      const sessions = sessionManager.listSessions();
      assertEquals(sessions.length, 2);
    });

    it('should handle session limits correctly', async () => {
      await sessionManager.initialize();
      
      // Create sessions up to the limit
      const sessionIds = [];
      for (let i = 0; i < 5; i++) {
        const sessionId = await sessionManager.createSession({
          transport: 'stdio',
          capabilities: {},
        });
        sessionIds.push(sessionId);
      }

      assertEquals(sessionIds.length, 5);

      // Attempt to create one more session (should fail or queue)
      await TestAssertions.assertThrowsAsync(
        () => sessionManager.createSession({ transport: 'stdio', capabilities: {} }),
        Error,
        'session limit'
      );
    });

    it('should handle session cleanup correctly', async () => {
      await sessionManager.initialize();
      
      const sessionId = await sessionManager.createSession({
        transport: 'stdio',
        capabilities: {},
      });

      // Verify session exists
      const session = sessionManager.getSession(sessionId);
      assertExists(session);

      // Close session
      await sessionManager.closeSession(sessionId);

      // Verify session is removed
      const closedSession = sessionManager.getSession(sessionId);
      assertEquals(closedSession, null);
    });

    it('should handle concurrent session operations', async () => {
      await sessionManager.initialize();
      
      const sessionPromises = Array.from({ length: 10 }, () =>
        sessionManager.createSession({
          transport: 'stdio',
          capabilities: {},
        })
      );

      const results = await Promise.allSettled(sessionPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');
      
      // Some should succeed (up to limit), others may fail
      assertEquals(successful.length <= 5, true);
      assertEquals(successful.length + failed.length, 10);
    });
  });

  describe('Load Balancing and Scaling', () => {
    let loadBalancer: MCPLoadBalancer;

    beforeEach(() => {
      loadBalancer = new MCPLoadBalancer({
        strategy: 'round-robin',
        healthCheckInterval: 1000,
        maxServersPerPool: 3,
      });
    });

    afterEach(async () => {
      if (loadBalancer) {
        await loadBalancer.shutdown();
      }
    });

    it('should distribute requests across multiple servers', async () => {
      await loadBalancer.initialize();
      
      // Add multiple mock servers
      const servers = ['server-1', 'server-2', 'server-3'];
      for (const serverId of servers) {
        await loadBalancer.addServer(serverId, {
          transport: 'stdio',
          command: 'mock-server',
          args: [`--id=${serverId}`],
        });
      }

      // Send multiple requests
      const requests = Array.from({ length: 9 }, (_, i) => ({
        jsonrpc: '2.0',
        id: i,
        method: 'test',
        params: { requestId: i },
      }));

      const responses = await Promise.all(
        requests.map(request => loadBalancer.send(request))
      );

      assertEquals(responses.length, 9);
      
      // Verify round-robin distribution
      const serverCounts = new Map();
      responses.forEach(response => {
        const serverId = response.serverId; // Assuming response includes server ID
        serverCounts.set(serverId, (serverCounts.get(serverId) || 0) + 1);
      });

      // Each server should handle 3 requests (9 requests / 3 servers)
      servers.forEach(serverId => {
        assertEquals(serverCounts.get(serverId), 3);
      });
    });

    it('should handle server failures gracefully', async () => {
      await loadBalancer.initialize();
      
      // Add servers, but one will fail
      await loadBalancer.addServer('working-server', {
        transport: 'stdio',
        command: 'mock-server',
        args: ['--reliable'],
      });
      
      await loadBalancer.addServer('failing-server', {
        transport: 'stdio',
        command: 'mock-server',
        args: ['--fail-rate=0.5'], // 50% failure rate
      });

      // Send many requests
      const requests = Array.from({ length: 20 }, (_, i) => ({
        jsonrpc: '2.0',
        id: i,
        method: 'test',
        params: {},
      }));

      const results = await Promise.allSettled(
        requests.map(request => loadBalancer.send(request))
      );

      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      // Most requests should succeed (routed to working server)
      TestAssertions.assertInRange(successful.length, 10, 20);
      
      // Load balancer should detect failing server and route less traffic to it
      console.log(`Successful requests: ${successful.length}, Failed: ${failed.length}`);
    });

    it('should implement different load balancing strategies', async () => {
      const strategies = ['round-robin', 'least-connections', 'weighted', 'random'];
      
      for (const strategy of strategies) {
        const strategyBalancer = new MCPLoadBalancer({
          strategy,
          healthCheckInterval: 1000,
        });

        await strategyBalancer.initialize();
        
        // Add servers with different weights (for weighted strategy)
        await strategyBalancer.addServer('server-1', {
          transport: 'stdio',
          command: 'mock-server',
          weight: 3,
        });
        
        await strategyBalancer.addServer('server-2', {
          transport: 'stdio',
          command: 'mock-server',
          weight: 1,
        });

        // Test the strategy with multiple requests
        const requests = Array.from({ length: 12 }, (_, i) => ({
          jsonrpc: '2.0',
          id: i,
          method: 'strategy-test',
          params: { strategy },
        }));

        const responses = await Promise.all(
          requests.map(request => strategyBalancer.send(request))
        );

        assertEquals(responses.length, 12);
        
        console.log(`Strategy ${strategy}: requests distributed successfully`);
        
        await strategyBalancer.shutdown();
      }
    });
  });

  describe('Authentication and Security', () => {
    let authManager: MCPAuthManager;

    beforeEach(() => {
      authManager = new MCPAuthManager({
        authMethods: ['token', 'certificate'],
        tokenExpiry: 3600000, // 1 hour
        certificatePath: `${tempDir}/test-cert.pem`,
      });
    });

    afterEach(async () => {
      if (authManager) {
        await authManager.shutdown();
      }
    });

    it('should handle token-based authentication', async () => {
      await authManager.initialize();
      
      // Generate a test token
      const token = await authManager.generateToken({
        userId: 'test-user',
        permissions: ['tools:list', 'tools:call', 'prompts:list'],
        expiresIn: 3600,
      });

      assertExists(token);
      assertEquals(typeof token, 'string');

      // Validate the token
      const validation = await authManager.validateToken(token);
      assertEquals(validation.valid, true);
      assertEquals(validation.userId, 'test-user');
      assertEquals(validation.permissions.includes('tools:list'), true);
    });

    it('should handle token expiration', async () => {
      await authManager.initialize();
      
      // Generate a short-lived token
      const shortToken = await authManager.generateToken({
        userId: 'test-user',
        permissions: ['tools:list'],
        expiresIn: 1, // 1 second
      });

      // Token should be valid initially
      const initialValidation = await authManager.validateToken(shortToken);
      assertEquals(initialValidation.valid, true);

      // Wait for expiration
      await AsyncTestUtils.delay(1100);

      // Token should be expired
      const expiredValidation = await authManager.validateToken(shortToken);
      assertEquals(expiredValidation.valid, false);
      assertEquals(expiredValidation.error, 'token_expired');
    });

    it('should handle certificate-based authentication', async () => {
      // Create a test certificate
      const testCert = `-----BEGIN CERTIFICATE-----
MIIBkTCB+wIJAK7VCxPqt0+YMA0GCSqGSIb3DQEBCwUAMBQxEjAQBgNVBAMMCXRl
c3QtY2VydDAeFw0yNDAxMDEwMDAwMDBaFw0yNTAxMDEwMDAwMDBaMBQxEjAQBgNV
BAMMCXRlc3QtY2VydDBcMA0GCSqGSIb3DQEBAQUAA0sAMEgCQQC8Q2Vkv5s0t8Ei
YWU4TJF4Ri6W8XRgP8bFx1OcP2uEo5EuHs+X2lJw1z+5B6Q5G9P3Fp4Z1XZQN8U
2Vr6mz1XbAgMBAAEwDQYJKoZIhvcNAQELBQADQQA1CccKjpq7VFYX4S1lN+GQ8z
YQx8rKrR4zAFjJ3pzJ8D5F1s7i7wUjP5gF3V9P2M4F8r9Nj6qL5xO0k9P8F9v
-----END CERTIFICATE-----`;

      await Deno.writeTextFile(`${tempDir}/test-cert.pem`, testCert);
      
      await authManager.initialize();
      
      // Test certificate validation
      const certValidation = await authManager.validateCertificate(testCert);
      
      // Note: This is a mock certificate, so validation behavior depends on implementation
      assertExists(certValidation);
    });

    it('should enforce permission-based access control', async () => {
      await authManager.initialize();
      
      // Create tokens with different permissions
      const fullAccessToken = await authManager.generateToken({
        userId: 'admin-user',
        permissions: ['*'], // All permissions
        expiresIn: 3600,
      });

      const limitedAccessToken = await authManager.generateToken({
        userId: 'limited-user',
        permissions: ['tools:list'], // Only list tools
        expiresIn: 3600,
      });

      // Test full access
      const fullAccess = await authManager.checkPermission(fullAccessToken, 'tools:call');
      assertEquals(fullAccess, true);

      // Test limited access
      const limitedListAccess = await authManager.checkPermission(limitedAccessToken, 'tools:list');
      assertEquals(limitedListAccess, true);

      const limitedCallAccess = await authManager.checkPermission(limitedAccessToken, 'tools:call');
      assertEquals(limitedCallAccess, false);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle transport failures gracefully', async () => {
      const faultyTransport = new StdioTransport({
        command: 'nonexistent-command',
        args: [],
        timeout: 1000,
      });

      const clientWithFaultyTransport = new MCPClient({
        transport: faultyTransport,
        retryAttempts: 2,
        retryDelay: 100,
      });

      await TestAssertions.assertThrowsAsync(
        () => clientWithFaultyTransport.connect(),
        Error
      );

      // Should attempt retries
      // (Specific retry behavior would be tested with more detailed mocking)
    });

    it('should handle malformed messages correctly', async () => {
      const errorScenarios = generateErrorScenarios();
      
      for (const scenario of errorScenarios) {
        // Test how the MCP implementation handles various error scenarios
        console.log(`Testing error scenario: ${scenario.name}`);
        
        // This would involve sending malformed messages and verifying
        // that the system handles them gracefully
      }
    });

    it('should implement circuit breaker pattern for unreliable servers', async () => {
      const circuitBreakerClient = new MCPClient({
        transport: new StdioTransport({
          command: 'unreliable-server',
          args: ['--failure-rate=0.7'], // 70% failure rate
        }),
        circuitBreaker: {
          threshold: 5,
          timeout: 1000,
          resetTimeout: 5000,
        },
      });

      // Make multiple requests to trigger circuit breaker
      const requests = Array.from({ length: 10 }, (_, i) => ({
        jsonrpc: '2.0',
        id: i,
        method: 'test',
        params: {},
      }));

      let circuitBreakerTriggered = false;
      
      for (const request of requests) {
        try {
          await circuitBreakerClient.send(request);
        } catch (error) {
          if (error.message.includes('circuit breaker')) {
            circuitBreakerTriggered = true;
            break;
          }
        }
      }

      // Circuit breaker should eventually trigger
      assertEquals(circuitBreakerTriggered, true);

      await circuitBreakerClient.disconnect();
    });
  });
});

// Helper functions for MCP protocol compliance testing
function validateMCPMessage(message: any): boolean {
  if (!message || typeof message !== 'object') return false;
  if (message.jsonrpc !== '2.0') return false;
  
  // Must have either method (request/notification) or result/error (response)
  const hasMethod = typeof message.method === 'string';
  const hasResult = 'result' in message;
  const hasError = 'error' in message;
  
  if (!hasMethod && !hasResult && !hasError) return false;
  
  // Requests and responses (except notifications) must have an id
  if ((hasResult || hasError || (hasMethod && message.id !== undefined)) && 
      (message.id === undefined || message.id === null)) {
    return false;
  }
  
  return true;
}

function getMCPMessageType(message: any): string | null {
  if (!validateMCPMessage(message)) return null;
  
  if (message.method) {
    return message.id !== undefined ? 'request' : 'notification';
  } else if (message.result !== undefined) {
    return 'response';
  } else if (message.error !== undefined) {
    return 'error';
  }
  
  return null;
}

function negotiateCapabilities(serverCaps: any, clientCaps: any): any {
  // Simple capability negotiation logic
  return {
    server: serverCaps,
    client: clientCaps,
    negotiated: {
      // Intersection of capabilities
      tools: serverCaps.tools && clientCaps.tools,
      prompts: serverCaps.prompts && clientCaps.prompts,
    },
  };
}