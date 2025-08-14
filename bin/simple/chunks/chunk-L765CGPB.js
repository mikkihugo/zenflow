
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  configManager
} from "./chunk-FM4MP6XX.js";

// src/config/index.ts
var config = {
  /**
   * Initialize configuration system.
   *
   * @param configPaths
   */
  async init(configPaths) {
    return configManager?.initialize(configPaths);
  },
  /**
   * Get configuration value.
   *
   * @param path
   */
  get(path) {
    return configManager?.get(path);
  },
  /**
   * Get configuration section.
   *
   * @param section
   */
  getSection(section) {
    return configManager?.getSection(section);
  },
  /**
   * Update configuration value.
   *
   * @param path
   * @param value
   */
  set(path, value) {
    return configManager?.update(path, value);
  },
  /**
   * Get full configuration.
   */
  getAll() {
    return configManager?.getConfig();
  },
  /**
   * Validate configuration.
   */
  validate() {
    return configManager?.validate();
  },
  /**
   * Reload from sources.
   */
  reload() {
    return configManager?.reload();
  },
  /**
   * Export configuration.
   *
   * @param format
   */
  export(format = "json") {
    return configManager?.export(format);
  },
  /**
   * Listen for configuration changes.
   *
   * @param callback
   */
  onChange(callback) {
    configManager?.on("config:changed", callback);
  },
  /**
   * Remove change listener.
   *
   * @param callback
   */
  removeListener(callback) {
    configManager?.off("config:changed", callback);
  },
  /**
   * Get configuration health report.
   */
  async getHealthReport() {
    const { configHealthChecker: configHealthChecker2 } = await import("./health-checker-YXWTKWL3.js");
    return configHealthChecker2?.getHealthReport();
  },
  /**
   * Check if configuration is production ready.
   */
  async isProductionReady() {
    const { configHealthChecker: configHealthChecker2 } = await import("./health-checker-YXWTKWL3.js");
    const deployment = await configHealthChecker2?.validateForProduction();
    return deployment.deploymentReady;
  },
  /**
   * Check for port conflicts.
   */
  async checkPorts() {
    const { configHealthChecker: configHealthChecker2 } = await import("./health-checker-YXWTKWL3.js");
    return configHealthChecker2?.checkPortConflicts();
  },
  /**
   * Run startup validation.
   *
   * @param options
   */
  async validateStartup(options) {
    const { runStartupValidation: runStartupValidation2 } = await import("./startup-validator-7ES2KBYW.js");
    return runStartupValidation2(options);
  }
};

export {
  config
};
//# sourceMappingURL=chunk-L765CGPB.js.map
