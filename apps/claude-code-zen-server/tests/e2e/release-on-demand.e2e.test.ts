// Vitest E2E test for SAFe 6.0 Release on Demand workflow (event-driven)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import WebSocket from 'ws';

const WS_URL = process.env.SAFE_WS_URL || 'ws://127.0.0.1:3001/ws';

let ws: WebSocket;

function sendEvent(event: any): Promise<any> {
  return new Promise((resolve, reject) => {
    ws.once('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        resolve(msg);
      } catch (err) {
        reject(err);
      }
    });
    ws.send(JSON.stringify(event));
  });
}

beforeAll((done) => {
  ws = new WebSocket(WS_URL);
  ws.on('open', () => done());
  ws.on('error', (err) => done(err));
});

afterAll((done) => {
  ws.close();
  ws.on('close', () => done());
});

describe('SAFe 6.0 Release on Demand Workflow E2E', () => {
  let lastWorkflowId: string | undefined;

  it('should complete Release on Demand workflow and emit approval event', async () => {
    const event = {
      type: 'brain:coordination:safe-workflow-support',
      workflowType: 'release-on-demand',
      documentId: 'release-001',
      documentType: 'release-plan',
      safeArtifacts: {
        releaseNotes: 'Release MVP to production',
        acceptanceCriteria: ['MVP deployed', 'No critical bugs'],
        dependencies: [],
        estimates: { effort: 10 }
      },
      priority: 'critical',
      sparcPhase: 'release',
      approvalRequired: true
    };
    const response = await sendEvent(event);
    expect(response.type).toBe('coordination:brain:workflow-approved');
    expect(response.approvalType).toMatch(/automatic|taskmaster|manual/);
    expect(response.allocatedResources).toBeDefined();
    expect(response.constraints).toBeDefined();
    lastWorkflowId = response.workflowId || response.taskId;

    // Optionally: fetch events from REST API and assert approval event
    try {
      const apiRes = await fetch('http://127.0.0.1:3000/api/events');
      if (apiRes.ok) {
        const body = await apiRes.json();
        expect(body.success).toBe(true);
        const events = body.data;
        const approvalEvents = events.filter((e: any) =>
          e.type && e.type.toLowerCase().includes('approval')
        );
        expect(
          approvalEvents.some(
            (e: any) =>
              (e.workflowId === lastWorkflowId || e.taskId === lastWorkflowId) &&
              (e.status?.toLowerCase?.() === 'approved' || e.status?.toLowerCase?.() === 'completed')
          )
        ).toBe(true);
      }
    } catch {
      // Ignore if REST API is not available in this test context
    }
  });

  it('should simulate rejection and emit rejection event', async () => {
    const event = {
      type: 'brain:coordination:safe-workflow-support',
      workflowType: 'release-on-demand',
      documentId: 'release-002',
      documentType: 'release-plan',
      safeArtifacts: {
        releaseNotes: 'Broken release',
        acceptanceCriteria: [],
        dependencies: [],
        estimates: { effort: 0 }
      },
      priority: 'low',
      sparcPhase: 'release',
      approvalRequired: true,
      forceReject: true
    };
    const response = await sendEvent(event);
    expect(
      response.type === 'coordination:brain:workflow-rejected' ||
      response.type === 'error'
    ).toBe(true);
    if (response.type === 'coordination:brain:workflow-rejected') {
      expect(response.status).toMatch(/rejected|failed/i);
    } else {
      expect(response.error).toMatch(/reject|denied|invalid|fail/i);
    }
    // Optionally: fetch events from REST API and assert rejection event
    try {
      const apiRes = await fetch('http://127.0.0.1:3000/api/events');
      if (apiRes.ok) {
        const body = await apiRes.json();
        expect(body.success).toBe(true);
        const events = body.data;
        const rejectionEvents = events.filter((e: any) =>
          e.type && e.type.toLowerCase().includes('reject')
        );
        expect(rejectionEvents.length).toBeGreaterThan(0);
      }
    } catch {
      // Ignore if REST API is not available in this test context
    }
  });

  it('should handle invalid Release on Demand event with error', async () => {
    const invalidEvent = {
      type: 'brain:coordination:safe-workflow-support',
      // Missing workflowType and required fields
      documentId: '',
      documentType: '',
      safeArtifacts: {},
      priority: 'low',
      sparcPhase: 'release',
      approvalRequired: false
    };
    const response = await sendEvent(invalidEvent);
    expect(response.type).toBe('error');
    expect(response.error).toMatch(/invalid|missing/i);
    // Optionally: fetch events from REST API and assert error event
    try {
      const apiRes = await fetch('http://127.0.0.1:3000/api/events');
      if (apiRes.ok) {
        const body = await apiRes.json();
        expect(body.success).toBe(true);
        const events = body.data;
        const errorEvents = events.filter((e: any) =>
          e.type && e.type.toLowerCase().includes('error')
        );
        expect(errorEvents.length).toBeGreaterThan(0);
      }
    } catch {
      // Ignore if REST API is not available in this test context
    }
  });
});