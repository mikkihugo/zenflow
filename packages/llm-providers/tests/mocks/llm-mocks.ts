import { vi } from 'vitest';

// Mock logger for LLM providers
export const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
  log: vi.fn(),
};

// Mock Claude Code SDK
export const mockClaudeSDK = {
  sendMessage: vi.fn().mockResolvedValue({
    id: 'msg-123',
    content: 'Mock Claude response',
    role: 'assistant',
    timestamp: Date.now(),
  }),
  createSession: vi.fn().mockResolvedValue('session-123'),
  closeSession: vi.fn().mockResolvedValue(undefined),
  streamMessage: vi.fn().mockImplementation(async function* () {
    yield { type: 'content', content: 'Mock' };
    yield { type: 'content', content: ' streaming' };
    yield { type: 'content', content: ' response' };
  }),
  getTools: vi.fn().mockResolvedValue(['read', 'write', 'bash']),
  checkPermissions: vi
    .fn()
    .mockResolvedValue({ allowed: true, reason: 'test' }),
};

// Mock LLM Provider base class
export const createMockLLMProvider = (providerId: string = 'claude-code') => ({
  id: providerId,
  name: `Mock ${providerId}`,
  type: providerId.includes('api') ? 'api' : 'cli',
  available: true,
  sendMessage: vi.fn().mockResolvedValue({
    content: `Mock response from ${providerId}`,
    role: 'assistant',
    metadata: { provider: providerId },
  }),
  executeTask: vi.fn().mockResolvedValue({
    success: true,
    result: 'Task completed successfully',
    provider: providerId,
  }),
  getCapabilities: vi.fn().mockResolvedValue({
    fileOperations: providerId === 'claude-code',
    codeCompletion: providerId.includes('copilot'),
    chat: true,
    streaming: true,
  }),
  isAvailable: vi.fn().mockResolvedValue(true),
  health: vi.fn().mockResolvedValue({ status: 'healthy', latency: 100 }),
});

// Mock GitHub Models API
export const mockGitHubModels = {
  sendRequest: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: 'Mock GitHub Models response',
          role: 'assistant',
        },
      },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 15, total_tokens: 25 },
  }),
  listModels: vi.fn().mockImplementation((options?: { provider?: string }) => {
    const allModels = [
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic' },
      { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'meta' },
    ];

    if (options?.provider) {
      return Promise.resolve(
        allModels.filter((model) => model.provider === options.provider)
      );
    }

    return Promise.resolve(allModels);
  }),
  checkAuthentication: vi.fn().mockResolvedValue(true),
};

// Mock task manager
export const mockTaskManager = {
  executeTask: vi.fn().mockResolvedValue('task-123'),
  getTaskStatus: vi.fn().mockResolvedValue('completed'),
  cancelTask: vi.fn().mockResolvedValue(true),
  clearCompletedTasks: vi.fn(),
  clearPermissionDenials: vi.fn(),
  getCompletedTaskCount: vi.fn().mockReturnValue(0),
  addPermissionDenial: vi.fn(),
  getPermissionDenials: vi.fn().mockReturnValue([]),
  getTasks: vi.fn().mockResolvedValue([]),
  getStats: vi.fn().mockResolvedValue({
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    averageDuration: 0,
  }),
};

// Mock message processor
export const mockMessageProcessor = {
  processMessage: vi.fn().mockImplementation((message: any) => {
    if (!message) return { processed: true, timestamp: Date.now() };
    return {
      ...message,
      processed: true,
      timestamp: Date.now(),
    };
  }),
  filterMessagesForProvider: vi.fn().mockImplementation((messages: any[]) => {
    if (!Array.isArray(messages)) return [];
    return messages.filter((msg) => msg && msg.role && msg.content);
  }),
  validateMessage: vi.fn().mockImplementation((message: any) => {
    if (!message'' | '''' | ''!message.role'' | '''' | ''!message.content) {
      return { valid: false, reason:'Missing required fields'};
    }
    return { valid: true };
  }),
  sanitizeMessage: vi.fn().mockImplementation((message: any) => {
    if (!message) return message;
    return {
      ...message,
      content: message.content'' | '''' | '''',
      sanitized: true,
    };
  }),
};

// Mock permission handler
export const mockPermissionHandler = {
  checkPermission: vi
    .fn()
    .mockResolvedValue({ allowed: true, reason: 'test permission' }),
  requestPermission: vi.fn().mockResolvedValue(true),
  hasPermission: vi.fn().mockReturnValue(true),
  revokePermission: vi.fn().mockResolvedValue(true),
  listPermissions: vi.fn().mockResolvedValue([
    { tool: 'read', allowed: true },
    { tool: 'write', allowed: true },
    { tool: 'bash', allowed: false },
  ]),
};

// Mock provider registry
export const mockProviderRegistry = {
  register: vi.fn(),
  unregister: vi.fn(),
  get: vi.fn().mockImplementation((id: string) => createMockLLMProvider(id)),
  list: vi.fn().mockReturnValue([
    {
      id: 'claude-code',
      name: 'Claude Code CLI',
      type: 'cli',
      available: true,
    },
    {
      id: 'github-models-api',
      name: 'GitHub Models API',
      type: 'api',
      available: true,
    },
  ]),
  has: vi.fn().mockReturnValue(true),
  clear: vi.fn(),
};

// Factory function for creating mock providers with specific behavior
export const createMockProvider = (overrides: Partial<any> = {}) => ({
  ...createMockLLMProvider(),
  ...overrides,
});

// Helper for creating mock responses
export const createMockResponse = (
  content: string = 'Mock response',
  metadata: any = {}
) => ({
  content,
  role: 'assistant' as const,
  timestamp: Date.now(),
  metadata: {
    provider: 'mock',
    ...metadata,
  },
});

// Helper for creating mock errors
export const createMockError = (
  message: string = 'Mock error',
  code?: string
) => {
  const error = new Error(message);
  if (code) {
    (error as any).code = code;
  }
  return error;
};
