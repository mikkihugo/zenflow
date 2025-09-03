/**
 * EU AI Act Risk Categories
 * Based on EU AI Act Regulation (EU) 2024/1689
 */
export enum AIRiskCategory {
  /** Prohibited AI practices */
  UNACCEPTABLE = 'unacceptable',
  /** High-risk AI systems */
  HIGH = 'high',
  /** Limited risk AI systems */
  LIMITED = 'limited',
  /** Minimal risk AI systems */
  MINIMAL = 'minimal'
}

/**
 * EU AI Act High-Risk AI System Categories
 * Annex III of the EU AI Act
 */
export enum HighRiskCategory {
  /** Biometric identification and categorisation of natural persons */
  BIOMETRIC_IDENTIFICATION = 'biometric_identification',
  /** Management and operation of critical infrastructure */
  CRITICAL_INFRASTRUCTURE = 'critical_infrastructure',
  /** Education and vocational training */
  EDUCATION = 'education',
  /** Employment, workers management and access to self-employment */
  EMPLOYMENT = 'employment',
  /** Access to and enjoyment of essential private services and essential public services and benefits */
  ESSENTIAL_SERVICES = 'essential_services',
  /** Law enforcement */
  LAW_ENFORCEMENT = 'law_enforcement',
  /** Migration, asylum and border control management */
  MIGRATION_ASYLUM = 'migration_asylum',
  /** Administration of justice and democratic processes */
  JUSTICE_DEMOCRACY = 'justice_democracy'
}

/**
 * AI System Purpose and Use Case
 */
export interface AISystemPurpose {
  /** Primary intended purpose */
  primary: string;
  /** Secondary purposes */
  secondary?: string[];
  /** Specific use cases */
  useCases: string[];
  /** Target user groups */
  targetUsers: string[];
  /** Operational context */
  context: string;
}

/**
 * Risk Assessment for AI System
 */
export interface RiskAssessment {
  /** Unique assessment ID */
  id: string;
  /** AI system identifier */
  systemId: string;
  /** Risk category classification */
  category: AIRiskCategory;
  /** High-risk category if applicable */
  highRiskCategory?: HighRiskCategory;
  /** Risk factors identified */
  riskFactors: RiskFactor[];
  /** Mitigation measures */
  mitigationMeasures: MitigationMeasure[];
  /** Assessment date */
  assessmentDate: Date;
  /** Next review date */
  nextReviewDate: Date;
  /** Assessor information */
  assessor: {
    name: string;
    role: string;
    qualifications: string[];
  };
  /** Assessment status */
  status: 'draft' | 'under_review' | 'approved' | 'rejected';
}

/**
 * Risk Factor
 */
export interface RiskFactor {
  /** Risk factor ID */
  id: string;
  /** Risk description */
  description: string;
  /** Severity level (1-5) */
  severity: number;
  /** Likelihood (1-5) */
  likelihood: number;
  /** Overall risk score */
  riskScore: number;
  /** Affected stakeholders */
  affectedStakeholders: string[];
  /** Potential harm */
  potentialHarm: string[];
}

/**
 * Mitigation Measure
 */
export interface MitigationMeasure {
  /** Measure ID */
  id: string;
  /** Risk factor IDs this addresses */
  addressedRiskFactors: string[];
  /** Mitigation description */
  description: string;
  /** Implementation status */
  status: 'planned' | 'in_progress' | 'implemented' | 'verified';
  /** Responsible party */
  responsible: string;
  /** Implementation date */
  implementationDate?: Date;
  /** Effectiveness rating (1-5) */
  effectiveness?: number;
}

/**
 * Human Oversight Requirements
 */
export interface HumanOversight {
  /** Type of oversight required */
  type: 'human_in_the_loop' | 'human_on_the_loop' | 'human_in_command';
  /** Oversight measures implemented */
  measures: OversightMeasure[];
  /** Qualified personnel requirements */
  personnelRequirements: PersonnelRequirement[];
  /** Decision override capabilities */
  overrideCapabilities: OverrideCapability[];
}

/**
 * Oversight Measure
 */
export interface OversightMeasure {
  /** Measure ID */
  id: string;
  /** Description of the measure */
  description: string;
  /** Implementation details */
  implementation: string;
  /** Effectiveness monitoring */
  monitoring: string;
}

/**
 * Personnel Requirement
 */
export interface PersonnelRequirement {
  /** Required role */
  role: string;
  /** Required qualifications */
  qualifications: string[];
  /** Required training */
  training: string[];
  /** Competency assessment */
  competencyAssessment: string;
}

/**
 * Override Capability
 */
export interface OverrideCapability {
  /** Capability ID */
  id: string;
  /** Decision type that can be overridden */
  decisionType: string;
  /** Override mechanism */
  mechanism: string;
  /** Authorization level required */
  authorizationLevel: string;
  /** Audit trail requirements */
  auditTrail: boolean;
}

/**
 * Data Governance Requirements
 */
export interface DataGovernance {
  /** Training data requirements */
  trainingData: DataRequirement;
  /** Validation data requirements */
  validationData: DataRequirement;
  /** Testing data requirements */
  testingData: DataRequirement;
  /** Data quality measures */
  qualityMeasures: DataQualityMeasure[];
  /** Bias monitoring */
  biasMonitoring: BiasMonitoring;
}

/**
 * Data Requirement
 */
export interface DataRequirement {
  /** Data sources */
  sources: string[];
  /** Quality criteria */
  qualityCriteria: string[];
  /** Completeness requirements */
  completeness: string;
  /** Relevance assessment */
  relevance: string;
  /** Representativeness criteria */
  representativeness: string;
  /** Data collection methodology */
  collectionMethodology: string;
}

/**
 * Data Quality Measure
 */
export interface DataQualityMeasure {
  /** Measure ID */
  id: string;
  /** Quality dimension */
  dimension: 'accuracy' | 'completeness' | 'consistency' | 'timeliness' | 'validity' | 'uniqueness';
  /** Measurement method */
  method: string;
  /** Threshold values */
  thresholds: {
    minimum: number;
    target: number;
    maximum?: number;
  };
  /** Monitoring frequency */
  frequency: string;
}

/**
 * Bias Monitoring
 */
export interface BiasMonitoring {
  /** Protected attributes */
  protectedAttributes: string[];
  /** Bias detection methods */
  detectionMethods: BiasDetectionMethod[];
  /** Monitoring frequency */
  frequency: string;
  /** Bias thresholds */
  thresholds: BiasThreshold[];
  /** Corrective actions */
  correctiveActions: CorrectiveAction[];
}

/**
 * Bias Detection Method
 */
export interface BiasDetectionMethod {
  /** Method ID */
  id: string;
  /** Method name */
  name: string;
  /** Description */
  description: string;
  /** Applicable contexts */
  applicableContexts: string[];
  /** Implementation details */
  implementation: string;
}

/**
 * Bias Threshold
 */
export interface BiasThreshold {
  /** Threshold ID */
  id: string;
  /** Protected attribute */
  protectedAttribute: string;
  /** Metric type */
  metric: string;
  /** Threshold value */
  threshold: number;
  /** Action trigger */
  actionTrigger: string;
}

/**
 * Corrective Action
 */
export interface CorrectiveAction {
  /** Action ID */
  id: string;
  /** Triggered by threshold */
  triggeredBy: string;
  /** Description */
  description: string;
  /** Implementation steps */
  steps: string[];
  /** Responsible party */
  responsible: string;
  /** Timeline */
  timeline: string;
}

/**
 * Quality Management System
 */
export interface QualityManagementSystem {
  /** QMS implementation */
  implementation: QMSImplementation;
  /** Risk management procedures */
  riskManagement: RiskManagementProcedure[];
  /** Change management */
  changeManagement: ChangeManagementProcedure;
  /** Documentation requirements */
  documentation: DocumentationRequirement[];
  /** Training and competence */
  training: TrainingRequirement[];
}

/**
 * QMS Implementation
 */
export interface QMSImplementation {
  /** QMS standard */
  standard: string;
  /** Implementation status */
  status: 'planning' | 'implementing' | 'operational' | 'certified';
  /** Certification details */
  certification?: {
    body: string;
    certificate: string;
    validUntil: Date;
  };
  /** Audit schedule */
  auditSchedule: AuditSchedule[];
}

/**
 * Risk Management Procedure
 */
export interface RiskManagementProcedure {
  /** Procedure ID */
  id: string;
  /** Procedure name */
  name: string;
  /** Description */
  description: string;
  /** Process steps */
  steps: ProcessStep[];
  /** Responsible roles */
  responsibleRoles: string[];
  /** Review frequency */
  reviewFrequency: string;
}

/**
 * Change Management Procedure
 */
export interface ChangeManagementProcedure {
  /** Change approval process */
  approvalProcess: ProcessStep[];
  /** Impact assessment requirements */
  impactAssessment: string[];
  /** Testing requirements */
  testingRequirements: string[];
  /** Rollback procedures */
  rollbackProcedures: string[];
  /** Documentation requirements */
  documentationRequirements: string[];
}

/**
 * Documentation Requirement
 */
export interface DocumentationRequirement {
  /** Document type */
  type: string;
  /** Description */
  description: string;
  /** Template reference */
  template?: string;
  /** Required content */
  requiredContent: string[];
  /** Update frequency */
  updateFrequency: string;
  /** Retention period */
  retentionPeriod: string;
}

/**
 * Training Requirement
 */
export interface TrainingRequirement {
  /** Target audience */
  audience: string;
  /** Training topics */
  topics: string[];
  /** Training method */
  method: string;
  /** Frequency */
  frequency: string;
  /** Competency assessment */
  competencyAssessment: string;
  /** Certification required */
  certificationRequired: boolean;
}

/**
 * Process Step
 */
export interface ProcessStep {
  /** Step ID */
  id: string;
  /** Step name */
  name: string;
  /** Description */
  description: string;
  /** Inputs */
  inputs: string[];
  /** Outputs */
  outputs: string[];
  /** Responsible role */
  responsibleRole: string;
  /** Duration estimate */
  duration: string;
}

/**
 * Audit Schedule
 */
export interface AuditSchedule {
  /** Audit type */
  type: 'internal' | 'external' | 'certification';
  /** Planned date */
  plannedDate: Date;
  /** Scope */
  scope: string[];
  /** Auditor */
  auditor: string;
  /** Status */
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}