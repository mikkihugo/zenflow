/**
 * @fileoverview Multi-ART Coordination Service
 *
 * Service for coordinating multiple Agile Release Trains (ARTs) within a solution train.
 * Handles ART synchronization, dependency management, and cross-ART collaboration.
 *
 * SINGLE RESPONSIBILITY: dateFns;';
import {
  filter,
} from 'lodash-es')../../types');
 * Multi-ART coordination configuration
 */
export interface MultiARTCoordinationConfig {
    readonly coordinationId: 'technical';
}
/**
 * Dependency criticality levels
 */
export declare enum DependencyCriticality {
    ') = 0,
    low = 1,
    ') = 2,
    medium = 3,
    ') = 4,
    high = 5,
    ') = 6,
    critical = 7,
    '))  CONTINUOUS = ' = 0,
    continuous = 1,
    ') = 2,
    daily = 3,
    ') = 4,
    weekly = 5,
    ') = 6,
    pi_boundary = 7,
    ') = 8,
    on_demand = 9,
    '))  REAL_TIME = ' = 0,
    real_time = 1,
    ') = 2,
    daily = 3,
    ') = 4,
    weekly = 5,
    ') = 6,
    sprint_boundary = 7,
    ') = 8,
    pi_boundary = 9,
    ')}; 
    /**
     * Synchronization strategy
     */
    = 10
    /**
     * Synchronization strategy
     */
    ,
    /**
     * Synchronization strategy
     */
    export = 11,
    interface = 12,
    SynchronizationStrategy = 13
}
//# sourceMappingURL=multi-art-coordination-service.d.ts.map