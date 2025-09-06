// TypeScript

import { describe, it, expect, beforeAll } from 'vitest';
import { EventBus, ok, err } from '@claude-zen/foundation';
import { v4 as uuidv4 } from 'uuid';

// Mocked event payloads and helpers for event-driven Iteration Planning
const eventBus = new EventBus();

const ITERATION_ID = uuidv4();
const PI_ID = uuidv4();
const teams = [
  { id: uuidv4(), name: 'Team Alpha' },
  { id: uuidv4(), name: 'Team Beta' }
];

describe('SAFe 6.0 Iteration Planning & Execution E2E', () => {
  beforeAll(() => {
    // Setup: Register PI, iteration, and teams
    eventBus.emit('pi:created', { piId: PI_ID, name: 'PI-2025-Q1' });
    eventBus.emit('iteration:planned', {
      iterationId: ITERATION_ID,
      piId: PI_ID,
      name: 'Iteration 1',
      goals: ['Deliver feature X', 'Reduce tech debt']
    });
    teams.forEach(team =>
      eventBus.emit('team:registered', { teamId: team.id, name: team.name, piId: PI_ID })
    );
  });

  it('should allow teams to commit to iteration goals', async () => {
    let commitments: any[] = [];
    eventBus.on('iteration:committed', (payload) => {
      commitments.push(payload);
    });
    teams.forEach(team => {
      eventBus.emit('iteration:committed', {
        iterationId: ITERATION_ID,
        teamId: team.id,
        committedGoals: [`Goal for ${team.name}`]
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(commitments.length).toBe(2);
    expect(commitments.map(c => c.teamId)).toEqual(expect.arrayContaining(teams.map(t => t.id)));
  });

  it('should support iteration execution and progress reporting', async () => {
    let started = false;
    let progressUpdates: any[] = [];
    eventBus.on('iteration:started', (payload) => {
      if (payload.iterationId === ITERATION_ID) started = true;
    });
    eventBus.on('iteration:progress', (payload) => {
      progressUpdates.push(payload);
    });
    eventBus.emit('iteration:started', { iterationId: ITERATION_ID, piId: PI_ID });
    teams.forEach(team => {
      eventBus.emit('iteration:progress', {
        iterationId: ITERATION_ID,
        teamId: team.id,
        completedStories: Math.floor(Math.random() * 5) + 1
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(started).toBe(true);
    expect(progressUpdates.length).toBe(2);
  });

  it('should support iteration completion and validation', async () => {
    let completed = false;
    eventBus.on('iteration:completed', (payload) => {
      if (payload.iterationId === ITERATION_ID) completed = true;
    });
    eventBus.emit('iteration:completed', {
      iterationId: ITERATION_ID,
      piId: PI_ID,
      summary: 'All committed goals delivered'
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(completed).toBe(true);
  });

  it('should coordinate all Iteration Planning events via the EventBus', async () => {
    const observedEvents: string[] = [];
    const eventTypes = [
      'pi:created',
      'iteration:planned',
      'team:registered',
      'iteration:committed',
      'iteration:started',
      'iteration:progress',
      'iteration:completed'
    ];
    eventTypes.forEach(type => {
      eventBus.on(type, () => observedEvents.push(type));
    });
    // Emit all events in order
    eventBus.emit('pi:created', { piId: PI_ID, name: 'PI-2025-Q1' });
    eventBus.emit('iteration:planned', {
      iterationId: ITERATION_ID,
      piId: PI_ID,
      name: 'Iteration 1',
      goals: ['Deliver feature X', 'Reduce tech debt']
    });
    teams.forEach(team => {
      eventBus.emit('team:registered', { teamId: team.id, name: team.name, piId: PI_ID });
      eventBus.emit('iteration:committed', {
        iterationId: ITERATION_ID,
        teamId: team.id,
        committedGoals: [`Goal for ${team.name}`]
      });
      eventBus.emit('iteration:progress', {
        iterationId: ITERATION_ID,
        teamId: team.id,
        completedStories: 3
      });
    });
    eventBus.emit('iteration:started', { iterationId: ITERATION_ID, piId: PI_ID });
    eventBus.emit('iteration:completed', {
      iterationId: ITERATION_ID,
      piId: PI_ID,
      summary: 'All committed goals delivered'
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(eventTypes.every(type => observedEvents.includes(type))).toBe(true);
  });
});