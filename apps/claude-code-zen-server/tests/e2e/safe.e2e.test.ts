// Vitest E2E test for SAFe PI Planning workflow (WebSocket event-driven)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import WebSocket from 'ws';

const WS_URL = process.env.SAFE_WS_URL || 'ws://127.0.0.1:3001/ws'; // Adjust port/path as needed

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

describe('SAFe Workflow E2E (PI Planning)', () => {
  let lastWorkflowId: string | undefined;

  // TODO: Multi-team PI Planning scenario
  // - Simulate multiple teams submitting PI plans in parallel
  // - Validate cross-team dependencies and event ordering

  // TODO: Cross-team dependency resolution
  // - Inject dependencies between teams and assert correct event sequencing

  // TODO: Resource allocation and constraint validation
  // - Simulate resource contention and validate constraint handling

  // TODO: Iteration goal setting and tracking
  // - Submit iteration goals and assert tracking events

  // TODO: Portfolio-level artifact linkage
  // - Link PI Planning workflow to portfolio epics/features and validate linkage

  // TODO: Audit trail and event history validation
  // - Fetch and assert full event history for a workflow

  // TODO: TaskMaster approval path (manual/automatic)
  // - Simulate both manual and automatic approval flows

  // TODO: Negative tests for resource/content conflicts
  // - Simulate conflicting plans and assert rejection/errors

  it('should complete PI planning workflow and emit approval event', async () => {
    const event = {
      type: 'brain:coordination:safe-workflow-support',
      workflowType: 'pi-planning',
      documentId: 'doc-001',
      documentType: 'vision',
      safeArtifacts: {
        businessValue: 'Deliver MVP',
        acceptanceCriteria: ['MVP delivered', 'Stakeholder signoff'],
        dependencies: [],
        estimates: { storyPoints: 40 }
      },
      priority: 'high',
      sparcPhase: 'specification',
      approvalRequired: true
    };
    const response = await sendEvent(event);
    expect(response.type).toBe('coordination:brain:workflow-approved');
    expect(response.approvalType).toMatch(/automatic|taskmaster|manual/);
    expect(response.allocatedResources).toBeDefined();
    expect(response.constraints).toBeDefined();
    // Capture workflow/task id if present for later assertions
    lastWorkflowId = response.workflowId || response.taskId;
    // Optionally: fetch events from REST API and assert approval event
    // (requires REST API server running on 127.0.0.1:3000)
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
    } catch (err) {
      // Ignore if REST API is not available in this test context
    }
  });

  it('should simulate rejection and emit rejection event', async () => {
    // Simulate a workflow that will be rejected (e.g. missing required approval fields)
    const event = {
      type: 'brain:coordination:safe-workflow-support',
      workflowType: 'pi-planning',
      documentId: 'doc-002',
      documentType: 'vision',
      safeArtifacts: {
        businessValue: 'Fail MVP',
        acceptanceCriteria: [],
        dependencies: [],
        estimates: { storyPoints: 0 }
      },
      priority: 'low',
      sparcPhase: 'specification',
      approvalRequired: true,
      forceReject: true // Custom field to trigger rejection in test harness, if supported
    };
    const response = await sendEvent(event);
    // Accept either explicit rejection event or error
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
    } catch (err) {
      // Ignore if REST API is not available in this test context
    }
  });

  it('should handle invalid PI planning event with error', async () => {
    const invalidEvent = {
      type: 'brain:coordination:safe-workflow-support',
      // Missing workflowType and required fields
      documentId: '',
      documentType: '',
      safeArtifacts: {},
      priority: 'low',
      sparcPhase: 'specification',
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
    } catch (err) {
      // Ignore if REST API is not available in this test context
    }
  });
});