/**
 * @file Core Types for Event System
 *
 * Standalone type definitions that don't depend on external modules
 */
/**
 * Basic domain enum for event system
 */
export var Domain;
(function (Domain) {
    Domain["SYSTEM"] = "system";
    Domain["COORDINATION"] = "coordination";
    Domain["INTERFACE"] = "interface";
    Domain["MEMORY"] = "memory";
    Domain["NEURAL"] = "neural";
    Domain["WORKFLOW"] = "workflow";
    Domain["DATABASE"] = "database";
    Domain["KNOWLEDGE"] = "knowledge";
    Domain["CORE"] = "core";
    Domain["UNKNOWN"] = "unknown";
})(Domain || (Domain = {}));
/**
 * Error classes
 */
export class DomainValidationError extends Error {
    domain;
    constructor(message, domain) {
        super(message);
        this.domain = domain;
        this.name = 'DomainValidationError';
    }
}
export class ContractViolationError extends Error {
    contract;
    constructor(message, contract) {
        super(message);
        this.contract = contract;
        this.name = 'ContractViolationError';
    }
}
