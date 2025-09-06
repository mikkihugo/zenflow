// Vitest E2E test for SAFe 6.0 Inspect & Adapt ceremony (event-driven)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import WebSocket from 'ws';

const WS_URL = process.env.E2E_WS_URL || 'ws://localhost:4000/ws';

function sendEvent(ws: WebSocket, event: any): Promise<any> {
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

describe('SAFe 6.0 Inspect & Adapt Ceremony E2E', () => {
  let ws: WebSocket;

  beforeAll((done) => {
    ws = new WebSocket(WS_URL);
    ws.on('open', () => done());
    ws.on('error', (err) => done(err));
  });

  afterAll((done) => {
    ws.close();
    ws.on('close', () => done());
  });

  it('should trigger Inspect & Adapt ceremony and validate event flow', async () => {
    // Step 1: Trigger Inspect & Adapt ceremony
    const triggerEvent = {
      event: 'safe:inspect-adapt-initiated',
      payload: {
        ceremonyId: 'ia-001',
        programIncrementId: 'pi-2025-01',
        startDate: new Date().toISOString(),
        facilitator: 'RTE-1'
      }
    };
    const triggerResp = await sendEvent(ws, triggerEvent);
    expect(triggerResp.event).toBe('safe:inspect-adapt-initiated:ack');
    expect(triggerResp.payload.ceremonyId).toBe('ia-001');

    // Step 2: Capture metrics
    const metricEvent = {
      event: 'safe:inspect-adapt-metric-captured',
      payload: {
        ceremonyId: 'ia-001',
        metricType: 'defect-rate',
        value: 0.02,
        capturedBy: 'QA-LEAD'
      }
    };
    const metricResp = await sendEvent(ws, metricEvent);
    expect(metricResp.event).toBe('safe:inspect-adapt-metric-captured:ack');
    expect(metricResp.payload.metricType).toBe('defect-rate');
    expect(metricResp.payload.value).toBe(0.02);

    // Step 3: Facilitate problem-solving event
    const problemEvent = {
      event: 'safe:inspect-adapt-problem-solved',
      payload: {
        ceremonyId: 'ia-001',
        problemId: 'prob-123',
        rootCause: 'automation-gap',
        countermeasure: 'implement-e2e-tests',
        solvedBy: 'TEAM-ALPHA'
      }
    };
    const problemResp = await sendEvent(ws, problemEvent);
    expect(problemResp.event).toBe('safe:inspect-adapt-problem-solved:ack');
    expect(problemResp.payload.problemId).toBe('prob-123');
    expect(problemResp.payload.countermeasure).toBe('implement-e2e-tests');
  });

  it('should reject invalid Inspect & Adapt event with error', async () => {
    const invalidEvent = {
      event: 'safe:inspect-adapt-metric-captured',
      payload: {
        // Missing required ceremonyId
        metricType: 'velocity',
        value: 45
      }
    };
    const resp = await sendEvent(ws, invalidEvent);
    expect(resp.event).toBe('error');
    expect(resp.payload.message).toMatch(/ceremonyId/i);
  });
});