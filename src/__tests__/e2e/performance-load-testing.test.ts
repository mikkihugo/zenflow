/**
 * Performance and Load Testing E2E Test Suite
 * Tests system performance under various load conditions and stress scenarios
 */

import type { StdioMcpServer } from '../../coordination/mcp/mcp-server';
import { SwarmCoordinator } from '../../coordination/swarm/core/swarm-coordinator';
import { DocumentDrivenSystem } from '../../core/document-driven-system';
import { HttpMcpServer } from '../../interfaces/mcp/http-mcp-server';
import { WebInterfaceServer } from '../../interfaces/web/WebInterfaceServer';
import { RealFileSystemTestHelper } from '../helpers/filesystem-test-helper';
import { IntegrationTestSetup } from '../helpers/integration-test-setup';
import { RealNetworkTestHelper } from '../helpers/network-test-helper';
import { PerformanceMeasurement } from '../helpers/performance-measurement';

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
  successRate: number;
}

interface LoadTestConfig {
  concurrentUsers: number;
  duration: number; // in seconds
  rampUpTime: number; // in seconds
  targetThroughput: number; // requests per second
}

describe('Performance and Load Testing E2E Tests', () => {
  let documentSystem: DocumentDrivenSystem;
  let swarmCoordinator: SwarmCoordinator;
  let httpMcpServer: HttpMcpServer;
  let _stdioMcpServer: StdioMcpServer;
  let webServer: WebInterfaceServer;
  let testSetup: IntegrationTestSetup;
  let fsHelper: RealFileSystemTestHelper;
  let networkHelper: RealNetworkTestHelper;
  let _perfMeasurement: PerformanceMeasurement;

  const TEST_PROJECT_PATH = '/tmp/claude-zen-performance-test';
  const HTTP_MCP_PORT = 3460;
  const WEB_SERVER_PORT = 3461;
  const E2E_TIMEOUT = 180000; // 3 minutes for performance tests

  beforeAll(async () => {
    testSetup = new IntegrationTestSetup();
    fsHelper = new RealFileSystemTestHelper();
    networkHelper = new RealNetworkTestHelper();
    _perfMeasurement = new PerformanceMeasurement();

    await testSetup.initializeFullEnvironment();
    await fsHelper.createTestDirectory(TEST_PROJECT_PATH);
  }, E2E_TIMEOUT);

  afterAll(async () => {
    await testSetup.cleanup();
    await fsHelper.cleanup();
  });

  describe('Concurrent Workflow Execution', () => {
    beforeEach(async () => {
      documentSystem = new DocumentDrivenSystem();
      swarmCoordinator = new SwarmCoordinator({
        topology: 'mesh',
        maxAgents: 20,
        enableLoadBalancing: true,
        enableOptimizations: true,
      });

      await Promise.all([
        documentSystem.initialize(),
        swarmCoordinator.initializeSwarm({ topology: 'mesh', agentCount: 20 }),
      ]);
    });

    afterEach(async () => {
      await swarmCoordinator.shutdown();
    });

    it('should handle 5+ simultaneous workflow executions efficiently', async () => {
      const concurrentWorkflows = 5;
      const startTime = Date.now();
      const workflowPromises: Promise<any>[] = [];
      const performanceMetrics: PerformanceMetrics[] = [];

      for (let i = 0; i < concurrentWorkflows; i++) {
        const workflowPath = `${TEST_PROJECT_PATH}/concurrent-${i}`;
        await fsHelper.createTestDirectory(workflowPath);

        const visionContent = `
# Concurrent Workflow ${i}

## Overview
High-performance workflow ${i} for concurrent execution testing with realistic complexity.

## Features
- Real-time data processing
- Multi-threaded computation
- Database operations
- API integrations
- File system operations
- Memory management

## Technical Requirements
- Sub-second response times
- Memory efficient processing
- Concurrent request handling
- Error recovery mechanisms
- Performance monitoring

## Implementation Tasks
- [ ] Core processing engine
- [ ] Database integration layer
- [ ] API service implementation
- [ ] Caching mechanisms
- [ ] Performance optimization
- [ ] Monitoring and alerting
- [ ] Error handling
- [ ] Testing and validation

## Performance Targets
- Processing time: <500ms
- Memory usage: <100MB
- CPU utilization: <80%
- Error rate: <1%
- Throughput: >1000 ops/sec
`;

        const visionPath = await fsHelper.writeFile(
          `${workflowPath}/docs/01-vision/vision.md`,
          visionContent,
        );

        const workflowStartTime = Date.now();
        const workflowPromise = swarmCoordinator
          .orchestrateTask({
            type: 'complete_workflow',
            input: {
              visionDocument: visionPath,
              outputPath: workflowPath,
              performanceMode: true,
            },
            strategy: 'parallel_optimized',
            workflowId: `concurrent-workflow-${i}`,
            performance: {
              targetTime: 30000, // 30 seconds
              memoryLimit: 100 * 1024 * 1024, // 100MB
              cpuLimit: 80, // 80%
            },
          })
          .then((result) => {
            const workflowEndTime = Date.now();
            const executionTime = workflowEndTime - workflowStartTime;

            performanceMetrics.push({
              responseTime: executionTime,
              throughput: result.tasksCompleted / (executionTime / 1000),
              memoryUsage: result.metrics?.memoryUsage || 0,
              cpuUsage: result.metrics?.cpuUsage || 0,
              errorRate: result.errors?.length / result.totalOperations || 0,
              successRate: result.successfulOperations / result.totalOperations || 1,
            });

            return result;
          });

        workflowPromises.push(workflowPromise);
      }

      const results = await Promise.all(workflowPromises);
      const totalExecutionTime = Date.now() - startTime;

      // Performance assertions
      expect(results.length).toBe(concurrentWorkflows);
      expect(totalExecutionTime).toBeLessThan(60000); // Less than 60 seconds

      // All workflows should complete successfully
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.workflowId).toBe(`concurrent-workflow-${index}`);
      });

      // Analyze performance metrics
      const avgResponseTime =
        performanceMetrics.reduce((sum, m) => sum + m.responseTime, 0) / performanceMetrics.length;
      const avgThroughput =
        performanceMetrics.reduce((sum, m) => sum + m.throughput, 0) / performanceMetrics.length;
      const maxMemoryUsage = Math.max(...performanceMetrics.map((m) => m.memoryUsage));
      const avgCpuUsage =
        performanceMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / performanceMetrics.length;
      const avgErrorRate =
        performanceMetrics.reduce((sum, m) => sum + m.errorRate, 0) / performanceMetrics.length;

      // Performance targets
      expect(avgResponseTime).toBeLessThan(45000); // Average under 45 seconds
      expect(avgThroughput).toBeGreaterThan(10); // At least 10 operations per second
      expect(maxMemoryUsage).toBeLessThan(150 * 1024 * 1024); // Under 150MB peak
      expect(avgCpuUsage).toBeLessThan(90); // Under 90% CPU average
      expect(avgErrorRate).toBeLessThan(0.05); // Less than 5% error rate
    });

    it('should scale efficiently with increasing concurrent workflows', async () => {
      const scalabilityTests = [
        { workflows: 2, expectedMaxTime: 20000 },
        { workflows: 5, expectedMaxTime: 45000 },
        { workflows: 10, expectedMaxTime: 90000 },
      ];

      const scalabilityResults: any[] = [];

      for (const test of scalabilityTests) {
        const startTime = Date.now();
        const workflowPromises: Promise<any>[] = [];

        for (let i = 0; i < test.workflows; i++) {
          const workflowPath = `${TEST_PROJECT_PATH}/scale-${test.workflows}-${i}`;
          await fsHelper.createTestDirectory(workflowPath);

          const visionContent = `
# Scalability Test Workflow ${i}

## Load Level: ${test.workflows} concurrent workflows

## Simple Implementation
- Basic document processing
- Minimal memory footprint
- Fast execution path
- Efficient resource usage

## Performance Expectations
- Linear scalability
- Predictable resource usage
- Graceful degradation under load
`;

          const visionPath = await fsHelper.writeFile(
            `${workflowPath}/docs/01-vision/scalability-vision.md`,
            visionContent,
          );

          const workflowPromise = swarmCoordinator.orchestrateTask({
            type: 'simple_workflow',
            input: {
              visionDocument: visionPath,
              outputPath: workflowPath,
            },
            strategy: 'efficient',
            workflowId: `scalability-${test.workflows}-${i}`,
          });

          workflowPromises.push(workflowPromise);
        }

        const results = await Promise.all(workflowPromises);
        const executionTime = Date.now() - startTime;

        scalabilityResults.push({
          workflows: test.workflows,
          executionTime,
          successfulWorkflows: results.filter((r) => r.success).length,
          avgWorkflowTime: executionTime / test.workflows,
        });

        expect(executionTime).toBeLessThan(test.expectedMaxTime);
        expect(results.every((r) => r.success)).toBe(true);
      }

      // Analyze scalability curve
      const scalabilityFactors = scalabilityResults.map((result, index) => {
        if (index === 0) return 1;
        const baseline = scalabilityResults[0];
        const expectedTime = baseline.avgWorkflowTime * result.workflows;
        return result.executionTime / expectedTime;
      });

      // Scalability should be near-linear (factor close to 1)
      scalabilityFactors.slice(1).forEach((factor) => {
        expect(factor).toBeLessThan(2.0); // Less than 2x linear growth
      });
    });
  });

  describe('Memory Usage Optimization Under Load', () => {
    beforeEach(async () => {
      documentSystem = new DocumentDrivenSystem();
      await documentSystem.initialize();
    });

    it('should maintain stable memory usage during sustained load', async () => {
      const loadTestConfig: LoadTestConfig = {
        concurrentUsers: 10,
        duration: 30, // 30 seconds
        rampUpTime: 5, // 5 seconds ramp up
        targetThroughput: 20, // 20 requests per second
      };

      const memoryMeasurements: number[] = [];
      const workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);

      // Start memory monitoring
      const memoryMonitor = setInterval(() => {
        const memUsage = process.memoryUsage();
        memoryMeasurements.push(memUsage.heapUsed);
      }, 1000);

      const startTime = Date.now();
      const endTime = startTime + loadTestConfig.duration * 1000;
      const requests: Promise<any>[] = [];

      // Generate sustained load
      while (Date.now() < endTime) {
        for (let user = 0; user < loadTestConfig.concurrentUsers; user++) {
          const docContent = `
# Load Test Document ${Date.now()}-${user}

## Generated Content
This document is generated for memory usage testing under sustained load.

## Test Data
- Timestamp: ${new Date().toISOString()}
- User: ${user}
- Memory: ${process.memoryUsage().heapUsed}
- Duration: ${Date.now() - startTime}ms

## Processing Requirements
- Memory efficient parsing
- Garbage collection friendly
- Minimal object retention
- Fast processing pipeline
`;

          const docPath = await fsHelper.writeFile(
            `${TEST_PROJECT_PATH}/docs/load-test-${Date.now()}-${user}.md`,
            docContent,
          );

          const request = documentSystem
            .processVisionaryDocument(workspaceId, docPath)
            .catch((error) => ({ error, user, timestamp: Date.now() }));

          requests.push(request);
        }

        // Throttle to target throughput
        await new Promise((resolve) => setTimeout(resolve, 1000 / loadTestConfig.targetThroughput));
      }

      clearInterval(memoryMonitor);

      // Wait for all requests to complete
      const results = await Promise.allSettled(requests);
      const successfulRequests = results.filter((r) => r.status === 'fulfilled').length;
      const failedRequests = results.filter((r) => r.status === 'rejected').length;

      // Memory analysis
      const initialMemory = memoryMeasurements[0];
      const finalMemory = memoryMeasurements[memoryMeasurements.length - 1];
      const peakMemory = Math.max(...memoryMeasurements);
      const memoryGrowth = finalMemory - initialMemory;
      const memoryGrowthPercent = (memoryGrowth / initialMemory) * 100;

      // Performance assertions
      expect(successfulRequests).toBeGreaterThan(requests.length * 0.95); // >95% success rate
      expect(failedRequests).toBeLessThan(requests.length * 0.05); // <5% failure rate
      expect(memoryGrowthPercent).toBeLessThan(50); // Memory growth <50%
      expect(peakMemory).toBeLessThan(500 * 1024 * 1024); // Peak memory <500MB
    });

    it('should efficiently handle large document processing', async () => {
      const largeSizes = [
        { name: 'Medium', size: 50 * 1024 }, // 50KB
        { name: 'Large', size: 500 * 1024 }, // 500KB
        { name: 'XLarge', size: 2 * 1024 * 1024 }, // 2MB
      ];

      const processingResults: any[] = [];
      const workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);

      for (const size of largeSizes) {
        // Generate large document content
        const baseContent = `
# Large Document Test - ${size.name}

## Overview
This is a large document test for ${size.name} size processing.

## Content Sections
`;

        let largeContent = baseContent;
        const targetSize = size.size - baseContent.length;
        const sectionSize = 1000; // 1KB sections
        const sectionsNeeded = Math.floor(targetSize / sectionSize);

        for (let i = 0; i < sectionsNeeded; i++) {
          largeContent += `

### Section ${i + 1}
This is section ${i + 1} of the large document. It contains meaningful content for testing document processing performance with larger payloads. The content includes technical specifications, implementation details, and various formatting elements to simulate real-world documentation.

#### Implementation Details
- Performance optimization techniques
- Memory management strategies
- Processing pipeline architecture
- Error handling mechanisms
- Monitoring and metrics collection

#### Code Examples
\`\`\`typescript
// Example implementation
class DocumentProcessor {
  async processLargeDocument(content: string): Promise<ProcessedDocument> {
    const chunks = this.chunkContent(content);
    return await this.processChunks(chunks);
  }
}
\`\`\`

#### Performance Metrics
- Processing time: Target <1s
- Memory usage: Target <50MB
- CPU utilization: Target <70%
- Throughput: Target >10 docs/sec
`;
        }

        const docPath = await fsHelper.writeFile(
          `${TEST_PROJECT_PATH}/docs/large-doc-${size.name.toLowerCase()}.md`,
          largeContent,
        );

        const actualSize = Buffer.from(largeContent, 'utf8').length;
        const startTime = Date.now();
        const startMemory = process.memoryUsage().heapUsed;

        try {
          await documentSystem.processVisionaryDocument(workspaceId, docPath);

          const endTime = Date.now();
          const endMemory = process.memoryUsage().heapUsed;
          const processingTime = endTime - startTime;
          const memoryUsed = endMemory - startMemory;

          processingResults.push({
            size: size.name,
            actualSizeKB: Math.round(actualSize / 1024),
            processingTimeMs: processingTime,
            memoryUsedMB: Math.round(memoryUsed / 1024 / 1024),
            throughputKBps: Math.round(actualSize / 1024 / (processingTime / 1000)),
            success: true,
          });

          // Performance assertions per size
          expect(processingTime).toBeLessThan(10000); // <10 seconds
          expect(memoryUsed).toBeLessThan(100 * 1024 * 1024); // <100MB additional
        } catch (error) {
          processingResults.push({
            size: size.name,
            actualSizeKB: Math.round(actualSize / 1024),
            error: error.message,
            success: false,
          });
        }
      }

      // All sizes should process successfully
      expect(processingResults.every((r) => r.success)).toBe(true);

      // Performance should scale reasonably with size
      const throughputs = processingResults.map((r) => r.throughputKBps);
      const minThroughput = Math.min(...throughputs);
      const maxThroughput = Math.max(...throughputs);

      // Throughput variance should be reasonable
      expect(maxThroughput / minThroughput).toBeLessThan(5); // <5x variation
    });
  });

  describe('Response Time Consistency Testing', () => {
    let workspaceId: string;

    beforeEach(async () => {
      documentSystem = new DocumentDrivenSystem();
      httpMcpServer = new HttpMcpServer({ port: HTTP_MCP_PORT });
      webServer = new WebInterfaceServer({ port: WEB_SERVER_PORT });

      await Promise.all([documentSystem.initialize(), httpMcpServer.start(), webServer.start()]);

      workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);
    });

    afterEach(async () => {
      await Promise.all([httpMcpServer.stop(), webServer.stop()]);
    });

    it('should maintain consistent response times under varying load', async () => {
      const loadPatterns = [
        { name: 'Low Load', concurrency: 1, requests: 20 },
        { name: 'Medium Load', concurrency: 5, requests: 50 },
        { name: 'High Load', concurrency: 10, requests: 100 },
      ];

      const consistencyResults: any[] = [];

      for (const pattern of loadPatterns) {
        const responseTimes: number[] = [];
        const batchPromises: Promise<any>[] = [];

        for (let batch = 0; batch < pattern.requests / pattern.concurrency; batch++) {
          const _batchStartTime = Date.now();
          const concurrentRequests: Promise<any>[] = [];

          for (let req = 0; req < pattern.concurrency; req++) {
            const requestStartTime = Date.now();

            const request = networkHelper
              .httpPost(`http://localhost:${HTTP_MCP_PORT}/mcp`, {
                jsonrpc: '2.0',
                id: `consistency-test-${pattern.name}-${batch}-${req}`,
                method: 'tools/call',
                params: {
                  name: 'project_status',
                  arguments: {
                    workspaceId,
                    includeMetrics: true,
                  },
                },
              })
              .then((response) => {
                const responseTime = Date.now() - requestStartTime;
                responseTimes.push(responseTime);
                return { response, responseTime };
              });

            concurrentRequests.push(request);
          }

          batchPromises.push(Promise.all(concurrentRequests));

          // Small delay between batches to simulate realistic load
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        await Promise.all(batchPromises);

        // Calculate consistency metrics
        const avgResponseTime =
          responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;
        const sortedTimes = responseTimes.sort((a, b) => a - b);
        const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
        const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
        const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
        const minTime = Math.min(...responseTimes);
        const maxTime = Math.max(...responseTimes);
        const variance =
          responseTimes.reduce((sum, rt) => sum + (rt - avgResponseTime) ** 2, 0) /
          responseTimes.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = stdDev / avgResponseTime;

        consistencyResults.push({
          pattern: pattern.name,
          avgResponseTime,
          p50,
          p95,
          p99,
          minTime,
          maxTime,
          stdDev,
          coefficientOfVariation,
          totalRequests: responseTimes.length,
        });

        // Consistency assertions
        expect(avgResponseTime).toBeLessThan(2000); // Average <2s
        expect(p95).toBeLessThan(5000); // 95th percentile <5s
        expect(coefficientOfVariation).toBeLessThan(1.0); // CV <1.0 for good consistency
      }

      // Response times should not degrade significantly with load
      const lowLoadAvg = consistencyResults[0].avgResponseTime;
      const highLoadAvg = consistencyResults[2].avgResponseTime;
      const degradationFactor = highLoadAvg / lowLoadAvg;

      expect(degradationFactor).toBeLessThan(3.0); // <3x degradation under high load
    });

    it('should handle traffic spikes gracefully', async () => {
      const spikeTest = {
        baselineRequests: 10,
        spikeRequests: 50,
        spikeDuration: 5000, // 5 seconds
      };

      // Establish baseline performance
      const baselinePromises: Promise<any>[] = [];
      const baselineStartTime = Date.now();

      for (let i = 0; i < spikeTest.baselineRequests; i++) {
        const request = networkHelper.httpGet(
          `http://localhost:${WEB_SERVER_PORT}/api/status?workspaceId=${workspaceId}`,
        );
        baselinePromises.push(request);

        await new Promise((resolve) => setTimeout(resolve, 100)); // Steady rate
      }

      const _baselineResults = await Promise.all(baselinePromises);
      const baselineTime = Date.now() - baselineStartTime;
      const baselineAvgTime = baselineTime / spikeTest.baselineRequests;

      // Generate traffic spike
      const spikePromises: Promise<any>[] = [];
      const spikeStartTime = Date.now();

      for (let i = 0; i < spikeTest.spikeRequests; i++) {
        const request = networkHelper
          .httpPost(`http://localhost:${WEB_SERVER_PORT}/api/documents/process`, {
            workspaceId,
            documentContent: `# Spike Test Document ${i}\n\nGenerated for traffic spike testing.`,
            documentType: 'task',
          })
          .catch((error) => ({ error, timestamp: Date.now() }));

        spikePromises.push(request);
      }

      const spikeResults = await Promise.all(spikePromises);
      const spikeTime = Date.now() - spikeStartTime;
      const spikeAvgTime = spikeTime / spikeTest.spikeRequests;

      // Analyze spike handling
      const successfulSpike = spikeResults.filter((r) => !r.error).length;
      const _failedSpike = spikeResults.filter((r) => r.error).length;
      const successRate = successfulSpike / spikeTest.spikeRequests;

      // Recovery test - return to baseline
      const recoveryPromises: Promise<any>[] = [];
      const recoveryStartTime = Date.now();

      for (let i = 0; i < spikeTest.baselineRequests; i++) {
        const request = networkHelper.httpGet(
          `http://localhost:${WEB_SERVER_PORT}/api/status?workspaceId=${workspaceId}`,
        );
        recoveryPromises.push(request);

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const _recoveryResults = await Promise.all(recoveryPromises);
      const recoveryTime = Date.now() - recoveryStartTime;
      const recoveryAvgTime = recoveryTime / spikeTest.baselineRequests;

      // Spike handling assertions
      expect(successRate).toBeGreaterThan(0.8); // >80% success during spike
      expect(spikeAvgTime).toBeLessThan(baselineAvgTime * 5); // <5x degradation
      expect(recoveryAvgTime).toBeLessThan(baselineAvgTime * 1.5); // Recovery to <1.5x baseline
    });
  });

  describe('Resource Allocation and Cleanup', () => {
    beforeEach(async () => {
      documentSystem = new DocumentDrivenSystem();
      swarmCoordinator = new SwarmCoordinator({
        topology: 'hierarchical',
        maxAgents: 15,
        resourceMonitoring: true,
      });

      await Promise.all([
        documentSystem.initialize(),
        swarmCoordinator.initializeSwarm({ topology: 'hierarchical', agentCount: 15 }),
      ]);
    });

    afterEach(async () => {
      await swarmCoordinator.shutdown();
    });

    it('should efficiently allocate and cleanup resources during workflow execution', async () => {
      const resourceTests = [
        { workflowCount: 3, expectedResourceEfficiency: 0.8 },
        { workflowCount: 6, expectedResourceEfficiency: 0.75 },
        { workflowCount: 10, expectedResourceEfficiency: 0.7 },
      ];

      const resourceResults: any[] = [];

      for (const test of resourceTests) {
        const initialResources = await swarmCoordinator.getResourceMetrics();
        const workflowPromises: Promise<any>[] = [];

        // Start workflows
        for (let i = 0; i < test.workflowCount; i++) {
          const workflowPath = `${TEST_PROJECT_PATH}/resource-test-${i}`;
          await fsHelper.createTestDirectory(workflowPath);

          const visionContent = `
# Resource Allocation Test ${i}

## Resource Requirements
- Memory: 50MB
- CPU: 25%
- Disk: 10MB
- Network: 1MB/s

## Processing Tasks
- Data transformation
- File operations  
- Network requests
- Memory-intensive computation
- Cleanup and finalization
`;

          const visionPath = await fsHelper.writeFile(
            `${workflowPath}/docs/01-vision/resource-vision.md`,
            visionContent,
          );

          const workflowPromise = swarmCoordinator.orchestrateTask({
            type: 'resource_managed_workflow',
            input: {
              visionDocument: visionPath,
              resourceLimits: {
                memory: 50 * 1024 * 1024, // 50MB
                cpu: 25, // 25%
                disk: 10 * 1024 * 1024, // 10MB
              },
            },
            strategy: 'resource_aware',
            workflowId: `resource-test-${i}`,
          });

          workflowPromises.push(workflowPromise);
        }

        // Monitor resources during execution
        const resourceMonitoring = setInterval(async () => {
          const _currentResources = await swarmCoordinator.getResourceMetrics();
          // Resources would be tracked here
        }, 1000);

        const results = await Promise.all(workflowPromises);
        clearInterval(resourceMonitoring);

        const finalResources = await swarmCoordinator.getResourceMetrics();

        // Calculate resource efficiency
        const allocatedAgents = results.reduce((sum, r) => sum + (r.agentsUsed || 0), 0);
        const totalAvailableAgents = test.workflowCount * 3; // Assume 3 agents per workflow optimally
        const resourceEfficiency = Math.min(allocatedAgents / totalAvailableAgents, 1.0);

        resourceResults.push({
          workflowCount: test.workflowCount,
          resourceEfficiency,
          allocatedAgents,
          totalAvailableAgents,
          successfulWorkflows: results.filter((r) => r.success).length,
          avgResourceUsage:
            results.reduce((sum, r) => sum + (r.resourceUsage || 0), 0) / results.length,
        });

        // Resource efficiency assertions
        expect(resourceEfficiency).toBeGreaterThan(test.expectedResourceEfficiency);
        expect(results.every((r) => r.success)).toBe(true);

        // Cleanup verification
        expect(finalResources.unusedResources).toBeGreaterThan(
          initialResources.unusedResources * 0.9,
        );
      }

      // Resource efficiency should remain reasonable as load increases
      const efficiencies = resourceResults.map((r) => r.resourceEfficiency);
      const efficiencyDrop = efficiencies[0] - efficiencies[efficiencies.length - 1];
      expect(efficiencyDrop).toBeLessThan(0.2); // <20% efficiency drop
    });
  });

  describe('Scalability with Increasing Users', () => {
    beforeEach(async () => {
      documentSystem = new DocumentDrivenSystem();
      webServer = new WebInterfaceServer({ port: WEB_SERVER_PORT });

      await Promise.all([documentSystem.initialize(), webServer.start()]);
    });

    afterEach(async () => {
      await webServer.stop();
    });

    it('should scale to handle 100+ concurrent users', async () => {
      const userScenarios = [
        { users: 10, expectedAvgResponseTime: 500 },
        { users: 25, expectedAvgResponseTime: 1000 },
        { users: 50, expectedAvgResponseTime: 2000 },
        { users: 100, expectedAvgResponseTime: 4000 },
      ];

      const scalabilityResults: any[] = [];

      for (const scenario of userScenarios) {
        const userPromises: Promise<any>[] = [];
        const startTime = Date.now();

        // Simulate concurrent users
        for (let user = 0; user < scenario.users; user++) {
          const userWorkspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);

          const userSimulation = async () => {
            const userStartTime = Date.now();

            try {
              // User creates a document
              const response1 = await networkHelper.httpPost(
                `http://localhost:${WEB_SERVER_PORT}/api/documents/create`,
                {
                  workspaceId: userWorkspaceId,
                  documentType: 'feature',
                  content: `# User ${user} Feature\n\nFeature created by user ${user} in scalability test.`,
                },
              );

              // User checks status
              const response2 = await networkHelper.httpGet(
                `http://localhost:${WEB_SERVER_PORT}/api/status?workspaceId=${userWorkspaceId}&user=${user}`,
              );

              // User processes document
              const response3 = await networkHelper.httpPost(
                `http://localhost:${WEB_SERVER_PORT}/api/documents/process`,
                {
                  workspaceId: userWorkspaceId,
                  documentPath: response1.data.path,
                },
              );

              const userEndTime = Date.now();
              return {
                user,
                responseTime: userEndTime - userStartTime,
                success: true,
                responses: [response1, response2, response3],
              };
            } catch (error) {
              return {
                user,
                responseTime: Date.now() - userStartTime,
                success: false,
                error: error.message,
              };
            }
          };

          userPromises.push(userSimulation());
        }

        const userResults = await Promise.all(userPromises);
        const totalTime = Date.now() - startTime;

        // Calculate metrics
        const successfulUsers = userResults.filter((r) => r.success).length;
        const failedUsers = userResults.filter((r) => !r.success).length;
        const avgResponseTime =
          userResults.reduce((sum, r) => sum + r.responseTime, 0) / userResults.length;
        const maxResponseTime = Math.max(...userResults.map((r) => r.responseTime));
        const minResponseTime = Math.min(...userResults.map((r) => r.responseTime));

        scalabilityResults.push({
          users: scenario.users,
          totalTime,
          avgResponseTime,
          maxResponseTime,
          minResponseTime,
          successfulUsers,
          failedUsers,
          successRate: successfulUsers / scenario.users,
          throughput: scenario.users / (totalTime / 1000), // users per second
        });

        // Scalability assertions
        expect(successfulUsers).toBeGreaterThan(scenario.users * 0.95); // >95% success
        expect(avgResponseTime).toBeLessThan(scenario.expectedAvgResponseTime);
        expect(maxResponseTime).toBeLessThan(scenario.expectedAvgResponseTime * 2);
      }

      // Overall scalability analysis
      const throughputs = scalabilityResults.map((r) => r.throughput);
      const _avgResponseTimes = scalabilityResults.map((r) => r.avgResponseTime);

      // Throughput should not degrade severely with more users
      const throughputDegradation = throughputs[0] / throughputs[throughputs.length - 1];
      expect(throughputDegradation).toBeLessThan(5); // <5x degradation
    });
  });
});
