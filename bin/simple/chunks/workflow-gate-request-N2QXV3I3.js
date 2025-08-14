
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  getLogger
} from "./chunk-NECHN6IW.js";
import {
  __name
} from "./chunk-O4JO3PGD.js";

// src/coordination/workflows/workflow-gate-request.ts
import { EventEmitter } from "events";

// src/core/domain-boundary-validator.ts
var Domain = /* @__PURE__ */ ((Domain2) => {
  Domain2["COORDINATION"] = "coordination";
  Domain2["WORKFLOWS"] = "workflows";
  Domain2["NEURAL"] = "neural";
  Domain2["DATABASE"] = "database";
  Domain2["MEMORY"] = "memory";
  Domain2["KNOWLEDGE"] = "knowledge";
  Domain2["OPTIMIZATION"] = "optimization";
  Domain2["INTERFACES"] = "interfaces";
  Domain2["CORE"] = "core";
  return Domain2;
})(Domain || {});
var DomainValidationError = class extends Error {
  static {
    __name(this, "DomainValidationError");
  }
  code;
  domain;
  operation;
  validationPath;
  actualValue;
  expectedType;
  timestamp;
  constructor(message, code, domain, operation, validationPath = [], actualValue, expectedType) {
    super(message);
    this.name = "DomainValidationError";
    this.code = code;
    this.domain = domain;
    this.operation = operation;
    this.validationPath = validationPath;
    this.actualValue = actualValue;
    this.expectedType = expectedType || "unknown";
    this.timestamp = /* @__PURE__ */ new Date();
  }
};
var ContractViolationError = class extends Error {
  static {
    __name(this, "ContractViolationError");
  }
  contractRule;
  domain;
  operation;
  severity;
  timestamp;
  constructor(message, contractRule, domain, operation, severity = "error") {
    super(message);
    this.name = "ContractViolationError";
    this.contractRule = contractRule;
    this.domain = domain;
    this.operation = operation;
    this.severity = severity;
    this.timestamp = /* @__PURE__ */ new Date();
  }
};
var DomainBoundaryValidator = class {
  constructor(domain, options = {}) {
    this.domain = domain;
    this.logger = getLogger(`domain-boundary-${domain}`);
    this.cacheEnabled = options.cacheEnabled ?? true;
    this.maxCacheSize = options.maxCacheSize ?? 1e3;
    this.maxCrossingLogSize = options.maxCrossingLogSize ?? 1e4;
    this.logger.info(`Initialized domain boundary validator for ${domain}`, {
      cacheEnabled: this.cacheEnabled,
      maxCacheSize: this.maxCacheSize
    });
  }
  static {
    __name(this, "DomainBoundaryValidator");
  }
  logger;
  validationCache = /* @__PURE__ */ new Map();
  crossingLog = [];
  performanceMetrics = /* @__PURE__ */ new Map();
  // Performance optimization settings
  cacheEnabled = true;
  maxCacheSize = 1e3;
  maxCrossingLogSize = 1e4;
  /**
   * Validate input data against schema with comprehensive runtime checking
   */
  validateInput(data, schema) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(data, schema);
    if (this.cacheEnabled && this.validationCache.has(cacheKey)) {
      this.logger.debug("Cache hit for validation", { cacheKey });
      return this.validationCache.get(cacheKey);
    }
    try {
      const result = this.performValidation(data, schema, []);
      const validationTime = Date.now() - startTime;
      if (this.cacheEnabled) {
        this.updateCache(cacheKey, result);
      }
      this.updatePerformanceMetrics(schema.description || "unknown", {
        validationTimeMs: validationTime,
        schemaComplexity: this.calculateSchemaComplexity(schema),
        dataSize: this.estimateDataSize(data),
        cacheHit: false,
        errorCount: 0
      });
      this.logger.debug("Validation successful", {
        domain: this.domain,
        validationTime,
        schemaType: schema.type
      });
      return result;
    } catch (error) {
      const validationTime = Date.now() - startTime;
      this.updatePerformanceMetrics(schema.description || "unknown", {
        validationTimeMs: validationTime,
        schemaComplexity: this.calculateSchemaComplexity(schema),
        dataSize: this.estimateDataSize(data),
        cacheHit: false,
        errorCount: 1
      });
      this.logger.error("Validation failed", {
        domain: this.domain,
        error: error instanceof Error ? error.message : String(error),
        validationTime,
        dataType: typeof data
      });
      throw error;
    }
  }
  /**
   * Enforce contract rules for domain operations
   */
  async enforceContract(operation) {
    const startTime = Date.now();
    const crossingId = this.generateCrossingId();
    this.logger.info("Enforcing contract", {
      operationId: operation.id,
      sourceDomain: operation.sourceDomain,
      targetDomain: operation.targetDomain,
      crossingId
    });
    try {
      const context = {
        currentDomain: this.domain,
        operation: operation.id,
        timestamp: /* @__PURE__ */ new Date(),
        requestId: crossingId,
        metadata: operation.metadata
      };
      const violations = [];
      for (const rule of operation.contractValidation) {
        try {
          const isValid = await rule.validator(operation, context);
          if (!isValid) {
            const violation = new ContractViolationError(
              rule.errorMessage,
              rule.name,
              operation.sourceDomain,
              operation.id,
              rule.severity
            );
            violations.push(violation);
            this.logger.warn("Contract rule violation", {
              rule: rule.name,
              severity: rule.severity,
              operation: operation.id
            });
          }
        } catch (error) {
          const violation = new ContractViolationError(
            `Contract rule execution failed: ${error instanceof Error ? error.message : String(error)}`,
            rule.name,
            operation.sourceDomain,
            operation.id,
            "error"
          );
          violations.push(violation);
        }
      }
      const errorViolations = violations.filter((v) => v.severity === "error");
      if (errorViolations.length > 0) {
        return {
          success: false,
          error: errorViolations[0],
          metadata: {
            domainFrom: operation.sourceDomain,
            domainTo: operation.targetDomain,
            operation: operation.id,
            timestamp: /* @__PURE__ */ new Date(),
            validationTime: Date.now() - startTime,
            crossingId,
            performanceMetrics: {
              validationTimeMs: Date.now() - startTime,
              schemaComplexity: operation.contractValidation.length,
              dataSize: JSON.stringify(operation).length,
              errorCount: errorViolations.length
            }
          }
        };
      }
      const warnings = violations.filter((v) => v.severity === "warning");
      if (warnings.length > 0) {
        this.logger.warn("Contract warnings detected", {
          warningCount: warnings.length,
          operation: operation.id
        });
      }
      return {
        success: true,
        data: operation,
        metadata: {
          domainFrom: operation.sourceDomain,
          domainTo: operation.targetDomain,
          operation: operation.id,
          timestamp: /* @__PURE__ */ new Date(),
          validationTime: Date.now() - startTime,
          crossingId,
          performanceMetrics: {
            validationTimeMs: Date.now() - startTime,
            schemaComplexity: operation.contractValidation.length,
            dataSize: JSON.stringify(operation).length,
            errorCount: 0
          }
        }
      };
    } catch (error) {
      this.logger.error("Contract enforcement failed", {
        operationId: operation.id,
        error: error instanceof Error ? error.message : String(error)
      });
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          domainFrom: operation.sourceDomain,
          domainTo: operation.targetDomain,
          operation: operation.id,
          timestamp: /* @__PURE__ */ new Date(),
          validationTime: Date.now() - startTime,
          crossingId
        }
      };
    }
  }
  /**
   * Track domain crossings for architecture compliance monitoring
   */
  trackCrossings(from, to, operation) {
    const crossing = {
      id: this.generateCrossingId(),
      fromDomain: from,
      toDomain: to,
      operation,
      timestamp: /* @__PURE__ */ new Date(),
      currentDomain: this.domain
    };
    this.crossingLog.push(crossing);
    if (this.crossingLog.length > this.maxCrossingLogSize) {
      this.crossingLog.splice(0, this.crossingLog.length - this.maxCrossingLogSize);
    }
    this.logger.debug("Domain crossing tracked", {
      crossingId: crossing.id,
      from,
      to,
      operation,
      totalCrossings: this.crossingLog.length
    });
  }
  // ============================================================================
  // PUBLIC API EXTENSIONS - Additional functionality for comprehensive validation
  // ============================================================================
  /**
   * Get performance metrics for optimization
   */
  getPerformanceMetrics() {
    return new Map(this.performanceMetrics);
  }
  /**
   * Get domain crossing history for compliance analysis
   */
  getDomainCrossings(limit) {
    const crossings = [...this.crossingLog];
    if (limit && limit > 0) {
      return crossings.slice(-limit);
    }
    return crossings;
  }
  /**
   * Clear caches and reset metrics (for testing/maintenance)
   */
  reset() {
    this.validationCache.clear();
    this.crossingLog.length = 0;
    this.performanceMetrics.clear();
    this.logger.info("Domain boundary validator reset", {
      domain: this.domain
    });
  }
  /**
   * Get validation statistics
   */
  getStatistics() {
    const totalValidations = Array.from(this.performanceMetrics.values()).reduce(
      (sum, metrics) => sum + (metrics.errorCount >= 0 ? 1 : 0),
      0
    );
    const totalErrors = Array.from(this.performanceMetrics.values()).reduce(
      (sum, metrics) => sum + metrics.errorCount,
      0
    );
    const avgValidationTime = Array.from(this.performanceMetrics.values()).reduce(
      (sum, metrics) => sum + metrics.validationTimeMs,
      0
    ) / Math.max(1, this.performanceMetrics.size);
    return {
      domain: this.domain,
      totalValidations,
      totalErrors,
      errorRate: totalValidations > 0 ? totalErrors / totalValidations : 0,
      averageValidationTime: avgValidationTime,
      cacheSize: this.validationCache.size,
      crossingCount: this.crossingLog.length,
      lastResetTime: /* @__PURE__ */ new Date()
    };
  }
  // ============================================================================
  // PRIVATE IMPLEMENTATION - Internal validation logic
  // ============================================================================
  performValidation(data, schema, path) {
    if (data === null || data === void 0) {
      if (schema.type === "null" || schema.type === "undefined") {
        return data;
      }
      if (!schema.required) {
        return data;
      }
      throw new DomainValidationError(
        `Required value is ${data}`,
        "REQUIRED_VALUE_MISSING",
        this.domain,
        "validation",
        path,
        data,
        schema.type
      );
    }
    switch (schema.type) {
      case "string":
        if (typeof data !== "string") {
          throw new DomainValidationError(
            `Expected string, got ${typeof data}`,
            "TYPE_MISMATCH",
            this.domain,
            "validation",
            path,
            data,
            "string"
          );
        }
        break;
      case "number":
        if (typeof data !== "number" || isNaN(data)) {
          throw new DomainValidationError(
            `Expected number, got ${typeof data}`,
            "TYPE_MISMATCH",
            this.domain,
            "validation",
            path,
            data,
            "number"
          );
        }
        break;
      case "boolean":
        if (typeof data !== "boolean") {
          throw new DomainValidationError(
            `Expected boolean, got ${typeof data}`,
            "TYPE_MISMATCH",
            this.domain,
            "validation",
            path,
            data,
            "boolean"
          );
        }
        break;
      case "object":
        if (typeof data !== "object" || Array.isArray(data)) {
          throw new DomainValidationError(
            `Expected object, got ${typeof data}`,
            "TYPE_MISMATCH",
            this.domain,
            "validation",
            path,
            data,
            "object"
          );
        }
        if (schema.properties) {
          for (const [key, propSchema] of Object.entries(schema.properties)) {
            if (propSchema) {
              const propData = data[key];
              this.performValidation(propData, propSchema, [...path, key]);
            }
          }
        }
        break;
      case "array":
        if (!Array.isArray(data)) {
          throw new DomainValidationError(
            `Expected array, got ${typeof data}`,
            "TYPE_MISMATCH",
            this.domain,
            "validation",
            path,
            data,
            "array"
          );
        }
        if (schema.items) {
          data.forEach((item, index) => {
            this.performValidation(item, schema.items, [...path, index.toString()]);
          });
        }
        break;
      case "function":
        if (typeof data !== "function") {
          throw new DomainValidationError(
            `Expected function, got ${typeof data}`,
            "TYPE_MISMATCH",
            this.domain,
            "validation",
            path,
            data,
            "function"
          );
        }
        break;
    }
    if (schema.enum && !schema.enum.includes(data)) {
      throw new DomainValidationError(
        `Value not in allowed enum values`,
        "ENUM_VIOLATION",
        this.domain,
        "validation",
        path,
        data,
        `enum: ${schema.enum.join(", ")}`
      );
    }
    if (schema.validator && !schema.validator(data)) {
      throw new DomainValidationError(
        `Custom validation failed`,
        "CUSTOM_VALIDATION_FAILED",
        this.domain,
        "validation",
        path,
        data,
        "custom validator"
      );
    }
    if (schema.transform) {
      return schema.transform(data);
    }
    return data;
  }
  generateCacheKey(data, schema) {
    const dataStr = this.safeStringify(data);
    const schemaStr = this.safeStringify(schema);
    const dataHash = this.simpleHash(dataStr);
    const schemaHash = this.simpleHash(schemaStr);
    return `${dataHash}-${schemaHash}`;
  }
  generateCrossingId() {
    return `crossing-${this.domain}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  simpleHash(str) {
    if (!str || str.length === 0) return "0";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
  safeStringify(obj) {
    try {
      return JSON.stringify(obj, this.getCircularReplacer()) || "null";
    } catch {
      return "stringify-error";
    }
  }
  getCircularReplacer() {
    const seen = /* @__PURE__ */ new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    };
  }
  calculateSchemaComplexity(schema) {
    let complexity = 1;
    if (schema.properties) {
      complexity += Object.keys(schema.properties).length;
      for (const propSchema of Object.values(schema.properties)) {
        if (propSchema) {
          complexity += this.calculateSchemaComplexity(propSchema);
        }
      }
    }
    if (schema.items) {
      complexity += this.calculateSchemaComplexity(schema.items);
    }
    if (schema.validator) complexity += 2;
    if (schema.transform) complexity += 2;
    if (schema.enum) complexity += schema.enum.length;
    return complexity;
  }
  estimateDataSize(data) {
    try {
      return this.safeStringify(data).length;
    } catch {
      return 0;
    }
  }
  updateCache(key, value) {
    if (this.validationCache.size >= this.maxCacheSize) {
      const firstKey = this.validationCache.keys().next().value;
      if (firstKey) {
        this.validationCache.delete(firstKey);
      }
    }
    this.validationCache.set(key, value);
  }
  updatePerformanceMetrics(operation, metrics) {
    const existing = this.performanceMetrics.get(operation);
    if (existing) {
      const aggregated = {
        validationTimeMs: (existing.validationTimeMs + metrics.validationTimeMs) / 2,
        schemaComplexity: Math.max(existing.schemaComplexity, metrics.schemaComplexity),
        dataSize: Math.max(existing.dataSize, metrics.dataSize),
        errorCount: existing.errorCount + metrics.errorCount
      };
      this.performanceMetrics.set(operation, aggregated);
    } else {
      this.performanceMetrics.set(operation, metrics);
    }
  }
};
var DomainBoundaryValidatorRegistry = class _DomainBoundaryValidatorRegistry {
  static {
    __name(this, "DomainBoundaryValidatorRegistry");
  }
  static instance;
  validators = /* @__PURE__ */ new Map();
  logger = getLogger("domain-boundary-registry");
  constructor() {
  }
  static getInstance() {
    if (!_DomainBoundaryValidatorRegistry.instance) {
      _DomainBoundaryValidatorRegistry.instance = new _DomainBoundaryValidatorRegistry();
    }
    return _DomainBoundaryValidatorRegistry.instance;
  }
  /**
   * Get or create validator for a domain
   */
  getValidator(domain) {
    if (!this.validators.has(domain)) {
      const validator = new DomainBoundaryValidator(domain);
      this.validators.set(domain, validator);
      this.logger.info("Created new domain validator", { domain });
    }
    return this.validators.get(domain);
  }
  /**
   * Get all validators for system-wide operations
   */
  getAllValidators() {
    return new Map(this.validators);
  }
  /**
   * Reset all validators (for testing/maintenance)
   */
  resetAll() {
    for (const validator of this.validators.values()) {
      validator.reset();
    }
    this.logger.info("Reset all domain validators");
  }
  /**
   * Get system-wide validation statistics
   */
  getSystemStatistics() {
    const stats = {
      totalDomains: this.validators.size,
      domainStatistics: /* @__PURE__ */ new Map(),
      systemTotalValidations: 0,
      systemTotalErrors: 0,
      systemErrorRate: 0,
      systemAverageValidationTime: 0
    };
    let totalValidations = 0;
    let totalErrors = 0;
    let totalValidationTime = 0;
    for (const [domain, validator] of this.validators) {
      const domainStats = validator.getStatistics();
      stats.domainStatistics.set(domain, domainStats);
      totalValidations += domainStats.totalValidations;
      totalErrors += domainStats.totalErrors;
      totalValidationTime += domainStats.averageValidationTime * domainStats.totalValidations;
    }
    stats.systemTotalValidations = totalValidations;
    stats.systemTotalErrors = totalErrors;
    stats.systemErrorRate = totalValidations > 0 ? totalErrors / totalValidations : 0;
    stats.systemAverageValidationTime = totalValidations > 0 ? totalValidationTime / totalValidations : 0;
    return stats;
  }
};
var domainValidatorRegistry = DomainBoundaryValidatorRegistry.getInstance();
function getDomainValidator(domain) {
  return domainValidatorRegistry.getValidator(domain);
}
__name(getDomainValidator, "getDomainValidator");

// src/core/type-safe-event-system.ts
var EventPriority = /* @__PURE__ */ ((EventPriority2) => {
  EventPriority2[EventPriority2["LOW"] = 0] = "LOW";
  EventPriority2[EventPriority2["NORMAL"] = 1] = "NORMAL";
  EventPriority2[EventPriority2["HIGH"] = 2] = "HIGH";
  EventPriority2[EventPriority2["CRITICAL"] = 3] = "CRITICAL";
  EventPriority2[EventPriority2["URGENT"] = 4] = "URGENT";
  return EventPriority2;
})(EventPriority || {});
var BaseEventSchema = {
  type: "object",
  required: true,
  properties: {
    id: { type: "string", required: true },
    type: { type: "string", required: true },
    domain: {
      type: "string",
      required: true,
      enum: Object.values(Domain)
    },
    timestamp: { type: "object", required: true },
    version: { type: "string", required: true },
    metadata: {
      type: "object",
      required: false,
      properties: {
        correlationId: { type: "string", required: false },
        causationId: { type: "string", required: false },
        source: { type: "string", required: false },
        userId: { type: "string", required: false },
        sessionId: { type: "string", required: false },
        traceId: { type: "string", required: false },
        priority: {
          type: "number",
          required: false,
          enum: Object.values(EventPriority).filter((v) => typeof v === "number")
        },
        tags: {
          type: "array",
          required: false,
          items: { type: "string" }
        },
        customData: { type: "object", required: false }
      }
    }
  }
};
var EventSchemas = {
  AgentCreated: {
    ...BaseEventSchema,
    properties: {
      ...BaseEventSchema.properties,
      payload: {
        type: "object",
        required: true,
        properties: {
          agent: { type: "object", required: true },
          capabilities: {
            type: "array",
            required: true,
            items: { type: "string" }
          },
          initialStatus: {
            type: "string",
            required: true,
            enum: ["idle", "busy"]
          }
        }
      }
    }
  },
  TaskAssigned: {
    ...BaseEventSchema,
    properties: {
      ...BaseEventSchema.properties,
      payload: {
        type: "object",
        required: true,
        properties: {
          task: { type: "object", required: true },
          agentId: { type: "string", required: true },
          assignmentTime: { type: "object", required: true }
        }
      }
    }
  },
  WorkflowStarted: {
    ...BaseEventSchema,
    properties: {
      ...BaseEventSchema.properties,
      payload: {
        type: "object",
        required: true,
        properties: {
          workflowId: { type: "string", required: true },
          definition: { type: "object", required: true },
          context: { type: "object", required: true },
          startTime: { type: "object", required: true }
        }
      }
    }
  },
  HumanValidationRequested: {
    ...BaseEventSchema,
    properties: {
      ...BaseEventSchema.properties,
      payload: {
        type: "object",
        required: true,
        properties: {
          requestId: { type: "string", required: true },
          validationType: {
            type: "string",
            required: true,
            enum: ["approval", "selection", "input", "review"]
          },
          context: { type: "object", required: true },
          priority: {
            type: "number",
            required: true,
            enum: Object.values(EventPriority).filter((v) => typeof v === "number")
          },
          timeout: { type: "number", required: false }
        }
      }
    }
  }
};
function createEvent(type, domain, payload, metadata) {
  return {
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    domain,
    timestamp: /* @__PURE__ */ new Date(),
    version: "1.0.0",
    metadata,
    ...payload
  };
}
__name(createEvent, "createEvent");
function createCorrelationId() {
  return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
__name(createCorrelationId, "createCorrelationId");

// src/coordination/workflows/workflow-gate-request.ts
var logger = getLogger("workflow-gate-request");
var GateEscalationLevel = /* @__PURE__ */ ((GateEscalationLevel2) => {
  GateEscalationLevel2[GateEscalationLevel2["NONE"] = 0] = "NONE";
  GateEscalationLevel2[GateEscalationLevel2["TEAM_LEAD"] = 1] = "TEAM_LEAD";
  GateEscalationLevel2[GateEscalationLevel2["MANAGER"] = 2] = "MANAGER";
  GateEscalationLevel2[GateEscalationLevel2["DIRECTOR"] = 3] = "DIRECTOR";
  GateEscalationLevel2[GateEscalationLevel2["EXECUTIVE"] = 4] = "EXECUTIVE";
  GateEscalationLevel2[GateEscalationLevel2["BOARD"] = 5] = "BOARD";
  return GateEscalationLevel2;
})(GateEscalationLevel || {});
var WorkflowGateRequestSchema = {
  type: "object",
  required: true,
  properties: {
    // ValidationQuestion base properties
    id: { type: "string", required: true },
    type: {
      type: "string",
      required: true,
      enum: ["relevance", "boundary", "relationship", "naming", "priority", "checkpoint", "review"]
    },
    question: { type: "string", required: true },
    context: { type: "object", required: true },
    options: {
      type: "array",
      required: false,
      items: { type: "string" }
    },
    allowCustom: { type: "boolean", required: false },
    confidence: { type: "number", required: true },
    priority: {
      type: "string",
      required: false,
      enum: ["critical", "high", "medium", "low"]
    },
    validationReason: { type: "string", required: false },
    expectedImpact: { type: "number", required: false },
    // WorkflowGateRequest specific properties
    workflowContext: {
      type: "object",
      required: true,
      properties: {
        workflowId: { type: "string", required: true },
        stepName: { type: "string", required: true },
        businessImpact: {
          type: "string",
          required: true,
          enum: ["low", "medium", "high", "critical"]
        },
        decisionScope: {
          type: "string",
          required: true,
          enum: ["task", "feature", "epic", "prd", "portfolio"]
        },
        stakeholders: {
          type: "array",
          required: true,
          items: { type: "string" }
        },
        deadline: { type: "object", required: false },
        dependencies: {
          type: "array",
          required: false,
          items: {
            type: "object",
            properties: {
              id: { type: "string", required: true },
              type: {
                type: "string",
                required: true,
                enum: ["blocking", "blocked_by", "related", "impacts", "impacted_by"]
              },
              reference: { type: "string", required: true },
              criticality: {
                type: "string",
                required: true,
                enum: ["low", "medium", "high", "critical"]
              },
              description: { type: "string", required: false }
            }
          }
        }
      }
    },
    gateType: {
      type: "string",
      required: true,
      enum: ["approval", "checkpoint", "review", "decision", "escalation", "emergency"]
    },
    requiredApprovalLevel: {
      type: "number",
      required: false,
      enum: [0, 1, 2, 3, 4, 5]
      // GateEscalationLevel values
    },
    escalationChain: {
      type: "object",
      required: false,
      properties: {
        id: { type: "string", required: true },
        levels: {
          type: "array",
          required: true,
          items: {
            type: "object",
            properties: {
              level: { type: "number", required: true },
              approvers: {
                type: "array",
                required: true,
                items: { type: "string" }
              },
              requiredApprovals: { type: "number", required: false },
              timeLimit: { type: "number", required: false }
            }
          }
        },
        triggers: {
          type: "array",
          required: true,
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                required: true,
                enum: [
                  "timeout",
                  "business_impact",
                  "cost_threshold",
                  "risk_level",
                  "stakeholder_conflict"
                ]
              },
              threshold: { type: "any", required: true },
              delay: { type: "number", required: false },
              skipLevels: { type: "boolean", required: false }
            }
          }
        },
        maxLevel: { type: "number", required: true },
        notifyAllLevels: { type: "boolean", required: false }
      }
    },
    timeoutConfig: {
      type: "object",
      required: false,
      properties: {
        initialTimeout: { type: "number", required: true },
        escalationTimeouts: {
          type: "array",
          required: true,
          items: { type: "number" }
        },
        maxTotalTimeout: { type: "number", required: true }
      }
    },
    integrationConfig: {
      type: "object",
      required: false,
      properties: {
        correlationId: { type: "string", required: false },
        aguiInterface: { type: "string", required: false },
        domainValidation: { type: "boolean", required: false },
        enableMetrics: { type: "boolean", required: false }
      }
    },
    conditionalLogic: {
      type: "object",
      required: false,
      properties: {
        prerequisites: {
          type: "array",
          required: false,
          items: {
            type: "object",
            properties: {
              id: { type: "string", required: true },
              type: {
                type: "string",
                required: true,
                enum: [
                  "workflow_state",
                  "user_role",
                  "time_constraint",
                  "dependency",
                  "risk_threshold",
                  "custom"
                ]
              },
              operator: {
                type: "string",
                required: true,
                enum: [
                  "equals",
                  "not_equals",
                  "greater_than",
                  "less_than",
                  "contains",
                  "matches",
                  "exists"
                ]
              },
              value: { type: "any", required: true },
              field: { type: "string", required: true },
              required: { type: "boolean", required: false }
            }
          }
        },
        autoApprovalConditions: {
          type: "array",
          required: false,
          items: {
            type: "object",
            properties: {
              id: { type: "string", required: true },
              type: { type: "string", required: true },
              operator: { type: "string", required: true },
              value: { type: "any", required: true },
              field: { type: "string", required: true },
              required: { type: "boolean", required: false }
            }
          }
        }
      }
    }
  }
};
var WorkflowGateRequestProcessor = class extends EventEmitter {
  constructor(eventBus, aguiInterface, config = {}) {
    super();
    this.eventBus = eventBus;
    this.aguiInterface = aguiInterface;
    this.config = config;
    this.logger = getLogger("workflow-gate-processor");
    this.domainValidator = getDomainValidator("workflows" /* WORKFLOWS */);
    this.config = {
      enableMetrics: true,
      enableDomainValidation: true,
      defaultTimeout: 3e5,
      // 5 minutes
      maxEscalationLevel: 4 /* EXECUTIVE */,
      enableAutoApproval: true,
      ...config
    };
    this.initializeEventHandlers();
  }
  static {
    __name(this, "WorkflowGateRequestProcessor");
  }
  logger;
  domainValidator;
  pendingGates = /* @__PURE__ */ new Map();
  escalationTimers = /* @__PURE__ */ new Map();
  gateCounter = 0;
  // ============================================================================
  // PUBLIC API - Core workflow gate operations
  // ============================================================================
  /**
   * Process a workflow gate request with full validation and escalation support
   */
  async processWorkflowGate(gateRequest, options = {}) {
    const startTime = Date.now();
    const correlationId = gateRequest.integrationConfig?.correlationId || createCorrelationId();
    this.logger.info("Processing workflow gate request", {
      gateId: gateRequest.id,
      workflowId: gateRequest.workflowContext.workflowId,
      stepName: gateRequest.workflowContext.stepName,
      gateType: gateRequest.gateType,
      businessImpact: gateRequest.workflowContext.businessImpact,
      correlationId
    });
    try {
      if (!options.skipValidation && this.config.enableDomainValidation) {
        const validationResult2 = await this.validateGateRequest(gateRequest);
        if (!validationResult2.success) {
          throw new Error(`Gate validation failed: ${validationResult2.error?.message}`);
        }
      }
      const prerequisiteResult = await this.checkPrerequisites(gateRequest);
      if (!prerequisiteResult.met) {
        return {
          success: false,
          gateId: gateRequest.id,
          approved: false,
          processingTime: Date.now() - startTime,
          error: new Error(`Prerequisites not met: ${prerequisiteResult.missing.join(", ")}`),
          escalationLevel: 0 /* NONE */,
          correlationId
        };
      }
      if (this.config.enableAutoApproval) {
        const autoApprovalResult = await this.checkAutoApproval(gateRequest);
        if (autoApprovalResult.approved) {
          this.logger.info("Gate auto-approved", {
            gateId: gateRequest.id,
            reason: autoApprovalResult.reason,
            correlationId
          });
          return {
            success: true,
            gateId: gateRequest.id,
            approved: true,
            processingTime: Date.now() - startTime,
            escalationLevel: 0 /* NONE */,
            decisionMaker: "system",
            autoApproved: true,
            correlationId
          };
        }
      }
      const escalationChain = options.escalationOverride || gateRequest.escalationChain || this.createDefaultEscalationChain(gateRequest);
      const pendingGate = {
        gateRequest,
        escalationChain,
        correlationId,
        startTime: /* @__PURE__ */ new Date(),
        currentLevel: 0 /* NONE */,
        approvals: [],
        escalations: [],
        status: "pending"
      };
      this.pendingGates.set(gateRequest.id, pendingGate);
      await this.emitGateOpenedEvent(gateRequest, correlationId);
      const validationResult = await this.requestHumanValidation(
        gateRequest,
        escalationChain,
        correlationId
      );
      const finalResult = await this.processEscalationChain(
        gateRequest.id,
        validationResult,
        escalationChain
      );
      await this.emitGateClosedEvent(gateRequest, finalResult, correlationId);
      this.cleanup(gateRequest.id);
      this.logger.info("Workflow gate processing completed", {
        gateId: gateRequest.id,
        approved: finalResult.approved,
        escalationLevel: finalResult.escalationLevel,
        processingTime: Date.now() - startTime,
        correlationId
      });
      return finalResult;
    } catch (error) {
      this.logger.error("Workflow gate processing failed", {
        gateId: gateRequest.id,
        error: error instanceof Error ? error.message : String(error),
        correlationId
      });
      this.cleanup(gateRequest.id);
      return {
        success: false,
        gateId: gateRequest.id,
        approved: false,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error : new Error(String(error)),
        escalationLevel: 0 /* NONE */,
        correlationId
      };
    }
  }
  /**
   * Create a workflow gate request from basic parameters
   */
  createWorkflowGateRequest(workflowId, stepName, gateType, question, context, workflowContext, options = {}) {
    const gateId = `gate-${Date.now()}-${++this.gateCounter}`;
    const fullWorkflowContext = {
      workflowId,
      stepName,
      businessImpact: "medium",
      decisionScope: "task",
      stakeholders: [],
      ...workflowContext
    };
    return {
      // ValidationQuestion base properties
      id: gateId,
      type: "checkpoint",
      question,
      context,
      confidence: 0.8,
      priority: options.priority || "medium",
      validationReason: `Workflow gate for ${stepName}`,
      expectedImpact: options.expectedImpact || 0.1,
      // WorkflowGateRequest specific properties
      workflowContext: fullWorkflowContext,
      gateType,
      escalationChain: options.escalationChain,
      timeoutConfig: options.timeoutConfig,
      integrationConfig: options.integrationConfig
    };
  }
  /**
   * Get status of all pending gates
   */
  getPendingGates() {
    return new Map(this.pendingGates);
  }
  /**
   * Cancel a pending gate request
   */
  async cancelGate(gateId, reason) {
    const pendingGate = this.pendingGates.get(gateId);
    if (!pendingGate) {
      return false;
    }
    this.logger.info("Canceling workflow gate", { gateId, reason });
    this.clearEscalationTimers(gateId);
    pendingGate.status = "cancelled";
    await this.emitGateClosedEvent(
      pendingGate.gateRequest,
      {
        success: false,
        gateId,
        approved: false,
        processingTime: Date.now() - pendingGate.startTime.getTime(),
        escalationLevel: pendingGate.currentLevel,
        error: new Error(`Gate cancelled: ${reason}`),
        correlationId: pendingGate.correlationId
      },
      pendingGate.correlationId
    );
    this.cleanup(gateId);
    return true;
  }
  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================
  async validateGateRequest(gateRequest) {
    try {
      const validatedRequest = this.domainValidator.validateInput(
        gateRequest,
        WorkflowGateRequestSchema
      );
      if (gateRequest.workflowContext.stakeholders.length === 0 && gateRequest.gateType !== "emergency") {
        return {
          success: false,
          error: new Error("Stakeholders are required for non-emergency gates")
        };
      }
      if (gateRequest.workflowContext.deadline && gateRequest.workflowContext.deadline < /* @__PURE__ */ new Date()) {
        return {
          success: false,
          error: new Error("Gate deadline has already passed")
        };
      }
      return {
        success: true,
        data: validatedRequest
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }
  async checkPrerequisites(gateRequest) {
    const prerequisites = gateRequest.conditionalLogic?.prerequisites || [];
    const missing = [];
    for (const prerequisite of prerequisites) {
      const result = await this.evaluateCondition(prerequisite, gateRequest.workflowContext);
      if (!result && prerequisite.required !== false) {
        missing.push(prerequisite.id);
      }
    }
    return {
      met: missing.length === 0,
      missing
    };
  }
  async checkAutoApproval(gateRequest) {
    const autoApprovalConditions = gateRequest.conditionalLogic?.autoApprovalConditions || [];
    if (autoApprovalConditions.length === 0) {
      return { approved: false };
    }
    for (const condition of autoApprovalConditions) {
      const result = await this.evaluateCondition(condition, gateRequest.workflowContext);
      if (result) {
        return {
          approved: true,
          reason: `Auto-approval condition met: ${condition.id}`
        };
      }
    }
    return { approved: false };
  }
  async evaluateCondition(condition, context) {
    try {
      const fieldValue = this.getFieldValue(context, condition.field);
      const expectedValue = condition.value;
      logger.debug("Evaluating condition:", {
        field: condition.field,
        operator: condition.operator,
        fieldValue,
        expectedValue,
        fieldType: typeof fieldValue,
        expectedType: typeof expectedValue
      });
      const result = await this.executeConditionOperator(
        condition.operator,
        fieldValue,
        expectedValue,
        condition
      );
      logger.debug("Condition evaluation result:", {
        field: condition.field,
        operator: condition.operator,
        result,
        metadata: {
          evaluation_time: (/* @__PURE__ */ new Date()).toISOString(),
          context_keys: Object.keys(context || {})
        }
      });
      return result;
    } catch (error) {
      logger.error("Error evaluating condition:", {
        condition,
        error: error.message,
        context_summary: this.summarizeContext(context)
      });
      return condition.operator === "not_exists";
    }
  }
  async executeConditionOperator(operator, fieldValue, expectedValue, condition) {
    switch (operator) {
      case "equals":
        return this.evaluateEquals(fieldValue, expectedValue);
      case "not_equals":
        return !this.evaluateEquals(fieldValue, expectedValue);
      case "greater_than":
        return this.evaluateGreaterThan(fieldValue, expectedValue);
      case "greater_than_or_equal":
        return this.evaluateGreaterThanOrEqual(fieldValue, expectedValue);
      case "less_than":
        return this.evaluateLessThan(fieldValue, expectedValue);
      case "less_than_or_equal":
        return this.evaluateLessThanOrEqual(fieldValue, expectedValue);
      case "contains":
        return this.evaluateContains(fieldValue, expectedValue);
      case "not_contains":
        return !this.evaluateContains(fieldValue, expectedValue);
      case "starts_with":
        return this.evaluateStartsWith(fieldValue, expectedValue);
      case "ends_with":
        return this.evaluateEndsWith(fieldValue, expectedValue);
      case "matches":
        return this.evaluateMatches(fieldValue, expectedValue);
      case "not_matches":
        return !this.evaluateMatches(fieldValue, expectedValue);
      case "exists":
        return this.evaluateExists(fieldValue);
      case "not_exists":
        return !this.evaluateExists(fieldValue);
      case "empty":
        return this.evaluateEmpty(fieldValue);
      case "not_empty":
        return !this.evaluateEmpty(fieldValue);
      case "in":
        return this.evaluateIn(fieldValue, expectedValue);
      case "not_in":
        return !this.evaluateIn(fieldValue, expectedValue);
      case "between":
        return this.evaluateBetween(fieldValue, expectedValue);
      case "type_is":
        return this.evaluateTypeIs(fieldValue, expectedValue);
      case "length_equals":
        return this.evaluateLengthEquals(fieldValue, expectedValue);
      case "length_greater_than":
        return this.evaluateLengthGreaterThan(fieldValue, expectedValue);
      case "length_less_than":
        return this.evaluateLengthLessThan(fieldValue, expectedValue);
      default:
        logger.warn("Unknown condition operator:", operator);
        throw new Error(`Unsupported condition operator: ${operator}`);
    }
  }
  // ==================== CONDITION EVALUATION METHODS ====================
  evaluateEquals(fieldValue, expectedValue) {
    if (fieldValue === null || fieldValue === void 0) {
      return expectedValue === null || expectedValue === void 0;
    }
    if (fieldValue === expectedValue) return true;
    if (typeof fieldValue !== typeof expectedValue) {
      return String(fieldValue) === String(expectedValue);
    }
    return false;
  }
  evaluateGreaterThan(fieldValue, expectedValue) {
    const numField = this.toNumber(fieldValue);
    const numExpected = this.toNumber(expectedValue);
    if (numField === null || numExpected === null) {
      return String(fieldValue) > String(expectedValue);
    }
    return numField > numExpected;
  }
  evaluateGreaterThanOrEqual(fieldValue, expectedValue) {
    return this.evaluateGreaterThan(fieldValue, expectedValue) || this.evaluateEquals(fieldValue, expectedValue);
  }
  evaluateLessThan(fieldValue, expectedValue) {
    const numField = this.toNumber(fieldValue);
    const numExpected = this.toNumber(expectedValue);
    if (numField === null || numExpected === null) {
      return String(fieldValue) < String(expectedValue);
    }
    return numField < numExpected;
  }
  evaluateLessThanOrEqual(fieldValue, expectedValue) {
    return this.evaluateLessThan(fieldValue, expectedValue) || this.evaluateEquals(fieldValue, expectedValue);
  }
  evaluateContains(fieldValue, expectedValue) {
    if (Array.isArray(fieldValue)) {
      return fieldValue.includes(expectedValue);
    }
    if (fieldValue && typeof fieldValue === "object") {
      return Object.prototype.hasOwnProperty.call(fieldValue, expectedValue);
    }
    return String(fieldValue).toLowerCase().includes(String(expectedValue).toLowerCase());
  }
  evaluateStartsWith(fieldValue, expectedValue) {
    return String(fieldValue).toLowerCase().startsWith(String(expectedValue).toLowerCase());
  }
  evaluateEndsWith(fieldValue, expectedValue) {
    return String(fieldValue).toLowerCase().endsWith(String(expectedValue).toLowerCase());
  }
  evaluateMatches(fieldValue, expectedValue) {
    try {
      const regex = new RegExp(String(expectedValue), "i");
      return regex.test(String(fieldValue));
    } catch (error) {
      logger.error("Invalid regex pattern:", expectedValue, error);
      return false;
    }
  }
  evaluateExists(fieldValue) {
    return fieldValue !== void 0 && fieldValue !== null;
  }
  evaluateEmpty(fieldValue) {
    if (fieldValue === null || fieldValue === void 0) return true;
    if (typeof fieldValue === "string") return fieldValue.trim() === "";
    if (Array.isArray(fieldValue)) return fieldValue.length === 0;
    if (typeof fieldValue === "object") return Object.keys(fieldValue).length === 0;
    return false;
  }
  evaluateIn(fieldValue, expectedValue) {
    if (!Array.isArray(expectedValue)) {
      logger.warn('Expected array for "in" operator, got:', typeof expectedValue);
      return false;
    }
    return expectedValue.includes(fieldValue);
  }
  evaluateBetween(fieldValue, expectedValue) {
    if (!Array.isArray(expectedValue) || expectedValue.length !== 2) {
      logger.warn('Expected array of length 2 for "between" operator');
      return false;
    }
    const numField = this.toNumber(fieldValue);
    const minValue = this.toNumber(expectedValue[0]);
    const maxValue = this.toNumber(expectedValue[1]);
    if (numField === null || minValue === null || maxValue === null) {
      return false;
    }
    return numField >= minValue && numField <= maxValue;
  }
  evaluateTypeIs(fieldValue, expectedValue) {
    const actualType = Array.isArray(fieldValue) ? "array" : typeof fieldValue;
    return actualType === String(expectedValue).toLowerCase();
  }
  evaluateLengthEquals(fieldValue, expectedValue) {
    const length = this.getLength(fieldValue);
    return length !== null && length === this.toNumber(expectedValue);
  }
  evaluateLengthGreaterThan(fieldValue, expectedValue) {
    const length = this.getLength(fieldValue);
    const expected = this.toNumber(expectedValue);
    return length !== null && expected !== null && length > expected;
  }
  evaluateLengthLessThan(fieldValue, expectedValue) {
    const length = this.getLength(fieldValue);
    const expected = this.toNumber(expectedValue);
    return length !== null && expected !== null && length < expected;
  }
  // ==================== HELPER METHODS ====================
  toNumber(value) {
    if (typeof value === "number" && !isNaN(value)) return value;
    const parsed = Number(value);
    return isNaN(parsed) ? null : parsed;
  }
  getLength(value) {
    if (typeof value === "string") return value.length;
    if (Array.isArray(value)) return value.length;
    if (value && typeof value === "object") return Object.keys(value).length;
    return null;
  }
  summarizeContext(context) {
    if (!context) return null;
    return {
      keys: Object.keys(context),
      hasData: Object.keys(context).length > 0,
      types: Object.entries(context).reduce((acc, [key, value]) => {
        acc[key] = Array.isArray(value) ? "array" : typeof value;
        return acc;
      }, {})
    };
  }
  getFieldValue(context, field) {
    const parts = field.split(".");
    let value = context;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  }
  createDefaultEscalationChain(gateRequest) {
    const levels = [];
    switch (gateRequest.workflowContext.businessImpact) {
      case "low":
        levels.push({
          level: 1 /* TEAM_LEAD */,
          approvers: ["team-lead"],
          requiredApprovals: 1,
          timeLimit: 36e5
          // 1 hour
        });
        break;
      case "medium":
        levels.push(
          {
            level: 1 /* TEAM_LEAD */,
            approvers: ["team-lead"],
            requiredApprovals: 1,
            timeLimit: 18e5
            // 30 minutes
          },
          {
            level: 2 /* MANAGER */,
            approvers: ["manager"],
            requiredApprovals: 1,
            timeLimit: 36e5
            // 1 hour
          }
        );
        break;
      case "high":
      case "critical":
        levels.push(
          {
            level: 1 /* TEAM_LEAD */,
            approvers: ["team-lead"],
            requiredApprovals: 1,
            timeLimit: 9e5
            // 15 minutes
          },
          {
            level: 2 /* MANAGER */,
            approvers: ["manager"],
            requiredApprovals: 1,
            timeLimit: 18e5
            // 30 minutes
          },
          {
            level: 3 /* DIRECTOR */,
            approvers: ["director"],
            requiredApprovals: 1,
            timeLimit: 36e5
            // 1 hour
          }
        );
        break;
    }
    return {
      id: `escalation-${gateRequest.id}`,
      levels,
      triggers: [
        {
          type: "timeout",
          threshold: "time_limit",
          delay: 0
        },
        {
          type: "business_impact",
          threshold: gateRequest.workflowContext.businessImpact,
          delay: 3e5
          // 5 minutes
        }
      ],
      maxLevel: this.config.maxEscalationLevel || 4 /* EXECUTIVE */
    };
  }
  async requestHumanValidation(gateRequest, escalationChain, correlationId) {
    const validationRequestEvent = createEvent(
      "human.validation.requested",
      "interfaces" /* INTERFACES */,
      {
        payload: {
          requestId: `gate-${gateRequest.id}`,
          validationType: gateRequest.gateType === "approval" ? "approval" : "review",
          context: {
            workflowGate: gateRequest,
            escalationChain
          },
          priority: this.mapPriorityToEventPriority(gateRequest.priority),
          timeout: gateRequest.timeoutConfig?.initialTimeout || this.config.defaultTimeout
        }
      },
      {
        correlationId,
        source: "workflow-gate-processor"
      }
    );
    const eventResult = await this.eventBus.emitEvent(validationRequestEvent);
    if (!eventResult.success) {
      throw new Error(`Failed to emit validation request: ${eventResult.error?.message}`);
    }
    try {
      const response = await this.aguiInterface.askQuestion(gateRequest);
      return {
        approved: this.interpretResponse(response),
        response,
        processingTime: Date.now() - validationRequestEvent.timestamp.getTime(),
        level: 1 /* TEAM_LEAD */,
        // Start with team lead level
        approver: "user"
      };
    } catch (error) {
      throw new Error(
        `Human validation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  async processEscalationChain(gateId, initialResult, escalationChain) {
    const pendingGate = this.pendingGates.get(gateId);
    if (!pendingGate) {
      throw new Error(`Pending gate not found: ${gateId}`);
    }
    if (initialResult.approved) {
      return {
        success: true,
        gateId,
        approved: true,
        processingTime: initialResult.processingTime,
        escalationLevel: initialResult.level,
        decisionMaker: initialResult.approver,
        correlationId: pendingGate.correlationId
      };
    }
    let currentLevel = 1 /* TEAM_LEAD */;
    let finalApproval = false;
    let finalLevel = 0 /* NONE */;
    let decisionMaker = "unknown";
    for (const level of escalationChain.levels) {
      if (level.level <= currentLevel) continue;
      currentLevel = level.level;
      pendingGate.currentLevel = currentLevel;
      this.logger.info("Escalating to level", {
        gateId,
        level: currentLevel,
        approvers: level.approvers
      });
      if (level.timeLimit) {
        this.setEscalationTimer(gateId, level.timeLimit, currentLevel);
      }
      const approval = await this.simulateApprovalAtLevel(level, pendingGate);
      const approvalRecord = {
        approver: approval.approver,
        timestamp: /* @__PURE__ */ new Date(),
        decision: approval.decision,
        comments: approval.comments,
        level: currentLevel,
        responseTime: approval.responseTime
      };
      pendingGate.approvals.push(approvalRecord);
      if (approval.decision === "approve") {
        finalApproval = true;
        finalLevel = currentLevel;
        decisionMaker = approval.approver;
        break;
      } else if (approval.decision === "reject") {
        finalApproval = false;
        finalLevel = currentLevel;
        decisionMaker = approval.approver;
        break;
      }
    }
    this.clearEscalationTimers(gateId);
    return {
      success: true,
      gateId,
      approved: finalApproval,
      processingTime: Date.now() - pendingGate.startTime.getTime(),
      escalationLevel: finalLevel,
      decisionMaker,
      approvalChain: {
        completed: true,
        approved: finalApproval,
        decisionLevel: finalLevel,
        decisionMaker,
        processingTime: Date.now() - pendingGate.startTime.getTime(),
        approvals: pendingGate.approvals,
        escalations: pendingGate.escalations
      },
      correlationId: pendingGate.correlationId
    };
  }
  async simulateApprovalAtLevel(level, pendingGate) {
    const startTime = Date.now();
    const businessImpact = pendingGate.gateRequest.workflowContext.businessImpact;
    const approver = level.approvers[0] || "unknown";
    let decision = "approve";
    let comments = `Approved at ${GateEscalationLevel[level.level]} level`;
    if (businessImpact === "critical" && level.level < 3 /* DIRECTOR */) {
      decision = "escalate";
      comments = "Critical impact requires higher level approval";
    } else if (businessImpact === "high" && level.level < 2 /* MANAGER */) {
      decision = "escalate";
      comments = "High impact requires management approval";
    }
    const responseTime = Date.now() - startTime + 100;
    return {
      decision,
      approver,
      comments,
      responseTime
    };
  }
  async emitGateOpenedEvent(gateRequest, correlationId) {
    const gateOpenedEvent = createEvent(
      "agui.gate.opened",
      "interfaces" /* INTERFACES */,
      {
        payload: {
          gateId: gateRequest.id,
          gateType: gateRequest.gateType,
          requiredApproval: gateRequest.gateType !== "checkpoint",
          context: {
            workflowContext: gateRequest.workflowContext,
            question: gateRequest.question,
            businessImpact: gateRequest.workflowContext.businessImpact
          }
        }
      },
      { correlationId, source: "workflow-gate-processor" }
    );
    const result = await this.eventBus.emitEvent(gateOpenedEvent);
    if (!result.success) {
      this.logger.warn("Failed to emit gate opened event", {
        gateId: gateRequest.id,
        error: result.error?.message
      });
    }
  }
  async emitGateClosedEvent(gateRequest, result, correlationId) {
    const gateClosedEvent = createEvent(
      "agui.gate.closed",
      "interfaces" /* INTERFACES */,
      {
        payload: {
          gateId: gateRequest.id,
          approved: result.approved,
          duration: result.processingTime,
          humanInput: {
            escalationLevel: result.escalationLevel,
            decisionMaker: result.decisionMaker,
            approvalChain: result.approvalChain
          }
        }
      },
      { correlationId, causationId: `gate-${gateRequest.id}` }
    );
    const eventResult = await this.eventBus.emitEvent(gateClosedEvent);
    if (!eventResult.success) {
      this.logger.warn("Failed to emit gate closed event", {
        gateId: gateRequest.id,
        error: eventResult.error?.message
      });
    }
  }
  initializeEventHandlers() {
    this.eventBus.registerHandler(
      "human.validation.completed",
      async (event) => {
        const { requestId, approved, feedback } = event.payload;
        const gateId = requestId.replace("gate-", "");
        const pendingGate = this.pendingGates.get(gateId);
        if (pendingGate) {
          this.logger.debug("Received validation completion for gate", {
            gateId,
            approved,
            feedback
          });
          this.emit("validation-completed", {
            gateId,
            approved,
            feedback,
            processingTime: event.payload.processingTime
          });
        }
      }
    );
  }
  setEscalationTimer(gateId, timeLimit, level) {
    const timerId = setTimeout(() => {
      this.logger.info("Escalation timer triggered", { gateId, level });
      this.emit("escalation-timeout", { gateId, level });
    }, timeLimit);
    const timerKey = `${gateId}-${level}`;
    this.escalationTimers.set(timerKey, timerId);
  }
  clearEscalationTimers(gateId) {
    for (const [key, timerId] of this.escalationTimers.entries()) {
      if (key.startsWith(gateId)) {
        clearTimeout(timerId);
        this.escalationTimers.delete(key);
      }
    }
  }
  cleanup(gateId) {
    this.pendingGates.delete(gateId);
    this.clearEscalationTimers(gateId);
  }
  interpretResponse(response) {
    const positiveResponses = ["yes", "approve", "approved", "accept", "ok", "continue", "1"];
    return positiveResponses.some((pos) => response.toLowerCase().includes(pos));
  }
  mapPriorityToEventPriority(priority) {
    switch (priority) {
      case "critical":
        return 3 /* CRITICAL */;
      case "high":
        return 2 /* HIGH */;
      case "medium":
        return 1 /* NORMAL */;
      case "low":
        return 0 /* LOW */;
      default:
        return 1 /* NORMAL */;
    }
  }
};
function createApprovalGate(workflowId, stepName, question, stakeholders, options = {}) {
  const gateId = `gate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const fullWorkflowContext = {
    workflowId,
    stepName,
    businessImpact: options.businessImpact || "medium",
    decisionScope: "task",
    stakeholders,
    deadline: options.deadline
  };
  return {
    // ValidationQuestion base properties
    id: gateId,
    type: "checkpoint",
    question,
    context: { type: "approval_request" },
    confidence: 0.8,
    priority: options.priority || "medium",
    validationReason: `Workflow gate for ${stepName}`,
    expectedImpact: 0.1,
    // WorkflowGateRequest specific properties
    workflowContext: fullWorkflowContext,
    gateType: "approval"
  };
}
__name(createApprovalGate, "createApprovalGate");
function createCheckpointGate(workflowId, stepName, checkpointData, options = {}) {
  const gateId = `gate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const autoApprovalConditions = [];
  if (options.autoApprovalThreshold) {
    autoApprovalConditions.push({
      id: "confidence_threshold",
      type: "custom",
      operator: "greater_than",
      field: "confidence",
      value: options.autoApprovalThreshold
    });
  }
  const fullWorkflowContext = {
    workflowId,
    stepName,
    businessImpact: options.businessImpact || "low",
    decisionScope: "task",
    stakeholders: ["system"]
  };
  return {
    // ValidationQuestion base properties
    id: gateId,
    type: "checkpoint",
    question: `Checkpoint reached: ${stepName}. Continue?`,
    context: checkpointData,
    confidence: 0.8,
    priority: "medium",
    validationReason: `Workflow gate for ${stepName}`,
    expectedImpact: 0.1,
    // WorkflowGateRequest specific properties
    workflowContext: fullWorkflowContext,
    gateType: "checkpoint",
    conditionalLogic: {
      autoApprovalConditions: autoApprovalConditions.length > 0 ? autoApprovalConditions : void 0
    },
    integrationConfig: {
      domainValidation: true,
      enableMetrics: true
    }
  };
}
__name(createCheckpointGate, "createCheckpointGate");
function createEmergencyGate(workflowId, stepName, emergencyContext, stakeholders) {
  const gateId = `gate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const escalationChain = {
    id: `emergency-${workflowId}-${stepName}`,
    levels: [
      {
        level: 2 /* MANAGER */,
        approvers: stakeholders.slice(0, 1),
        requiredApprovals: 1,
        timeLimit: 3e5
        // 5 minutes
      },
      {
        level: 3 /* DIRECTOR */,
        approvers: stakeholders.slice(1, 2),
        requiredApprovals: 1,
        timeLimit: 6e5
        // 10 minutes
      },
      {
        level: 4 /* EXECUTIVE */,
        approvers: stakeholders.slice(2),
        requiredApprovals: 1,
        timeLimit: 9e5
        // 15 minutes
      }
    ],
    triggers: [
      {
        type: "timeout",
        threshold: "time_limit",
        delay: 0,
        skipLevels: true
      }
    ],
    maxLevel: 4 /* EXECUTIVE */,
    notifyAllLevels: true
  };
  const fullWorkflowContext = {
    workflowId,
    stepName,
    businessImpact: "critical",
    decisionScope: "portfolio",
    stakeholders,
    deadline: new Date(Date.now() + 18e5)
    // 30 minutes from now
  };
  return {
    // ValidationQuestion base properties
    id: gateId,
    type: "checkpoint",
    question: "EMERGENCY: Immediate decision required",
    context: emergencyContext,
    confidence: 0.8,
    priority: "critical",
    validationReason: `Workflow gate for ${stepName}`,
    expectedImpact: 0.9,
    // WorkflowGateRequest specific properties
    workflowContext: fullWorkflowContext,
    gateType: "emergency",
    escalationChain,
    timeoutConfig: {
      initialTimeout: 3e5,
      // 5 minutes
      escalationTimeouts: [3e5, 6e5, 9e5],
      maxTotalTimeout: 18e5
      // 30 minutes total
    }
  };
}
__name(createEmergencyGate, "createEmergencyGate");
var workflow_gate_request_default = WorkflowGateRequestProcessor;
export {
  GateEscalationLevel,
  WorkflowGateRequestProcessor,
  WorkflowGateRequestSchema,
  createApprovalGate,
  createCheckpointGate,
  createEmergencyGate,
  workflow_gate_request_default as default
};
//# sourceMappingURL=workflow-gate-request-N2QXV3I3.js.map
