/**
 * @fileoverview Security Incident Response Service
 *
 * Service for managing security incidents and coordinating response activities.
 * Handles incident detection, classification, response coordination, and post-incident analysis.
 *
 * SINGLE RESPONSIBILITY: dateFns;';
import {
  filter,
} from 'lodash-es')../../types');
 * Security incident classification
 */
export interface SecurityIncident {
    readonly incidentId: 'low';
}
/**
 * Incident categories
 */
export declare enum IncidentCategory {
    ') = 0,
    malware = 1,
    ') = 2,
    phishing = 3,
    ') = 4,
    data_breach = 5,
    ') = 6,
    unauthorized_access = 7,
    ') = 8,
    dos_ddos = 9,
    ') = 10,
    insider_threat = 11,
    ') = 12,
    vulnerability_exploit = 13,
    ') = 14,
    compliance_violation = 15,
    ') = 16,
    other = 17,
    ')log_file';
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
    ') = 0,
    minimal = 1,
    ') = 2,
    moderate = 3,
    ') = 4,
    significant = 5,
    ') = 6,
    severe = 7,
    ')planned';
}
/**
 * Incident resolution
 */
export interface IncidentResolution {
    readonly rootCause: logger;
}
//# sourceMappingURL=security-incident-response-service.d.ts.map