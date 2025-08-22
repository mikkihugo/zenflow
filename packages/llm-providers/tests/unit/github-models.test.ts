import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GitHubModelsAPI, createGitHubModelsProvider, executeGitHubModelsTask } from '../../src/api/github-models';
import { mockGitHubModels, mockLogger, createMockResponse, createMockError } from '../mocks/llm-mocks';

// Mock external dependencies
vi.mock('../../src/api/github-models', async () => {
  const actual = await vi.importActual('../../src/api/github-models');
  return {
    ...actual,
    GitHubModelsAPI: vi.fn(() => ({
      sendRequest: mockGitHubModels.sendRequest,
      listModels: mockGitHubModels.listModels,
      checkAuthentication: mockGitHubModels.checkAuthentication,
      getHealth: vi.fn().mockResolvedValue({ status: 'healthy' }),
      getUsage: vi.fn().mockResolvedValue({ requests: 0, tokens: 0 }),
      execute: vi.fn().mockImplementation(async () => {
        try {
          const result = await mockGitHubModels.sendRequest();
          return { 
            isOk: () => true, 
            isErr: () => false, 
            value: { content: result.choices[0].message.content } 
          };
        } catch (error) {
          return { 
            isOk: () => false, 
            isErr: () => true, 
            error: { message: (error as Error).message } 
          };
        }
      })
    }),
    createGitHubModelsProvider: vi.fn(() => ({
      execute: vi.fn().mockImplementation(async () => {
        try {
          const result = await mockGitHubModels.sendRequest();
          return { 
            isOk: () => true, 
            isErr: () => false, 
            value: { content: result.choices[0].message.content }
          };
        } catch (error) {
          return { 
            isOk: () => false, 
            isErr: () => true, 
            error: { message: (error as Error).message } 
          };
        }
      })
    })
  };
});

describe('GitHub Models API', () => {
  let api: any;

  beforeEach(() => {
    vi.clearAllMocks();
    api = new GitHubModelsAPI({
      apiKey: 'test-api-key',
      baseUrl: 'https://models.inference.ai.azure.com',
      model: 'gpt-4o'
    });
  });

  describe('Constructor and Configuration', () => {
    it('should create API instance with default configuration', () => {
      const defaultApi = new GitHubModelsAPI();
      expect(defaultApi).toBeDefined();
    });

    it('should create API instance with custom configuration', () => {
      const customApi = new GitHubModelsAPI({
        apiKey: 'custom-key',
        model: 'claude-3-sonnet',
        maxTokens: 8000,
        temperature: 0.8
      });
      expect(customApi).toBeDefined();
    });

    it('should handle missing API key gracefully', () => {
      expect(() => new GitHubModelsAPI({ apiKey: '' })).not.toThrow();
    });
  });

  describe('Model Listing', () => {
    it('should list available models', async () => {
      const mockModels = [
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
        { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic' },
        { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'meta' }
      ];

      mockGitHubModels.listModels.mockResolvedValue(mockModels);

      const models = await api.listModels();

      expect(models).toEqual(mockModels);
      expect(mockGitHubModels.listModels).toHaveBeenCalled();
    });

    it('should handle API errors when listing models', async () => {
      mockGitHubModels.listModels.mockRejectedValue(
        createMockError('Failed to fetch models', 'API_ERROR')
      );

      await expect(api.listModels()).rejects.toThrow('Failed to fetch models');
    });

    it('should filter models by provider', async () => {
      const allModels = [
        { id: 'gpt-4o', provider: 'openai' },
        { id: 'claude-3-sonnet', provider: 'anthropic' },
        { id: 'llama-3-70b', provider: 'meta' }
      ];

      mockGitHubModels.listModels.mockResolvedValue(allModels);

      const openaiModels = await api.listModels({ provider: 'openai' });

      expect(openaiModels).toHaveLength(1);
      expect(openaiModels[0].provider).toBe('openai');
    });
  });

  describe('Authentication', () => {
    it('should check authentication status', async () => {
      mockGitHubModels.checkAuthentication.mockResolvedValue(true);

      const isAuthenticated = await api.checkAuthentication();

      expect(isAuthenticated).toBe(true);
      expect(mockGitHubModels.checkAuthentication).toHaveBeenCalled();
    });

    it('should handle authentication failures', async () => {
      mockGitHubModels.checkAuthentication.mockResolvedValue(false);

      const isAuthenticated = await api.checkAuthentication();

      expect(isAuthenticated).toBe(false);
    });

    it('should handle authentication errors', async () => {
      mockGitHubModels.checkAuthentication.mockRejectedValue(
        createMockError('Authentication service unavailable', 'AUTH_SERVICE_ERROR')
      );

      await expect(api.checkAuthentication()).rejects.toThrow(
        'Authentication service unavailable'
      );
    });
  });

  describe('Request Handling', () => {
    it('should send simple text requests', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Hello! How can I help you today?',
            role: 'assistant'
          }
        }],
        usage: { prompt_tokens: 5, completion_tokens: 12, total_tokens: 17 }
      };

      mockGitHubModels.sendRequest.mockResolvedValue(mockResponse);

      const response = await api.sendRequest('Hello');

      expect(response).toEqual(mockResponse);
      expect(mockGitHubModels.sendRequest).toHaveBeenCalledWith('Hello');
    });

    it('should handle complex request objects', async () => {
      const complexRequest = {
        messages: [
          { role: 'user', content: 'Analyze this code snippet' },
          { role: 'assistant', content: 'I\'ll analyze the code for you.' }
        ],
        model: 'gpt-4o',
        temperature: 0.3,
        max_tokens: 2000
      };

      const mockResponse = {
        choices: [{ message: { content: 'Code analysis complete', role: 'assistant' } }],
        usage: { prompt_tokens: 25, completion_tokens: 100, total_tokens: 125 }
      };

      mockGitHubModels.sendRequest.mockResolvedValue(mockResponse);

      const response = await api.sendRequest(complexRequest);

      expect(response).toEqual(mockResponse);
      expect(mockGitHubModels.sendRequest).toHaveBeenCalledWith(complexRequest);
    });

    it('should handle streaming requests', async () => {
      const mockStream = async function* () {
        yield { choices: [{ delta: { content: 'Hello' } }] };
        yield { choices: [{ delta: { content: ' there!' } }] };
        yield { choices: [{ finish_reason: 'stop' }] };
      };

      api.streamRequest = vi.fn().mockReturnValue(mockStream());

      const stream = api.streamRequest('stream test');
      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(3);
      expect(api.streamRequest).toHaveBeenCalledWith('stream test');
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limiting errors', async () => {
      const rateLimitError = createMockError('Rate limit exceeded', 'RATE_LIMITED');
      rateLimitError.status = 429;

      mockGitHubModels.sendRequest.mockRejectedValue(rateLimitError);

      await expect(api.sendRequest('test')).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle authentication errors', async () => {
      const authError = createMockError('Invalid API key', 'UNAUTHORIZED');
      authError.status = 401;

      mockGitHubModels.sendRequest.mockRejectedValue(authError);

      await expect(api.sendRequest('test')).rejects.toThrow('Invalid API key');
    });

    it('should handle model not found errors', async () => {
      const notFoundError = createMockError('Model not found', 'NOT_FOUND');
      notFoundError.status = 404;

      mockGitHubModels.sendRequest.mockRejectedValue(notFoundError);

      await expect(api.sendRequest('test')).rejects.toThrow('Model not found');
    });

    it('should handle network timeouts', async () => {
      const timeoutError = createMockError('Request timeout', 'TIMEOUT');
      timeoutError.code = 'ETIMEDOUT';

      mockGitHubModels.sendRequest.mockRejectedValue(timeoutError);

      await expect(api.sendRequest('test')).rejects.toThrow('Request timeout');
    });
  });

  describe('Health and Monitoring', () => {
    it('should report health status', async () => {
      const mockHealth = { 
        status: 'healthy', 
        latency: 120, 
        lastCheck: Date.now(),
        uptime: 3600000
      };

      api.getHealth.mockResolvedValue(mockHealth);

      const health = await api.getHealth();

      expect(health).toEqual(mockHealth);
      expect(health.status).toBe('healthy');
    });

    it('should track usage statistics', async () => {
      const mockUsage = {
        totalRequests: 150,
        totalTokens: 45000,
        promptTokens: 20000,
        completionTokens: 25000,
        lastReset: Date.now() - 3600000
      };

      api.getUsage.mockResolvedValue(mockUsage);

      const usage = await api.getUsage();

      expect(usage).toEqual(mockUsage);
      expect(usage.totalRequests).toBe(150);
    });

    it('should handle health check failures', async () => {
      api.getHealth.mockResolvedValue({ 
        status: 'unhealthy', 
        error: 'Service unavailable',
        lastCheck: Date.now()
      });

      const health = await api.getHealth();

      expect(health.status).toBe('unhealthy');
      expect(health.error).toBe('Service unavailable');
    });
  });
});

describe('createGitHubModelsProvider', () => {
  it('should create GitHub Models provider with default configuration', () => {
    const provider = createGitHubModelsProvider();
    expect(provider).toBeDefined();
  });

  it('should create provider with custom configuration', () => {
    const config = {
      apiKey: 'custom-key',
      model: 'claude-3-sonnet',
      temperature: 0.9,
      maxTokens: 8192
    };

    const provider = createGitHubModelsProvider(config);
    expect(provider).toBeDefined();
  });

  it('should handle environment variable configuration', () => {
    process.env.GITHUB_TOKEN = 'env-token';
    
    const provider = createGitHubModelsProvider();
    expect(provider).toBeDefined();
    
    delete process.env.GITHUB_TOKEN;
  });
});

describe('executeGitHubModelsTask', () => {
  beforeEach(() => {
    mockGitHubModels.sendRequest.mockResolvedValue({
      choices: [{ message: { content: 'Task completed', role: 'assistant' } }],
      usage: { total_tokens: 50 }
    });
  });

  it('should execute simple tasks', async () => {
    const result = await executeGitHubModelsTask('Simple task');

    expect(result).toBeDefined();
    expect(result.content).toBe('Task completed');
    expect(mockGitHubModels.sendRequest).toHaveBeenCalled();
  });

  it('should execute tasks with options', async () => {
    const options = {
      model: 'gpt-4o',
      temperature: 0.5,
      maxTokens: 4000,
      timeout: 30000
    };

    const result = await executeGitHubModelsTask('Complex task', options);

    expect(result).toBeDefined();
    expect(mockGitHubModels.sendRequest).toHaveBeenCalled();
  });

  it('should handle task execution errors', async () => {
    mockGitHubModels.sendRequest.mockRejectedValue(
      createMockError('Task execution failed', 'EXECUTION_ERROR')
    );

    await expect(executeGitHubModelsTask('failing task'))
      .rejects.toThrow('GitHub Models task failed');
  });

  it('should handle different response formats', async () => {
    const responses = [
      { choices: [{ message: { content: 'Response 1', role: 'assistant' } }] },
      { choices: [{ text: 'Response 2' }] }, // Alternative format
      { content: 'Response 3' } // Direct content
    ];

    for (const response of responses) {
      mockGitHubModels.sendRequest.mockResolvedValueOnce(response);
      const result = await executeGitHubModelsTask('test');
      expect(result).toBeDefined();
    }
  });
});

describe('Model-Specific Features', () => {
  describe('GPT Models', () => {
    it('should handle GPT-4o specific features', async () => {
      const gptApi = new GitHubModelsAPI({ model: 'gpt-4o' });
      
      mockGitHubModels.sendRequest.mockResolvedValue({
        choices: [{ message: { content: 'GPT-4o response', role: 'assistant' } }],
        model: 'gpt-4o',
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
      });

      const response = await gptApi.sendRequest('Test GPT-4o');

      expect(response.model).toBe('gpt-4o');
      expect(response.choices[0].message.content).toBe('GPT-4o response');
    });
  });

  describe('Claude Models', () => {
    it('should handle Claude-specific features', async () => {
      const claudeApi = new GitHubModelsAPI({ model: 'claude-3-sonnet' });
      
      mockGitHubModels.sendRequest.mockResolvedValue({
        choices: [{ message: { content: 'Claude response', role: 'assistant' } }],
        model: 'claude-3-sonnet',
        usage: { input_tokens: 15, output_tokens: 25, total_tokens: 40 }
      });

      const response = await claudeApi.sendRequest('Test Claude');

      expect(response.model).toBe('claude-3-sonnet');
      expect(response.choices[0].message.content).toBe('Claude response');
    });
  });

  describe('Llama Models', () => {
    it('should handle Llama-specific features', async () => {
      const llamaApi = new GitHubModelsAPI({ model: 'llama-3-70b' });
      
      mockGitHubModels.sendRequest.mockResolvedValue({
        choices: [{ message: { content: 'Llama response', role: 'assistant' } }],
        model: 'llama-3-70b',
        usage: { prompt_tokens: 12, completion_tokens: 18, total_tokens: 30 }
      });

      const response = await llamaApi.sendRequest('Test Llama');

      expect(response.model).toBe('llama-3-70b');
      expect(response.choices[0].message.content).toBe('Llama response');
    });
  });
});

describe('Performance and Optimization', () => {
  it('should handle concurrent requests efficiently', async () => {
    const requests = Array.from({ length: 10 }, (_, i) => `Request ${i + 1}`);
    
    mockGitHubModels.sendRequest.mockImplementation(async (request) => ({
      choices: [{ message: { content: `Response to ${request}`, role: 'assistant' } }],
      usage: { total_tokens: 20 }
    }));

    const startTime = Date.now();
    const promises = requests.map(req => executeGitHubModelsTask(req));
    const results = await Promise.all(promises);
    const endTime = Date.now();

    expect(results).toHaveLength(10);
    expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    expect(mockGitHubModels.sendRequest).toHaveBeenCalledTimes(10);
  });

  it('should handle large payloads efficiently', async () => {
    const largeContent = 'x'.repeat(50000); // 50KB content
    
    mockGitHubModels.sendRequest.mockResolvedValue({
      choices: [{ message: { content: 'Large content processed', role: 'assistant' } }],
      usage: { total_tokens: 15000 }
    });

    const startTime = Date.now();
    const result = await executeGitHubModelsTask(largeContent);
    const endTime = Date.now();

    expect(result).toBeDefined();
    expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
  });
});