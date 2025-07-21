"use strict";
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
exports.getSwarmComponents = getSwarmComponents;
// Main exports for the swarm system
__exportStar(require("./coordinator.js"), exports);
__exportStar(require("./executor.js"), exports);
__exportStar(require("./types.js"), exports);
__exportStar(require("./strategies/base.js"), exports);
__exportStar(require("./strategies/auto.js"), exports);
__exportStar(require("./strategies/research.js"), exports);
__exportStar(require("./memory.js"), exports);
// Prompt copying system exports
__exportStar(require("./prompt-copier.js"), exports);
__exportStar(require("./prompt-copier-enhanced.js"), exports);
__exportStar(require("./prompt-utils.js"), exports);
__exportStar(require("./prompt-manager.js"), exports);
__exportStar(require("./prompt-cli.js"), exports);
// Optimizations
__exportStar(require("./optimizations/index.js"), exports);
// Utility function to get all exports
function getSwarmComponents() {
    return {
        // Core components
        coordinator: () => Promise.resolve().then(() => require('./coordinator.js')),
        executor: () => Promise.resolve().then(() => require('./executor.js')),
        types: () => Promise.resolve().then(() => require('./types.js')),
        // Strategies
        strategies: {
            base: () => Promise.resolve().then(() => require('./strategies/base.js')),
            auto: () => Promise.resolve().then(() => require('./strategies/auto.js')),
            research: () => Promise.resolve().then(() => require('./strategies/research.js'))
        },
        // Memory
        memory: () => Promise.resolve().then(() => require('./memory.js')),
        // Prompt system
        promptCopier: () => Promise.resolve().then(() => require('./prompt-copier.js')),
        promptCopierEnhanced: () => Promise.resolve().then(() => require('./prompt-copier-enhanced.js')),
        promptUtils: () => Promise.resolve().then(() => require('./prompt-utils.js')),
        promptManager: () => Promise.resolve().then(() => require('./prompt-manager.js')),
        promptCli: () => Promise.resolve().then(() => require('./prompt-cli.js')),
        // Optimizations
        optimizations: () => Promise.resolve().then(() => require('./optimizations/index.js'))
    };
}
