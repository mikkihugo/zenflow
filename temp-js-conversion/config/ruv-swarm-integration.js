"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuvSwarmConfigHelpers = exports.RuvSwarmIntegration = void 0;
exports.getRuvSwarmIntegration = getRuvSwarmIntegration;
exports.initializeRuvSwarmIntegration = initializeRuvSwarmIntegration;
/**
 * ruv-swarm integration helper for Claude Code configuration
 *
 * This module bridges the main claude-flow configuration with
 * ruv-swarm specific settings and provides utility functions
 * for seamless integration.
 */
const config_manager_js_1 = require("./config-manager.js");
const ruv_swarm_config_js_1 = require("./ruv-swarm-config.js");
// import { createLogger } from '../core/logger.js';
// Create logger for integration
// const logger = createLogger('ruv-swarm-integration');
/**
 * Integration manager that synchronizes configurations
 */
class RuvSwarmIntegration {
    constructor(configManager, ruvSwarmManager) {
        this.configManager = configManager;
        this.ruvSwarmManager = ruvSwarmManager;
    }
    /**
     * Synchronize main config with ruv-swarm config
     */
    syncConfiguration() {
        const mainConfig = this.configManager.getRuvSwarmConfig();
        const ruvSwarmConfig = this.ruvSwarmManager.getConfig();
        // Update ruv-swarm config from main config
        if (mainConfig.enabled) {
            this.ruvSwarmManager.updateSwarmConfig({
                defaultTopology: mainConfig.defaultTopology,
                maxAgents: mainConfig.maxAgents,
                defaultStrategy: mainConfig.defaultStrategy,
                enableHooks: mainConfig.enableHooks
            });
            this.ruvSwarmManager.updateIntegrationConfig({
                enableMCPTools: true,
                enableCLICommands: true,
                enableHooks: mainConfig.enableHooks
            });
            this.ruvSwarmManager.updateMemoryConfig({
                enablePersistence: mainConfig.enablePersistence
            });
            this.ruvSwarmManager.updateNeuralConfig({
                enableTraining: mainConfig.enableNeuralTraining
            });
        }
        // logger.debug('Configuration synchronized between main and ruv-swarm configs');
    }
    /**
     * Get unified command arguments for ruv-swarm CLI
     */
    getUnifiedCommandArgs() {
        const mainArgs = this.configManager.getRuvSwarmArgs();
        const ruvSwarmArgs = this.ruvSwarmManager.getCommandArgs();
        // Main config takes precedence, then ruv-swarm specific
        const unified = [...mainArgs];
        // Add ruv-swarm specific args that aren't in main config
        for (let i = 0; i < ruvSwarmArgs.length; i += 2) {
            const flag = ruvSwarmArgs[i];
            const value = ruvSwarmArgs[i + 1];
            // Skip if already set by main config
            if (!unified.includes(flag)) {
                unified.push(flag, value);
            }
        }
        return unified;
    }
    /**
     * Initialize ruv-swarm integration
     */
    async initialize() {
        try {
            // Check if ruv-swarm is enabled in main config
            if (!this.configManager.isRuvSwarmEnabled()) {
                return {
                    success: false,
                    message: 'ruv-swarm is disabled in main configuration'
                };
            }
            // Sync configurations
            this.syncConfiguration();
            // Validate configurations
            const mainValidation = this.validateMainConfig();
            if (!mainValidation.valid) {
                return {
                    success: false,
                    message: `Main config validation failed: ${mainValidation.errors.join(', ')}`
                };
            }
            const ruvSwarmValidation = this.ruvSwarmManager.validateConfig();
            if (!ruvSwarmValidation.valid) {
                return {
                    success: false,
                    message: `ruv-swarm config validation failed: ${ruvSwarmValidation.errors.join(', ')}`
                };
            }
            // logger.info('ruv-swarm integration initialized successfully');
            return {
                success: true,
                message: 'ruv-swarm integration initialized and configured'
            };
        }
        catch (error) {
            const message = `Failed to initialize ruv-swarm integration: ${error.message}`;
            // logger.error(message, { error });
            return {
                success: false,
                message
            };
        }
    }
    /**
     * Validate main configuration for ruv-swarm compatibility
     */
    validateMainConfig() {
        const errors = [];
        const ruvSwarmConfig = this.configManager.getRuvSwarmConfig();
        // Check required fields
        if (!ruvSwarmConfig.defaultTopology) {
            errors.push('ruvSwarm.defaultTopology is required');
        }
        if (ruvSwarmConfig.maxAgents <= 0) {
            errors.push('ruvSwarm.maxAgents must be greater than 0');
        }
        if (!ruvSwarmConfig.defaultStrategy) {
            errors.push('ruvSwarm.defaultStrategy is required');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * Get current integration status
     */
    getStatus() {
        const mainConfig = this.configManager.getRuvSwarmConfig();
        const ruvSwarmConfig = this.ruvSwarmManager.getConfig();
        return {
            enabled: mainConfig.enabled,
            mainConfig,
            ruvSwarmConfig,
            synchronized: this.isConfigurationSynchronized()
        };
    }
    /**
     * Check if configurations are synchronized
     */
    isConfigurationSynchronized() {
        const mainConfig = this.configManager.getRuvSwarmConfig();
        const ruvSwarmConfig = this.ruvSwarmManager.getConfig();
        return (ruvSwarmConfig.swarm.defaultTopology === mainConfig.defaultTopology &&
            ruvSwarmConfig.swarm.maxAgents === mainConfig.maxAgents &&
            ruvSwarmConfig.swarm.defaultStrategy === mainConfig.defaultStrategy &&
            ruvSwarmConfig.swarm.enableHooks === mainConfig.enableHooks &&
            ruvSwarmConfig.memory.enablePersistence === mainConfig.enablePersistence &&
            ruvSwarmConfig.neural.enableTraining === mainConfig.enableNeuralTraining);
    }
    /**
     * Update configuration and sync
     */
    updateConfiguration(updates) {
        if (updates.main) {
            this.configManager.setRuvSwarmConfig(updates.main);
        }
        if (updates.ruvSwarm) {
            this.ruvSwarmManager.updateConfig(updates.ruvSwarm);
        }
        // Re-sync after updates
        this.syncConfiguration();
    }
}
exports.RuvSwarmIntegration = RuvSwarmIntegration;
/**
 * Create singleton integration instance
 */
let integrationInstance = null;
function getRuvSwarmIntegration() {
    if (!integrationInstance) {
        const ruvSwarmManager = (0, ruv_swarm_config_js_1.getRuvSwarmConfigManager)(logger);
        integrationInstance = new RuvSwarmIntegration(config_manager_js_1.configManager, ruvSwarmManager);
    }
    return integrationInstance;
}
/**
 * Initialize ruv-swarm integration with claude-flow
 */
async function initializeRuvSwarmIntegration() {
    const integration = getRuvSwarmIntegration();
    return integration.initialize();
}
/**
 * Helper functions for CLI commands
 */
class RuvSwarmConfigHelpers {
    /**
     * Quick setup for development environment
     */
    static setupDevelopmentConfig() {
        const integration = getRuvSwarmIntegration();
        integration.updateConfiguration({
            main: {
                enabled: true,
                defaultTopology: 'hierarchical',
                maxAgents: 8,
                defaultStrategy: 'specialized',
                autoInit: true,
                enableHooks: true,
                enablePersistence: true,
                enableNeuralTraining: true
            }
        });
        // logger.info('Development configuration applied');
    }
    /**
     * Quick setup for research environment
     */
    static setupResearchConfig() {
        const integration = getRuvSwarmIntegration();
        integration.updateConfiguration({
            main: {
                enabled: true,
                defaultTopology: 'mesh',
                maxAgents: 12,
                defaultStrategy: 'adaptive',
                autoInit: true,
                enableHooks: true,
                enablePersistence: true,
                enableNeuralTraining: true
            }
        });
        // logger.info('Research configuration applied');
    }
    /**
     * Quick setup for production environment
     */
    static setupProductionConfig() {
        const integration = getRuvSwarmIntegration();
        integration.updateConfiguration({
            main: {
                enabled: true,
                defaultTopology: 'star',
                maxAgents: 6,
                defaultStrategy: 'balanced',
                autoInit: false,
                enableHooks: true,
                enablePersistence: true,
                enableNeuralTraining: false
            }
        });
        // logger.info('Production configuration applied');
    }
    /**
     * Get configuration for specific use case
     */
    static getConfigForUseCase(useCase) {
        const integration = getRuvSwarmIntegration();
        switch (useCase) {
            case 'development':
                return {
                    topology: 'hierarchical',
                    maxAgents: 8,
                    strategy: 'specialized',
                    features: ['hooks', 'persistence', 'neural-training']
                };
            case 'research':
                return {
                    topology: 'mesh',
                    maxAgents: 12,
                    strategy: 'adaptive',
                    features: ['hooks', 'persistence', 'neural-training', 'advanced-metrics']
                };
            case 'production':
                return {
                    topology: 'star',
                    maxAgents: 6,
                    strategy: 'balanced',
                    features: ['hooks', 'persistence']
                };
            default:
                return integration.getStatus().mainConfig;
        }
    }
}
exports.RuvSwarmConfigHelpers = RuvSwarmConfigHelpers;
exports.default = {
    RuvSwarmIntegration,
    getRuvSwarmIntegration,
    initializeRuvSwarmIntegration,
    RuvSwarmConfigHelpers
};
