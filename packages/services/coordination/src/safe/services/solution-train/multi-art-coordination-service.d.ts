/**
 * @fileoverview Multi-ART Coordination Service
 *
 * Service for coordinating multiple Agile Release Trains (ARTs) within a solution train.
 * Handles ART synchronization, dependency management, and cross-ART collaboration.
 *
 * SINGLE RESPONSIBILITY: dateFns;';
import {
  filter,
} from 'lodash-es')import type { Logger} from '../../types')/**';
 * Multi-ART coordination configuration
 */
export interface MultiARTCoordinationConfig {
    readonly coordinationId: 'technical';
}
/**
 * Dependency criticality levels
 */
export declare enum DependencyCriticality {
    ')  LOW = ' = 0,
    low = 1,
    ')  MEDIUM = ' = 2,
    medium = 3,
    ')  HIGH = ' = 4,
    high = 5,
    ')  CRITICAL = ' = 6,
    critical = 7,
    ')};; 
    /**
     * Dependency status tracking
     */
    = 8
    /**
     * Dependency status tracking
     */
    ,
    /**
     * Dependency status tracking
     */
    export = 9,
    enum = 10,
    DependencyStatus = 11
}
/**
 * Integration frequency
 */
export declare enum IntegrationFrequency {
    ')  CONTINUOUS = ' = 0,
    continuous = 1,
    ')  DAILY = ' = 2,
    daily = 3,
    ')  WEEKLY = ' = 4,
    weekly = 5,
    ')  PI_BOUNDARY = ' = 6,
    pi_boundary = 7,
    ')  ON_DEMAND = ' = 8,
    on_demand = 9,
    ')};; 
    /**
     * Integration complexity levels
     */
    = 10
    /**
     * Integration complexity levels
     */
    ,
    /**
     * Integration complexity levels
     */
    export = 11,
    enum = 12,
    IntegrationComplexity = 13
}
/**
 * Synchronization frequency
 */
export declare enum SynchronizationFrequency {
    ')  REAL_TIME = ' = 0,
    real_time = 1,
    ')  DAILY = ' = 2,
    daily = 3,
    ')  WEEKLY = ' = 4,
    weekly = 5,
    ')  SPRINT_BOUNDARY = ' = 6,
    sprint_boundary = 7,
    ')  PI_BOUNDARY = ' = 8,
    pi_boundary = 9,
    ')};; 
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