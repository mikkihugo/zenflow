/**
* @fileoverview Solution Architecture Management Service
*
* Service for solution-level architecture management and governance.
* Handles architectural runway management, technology standards, and cross-ART architectural alignment.
*
* SINGLE RESPONSIBILITY: dateFns;';
import {
filter,
orderBy,
'} from 'lodash-es')../../types');
* Solution architecture configuration
*/
export interface SolutionArchitectureConfig {
readonly configId: 'business';

}
/**
* Quality attribute
*/
export interface QualityAttribute {
readonly attributeId: 'critical';

}
/**
* Architectural constraint
*/
export interface ArchitecturalConstraint {
readonly constraintId: 'technical';

}
/**
* Constraint impact
*/
export declare enum ConstraintImpact {
    low = 0,
    medium = 1,
    high = 2,
    critical = 3
}

/**
* Standard scope
*/
export declare enum StandardScope {
    mandatory = 0,
    recommended = 1,
    approved = 2,
    optional = 3,
    restricted = 4,
    deprecated = 5
}

/**
* Decision right
*/
export interface DecisionRight {
    readonly rightId: string;
    readonly scope: StandardScope;
    readonly approver: string;
}
/**
* Approval threshold
*/
export interface ApprovalThreshold {

}
/**
* Review step
*/
export interface ReviewStep {
readonly stepId: 'alignment';

}
/**
* Escalation path
*/
export interface EscalationPath {
readonly pathId: 'continuous';

}
/**
* Runway management
*/
export interface RunwayManagement {
readonly runwayId: 'continuous';

}
/**
* Runway priority
*/
export interface RunwayPriority {
readonly priorityId: 'infrastructure';

}
/**
* Runway component
*/
export interface RunwayComponent {
readonly componentId: 'platform';

}
/**
* Component status
*/
export declare enum ComponentStatus {
    planned = 0,
    in_development = 1,
    available = 2,
    deprecated = 3,
    retired = 4
}

/**
* Component lifecycle
*/
export interface ComponentLifecycle {
    status: ComponentStatus;
    created: Date;
    lastUpdated: Date;
    version: string;
}
//# sourceMappingURL=solution-architecture-management-service.d.ts.map