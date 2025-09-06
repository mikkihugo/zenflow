// Vitest E2E test for CI agent coordination in Claude Code Zen

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import { app } from '../../src/interfaces/api/webserver'; // Adjust import if needed

let server: ReturnType<typeof createServer>;
let api: request.SuperTest<request.Test>;

beforeAll(async () => {
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

describe('Continuous Integration Agent Coordination E2E', () => {
  let ciTaskId: string;

  it('should create a new CI pipeline task via API', async () => {
    const res = await api.post('/api/tasks').send({
      type: 'ci',
      input: { repo: 'example/repo', branch: 'main' }
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    ciTaskId = res.body.data.id;
  });

  it('should execute the CI pipeline and emit agent orchestration events', async () => {
    const res = await api.post(`/api/tasks/${ciTaskId}/execute`).send();
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data.status).toMatch(/started|running|pending/i);

    // Wait briefly for events to propagate
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Fetch events from EventBus
    const eventsRes = await api.get('/api/events');
    expect(eventsRes.status).toBe(200);
    expect(eventsRes.body.success).toBe(true);
    const events = eventsRes.body.data;

    // Assert agent assignment event
    const agentAssigned = events.find(
      (e: any) =>
        e.type &&
        e.type.toLowerCase().includes('agent') &&
        e.type.toLowerCase().includes('assign') &&
        e.taskId === ciTaskId
    );
    expect(agentAssigned).toBeDefined();

    // Assert CI step events (e.g., build, test, deploy)
    const ciStepEvents = events.filter(
      (e: any) =>
        e.type &&
        e.type.toLowerCase().includes('ci') &&
        e.taskId === ciTaskId
    );
    expect(ciStepEvents.length).toBeGreaterThan(0);
    expect(
      ciStepEvents.some(
        (e: any) =>
          e.status &&
          ['build', 'test', 'deploy'].some((step) =>
            e.status.toLowerCase().includes(step)
          )
      )
    ).toBe(true);

    // Assert CI completion event
    const ciCompleted = ciStepEvents.find(
      (e: any) =>
        e.status &&
        ['success', 'completed', 'failed'].includes(e.status.toLowerCase())
    );
    expect(ciCompleted).toBeDefined();
  });

  it('should handle execution of a non-existent CI pipeline with error', async () => {
    const res = await api.post('/api/tasks/invalid-id/execute').send();
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/not found|invalid/i);
  });
});