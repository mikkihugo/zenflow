import { configManager } from './manager.ts';
export { createRepoConfig, defaultRepoConfig, logRepoConfigStatus, validateRepoConfig, } from './default-repo-config.ts';
export { createURLBuilder, DEFAULT_CONFIG, DEFAULT_PORT_ALLOCATION, defaultURLBuilder, ENV_MAPPINGS, getCORSOrigins, getMCPServerURL, getMonitoringDashboardURL, getWebDashboardURL, PORT_ALLOCATION_BY_ENV, PRODUCTION_VALIDATION_SCHEMA, URLBuilder, VALIDATION_RULES, } from './defaults.ts';
export { ConfigHealthChecker, configHealthChecker, createConfigHealthEndpoint, createDeploymentReadinessEndpoint, initializeConfigHealthChecker, } from './health-checker.ts';
export { ConfigurationLoader } from './loader.ts';
export { ConfigurationManager, configManager } from './manager.ts';
export { cli as runStartupValidationCLI, runStartupValidation, validateAndExit, } from './startup-validator.ts';
export { ConfigValidator } from './validator.ts';
export const config = {
    async init(configPaths) {
        return configManager?.initialize(configPaths);
    },
    get(path) {
        return configManager?.get(path);
    },
    getSection(section) {
        return configManager?.getSection(section);
    },
    set(path, value) {
        return configManager?.update(path, value);
    },
    getAll() {
        return configManager?.getConfig();
    },
    validate() {
        return configManager?.validate();
    },
    reload() {
        return configManager?.reload();
    },
    export(format = 'json') {
        return configManager?.export(format);
    },
    onChange(callback) {
        configManager?.on('config:changed', callback);
    },
    removeListener(callback) {
        configManager?.off('config:changed', callback);
    },
    async getHealthReport() {
        const { configHealthChecker } = await import('./health-checker.ts');
        return configHealthChecker?.getHealthReport();
    },
    async isProductionReady() {
        const { configHealthChecker } = await import('./health-checker.ts');
        const deployment = await configHealthChecker?.validateForProduction();
        return deployment.deploymentReady;
    },
    async checkPorts() {
        const { configHealthChecker } = await import('./health-checker.ts');
        return configHealthChecker?.checkPortConflicts();
    },
    async validateStartup(options) {
        const { runStartupValidation } = await import('./startup-validator.ts');
        return runStartupValidation(options);
    },
};
export default config;
//# sourceMappingURL=index.js.map