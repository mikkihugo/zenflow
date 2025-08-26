export declare const mockLogger: {
  info: import('vitest').Mock<(...args: any[]) => any>;'
  warn: import('vitest').Mock<(...args: any[]) => any>;'
  error: import('vitest').Mock<(...args: any[]) => any>;'
  debug: import('vitest').Mock<(...args: any[]) => any>;'
  trace: import('vitest').Mock<(...args: any[]) => any>;'
  log: import('vitest').Mock<(...args: any[]) => any>;'
};
export declare const mockConfig: {
  get: import('vitest').Mock<(...args: any[]) => any>;'
  set: import('vitest').Mock<(...args: any[]) => any>;'
  has: import('vitest').Mock<(...args: any[]) => any>;'
  toObject: import('vitest').Mock<() => {}>;'
};
export declare const mockDIContainer: {
  register: import('vitest').Mock<(...args: any[]) => any>;'
  resolve: import('vitest').Mock<(...args: any[]) => any>;'
  has: import('vitest').Mock<(...args: any[]) => any>;'
  clear: import('vitest').Mock<(...args: any[]) => any>;'
  bind: import('vitest').Mock<(...args: any[]) => any>;'
  unbind: import('vitest').Mock<(...args: any[]) => any>;'
  get: import('vitest').Mock<(...args: any[]) => any>;'
};
export declare const mockEventBus: {
  emit: import('vitest').Mock<(...args: any[]) => any>;'
  on: import('vitest').Mock<(...args: any[]) => any>;'
  off: import('vitest').Mock<(...args: any[]) => any>;'
  publish: import('vitest').Mock<(...args: any[]) => any>;'
  subscribe: import('vitest').Mock<(...args: any[]) => any>;'
  unsubscribe: import('vitest').Mock<(...args: any[]) => any>;'
  removeAllListeners: import('vitest').Mock<(...args: any[]) => any>;'
};
export declare const createMockMemoryConfig: () => {
  type: 'memory;
  maxSize: number;
  ttl: number;
  compression: boolean;
  path: string;
};
export declare const createMockMemoryBackend: () => {
  store: import('vitest').Mock<(...args: any[]) => any>;'
  retrieve: import('vitest').Mock<(...args: any[]) => any>;'
  delete: import('vitest').Mock<(...args: any[]) => any>;'
  clear: import('vitest').Mock<(...args: any[]) => any>;'
  size: import('vitest').Mock<(...args: any[]) => any>;'
  health: import('vitest').Mock<(...args: any[]) => any>;'
  init: import('vitest').Mock<(...args: any[]) => any>;'
  destroy: import('vitest').Mock<(...args: any[]) => any>;'
};
export declare const createMockResult: {
  ok: (value: any) => {
    isOk: () => boolean;
    isErr: () => boolean;
    _unsafeUnwrap: () => any;
  };
  err: (error: any) => {
    isOk: () => boolean;
    isErr: () => boolean;
    _unsafeUnwrapErr: () => any;
  };
};
//# sourceMappingURL=foundation-mocks.d.ts.map
