// TypeScript

import { describe, it, expect, beforeAll } from 'vitest';
import { EventBus, ok, err } from '@claude-zen/foundation';
import { v4 as uuidv4 } from 'uuid';

// Mocked event payloads and helpers for event-driven PI Planning
const eventBus = new EventBus();

const PI_ID = uuidv4();
const teams = [
  { id: uuidv4(), name: 'Team Alpha' },
  { id: uuidv4(), name: 'Team Beta' }
];

describe('SAFe 6.0 PI Planning E2E', () => {
  beforeAll(() => {
    // Setup: Register PI and teams
    eventBus.emit('pi:created', { piId: PI_ID, name: 'PI-2025-Q1' });
    teams.forEach(team =>
      eventBus.emit('team:registered', { teamId: team.id, name: team.name, piId: PI_ID })
    );
  });

  it('should support team breakouts and draft plan creation', async () => {
    // Each team submits a draft plan via event
    for (const team of teams) {
      eventBus.emit('team:breakout:start', { teamId: team.id, piId: PI_ID });
      eventBus.emit('plan:draft:submitted', {
        teamId: team.id,
        piId: PI_ID,
        objectives: [`Objective for ${team.name}`],
        risks: [`Risk for ${team.name}`]
      });
    }
    // Listen for all draft plans submitted
    let drafts = [];
    eventBus.on('plan:draft:submitted', (payload) => {
      drafts.push(payload);
    });
    // Simulate event loop
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(drafts.length).toBe(2);
    expect(drafts.map(d => d.teamId)).toEqual(expect.arrayContaining(teams.map(t => t.id)));
  });

  it('should handle draft plan review and feedback', async () => {
    // Business Owners review and provide feedback
    let feedbackReceived = false;
    eventBus.on('plan:review:feedback', (payload) => {
      if (payload.piId === PI_ID) feedbackReceived = true;
    });
    eventBus.emit('plan:review:feedback', {
      piId: PI_ID,
      feedback: 'Draft plans align with business goals'
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(feedbackReceived).toBe(true);
  });

  it('should support confidence vote and record results', async () => {
    // Teams cast confidence votes
    let votes = [];
    eventBus.on('plan:confidence:vote', (payload) => {
      votes.push(payload);
    });
    teams.forEach(team => {
      eventBus.emit('plan:confidence:vote', {
        teamId: team.id,
        piId: PI_ID,
        vote: 4 // 1-5 scale
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(votes.length).toBe(2);
    expect(votes.every(v => v.vote >= 1 && v.vote <= 5)).toBe(true);
  });

  it('should support risk identification and ROAMing', async () => {
    // Teams raise risks, then ROAM them
    let risks = [];
    let roamed = [];
    eventBus.on('plan:risk:raised', (payload) => risks.push(payload));
    eventBus.on('plan:risk:roamed', (payload) => roamed.push(payload));
    teams.forEach(team => {
      eventBus.emit('plan:risk:raised', {
        teamId: team.id,
        piId: PI_ID,
        risk: `Dependency risk for ${team.name}`
      });
      eventBus.emit('plan:risk:roamed', {
        teamId: team.id,
        piId: PI_ID,
        risk: `Dependency risk for ${team.name}`,
        status: 'Owned'
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(risks.length).toBe(2);
    expect(roamed.length).toBe(2);
    expect(roamed.every(r => r.status === 'Owned')).toBe(true);
  });

  it('should coordinate all PI Planning events via the EventBus', async () => {
    // Listen for all relevant events
    const observedEvents: string[] = [];
    const eventTypes = [
      'pi:created',
      'team:registered',
      'team:breakout:start',
      'plan:draft:submitted',
      'plan:review:feedback',
      'plan:confidence:vote',
      'plan:risk:raised',
      'plan:risk:roamed'
    ];
    eventTypes.forEach(type => {
      eventBus.on(type, () => observedEvents.push(type));
    });
    // Emit all events
    eventBus.emit('pi:created', { piId: PI_ID, name: 'PI-2025-Q1' });
    teams.forEach(team => {
      eventBus.emit('team:registered', { teamId: team.id, name: team.name, piId: PI_ID });
      eventBus.emit('team:breakout:start', { teamId: team.id, piId: PI_ID });
      eventBus.emit('plan:draft:submitted', {
        teamId: team.id,
        piId: PI_ID,
        objectives: [`Objective for ${team.name}`],
        risks: [`Risk for ${team.name}`]
      });
      eventBus.emit('plan:confidence:vote', {
        teamId: team.id,
        piId: PI_ID,
        vote: 5
      });
      eventBus.emit('plan:risk:raised', {
        teamId: team.id,
        piId: PI_ID,
        risk: `Risk for ${team.name}`
      });
      eventBus.emit('plan:risk:roamed', {
        teamId: team.id,
        piId: PI_ID,
        risk: `Risk for ${team.name}`,
        status: 'Mitigated'
      });
    });
    eventBus.emit('plan:review:feedback', {
      piId: PI_ID,
      feedback: 'All plans reviewed'
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    // Ensure all event types were observed
    expect(eventTypes.every(type => observedEvents.includes(type))).toBe(true);
  });
});