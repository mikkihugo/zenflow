/**
 * TDD London Mock Coordination Conversion Examples
 *
 * Shows how to convert basic object mocks to proper TDD London approach
 * that focuses on interaction testing rather than state testing.
 */

import { vi } from 'vitest';

// ============================================================================
// ❌ BEFORE: Basic Object Mock (avoid this pattern)
// ============================================================================

// This is what we found in integration-features-coverage.test.js
const OLD_PATTERN_mockCoordination = {
  coordinateAgents: vi.fn().mockResolvedValue({
    success: true,
    coordinationId: 'coord-123',
    memoryAllocations: [],
  }),
};

// ============================================================================
// ✅ AFTER: TDD London Mock Class (proper pattern)
// ============================================================================

/**
 * TDD London Mock - Tests INTERACTIONS, not state
 * Focuses on verifying method calls and collaboration patterns
 */
export class MockCoordinationService {
  // Jest spies for interaction testing (TDD London approach) - properly typed
  coordinateAgents: vi.MockedFunction<
    (
      agentIds: string[],
      topology: string,
      task?: string,
    ) => Promise<CoordinationResult>
  > = vi.fn();

  releaseCoordination: vi.MockedFunction<
    (coordinationId: string) => Promise<void>
  > = vi.fn();

  getCoordinationStatus: vi.MockedFunction<
    (coordinationId: string) => Promise<CoordinationStatus>
  > = vi.fn();

  updateCoordinationMetrics: vi.MockedFunction<
    (coordinationId: string, metrics: CoordinationMetrics) => Promise<void>
  > = vi.fn();

  constructor() {
    // Configure default return values for London TDD - with correct types
    this.coordinateAgents.mockResolvedValue({
      success: true,
      coordinationId: 'coord-123',
      memoryAllocations: [],
      activeAgents: 2,
      topologyEstablished: true,
      coordinationMetrics: {
        latency: 50,
        throughput: 1000,
        reliability: 0.99,
      },
    });

    this.releaseCoordination.mockResolvedValue(undefined);

    this.getCoordinationStatus.mockResolvedValue({
      coordinationId: 'coord-123',
      status: 'active',
      agentCount: 2,
      established: new Date(),
      lastActivity: new Date(),
    });

    this.updateCoordinationMetrics.mockResolvedValue(undefined);
  }

  // ============================================================================
  // TDD London Helper Methods for Interaction Testing
  // ============================================================================

  /**
   * Verify coordination was called with specific parameters
   */
  expectCoordinationCalled(
    agentIds: string[],
    topology: string,
    task?: string,
  ) {
    expect(this.coordinateAgents).toHaveBeenCalledWith(
      agentIds,
      topology,
      task,
    );
    return this;
  }

  /**
   * Verify release was called for specific coordination
   */
  expectReleaseCalled(coordinationId: string) {
    expect(this.releaseCoordination).toHaveBeenCalledWith(coordinationId);
    return this;
  }

  /**
   * Verify status was checked for coordination
   */
  expectStatusChecked(coordinationId: string) {
    expect(this.getCoordinationStatus).toHaveBeenCalledWith(coordinationId);
    return this;
  }

  /**
   * Verify metrics were updated
   */
  expectMetricsUpdated(
    coordinationId: string,
    metrics?: Partial<CoordinationMetrics>,
  ) {
    if (metrics) {
      expect(this.updateCoordinationMetrics).toHaveBeenCalledWith(
        coordinationId,
        expect.objectContaining(metrics),
      );
    } else {
      expect(this.updateCoordinationMetrics).toHaveBeenCalledWith(
        coordinationId,
        expect.any(Object),
      );
    }
    return this;
  }

  /**
   * Verify call order for interaction sequences (TDD London pattern)
   */
  expectCallOrder(methods: (keyof this)[]) {
    const calls = methods.map((method) => {
      const mockMethod = this[method] as vi.MockedFunction<any>;
      return mockMethod.mock.invocationCallOrder[0];
    });

    for (let i = 1; i < calls.length; i++) {
      expect(calls[i - 1]).toBeLessThan(calls[i]);
    }
    return this;
  }

  /**
   * Setup specific coordination exists scenario
   */
  setupCoordinationExists(coordinationId: string, agentCount: number = 2) {
    this.getCoordinationStatus.mockResolvedValueOnce({
      coordinationId,
      status: 'active',
      agentCount,
      established: new Date(),
      lastActivity: new Date(),
    });
    return this;
  }

  /**
   * Setup coordination failure scenario
   */
  setupCoordinationFailure(error: string = 'Coordination failed') {
    this.coordinateAgents.mockRejectedValueOnce(new Error(error));
    return this;
  }

  /**
   * Clear all mocks for clean test separation
   */
  clearAllMocks() {
    vi.clearAllMocks();
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
  topologyEstablished: boolean;
  coordinationMetrics: CoordinationMetrics;
}

export interface CoordinationStatus {
  coordinationId: string;
  status: 'active' | 'inactive' | 'establishing' | 'failed';
  agentCount: number;
  established: Date;
  lastActivity: Date;
}

export interface CoordinationMetrics {
  latency: number;
  throughput: number;
  reliability: number;
}

// ============================================================================
// Memory Pool Mock (also converted to TDD London)
// ============================================================================

export class MockMemoryPool {
  allocate: vi.MockedFunction<
    (
      type: string,
      size: number,
    ) => { success: boolean; ptr: ArrayBuffer; id: string }
  > = vi.fn();

  deallocate: vi.MockedFunction<(id: string) => boolean> = vi.fn();

  getStats: vi.MockedFunction<
    () => { totalMemory: number; usedMemory: number; fragmentation: number }
  > = vi.fn();

  constructor() {
    this.allocate.mockReturnValue({
      success: true,
      ptr: new ArrayBuffer(1024),
      id: 'mem-123',
    });

    this.deallocate.mockReturnValue(true);

    this.getStats.mockReturnValue({
      totalMemory: 1024 * 1024,
      usedMemory: 512 * 1024,
      fragmentation: 0.1,
    });
  }

  expectAllocationCalled(type: string, size: number) {
    expect(this.allocate).toHaveBeenCalledWith(type, size);
    return this;
  }

  expectDeallocationCalled(id: string) {
    expect(this.deallocate).toHaveBeenCalledWith(id);
    return this;
  }

  expectStatsChecked() {
    expect(this.getStats).toHaveBeenCalled();
    return this;
  }

  clearAllMocks() {
    vi.clearAllMocks();
    return this;
  }
}

// ============================================================================
// Example Usage in Tests (TDD London Style)
// ============================================================================

export function createTDDLondonTestExample() {
  return `
describe('Coordination Service - TDD London Example', () => {
  let mockCoordination: MockCoordinationService;
  let mockMemory: MockMemoryPool;
  let systemUnderTest: CoordinationOrchestrator; // The real system we're testing

  beforeEach(() => {
    // Create fresh mocks for each test
    mockCoordination = new MockCoordinationService();
    mockMemory = new MockMemoryPool();
    
    // Inject mocks into system under test
    systemUnderTest = new CoordinationOrchestrator(mockCoordination, mockMemory);
  });

  afterEach(() => {
    // London TDD: Clear all mocks after each test
    mockCoordination.clearAllMocks();
    mockMemory.clearAllMocks();
  });

  test('should coordinate agents with memory allocation - London TDD: verify interactions', async () => {
    // ARRANGE: No need to setup state, we verify interactions
    
    // ACT: Call the system under test
    await systemUnderTest.executeCoordinatedTask(['agent1', 'agent2'], 'peer_to_peer');

    // ASSERT: Verify interactions (London TDD) - check method calls and order
    mockMemory
      .expectAllocationCalled('neural-coordination', 2048)
      .expectStatsChecked();
    
    mockCoordination
      .expectCoordinationCalled(['agent1', 'agent2'], 'peer_to_peer', 'memory-intensive-task')
      .expectStatusChecked('coord-123')
      .expectMetricsUpdated('coord-123', { latency: expect.any(Number) });
    
    // Verify call order (TDD London pattern)
    mockCoordination.expectCallOrder(['coordinateAgents', 'getCoordinationStatus', 'updateCoordinationMetrics']);
  });

  test('should handle coordination failure gracefully', async () => {
    // ARRANGE: Setup failure scenario
    mockCoordination.setupCoordinationFailure('Network timeout');
    
    // ACT & ASSERT: Verify error handling
    await expect(
      systemUnderTest.executeCoordinatedTask(['agent1', 'agent2'], 'mesh')
    ).rejects.toThrow('Network timeout');
    
    // Verify cleanup was attempted even after failure
    mockCoordination.expectCoordinationCalled(['agent1', 'agent2'], 'mesh');
  });
});
`;
}
