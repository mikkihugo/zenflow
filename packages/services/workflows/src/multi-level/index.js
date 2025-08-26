"use strict";
/**
 * @fileoverview Multi-Level Orchestration - Integrated with Workflows
 *
 * Consolidated multi-level orchestration functionality that was previously
 * in a separate package. Now integrated directly with the workflows system
 * for unified orchestration capabilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPARCPhase = exports.OrchestrationLevel = void 0;
// Export enums
var types_1 = require("./types");
Object.defineProperty(exports, "OrchestrationLevel", { enumerable: true, get: function () { return types_1.OrchestrationLevel; } });
Object.defineProperty(exports, "SPARCPhase", { enumerable: true, get: function () { return types_1.SPARCPhase; } });
