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
'} from 'lodash-es')../../types');
* Scrum of Scrums meeting configuration
*/
export interface ScrumOfScrumsConfig {
id: string;

}
/**
* Impediment severity levels
*/
export declare enum ImpedimentSeverity {
    low = 0,
    medium = 1,
    high = 2,
    critical = 3
}

/**
* Impediment status tracking
*/
export declare enum ImpedimentStatus {
    open = 0,
    in_progress = 1,
    resolved = 2,
    closed = 3
}
//# sourceMappingURL=scrum-of-scrums-service.d.ts.map