/**
 * @fileoverview Test Event-Driven Task Complexity Estimator
 * 
 * Tests the event-driven functionality of the TaskComplexityEstimator
 * to ensure it properly emits events instead of returning values directly.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TaskComplexityEstimator } from '../task-complexity-estimator';

describe('TaskComplexityEstimator - Event-Driven', () => {
  let estimator: TaskComplexityEstimator;
  let events: Array<{ event: string; payload: any }> = [];

  beforeEach(() => {
    events = [];
    estimator = new TaskComplexityEstimator();
    
    // Listen to all events
    estimator.on('complexity:estimation_requested', (payload) => {
      events.push({ event: 'complexity:estimation_requested', payload });
    });
    
    estimator.on('complexity:estimation_completed', (payload) => {
      events.push({ event: 'complexity:estimation_completed', payload });
    });
    
    estimator.on('complexity:estimation_error', (payload) => {
      events.push({ event: 'complexity:estimation_error', payload });
    });
    
    estimator.on('complexity:learning_completed', (payload) => {
      events.push({ event: 'complexity:learning_completed', payload });
    });
    
    estimator.on('complexity:stats_updated', (payload) => {
      events.push({ event: 'complexity:stats_updated', payload });
    });
  });

  it('should emit estimation_requested and estimation_completed events', async () => {
    const task = 'test-task';
    const prompt = 'Analyze this complex data structure';
    const context = { priority: 'high' };

    await estimator.estimateComplexity(task, prompt, context);

    expect(events).toHaveLength(2);
    expect(events[0].event).toBe('complexity:estimation_requested');
    expect(events[0].payload).toMatchObject({
      task,
      prompt,
      context,
      timestamp: expect.any(Number)
    });

    expect(events[1].event).toBe('complexity:estimation_completed');
    expect(events[1].payload).toMatchObject({
      task,
      estimate: expect.objectContaining({
        estimatedComplexity: expect.any(Number),
        confidence: expect.any(Number),
        reasoning: expect.any(Array),
        estimatedDuration: expect.any(Number),
        difficultyLevel: expect.any(String),
        keyFactors: expect.any(Array),
        timestamp: expect.any(Number)
      }),
      timestamp: expect.any(Number)
    });
  });

  it('should emit learning_completed event', async () => {
    const task = 'learning-task';
    const prompt = 'Simple task';
    const context = {};
    const actualComplexity = 0.7;
    const actualDuration = 5000;
    const actualSuccess = true;

    await estimator.learnFromOutcome(
      task,
      prompt,
      context,
      actualComplexity,
      actualDuration,
      actualSuccess
    );

    const learningEvents = events.filter(e => e.event === 'complexity:learning_completed');
    expect(learningEvents).toHaveLength(1);
    expect(learningEvents[0].payload).toMatchObject({
      task,
      actualComplexity,
      actualDuration,
      actualSuccess,
      timestamp: expect.any(Number)
    });
  });

  it('should emit stats_updated event when getting stats', () => {
    estimator.getComplexityStats();

    const statsEvents = events.filter(e => e.event === 'complexity:stats_updated');
    expect(statsEvents).toHaveLength(1);
    expect(statsEvents[0].payload).toMatchObject({
      stats: expect.objectContaining({
        totalEstimations: expect.any(Number),
        averageComplexity: expect.any(Number),
        accuracyRate: expect.any(Number),
        patternCount: expect.any(Number),
        topComplexityFactors: expect.any(Array)
      }),
      timestamp: expect.any(Number)
    });
  });

  it('should not have suggestOptimizationMethod or return complexity estimates directly', () => {
    // Verify the method doesn't exist anymore
    expect((estimator as any).suggestOptimizationMethod).toBeUndefined();

    // Verify estimateComplexity returns void (Promise<void>)
    const result = estimator.estimateComplexity('test', 'test prompt', {});
    expect(result).toBeInstanceOf(Promise);
  });

  it('should extend EventBus and have event capabilities', () => {
    expect(estimator.emit).toBeDefined();
    expect(estimator.on).toBeDefined();
    expect(estimator.off).toBeDefined();
    expect(estimator.removeAllListeners).toBeDefined();
  });
});