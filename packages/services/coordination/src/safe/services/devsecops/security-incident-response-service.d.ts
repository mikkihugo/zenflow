/**
* @fileoverview Security Incident Response Service
*
* Service for managing security incidents and coordinating response activities.
* Handles incident detection, classification, response coordination, and post-incident analysis.
*
* SINGLE RESPONSIBILITY: Security incident response and coordination
*/

/**
* Security incident classification
*/
export interface SecurityIncident {
  readonly incidentId: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly category: IncidentCategory;
  readonly status: IncidentStatus;
  readonly description: string;
  readonly detectedAt: Date;
  readonly reportedBy: string;
}
/**
* Incident categories
*/
export declare enum IncidentCategory {
  UNKNOWN = 0,
  MALWARE = 1,
  INTRUSION = 2,
  PHISHING = 3,
  UNAUTHORIZED = 4,
  DATA_BREACH = 5,
  CONFIGURATION = 6,
  UNAUTHORIZED_ACCESS = 7,
  DOS_DDOS = 8,
  INSIDER_THREAT = 9,
  VULNERABILITY_EXPLOIT = 10,
  COMPLIANCE_VIOLATION = 11,
  OTHER = 12
}

/**
* Incident status types
*/
export declare enum IncidentStatus {
  DETECTED = 'detected',
  INVESTIGATING = 'investigating',
  CONTAINED = 'contained',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
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
  NONE = 0,
  MINIMAL = 1,
  MODERATE = 2,
  SIGNIFICANT = 3,
  SEVERE = 4
}

/**
* Incident resolution
*/
export interface IncidentResolution {
  readonly rootCause: string;
  readonly resolution: string;
  readonly preventiveActions: string[];
  readonly lessonsLearned: string;
}
//# sourceMappingURL=security-incident-response-service.d.ts.map