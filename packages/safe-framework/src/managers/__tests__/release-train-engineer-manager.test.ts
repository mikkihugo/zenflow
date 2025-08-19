/**
 * @fileoverview Release Train Engineer Manager Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import ReleaseTrainEngineerManager from '../release-train-engineer-manager';
import type { Logger, MemorySystem, TypeSafeEventBus, FeatureStatus } from '../../types';
import type { RTEManagerConfig } from '../release-train-engineer-manager';

describe('ReleaseTrainEngineerManager', () => {
  let manager: ReleaseTrainEngineerManager;
  let mockLogger: Logger;
  let mockMemory: MemorySystem;
  let mockEventBus: TypeSafeEventBus;
  let config: Partial<RTEManagerConfig>;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(), 
      error: vi.fn(),
      debug: vi.fn(),
    };

    mockMemory = {
      store: vi.fn().mockResolvedValue(undefined),
      retrieve: vi.fn().mockResolvedValue(null),
    };

    mockEventBus = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      registerHandler: vi.fn(),
    };

    config = {
      enablePIPlanningFacilitation: true,
      enableScrumOfScrums: true,
      enableSystemDemoCoordination: true,
      enableInspectAndAdaptFacilitation: true,
      enableProgramSynchronization: true,
      enablePredictabilityMeasurement: true,
      enableRiskAndDependencyManagement: true,
      maxARTsUnderManagement: 3,
    };

    manager = new ReleaseTrainEngineerManager(mockLogger, mockMemory, mockEventBus, config);
  });

  it('should initialize with default configuration', () => {
    expect(manager).toBeDefined();
    expect(mockLogger.info).toHaveBeenCalledWith(
      'RTE Manager initialized with configuration',
      expect.objectContaining({
        enabledFeatures: expect.any(Array),
        maxARTs: 3
      })
    );
  });

  it('should initialize successfully', async () => {
    await expect(manager.initialize()).resolves.not.toThrow();
    
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'rte:initialized',
      expect.objectContaining({
        type: 'rte:initialized',
        data: expect.objectContaining({
          managerId: 'rte-manager',
          capabilities: expect.any(Array)
        })
      })
    );
  });

  it('should facilitate PI Planning', async () => {
    await manager.initialize();
    
    const planningConfig = {
      participants: [
        { userId: 'user1', name: 'Test User', role: 'product-owner' as const, required: true }
      ],
      durationHours: 16,
      objectives: ['Objective 1', 'Objective 2'],
      businessContext: 'Test business context',
      constraints: ['Constraint 1']
    };

    const result = await manager.facilitatePIPlanning('PI-1', 'ART-1', planningConfig);
    
    expect(result).toBeDefined();
    expect(result.piId).toBe('PI-1');
    expect(result.artId).toBe('ART-1');
    expect(result.planningDate).toBeInstanceOf(Date);
    expect(result.confidenceVote.averageConfidence).toBe(3.5);
  });

  it('should coordinate Scrum of Scrums', async () => {
    await manager.initialize();
    
    const result = await manager.coordinateScrumOfScrums('ART-1');
    
    expect(result).toBeDefined();
    expect(result.artId).toBe('ART-1');
    expect(result.sessionDate).toBeInstanceOf(Date);
    expect(result.coordinationEffectiveness).toBe(85);
  });

  it('should manage program risks', async () => {
    await manager.initialize();
    
    const result = await manager.manageProgramRisks('ART-1');
    
    expect(result).toBeDefined();
    expect(result.artId).toBe('ART-1');
    expect(result.assessmentDate).toBeInstanceOf(Date);
    expect(result.overallRiskScore).toBe(75);
  });

  it('should coordinate ART synchronization', async () => {
    await manager.initialize();
    
    const result = await manager.coordinateARTSynchronization(['ART-1', 'ART-2']);
    
    expect(result).toBeDefined();
    expect(result.participatingARTs).toEqual(['ART-1', 'ART-2']);
    expect(result.synchronizationDate).toBeInstanceOf(Date);
    expect(result.effectiveness.overallScore).toBe(85);
  });

  it('should track program predictability', async () => {
    await manager.initialize();
    
    const result = await manager.trackProgramPredictability('PI-1', 'ART-1');
    
    expect(result).toBeDefined();
    expect(result.piId).toBe('PI-1');
    expect(result.artId).toBe('ART-1');
    expect(result.predictability.predictabilityScore).toBe(82);
  });

  it('should facilitate Inspect & Adapt', async () => {
    await manager.initialize();
    
    const iaConfig = {
      participants: ['user1', 'user2'],
      durationHours: 8,
      objectives: ['Improve process', 'Identify bottlenecks'],
      focusAreas: ['Quality', 'Velocity'],
      facilitationStyle: 'collaborative'
    };

    const result = await manager.facilitateInspectAndAdapt('PI-1', 'ART-1', iaConfig);
    
    expect(result).toBeDefined();
    expect(result.piId).toBe('PI-1');
    expect(result.artId).toBe('ART-1');
    expect(result.workshopDate).toBeInstanceOf(Date);
  });

  it('should manage System Demo', async () => {
    await manager.initialize();
    
    const features = [
      {
        id: 'F-1',
        name: 'Test Feature',
        description: 'Test feature description',
        piId: 'PI-1',
        businessValue: 100,
        acceptanceCriteria: ['AC1'],
        stories: [],
        enablers: [],
        status: 'development' as FeatureStatus,
        owner: 'owner1',
        team: 'team1'
      }
    ];

    const result = await manager.manageSystemDemo('PI-1', 'ART-1', features);
    
    expect(result).toBeDefined();
    expect(result.piId).toBe('PI-1');
    expect(result.artId).toBe('ART-1');
    expect(result.featuresPresented).toHaveLength(1);
    expect(result.stakeholderSatisfaction).toBe(85);
  });

  it('should handle configuration with disabled features', () => {
    const disabledConfig = {
      enablePIPlanningFacilitation: false,
      enableScrumOfScrums: false,
      enableSystemDemoCoordination: false,
    };

    const disabledManager = new ReleaseTrainEngineerManager(
      mockLogger, 
      mockMemory, 
      mockEventBus, 
      disabledConfig
    );

    expect(disabledManager).toBeDefined();
  });

  it('should throw error when trying disabled features', async () => {
    const disabledConfig = { enablePIPlanningFacilitation: false };
    const disabledManager = new ReleaseTrainEngineerManager(
      mockLogger,
      mockMemory,
      mockEventBus,
      disabledConfig
    );

    await disabledManager.initialize();

    const planningConfig = {
      participants: [],
      durationHours: 16,
      objectives: [],
      businessContext: '',
      constraints: []
    };

    await expect(disabledManager.facilitatePIPlanning('PI-1', 'ART-1', planningConfig))
      .rejects.toThrow('PI Planning facilitation is not enabled');
  });
});