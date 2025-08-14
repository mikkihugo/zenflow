
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  DEFAULT_CONFIG,
  ENV_MAPPINGS,
  VALIDATION_RULES
} from "./chunk-IOXRBPWU.js";
import {
  getLogger
} from "./chunk-NECHN6IW.js";
import {
  __name
} from "./chunk-O4JO3PGD.js";

// src/config/health-checker.ts
import { EventEmitter as EventEmitter2 } from "node:events";

// src/config/manager.ts
import { EventEmitter } from "node:events";
import * as fs2 from "node:fs";
import * as path2 from "node:path";

// src/config/loader.ts
import * as fs from "node:fs";
import * as path from "node:path";

// src/config/validator.ts
var ConfigValidator = class {
  static {
    __name(this, "ConfigValidator");
  }
  /**
   * Validate configuration object.
   *
   * @param config
   */
  validate(config) {
    const errors = [];
    const warnings = [];
    try {
      this.validateStructure(config, errors);
      this.validateRules(config, errors, warnings);
      this.validateDependencies(config, errors, warnings);
      this.validateConstraints(config, errors, warnings);
    } catch (error) {
      errors.push(`Validation error: ${error}`);
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  /**
   * Validate basic structure.
   *
   * @param config
   * @param errors
   */
  validateStructure(config, errors) {
    const requiredSections = [
      "core",
      "interfaces",
      "storage",
      "coordination",
      "neural",
      "optimization"
    ];
    for (const section of requiredSections) {
      if (!config?.[section]) {
        errors.push(`Missing required configuration section: ${section}`);
      }
    }
    if (config?.core) {
      if (!config?.core?.logger) {
        errors.push("Missing core.logger configuration");
      }
      if (!config?.core?.performance) {
        errors.push("Missing core.performance configuration");
      }
      if (!config?.core?.security) {
        errors.push("Missing core.security configuration");
      }
    }
    if (config?.interfaces) {
      const requiredInterfaces = ["shared", "terminal", "web", "mcp"];
      for (const iface of requiredInterfaces) {
        if (!config?.interfaces?.[iface]) {
          errors.push(`Missing interfaces.${iface} configuration`);
        }
      }
    }
    if (config?.storage) {
      if (!config?.storage?.memory) {
        errors.push("Missing storage.memory configuration");
      }
      if (!config?.storage?.database) {
        errors.push("Missing storage.database configuration");
      }
    }
  }
  /**
   * Validate against specific rules.
   *
   * @param config
   * @param errors
   * @param warnings
   */
  validateRules(config, errors, warnings) {
    for (const [path3, rule] of Object.entries(VALIDATION_RULES)) {
      const value = this.getNestedValue(config, path3);
      if (value === void 0) {
        warnings.push(`Optional configuration missing: ${path3}`);
        continue;
      }
      if (rule.type === "string" && typeof value !== "string") {
        errors.push(`${path3} must be a string, got ${typeof value}`);
        continue;
      }
      if (rule.type === "number" && typeof value !== "number") {
        errors.push(`${path3} must be a number, got ${typeof value}`);
        continue;
      }
      if ("type" in rule && rule.type && rule.type === "boolean" && typeof value !== "boolean") {
        errors.push(`${path3} must be a boolean, got ${typeof value}`);
        continue;
      }
      if ("enum" in rule && rule.enum && Array.isArray(rule.enum)) {
        if (!rule.enum.includes(value)) {
          errors.push(`${path3} must be one of: ${rule.enum.join(", ")}, got ${value}`);
        }
      }
      if (rule.type === "number" && typeof value === "number") {
        if ("min" in rule && rule.min !== void 0 && value < rule.min) {
          errors.push(`${path3} must be >= ${rule.min}, got ${value}`);
        }
        if ("max" in rule && rule.max !== void 0 && value > rule.max) {
          errors.push(`${path3} must be <= ${rule.max}, got ${value}`);
        }
      }
    }
  }
  /**
   * Validate configuration dependencies.
   *
   * @param config
   * @param errors
   * @param warnings
   */
  validateDependencies(config, errors, warnings) {
    if (config?.interfaces?.web?.enableHttps && !config?.interfaces?.web?.corsOrigins) {
      warnings.push("HTTPS enabled but no CORS origins configured");
    }
    if (config?.neural?.enableCUDA && !config?.neural?.enableWASM) {
      warnings.push("CUDA enabled without WASM - may not be supported");
    }
    if (config?.storage?.memory?.backend === "lancedb" && !config?.storage?.database?.lancedb) {
      errors.push("LanceDB backend selected but lancedb configuration missing");
    }
    if (config?.interfaces?.mcp?.tools?.enableAll && config?.interfaces?.mcp?.tools?.disabledTools?.length > 0) {
      warnings.push("enableAll is true but some tools are disabled");
    }
    if (!config?.core?.security?.enableSandbox && config?.core?.security?.allowShellAccess) {
      warnings.push("Shell access enabled without sandbox - security risk");
    }
    if (config?.core?.performance?.enableProfiling && !config?.core?.performance?.enableMetrics) {
      warnings.push("Profiling enabled without metrics - limited functionality");
    }
  }
  /**
   * Validate constraints and logical consistency.
   *
   * @param config
   * @param errors
   * @param warnings
   */
  validateConstraints(config, errors, warnings) {
    const ports = [config?.interfaces?.web?.port, config?.interfaces?.mcp?.http?.port].filter(
      Boolean
    );
    const uniquePorts = new Set(ports);
    if (ports.length !== uniquePorts.size) {
      errors.push("Port conflicts detected - multiple services cannot use the same port");
    }
    if (config?.storage?.memory?.maxMemorySize && config?.storage?.memory?.cacheSize) {
      if (config?.storage?.memory?.cacheSize > config?.storage?.memory?.maxMemorySize) {
        errors.push("Cache size cannot be larger than max memory size");
      }
    }
    if (config?.coordination?.maxAgents && config?.coordination?.maxAgents > 1e3) {
      warnings.push("Very high agent count may impact performance");
    }
    const timeouts = [
      config?.interfaces?.terminal?.timeout,
      config?.interfaces?.mcp?.http?.timeout,
      config?.coordination?.timeout
    ].filter(Boolean);
    for (const timeout of timeouts) {
      if (timeout < 1e3) {
        warnings.push(`Very low timeout value (${timeout}ms) may cause issues`);
      }
      if (timeout > 3e5) {
        warnings.push(`Very high timeout value (${timeout}ms) may cause hangs`);
      }
    }
    const directories = [
      config?.storage?.memory?.directory,
      config?.storage?.database?.sqlite?.path,
      config?.storage?.database?.lancedb?.path,
      config?.neural?.modelPath
    ].filter(Boolean);
    for (const dir of directories) {
      if (dir.includes("..")) {
        warnings.push(`Directory path contains '..' - potential security risk: ${dir}`);
      }
    }
  }
  /**
   * Get nested value using dot notation.
   *
   * @param obj
   * @param path
   */
  getNestedValue(obj, path3) {
    return path3.split(".").reduce((current, key) => current?.[key], obj);
  }
  /**
   * Validate specific configuration section.
   *
   * @param _config
   * @param section
   */
  validateSection(_config, section) {
    const errors = [];
    const warnings = [];
    const sectionRules = Object.entries(VALIDATION_RULES).filter(
      ([path3]) => path3.startsWith(`${section}.`)
    );
    for (const [_path, _rule] of sectionRules) {
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  /**
   * Enhanced validation with production readiness check.
   *
   * @param config - System configuration to validate.
   * @returns Enhanced validation result with production readiness details.
   */
  validateEnhanced(config) {
    const basicResult = this.validate(config);
    const securityIssues = [];
    const portConflicts = [];
    const performanceWarnings = [];
    const failsafeApplied = [];
    if (!config?.core?.security?.enableSandbox && config?.core?.security?.allowShellAccess) {
      securityIssues.push("Shell access enabled without sandbox protection");
    }
    if (config?.core?.security?.trustedHosts?.length === 0) {
      securityIssues.push("No trusted hosts configured for security");
    }
    const ports = [
      config?.interfaces?.web?.port,
      config?.interfaces?.mcp?.http?.port,
      config?.monitoring?.dashboard?.port
    ].filter((port) => typeof port === "number");
    const uniquePorts = new Set(ports);
    if (ports.length !== uniquePorts.size) {
      portConflicts.push("Multiple services configured to use the same port");
    }
    if (config?.coordination?.maxAgents && config?.coordination?.maxAgents > 1e3) {
      performanceWarnings.push("High agent count may impact performance");
    }
    if (config?.core?.logger?.level === "debug") {
      performanceWarnings.push("Debug logging enabled - may impact performance");
    }
    const productionReady = basicResult?.valid && securityIssues.length === 0 && portConflicts.length === 0 && config?.core?.security?.enableSandbox === true;
    const result = {
      valid: basicResult?.valid,
      errors: basicResult?.errors,
      warnings: basicResult?.warnings,
      productionReady,
      securityIssues,
      portConflicts,
      performanceWarnings,
      failsafeApplied
    };
    return result;
  }
  /**
   * Get configuration health report.
   *
   * @param config
   */
  getHealthReport(config) {
    const result = this.validateEnhanced(config);
    const recommendations = [];
    const structureScore = result?.errors.length === 0 ? 100 : Math.max(0, 100 - result?.errors.length * 10);
    const securityScore = result?.securityIssues.length === 0 ? 100 : Math.max(0, 100 - result?.securityIssues.length * 20);
    const performanceScore = result?.performanceWarnings.length === 0 ? 100 : Math.max(0, 100 - result?.performanceWarnings.length * 5);
    const productionScore = result?.productionReady ? 100 : 50;
    const overallScore = (structureScore + securityScore + performanceScore + productionScore) / 4;
    if (result?.errors.length > 0) {
      recommendations.push("Fix configuration errors before deployment");
    }
    if (result?.securityIssues.length > 0) {
      recommendations.push("Address security issues for production deployment");
    }
    if (result?.portConflicts.length > 0) {
      recommendations.push("Resolve port conflicts between services");
    }
    if (result?.performanceWarnings.length > 0) {
      recommendations.push("Review performance configuration for optimization");
    }
    const status = overallScore >= 90 ? "healthy" : overallScore >= 70 ? "warning" : "critical";
    return {
      status,
      score: Math.round(overallScore),
      details: {
        structure: result?.errors.length === 0,
        security: result?.securityIssues.length === 0,
        performance: result?.performanceWarnings.length < 3,
        production: result?.productionReady
      },
      recommendations
    };
  }
};

// src/config/loader.ts
var logger = getLogger("ConfigLoader");
var ConfigurationLoader = class {
  static {
    __name(this, "ConfigurationLoader");
  }
  sources = [];
  validator = new ConfigValidator();
  /**
   * Load configuration from all sources.
   *
   * @param configPaths
   */
  async loadConfiguration(configPaths) {
    this.sources = [];
    this.addSource({
      type: "defaults",
      priority: 0,
      data: DEFAULT_CONFIG
    });
    const defaultPaths = [
      "./config/claude-zen.json",
      "./claude-zen.config.json",
      "~/.claude-zen/config.json",
      "/etc/claude-zen/config.json"
    ];
    const pathsToTry = configPaths || defaultPaths;
    for (const configPath of pathsToTry) {
      await this.loadFromFile(configPath);
    }
    this.loadFromEnvironment();
    this.loadFromCliArgs();
    const mergedConfig = this.mergeSources();
    const validation = this.validator.validate(mergedConfig);
    return {
      config: mergedConfig,
      validation
    };
  }
  /**
   * Add a configuration source.
   *
   * @param source
   */
  addSource(source) {
    this.sources.push(source);
    this.sources.sort((a, b) => a.priority - b.priority);
  }
  /**
   * Load configuration from file.
   *
   * @param filePath
   */
  async loadFromFile(filePath) {
    try {
      const resolvedPath = path.resolve(filePath.replace("~", process.env["HOME"] || "~"));
      if (!fs.existsSync(resolvedPath)) {
        return;
      }
      const content = fs.readFileSync(resolvedPath, "utf8");
      let data;
      if (filePath.endsWith(".json")) {
        data = JSON.parse(content);
      } else if (filePath.endsWith(".js") || filePath.endsWith(".ts")) {
        const module = await import(resolvedPath);
        data = module.default || module;
      } else {
        logger.warn(`Unsupported config file format: ${filePath}`);
        return;
      }
      this.addSource({
        type: "file",
        priority: 10,
        data
      });
    } catch (error) {
      logger.warn(`Failed to load config from ${filePath}:`, error);
    }
  }
  /**
   * Load configuration from environment variables.
   */
  loadFromEnvironment() {
    const envConfig = {};
    for (const [envVar, mapping] of Object.entries(ENV_MAPPINGS)) {
      const value = process.env[envVar];
      if (value !== void 0) {
        let parsedValue = value;
        switch (mapping.type) {
          case "number":
            parsedValue = Number(value);
            if (Number.isNaN(parsedValue)) {
              logger.warn(`Invalid number value for ${envVar}: ${value}`);
              continue;
            }
            break;
          case "boolean":
            parsedValue = value.toLowerCase() === "true" || value === "1";
            break;
          case "array":
            if (mapping.parser) {
              parsedValue = mapping.parser(value);
            } else {
              parsedValue = value.split(",").map((v) => v.trim());
            }
            break;
          default:
            parsedValue = value;
            break;
        }
        this.setNestedProperty(envConfig, mapping.path, parsedValue);
      }
    }
    if (Object.keys(envConfig).length > 0) {
      this.addSource({
        type: "env",
        priority: 20,
        data: envConfig
      });
    }
  }
  /**
   * Load configuration from CLI arguments.
   */
  loadFromCliArgs() {
    const args = process.argv.slice(2);
    const cliConfig = {};
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg?.startsWith("--config.")) {
        const configPath = arg.substring(9);
        const value = args[i + 1];
        if (value && !value.startsWith("--")) {
          let parsedValue = value;
          if (value.startsWith("{") || value.startsWith("[")) {
            try {
              parsedValue = JSON.parse(value);
            } catch {
            }
          } else if (value === "true" || value === "false") {
            parsedValue = value === "true";
          } else if (!Number.isNaN(Number(value))) {
            parsedValue = Number(value);
          }
          this.setNestedProperty(cliConfig, configPath, parsedValue);
          i++;
        }
      }
    }
    if (Object.keys(cliConfig).length > 0) {
      this.addSource({
        type: "cli",
        priority: 30,
        data: cliConfig
      });
    }
  }
  /**
   * Merge all configuration sources by priority.
   */
  mergeSources() {
    let mergedConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    for (const source of this.sources) {
      mergedConfig = this.deepMerge(mergedConfig, source.data);
    }
    return mergedConfig;
  }
  /**
   * Deep merge two objects.
   *
   * @param target
   * @param source
   */
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result?.[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
  /**
   * Set nested property using dot notation.
   *
   * @param obj
   * @param path
   * @param value
   */
  setNestedProperty(obj, path3, value) {
    const parts = path3.split(".");
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (part && (!(part in current) || typeof current?.[part] !== "object")) {
        current[part] = {};
      }
      if (part) {
        current = current?.[part];
      }
    }
    const lastPart = parts[parts.length - 1];
    if (lastPart) {
      current[lastPart] = value;
    }
  }
  /**
   * Get configuration sources for debugging.
   */
  getSources() {
    return [...this.sources];
  }
};

// src/config/manager.ts
var logger2 = getLogger("src-config-manager");
var ConfigurationManager = class _ConfigurationManager extends EventEmitter {
  static {
    __name(this, "ConfigurationManager");
  }
  static instance = null;
  config;
  loader = new ConfigurationLoader();
  validator = new ConfigValidator();
  configPaths = [];
  watchers = [];
  configHistory = [];
  maxHistorySize = 10;
  isLoading = false;
  constructor() {
    super();
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    this.setupErrorHandling();
  }
  /**
   * Get singleton instance.
   */
  static getInstance() {
    if (!_ConfigurationManager.instance) {
      _ConfigurationManager.instance = new _ConfigurationManager();
    }
    return _ConfigurationManager.instance;
  }
  /**
   * Initialize configuration system.
   *
   * @param configPaths
   */
  async initialize(configPaths) {
    if (this.isLoading) {
      throw new Error("Configuration is already being loaded");
    }
    this.isLoading = true;
    try {
      const result = await this.loader.loadConfiguration(configPaths);
      if (!result?.validation?.valid) {
        logger2.error("\u274C Configuration validation failed:");
        result?.validation?.errors?.forEach((error) => logger2.error(`  - ${error}`));
        if (result?.validation?.warnings.length > 0) {
          logger2.warn("\u26A0\uFE0F Configuration warnings:");
          result?.validation?.warnings?.forEach((warning) => logger2.warn(`  - ${warning}`));
        }
        this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      } else {
        this.config = result?.config;
        if (result?.validation?.warnings.length > 0) {
          logger2.warn("\u26A0\uFE0F Configuration warnings:");
          result?.validation?.warnings?.forEach((warning) => logger2.warn(`  - ${warning}`));
        }
      }
      this.configPaths = configPaths || [];
      this.setupFileWatchers();
      this.addToHistory(this.config);
      this.emit("config:loaded", {
        config: this.config,
        validation: result?.validation
      });
      return result?.validation;
    } finally {
      this.isLoading = false;
    }
  }
  /**
   * Get current configuration.
   */
  getConfig() {
    return JSON.parse(JSON.stringify(this.config));
  }
  /**
   * Get configuration section.
   *
   * @param section
   */
  getSection(section) {
    return JSON.parse(JSON.stringify(this.config[section]));
  }
  /**
   * Get nested configuration value.
   *
   * @param path
   */
  get(path3) {
    return path3.split(".").reduce((current, key) => current?.[key], this.config);
  }
  /**
   * Update configuration (runtime only).
   *
   * @param path
   * @param value.
   * @param value
   */
  update(path3, value) {
    const oldValue = this.get(path3);
    const testConfig = JSON.parse(JSON.stringify(this.config));
    this.setNestedValue(testConfig, path3, value);
    const validation = this.validator.validate(testConfig);
    if (!validation.valid) {
      return validation;
    }
    this.setNestedValue(this.config, path3, value);
    this.addToHistory(this.config);
    const changeEvent = {
      path: path3,
      oldValue,
      newValue: value,
      source: "runtime",
      timestamp: Date.now()
    };
    this.emit("config:changed", changeEvent);
    return validation;
  }
  /**
   * Reload configuration from sources.
   */
  async reload() {
    return this.initialize(this.configPaths);
  }
  /**
   * Validate current configuration.
   */
  validate() {
    return this.validator.validate(this.config);
  }
  /**
   * Get configuration history.
   */
  getHistory() {
    return [...this.configHistory];
  }
  /**
   * Rollback to previous configuration.
   *
   * @param steps
   */
  rollback(steps = 1) {
    if (this.configHistory.length <= steps) {
      return false;
    }
    const targetConfig = this.configHistory[this.configHistory.length - steps - 1];
    const validation = targetConfig ? this.validator.validate(targetConfig) : { valid: false, errors: ["Invalid target config"] };
    if (!validation.valid) {
      logger2.error("Cannot rollback to invalid configuration");
      return false;
    }
    this.config = JSON.parse(JSON.stringify(targetConfig));
    this.emit("config:rollback", { config: this.config, steps });
    return true;
  }
  /**
   * Export current configuration.
   *
   * @param format
   */
  export(format = "json") {
    if (format === "json") {
      return JSON.stringify(this.config, null, 2);
    } else {
      return this.toSimpleYaml(this.config);
    }
  }
  /**
   * Get configuration sources info.
   */
  getSourcesInfo() {
    return this.loader.getSources();
  }
  /**
   * Cleanup resources.
   */
  destroy() {
    this.watchers.forEach((watcher) => watcher.close());
    this.watchers = [];
    this.configHistory = [];
    this.removeAllListeners();
    _ConfigurationManager.instance = null;
  }
  /**
   * Setup file watchers for hot-reloading.
   */
  setupFileWatchers() {
    this.watchers.forEach((watcher) => watcher.close());
    this.watchers = [];
    const configFiles = [
      "./config/claude-zen.json",
      "./claude-zen.config.json",
      ...this.configPaths
    ];
    for (const configFile of configFiles) {
      try {
        const resolvedPath = path2.resolve(configFile);
        if (fs2.existsSync(resolvedPath)) {
          const watcher = fs2.watch(resolvedPath, (eventType) => {
            if (eventType === "change") {
              setTimeout(() => {
                this.reload().catch((error) => {
                  logger2.error("Failed to reload configuration:", error);
                });
              }, 1e3);
            }
          });
          this.watchers.push(watcher);
        }
      } catch (error) {
        logger2.warn(`Failed to watch config file ${configFile}:`, error);
      }
    }
  }
  /**
   * Setup error handling.
   */
  setupErrorHandling() {
    this.on("error", (error) => {
      logger2.error("Configuration manager error:", error);
    });
    process.on("SIGINT", () => this.destroy());
    process.on("SIGTERM", () => this.destroy());
  }
  /**
   * Add configuration to history.
   *
   * @param config
   */
  addToHistory(config) {
    this.configHistory.push(JSON.parse(JSON.stringify(config)));
    if (this.configHistory.length > this.maxHistorySize) {
      this.configHistory = this.configHistory.slice(-this.maxHistorySize);
    }
  }
  /**
   * Set nested value using dot notation.
   *
   * @param obj
   * @param path
   * @param value
   */
  setNestedValue(obj, path3, value) {
    const parts = path3.split(".");
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (part && (!(part in current) || typeof current?.[part] !== "object")) {
        current[part] = {};
      }
      if (part) {
        current = current?.[part];
      }
    }
    const lastPart = parts[parts.length - 1];
    if (lastPart) {
      current[lastPart] = value;
    }
  }
  /**
   * Simple YAML export (basic implementation).
   *
   * @param obj
   * @param indent.
   * @param indent
   */
  toSimpleYaml(obj, indent = 0) {
    const spaces = "  ".repeat(indent);
    let yaml = "";
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        yaml += `${spaces}${key}:
${this.toSimpleYaml(value, indent + 1)}`;
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:
`;
        for (const item of value) {
          yaml += `${spaces}  - ${item}
`;
        }
      } else {
        yaml += `${spaces}${key}: ${JSON.stringify(value)}
`;
      }
    }
    return yaml;
  }
};
var configManager = ConfigurationManager.getInstance();

// src/config/default-repo-config.ts
function logRepoConfigStatus(config) {
  const logger3 = console;
  logger3.log("\u{1F680} Repository Configuration:");
  logger3.log(`   Repository: ${config.repoName} (${config.repoPath})`);
  logger3.log(`   Advanced Kanban Flow: ${config.enableAdvancedKanbanFlow ? "\u2705 ENABLED" : "\u274C DISABLED"}`);
  logger3.log(`   ML Optimization: ${config.enableMLOptimization ? "\u2705 ENABLED" : "\u274C DISABLED"} (Level: ${config.mlOptimizationLevel})`);
  logger3.log(`   Bottleneck Detection: ${config.enableBottleneckDetection ? "\u2705 ENABLED" : "\u274C DISABLED"}`);
  logger3.log(`   Predictive Analytics: ${config.enablePredictiveAnalytics ? "\u2705 ENABLED" : "\u274C DISABLED"}`);
  logger3.log(`   Real-Time Monitoring: ${config.enableRealTimeMonitoring ? "\u2705 ENABLED" : "\u274C DISABLED"}`);
  logger3.log(`   Resource Management: ${config.enableIntelligentResourceManagement ? "\u2705 ENABLED" : "\u274C DISABLED"}`);
  logger3.log(`   AGUI Gates: ${config.enableAGUIGates ? "\u2705 ENABLED" : "\u274C DISABLED"}`);
  logger3.log(`   Cross-Level Optimization: ${config.enableCrossLevelOptimization ? "\u2705 ENABLED" : "\u274C DISABLED"}`);
  logger3.log(`   DSPy Neural Enhancement: ${config.dsyIntegration.enabled ? "\u2705 ENABLED" : "\u274C DISABLED"}`);
  logger3.log(`   Auto-Discovery: ${config.autoDiscovery.enabled ? "\u2705 ENABLED" : "\u274C DISABLED"} (Confidence: ${config.autoDiscovery.confidenceThreshold})`);
  logger3.log(`   Knowledge Systems: FACT=${config.knowledgeSystems.factEnabled ? "\u2705" : "\u274C"}, RAG=${config.knowledgeSystems.ragEnabled ? "\u2705" : "\u274C"}, WASM=${config.knowledgeSystems.wasmAcceleration ? "\u2705" : "\u274C"}`);
  logger3.log(`   Flow Topology: ${config.flowTopology}`);
  logger3.log(`   Parallel Streams: Portfolio=${config.maxParallelStreams.portfolio}, Program=${config.maxParallelStreams.program}, Swarm=${config.maxParallelStreams.swarm}`);
  logger3.log("\u2705 All advanced features enabled with adaptive 8GB base configuration!");
  logger3.log("\u{1F504} System will auto-scale based on detected memory and performance!");
}
__name(logRepoConfigStatus, "logRepoConfigStatus");

// src/config/health-checker.ts
var ConfigHealthChecker = class extends EventEmitter2 {
  static {
    __name(this, "ConfigHealthChecker");
  }
  validator = new ConfigValidator();
  lastHealthReport = null;
  monitoringInterval = null;
  healthCheckFrequency = 3e4;
  // 30 seconds
  environment = "development";
  /**
   * Initialize health checker with monitoring.
   *
   * @param options - Configuration options.
   * @param options.enableMonitoring
   * @param options.healthCheckFrequency
   */
  async initialize(options = {}) {
    const { enableMonitoring = true, healthCheckFrequency = 3e4 } = options;
    this.healthCheckFrequency = healthCheckFrequency;
    await this.performHealthCheck();
    configManager?.on("config:changed", () => {
      this.performHealthCheck().catch((error) => {
        this.emit("error", error);
      });
    });
    configManager?.on("config:loaded", () => {
      this.performHealthCheck().catch((error) => {
        this.emit("error", error);
      });
    });
    if (enableMonitoring) {
      this.startMonitoring();
    }
  }
  async getHealthReport(includeDetails = false) {
    const config = configManager?.getConfig();
    const healthReport = this.validator.getHealthReport(config);
    const report = {
      ...healthReport,
      timestamp: Date.now(),
      environment: this.environment
    };
    this.lastHealthReport = report;
    if (includeDetails) {
      const validationResult = this.validator.validateEnhanced(config);
      return {
        ...report,
        validationDetails: validationResult
      };
    }
    return report;
  }
  /**
   * Validate configuration for production deployment.
   *
   * @param config - Configuration to validate (optional, uses current if not provided).
   */
  async validateForProduction(config) {
    const configToValidate = config || configManager?.getConfig();
    const result = this.validator.validateEnhanced(configToValidate);
    const blockers = [];
    const warnings = [];
    const recommendations = [];
    if (!result?.valid) {
      blockers.push(...result?.errors);
    }
    if (result?.securityIssues.length > 0) {
      blockers.push(...result?.securityIssues);
    }
    if (result?.portConflicts.length > 0) {
      blockers.push(...result?.portConflicts);
    }
    warnings.push(...result?.warnings);
    warnings.push(...result?.performanceWarnings);
    if (!result?.productionReady) {
      recommendations.push("Configuration is not production-ready");
    }
    if (result?.failsafeApplied.length > 0) {
      recommendations.push("Failsafe defaults were applied - review configuration");
    }
    if (this.environment === "production") {
      if (!process.env["ANTHROPIC_API_KEY"]) {
        blockers.push("ANTHROPIC_API_KEY environment variable required in production");
      }
      if (configToValidate?.core?.logger?.level === "debug") {
        recommendations.push('Consider using "info" log level in production instead of "debug"');
      }
    }
    return {
      deploymentReady: blockers.length === 0,
      blockers,
      warnings,
      recommendations
    };
  }
  /**
   * Check for port conflicts across all services.
   */
  async checkPortConflicts() {
    const config = configManager?.getConfig();
    const conflicts = [];
    const recommendations = [];
    const portMappings = [
      {
        name: "MCP HTTP",
        port: config?.interfaces?.mcp?.http?.port,
        critical: true
      },
      {
        name: "Web Dashboard",
        port: config?.interfaces?.web?.port,
        critical: true
      },
      {
        name: "Monitoring",
        port: config?.monitoring?.dashboard?.port,
        critical: false
      }
    ].filter((mapping) => typeof mapping.port === "number");
    const portGroups = /* @__PURE__ */ new Map();
    for (const mapping of portMappings) {
      if (typeof mapping.port === "number") {
        if (!portGroups.has(mapping.port)) {
          portGroups.set(mapping.port, []);
        }
        portGroups.get(mapping.port).push({ name: mapping.name, critical: mapping.critical });
      }
    }
    for (const [port, services] of portGroups.entries()) {
      if (services.length > 1) {
        const isCritical = services.some((s) => s.critical);
        conflicts.push({
          port,
          services: services.map((s) => s.name),
          severity: isCritical ? "error" : "warning"
        });
      }
    }
    if (conflicts.length > 0) {
      recommendations.push("Configure unique ports for each service");
      recommendations.push("Use environment variables to override default ports");
      recommendations.push("Consider using a reverse proxy for port management");
    }
    return { conflicts, recommendations };
  }
  /**
   * Get configuration health as simple status.
   */
  async getHealthStatus() {
    const report = await this.getHealthReport();
    let message = "";
    switch (report.status) {
      case "healthy":
        message = "Configuration is healthy and production-ready";
        break;
      case "warning":
        message = `Configuration has ${report.recommendations.length} recommendations`;
        break;
      case "critical":
        message = "Configuration has critical issues requiring attention";
        break;
    }
    return {
      status: report.status,
      message,
      timestamp: report.timestamp
    };
  }
  /**
   * Start health monitoring.
   */
  startMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck().catch((error) => {
        this.emit("error", error);
      });
    }, this.healthCheckFrequency);
  }
  /**
   * Stop health monitoring.
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
  /**
   * Export health report for external monitoring.
   *
   * @param format - Export format.
   */
  async exportHealthReport(format = "json") {
    const report = await this.getHealthReport(true);
    if (format === "json") {
      return JSON.stringify(report, null, 2);
    } else if (format === "prometheus") {
      return this.toPrometheusFormat(report);
    }
    throw new Error(`Unsupported export format: ${format}`);
  }
  /**
   * Cleanup resources.
   */
  destroy() {
    this.stopMonitoring();
    this.removeAllListeners();
  }
  /**
   * Perform health check and emit events.
   */
  async performHealthCheck() {
    try {
      const currentReport = await this.getHealthReport();
      if (this.lastHealthReport) {
        if (this.lastHealthReport.status !== currentReport?.status) {
          this.emit("health:changed", currentReport);
          if (currentReport?.status === "critical") {
            this.emit("health:critical", currentReport);
          } else if (currentReport?.status === "healthy" && this.lastHealthReport.status !== "healthy") {
            this.emit("health:recovered", currentReport);
          }
        }
      }
      this.emit("health:checked", currentReport);
      this.lastHealthReport = currentReport;
      if (currentReport?.configuration) {
        try {
          logRepoConfigStatus(currentReport.configuration);
        } catch (error) {
          console.debug("Config status logging failed:", error);
        }
      }
    } catch (error) {
      this.emit("error", error);
    }
  }
  /**
   * Convert health report to Prometheus format.
   *
   * @param report - Health report to convert.
   */
  toPrometheusFormat(report) {
    const lines = [];
    lines.push("# HELP claude_zen_config_health_score Configuration health score (0-100)");
    lines.push("# TYPE claude_zen_config_health_score gauge");
    lines.push(`claude_zen_config_health_score{environment="${this.environment}"} ${report.score}`);
    const statusValue = report.status === "healthy" ? 2 : report.status === "warning" ? 1 : 0;
    lines.push("# HELP claude_zen_config_health_status Configuration health status");
    lines.push("# TYPE claude_zen_config_health_status gauge");
    lines.push(
      `claude_zen_config_health_status{environment="${this.environment}",status="${report.status}"} ${statusValue}`
    );
    for (const [component, healthy] of Object.entries(report.details)) {
      lines.push(`# HELP claude_zen_config_${component}_health ${component} configuration health`);
      lines.push(`# TYPE claude_zen_config_${component}_health gauge`);
      lines.push(
        `claude_zen_config_${component}_health{environment="${this.environment}"} ${healthy ? 1 : 0}`
      );
    }
    lines.push(
      "# HELP claude_zen_config_recommendations_total Number of configuration recommendations"
    );
    lines.push("# TYPE claude_zen_config_recommendations_total gauge");
    lines.push(
      `claude_zen_config_recommendations_total{environment="${this.environment}"} ${report.recommendations.length}`
    );
    return `${lines.join("\n")}
`;
  }
};
var configHealthChecker = new ConfigHealthChecker();
async function initializeConfigHealthChecker(options) {
  await configHealthChecker?.initialize(options);
}
__name(initializeConfigHealthChecker, "initializeConfigHealthChecker");
function createConfigHealthEndpoint() {
  return async (_req, res) => {
    try {
      const healthReport = await configHealthChecker?.getHealthReport(true);
      const statusCode = healthReport.status === "healthy" ? 200 : healthReport.status === "warning" ? 200 : 503;
      res.status(statusCode).json({
        success: healthReport.status !== "critical",
        health: healthReport,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Health check failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  };
}
__name(createConfigHealthEndpoint, "createConfigHealthEndpoint");
function createDeploymentReadinessEndpoint() {
  return async (_req, res) => {
    try {
      const deploymentCheck = await configHealthChecker?.validateForProduction();
      const portCheck = await configHealthChecker?.checkPortConflicts();
      const statusCode = deploymentCheck.deploymentReady && portCheck.conflicts.length === 0 ? 200 : 503;
      res.status(statusCode).json({
        success: deploymentCheck.deploymentReady && portCheck.conflicts.length === 0,
        deployment: {
          ready: deploymentCheck.deploymentReady,
          blockers: deploymentCheck.blockers,
          warnings: deploymentCheck.warnings,
          recommendations: deploymentCheck.recommendations
        },
        ports: {
          conflicts: portCheck.conflicts,
          recommendations: portCheck.recommendations
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        environment: "development"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Deployment readiness check failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  };
}
__name(createDeploymentReadinessEndpoint, "createDeploymentReadinessEndpoint");

export {
  configManager,
  ConfigHealthChecker,
  configHealthChecker,
  initializeConfigHealthChecker,
  createConfigHealthEndpoint,
  createDeploymentReadinessEndpoint
};
//# sourceMappingURL=chunk-CCPLN3IY.js.map
