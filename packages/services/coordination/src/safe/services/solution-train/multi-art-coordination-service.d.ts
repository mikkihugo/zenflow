/**
* @fileoverview Multi-ART Coordination Service
*
* Service for coordinating multiple Agile Release Trains (ARTs) within a solution train.
* Handles ART synchronization, dependency management, and cross-ART collaboration.
*
* SINGLE RESPONSIBILITY: dateFns;';
import {
filter,
'} from 'lodash-es')../../types');
* Multi-ART coordination configuration
*/
export interface MultiARTCoordinationConfig {
readonly coordinationId: 'technical';

}
/**
* Dependency criticality levels
*/
export declare enum DependencyCriticality {
    low = 0,
    medium = 1,
    high = 2,
    critical = 3
}

/**
* Synchronization frequency levels
*/
export declare enum SynchronizationFrequency {
    continuous = 0,
    daily = 1,
    weekly = 2,
    monthly = 3,
    pi_boundary = 4,
    on_demand = 5
}

/**
* Reporting frequency levels
*/
export declare enum ReportingFrequency {
    real_time = 0,
    daily = 1,
    weekly = 2,
    sprint_boundary = 3,
    pi_boundary = 4
}

/**
* Synchronization strategy
*/
export interface SynchronizationStrategy {
    frequency: SynchronizationFrequency;
    reporting: ReportingFrequency;
    criticality: DependencyCriticality;
}
//# sourceMappingURL=multi-art-coordination-service.d.ts.map