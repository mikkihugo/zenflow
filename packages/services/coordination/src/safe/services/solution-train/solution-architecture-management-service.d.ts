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
} from 'lodash-es')import type { Logger} from '../../types')/**';
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
    ')  HIGH = ' = 0,
    high = 1,
    ')  MEDIUM = ' = 2,
    medium = 3,
    ')  LOW = ' = 4,
    low = 5,
    ')};; 
    /**
     * Evolution roadmap
     */
    = 6
    /**
     * Evolution roadmap
     */
    ,
    /**
     * Evolution roadmap
     */
    export = 7,
    interface = 8,
    EvolutionRoadmap = 9
}
/**
 * Technology standard
 */
export interface TechnologyStandard {
    readonly standardId: 'programming_language';
}
/**
 * Standard scope
 */
export declare enum StandardScope {
    ')  MANDATORY = ' = 0,
    mandatory = 1,
    ')  RECOMMENDED = ' = 2,
    recommended = 3,
    ')  APPROVED = ' = 4,
    approved = 5,
    ')  RESTRICTED = ' = 6,
    restricted = 7,
    ')  DEPRECATED = ' = 8,
    deprecated = 9,
    ')};; 
    /**
     * Compliance levels
     */
    = 10
    /**
     * Compliance levels
     */
    ,
    /**
     * Compliance levels
     */
    export = 11,
    enum = 12,
    ComplianceLevel = 13
}
/**
 * Technology alternative
 */
export interface TechnologyAlternative {
    readonly alternativeId: 'centralized';
}
/**
 * Decision right
 */
export interface DecisionRight {
    readonly rightId: 'technology_adoption';
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
    ')  PLANNED = ' = 0,
    planned = 1,
    ')  IN_DEVELOPMENT = ' = 2,
    in_development = 3,
    ')  AVAILABLE = ' = 4,
    available = 5,
    ')  DEPRECATED = ' = 6,
    deprecated = 7,
    ')  RETIRED = ' = 8,
    retired = 9,
    ')};; 
    /**
     * Component lifecycle
     */
    = 10
    /**
     * Component lifecycle
     */
    ,
    /**
     * Component lifecycle
     */
    export = 11,
    interface = 12,
    ComponentLifecycle = 13
}
//# sourceMappingURL=solution-architecture-management-service.d.ts.map