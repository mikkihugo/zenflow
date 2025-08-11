/**
 * WebSocket Real-time Coordination Integration Test Suite
 * Testing real-time features and WebSocket-based swarm coordination
 */

import { WebSocket } from 'ws';
import { AgentManager } from '../../coordination/agents/agent-manager.ts';
import { SwarmCoordinator } from '../../coordination/swarm/core/swarm-coordinator.ts';
import { WebSocketManager } from '../../interfaces/web/web-socket-manager.ts';
import { RealTimeMonitor } from '../../monitoring/performance/real-time-monitor.ts';
import { IntegrationTestSetup } from '../helpers/integration-test-setup.ts';
import { NetworkTestHelper } from '../helpers/network-test-helper.ts';

describe('WebSocket Real-time Coordination Integration Tests', () => {
  let wsManager: WebSocketManager;
  let swarmCoordinator: SwarmCoordinator;
  let agentManager: AgentManager;
  let realTimeMonitor: RealTimeMonitor;
  let testSetup: IntegrationTestSetup;
  let networkHelper: NetworkTestHelper;

  const WS_PORT = 3459;
  const TEST_TIMEOUT = 30000;

  beforeAll(async () => {
    testSetup = new IntegrationTestSetup();
    networkHelper = new NetworkTestHelper();

    await testSetup.initializeRealTimeEnvironment();
  }, TEST_TIMEOUT);

  beforeEach(async () => {
    wsManager = new WebSocketManager({
      port: WS_PORT,
      enableCompression: true,
      maxConnections: 100,
      heartbeatInterval: 5000,
    });

    swarmCoordinator = new SwarmCoordinator({
      topology: 'mesh',
      maxAgents: 10,
      enableRealTime: true,
      wsManager,
    });

    agentManager = new AgentManager({
      poolSize: 20,
      enableRealTimeUpdates: true,
      wsManager,
    });

    realTimeMonitor = new RealTimeMonitor({
      wsManager,
      updateInterval: 1000,
      enableMetrics: true,
    });

    await Promise.all([
      wsManager.start(),
      swarmCoordinator.initializeSwarm({ topology: 'mesh', agentCount: 5 }),
      realTimeMonitor.start(),
    ]);
  });

  afterEach(async () => {
    await Promise.all([wsManager.stop(), swarmCoordinator.shutdown(), realTimeMonitor.stop()]);
  });

  afterAll(async () => {
    await testSetup.cleanup();
  });

  describe('Real-time Swarm Status Updates', () => {
    it('should broadcast swarm initialization events to all connected clients', async () => {
      const clients: WebSocket[] = [];
      const receivedMessages: any[][] = [];

      // Create multiple WebSocket clients
      for (let i = 0; i < 3; i++) {
        const client = new WebSocket(`ws://localhost:${WS_PORT}`);
        const clientMessages: any[] = [];

        client.on('message', (data) => {
          const message = JSON.parse(data.toString());
          clientMessages.push(message);
        });

        clients.push(client);
        receivedMessages.push(clientMessages);

        await networkHelper.waitForWebSocketConnection(client);
      }

      // Subscribe clients to swarm events
      for (const client of clients) {
        client.send(
          JSON.stringify({
            type: 'subscribe',
            channel: 'swarm_events',
            filter: { eventTypes: ['agent_spawned', 'topology_changed', 'task_assigned'] },
          })
        );
      }

      await networkHelper.wait(500); // Allow subscriptions to register

      // Spawn new agent - should trigger real-time updates
      const newAgent = await agentManager.spawnAgent({
        type: 'coordinator',
        capabilities: ['coordination', 'monitoring'],
      });

      // Wait for messages to propagate
      await networkHelper.wait(1000);

      // All clients should receive the agent_spawned event
      for (const clientMessages of receivedMessages) {
        const agentSpawnedEvents = clientMessages.filter(
          (msg) => msg.type === 'swarm_event' && msg.event === 'agent_spawned'
        );

        expect(agentSpawnedEvents.length).toBeGreaterThan(0);
        expect(agentSpawnedEvents[0]?.data?.agentId).toBe(newAgent.id);
        expect(agentSpawnedEvents[0]?.data?.agentType).toBe('coordinator');
      }

      // Assign task - should trigger more real-time updates
      await swarmCoordinator.assignTask(newAgent.id, {
        id: 'realtime-test-task',
        type: 'monitoring',
        priority: 'high',
      });

      await networkHelper.wait(1000);

      // All clients should receive the task_assigned event
      for (const clientMessages of receivedMessages) {
        const taskAssignedEvents = clientMessages.filter(
          (msg) => msg.type === 'swarm_event' && msg.event === 'task_assigned'
        );

        expect(taskAssignedEvents.length).toBeGreaterThan(0);
        expect(taskAssignedEvents[0]?.data?.taskId).toBe('realtime-test-task');
        expect(taskAssignedEvents[0]?.data?.agentId).toBe(newAgent.id);
      }

      // Cleanup
      for (const client of clients) {
        client.close();
      }
    });

    it('should handle real-time agent status changes', async () => {
      const client = new WebSocket(`ws://localhost:${WS_PORT}`);
      const receivedEvents: any[] = [];

      client.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'agent_status_update') {
          receivedEvents.push(message);
        }
      });

      await networkHelper.waitForWebSocketConnection(client);

      // Subscribe to agent status updates
      client.send(
        JSON.stringify({
          type: 'subscribe',
          channel: 'agent_status',
          filter: { includeMetrics: true },
        })
      );

      await networkHelper.wait(500);

      const agents = await agentManager.getAllActiveAgents();
      const testAgent = agents[0];

      // Simulate agent status changes
      const statusChanges = [
        { status: 'busy', workload: 0.8 },
        { status: 'idle', workload: 0.1 },
        { status: 'error', error: 'Simulated error' },
        { status: 'recovering', workload: 0.0 },
        { status: 'active', workload: 0.3 },
      ];

      for (const statusChange of statusChanges) {
        await agentManager.updateAgentStatus(testAgent.id, statusChange);
        await networkHelper.wait(300); // Allow real-time update to propagate
      }

      // Verify all status changes were broadcast
      expect(receivedEvents.length).toBe(statusChanges.length);

      statusChanges.forEach((expectedChange, index) => {
        const event = receivedEvents[index];
        expect(event['data']?.['agentId']).toBe(testAgent.id);
        expect(event['data']?.['status']).toBe(expectedChange.status);

        if (expectedChange.workload !== undefined) {
          expect(event['data']?.['metrics']?.['workload']).toBe(expectedChange.workload);
        }

        if (expectedChange.error) {
          expect(event['data']?.error).toBe(expectedChange.error);
        }
      });

      client.close();
    });

    it('should provide real-time task progress tracking', async () => {
      const client = new WebSocket(`ws://localhost:${WS_PORT}`);
      const progressUpdates: any[] = [];

      client.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'task_progress') {
          progressUpdates.push(message);
        }
      });

      await networkHelper.waitForWebSocketConnection(client);

      // Subscribe to task progress
      client.send(
        JSON.stringify({
          type: 'subscribe',
          channel: 'task_progress',
          filter: { includeSteps: true, includeTimestamps: true },
        })
      );

      await networkHelper.wait(500);

      // Create and execute a multi-step task
      const complexTask = {
        id: 'complex-realtime-task',
        type: 'multi_step_analysis',
        steps: [
          { id: 'step1', name: 'Data Collection', estimatedDuration: 2000 },
          { id: 'step2', name: 'Processing', estimatedDuration: 3000 },
          { id: 'step3', name: 'Analysis', estimatedDuration: 2000 },
          { id: 'step4', name: 'Report Generation', estimatedDuration: 1000 },
        ],
        enableProgressTracking: true,
      };

      const agents = await agentManager.getAllActiveAgents();
      await swarmCoordinator.assignTask(agents[0]?.id, complexTask);

      // Simulate task execution with progress updates
      const startTime = Date.now();
      for (let i = 0; i < complexTask.steps.length; i++) {
        const step = complexTask.steps[i];

        // Start step
        await swarmCoordinator.updateTaskProgress(complexTask.id, {
          currentStep: i,
          stepStatus: 'in_progress',
          overallProgress: (i / complexTask.steps.length) * 100,
          estimatedCompletion: startTime + (i + 1) * 2000,
        });

        await networkHelper.wait(step.estimatedDuration / 4); // Simulate partial progress

        // Mid-step progress
        await swarmCoordinator.updateTaskProgress(complexTask.id, {
          currentStep: i,
          stepStatus: 'in_progress',
          stepProgress: 50,
          overallProgress: ((i + 0.5) / complexTask.steps.length) * 100,
        });

        await networkHelper.wait(step.estimatedDuration / 4);

        // Complete step
        await swarmCoordinator.updateTaskProgress(complexTask.id, {
          currentStep: i,
          stepStatus: 'completed',
          stepProgress: 100,
          overallProgress: ((i + 1) / complexTask.steps.length) * 100,
        });
      }

      // Final completion
      await swarmCoordinator.updateTaskProgress(complexTask.id, {
        currentStep: complexTask.steps.length - 1,
        taskStatus: 'completed',
        overallProgress: 100,
        completedAt: Date.now(),
      });

      await networkHelper.wait(1000);

      // Verify progress tracking
      expect(progressUpdates.length).toBeGreaterThan(8); // At least 2 updates per step + completion

      // Check progress sequence
      const progressValues = progressUpdates.map((update) => update.data.overallProgress);

      // Progress should be non-decreasing
      for (let i = 1; i < progressValues.length; i++) {
        expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1]);
      }

      // Final progress should be 100%
      expect(progressValues[progressValues.length - 1]).toBe(100);

      // Should have completion event
      const completionEvent = progressUpdates.find(
        (update) => update.data.taskStatus === 'completed'
      );
      expect(completionEvent).toBeDefined();
      expect(completionEvent.data.completedAt).toBeDefined();

      client.close();
    });
  });

  describe('Real-time Performance Monitoring', () => {
    it('should stream live system metrics to connected clients', async () => {
      const client = new WebSocket(`ws://localhost:${WS_PORT}`);
      const metricsUpdates: any[] = [];

      client.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'system_metrics') {
          metricsUpdates.push(message);
        }
      });

      await networkHelper.waitForWebSocketConnection(client);

      // Subscribe to system metrics
      client.send(
        JSON.stringify({
          type: 'subscribe',
          channel: 'system_metrics',
          filter: {
            metrics: ['cpu', 'memory', 'network', 'agents', 'tasks'],
            updateInterval: 1000,
          },
        })
      );

      // Wait for several metric updates
      await networkHelper.wait(5000);

      expect(metricsUpdates.length).toBeGreaterThanOrEqual(4);

      // Verify metric structure
      const latestMetrics = metricsUpdates[metricsUpdates.length - 1];
      expect(latestMetrics.data).toMatchObject({
        timestamp: expect.any(Number),
        cpu: expect.objectContaining({
          usage: expect.any(Number),
          cores: expect.any(Number),
        }),
        memory: expect.objectContaining({
          used: expect.any(Number),
          total: expect.any(Number),
          percentage: expect.any(Number),
        }),
        agents: expect.objectContaining({
          active: expect.any(Number),
          total: expect.any(Number),
          busyCount: expect.any(Number),
        }),
        tasks: expect.objectContaining({
          pending: expect.any(Number),
          running: expect.any(Number),
          completed: expect.any(Number),
        }),
      });

      // Metrics should have reasonable values
      expect(latestMetrics.data.cpu.usage).toBeGreaterThanOrEqual(0);
      expect(latestMetrics.data.cpu.usage).toBeLessThanOrEqual(100);
      expect(latestMetrics.data.memory.percentage).toBeGreaterThanOrEqual(0);
      expect(latestMetrics.data.memory.percentage).toBeLessThanOrEqual(100);

      client.close();
    });

    it('should alert on performance threshold violations', async () => {
      const client = new WebSocket(`ws://localhost:${WS_PORT}`);
      const alerts: any[] = [];

      client.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'performance_alert') {
          alerts.push(message);
        }
      });

      await networkHelper.waitForWebSocketConnection(client);

      // Subscribe to performance alerts
      client.send(
        JSON.stringify({
          type: 'subscribe',
          channel: 'performance_alerts',
          filter: {
            thresholds: {
              cpuUsage: 80,
              memoryUsage: 85,
              taskQueueLength: 50,
              agentResponseTime: 5000,
            },
          },
        })
      );

      await networkHelper.wait(500);

      // Simulate high CPU usage
      await realTimeMonitor.simulatePerformanceEvent({
        type: 'cpu_spike',
        value: 85,
        duration: 2000,
      });

      await networkHelper.wait(1500);

      // Should receive CPU usage alert
      const cpuAlert = alerts.find(
        (alert) => alert.data.metric === 'cpu_usage' && alert.data.severity === 'warning'
      );
      expect(cpuAlert).toBeDefined();
      expect(cpuAlert.data.value).toBeGreaterThan(80);
      expect(cpuAlert.data.threshold).toBe(80);

      // Simulate memory pressure
      await realTimeMonitor.simulatePerformanceEvent({
        type: 'memory_pressure',
        value: 90,
        duration: 3000,
      });

      await networkHelper.wait(1500);

      // Should receive memory alert
      const memoryAlert = alerts.find(
        (alert) => alert.data.metric === 'memory_usage' && alert.data.severity === 'critical'
      );
      expect(memoryAlert).toBeDefined();
      expect(memoryAlert.data.value).toBeGreaterThan(85);

      client.close();
    });

    it('should provide real-time network latency monitoring', async () => {
      const client = new WebSocket(`ws://localhost:${WS_PORT}`);
      const networkMetrics: any[] = [];

      client.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'network_metrics') {
          networkMetrics.push(message);
        }
      });

      await networkHelper.waitForWebSocketConnection(client);

      // Subscribe to network metrics
      client.send(
        JSON.stringify({
          type: 'subscribe',
          channel: 'network_metrics',
          filter: {
            includeLatency: true,
            includeThroughput: true,
            updateInterval: 1000,
          },
        })
      );

      await networkHelper.wait(500);

      // Generate network activity
      const agents = await agentManager.getAllActiveAgents();

      for (let i = 0; i < 10; i++) {
        // Send messages between agents
        const senderIndex = i % agents.length;
        const receiverIndex = (i + 1) % agents.length;

        await swarmCoordinator.sendMessage(agents[senderIndex]?.id, agents[receiverIndex]?.id, {
          id: `network-test-${i}`,
          type: 'ping',
          content: { ping: Date.now() },
          measureLatency: true,
        });

        await networkHelper.wait(200);
      }

      await networkHelper.wait(2000);

      expect(networkMetrics.length).toBeGreaterThan(0);

      const latestNetworkMetrics = networkMetrics[networkMetrics.length - 1];
      expect(latestNetworkMetrics.data).toMatchObject({
        timestamp: expect.any(Number),
        latency: expect.objectContaining({
          average: expect.any(Number),
          min: expect.any(Number),
          max: expect.any(Number),
          p95: expect.any(Number),
        }),
        throughput: expect.objectContaining({
          messagesPerSecond: expect.any(Number),
          bytesPerSecond: expect.any(Number),
        }),
        connections: expect.objectContaining({
          active: expect.any(Number),
          total: expect.any(Number),
        }),
      });

      // Latency values should be reasonable
      expect(latestNetworkMetrics.data.latency.average).toBeGreaterThan(0);
      expect(latestNetworkMetrics.data.latency.average).toBeLessThan(1000); // < 1 second
      expect(latestNetworkMetrics.data.latency.min).toBeLessThanOrEqual(
        latestNetworkMetrics.data.latency.average
      );
      expect(latestNetworkMetrics.data.latency.max).toBeGreaterThanOrEqual(
        latestNetworkMetrics.data.latency.average
      );

      client.close();
    });
  });

  describe('WebSocket Connection Management', () => {
    it('should handle client connections and disconnections gracefully', async () => {
      const clients: WebSocket[] = [];
      const connectionEvents: any[] = [];

      // Monitor connection events
      wsManager.on('client_connected', (clientInfo) => {
        connectionEvents.push({ type: 'connected', ...clientInfo });
      });

      wsManager.on('client_disconnected', (clientInfo) => {
        connectionEvents.push({ type: 'disconnected', ...clientInfo });
      });

      // Create multiple clients
      for (let i = 0; i < 5; i++) {
        const client = new WebSocket(`ws://localhost:${WS_PORT}`);
        clients.push(client);
        await networkHelper.waitForWebSocketConnection(client);
        await networkHelper.wait(100); // Allow event processing
      }

      // All connections should be registered
      const connectionCount = await wsManager.getConnectionCount();
      expect(connectionCount).toBe(5);

      const connectedEvents = connectionEvents.filter((e) => e.type === 'connected');
      expect(connectedEvents.length).toBe(5);

      // Disconnect clients randomly
      const disconnectOrder = [2, 0, 4, 1, 3];

      for (const index of disconnectOrder) {
        clients[index]?.close();
        await networkHelper.wait(200); // Allow disconnection processing
      }

      await networkHelper.wait(1000);

      // All disconnections should be registered
      const disconnectedEvents = connectionEvents.filter((e) => e.type === 'disconnected');
      expect(disconnectedEvents.length).toBe(5);

      const finalConnectionCount = await wsManager.getConnectionCount();
      expect(finalConnectionCount).toBe(0);
    });

    it('should implement connection rate limiting', async () => {
      const rapidConnections: WebSocket[] = [];
      const connectionAttempts = 15; // Attempt more than limit
      const successfulConnections: WebSocket[] = [];
      const failedConnections: number[] = [];

      // Configure rate limiting
      await wsManager.setRateLimit({
        maxConnectionsPerMinute: 10,
        maxConnectionsPerIP: 8,
        enforceGlobally: true,
      });

      // Rapid connection attempts
      for (let i = 0; i < connectionAttempts; i++) {
        try {
          const client = new WebSocket(`ws://localhost:${WS_PORT}`);

          await Promise.race([
            networkHelper.waitForWebSocketConnection(client),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Connection timeout')), 2000)
            ),
          ]);

          successfulConnections.push(client);
        } catch (error) {
          failedConnections.push(i);
        }

        await networkHelper.wait(50); // Small delay between attempts
      }

      // Should have rate limited some connections
      expect(successfulConnections.length).toBeLessThan(connectionAttempts);
      expect(successfulConnections.length).toBeLessThanOrEqual(10);
      expect(failedConnections.length).toBeGreaterThan(0);

      // Cleanup successful connections
      for (const client of successfulConnections) {
        client.close();
      }
    });

    it('should implement heartbeat and connection health monitoring', async () => {
      const client = new WebSocket(`ws://localhost:${WS_PORT}`);
      const heartbeats: any[] = [];

      client.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'heartbeat') {
          heartbeats.push({
            timestamp: Date.now(),
            data: message['data'],
          });

          // Respond to heartbeat
          client.send(
            JSON.stringify({
              type: 'heartbeat_response',
              id: message.id,
              timestamp: Date.now(),
            })
          );
        }
      });

      await networkHelper.waitForWebSocketConnection(client);

      // Enable heartbeat monitoring
      client.send(
        JSON.stringify({
          type: 'enable_heartbeat',
          interval: 2000, // 2 seconds
        })
      );

      // Wait for several heartbeats
      await networkHelper.wait(10000);

      expect(heartbeats.length).toBeGreaterThanOrEqual(4);

      // Verify heartbeat timing
      for (let i = 1; i < heartbeats.length; i++) {
        const timeDiff = heartbeats[i]?.timestamp - heartbeats[i - 1]?.timestamp;
        expect(timeDiff).toBeGreaterThan(1800); // Allow some variance
        expect(timeDiff).toBeLessThan(2200);
      }

      // Test connection health
      const healthStatus = await wsManager.getConnectionHealth(client);
      expect(healthStatus).toMatchObject({
        connected: true,
        lastHeartbeat: expect.any(Number),
        responseTime: expect.any(Number),
        missedHeartbeats: expect.any(Number),
      });

      expect(healthStatus.responseTime).toBeLessThan(100); // Should be fast
      expect(healthStatus.missedHeartbeats).toBeLessThan(2);

      client.close();
    });
  });

  describe('Real-time Collaboration Features', () => {
    it('should enable real-time document collaboration', async () => {
      const collaborators: WebSocket[] = [];
      const documentUpdates: any[][] = [];

      // Create collaborator clients
      for (let i = 0; i < 3; i++) {
        const client = new WebSocket(`ws://localhost:${WS_PORT}`);
        const clientUpdates: any[] = [];

        client.on('message', (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === 'document_update') {
            clientUpdates.push(message);
          }
        });

        collaborators.push(client);
        documentUpdates.push(clientUpdates);

        await networkHelper.waitForWebSocketConnection(client);
      }

      // Subscribe all clients to document collaboration
      const documentId = 'test-document-123';

      for (const client of collaborators) {
        client.send(
          JSON.stringify({
            type: 'join_document',
            documentId,
            userId: `user-${Date.now()}-${Math.random()}`,
          })
        );
      }

      await networkHelper.wait(500);

      // Simulate collaborative editing
      const edits = [
        {
          collaborator: 0,
          operation: {
            type: 'insert',
            position: 0,
            content: 'Hello, ',
            timestamp: Date.now(),
          },
        },
        {
          collaborator: 1,
          operation: {
            type: 'insert',
            position: 7,
            content: 'world! ',
            timestamp: Date.now() + 100,
          },
        },
        {
          collaborator: 2,
          operation: {
            type: 'insert',
            position: 14,
            content: 'This is collaborative editing.',
            timestamp: Date.now() + 200,
          },
        },
      ];

      for (const edit of edits) {
        collaborators[edit.collaborator]?.send(
          JSON.stringify({
            type: 'document_edit',
            documentId,
            operation: edit.operation,
          })
        );

        await networkHelper.wait(200);
      }

      await networkHelper.wait(1000);

      // All other collaborators should receive each edit
      for (let i = 0; i < collaborators.length; i++) {
        const otherCollaboratorUpdates = documentUpdates[i];

        // Should receive updates from other collaborators (not their own)
        const receivedEdits = otherCollaboratorUpdates.filter(
          (update) => update.data.documentId === documentId
        );

        expect(receivedEdits.length).toBe(2); // Updates from 2 other collaborators

        // Verify edit content
        receivedEdits.forEach((edit) => {
          expect(edit.data.operation).toMatchObject({
            type: expect.stringMatching(/insert|delete|replace/),
            position: expect.any(Number),
            content: expect.any(String),
          });
        });
      }

      // Cleanup
      for (const client of collaborators) {
        client.close();
      }
    });

    it('should handle real-time cursor position sharing', async () => {
      const collaborators: WebSocket[] = [];
      const cursorUpdates: any[][] = [];

      // Create collaborator clients
      for (let i = 0; i < 4; i++) {
        const client = new WebSocket(`ws://localhost:${WS_PORT}`);
        const clientCursorUpdates: any[] = [];

        client.on('message', (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === 'cursor_update') {
            clientCursorUpdates.push(message);
          }
        });

        collaborators.push(client);
        cursorUpdates.push(clientCursorUpdates);

        await networkHelper.waitForWebSocketConnection(client);
      }

      const documentId = 'cursor-test-document';

      // Join document session
      for (let i = 0; i < collaborators.length; i++) {
        collaborators[i]?.send(
          JSON.stringify({
            type: 'join_document',
            documentId,
            userId: `user-${i}`,
            userName: `Collaborator ${i}`,
            enableCursorSharing: true,
          })
        );
      }

      await networkHelper.wait(500);

      // Simulate cursor movements
      const cursorMovements = [
        { user: 0, position: { line: 1, column: 5 }, selection: null },
        {
          user: 1,
          position: { line: 2, column: 10 },
          selection: { start: { line: 2, column: 8 }, end: { line: 2, column: 15 } },
        },
        { user: 2, position: { line: 3, column: 0 }, selection: null },
        { user: 0, position: { line: 1, column: 12 }, selection: null },
        {
          user: 3,
          position: { line: 4, column: 20 },
          selection: { start: { line: 4, column: 15 }, end: { line: 4, column: 25 } },
        },
      ];

      for (const movement of cursorMovements) {
        collaborators[movement.user]?.send(
          JSON.stringify({
            type: 'cursor_move',
            documentId,
            position: movement.position,
            selection: movement.selection,
          })
        );

        await networkHelper.wait(150);
      }

      await networkHelper.wait(1000);

      // Verify cursor updates were broadcast to other users
      for (let i = 0; i < collaborators.length; i++) {
        const userCursorUpdates = cursorUpdates[i];

        // Should receive cursor updates from other users
        const receivedCursorUpdates = userCursorUpdates.filter(
          (update) => update.data.documentId === documentId && update.data.userId !== `user-${i}`
        );

        expect(receivedCursorUpdates.length).toBeGreaterThan(0);

        // Verify cursor update structure
        receivedCursorUpdates.forEach((update) => {
          expect(update.data).toMatchObject({
            userId: expect.any(String),
            userName: expect.any(String),
            position: expect.objectContaining({
              line: expect.any(Number),
              column: expect.any(Number),
            }),
          });
        });
      }

      // Cleanup
      for (const client of collaborators) {
        client.close();
      }
    });
  });
});
