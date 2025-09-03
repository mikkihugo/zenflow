import { EventBus } from '@claude-zen/foundation';

describe('EventBus Integration', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = EventBus.getInstance();
  });

  afterEach(() => {
    // Clean up any listeners
    eventBus.removeAllListeners();
  });

  it('should emit and receive coordination events', async () => {
    const testEventType = 'coordination:test:event';
    const testPayload = { message: 'test payload', timestamp: Date.now() };
    
    return new Promise<void>((resolve) => {
      // Set up listener
      eventBus.on(testEventType, (payload) => {
        expect(payload).toEqual(testPayload);
        resolve();
      });

      // Emit event
      eventBus.emit(testEventType, testPayload);
    });
  });

  it('should handle safe domain events', async () => {
    const safeEventType = 'safe:pi:planning';
    const safePayload = { piNumber: 1, status: 'planning' };
    
    return new Promise<void>((resolve) => {
      eventBus.on(safeEventType, (payload) => {
        expect(payload.piNumber).toBe(1);
        expect(payload.status).toBe('planning');
        resolve();
      });

      eventBus.emit(safeEventType, safePayload);
    });
  });

  it('should handle taskmaster domain events', async () => {
    const taskmasterEventType = 'taskmaster:task:created';
    const taskmasterPayload = { taskId: 'test-123', type: 'approval' };
    
    return new Promise<void>((resolve) => {
      eventBus.on(taskmasterEventType, (payload) => {
        expect(payload.taskId).toBe('test-123');
        expect(payload.type).toBe('approval');
        resolve();
      });

      eventBus.emit(taskmasterEventType, taskmasterPayload);
    });
  });

  it('should handle teamwork domain events', async () => {
    const teamworkEventType = 'teamwork:agent:collaboration';
    const teamworkPayload = { agents: ['agent1', 'agent2'], task: 'coordinate' };
    
    return new Promise<void>((resolve) => {
      eventBus.on(teamworkEventType, (payload) => {
        expect(payload.agents).toHaveLength(2);
        expect(payload.task).toBe('coordinate');
        resolve();
      });

      eventBus.emit(teamworkEventType, teamworkPayload);
    });
  });
});