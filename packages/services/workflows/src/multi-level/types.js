"use strict";
/**
 * @fileoverview Multi-Level Orchestration Types
 *
 * Defines the type system for the multi-level parallel flow architecture:
 * - Portfolio Level (Strategic - Human Controlled)
 * - Program Level (AI-Human Collaboration)
 * - Swarm Execution Level (AI Autonomous with SPARC)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPARCPhase = exports.OrchestrationLevel = void 0;
// ============================================================================
// ORCHESTRATION LEVELS - Three-tier architecture
// ============================================================================
/**
 * Orchestration levels in the multi-level architecture
 */
var OrchestrationLevel;
(function (OrchestrationLevel) {
    OrchestrationLevel["PORTFOLIO"] = "portfolio";
    OrchestrationLevel["PROGRAM"] = "program";
    OrchestrationLevel["SWARM_EXECUTION"] = "execution";
})(OrchestrationLevel || (exports.OrchestrationLevel = OrchestrationLevel = {}));
// ============================================================================
// SPARC INTEGRATION TYPES
// ============================================================================
/**
 * SPARC phases for feature development
 */
var SPARCPhase;
(function (SPARCPhase) {
    SPARCPhase["SPECIFICATION"] = "specification";
    SPARCPhase["PSEUDOCODE"] = "pseudocode";
    SPARCPhase["ARCHITECTURE"] = "architecture";
    SPARCPhase["REFINEMENT"] = "refinement";
    SPARCPhase["COMPLETION"] = "completion";
})(SPARCPhase || (exports.SPARCPhase = SPARCPhase = {}));
