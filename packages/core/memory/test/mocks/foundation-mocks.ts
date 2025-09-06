import { vi } from 'vitest';

export const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
  log: vi.fn(),
};

export const mockConfig = {
  get: vi.fn(),
  set: vi.fn(),
  has: vi.fn(),
  toObject: vi.fn(() => ({})),
};

export const mockContainer = {
  register: vi.fn(),
  resolve: vi.fn(),
  has: vi.fn(),
  clear: vi.fn(),
  bind: vi.fn(),
  unbind: vi.fn(),
  get: vi.fn(),
};

export const mockEventBus = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  publish: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  removeAllListeners: vi.fn(),
};

export const createMockMemoryConfig = () => ({
  type: 'memory' as const,
  maxSize: 1000,
  ttl: 300000,
  compression: false,
  path: ':memory:',
});

export const createMockMemoryBackend = () => ({
  store: vi.fn().mockResolvedValue(),
  retrieve: vi.fn().mockResolvedValue(null),
  delete: vi.fn().mockResolvedValue(true),
  clear: vi.fn().mockResolvedValue(),
  size: vi.fn().mockResolvedValue(0),
  health: vi.fn().mockResolvedValue(true),
  init: vi.fn().mockResolvedValue(),
  destroy: vi.fn().mockResolvedValue(),
});

export const createMockResult = {
  ok: (value: any) => ({
    isOk: () => true,
    isErr: () => false,
    unsafeUnwrap: () => value,
  }),
  err: (error: any) => ({
    isOk: () => false,
    isErr: () => true,
    unsafeUnwrapErr: () => error,
  }),
};
