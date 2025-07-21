"use strict";
/**
 * Hive Mind Module Export
 *
 * Main entry point for the Hive Mind collective intelligence system
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.ConsensusEngine = exports.SwarmOrchestrator = exports.MCPToolWrapper = exports.DatabaseManager = exports.Communication = exports.Memory = exports.Agent = exports.Queen = exports.HiveMind = void 0;
// Core classes
var HiveMind_js_1 = require("./core/HiveMind.js");
Object.defineProperty(exports, "HiveMind", { enumerable: true, get: function () { return HiveMind_js_1.HiveMind; } });
var Queen_js_1 = require("./core/Queen.js");
Object.defineProperty(exports, "Queen", { enumerable: true, get: function () { return Queen_js_1.Queen; } });
var Agent_js_1 = require("./core/Agent.js");
Object.defineProperty(exports, "Agent", { enumerable: true, get: function () { return Agent_js_1.Agent; } });
var Memory_js_1 = require("./core/Memory.js");
Object.defineProperty(exports, "Memory", { enumerable: true, get: function () { return Memory_js_1.Memory; } });
var Communication_js_1 = require("./core/Communication.js");
Object.defineProperty(exports, "Communication", { enumerable: true, get: function () { return Communication_js_1.Communication; } });
var DatabaseManager_js_1 = require("./core/DatabaseManager.js");
Object.defineProperty(exports, "DatabaseManager", { enumerable: true, get: function () { return DatabaseManager_js_1.DatabaseManager; } });
// Integration layer
var MCPToolWrapper_js_1 = require("./integration/MCPToolWrapper.js");
Object.defineProperty(exports, "MCPToolWrapper", { enumerable: true, get: function () { return MCPToolWrapper_js_1.MCPToolWrapper; } });
var SwarmOrchestrator_js_1 = require("./integration/SwarmOrchestrator.js");
Object.defineProperty(exports, "SwarmOrchestrator", { enumerable: true, get: function () { return SwarmOrchestrator_js_1.SwarmOrchestrator; } });
var ConsensusEngine_js_1 = require("./integration/ConsensusEngine.js");
Object.defineProperty(exports, "ConsensusEngine", { enumerable: true, get: function () { return ConsensusEngine_js_1.ConsensusEngine; } });
// Types
__exportStar(require("./types.js"), exports);
// Default export
var HiveMind_js_2 = require("./core/HiveMind.js");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return HiveMind_js_2.HiveMind; } });
