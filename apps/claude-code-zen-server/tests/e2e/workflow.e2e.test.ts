// Vitest E2E test for workflow orchestration ("will") in Claude Code Zen

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import { app } from '../../src/interfaces/api/webserver'; // Adjust import if needed

let server: ReturnType<typeof createServer>;
let api: request.SuperTest<request.Test>;

beforeAll(async () => {
  // Start the API server (adjust as needed for your app)
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  // @ts-ignore
  const port = typeof address === 'object' && address ? address.port : 3000;
  api = request(`http://127.0.0.1:${port}`);
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('Workflow Orchestration E2E ("will" workflow)', () => {
  let createdTaskId: string;
  let approvalId: string;

  it('should create a new workflow task via API', async () => {
    const res = await api.post('/api/tasks').send({
      type: 'will',
      input: { foo: 'bar' }
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    createdTaskId = res.body.data.id;
  });

  it('should execute the workflow and complete successfully', async () => {
    const res = await api.post(`/api/tasks/${createdTaskId}/execute`).send();
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data.status).toMatch(/completed|success/i);
  });

  it('should list pending approvals for the workflow task', async () => {
    const res = await api.get('/api/agui/approvals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const approvals = res.body.data;
    // Find approval for our created task
    const approval = approvals.find((a: any) => a.taskId === createdTaskId);
    expect(approval).toBeDefined();
    approvalId = approval.id;
  });

  it('should approve the workflow task via TaskMaster and emit approval event', async () => {
    const res = await api.post(`/api/agui/approvals/${approvalId}/approve`).send({ approved: true });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data.status).toMatch(/approved|completed|success/i);

    // Check EventBus for approval event and audit trail
    const eventsRes = await api.get('/api/events');
    expect(eventsRes.status).toBe(200);
    expect(eventsRes.body.success).toBe(true);
    const events = eventsRes.body.data;
    const approvalEvents = events.filter((e: any) =>
      e.type && e.type.toLowerCase().includes('approval')
    );
    expect(approvalEvents.some((e: any) => e.taskId === createdTaskId)).toBe(true);
    // Audit trail: look for audit or approval event with correct status
    expect(
      approvalEvents.some(
        (e: any) =>
          e.taskId === createdTaskId &&
          (e.status?.toLowerCase?.() === 'approved' || e.status?.toLowerCase?.() === 'completed')
      )
    ).toBe(true);
  });

  it('should reject approval with invalid approvalId and emit error event', async () => {
    const res = await api.post('/api/agui/approvals/invalid-id/approve').send({ approved: true });
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/not found|invalid|approve/i);

    // Check EventBus for error event
    const eventsRes = await api.get('/api/events');
    expect(eventsRes.status).toBe(200);
    expect(eventsRes.body.success).toBe(true);
    const events = eventsRes.body.data;
    const errorEvents = events.filter((e: any) =>
      e.type && e.type.toLowerCase().includes('error')
    );
    expect(errorEvents.length).toBeGreaterThan(0);
    expect(
      errorEvents.some((e: any) => e.message && e.message.match(/not found|invalid|approve/i))
    ).toBe(true);
  });

  it('should handle execution of a non-existent workflow with error', async () => {
    const res = await api.post('/api/tasks/invalid-id/execute').send();
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/not found|invalid/i);
  });
});