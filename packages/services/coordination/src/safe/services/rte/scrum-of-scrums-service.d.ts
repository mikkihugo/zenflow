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
} from 'lodash-es')../../types');
* Scrum of Scrums meeting configuration
*/
export interface ScrumOfScrumsConfig {
id: string;
}
/**
* Impediment severity levels
*/
export declare enum ImpedimentSeverity {
') = 0,
low = 1,
') = 2,
medium = 3,
') = 4,
high = 5,
') = 6,
critical = 7,
')};
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