/**
 * Architecture Capability with enhanced tracking
 */
export interface ArchitectureCapability {
    id: string;
    name: string;
    description: string;
    category: CapabilityCategory;
    maturityLevel: number;
    status: CapabilityStatus;
    enablers: string[];
    dependencies: string[];
    kpis: CapabilityKPI[];
    createdAt: Date;
    updatedAt: Date;
    owner: string;
    stakeholders: string[];
    businessValue: BusinessValueAssessment;
    technicalComplexity: TechnicalComplexityAssessment;
    investmentPlan: InvestmentPlan;
    roadmap: CapabilityRoadmap;
    metrics: CapabilityMetric[];
    '; : any;
}
/**
 * Capability categories for organization
 */
export type CapabilityCategory = business_capability | technology_capability | process_capability | data_capability | security_capability | integration_capability | platform_capability | infrastructure_capability | governance_capability | 'innovation_capability';
export type CapabilityStatus = planning | developing | active | optimizing | retiring | deprecated | 'suspended';
export interface CapabilityKPI {
    id: string;
    name: string;
    description: string;
    metric: string;
    target: number;
    current: number;
    unit: string;
    trend: KPITrend;
    frequency: MeasurementFrequency;
    threshold: PerformanceThreshold;
    historicalData: HistoricalDataPoint[];
    lastMeasured: Date;
    dataSource: DataSource;
}
/**
 * KPI trend analysis
 */
export type KPITrend = improving | 'improving' | ' stable' | ' declining' | declining | volatile | ' unknown';
export type MeasurementFrequency = real_time | hourly | daily | weekly | monthly | quarterly | 'annually';
export interface PerformanceThreshold {
    readonly excellent: 'accelerating|';
}
/**
 * Risk exposure data
 */
export interface RiskExposure {
    readonly category: CapabilityCategory;
    readonly riskScore: number;
    readonly exposureValue: number;
    readonly mitigationCoverage: number;
    readonly residualRisk: number;
}
/**
 * Capability Management Service - Architecture capability tracking and management
 *
 * Provides comprehensive architecture capability management with AI-powered maturity assessment,
 * capability roadmapping, dependency tracking, and performance monitoring.
 */
export declare class CapabilityManagementService {
    private readonly logger;
    private capabilities;
    private config;
}
export default CapabilityManagementService;
//# sourceMappingURL=capability-management-service.d.ts.map