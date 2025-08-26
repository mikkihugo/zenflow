/**
 * @fileoverview Agent Manager Strategic Facade - Real Package Delegation
 *
 * Strategic facade providing real agent management capabilities through delegation
 * to @claude-zen/agent-manager package.
 */

import { EventEmitter } from "@claude-zen/foundation";
import "./module-declarations";

// Agent manager system access with real package delegation
let agentManagerModuleCache: any = null;

async function loadAgentManagerModule() {
	if (!agentManagerModuleCache) {
		try {
			// Load the real Agent Manager package
			agentManagerModuleCache = await import("@claude-zen/agent-manager");
		} catch {
			console.warn(
				"Agent manager package not available, providing compatibility layer",
			);
			agentManagerModuleCache = {
				AgentManager: class CompatibilityAgentManager extends EventEmitter {
					async initialize() {
						return this;
					}
					async shutdown() {
						return Promise.resolve();
					}
					async createAgent() {
						return { id: "compat-agent", status: "active" };
					}
					async destroyAgent() {
						return Promise.resolve();
					}
					async getAgent() {
						return { id: "compat-agent", status: "active" };
					}
					async listAgents() {
						return [];
					}
				},
				AgentFactory: class CompatibilityAgentFactory {
					static createAgent() {
						return { id: "compat-agent", status: "active" };
					}
				},
				AgentRegistry: class CompatibilityAgentRegistry extends EventEmitter {
					async register() {
						return Promise.resolve();
					}
					async unregister() {
						return Promise.resolve();
					}
					async get() {
						return { id: "compat-agent", status: "active" };
					}
					async list() {
						return [];
					}
				},
				AgentLifecycleManager: class CompatibilityLifecycleManager extends EventEmitter {
					async start() {
						return Promise.resolve();
					}
					async stop() {
						return Promise.resolve();
					}
					async restart() {
						return Promise.resolve();
					}
					async getStatus() {
						return "active";
					}
				},
			};
		}
	}
	return agentManagerModuleCache;
}

// ===============================================================================
// REAL AGENT MANAGER PACKAGE EXPORTS - Direct delegation to actual implementations
// ===============================================================================

export const getAgentManager = async (config?: any) => {
	const module = await loadAgentManagerModule();
	return new module.AgentManager(config);
};

export const getAgentFactory = async () => {
	const module = await loadAgentManagerModule();
	return module.AgentFactory;
};

export const getAgentRegistry = async (config?: any) => {
	const module = await loadAgentManagerModule();
	return new module.AgentRegistry(config);
};

export const getAgentLifecycleManager = async (config?: any) => {
	const module = await loadAgentManagerModule();
	return new module.AgentLifecycleManager(config);
};

// Static exports for immediate use (with fallback)
// Agent manager implementations are accessed via the facade functions above
// Static exports removed to avoid module not found errors
// All functionality is available through getAgentManager() and related functions
