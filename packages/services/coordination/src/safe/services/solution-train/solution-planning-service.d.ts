/**
* @fileoverview Solution Planning Service
*
* Service for solution-level planning and coordination activities.
* Handles solution backlog management, PI planning coordination, and cross-ART synchronization.
*
* SINGLE RESPONSIBILITY: dateFns;';
import {
filter,
'} from 'lodash-es')../../types');
* Solution planning configuration
*/
export interface SolutionPlanningConfig {
readonly planningId: 'high';

}
/**
* Planning constraint
*/
export interface PlanningConstraint {
readonly constraintId: 'resource';

}
/**
* Impact levels
*/
export declare enum ImpactLevel {
') = 0,
low = 1,
') = 2,
medium = 3,
') = 4,
high = 5,
') = 6,
critical = 7,
')) DAILY = ' = 0,
daily = 1,
') = 2,
weekly = 3,
') = 4,
bi_weekly = 5,
') = 6,
pi_boundary = 7,
') = 8,
on_demand = 9,
')business_owner';

}
/**
* Influence and interest levels
*/
export declare enum InfluenceLevel {
') = 0,
high = 1,
') = 2,
medium = 3,
') = 4,
low = 5,
')high';

}
/**
* Planning risk
*/
export interface PlanningRisk {
readonly riskId: 'technical';

}
/**
* Risk probability and impact
*/
export declare enum RiskProbability {
') = 0,
high = 1,
') = 2,
medium = 3,
') = 4,
low = 5,
')}; = 6,
export = 7,
enum = 8,
RiskImpact = 9

}
//# sourceMappingURL=solution-planning-service.d.ts.map