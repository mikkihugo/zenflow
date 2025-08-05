/**
 * Real-Time Collaboration E2E Test Suite
 * Tests WebSocket real-time updates, collaborative editing, and live presence
 */

import { WebSocket } from 'ws';
import { DocumentDrivenSystem } from '../../core/document-driven-system';
import { WebInterfaceServer } from '../../interfaces/web/WebInterfaceServer';
import { RealFileSystemTestHelper } from '../helpers/filesystem-test-helper';
import { IntegrationTestSetup } from '../helpers/integration-test-setup';
import { RealNetworkTestHelper } from '../helpers/network-test-helper';

describe('Real-Time Collaboration E2E Tests', () => {
  let documentSystem: DocumentDrivenSystem;
  let webServer: WebInterfaceServer;
  let testSetup: IntegrationTestSetup;
  let fsHelper: RealFileSystemTestHelper;
  let networkHelper: RealNetworkTestHelper;

  const TEST_PROJECT_PATH = '/tmp/claude-zen-realtime-test';
  const WEB_SERVER_PORT = 3459;
  const E2E_TIMEOUT = 60000; // 1 minute

  beforeAll(async () => {
    testSetup = new IntegrationTestSetup();
    fsHelper = new RealFileSystemTestHelper();
    networkHelper = new RealNetworkTestHelper();

    await testSetup.initializeFullEnvironment();
    await fsHelper.createTestDirectory(TEST_PROJECT_PATH);
  }, E2E_TIMEOUT);

  afterAll(async () => {
    await testSetup.cleanup();
    await fsHelper.cleanup();
  });

  describe('WebSocket Real-Time Updates', () => {
    let wsClient1: WebSocket;
    let wsClient2: WebSocket;

    beforeEach(async () => {
      documentSystem = new DocumentDrivenSystem();
      webServer = new WebInterfaceServer({ port: WEB_SERVER_PORT });

      await Promise.all([documentSystem.initialize(), webServer.start()]);

      // Create WebSocket clients
      wsClient1 = new WebSocket(`ws://localhost:${WEB_SERVER_PORT}/ws`);
      wsClient2 = new WebSocket(`ws://localhost:${WEB_SERVER_PORT}/ws`);

      // Wait for connections
      await Promise.all([
        new Promise((resolve) => wsClient1.on('open', resolve)),
        new Promise((resolve) => wsClient2.on('open', resolve)),
      ]);
    });

    afterEach(async () => {
      wsClient1?.close();
      wsClient2?.close();
      await webServer.stop();
    });

    it('should broadcast document updates to all connected clients', async () => {
      const sessionId = `realtime-session-${Date.now()}`;
      const workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);

      // Client 1 subscribes to workspace updates
      const client1Updates: any[] = [];
      wsClient1.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'document.updated') {
          client1Updates.push(message);
        }
      });

      // Client 2 subscribes to workspace updates
      const client2Updates: any[] = [];
      wsClient2.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'document.updated') {
          client2Updates.push(message);
        }
      });

      // Subscribe both clients to workspace
      wsClient1.send(
        JSON.stringify({
          type: 'subscribe',
          sessionId,
          workspaceId,
          events: ['document.updated', 'document.created'],
        })
      );

      wsClient2.send(
        JSON.stringify({
          type: 'subscribe',
          sessionId,
          workspaceId,
          events: ['document.updated', 'document.created'],
        })
      );

      // Create a document via HTTP API (simulating external edit)
      const visionContent = `
# Real-Time Vision Test

## Overview
Test document for real-time collaboration.

## Changes
- Initial version
- Updated in real-time
`;

      const visionPath = await fsHelper.writeFile(
        `${TEST_PROJECT_PATH}/docs/01-vision/realtime-vision.md`,
        visionContent
      );

      // Process document (should trigger real-time updates)
      await documentSystem.processVisionaryDocument(workspaceId, visionPath);

      // Wait for real-time updates
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Both clients should receive the update
      expect(client1Updates.length).toBeGreaterThan(0);
      expect(client2Updates.length).toBeGreaterThan(0);

      const update1 = client1Updates[0];
      const update2 = client2Updates[0];

      expect(update1.workspaceId).toBe(workspaceId);
      expect(update2.workspaceId).toBe(workspaceId);
      expect(update1.document.path).toBe(visionPath);
      expect(update2.document.path).toBe(visionPath);
    });

    it('should handle concurrent document edits with conflict resolution', async () => {
      const _sessionId = `concurrent-session-${Date.now()}`;
      const workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);

      const conflictResults: any[] = [];

      // Monitor conflict resolution events
      wsClient1.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'document.conflict' || message.type === 'document.resolved') {
          conflictResults.push(message);
        }
      });

      // Simulate concurrent edits
      const docPath = `${TEST_PROJECT_PATH}/docs/03-prds/concurrent-prd.md`;

      // First edit
      const content1 = `
# Concurrent PRD Test

## Version 1
This is version 1 of the document.
      `;

      // Second edit (happening simultaneously)
      const content2 = `
# Concurrent PRD Test

## Version 2  
This is version 2 of the document.
      `;

      // Simulate concurrent writes
      await Promise.all([
        fsHelper.writeFile(docPath, content1),
        fsHelper.writeFile(docPath, content2),
      ]);

      // Process both edits
      await Promise.all([
        documentSystem.processVisionaryDocument(workspaceId, docPath),
        documentSystem.processVisionaryDocument(workspaceId, docPath),
      ]);

      // Wait for conflict resolution
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Should have detected and resolved conflict
      expect(conflictResults.length).toBeGreaterThan(0);

      const finalContent = await fsHelper.readFile(docPath);
      expect(finalContent).toBeDefined();
      expect(finalContent.length).toBeGreaterThan(0);
    });

    it('should broadcast system metrics in real-time', async () => {
      const metricsUpdates: any[] = [];

      wsClient1.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'metrics.update') {
          metricsUpdates.push(message);
        }
      });

      // Subscribe to metrics
      wsClient1.send(
        JSON.stringify({
          type: 'subscribe',
          events: ['metrics.update'],
        })
      );

      // Trigger some system activity
      const _workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);

      // Wait for metrics updates
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Should receive regular metrics updates
      expect(metricsUpdates.length).toBeGreaterThan(0);

      const metricsUpdate = metricsUpdates[0];
      expect(metricsUpdate.metrics).toBeDefined();
      expect(metricsUpdate.metrics.memoryUsage).toBeDefined();
      expect(metricsUpdate.metrics.activeWorkspaces).toBeDefined();
      expect(metricsUpdate.metrics.documentsProcessed).toBeDefined();
    });
  });

  describe('Collaborative Document Editing', () => {
    let workspaceId: string;

    beforeEach(async () => {
      documentSystem = new DocumentDrivenSystem();
      webServer = new WebInterfaceServer({ port: WEB_SERVER_PORT });

      await Promise.all([documentSystem.initialize(), webServer.start()]);

      workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);
    });

    afterEach(async () => {
      await webServer.stop();
    });

    it('should support collaborative PRD editing with real-time sync', async () => {
      const prdPath = `${TEST_PROJECT_PATH}/docs/03-prds/collaborative-prd.md`;
      const sessionId = `collab-session-${Date.now()}`;

      // Initial PRD content
      const initialContent = `
# Collaborative PRD

## User Stories
- [ ] Story 1
- [ ] Story 2

## Technical Requirements
- [ ] Requirement 1
- [ ] Requirement 2
`;

      await fsHelper.writeFile(prdPath, initialContent);

      // Simulate collaborative editing via API
      const editRequests = [
        {
          sessionId,
          operation: 'insert',
          position: { line: 5, column: 0 },
          content: '- [ ] Story 3\n',
          author: 'user1',
        },
        {
          sessionId,
          operation: 'insert',
          position: { line: 9, column: 0 },
          content: '- [ ] Requirement 3\n',
          author: 'user2',
        },
        {
          sessionId,
          operation: 'modify',
          position: { line: 4, column: 0 },
          content: '- [x] Story 1 (completed)\n',
          author: 'user1',
        },
      ];

      // Apply edits via API
      for (const edit of editRequests) {
        const response = await networkHelper.httpPost(
          `http://localhost:${WEB_SERVER_PORT}/api/documents/edit`,
          {
            workspaceId,
            documentPath: prdPath,
            edit,
          }
        );

        expect(response.status).toBe(200);
      }

      // Verify final content includes all edits
      const finalContent = await fsHelper.readFile(prdPath);
      expect(finalContent).toContain('Story 3');
      expect(finalContent).toContain('Requirement 3');
      expect(finalContent).toContain('[x] Story 1 (completed)');
    });

    it('should track edit history and provide rollback capability', async () => {
      const docPath = `${TEST_PROJECT_PATH}/docs/04-epics/versioned-epic.md`;

      const versions = [
        '# Epic v1\n\nInitial version',
        '# Epic v1\n\nInitial version\n\n## Features\n- Feature 1',
        '# Epic v1\n\nInitial version\n\n## Features\n- Feature 1\n- Feature 2',
      ];

      // Create versions
      for (let i = 0; i < versions.length; i++) {
        await fsHelper.writeFile(docPath, versions[i]);
        await documentSystem.processVisionaryDocument(workspaceId, docPath);
        await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay between versions
      }

      // Get version history
      const historyResponse = await networkHelper.httpGet(
        `http://localhost:${WEB_SERVER_PORT}/api/documents/history?workspaceId=${workspaceId}&path=${encodeURIComponent(docPath)}`
      );

      expect(historyResponse.status).toBe(200);
      expect(historyResponse.data.versions.length).toBeGreaterThanOrEqual(3);

      // Rollback to version 1
      const rollbackResponse = await networkHelper.httpPost(
        `http://localhost:${WEB_SERVER_PORT}/api/documents/rollback`,
        {
          workspaceId,
          documentPath: docPath,
          version: historyResponse.data.versions[0].id,
        }
      );

      expect(rollbackResponse.status).toBe(200);

      // Verify rollback
      const rolledBackContent = await fsHelper.readFile(docPath);
      expect(rolledBackContent).toContain('Initial version');
      expect(rolledBackContent).not.toContain('Feature 1');
    });
  });

  describe('Live Cursor Sharing and Presence', () => {
    let wsClient1: WebSocket;
    let wsClient2: WebSocket;
    let workspaceId: string;

    beforeEach(async () => {
      documentSystem = new DocumentDrivenSystem();
      webServer = new WebInterfaceServer({ port: WEB_SERVER_PORT });

      await Promise.all([documentSystem.initialize(), webServer.start()]);

      workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);

      wsClient1 = new WebSocket(`ws://localhost:${WEB_SERVER_PORT}/ws`);
      wsClient2 = new WebSocket(`ws://localhost:${WEB_SERVER_PORT}/ws`);

      await Promise.all([
        new Promise((resolve) => wsClient1.on('open', resolve)),
        new Promise((resolve) => wsClient2.on('open', resolve)),
      ]);
    });

    afterEach(async () => {
      wsClient1?.close();
      wsClient2?.close();
      await webServer.stop();
    });

    it('should track user presence and cursor positions', async () => {
      const docPath = `${TEST_PROJECT_PATH}/docs/05-features/presence-test.md`;
      await fsHelper.writeFile(docPath, '# Presence Test\n\nContent here...');

      const presenceUpdates: any[] = [];

      // Monitor presence updates
      wsClient2.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'presence.update') {
          presenceUpdates.push(message);
        }
      });

      // User 1 joins document
      wsClient1.send(
        JSON.stringify({
          type: 'presence.join',
          workspaceId,
          documentPath: docPath,
          user: {
            id: 'user1',
            name: 'User One',
            color: '#ff0000',
          },
        })
      );

      // User 1 moves cursor
      wsClient1.send(
        JSON.stringify({
          type: 'cursor.move',
          workspaceId,
          documentPath: docPath,
          position: { line: 2, column: 5 },
          user: 'user1',
        })
      );

      // User 2 subscribes to presence
      wsClient2.send(
        JSON.stringify({
          type: 'subscribe',
          workspaceId,
          documentPath: docPath,
          events: ['presence.update', 'cursor.move'],
        })
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      // User 2 should see User 1's presence and cursor
      expect(presenceUpdates.length).toBeGreaterThan(0);

      const presenceUpdate = presenceUpdates.find((u) => u.type === 'presence.update');
      expect(presenceUpdate).toBeDefined();
      expect(presenceUpdate.users).toContain(
        expect.objectContaining({
          id: 'user1',
          name: 'User One',
        })
      );
    });

    it('should handle user disconnection and cleanup presence', async () => {
      const docPath = `${TEST_PROJECT_PATH}/docs/05-features/disconnect-test.md`;
      await fsHelper.writeFile(docPath, '# Disconnect Test\n\nContent...');

      const disconnectUpdates: any[] = [];

      wsClient2.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'presence.leave') {
          disconnectUpdates.push(message);
        }
      });

      // User 1 joins
      wsClient1.send(
        JSON.stringify({
          type: 'presence.join',
          workspaceId,
          documentPath: docPath,
          user: { id: 'user1', name: 'User One' },
        })
      );

      // User 2 subscribes
      wsClient2.send(
        JSON.stringify({
          type: 'subscribe',
          workspaceId,
          documentPath: docPath,
          events: ['presence.leave'],
        })
      );

      await new Promise((resolve) => setTimeout(resolve, 200));

      // User 1 disconnects
      wsClient1.close();

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // User 2 should be notified of disconnection
      expect(disconnectUpdates.length).toBeGreaterThan(0);
      expect(disconnectUpdates[0].user.id).toBe('user1');
    });
  });

  describe('Performance Monitoring Dashboard', () => {
    beforeEach(async () => {
      documentSystem = new DocumentDrivenSystem();
      webServer = new WebInterfaceServer({ port: WEB_SERVER_PORT });

      await Promise.all([documentSystem.initialize(), webServer.start()]);
    });

    afterEach(async () => {
      await webServer.stop();
    });

    it('should provide real-time performance metrics dashboard', async () => {
      // Get initial dashboard data
      const dashboardResponse = await networkHelper.httpGet(
        `http://localhost:${WEB_SERVER_PORT}/api/dashboard/metrics`
      );

      expect(dashboardResponse.status).toBe(200);
      expect(dashboardResponse.data).toMatchObject({
        system: expect.objectContaining({
          memoryUsage: expect.any(Number),
          cpuUsage: expect.any(Number),
          uptime: expect.any(Number),
        }),
        documents: expect.objectContaining({
          totalProcessed: expect.any(Number),
          activeWorkspaces: expect.any(Number),
          recentActivity: expect.any(Array),
        }),
        realtime: expect.objectContaining({
          connectedClients: expect.any(Number),
          messagesPerSecond: expect.any(Number),
        }),
      });
    });

    it('should track workflow performance metrics', async () => {
      const workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);

      // Create documents to generate metrics
      const visionPath = await fsHelper.writeFile(
        `${TEST_PROJECT_PATH}/docs/01-vision/metrics-vision.md`,
        '# Metrics Test Vision\n\nTest content for metrics'
      );

      const startTime = Date.now();
      await documentSystem.processVisionaryDocument(workspaceId, visionPath);
      const processingTime = Date.now() - startTime;

      // Get workflow metrics
      const metricsResponse = await networkHelper.httpGet(
        `http://localhost:${WEB_SERVER_PORT}/api/metrics/workflow?workspaceId=${workspaceId}`
      );

      expect(metricsResponse.status).toBe(200);
      expect(metricsResponse.data).toMatchObject({
        documentsProcessed: expect.any(Number),
        averageProcessingTime: expect.any(Number),
        workflowStages: expect.objectContaining({
          vision: expect.any(Number),
          adr: expect.any(Number),
          prd: expect.any(Number),
        }),
      });

      // Processing time should be reasonable
      expect(processingTime).toBeLessThan(5000); // Less than 5 seconds
    });
  });
});
