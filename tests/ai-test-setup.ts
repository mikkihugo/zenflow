/**
 * @fileoverview AI-Specific Test Setup for Claude Code Zen
 * 
 * Advanced AI testing utilities and setup specifically designed for testing
 * AI agent coordination, swarm intelligence, and neural network operations.
 * 
 * Features:
 * - AI agent coordination test utilities
 * - Neural network testing patterns
 * - Swarm intelligence test helpers
 * - LLM provider mocking with realistic responses
 * - AI workflow assertion helpers
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.44
 * @version 2.0.0
 */

import { vi } from 'vitest';

// Define types for better type safety
interface TaskInput {
  name?:string;
  type?:string;
  parameters?:Record<string, unknown>;
}

interface AgentPerformance {
  success:number;
  speed:number;
}

interface MockAgentConfig {
  id?:string;
  type?:'worker' | ' coordinator' | ' specialist';
  capabilities?:string[];
  performance?:AgentPerformance;
  forceSuccess?:boolean;
}

// Use the interface to prevent unused type error
const _unusedAgentConfig: MockAgentConfig = { id: 'example' };

// Constants
const DEFAULT_AGENT_ID = 'mock-agent';

// AI-specific test utilities
(globalThis as Record<string, unknown>)['aiAdvancedUtils'] = {
  /**
   * Create a mock AI agent with realistic coordination patterns
   */
  createMockAgent:(config: {
    id?:string;
    type?: 'worker|coordinator|specialist';
    capabilities?:string[];
    performance?:{ success: number; speed: number};
    forceSuccess?:boolean;
} = {}) => ({
    id: config.id || `agent-${Math.random().toString(36).substr(2, 9)}`,
    type: config.type || 'worker',
    capabilities: config.capabilities || ['read', 'write', 'analyze'],
    performance: config.performance || { success: 0.85, speed: 0.75 },
    
    execute:vi.fn().mockImplementation(async (task: TaskInput | string) => {
      // Simulate realistic AI execution time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
      
      // Make tests deterministic when forceSuccess is true
      const success = config.forceSuccess !== false ? 
        (config.forceSuccess||Math.random() < (config.performance?.success||0.95)) :
        Math.random() < (config.performance?.success||0.95);
      return {
        agent:config.id || DEFAULT_AGENT_ID,
        task,
        success,
        result: success ? `Completed: ${typeof task === 'string' ? task : (task.name || 'task')}` : `Failed: ${typeof task === 'string' ? task : (task.name || 'task')}`,
        duration: Math.random() * 1000 + 200,
        confidence: success ? 0.8 + Math.random() * 0.2 : 0.3 + Math.random() * 0.4,
};
}),
    
    coordinate: vi.fn().mockImplementation(async (otherAgents: unknown[]) => ({
      coordinator: config.id || DEFAULT_AGENT_ID,
      coordinated: otherAgents.length,
      strategy: 'balanced',
      success: Math.random() < 0.9,
    })),
    
    learn: vi.fn().mockImplementation(async (feedback: unknown) => ({
      agent: config.id || DEFAULT_AGENT_ID,
      feedback,
      improvement: Math.random() * 0.1 + 0.05, // 5-15% improvement
      newPerformance: {
        success: Math.min(0.95, (config.performance?.success || 0.85) + Math.random() * 0.1),
        speed: Math.min(0.95, (config.performance?.speed || 0.75) + Math.random() * 0.1),
      },
    })),
}),

  /**
   * Create a mock swarm with realistic coordination patterns
   */
  createMockSwarm: (config: {
    size?: number;
    topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
    performance?: { coordination: number; efficiency: number };
  } = {}) => {
    const agents = Array.from({ length: config.size || 5 }, (_, i) => 
      ((globalThis as Record<string, unknown>)['aiAdvancedUtils'] as {
        createMockAgent: (config: { id: string; type: string }) => unknown;
      }).createMockAgent({
        id: `swarm-agent-${i}`,
        type: i === 0 ? 'coordinator' : 'worker',
      })
    );

    return {
      id: `swarm-${Math.random().toString(36).substr(2, 9)}`,
      topology: config.topology || 'hierarchical',
      agents,
      size: agents.length,
      performance: config.performance || { coordination: 0.8, efficiency: 0.75 },

      executeTask:vi.fn().mockImplementation(async (task: TaskInput | string) => {
        // Simulate swarm coordination delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));

        const results = await Promise.all(
          (agents as Array<{ execute: (task: unknown) => Promise<{ success: boolean; duration: number }> }>)
            .slice(0, Math.ceil(agents.length * 0.8))
            .map(agent => agent.execute(task))
        ) as Array<{ success: boolean; duration: number }>;

        const successCount = results.filter(r => r.success).length;
        const overallSuccess = successCount / results.length >= 0.6;

        return {
          swarm: config.topology || 'hierarchical',
          task,
          results,
          success: overallSuccess,
          coordination: config.performance?.coordination || 0.8,
          efficiency: successCount / results.length,
          duration: Math.max(...results.map(r => r.duration)),
};
}),

      scale:vi.fn().mockImplementation(async (newSize: number) => {
        const currentSize = agents.length;
        if (newSize > currentSize) {
          // Add agents
          for (let i = currentSize; i < newSize; i++) {
            agents.push(((globalThis as Record<string, unknown>)['aiAdvancedUtils'] as {
              createMockAgent: (config: { id: string; type: string }) => unknown;
            }).createMockAgent({
              id: `swarm-agent-${i}`,
              type: 'worker',
            }));
}
} else if (newSize < currentSize) {
          // Remove agents (keep coordinator)
          agents.splice(newSize);
}

        return {
          previousSize: currentSize,
          newSize: agents.length,
          success: true,
};
}),
};
},

  /**
   * Create a mock neural network for testing
   */
  createMockNeuralNetwork: (config: {
    layers?: number;
    nodes?: number[];
    accuracy?: number;
    trainingData?: unknown[];
  } = {}) => ({
    id: `neural-${Math.random().toString(36).substr(2, 9)}`,
    layers: config.layers || 3,
    nodes: config.nodes || [10, 5, 2],
    accuracy: config.accuracy || 0.85,
    trained: false,

    train: vi.fn().mockImplementation(async (data: unknown[]) => {
      // Simulate training time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));

      const accuracy = Math.min(0.98, (config.accuracy || 0.85) + Math.random() * 0.15);
      
      return {
        network: 'mock-neural',
        trainingData: data.length,
        epochs: Math.floor(Math.random() * 100) + 50,
        accuracy,
        loss: (1 - accuracy) * Math.random(),
        duration: Math.random() * 5000 + 2000,
        success: accuracy > 0.7,
};
}),

    predict: vi.fn().mockImplementation(async (input: unknown) => {
      // Simulate prediction time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));

      const confidence = (config.accuracy || 0.85) + (Math.random() - 0.5) * 0.2;
      
      return {
        input,
        prediction: `prediction-${Math.random().toString(36).substr(2, 5)}`,
        confidence: Math.max(0.1, Math.min(0.99, confidence)),
        reasoning: ['feature_1: 0.8', 'feature_2: 0.3', 'feature_3: 0.95'],
        duration: Math.random() * 100 + 20,
};
}),

    evaluate: vi.fn().mockImplementation(async (testData: unknown[]) => ({
      network: 'mock-neural',
      testSamples: testData.length,
      accuracy: (config.accuracy || 0.85) + (Math.random() - 0.5) * 0.1,
      precision: 0.82 + Math.random() * 0.15,
      recall: 0.78 + Math.random() * 0.18,
      f1Score: 0.80 + Math.random() * 0.12,
    })),
}),

  /**
   * Create a mock LLM with realistic response patterns
   */
  createMockLLM: (config: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responses?: Array<{ pattern: RegExp; response: string; confidence: number }>;
  } = {}) => {
    const defaultResponses = [
      { pattern: /^analyze/i, response: 'Analysis complete. Found 3 key insights.', confidence: 0.9 },
      { pattern: /^write/i, response: 'Content generated successfully.', confidence: 0.85 },
      { pattern: /^debug/i, response: 'Issue identified in line 42. Suggested fix: update variable type.', confidence: 0.8 },
      { pattern: /^refactor/i, response: 'Refactoring plan created. 5 files need updates.', confidence: 0.75 },
    ];

    const responses = config.responses || defaultResponses;

    return {
      model:config.model||'mock-llm-v1',      temperature:config.temperature||0.7,
      maxTokens:config.maxTokens||4000,

      generateText:vi.fn().mockImplementation(async (prompt: string) => {
        // Simulate LLM response time
        const responseTime = Math.random() * 2000 + 500;
        await new Promise(resolve => setTimeout(resolve, responseTime));

        // Find matching response pattern
        const matchedResponse = responses.find(r => r.pattern.test(prompt));
        const response = matchedResponse||responses[Math.floor(Math.random() * responses.length)]!;

        return {
          text:response.response,
          confidence:response.confidence + (Math.random() - 0.5) * 0.1,
          usage:{
            inputTokens:Math.floor(prompt.length / 4),
            outputTokens:Math.floor(response.response.length / 4),
            totalTokens:Math.floor((prompt.length + response.response.length) / 4),
},
          metadata:{
            model:config.model||'mock-llm-v1',            temperature:config.temperature||0.7,
            responseTime,
            reasoning:['Analyzed prompt context',    'Applied domain knowledge',    'Generated structured response'],
},
};
}),

      generateStream: vi.fn().mockImplementation(async function*(prompt: string) {
        const matchedResponse = responses.find(r => r.pattern.test(prompt));
        const response = matchedResponse || responses[Math.floor(Math.random() * responses.length)]!;

        // Stream response word by word
        const words = response.response.split(' ');
        for (const word of words) {
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
          yield {
            text: `${word} `,
            confidence: response.confidence,
            isComplete: false,
          };
        }

        yield {
          text: '',
          confidence: response.confidence,
          isComplete: true,
          usage: {
            inputTokens: Math.floor(prompt.length / 4),
            outputTokens: Math.floor(response.response.length / 4),
          },
        };
      }),
};
},

  /**
   * Advanced AI workflow testing patterns
   */
  testAIWorkflow:async (workflow: {
    steps:Array<{ name: string; execute: () => Promise<unknown>}>;
    expectedOutcome:unknown;
    timeout?:number;
}) => {
    const results = [];
    const startTime = Date.now();

    for (const step of workflow.steps) {
      const stepStart = Date.now();
      try {
        const result = await Promise.race([
          step.execute(),
          new Promise((_, reject) => {
            const timeoutId = setTimeout(() => reject(new Error(`Step timeout: ${step.name}`)), workflow.timeout || 30000);
            // Store timeout for cleanup
            (globalThis as Record<string, unknown>)['__testTimeouts'] = (globalThis as Record<string, unknown>)['__testTimeouts'] || [];
            ((globalThis as Record<string, unknown>)['__testTimeouts'] as unknown[]).push(timeoutId);
})
]);
        
        results.push({
          step: step.name,
          result,
          duration: Date.now() - stepStart,
          success: true,
        });
} catch (error) {
        results.push({
          step: step.name,
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - stepStart,
          success: false,
        });
        break; // Stop workflow on first failure
}
}

    return {
      workflow: 'ai-test-workflow',
      steps: results,
      overallSuccess: results.every(r => r.success),
      totalDuration: Date.now() - startTime,
      outcome: results[results.length - 1]?.result,
};
},
};

// AI-specific environment setup
process.env['AI_TESTING_MODE'] = 'advanced';
process.env.NEURAL_MOCK_MODE = 'true';
process.env.LLM_PROVIDER = 'mock';

// Cleanup function for test timeouts
(globalThis as Record<string, unknown>).cleanupTestTimeouts = () => {
  if ((globalThis as Record<string, unknown>)['__testTimeouts']) {
    ((globalThis as Record<string, unknown>)['__testTimeouts'] as unknown[]).forEach((timeoutId:unknown) => clearTimeout(timeoutId as NodeJS.Timeout));
    (globalThis as Record<string, unknown>)['__testTimeouts'] = [];
}
};

// Global AI test configuration
(globalThis as Record<string, unknown>).aiTestConfig = {
  llm: {
    provider: 'mock',
    timeout: 30000,
    retries: 3,
  },
  neural: {
    enabled: true,
    mockMode: true,
    timeout: 60000,
  },
  swarm: {
    defaultSize: 5,
    maxConcurrency: 10,
    coordinationTimeout: 15000,
  },
  agent: {
    defaultTimeout: 10000,
    maxRetries: 3,
    learningEnabled: true,
  },
};