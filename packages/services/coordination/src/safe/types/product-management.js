/**
 * @fileoverview Product Management Types - SAFe Domain Types
 *
 * TypeScript type definitions for SAFe product management domain.
 * Provides comprehensive types for product ownership and management.
 *
 * SINGLE RESPONSIBILITY: Type definitions for product management domain
 * FOCUSES ON: Product vision, lifecycle, customer segments, market analysis
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
/**
 * Product lifecycle stages
 */
export var ProductLifecycleStage;
(function (ProductLifecycleStage) {
    ProductLifecycleStage["IDEATION"] = "ideation";
    ProductLifecycleStage["VALIDATION"] = "validation";
    ProductLifecycleStage["DEVELOPMENT"] = "development";
    ProductLifecycleStage["LAUNCH"] = "launch";
    ProductLifecycleStage["GROWTH"] = "growth";
    ProductLifecycleStage["MATURITY"] = "maturity";
    ProductLifecycleStage["DECLINE"] = "decline";
    ProductLifecycleStage["SUNSET"] = "sunset";
})(ProductLifecycleStage || (ProductLifecycleStage = {}));
/**
 * Customer need priority levels
 */
export var CustomerNeedPriority;
(function (CustomerNeedPriority) {
    CustomerNeedPriority["CRITICAL"] = "critical";
    CustomerNeedPriority["HIGH"] = "high";
    CustomerNeedPriority["MEDIUM"] = "medium";
    CustomerNeedPriority["LOW"] = "low";
    CustomerNeedPriority["NICE_TO_HAVE"] = "nice_to_have";
})(CustomerNeedPriority || (CustomerNeedPriority = {}));
/**
 * Urgency level for customer needs
 */
export var UrgencyLevel;
(function (UrgencyLevel) {
    UrgencyLevel["IMMEDIATE"] = "immediate";
    UrgencyLevel["SHORT_TERM"] = "short_term";
    UrgencyLevel["MEDIUM_TERM"] = "medium_term";
    UrgencyLevel["LONG_TERM"] = "long_term";
    UrgencyLevel["FUTURE"] = "future";
})(UrgencyLevel || (UrgencyLevel = {}));
/**
 * Frequency pattern for customer behavior
 */
export var FrequencyPattern;
(function (FrequencyPattern) {
    FrequencyPattern["CONTINUOUS"] = "continuous";
    FrequencyPattern["DAILY"] = "daily";
    FrequencyPattern["WEEKLY"] = "weekly";
    FrequencyPattern["MONTHLY"] = "monthly";
    FrequencyPattern["QUARTERLY"] = "quarterly";
    FrequencyPattern["ANNUALLY"] = "annually";
    FrequencyPattern["SPORADIC"] = "sporadic";
    FrequencyPattern["ONE_TIME"] = "one_time";
})(FrequencyPattern || (FrequencyPattern = {}));
/**
 * Influence level enumeration
 */
export var InfluenceLevel;
(function (InfluenceLevel) {
    InfluenceLevel["PRIMARY"] = "primary";
    InfluenceLevel["SECONDARY"] = "secondary";
    InfluenceLevel["TERTIARY"] = "tertiary";
    InfluenceLevel["MINIMAL"] = "minimal";
})(InfluenceLevel || (InfluenceLevel = {}));
/**
 * Objection severity levels
 */
export var ObjectionSeverity;
(function (ObjectionSeverity) {
    ObjectionSeverity["DEAL_BREAKER"] = "deal_breaker";
    ObjectionSeverity["MAJOR"] = "major";
    ObjectionSeverity["MODERATE"] = "moderate";
    ObjectionSeverity["MINOR"] = "minor";
    ObjectionSeverity["EASILY_ADDRESSED"] = "easily_addressed";
})(ObjectionSeverity || (ObjectionSeverity = {}));
