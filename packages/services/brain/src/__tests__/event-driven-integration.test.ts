/**
 * @fileoverview Event-Driven Brain Integration Test
 * 
 * Tests that the pure event-driven brain system works correctly
 * with proper event emission and handling.
 */

import { EventBus } from '@claude-zen/foundation';
import { IntelligenceOrchestrator, BrainEvents } from '../brain-coordinator';
import { TaskAnalyzer, TaskAnalysisEvents } from '../autonomous-optimization-engine';
import { TaskComplexityEstimator, ComplexityEvents } from '../task-complexity-estimator';

describe('Event-Driven Brain Integration', () => {
  let brain: IntelligenceOrchestrator;
  let taskAnalyzer: TaskAnalyzer;
  let complexityEstimator: TaskComplexityEstimator;
  let eventBus: EventBus<BrainEvents>;

  beforeEach(async () => {
    // Create brain coordinator
    brain = new IntelligenceOrchestrator({
      sessionId: 'test-session',
      enableLearning: true,
    });

    // Create task analyzer  
    taskAnalyzer = new TaskAnalyzer();
    
    // Create complexity estimator
    complexityEstimator = new TaskComplexityEstimator();

    // Initialize all components
    await brain.initialize();
    await taskAnalyzer.initialize();
    await complexityEstimator.initialize();
  });

  afterEach(async () => {
    await brain.shutdown();
  });

  it('should emit brain:initialized event on initialization', async () => {
    const brain2 = new IntelligenceOrchestrator({ sessionId: 'test-2' });
    
    const initPromise = new Promise<boolean>((resolve) => {
      brain2.on('brain:initialized', () => {
        resolve(true);
      });
    });

    await brain2.initialize();
    const eventEmitted = await initPromise;
    
    expect(eventEmitted).toBe(true);
    await brain2.shutdown();
  });

  it('should emit brain:log events instead of direct logging', async () => {
    const logPromise = new Promise<{ level: string; message: string }>((resolve) => {
      brain.on('brain:log', (event) => {
        resolve({ level: event.level, message: event.message });
      });
    });

    // Trigger a log event by calling optimizePrompt
    brain.optimizePrompt({
      task: 'test task',
      basePrompt: 'test prompt',
      context: {},
    });

    const logEvent = await logPromise;
    expect(logEvent.level).toBe('debug');
    expect(logEvent.message).toContain('Optimizing prompt for task');
  });

  it('should handle task analysis events', async () => {
    const analysisPromise = new Promise<any>((resolve) => {
      taskAnalyzer.on('task:analysis_completed', (event) => {
        resolve(event.result);
      });
    });

    await taskAnalyzer.analyzeTask({
      taskId: 'test-123',
      task: 'Create a REST API endpoint',
      context: { technology: 'Node.js' },
    });

    const result = await analysisPromise;
    expect(result.taskId).toBe('test-123');
    expect(result.taskType).toMatch(/prompt|ml|coordination|computation/);
    expect(result.complexity).toBeGreaterThanOrEqual(0);
    expect(result.complexity).toBeLessThanOrEqual(1);
  });

  it('should handle complexity estimation events', async () => {
    const estimationPromise = new Promise<any>((resolve) => {
      complexityEstimator.on('complexity:estimation_completed', (event) => {
        resolve(event);
      });
    });

    await complexityEstimator.estimateComplexity(
      'design-task-001',
      'Design a microservices architecture',
      { scale: 'enterprise' }
    );

    const event = await estimationPromise;
    expect(event.taskId).toBe('design-task-001');
    expect(event.estimate).toBeDefined();
    expect(event.estimate.estimatedComplexity).toBeGreaterThanOrEqual(0);
    expect(event.estimate.estimatedComplexity).toBeLessThanOrEqual(1);
  });

  it('should emit brain:task_analyzed when task is submitted', async () => {
    const taskAnalysisPromise = new Promise<any>((resolve) => {
      brain.on('brain:task_analyzed', (event) => {
        resolve(event);
      });
    });

    // Submit a task through the brain
    brain.emit('brain:task_submitted', {
      taskId: 'brain-test-001',
      task: 'Generate unit tests for a React component',
      context: { framework: 'React', testing: 'Jest' },
      timestamp: Date.now(),
    });

    const analysisEvent = await taskAnalysisPromise;
    expect(analysisEvent.taskId).toBe('brain-test-001');
    expect(analysisEvent.taskType).toMatch(/prompt|ml|coordination|computation/);
  });

  it('should emit error events on failures', async () => {
    const errorPromise = new Promise<any>((resolve) => {
      brain.on('brain:error', (event) => {
        resolve(event);
      });
    });

    // Try to emit a malformed event that should trigger error handling
    try {
      brain.emit('invalid:event' as any, { invalid: 'data' });
    } catch (error) {
      // Expected to potentially fail
    }

    // Test error handling in task analysis
    const taskErrorPromise = new Promise<any>((resolve) => {
      taskAnalyzer.on('task:analysis_error', (event) => {
        resolve(event);
      });
    });

    // Submit invalid task data
    await taskAnalyzer.analyzeTask({
      taskId: '',
      task: '',
    } as any);

    const errorEvent = await taskErrorPromise;
    expect(errorEvent.error).toBeDefined();
  });
});