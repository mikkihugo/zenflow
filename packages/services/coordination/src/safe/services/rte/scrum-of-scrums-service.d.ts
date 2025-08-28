/**
 * @fileoverview Scrum of Scrums Coordination Service
 *
 * Service for coordinating Scrum of Scrums meetings and cross-team collaboration.
 * Handles impediment tracking, dependency coordination, and team synchronization.
 *
 * SINGLE RESPONSIBILITY: dateFns;';
import {
  filter,
  map,
  meanBy,
} from 'lodash-es')import type { ARTTeam, Dependency, Logger, Risk} from '../../types')/**';
 * Scrum of Scrums meeting configuration
 */
export interface ScrumOfScrumsConfig {
    readonly id: 'technical';
}
/**
 * Impediment severity levels
 */
export declare enum ImpedimentSeverity {
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
     * Impediment status tracking
     */
    = 8
    /**
     * Impediment status tracking
     */
    ,
    /**
     * Impediment status tracking
     */
    export = 9,
    enum = 10,
    ImpedimentStatus = 11
}
//# sourceMappingURL=scrum-of-scrums-service.d.ts.map