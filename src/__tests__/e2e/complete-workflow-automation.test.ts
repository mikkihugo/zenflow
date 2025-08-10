/**
 * Complete Workflow Automation E2E Test Suite
 * End-to-end testing of document-driven development flows
 */

import { StdioMcpServer } from '../../coordination/mcp/mcp-server';
import { SwarmCoordinator } from '../../coordination/swarm/core/swarm-coordinator';
import { DocumentDrivenSystem } from '../../core/document-driven-system';
import { HttpMcpServer } from '../../interfaces/mcp/http-mcp-server';
import { WebInterfaceServer } from '../../interfaces/web/web-interface-server';
import { FileSystemTestHelper } from '../helpers/filesystem-test-helper';
import { IntegrationTestSetup } from '../helpers/integration-test-setup';
import { NetworkTestHelper } from '../helpers/network-test-helper';

describe('Complete Workflow Automation E2E Tests', () => {
  let documentSystem: DocumentDrivenSystem;
  let swarmCoordinator: SwarmCoordinator;
  let httpMcpServer: HttpMcpServer;
  let stdioMcpServer: StdioMcpServer;
  let webServer: WebInterfaceServer;
  let testSetup: IntegrationTestSetup;
  let fsHelper: FileSystemTestHelper;
  let networkHelper: NetworkTestHelper;

  const TEST_PROJECT_PATH = '/tmp/claude-zen-e2e-test';
  const HTTP_MCP_PORT = 3457;
  const WEB_SERVER_PORT = 3458;
  const E2E_TIMEOUT = 120000; // 2 minutes

  beforeAll(async () => {
    testSetup = new IntegrationTestSetup();
    fsHelper = new FileSystemTestHelper();
    networkHelper = new NetworkTestHelper();

    await testSetup.initializeFullEnvironment();
    await fsHelper.createTestDirectory(TEST_PROJECT_PATH);
  }, E2E_TIMEOUT);

  afterAll(async () => {
    await testSetup.cleanup();
    await fsHelper.cleanup();
  });

  describe('Vision to Code Workflow', () => {
    it(
      'should execute complete vision → ADR → PRD → code workflow',
      async () => {
        // Phase 1: Initialize all systems
        documentSystem = new DocumentDrivenSystem({
          projectPath: TEST_PROJECT_PATH,
          enableAI: true,
          autoGeneration: true,
        });

        swarmCoordinator = new SwarmCoordinator({
          topology: 'hierarchical',
          maxAgents: 8,
          enableOptimizations: true,
        });

        httpMcpServer = new HttpMcpServer({ port: HTTP_MCP_PORT });
        stdioMcpServer = new StdioMcpServer({ enableSwarmCoordination: true });
        webServer = new WebInterfaceServer({ port: WEB_SERVER_PORT });

        await Promise.all([
          documentSystem.initialize(),
          swarmCoordinator.initializeSwarm({ topology: 'hierarchical', agentCount: 6 }),
          httpMcpServer.start(),
          stdioMcpServer.initialize(),
          webServer.start(),
        ]);

        // Phase 2: Create vision document
        const visionContent = `
# Task Management System Vision

## Overview
Build a modern task management system with real-time collaboration, AI-powered insights, and multi-platform support.

## Key Features
- Real-time task synchronization
- AI-powered task prioritization
- Team collaboration tools
- Mobile and desktop clients
- Integration with popular tools

## Technical Requirements
- REST API with GraphQL
- WebSocket real-time updates
- PostgreSQL database
- React frontend
- Node.js backend
- Docker deployment

## Success Criteria
- Handle 1000+ concurrent users
- Sub-100ms API response times
- 99.9% uptime
- Mobile-first responsive design
`;

        const visionPath = await fsHelper.writeFile(
          `${TEST_PROJECT_PATH}/docs/01-vision/task-management-vision.md`,
          visionContent
        );

        // Phase 3: Process vision through HTTP MCP (simulate Claude Desktop)
        const visionProcessRequest = {
          jsonrpc: '2.0',
          id: 'vision-process-1',
          method: 'tools/call',
          params: {
            name: 'project_init',
            arguments: {
              projectPath: TEST_PROJECT_PATH,
              visionDocument: visionPath,
              template: 'advanced',
            },
          },
        };

        const visionResponse = await networkHelper.httpPost(
          `http://localhost:${HTTP_MCP_PORT}/mcp`,
          visionProcessRequest
        );

        expect(visionResponse?.status).toBe(200);
        expect(visionResponse?.data?.result?.content?.[0]?.text).toContain('Project initialized');

        // Phase 4: Generate ADRs through swarm coordination
        const adrGenerationResult = await swarmCoordinator.orchestrateTask({
          type: 'document_generation',
          input: {
            sourceDocument: visionPath,
            outputType: 'adr',
            count: 3,
          },
          strategy: 'parallel',
          agents: ['architect', 'analyst', 'coordinator'],
        });

        expect(adrGenerationResult?.success).toBe(true);
        expect(adrGenerationResult?.generatedDocuments.length).toBe(3);

        // Verify ADR files were created
        const adrFiles = await fsHelper.listFiles(`${TEST_PROJECT_PATH}/docs/02-adrs`);
        expect(adrFiles.length).toBeGreaterThanOrEqual(3);

        // Phase 5: Generate PRDs from ADRs using Stdio MCP
        const prdGenerationRequest = JSON.stringify({
          jsonrpc: '2.0',
          id: 'prd-gen-1',
          method: 'tools/call',
          params: {
            name: 'mcp__zen-swarm__task_orchestrate',
            arguments: {
              task: 'Generate detailed PRDs from ADRs',
              strategy: 'sequential',
              input: {
                adrDocuments: adrFiles,
                outputPath: `${TEST_PROJECT_PATH}/docs/03-prds`,
              },
            },
          },
        });

        const prdResponse = await stdioMcpServer.processMessage(prdGenerationRequest);
        const parsedPrdResponse = JSON.parse(prdResponse);

        expect(parsedPrdResponse?.result?.isError).toBe(false);
        expect(parsedPrdResponse?.result?.content?.[0]?.text).toContain('PRDs generated');

        // Verify PRD files
        const prdFiles = await fsHelper.listFiles(`${TEST_PROJECT_PATH}/docs/03-prds`);
        expect(prdFiles.length).toBeGreaterThanOrEqual(2);

        // Phase 6: Generate implementation code
        const codeGenerationResult = await swarmCoordinator.orchestrateTask({
          type: 'code_generation',
          input: {
            prdDocuments: prdFiles,
            outputPath: `${TEST_PROJECT_PATH}/src`,
            architecture: 'microservices',
            technologies: ['node.js', 'react', 'postgresql'],
          },
          strategy: 'adaptive',
          agents: ['coder', 'architect', 'reviewer'],
        });

        expect(codeGenerationResult?.success).toBe(true);
        expect(codeGenerationResult?.generatedFiles.length).toBeGreaterThan(10);

        // Verify code structure
        const srcFiles = await fsHelper.listFilesRecursive(`${TEST_PROJECT_PATH}/src`);
        expect(srcFiles.length).toBeGreaterThan(10);

        const hasBackend = srcFiles.some((f) => f.includes('backend') || f.includes('api'));
        const hasFrontend = srcFiles.some((f) => f.includes('frontend') || f.includes('client'));
        const hasDatabase = srcFiles.some((f) => f.includes('database') || f.includes('schema'));

        expect(hasBackend).toBe(true);
        expect(hasFrontend).toBe(true);
        expect(hasDatabase).toBe(true);

        // Phase 7: Monitor workflow via web interface
        const webStatusResponse = await networkHelper.httpGet(
          `http://localhost:${WEB_SERVER_PORT}/api/status`
        );

        expect(webStatusResponse?.status).toBe(200);
        expect(webStatusResponse?.data?.projectStatus).toBe('active');
        expect(webStatusResponse?.data?.workflowStage).toBe('implementation');

        // Phase 8: Verify complete project structure
        const projectStructure = await fsHelper.getDirectoryStructure(TEST_PROJECT_PATH);

        expect(projectStructure).toMatchObject({
          docs: {
            '01-vision': expect.any(Object),
            '02-adrs': expect.any(Object),
            '03-prds': expect.any(Object),
          },
          src: expect.any(Object),
          tests: expect.any(Object),
        });

        // Cleanup
        await Promise.all([
          httpMcpServer.stop(),
          stdioMcpServer.shutdown(),
          webServer.stop(),
          swarmCoordinator.shutdown(),
        ]);
      },
      E2E_TIMEOUT
    );

    it('should handle workflow failures and recovery gracefully', async () => {
      // Initialize systems
      documentSystem = new DocumentDrivenSystem({ projectPath: TEST_PROJECT_PATH });
      swarmCoordinator = new SwarmCoordinator({
        topology: 'mesh',
        maxAgents: 4,
        faultTolerance: true,
      });

      await Promise.all([
        documentSystem.initialize(),
        swarmCoordinator.initializeSwarm({ topology: 'mesh', agentCount: 4 }),
      ]);

      // Create invalid vision document to trigger failure
      const invalidVisionContent = `
# Invalid Vision

This vision document is intentionally malformed to test error handling.

## Missing Required Sections
- No technical requirements
- No success criteria
- Incomplete feature descriptions
`;

      const invalidVisionPath = await fsHelper.writeFile(
        `${TEST_PROJECT_PATH}/docs/01-vision/invalid-vision.md`,
        invalidVisionContent
      );

      // Attempt to process invalid document
      const failureResult = await swarmCoordinator.orchestrateTask({
        type: 'document_processing',
        input: {
          sourceDocument: invalidVisionPath,
          outputType: 'adr',
        },
        strategy: 'resilient',
        maxRetries: 3,
      });

      // Should fail gracefully
      expect(failureResult?.success).toBe(false);
      expect(failureResult?.errors.length).toBeGreaterThan(0);
      expect(failureResult?.recoveryAttempts).toBeGreaterThan(0);

      // System should remain healthy
      const systemHealth = await swarmCoordinator.getHealthMetrics();
      expect(systemHealth.overallHealth).toBeGreaterThan(0.7);

      // Should be able to recover with valid document
      const validVisionContent = `
# Corrected Vision

## Overview
A simple task tracker application.

## Technical Requirements
- Web-based interface
- Local storage
- Progressive web app

## Success Criteria
- Fast load times
- Offline capability
- Mobile responsive
`;

      const validVisionPath = await fsHelper.writeFile(
        `${TEST_PROJECT_PATH}/docs/01-vision/corrected-vision.md`,
        validVisionContent
      );

      const recoveryResult = await swarmCoordinator.orchestrateTask({
        type: 'document_processing',
        input: {
          sourceDocument: validVisionPath,
          outputType: 'adr',
        },
        strategy: 'standard',
      });

      expect(recoveryResult?.success).toBe(true);
      expect(recoveryResult?.generatedDocuments.length).toBeGreaterThan(0);

      await swarmCoordinator.shutdown();
    });
  });

  describe('Multi-Interface Coordination', () => {
    it('should coordinate between HTTP MCP, Stdio MCP, and Web interfaces', async () => {
      // Start all interfaces
      httpMcpServer = new HttpMcpServer({ port: HTTP_MCP_PORT });
      stdioMcpServer = new StdioMcpServer({ enableSwarmCoordination: true });
      webServer = new WebInterfaceServer({ port: WEB_SERVER_PORT });

      await Promise.all([httpMcpServer.start(), stdioMcpServer.initialize(), webServer.start()]);

      // Create session ID for coordination
      const sessionId = `multi-interface-session-${Date.now()}`;

      // Phase 1: Initialize project via HTTP MCP (Claude Desktop simulation)
      const httpInitRequest = {
        jsonrpc: '2.0',
        id: 'http-init',
        method: 'tools/call',
        params: {
          name: 'project_init',
          arguments: {
            projectPath: TEST_PROJECT_PATH,
            sessionId,
            template: 'basic',
          },
        },
      };

      const httpResponse = await networkHelper.httpPost(
        `http://localhost:${HTTP_MCP_PORT}/mcp`,
        httpInitRequest
      );

      expect(httpResponse?.status).toBe(200);
      expect(httpResponse?.data?.result?.content?.[0]?.text).toContain('Project initialized');

      // Phase 2: Continue workflow via Stdio MCP (Claude Code simulation)
      const stdioWorkflowRequest = JSON.stringify({
        jsonrpc: '2.0',
        id: 'stdio-workflow',
        method: 'tools/call',
        params: {
          name: 'mcp__zen-swarm__swarm_init',
          arguments: {
            topology: 'star',
            maxAgents: 4,
            sessionId,
          },
        },
      });

      const stdioResponse = await stdioMcpServer.processMessage(stdioWorkflowRequest);
      const parsedStdioResponse = JSON.parse(stdioResponse);

      expect(parsedStdioResponse?.result?.isError).toBe(false);

      // Phase 3: Monitor via Web interface
      const webStatusResponse = await networkHelper.httpGet(
        `http://localhost:${WEB_SERVER_PORT}/api/status?sessionId=${sessionId}`
      );

      expect(webStatusResponse?.status).toBe(200);
      expect(webStatusResponse?.data?.sessionId).toBe(sessionId);
      expect(webStatusResponse?.data?.interfaces?.http).toBe(true);
      expect(webStatusResponse?.data?.interfaces?.stdio).toBe(true);

      // Phase 4: Execute coordinated task via Web API
      const webTaskRequest = {
        sessionId,
        task: {
          type: 'code_generation',
          parameters: {
            framework: 'express',
            database: 'sqlite',
          },
        },
      };

      const webTaskResponse = await networkHelper.httpPost(
        `http://localhost:${WEB_SERVER_PORT}/api/execute`,
        webTaskRequest
      );

      expect(webTaskResponse?.status).toBe(200);
      expect(webTaskResponse?.data?.taskId).toBeDefined();

      // Phase 5: Verify coordination across interfaces
      const coordinationStatus = await networkHelper.httpGet(
        `http://localhost:${WEB_SERVER_PORT}/api/coordination/${sessionId}`
      );

      expect(coordinationStatus.status).toBe(200);
      expect(coordinationStatus.data.interfaces).toMatchObject({
        httpMcp: { active: true, requests: expect.any(Number) },
        stdioMcp: { active: true, requests: expect.any(Number) },
        webInterface: { active: true, requests: expect.any(Number) },
      });

      // Cleanup
      await Promise.all([httpMcpServer.stop(), stdioMcpServer.shutdown(), webServer.stop()]);
    });

    it('should maintain session state across interface switches', async () => {
      httpMcpServer = new HttpMcpServer({ port: HTTP_MCP_PORT });
      stdioMcpServer = new StdioMcpServer({ enableSwarmCoordination: true });

      await Promise.all([httpMcpServer.start(), stdioMcpServer.initialize()]);

      const sessionId = `session-persistence-${Date.now()}`;

      // Create session state via HTTP MCP
      const stateCreateRequest = {
        jsonrpc: '2.0',
        id: 'state-create',
        method: 'tools/call',
        params: {
          name: 'project_init',
          arguments: {
            sessionId,
            projectData: {
              name: 'Test Project',
              description: 'Session persistence test',
              settings: { enableAI: true, autoSave: true },
            },
          },
        },
      };

      const createResponse = await networkHelper.httpPost(
        `http://localhost:${HTTP_MCP_PORT}/mcp`,
        stateCreateRequest
      );

      expect(createResponse?.status).toBe(200);

      // Retrieve session state via Stdio MCP
      const stateRetrieveRequest = JSON.stringify({
        jsonrpc: '2.0',
        id: 'state-retrieve',
        method: 'tools/call',
        params: {
          name: 'mcp__zen-swarm__memory_usage',
          arguments: {
            action: 'retrieve',
            key: `session:${sessionId}:project`,
          },
        },
      });

      const retrieveResponse = await stdioMcpServer.processMessage(stateRetrieveRequest);
      const parsedRetrieveResponse = JSON.parse(retrieveResponse);

      expect(parsedRetrieveResponse?.result?.isError).toBe(false);

      const retrievedData = JSON.parse(parsedRetrieveResponse?.result?.content?.[0]?.text);
      expect(retrievedData?.name).toBe('Test Project');
      expect(retrievedData?.settings?.enableAI).toBe(true);

      // Modify state via Stdio MCP
      const stateUpdateRequest = JSON.stringify({
        jsonrpc: '2.0',
        id: 'state-update',
        method: 'tools/call',
        params: {
          name: 'mcp__zen-swarm__memory_usage',
          arguments: {
            action: 'store',
            key: `session:${sessionId}:project`,
            value: {
              ...retrievedData,
              lastModified: Date.now(),
              modifiedBy: 'stdio-mcp',
            },
          },
        },
      });

      await stdioMcpServer.processMessage(stateUpdateRequest);

      // Verify modification via HTTP MCP
      const verifyRequest = {
        jsonrpc: '2.0',
        id: 'state-verify',
        method: 'tools/call',
        params: {
          name: 'project_status',
          arguments: {
            sessionId,
            includeSessionData: true,
          },
        },
      };

      const verifyResponse = await networkHelper.httpPost(
        `http://localhost:${HTTP_MCP_PORT}/mcp`,
        verifyRequest
      );

      expect(verifyResponse?.status).toBe(200);
      expect(verifyResponse?.data?.result?.content?.[0]?.text).toContain('modifiedBy');
      expect(verifyResponse?.data?.result?.content?.[0]?.text).toContain('stdio-mcp');

      await Promise.all([httpMcpServer.stop(), stdioMcpServer.shutdown()]);
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle concurrent workflow executions efficiently', async () => {
      documentSystem = new DocumentDrivenSystem({ projectPath: TEST_PROJECT_PATH });
      swarmCoordinator = new SwarmCoordinator({
        topology: 'mesh',
        maxAgents: 12,
        enableLoadBalancing: true,
      });

      await Promise.all([
        documentSystem.initialize(),
        swarmCoordinator.initializeSwarm({ topology: 'mesh', agentCount: 12 }),
      ]);

      const concurrentWorkflows = 5;
      const workflowPromises: Promise<any>[] = [];

      for (let i = 0; i < concurrentWorkflows; i++) {
        const workflowPath = `${TEST_PROJECT_PATH}/concurrent-${i}`;
        await fsHelper.createTestDirectory(workflowPath);

        const visionContent = `
# Concurrent Workflow ${i}

## Overview
Test workflow ${i} for concurrent execution testing.

## Technical Requirements
- Simple web application
- Basic CRUD operations
- SQLite database

## Success Criteria
- Fast development
- Basic functionality
`;

        const visionPath = await fsHelper.writeFile(
          `${workflowPath}/docs/01-vision/vision.md`,
          visionContent
        );

        const workflowPromise = swarmCoordinator.orchestrateTask({
          type: 'complete_workflow',
          input: {
            visionDocument: visionPath,
            outputPath: workflowPath,
          },
          strategy: 'parallel',
          workflowId: `concurrent-workflow-${i}`,
        });

        workflowPromises.push(workflowPromise);
      }

      const startTime = Date.now();
      const results = await Promise.all(workflowPromises);
      const totalTime = Date.now() - startTime;

      // All workflows should complete successfully
      results?.forEach((result, index) => {
        expect(result?.success).toBe(true);
        expect(result?.workflowId).toBe(`concurrent-workflow-${index}`);
      });

      // Should complete within reasonable time (< 60 seconds)
      expect(totalTime).toBeLessThan(60000);

      // Verify all projects were created
      for (let i = 0; i < concurrentWorkflows; i++) {
        const projectStructure = await fsHelper.getDirectoryStructure(
          `${TEST_PROJECT_PATH}/concurrent-${i}`
        );
        expect(projectStructure.docs).toBeDefined();
        expect(projectStructure.src).toBeDefined();
      }

      await swarmCoordinator.shutdown();
    });

    it('should maintain performance under sustained load', async () => {
      httpMcpServer = new HttpMcpServer({ port: HTTP_MCP_PORT });
      stdioMcpServer = new StdioMcpServer({ enableSwarmCoordination: true });

      await Promise.all([httpMcpServer.start(), stdioMcpServer.initialize()]);

      const loadTestDuration = 30000; // 30 seconds
      const requestInterval = 500; // 500ms between requests
      const endTime = Date.now() + loadTestDuration;

      const performanceMetrics = {
        httpRequests: 0,
        stdioRequests: 0,
        httpErrors: 0,
        stdioErrors: 0,
        httpLatencies: [] as number[],
        stdioLatencies: [] as number[],
      };

      while (Date.now() < endTime) {
        // HTTP MCP request
        const httpStartTime = Date.now();
        try {
          const httpResponse = await networkHelper.httpPost(
            `http://localhost:${HTTP_MCP_PORT}/mcp`,
            {
              jsonrpc: '2.0',
              id: `load-test-http-${performanceMetrics.httpRequests}`,
              method: 'tools/call',
              params: {
                name: 'system_info',
                arguments: { detailed: false },
              },
            }
          );

          if (httpResponse?.status === 200) {
            performanceMetrics.httpRequests++;
            performanceMetrics.httpLatencies.push(Date.now() - httpStartTime);
          } else {
            performanceMetrics.httpErrors++;
          }
        } catch (error) {
          performanceMetrics.httpErrors++;
        }

        // Stdio MCP request
        const stdioStartTime = Date.now();
        try {
          const stdioResponse = await stdioMcpServer.processMessage(
            JSON.stringify({
              jsonrpc: '2.0',
              id: `load-test-stdio-${performanceMetrics.stdioRequests}`,
              method: 'tools/call',
              params: {
                name: 'mcp__zen-swarm__swarm_status',
                arguments: {},
              },
            })
          );

          const parsed = JSON.parse(stdioResponse);
          if (!parsed.error) {
            performanceMetrics.stdioRequests++;
            performanceMetrics.stdioLatencies.push(Date.now() - stdioStartTime);
          } else {
            performanceMetrics.stdioErrors++;
          }
        } catch (error) {
          performanceMetrics.stdioErrors++;
        }

        await new Promise((resolve) => setTimeout(resolve, requestInterval));
      }

      // Analyze performance
      const httpAvgLatency =
        performanceMetrics.httpLatencies.reduce((a, b) => a + b, 0) /
        performanceMetrics.httpLatencies.length;
      const stdioAvgLatency =
        performanceMetrics.stdioLatencies.reduce((a, b) => a + b, 0) /
        performanceMetrics.stdioLatencies.length;

      const httpErrorRate =
        performanceMetrics.httpErrors /
        (performanceMetrics.httpRequests + performanceMetrics.httpErrors);
      const stdioErrorRate =
        performanceMetrics.stdioErrors /
        (performanceMetrics.stdioRequests + performanceMetrics.stdioErrors);

      // Performance assertions
      expect(performanceMetrics.httpRequests).toBeGreaterThan(20); // At least 20 successful requests
      expect(performanceMetrics.stdioRequests).toBeGreaterThan(20);
      expect(httpErrorRate).toBeLessThan(0.05); // Less than 5% error rate
      expect(stdioErrorRate).toBeLessThan(0.05);
      expect(httpAvgLatency).toBeLessThan(1000); // Less than 1 second average
      expect(stdioAvgLatency).toBeLessThan(500); // Less than 500ms average

      await Promise.all([httpMcpServer.stop(), stdioMcpServer.shutdown()]);
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from system component failures', async () => {
      swarmCoordinator = new SwarmCoordinator({
        topology: 'hierarchical',
        maxAgents: 6,
        faultTolerance: true,
        autoRecovery: true,
      });

      await swarmCoordinator.initializeSwarm({ topology: 'hierarchical', agentCount: 6 });

      // Start a long-running workflow
      const workflowPromise = swarmCoordinator.orchestrateTask({
        type: 'long_running_workflow',
        input: {
          duration: 20000, // 20 seconds
          checkpoints: true,
        },
        strategy: 'resilient',
      });

      // Wait for workflow to start
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate component failures
      const agents = await swarmCoordinator.getAllAgents();
      const failingAgents = agents.slice(0, 2);

      for (const agent of failingAgents) {
        await swarmCoordinator.simulateAgentFailure(agent.id, {
          type: 'crash',
          recoverable: true,
        });
      }

      // Wait for recovery
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Verify system recovered
      const healthMetrics = await swarmCoordinator.getHealthMetrics();
      expect(healthMetrics.overallHealth).toBeGreaterThan(0.7);
      expect(healthMetrics.recoveredFailures).toBeGreaterThan(0);

      // Workflow should complete despite failures
      const workflowResult = await workflowPromise;
      expect(workflowResult?.success).toBe(true);
      expect(workflowResult?.recoveryEvents.length).toBeGreaterThan(0);

      await swarmCoordinator.shutdown();
    });

    it('should handle cascading failures gracefully', async () => {
      swarmCoordinator = new SwarmCoordinator({
        topology: 'star',
        maxAgents: 8,
        faultTolerance: true,
        cascadeProtection: true,
      });

      await swarmCoordinator.initializeSwarm({ topology: 'star', agentCount: 8 });

      // Start multiple concurrent workflows
      const workflowPromises = Array.from({ length: 3 }, (_, i) =>
        swarmCoordinator.orchestrateTask({
          type: 'concurrent_workflow',
          input: { workflowId: i },
          strategy: 'fault_tolerant',
        })
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate hub failure (worst case for star topology)
      const hubAgent = await swarmCoordinator.getHubAgent();
      await swarmCoordinator.simulateAgentFailure(hubAgent.id, {
        type: 'permanent_failure',
        cascadeRisk: 'high',
      });

      // System should elect new hub and prevent cascade
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const recoveryMetrics = await swarmCoordinator.getRecoveryMetrics();
      expect(recoveryMetrics.cascadesStopped).toBeGreaterThan(0);
      expect(recoveryMetrics.newHubElected).toBe(true);

      // At least some workflows should complete
      const results = await Promise.allSettled(workflowPromises);
      const successfulWorkflows = results?.filter(
        (r) => r.status === 'fulfilled' && r.value.success
      ).length;

      expect(successfulWorkflows).toBeGreaterThan(0);

      await swarmCoordinator.shutdown();
    });
  });
});
