/**
 * @fileoverview Security Incident Response Service
 *
 * Service for managing security incidents and coordinating response activities.
 * Handles incident detection, classification, response coordination, and post-incident analysis.
 *
 * SINGLE RESPONSIBILITY: dateFns;';
import {
  filter,
} from 'lodash-es')import type { Logger} from '../../types')/**';
 * Security incident classification
 */
export interface SecurityIncident {
    readonly incidentId: 'low';
}
/**
 * Incident categories
 */
export declare enum IncidentCategory {
    ')  MALWARE = ' = 0,
    malware = 1,
    ')  PHISHING = ' = 2,
    phishing = 3,
    ')  DATA_BREACH = ' = 4,
    data_breach = 5,
    ')  UNAUTHORIZED_ACCESS = ' = 6,
    unauthorized_access = 7,
    ')  DOS_DDOS = ' = 8,
    dos_ddos = 9,
    ')  INSIDER_THREAT = ' = 10,
    insider_threat = 11,
    ')  VULNERABILITY_EXPLOIT = ' = 12,
    vulnerability_exploit = 13,
    ')  COMPLIANCE_VIOLATION = ' = 14,
    compliance_violation = 15,
    ')  OTHER = ' = 16,
    other = 17,
    ')};; 
    /**
     * Incident status tracking
     */
    = 18
    /**
     * Incident status tracking
     */
    ,
    /**
     * Incident status tracking
     */
    export = 19,
    enum = 20,
    IncidentStatus = 21
}
/**
 * Incident timeline entry
 */
export interface IncidentTimelineEntry {
    readonly entryId: 'log_file';
}
/**
 * Chain of custody entry
 */
export interface ChainOfCustodyEntry {
    readonly timestamp: 'none';
}
/**
 * Business impact levels
 */
export declare enum BusinessImpactLevel {
    ')  MINIMAL = ' = 0,
    minimal = 1,
    ')  MODERATE = ' = 2,
    moderate = 3,
    ')  SIGNIFICANT = ' = 4,
    significant = 5,
    ')  SEVERE = ' = 6,
    severe = 7,
    ')};; 
    /**
     * Containment actions
     */
    = 8
    /**
     * Containment actions
     */
    ,
    /**
     * Containment actions
     */
    export = 9,
    interface = 10,
    ContainmentActions = 11
}
/**
 * Containment action
 */
export interface ContainmentAction {
    readonly actionId: 'planned';
}
/**
 * Incident resolution
 */
export interface IncidentResolution {
    readonly rootCause: logger;
}
//# sourceMappingURL=security-incident-response-service.d.ts.map