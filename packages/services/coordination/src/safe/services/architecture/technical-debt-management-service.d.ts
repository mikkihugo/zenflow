/**
* Technical Debt Item with enhanced tracking
*/
export interface TechnicalDebtItem {
id: string;
'}
/**
* Technical debt categories
*/
export type TechnicalDebtCategory = code_quality | security_vulnerability | performance_issue | maintainability | scalability | architecture_drift | deprecated_technology | test_debt | documentation_gap | 'infrastructure_debt';
export type BusinessImpactLevel = {
readonly level: {
readonly level: 'accelerating|';
'};
'};
/**
* Technical Debt Management Service - Technical debt tracking and remediation
*
* Provides comprehensive technical debt management with AI-powered prioritization,
* automated tracking, impact analysis, and integration with development workflows.
*/
export declare class TechnicalDebtManagementService {
private readonly logger;
private debtItems;
private remediationPlans;
private config;
'}
//# sourceMappingURL=technical-debt-management-service.d.ts.map