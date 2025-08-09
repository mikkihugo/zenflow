/**
 * Common TDD London Mock Classes
 * 
 * Ready-to-use mock classes following TDD London pattern for the most
 * common services found in the codebase. Based on analysis of 48 test files
 * with 225+ mock patterns that need conversion.
 */

import { jest } from '@jest/globals';

// ============================================================================
// Most Common Mock Patterns (from scanner results)
// ============================================================================

/**
 * MockCoordinationService - Found 15+ times across files
 * Replaces: mockCoordination = { coordinateAgents: jest.fn()... }
 */
export class MockCoordinationService {
  coordinateAgents: jest.MockedFunction<
    (agentIds: string[], topology: string, task?: string) => Promise<CoordinationResult>
  > = jest.fn();
  
  releaseCoordination: jest.MockedFunction<
    (coordinationId: string) => Promise<void>
  > = jest.fn();
  
  getCoordinationStatus: jest.MockedFunction<
    (coordinationId: string) => Promise<CoordinationStatus>
  > = jest.fn();

  constructor() {
    this.coordinateAgents.mockResolvedValue({
      success: true,
      coordinationId: 'coord-123',
      memoryAllocations: [],
      activeAgents: 2,
      topology: 'mesh'
    });
    
    this.releaseCoordination.mockResolvedValue(undefined);
    this.getCoordinationStatus.mockResolvedValue({
      coordinationId: 'coord-123',
      status: 'active',
      agentCount: 2
    });
  }

  // TDD London interaction testing helpers
  expectCoordinationCalled(agentIds: string[], topology: string, task?: string) {
    expect(this.coordinateAgents).toHaveBeenCalledWith(agentIds, topology, task);
    return this;
  }

  expectReleaseCalled(coordinationId: string) {
    expect(this.releaseCoordination).toHaveBeenCalledWith(coordinationId);
    return this;
  }

  expectStatusChecked(coordinationId: string) {
    expect(this.getCoordinationStatus).toHaveBeenCalledWith(coordinationId);
    return this;
  }

  setupCoordinationFailure(error: string = 'Coordination failed') {
    this.coordinateAgents.mockRejectedValueOnce(new Error(error));
    return this;
  }

  clearAllMocks() {
    jest.clearAllMocks();
    return this;
  }
}

/**
 * MockMemoryStoreService - Found 12+ times across files
 * Replaces: mockMemoryStore = { store: jest.fn(), retrieve: jest.fn()... }
 */
export class MockMemoryStoreService {
  store: jest.MockedFunction<(key: string, value: any) => Promise<void>> = jest.fn();
  retrieve: jest.MockedFunction<(key: string) => Promise<any>> = jest.fn();
  delete: jest.MockedFunction<(key: string) => Promise<boolean>> = jest.fn();
  query: jest.MockedFunction<(pattern: string) => Promise<any[]>> = jest.fn();
  close: jest.MockedFunction<() => Promise<void>> = jest.fn();
  initialize: jest.MockedFunction<() => Promise<void>> = jest.fn();

  constructor() {
    this.store.mockResolvedValue(undefined);
    this.retrieve.mockResolvedValue(null);
    this.delete.mockResolvedValue(true);
    this.query.mockResolvedValue([]);
    this.close.mockResolvedValue(undefined);
    this.initialize.mockResolvedValue(undefined);
  }

  expectStoreCalled(key: string, value?: any) {
    if (value !== undefined) {
      expect(this.store).toHaveBeenCalledWith(key, value);
    } else {
      expect(this.store).toHaveBeenCalledWith(key, expect.any(Object));
    }
    return this;
  }

  expectRetrieveCalled(key: string) {
    expect(this.retrieve).toHaveBeenCalledWith(key);
    return this;
  }

  expectQueryCalled(pattern: string) {
    expect(this.query).toHaveBeenCalledWith(pattern);
    return this;
  }

  setupRetrieveValue(key: string, value: any) {
    this.retrieve.mockImplementationOnce((k) => 
      k === key ? Promise.resolve(value) : Promise.resolve(null)
    );
    return this;
  }

  clearAllMocks() {
    jest.clearAllMocks();
    return this;
  }
}

/**
 * MockLoggerService - Found 10+ times across files
 * Replaces: mockLogger = { info: jest.fn(), error: jest.fn()... }
 */
export class MockLoggerService {
  info: jest.MockedFunction<(message: string, meta?: any) => void> = jest.fn();
  error: jest.MockedFunction<(message: string, error?: Error, meta?: any) => void> = jest.fn();
  warn: jest.MockedFunction<(message: string, meta?: any) => void> = jest.fn();
  debug: jest.MockedFunction<(message: string, meta?: any) => void> = jest.fn();

  constructor() {
    // No return values needed for logger methods
  }

  expectInfoLogged(message: string) {
    expect(this.info).toHaveBeenCalledWith(message, expect.anything());
    return this;
  }

  expectErrorLogged(message: string, error?: Error) {
    if (error) {
      expect(this.error).toHaveBeenCalledWith(message, error, expect.anything());
    } else {
      expect(this.error).toHaveBeenCalledWith(message, expect.any(Error), expect.anything());
    }
    return this;
  }

  expectWarnLogged(message: string) {
    expect(this.warn).toHaveBeenCalledWith(message, expect.anything());
    return this;
  }

  expectNoErrorsLogged() {
    expect(this.error).not.toHaveBeenCalled();
    return this;
  }

  clearAllMocks() {
    jest.clearAllMocks();
    return this;
  }
}

/**
 * MockSwarmService - Found 8+ times across files
 * Replaces: mockSwarm = { initialize: jest.fn(), spawnAgent: jest.fn()... }
 */
export class MockSwarmService {
  initialize: jest.MockedFunction<() => Promise<void>> = jest.fn();
  spawnAgent: jest.MockedFunction<(config: any) => Promise<string>> = jest.fn();
  terminateAgent: jest.MockedFunction<(agentId: string) => Promise<void>> = jest.fn();
  getSwarmStatus: jest.MockedFunction<() => Promise<SwarmStatus>> = jest.fn();
  orchestrateTask: jest.MockedFunction<(task: any) => Promise<any>> = jest.fn();

  constructor() {
    this.initialize.mockResolvedValue(undefined);
    this.spawnAgent.mockResolvedValue('agent-123');
    this.terminateAgent.mockResolvedValue(undefined);
    this.getSwarmStatus.mockResolvedValue({
      totalAgents: 5,
      activeAgents: 3,
      status: 'operational'
    });
    this.orchestrateTask.mockResolvedValue({ success: true });
  }

  expectInitializeCalled() {
    expect(this.initialize).toHaveBeenCalled();
    return this;
  }

  expectAgentSpawned(config?: any) {
    if (config) {
      expect(this.spawnAgent).toHaveBeenCalledWith(expect.objectContaining(config));
    } else {
      expect(this.spawnAgent).toHaveBeenCalled();
    }
    return this;
  }

  expectTaskOrchestrated(task: any) {
    expect(this.orchestrateTask).toHaveBeenCalledWith(expect.objectContaining(task));
    return this;
  }

  setupSwarmFailure(method: keyof MockSwarmService, error: string) {
    (this[method] as jest.MockedFunction<any>).mockRejectedValueOnce(new Error(error));
    return this;
  }

  clearAllMocks() {
    jest.clearAllMocks();
    return this;
  }
}

/**
 * MockDatabaseService - Found 6+ times across files
 * Replaces: mockDatabase = { query: jest.fn(), transaction: jest.fn()... }
 */
export class MockDatabaseService {
  query: jest.MockedFunction<(sql: string, params?: any[]) => Promise<any[]>> = jest.fn();
  execute: jest.MockedFunction<(sql: string, params?: any[]) => Promise<{ affectedRows: number }>> = jest.fn();
  transaction: jest.MockedFunction<(fn: (tx: any) => Promise<any>) => Promise<any>> = jest.fn();
  connect: jest.MockedFunction<() => Promise<void>> = jest.fn();
  disconnect: jest.MockedFunction<() => Promise<void>> = jest.fn();

  constructor() {
    this.query.mockResolvedValue([]);
    this.execute.mockResolvedValue({ affectedRows: 1 });
    this.transaction.mockImplementation(async (fn) => fn(this));
    this.connect.mockResolvedValue(undefined);
    this.disconnect.mockResolvedValue(undefined);
  }

  expectQueryCalled(sql: string, params?: any[]) {
    if (params) {
      expect(this.query).toHaveBeenCalledWith(sql, params);
    } else {
      expect(this.query).toHaveBeenCalledWith(sql, expect.any(Array));
    }
    return this;
  }

  expectTransactionCalled() {
    expect(this.transaction).toHaveBeenCalled();
    return this;
  }

  setupQueryResult(sql: string, result: any[]) {
    this.query.mockImplementationOnce((querySql) =>
      querySql.includes(sql) ? Promise.resolve(result) : Promise.resolve([])
    );
    return this;
  }

  clearAllMocks() {
    jest.clearAllMocks();
    return this;
  }
}

/**
 * MockMCPServerService - Found 6+ times across files
 * Replaces: mockMcpServer = { initialize: jest.fn(), handleMessage: jest.fn()... }
 */
export class MockMCPServerService {
  initialize: jest.MockedFunction<() => Promise<void>> = jest.fn();
  handleMessage: jest.MockedFunction<(message: any) => Promise<any>> = jest.fn();
  registerTool: jest.MockedFunction<(tool: any) => Promise<void>> = jest.fn();
  shutdown: jest.MockedFunction<() => Promise<void>> = jest.fn();

  constructor() {
    this.initialize.mockResolvedValue(undefined);
    this.handleMessage.mockResolvedValue({ success: true });
    this.registerTool.mockResolvedValue(undefined);
    this.shutdown.mockResolvedValue(undefined);
  }

  expectInitializeCalled() {
    expect(this.initialize).toHaveBeenCalled();
    return this;
  }

  expectMessageHandled(message?: any) {
    if (message) {
      expect(this.handleMessage).toHaveBeenCalledWith(expect.objectContaining(message));
    } else {
      expect(this.handleMessage).toHaveBeenCalled();
    }
    return this;
  }

  expectToolRegistered(tool: any) {
    expect(this.registerTool).toHaveBeenCalledWith(expect.objectContaining(tool));
    return this;
  }

  clearAllMocks() {
    jest.clearAllMocks();
    return this;
  }
}

// ============================================================================
// Type Definitions for Better TypeScript Support
// ============================================================================

export interface CoordinationResult {
  success: boolean;
  coordinationId: string;
  memoryAllocations: string[];
  activeAgents: number;
  topology: string;
}

export interface CoordinationStatus {
  coordinationId: string;
  status: 'active' | 'inactive' | 'failed';
  agentCount: number;
}

export interface SwarmStatus {
  totalAgents: number;
  activeAgents: number;
  status: 'operational' | 'degraded' | 'failed';
}

// ============================================================================
// Factory Function for Easy Mock Creation
// ============================================================================

/**
 * Factory function to create commonly needed mock combinations
 */
export function createCommonMocks() {
  return {
    coordination: new MockCoordinationService(),
    memoryStore: new MockMemoryStoreService(),
    logger: new MockLoggerService(),
    swarm: new MockSwarmService(),
    database: new MockDatabaseService(),
    mcpServer: new MockMCPServerService(),
  };
}

/**
 * Helper to clear all mocks in a collection
 */
export function clearAllCommonMocks(mocks: ReturnType<typeof createCommonMocks>) {
  Object.values(mocks).forEach(mock => mock.clearAllMocks());
}

// ============================================================================
// Usage Example
// ============================================================================

export function createExampleUsage() {
  return `
// ✅ Example TDD London test using common mocks:

describe('System Integration - TDD London Style', () => {
  let mocks: ReturnType<typeof createCommonMocks>;
  let systemUnderTest: MySystemService;

  beforeEach(() => {
    mocks = createCommonMocks();
    systemUnderTest = new MySystemService(
      mocks.coordination,
      mocks.memoryStore,
      mocks.logger,
      mocks.swarm
    );
  });

  afterEach(() => {
    clearAllCommonMocks(mocks);
  });

  test('should coordinate agents and log results', async () => {
    // ACT
    await systemUnderTest.executeCoordinatedTask(['agent1', 'agent2']);

    // ASSERT: Verify interactions (TDD London)
    mocks.coordination
      .expectCoordinationCalled(['agent1', 'agent2'], 'mesh')
      .expectStatusChecked('coord-123');
      
    mocks.logger
      .expectInfoLogged('Task coordination started')
      .expectInfoLogged('Task coordination completed');
      
    mocks.memoryStore
      .expectStoreCalled('task:result')
      .expectQueryCalled('task:*');
  });
});
`;
}
`;