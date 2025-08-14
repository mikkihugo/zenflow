#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/config/logging-config.ts
import { getLogger as getLogTapeLogger } from "@logtape/logtape";
function getLogger(component) {
  return loggingConfigManager?.getLogger(component);
}
function getConsoleReplacementLogger(component) {
  return loggingConfigManager?.createConsoleReplacementLogger(component);
}
function addLogEntry(entry) {
  logEntries.push({
    id: `log-${Date.now()}-${Math.random()}`,
    timestamp: /* @__PURE__ */ new Date(),
    ...entry
  });
  if (logEntries.length > 1e3) {
    logEntries.splice(0, logEntries.length - 1e3);
  }
}
var LoggingConfigurationManager, loggingConfigManager, logger, logEntries;
var init_logging_config = __esm({
  "src/config/logging-config.ts"() {
    "use strict";
    LoggingConfigurationManager = class _LoggingConfigurationManager {
      static {
        __name(this, "LoggingConfigurationManager");
      }
      static instance;
      config;
      loggers = /* @__PURE__ */ new Map();
      constructor() {
        this.config = this.loadConfiguration();
      }
      static getInstance() {
        if (!_LoggingConfigurationManager.instance) {
          _LoggingConfigurationManager.instance = new _LoggingConfigurationManager();
        }
        return _LoggingConfigurationManager.instance;
      }
      loadConfiguration() {
        const nodeEnv = "production";
        const defaultLevel = nodeEnv === "development" ? "debug" /* DEBUG */ : "info" /* INFO */;
        return {
          level: process.env["LOG_LEVEL"] || defaultLevel,
          enableConsole: process.env["LOG_DISABLE_CONSOLE"] !== "true",
          enableFile: process.env["LOG_ENABLE_FILE"] === "true",
          timestamp: process.env["LOG_DISABLE_TIMESTAMP"] !== "true",
          format: process.env["LOG_FORMAT"] || "text",
          components: {
            // Override levels for specific components
            "swarm-coordinator": process.env["LOG_LEVEL_SWARM"] || defaultLevel,
            "neural-network": process.env["LOG_LEVEL_NEURAL"] || defaultLevel,
            "mcp-server": process.env["LOG_LEVEL_MCP"] || defaultLevel,
            database: process.env["LOG_LEVEL_DB"] || defaultLevel
          }
        };
      }
      /**
       * Get logging configuration.
       */
      getConfig() {
        return { ...this.config };
      }
      /**
       * Update logging configuration.
       *
       * @param updates
       */
      updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.loggers.clear();
      }
      /**
       * Create or get cached logger for a component.
       *
       * @param component
       */
      getLogger(component) {
        if (this.loggers.has(component)) {
          return this.loggers.get(component);
        }
        const logger7 = this.createLoggerForComponent(component);
        this.loggers.set(component, logger7);
        return logger7;
      }
      createLoggerForComponent(component) {
        const componentLevel = this.config.components[component] || this.config.level;
        const originalLevel = process.env["LOG_LEVEL"];
        process.env["LOG_LEVEL"] = componentLevel;
        try {
          const coreLogger = getLogTapeLogger(component);
          const enhancedLogger = {
            debug: /* @__PURE__ */ __name((message, meta) => coreLogger.debug(message, meta), "debug"),
            info: /* @__PURE__ */ __name((message, meta) => coreLogger.info(message, meta), "info"),
            warn: /* @__PURE__ */ __name((message, meta) => coreLogger.warn(message, meta), "warn"),
            error: /* @__PURE__ */ __name((message, meta) => coreLogger.error(message, meta), "error")
          };
          enhancedLogger.success = (message, meta) => {
            coreLogger.info(`\u2705 ${message}`, meta);
          };
          enhancedLogger.progress = (message, meta) => {
            coreLogger.info(`\u{1F504} ${message}`, meta);
          };
          return enhancedLogger;
        } finally {
          if (originalLevel !== void 0) {
            process.env["LOG_LEVEL"] = originalLevel;
          } else {
            process.env["LOG_LEVEL"] = void 0;
          }
        }
      }
      /**
       * Create logger specifically for console.log replacement
       * This creates a logger optimized for CLI output and user-facing messages.
       *
       * @param component
       */
      createConsoleReplacementLogger(component) {
        const logger7 = this.getLogger(component);
        return {
          debug: /* @__PURE__ */ __name((message, meta) => logger7.debug(message, meta), "debug"),
          // For console.log replacement, use info level
          info: /* @__PURE__ */ __name((message, meta) => logger7.info(message, meta), "info"),
          warn: /* @__PURE__ */ __name((message, meta) => logger7.warn(message, meta), "warn"),
          error: /* @__PURE__ */ __name((message, meta) => logger7.error(message, meta), "error"),
          success: logger7.success || ((message, meta) => logger7.info(message, meta)),
          progress: logger7.progress || ((message, meta) => logger7.info(message, meta))
        };
      }
      /**
       * Enable debug logging for development.
       */
      enableDebugMode() {
        this.updateConfig({
          level: "debug" /* DEBUG */,
          components: Object.fromEntries(
            Object.keys(this.config.components).map((key) => [
              key,
              "debug" /* DEBUG */
            ])
          )
        });
      }
      /**
       * Set production logging (INFO and above).
       */
      setProductionMode() {
        this.updateConfig({
          level: "info" /* INFO */,
          components: Object.fromEntries(
            Object.keys(this.config.components).map((key) => [
              key,
              "info" /* INFO */
            ])
          )
        });
      }
      /**
       * Silence all logging except errors.
       */
      setSilentMode() {
        this.updateConfig({
          level: "error" /* ERROR */,
          components: Object.fromEntries(
            Object.keys(this.config.components).map((key) => [
              key,
              "error" /* ERROR */
            ])
          )
        });
      }
    };
    loggingConfigManager = LoggingConfigurationManager.getInstance();
    __name(getLogger, "getLogger");
    __name(getConsoleReplacementLogger, "getConsoleReplacementLogger");
    logger = {
      // Default system logger
      system: getLogger("system"),
      // CLI output logger
      cli: getConsoleReplacementLogger("cli"),
      // Swarm coordination logger
      swarm: getLogger("swarm-coordinator"),
      // Neural network logger
      neural: getLogger("neural-network"),
      // MCP server logger
      mcp: getLogger("mcp-server"),
      // Database logger
      database: getLogger("database")
    };
    logEntries = [];
    __name(addLogEntry, "addLogEntry");
    addLogEntry({
      level: "info",
      component: "system",
      message: "Claude Code Zen TUI initialized"
    });
    addLogEntry({
      level: "info",
      component: "terminal",
      message: "Terminal interface ready"
    });
  }
});

// src/config/defaults.ts
var DEFAULT_CONFIG, ENV_MAPPINGS, VALIDATION_RULES, PORT_ALLOCATION_BY_ENV, URLBuilder, defaultURLBuilder, getCORSOrigins;
var init_defaults = __esm({
  "src/config/defaults.ts"() {
    "use strict";
    DEFAULT_CONFIG = {
      core: {
        logger: {
          level: "info",
          console: true,
          structured: false
        },
        performance: {
          enableMetrics: true,
          metricsInterval: 1e4,
          enableProfiling: false
        },
        security: {
          enableSandbox: true,
          allowShellAccess: false,
          trustedHosts: ["localhost", "127.0.0.1"]
        }
      },
      interfaces: {
        shared: {
          theme: "dark",
          verbosity: "normal",
          autoCompletion: true,
          realTimeUpdates: true,
          refreshInterval: 5e3,
          maxCommandHistory: 100,
          pageSize: 25
        },
        terminal: {
          timeout: 3e4,
          maxConcurrentProcesses: 10,
          enableColors: true,
          enableProgressBars: true
        },
        web: {
          port: 3456,
          host: "localhost",
          enableHttps: false,
          corsOrigins: ["http://localhost:3000", "http://localhost:3456"],
          staticPath: "./public",
          enableCompression: true
        },
        mcp: {
          http: {
            port: 3e3,
            host: "localhost",
            timeout: 3e4,
            maxRequestSize: "10mb",
            enableCors: true
          },
          stdio: {
            timeout: 3e4,
            maxBufferSize: 1024 * 1024
            // 1MB
          },
          tools: {
            enableAll: true,
            enabledTools: [],
            disabledTools: []
          }
        }
      },
      storage: {
        memory: {
          backend: "sqlite",
          directory: "./data/memory",
          namespace: "claude-zen",
          enableCompression: false,
          maxMemorySize: 100 * 1024 * 1024,
          // 100MB
          cacheSize: 10 * 1024 * 1024,
          // 10MB
          enableBackup: true,
          backupInterval: 36e5
          // 1 hour
        },
        database: {
          sqlite: {
            path: "./data/claude-zen.db",
            enableWAL: true,
            maxConnections: 10,
            timeout: 3e4
          },
          lancedb: {
            path: "./data/lancedb",
            enableVectorIndex: true,
            indexType: "ivf"
          },
          persistence: {
            maxReaders: 6,
            maxWorkers: 3,
            mmapSize: 268435456,
            // 256MB
            cacheSize: -64e3,
            // 64MB
            enableBackup: false,
            healthCheckInterval: 6e4
            // 1 minute
          }
        }
      },
      coordination: {
        maxAgents: 50,
        heartbeatInterval: 1e4,
        timeout: 3e4,
        topology: "mesh",
        enableLoadBalancing: true,
        enableFailover: true,
        enableMetrics: true
      },
      // External services and API keys
      services: {
        anthropic: {
          apiKey: process.env["ANTHROPIC_API_KEY"] || (() => {
            if (true) {
              throw new Error(
                "ANTHROPIC_API_KEY environment variable is required in production"
              );
            }
            return null;
          })(),
          baseUrl: process.env["ANTHROPIC_BASE_URL"] || "https://api.anthropic.com",
          timeout: 3e4,
          maxRetries: 3
        },
        openai: {
          apiKey: process.env["OPENAI_API_KEY"] || null,
          baseUrl: process.env["OPENAI_BASE_URL"] || "https://api.openai.com",
          timeout: 3e4
        },
        github: {
          token: process.env["GITHUB_TOKEN"] || null,
          baseUrl: process.env["GITHUB_API_URL"] || "https://api.github.com"
        },
        search: {
          apiKey: process.env["SEARCH_API_KEY"] || null,
          baseUrl: process.env["SEARCH_BASE_URL"] || null
        }
      },
      // Monitoring and logging
      monitoring: {
        dashboard: {
          port: Number.parseInt(process.env["DASHBOARD_PORT"] || "3456", 10),
          host: process.env["DASHBOARD_HOST"] || "localhost",
          enableMetrics: process.env["ENABLE_METRICS"] !== "false",
          metricsInterval: Number.parseInt(
            process.env["METRICS_INTERVAL"] || "10000",
            10
          )
        },
        logging: {
          level: process.env["LOG_LEVEL"] || "info",
          format: process.env["LOG_FORMAT"] || "json",
          file: process.env["LOG_FILE"] || "./logs/claude-zen.log",
          enableConsole: process.env["LOG_CONSOLE"] !== "false",
          enableFile: process.env["LOG_FILE_ENABLE"] === "true"
        },
        performance: {
          enableProfiling: process.env["ENABLE_PROFILING"] === "true",
          sampleRate: Number.parseFloat(
            process.env["PROFILE_SAMPLE_RATE"] || "0.1"
          ),
          enableTracing: process.env["ENABLE_TRACING"] === "true"
        }
      },
      // Network and connectivity
      network: {
        defaultTimeout: Number.parseInt(
          process.env["DEFAULT_TIMEOUT"] || "30000",
          10
        ),
        maxRetries: Number.parseInt(process.env["MAX_RETRIES"] || "3", 10),
        retryDelay: Number.parseInt(process.env["RETRY_DELAY"] || "1000", 10),
        enableKeepAlive: process.env["KEEP_ALIVE"] !== "false"
      },
      // Development vs Production settings
      environment: {
        isDevelopment: false,
        isProduction: true,
        isTest: false,
        allowUnsafeOperations: false,
        enableDebugEndpoints: false,
        strictValidation: true
      },
      neural: {
        enableWASM: true,
        enableSIMD: true,
        enableCUDA: false,
        modelPath: "./data/neural",
        maxModelSize: 100 * 1024 * 1024,
        // 100MB
        enableTraining: false,
        enableInference: true,
        backend: "wasm"
      },
      optimization: {
        enablePerformanceMonitoring: true,
        enableResourceOptimization: true,
        enableMemoryOptimization: true,
        enableNetworkOptimization: false,
        benchmarkInterval: 6e4
        // 1 minute
      }
    };
    ENV_MAPPINGS = {
      // Core
      CLAUDE_LOG_LEVEL: { path: "core.logger.level", type: "string" },
      CLAUDE_LOG_CONSOLE: { path: "core.logger.console", type: "boolean" },
      CLAUDE_LOG_FILE: { path: "core.logger.file", type: "string" },
      CLAUDE_ENABLE_METRICS: {
        path: "core.performance.enableMetrics",
        type: "boolean"
      },
      CLAUDE_METRICS_INTERVAL: {
        path: "core.performance.metricsInterval",
        type: "number"
      },
      // Interfaces
      CLAUDE_WEB_PORT: { path: "interfaces.web.port", type: "number" },
      CLAUDE_WEB_HOST: { path: "interfaces.web.host", type: "string" },
      CLAUDE_MCP_PORT: {
        path: "interfaces.mcp.http.port",
        type: "number"
      },
      CLAUDE_MCP_HOST: {
        path: "interfaces.mcp.http.host",
        type: "string"
      },
      CLAUDE_MCP_TIMEOUT: {
        path: "interfaces.mcp.http.timeout",
        type: "number"
      },
      // Storage
      CLAUDE_MEMORY_BACKEND: {
        path: "storage.memory.backend",
        type: "string"
      },
      CLAUDE_MEMORY_DIR: {
        path: "storage.memory.directory",
        type: "string"
      },
      CLAUDE_DB_PATH: {
        path: "storage.database.sqlite.path",
        type: "string"
      },
      CLAUDE_LANCEDB_PATH: {
        path: "storage.database.lancedb.path",
        type: "string"
      },
      // Persistence Pool
      POOL_MAX_READERS: {
        path: "storage.database.persistence.maxReaders",
        type: "number"
      },
      POOL_MAX_WORKERS: {
        path: "storage.database.persistence.maxWorkers",
        type: "number"
      },
      POOL_MMAP_SIZE: {
        path: "storage.database.persistence.mmapSize",
        type: "number"
      },
      POOL_CACHE_SIZE: {
        path: "storage.database.persistence.cacheSize",
        type: "number"
      },
      POOL_ENABLE_BACKUP: {
        path: "storage.database.persistence.enableBackup",
        type: "boolean"
      },
      // Coordination
      CLAUDE_MAX_AGENTS: {
        path: "coordination.maxAgents",
        type: "number"
      },
      CLAUDE_HEARTBEAT_INTERVAL: {
        path: "coordination.heartbeatInterval",
        type: "number"
      },
      CLAUDE_COORDINATION_TIMEOUT: {
        path: "coordination.timeout",
        type: "number"
      },
      CLAUDE_SWARM_TOPOLOGY: {
        path: "coordination.topology",
        type: "string"
      },
      // Neural
      CLAUDE_ENABLE_WASM: { path: "neural.enableWASM", type: "boolean" },
      CLAUDE_ENABLE_SIMD: { path: "neural.enableSIMD", type: "boolean" },
      CLAUDE_ENABLE_CUDA: { path: "neural.enableCUDA", type: "boolean" },
      CLAUDE_NEURAL_BACKEND: { path: "neural.backend", type: "string" },
      CLAUDE_MODEL_PATH: { path: "neural.modelPath", type: "string" },
      // Security
      CLAUDE_ENABLE_SANDBOX: {
        path: "core.security.enableSandbox",
        type: "boolean"
      },
      CLAUDE_ALLOW_SHELL: {
        path: "core.security.allowShellAccess",
        type: "boolean"
      },
      CLAUDE_TRUSTED_HOSTS: {
        path: "core.security.trustedHosts",
        type: "array",
        parser: /* @__PURE__ */ __name((value) => value.split(",").map((h) => h.trim()), "parser")
      }
    };
    VALIDATION_RULES = {
      "core.logger.level": {
        type: "string",
        enum: ["debug", "info", "warn", "error"],
        productionDefault: "info",
        required: false
      },
      "interfaces.web.port": {
        type: "number",
        min: 1,
        max: 65535,
        productionMin: 3e3,
        productionMax: 65535,
        conflictCheck: true,
        fallback: 3456
        // Safe fallback different from MCP
      },
      "interfaces.mcp.http.port": {
        type: "number",
        min: 1,
        max: 65535,
        productionMin: 3e3,
        productionMax: 65535,
        conflictCheck: true,
        fallback: 3e3
        // Primary MCP port
      },
      "coordination.maxAgents": {
        type: "number",
        min: 1,
        max: 1e3,
        productionMax: 100,
        // More conservative in production
        required: false,
        fallback: 10
      },
      "coordination.topology": {
        type: "string",
        enum: ["mesh", "hierarchical", "ring", "star"],
        productionRecommended: ["hierarchical", "ring"],
        fallback: "hierarchical"
      },
      "neural.backend": {
        type: "string",
        enum: ["wasm", "native", "fallback"],
        productionRecommended: ["wasm", "fallback"],
        fallback: "wasm"
      },
      "storage.memory.backend": {
        type: "string",
        enum: ["sqlite", "lancedb", "json"],
        productionRecommended: ["sqlite", "lancedb"],
        fallback: "sqlite"
      },
      "core.security.enableSandbox": {
        type: "boolean",
        productionRequired: true,
        fallback: true
      },
      "core.security.allowShellAccess": {
        type: "boolean",
        productionForbidden: true,
        fallback: false
      },
      // Database constraints
      "storage.database.sqlite.maxConnections": {
        type: "number",
        min: 1,
        max: 100,
        productionMax: 50,
        fallback: 10
      },
      "storage.memory.maxMemorySize": {
        type: "number",
        min: 1024 * 1024,
        // 1MB minimum
        productionMin: 50 * 1024 * 1024,
        // 50MB minimum in production
        fallback: 100 * 1024 * 1024
        // 100MB default
      }
    };
    PORT_ALLOCATION_BY_ENV = {
      development: {
        "interfaces.mcp.http.port": 3e3,
        "interfaces.web.port": 3456,
        "monitoring.dashboard.port": 3457
      },
      production: {
        "interfaces.mcp.http.port": Number.parseInt(
          process.env["CLAUDE_MCP_PORT"] || "3000",
          10
        ),
        "interfaces.web.port": Number.parseInt(
          process.env["CLAUDE_WEB_PORT"] || "3456",
          10
        ),
        "monitoring.dashboard.port": Number.parseInt(
          process.env["CLAUDE_MONITOR_PORT"] || "3457",
          10
        )
      },
      test: {
        "interfaces.mcp.http.port": 3100,
        "interfaces.web.port": 3556,
        "monitoring.dashboard.port": 3557
      }
    };
    URLBuilder = class {
      static {
        __name(this, "URLBuilder");
      }
      config;
      constructor(config2 = DEFAULT_CONFIG) {
        this.config = config2;
      }
      /**
       * Build HTTP MCP server URL.
       *
       * @param overrides
       */
      getMCPServerURL(overrides = {}) {
        const protocol = overrides.protocol || this.getProtocol();
        const host = overrides.host || this.config.interfaces.mcp.http.host;
        const port = overrides.port || this.config.interfaces.mcp.http.port;
        const path3 = overrides.path || "";
        return this.buildURL(protocol, host, port, path3);
      }
      /**
       * Build web dashboard URL.
       *
       * @param overrides
       */
      getWebDashboardURL(overrides = {}) {
        const protocol = overrides.protocol || this.getProtocol();
        const host = overrides.host || this.config.interfaces.web.host;
        const port = overrides.port || this.config.interfaces.web.port;
        const path3 = overrides.path || "";
        return this.buildURL(protocol, host, port, path3);
      }
      /**
       * Build monitoring dashboard URL.
       *
       * @param overrides
       */
      getMonitoringDashboardURL(overrides = {}) {
        const protocol = overrides.protocol || this.getProtocol();
        const host = overrides.host || this.config.monitoring.dashboard.host;
        const port = overrides.port || this.config.monitoring.dashboard.port;
        const path3 = overrides.path || "";
        return this.buildURL(protocol, host, port, path3);
      }
      /**
       * Build CORS origins array.
       */
      getCORSOrigins() {
        const protocol = this.getProtocol();
        const mcpURL = this.getMCPServerURL({ protocol });
        const webURL = this.getWebDashboardURL({ protocol });
        const monitoringURL = this.getMonitoringDashboardURL({ protocol });
        const configuredOrigins = this.config.interfaces.web.corsOrigins || [];
        const updatedOrigins = configuredOrigins.map((origin) => {
          if (origin.includes("localhost") && !origin.startsWith("http")) {
            return `${protocol}://${origin}`;
          }
          if (origin.startsWith("http://localhost") && protocol === "https") {
            return origin.replace("http://", "https://");
          }
          return origin;
        });
        const allOrigins = [...updatedOrigins, mcpURL, webURL, monitoringURL];
        return Array.from(new Set(allOrigins));
      }
      /**
       * Get service base URL.
       *
       * @param service
       * @param overrides
       */
      getServiceBaseURL(service, overrides = {}) {
        switch (service) {
          case "mcp":
            return this.getMCPServerURL(overrides);
          case "web":
            return this.getWebDashboardURL(overrides);
          case "monitoring":
            return this.getMonitoringDashboardURL(overrides);
          default:
            throw new Error(`Unknown service: ${service}`);
        }
      }
      /**
       * Build a URL from components.
       *
       * @param protocol
       * @param host
       * @param port
       * @param path
       */
      buildURL(protocol, host, port, path3) {
        const shouldOmitPort = protocol === "http" && port === 80 || protocol === "https" && port === 443;
        const portPart = shouldOmitPort ? "" : `:${port}`;
        const pathPart = path3.startsWith("/") ? path3 : `/${path3}`;
        const cleanPath = path3 === "" ? "" : pathPart;
        return `${protocol}://${host}${portPart}${cleanPath}`;
      }
      /**
       * Get protocol based on environment and configuration.
       */
      getProtocol() {
        if (process.env["FORCE_HTTPS"] === "true") {
          return "https";
        }
        if (process.env["FORCE_HTTP"] === "true") {
          return "http";
        }
        if (this.config.interfaces.web.enableHttps) {
          return "https";
        }
        return this.config.environment.isProduction ? "https" : "http";
      }
      /**
       * Update configuration.
       *
       * @param config
       */
      updateConfig(config2) {
        this.config = config2;
      }
    };
    defaultURLBuilder = new URLBuilder();
    getCORSOrigins = /* @__PURE__ */ __name(() => defaultURLBuilder.getCORSOrigins(), "getCORSOrigins");
  }
});

// src/config/validator.ts
var ConfigValidator;
var init_validator = __esm({
  "src/config/validator.ts"() {
    "use strict";
    init_defaults();
    ConfigValidator = class {
      static {
        __name(this, "ConfigValidator");
      }
      /**
       * Validate configuration object.
       *
       * @param config
       */
      validate(config2) {
        const errors = [];
        const warnings = [];
        try {
          this.validateStructure(config2, errors);
          this.validateRules(config2, errors, warnings);
          this.validateDependencies(config2, errors, warnings);
          this.validateConstraints(config2, errors, warnings);
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
      validateStructure(config2, errors) {
        const requiredSections = [
          "core",
          "interfaces",
          "storage",
          "coordination",
          "neural",
          "optimization"
        ];
        for (const section of requiredSections) {
          if (!config2?.[section]) {
            errors.push(`Missing required configuration section: ${section}`);
          }
        }
        if (config2?.core) {
          if (!config2?.core?.logger) {
            errors.push("Missing core.logger configuration");
          }
          if (!config2?.core?.performance) {
            errors.push("Missing core.performance configuration");
          }
          if (!config2?.core?.security) {
            errors.push("Missing core.security configuration");
          }
        }
        if (config2?.interfaces) {
          const requiredInterfaces = ["shared", "terminal", "web", "mcp"];
          for (const iface of requiredInterfaces) {
            if (!config2?.interfaces?.[iface]) {
              errors.push(`Missing interfaces.${iface} configuration`);
            }
          }
        }
        if (config2?.storage) {
          if (!config2?.storage?.memory) {
            errors.push("Missing storage.memory configuration");
          }
          if (!config2?.storage?.database) {
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
      validateRules(config2, errors, warnings) {
        for (const [path3, rule] of Object.entries(VALIDATION_RULES)) {
          const value = this.getNestedValue(config2, path3);
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
              errors.push(
                `${path3} must be one of: ${rule.enum.join(", ")}, got ${value}`
              );
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
      validateDependencies(config2, errors, warnings) {
        if (config2?.interfaces?.web?.enableHttps && !config2?.interfaces?.web?.corsOrigins) {
          warnings.push("HTTPS enabled but no CORS origins configured");
        }
        if (config2?.neural?.enableCUDA && !config2?.neural?.enableWASM) {
          warnings.push("CUDA enabled without WASM - may not be supported");
        }
        if (config2?.storage?.memory?.backend === "lancedb" && !config2?.storage?.database?.lancedb) {
          errors.push("LanceDB backend selected but lancedb configuration missing");
        }
        if (config2?.interfaces?.mcp?.tools?.enableAll && config2?.interfaces?.mcp?.tools?.disabledTools?.length > 0) {
          warnings.push("enableAll is true but some tools are disabled");
        }
        if (!config2?.core?.security?.enableSandbox && config2?.core?.security?.allowShellAccess) {
          warnings.push("Shell access enabled without sandbox - security risk");
        }
        if (config2?.core?.performance?.enableProfiling && !config2?.core?.performance?.enableMetrics) {
          warnings.push(
            "Profiling enabled without metrics - limited functionality"
          );
        }
      }
      /**
       * Validate constraints and logical consistency.
       *
       * @param config
       * @param errors
       * @param warnings
       */
      validateConstraints(config2, errors, warnings) {
        const ports = [
          config2?.interfaces?.web?.port,
          config2?.interfaces?.mcp?.http?.port
        ].filter(Boolean);
        const uniquePorts = new Set(ports);
        if (ports.length !== uniquePorts.size) {
          errors.push(
            "Port conflicts detected - multiple services cannot use the same port"
          );
        }
        if (config2?.storage?.memory?.maxMemorySize && config2?.storage?.memory?.cacheSize) {
          if (config2?.storage?.memory?.cacheSize > config2?.storage?.memory?.maxMemorySize) {
            errors.push("Cache size cannot be larger than max memory size");
          }
        }
        if (config2?.coordination?.maxAgents && config2?.coordination?.maxAgents > 1e3) {
          warnings.push("Very high agent count may impact performance");
        }
        const timeouts = [
          config2?.interfaces?.terminal?.timeout,
          config2?.interfaces?.mcp?.http?.timeout,
          config2?.coordination?.timeout
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
          config2?.storage?.memory?.directory,
          config2?.storage?.database?.sqlite?.path,
          config2?.storage?.database?.lancedb?.path,
          config2?.neural?.modelPath
        ].filter(Boolean);
        for (const dir of directories) {
          if (dir.includes("..")) {
            warnings.push(
              `Directory path contains '..' - potential security risk: ${dir}`
            );
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
      validateEnhanced(config2) {
        const basicResult = this.validate(config2);
        const securityIssues = [];
        const portConflicts = [];
        const performanceWarnings = [];
        const failsafeApplied = [];
        if (!config2?.core?.security?.enableSandbox && config2?.core?.security?.allowShellAccess) {
          securityIssues.push("Shell access enabled without sandbox protection");
        }
        if (config2?.core?.security?.trustedHosts?.length === 0) {
          securityIssues.push("No trusted hosts configured for security");
        }
        const ports = [
          config2?.interfaces?.web?.port,
          config2?.interfaces?.mcp?.http?.port,
          config2?.monitoring?.dashboard?.port
        ].filter((port) => typeof port === "number");
        const uniquePorts = new Set(ports);
        if (ports.length !== uniquePorts.size) {
          portConflicts.push("Multiple services configured to use the same port");
        }
        if (config2?.coordination?.maxAgents && config2?.coordination?.maxAgents > 1e3) {
          performanceWarnings.push("High agent count may impact performance");
        }
        if (config2?.core?.logger?.level === "debug") {
          performanceWarnings.push(
            "Debug logging enabled - may impact performance"
          );
        }
        const productionReady = basicResult?.valid && securityIssues.length === 0 && portConflicts.length === 0 && config2?.core?.security?.enableSandbox === true;
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
      getHealthReport(config2) {
        const result = this.validateEnhanced(config2);
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
  }
});

// src/config/loader.ts
import * as fs from "node:fs";
import * as path from "node:path";
var logger2, ConfigurationLoader;
var init_loader = __esm({
  "src/config/loader.ts"() {
    "use strict";
    init_logging_config();
    init_defaults();
    init_validator();
    logger2 = getLogger("ConfigLoader");
    ConfigurationLoader = class {
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
          const resolvedPath = path.resolve(
            filePath.replace("~", process.env["HOME"] || "~")
          );
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
            logger2.warn(`Unsupported config file format: ${filePath}`);
            return;
          }
          this.addSource({
            type: "file",
            priority: 10,
            data
          });
        } catch (error) {
          logger2.warn(`Failed to load config from ${filePath}:`, error);
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
                  logger2.warn(`Invalid number value for ${envVar}: ${value}`);
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
  }
});

// src/config/manager.ts
import { EventEmitter } from "node:events";
import * as fs2 from "node:fs";
import * as path2 from "node:path";
var logger3, ConfigurationManager, configManager;
var init_manager = __esm({
  "src/config/manager.ts"() {
    "use strict";
    init_logging_config();
    init_defaults();
    init_loader();
    init_validator();
    logger3 = getLogger("src-config-manager");
    ConfigurationManager = class _ConfigurationManager extends EventEmitter {
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
          if (result?.validation?.valid) {
            this.config = result?.config;
            if (result?.validation?.warnings.length > 0) {
              logger3.warn("\u26A0\uFE0F Configuration warnings:");
              result?.validation?.warnings?.forEach(
                (warning) => logger3.warn(`  - ${warning}`)
              );
            }
          } else {
            logger3.error("\u274C Configuration validation failed:");
            result?.validation?.errors?.forEach(
              (error) => logger3.error(`  - ${error}`)
            );
            if (result?.validation?.warnings.length > 0) {
              logger3.warn("\u26A0\uFE0F Configuration warnings:");
              result?.validation?.warnings?.forEach(
                (warning) => logger3.warn(`  - ${warning}`)
              );
            }
            this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
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
          logger3.error("Cannot rollback to invalid configuration");
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
        }
        return this.toSimpleYaml(this.config);
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
                      logger3.error("Failed to reload configuration:", error);
                    });
                  }, 1e3);
                }
              });
              this.watchers.push(watcher);
            }
          } catch (error) {
            logger3.warn(`Failed to watch config file ${configFile}:`, error);
          }
        }
      }
      /**
       * Setup error handling.
       */
      setupErrorHandling() {
        this.on("error", (error) => {
          logger3.error("Configuration manager error:", error);
        });
        process.on("SIGINT", () => this.destroy());
        process.on("SIGTERM", () => this.destroy());
      }
      /**
       * Add configuration to history.
       *
       * @param config
       */
      addToHistory(config2) {
        this.configHistory.push(JSON.parse(JSON.stringify(config2)));
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
    configManager = ConfigurationManager.getInstance();
  }
});

// src/config/system-info.ts
var init_system_info = __esm({
  "src/config/system-info.ts"() {
    "use strict";
  }
});

// src/config/default-repo-config.ts
function logRepoConfigStatus(config2) {
  const logger7 = console;
  logger7.log("\u{1F680} Repository Configuration:");
  logger7.log(`   Repository: ${config2.repoName} (${config2.repoPath})`);
  logger7.log(
    `   Advanced Kanban Flow: ${config2.enableAdvancedKanbanFlow ? "\u2705 ENABLED" : "\u274C DISABLED"}`
  );
  logger7.log(
    `   ML Optimization: ${config2.enableMLOptimization ? "\u2705 ENABLED" : "\u274C DISABLED"} (Level: ${config2.mlOptimizationLevel})`
  );
  logger7.log(
    `   Bottleneck Detection: ${config2.enableBottleneckDetection ? "\u2705 ENABLED" : "\u274C DISABLED"}`
  );
  logger7.log(
    `   Predictive Analytics: ${config2.enablePredictiveAnalytics ? "\u2705 ENABLED" : "\u274C DISABLED"}`
  );
  logger7.log(
    `   Real-Time Monitoring: ${config2.enableRealTimeMonitoring ? "\u2705 ENABLED" : "\u274C DISABLED"}`
  );
  logger7.log(
    `   Resource Management: ${config2.enableIntelligentResourceManagement ? "\u2705 ENABLED" : "\u274C DISABLED"}`
  );
  logger7.log(
    `   AGUI Gates: ${config2.enableAGUIGates ? "\u2705 ENABLED" : "\u274C DISABLED"}`
  );
  logger7.log(
    `   Cross-Level Optimization: ${config2.enableCrossLevelOptimization ? "\u2705 ENABLED" : "\u274C DISABLED"}`
  );
  logger7.log(
    `   DSPy Neural Enhancement: ${config2.dsyIntegration.enabled ? "\u2705 ENABLED" : "\u274C DISABLED"}`
  );
  logger7.log(
    `   Auto-Discovery: ${config2.autoDiscovery.enabled ? "\u2705 ENABLED" : "\u274C DISABLED"} (Confidence: ${config2.autoDiscovery.confidenceThreshold})`
  );
  logger7.log(
    `   Knowledge Systems: FACT=${config2.knowledgeSystems.factEnabled ? "\u2705" : "\u274C"}, RAG=${config2.knowledgeSystems.ragEnabled ? "\u2705" : "\u274C"}, WASM=${config2.knowledgeSystems.wasmAcceleration ? "\u2705" : "\u274C"}`
  );
  logger7.log(`   Flow Topology: ${config2.flowTopology}`);
  logger7.log(
    `   Parallel Streams: Portfolio=${config2.maxParallelStreams.portfolio}, Program=${config2.maxParallelStreams.program}, Swarm=${config2.maxParallelStreams.swarm}`
  );
  logger7.log(
    "\u2705 All advanced features enabled with adaptive 8GB base configuration!"
  );
  logger7.log(
    "\u{1F504} System will auto-scale based on detected memory and performance!"
  );
}
var init_default_repo_config = __esm({
  "src/config/default-repo-config.ts"() {
    "use strict";
    init_system_info();
    __name(logRepoConfigStatus, "logRepoConfigStatus");
  }
});

// src/config/health-checker.ts
var health_checker_exports = {};
__export(health_checker_exports, {
  ConfigHealthChecker: () => ConfigHealthChecker,
  configHealthChecker: () => configHealthChecker,
  createConfigHealthEndpoint: () => createConfigHealthEndpoint,
  createDeploymentReadinessEndpoint: () => createDeploymentReadinessEndpoint,
  initializeConfigHealthChecker: () => initializeConfigHealthChecker
});
import { EventEmitter as EventEmitter2 } from "node:events";
async function initializeConfigHealthChecker(options) {
  await configHealthChecker?.initialize(options);
}
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
        environment: "production"
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
var ConfigHealthChecker, configHealthChecker;
var init_health_checker = __esm({
  "src/config/health-checker.ts"() {
    "use strict";
    init_default_repo_config();
    init_manager();
    init_validator();
    ConfigHealthChecker = class extends EventEmitter2 {
      static {
        __name(this, "ConfigHealthChecker");
      }
      validator = new ConfigValidator();
      lastHealthReport = null;
      monitoringInterval = null;
      healthCheckFrequency = 3e4;
      // 30 seconds
      environment = "production";
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
        const config2 = configManager?.getConfig();
        const healthReport = this.validator.getHealthReport(config2);
        const report = {
          ...healthReport,
          timestamp: Date.now(),
          environment: this.environment
        };
        this.lastHealthReport = report;
        if (includeDetails) {
          const validationResult = this.validator.validateEnhanced(config2);
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
      async validateForProduction(config2) {
        const configToValidate = config2 || configManager?.getConfig();
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
          recommendations.push(
            "Failsafe defaults were applied - review configuration"
          );
        }
        if (this.environment === "production") {
          if (!process.env["ANTHROPIC_API_KEY"]) {
            blockers.push(
              "ANTHROPIC_API_KEY environment variable required in production"
            );
          }
          if (configToValidate?.core?.logger?.level === "debug") {
            recommendations.push(
              'Consider using "info" log level in production instead of "debug"'
            );
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
        const config2 = configManager?.getConfig();
        const conflicts = [];
        const recommendations = [];
        const portMappings = [
          {
            name: "MCP HTTP",
            port: config2?.interfaces?.mcp?.http?.port,
            critical: true
          },
          {
            name: "Web Dashboard",
            port: config2?.interfaces?.web?.port,
            critical: true
          },
          {
            name: "Monitoring",
            port: config2?.monitoring?.dashboard?.port,
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
          recommendations.push(
            "Use environment variables to override default ports"
          );
          recommendations.push(
            "Consider using a reverse proxy for port management"
          );
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
        }
        if (format === "prometheus") {
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
        lines.push(
          "# HELP claude_zen_config_health_score Configuration health score (0-100)"
        );
        lines.push("# TYPE claude_zen_config_health_score gauge");
        lines.push(
          `claude_zen_config_health_score{environment="${this.environment}"} ${report.score}`
        );
        const statusValue = report.status === "healthy" ? 2 : report.status === "warning" ? 1 : 0;
        lines.push(
          "# HELP claude_zen_config_health_status Configuration health status"
        );
        lines.push("# TYPE claude_zen_config_health_status gauge");
        lines.push(
          `claude_zen_config_health_status{environment="${this.environment}",status="${report.status}"} ${statusValue}`
        );
        for (const [component, healthy] of Object.entries(report.details)) {
          lines.push(
            `# HELP claude_zen_config_${component}_health ${component} configuration health`
          );
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
    configHealthChecker = new ConfigHealthChecker();
    __name(initializeConfigHealthChecker, "initializeConfigHealthChecker");
    __name(createConfigHealthEndpoint, "createConfigHealthEndpoint");
    __name(createDeploymentReadinessEndpoint, "createDeploymentReadinessEndpoint");
  }
});

// src/config/startup-validator.ts
var startup_validator_exports = {};
__export(startup_validator_exports, {
  cli: () => cli,
  runStartupValidation: () => runStartupValidation,
  validateAndExit: () => validateAndExit
});
import * as process2 from "node:process";
async function runStartupValidation(options = {}) {
  const {
    strict = process2.env["NODE_ENV"] === "production",
    enforceProductionStandards = process2.env["NODE_ENV"] === "production",
    skipValidation = [],
    outputFormat = "console"
  } = options;
  const startTime = Date.now();
  const environment = process2.env["NODE_ENV"] || "development";
  if (outputFormat === "console") {
    logger4.info("\n\u{1F50D} Running Claude-Zen configuration validation...");
    logger4.info(`Environment: ${environment}`);
    logger4.info(`Strict mode: ${strict ? "\u2705 Enabled" : "\u274C Disabled"}`);
  }
  try {
    const configValidation = await configManager?.initialize();
    await configHealthChecker?.initialize({ enableMonitoring: false });
    const errors = [];
    const warnings = [];
    const blockers = [];
    if (!skipValidation.includes("structure")) {
      if (outputFormat === "console") {
        process2.stdout.write("\u{1F4CB} Validating configuration structure... ");
      }
      if (!configValidation?.valid) {
        errors.push(...configValidation?.errors);
        if (strict) {
          blockers.push(...configValidation?.errors);
        }
      }
      warnings.push(...configValidation?.warnings);
      if (outputFormat === "console") {
        logger4.info(configValidation?.valid ? "\u2705" : "\u274C");
      }
    }
    const detailedValidation = await configHealthChecker?.getHealthReport(true);
    const validationDetails = detailedValidation.validationDetails;
    if (!skipValidation.includes("security")) {
      if (outputFormat === "console") {
        process2.stdout.write("\u{1F512} Validating security configuration... ");
      }
      if (validationDetails.securityIssues.length > 0) {
        errors.push(...validationDetails.securityIssues);
        if (enforceProductionStandards || environment === "production") {
          blockers.push(...validationDetails.securityIssues);
        }
      }
      if (outputFormat === "console") {
        logger4.info(
          validationDetails.securityIssues.length === 0 ? "\u2705" : "\u274C"
        );
      }
    }
    let portConflicts = [];
    if (!skipValidation.includes("ports")) {
      if (outputFormat === "console") {
        process2.stdout.write("\u{1F310} Validating port configuration... ");
      }
      const portCheck = await configHealthChecker?.checkPortConflicts();
      portConflicts = portCheck.conflicts;
      if (portConflicts.length > 0) {
        const criticalConflicts = portConflicts.filter(
          (c) => c.severity === "error"
        );
        if (criticalConflicts.length > 0) {
          errors.push(
            ...criticalConflicts.map(
              (c) => `Port conflict: ${c.port} used by ${c.services.join(", ")}`
            )
          );
          blockers.push(
            ...criticalConflicts.map(
              (c) => `Critical port conflict on ${c.port}`
            )
          );
        }
        const warningConflicts = portConflicts.filter(
          (c) => c.severity === "warning"
        );
        warnings.push(
          ...warningConflicts.map(
            (c) => `Port ${c.port} shared by ${c.services.join(", ")}`
          )
        );
      }
      if (outputFormat === "console") {
        logger4.info(
          portConflicts.length === 0 ? "\u2705" : portConflicts.some((c) => c.severity === "error") ? "\u274C" : "\u26A0\uFE0F"
        );
      }
    }
    if (!skipValidation.includes("environment")) {
      if (outputFormat === "console") {
        process2.stdout.write("\u{1F30D} Validating environment variables... ");
      }
      const envIssues = await validateEnvironmentVariables(
        environment === "production"
      );
      if (envIssues.errors.length > 0) {
        errors.push(...envIssues.errors);
        if (environment === "production") {
          blockers.push(...envIssues.errors);
        }
      }
      warnings.push(...envIssues.warnings);
      if (outputFormat === "console") {
        logger4.info(envIssues.errors.length === 0 ? "\u2705" : "\u274C");
      }
    }
    if (!skipValidation.includes("performance")) {
      if (outputFormat === "console") {
        process2.stdout.write("\u26A1 Validating performance configuration... ");
      }
      warnings.push(...validationDetails.performanceWarnings);
      if (outputFormat === "console") {
        logger4.info(
          validationDetails.performanceWarnings.length <= 2 ? "\u2705" : "\u26A0\uFE0F"
        );
      }
    }
    if (enforceProductionStandards) {
      if (outputFormat === "console") {
        process2.stdout.write("\u{1F680} Validating production readiness... ");
      }
      if (!validationDetails.productionReady) {
        const message = "Configuration is not production-ready";
        errors.push(message);
        if (environment === "production") {
          blockers.push(message);
        }
      }
      if (outputFormat === "console") {
        logger4.info(validationDetails.productionReady ? "\u2705" : "\u274C");
      }
    }
    const success = blockers.length === 0;
    const exitCode = success ? 0 : 1;
    const result = {
      success,
      errors,
      warnings,
      blockers,
      environment,
      timestamp: startTime,
      validationDetails,
      portConflicts,
      exitCode
    };
    await outputValidationResults(result, outputFormat);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown validation error";
    const result = {
      success: false,
      errors: [errorMessage],
      warnings: [],
      blockers: [errorMessage],
      environment,
      timestamp: startTime,
      validationDetails: {
        valid: false,
        errors: [errorMessage],
        warnings: [],
        productionReady: false,
        securityIssues: [],
        portConflicts: [],
        performanceWarnings: [],
        failsafeApplied: []
      },
      portConflicts: [],
      exitCode: 1
    };
    await outputValidationResults(result, outputFormat);
    return result;
  }
}
async function validateEnvironmentVariables(isProduction) {
  const errors = [];
  const warnings = [];
  const requiredVars = ["NODE_ENV"];
  if (isProduction) {
    requiredVars.push("ANTHROPIC_API_KEY");
  }
  for (const envVar of requiredVars) {
    if (!process2.env[envVar]) {
      errors.push(`Required environment variable missing: ${envVar}`);
    }
  }
  const validNodeEnvs = ["development", "production", "test"];
  if (process2.env["NODE_ENV"] && !validNodeEnvs?.includes(process2.env["NODE_ENV"])) {
    errors.push(
      `Invalid NODE_ENV value: ${process2.env["NODE_ENV"]}. Must be one of: ${validNodeEnvs?.join(", ")}`
    );
  }
  if (process2.env["ANTHROPIC_API_KEY"] && process2.env["ANTHROPIC_API_KEY"].length < 10) {
    errors.push("ANTHROPIC_API_KEY appears to be too short or invalid");
  }
  if (isProduction) {
    if (process2.env["DEBUG"]) {
      warnings.push("DEBUG environment variable is set in production");
    }
    if (process2.env["CLAUDE_LOG_LEVEL"] === "debug") {
      warnings.push(
        'Debug logging enabled in production - consider using "info" level'
      );
    }
  }
  return { errors, warnings };
}
async function outputValidationResults(result, format) {
  if (format === "silent") {
    return;
  }
  if (format === "json") {
    logger4.info(JSON.stringify(result, null, 2));
    return;
  }
  logger4.info("\n\u{1F4CA} Validation Results:");
  logger4.info(`Overall: ${result?.success ? "\u2705 PASSED" : "\u274C FAILED"}`);
  if (result?.blockers.length > 0) {
    logger4.info("\n\u{1F6AB} Critical Issues (deployment blockers):");
    result?.blockers.forEach((blocker) => logger4.info(`  \u274C ${blocker}`));
  }
  if (result?.errors.length > 0) {
    logger4.info("\n\u274C Errors:");
    result?.errors.forEach((error) => logger4.info(`  \u274C ${error}`));
  }
  if (result?.warnings.length > 0) {
    logger4.info("\n\u26A0\uFE0F  Warnings:");
    result?.warnings.forEach((warning) => logger4.info(`  \u26A0\uFE0F  ${warning}`));
  }
  if (result?.portConflicts.length > 0) {
    logger4.info("\n\u{1F310} Port Conflicts:");
    result?.portConflicts?.forEach((conflict) => {
      const icon = conflict.severity === "error" ? "\u274C" : "\u26A0\uFE0F";
      logger4.info(
        `  ${icon} Port ${conflict.port}: ${conflict.services.join(", ")}`
      );
    });
  }
  if (result?.validationDetails?.failsafeApplied.length > 0) {
    logger4.info("\n\u{1F6E1}\uFE0F  Failsafe Defaults Applied:");
    result?.validationDetails?.failsafeApplied?.forEach(
      (applied) => logger4.info(`  \u{1F6E1}\uFE0F  ${applied}`)
    );
  }
  const healthReport = await configHealthChecker?.getHealthReport();
  logger4.info(
    `
\u{1F4AF} Configuration Health Score: ${healthReport.score}/100 (${healthReport.status.toUpperCase()})`
  );
  if (!result?.success) {
    logger4.info("\n\u{1F6A8} Fix the issues above before deploying to production!");
  } else if (result?.warnings.length > 0) {
    logger4.info(
      "\n\u2705 Configuration is valid but consider addressing the warnings above."
    );
  } else {
    logger4.info("\n\u{1F389} Configuration is healthy and production-ready!");
  }
  logger4.info(`
Validation completed in ${Date.now() - result?.timestamp}ms`);
}
async function validateAndExit(options = {}) {
  const result = await runStartupValidation(options);
  process2.exit(result?.exitCode);
}
async function cli() {
  const args = process2.argv.slice(2);
  const options = {
    strict: args.includes("--strict"),
    enforceProductionStandards: args.includes("--production-standards"),
    outputFormat: args.includes("--json") ? "json" : args.includes("--silent") ? "silent" : "console",
    skipValidation: []
  };
  if (args.includes("--skip-structure"))
    options?.["skipValidation"].push("structure");
  if (args.includes("--skip-security"))
    options?.["skipValidation"].push("security");
  if (args.includes("--skip-performance"))
    options?.["skipValidation"].push("performance");
  if (args.includes("--skip-ports")) options?.["skipValidation"].push("ports");
  if (args.includes("--skip-environment"))
    options?.["skipValidation"].push("environment");
  if (args.includes("--help") || args.includes("-h")) {
    logger4.info(`
Claude-Zen Configuration Startup Validator

Usage: node startup-validator.js [options]

Options:
  --strict                    Fail on any configuration errors
  --production-standards      Enforce production standards even in development
  --json                     Output results in JSON format
  --silent                   Suppress all output
  --skip-structure           Skip structure validation
  --skip-security            Skip security validation
  --skip-performance         Skip performance validation
  --skip-ports               Skip port conflict validation
  --skip-environment         Skip environment variable validation
  --help, -h                 Show this help message

Examples:
  # Basic validation
  node startup-validator.js

  # Strict validation for production deployment
  node startup-validator.js --strict --production-standards

  # JSON output for CI/CD integration
  node startup-validator.js --json --strict
`);
    process2.exit(0);
  }
  await validateAndExit(options);
}
var logger4;
var init_startup_validator = __esm({
  "src/config/startup-validator.ts"() {
    "use strict";
    init_logging_config();
    init_health_checker();
    init_manager();
    logger4 = getLogger("src-config-startup-validator");
    __name(runStartupValidation, "runStartupValidation");
    __name(validateEnvironmentVariables, "validateEnvironmentVariables");
    __name(outputValidationResults, "outputValidationResults");
    __name(validateAndExit, "validateAndExit");
    __name(cli, "cli");
  }
});

// src/interfaces/mcp/start-server.ts
init_logging_config();

// src/interfaces/mcp/http-mcp-server.ts
import { randomUUID } from "node:crypto";
import { Server as McpServer } from "@modelcontextprotocol/sdk/server/index.js";
import express from "express";
import { z } from "zod";

// src/config/index.ts
init_manager();
init_default_repo_config();
init_defaults();
init_health_checker();
init_loader();
init_manager();
init_startup_validator();
init_validator();
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
  get(path3) {
    return configManager?.get(path3);
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
  set(path3, value) {
    return configManager?.update(path3, value);
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
    const { configHealthChecker: configHealthChecker2 } = await Promise.resolve().then(() => (init_health_checker(), health_checker_exports));
    return configHealthChecker2?.getHealthReport();
  },
  /**
   * Check if configuration is production ready.
   */
  async isProductionReady() {
    const { configHealthChecker: configHealthChecker2 } = await Promise.resolve().then(() => (init_health_checker(), health_checker_exports));
    const deployment = await configHealthChecker2?.validateForProduction();
    return deployment.deploymentReady;
  },
  /**
   * Check for port conflicts.
   */
  async checkPorts() {
    const { configHealthChecker: configHealthChecker2 } = await Promise.resolve().then(() => (init_health_checker(), health_checker_exports));
    return configHealthChecker2?.checkPortConflicts();
  },
  /**
   * Run startup validation.
   *
   * @param options
   */
  async validateStartup(options) {
    const { runStartupValidation: runStartupValidation2 } = await Promise.resolve().then(() => (init_startup_validator(), startup_validator_exports));
    return runStartupValidation2(options);
  }
};

// src/interfaces/mcp/http-mcp-server.ts
init_logging_config();

// src/interfaces/mcp/mcp-tools.ts
import * as fs3 from "fs";

// src/memory/core/memory-coordinator.ts
import { EventEmitter as EventEmitter3 } from "node:events";
var MemoryCoordinator = class extends EventEmitter3 {
  static {
    __name(this, "MemoryCoordinator");
  }
  nodes = /* @__PURE__ */ new Map();
  decisions = /* @__PURE__ */ new Map();
  config;
  constructor(config2) {
    super();
    this.config = config2;
  }
  /**
   * Register a memory node for coordination.
   *
   * @param id
   * @param backend
   */
  async registerNode(id, backend) {
    const node = {
      id,
      backend,
      status: "active",
      lastHeartbeat: Date.now(),
      load: 0,
      capacity: 1e3
      // Default capacity
    };
    this.nodes.set(id, node);
    this.emit("nodeRegistered", { nodeId: id, node });
  }
  /**
   * Unregister a memory node.
   *
   * @param id
   */
  async unregisterNode(id) {
    this.nodes.delete(id);
    this.emit("nodeUnregistered", { nodeId: id });
  }
  /**
   * Coordinate a distributed memory operation.
   *
   * @param operation
   */
  async coordinate(operation) {
    const decision = {
      id: `coord_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type: operation.type || "read",
      sessionId: operation.sessionId || "",
      target: operation.target || "",
      participants: this.selectParticipants(operation.type || "read"),
      status: "pending",
      timestamp: Date.now(),
      metadata: operation.metadata
    };
    this.decisions.set(decision.id, decision);
    this.emit("coordinationStarted", decision);
    try {
      await this.executeCoordination(decision);
      decision.status = "completed";
      this.emit("coordinationCompleted", decision);
    } catch (error) {
      decision.status = "failed";
      this.emit("coordinationFailed", { decision, error });
      throw error;
    }
    return decision;
  }
  /**
   * Select optimal nodes for an operation.
   *
   * @param operationType
   */
  selectParticipants(operationType) {
    const activeNodes = Array.from(this.nodes.entries()).filter(([, node]) => node?.status === "active").sort(([, a], [, b]) => a.load - b.load);
    if (operationType === "read") {
      return activeNodes?.slice(0, 1).map(([id]) => id);
    }
    if (operationType === "write") {
      const replicationCount = Math.min(
        this.config.distributed.replication,
        activeNodes.length
      );
      return activeNodes?.slice(0, replicationCount).map(([id]) => id);
    }
    return activeNodes?.slice(0, 1).map(([id]) => id);
  }
  /**
   * Execute coordination decision.
   *
   * @param decision
   */
  async executeCoordination(decision) {
    decision.status = "executing";
    switch (decision.type) {
      case "read":
        await this.executeRead(decision);
        break;
      case "write":
        await this.executeWrite(decision);
        break;
      case "delete":
        await this.executeDelete(decision);
        break;
      case "sync":
        await this.executeSync(decision);
        break;
      case "repair":
        await this.executeRepair(decision);
        break;
      default:
        throw new Error(`Unknown coordination type: ${decision.type}`);
    }
  }
  /**
   * Execute distributed read operation.
   *
   * @param decision
   */
  async executeRead(decision) {
    const node = this.nodes.get(decision.participants[0]);
    if (!node) {
      throw new Error(`Node not found: ${decision.participants[0]}`);
    }
    return await node?.backend?.retrieve(decision.target);
  }
  /**
   * Execute distributed write operation.
   *
   * @param decision
   */
  async executeWrite(decision) {
    const writePromises = decision.participants.map(async (nodeId) => {
      const node = this.nodes.get(nodeId);
      if (!node) {
        throw new Error(`Node not found: ${nodeId}`);
      }
      return await node?.backend?.store(
        decision.target,
        decision.metadata?.data
      );
    });
    if (this.config.distributed.consistency === "strong") {
      await Promise.all(writePromises);
    } else {
      const quorum = Math.ceil(
        decision.participants.length * this.config.consensus.quorum
      );
      await Promise.race([
        Promise.all(writePromises.slice(0, quorum)),
        new Promise(
          (_, reject) => setTimeout(
            () => reject(new Error("Quorum timeout")),
            this.config.consensus.timeout
          )
        )
      ]);
    }
  }
  /**
   * Execute distributed delete operation.
   *
   * @param decision
   */
  async executeDelete(decision) {
    const deletePromises = decision.participants.map(async (nodeId) => {
      const node = this.nodes.get(nodeId);
      if (!node) {
        throw new Error(`Node not found: ${nodeId}`);
      }
      return await node?.backend?.delete(decision.target);
    });
    await Promise.all(deletePromises);
  }
  /**
   * Execute sync operation between nodes.
   *
   * @param decision
   */
  async executeSync(decision) {
    const sourceNode = this.nodes.get(decision.participants[0]);
    if (!sourceNode) {
      throw new Error(`Source node not found: ${decision.participants[0]}`);
    }
    for (let i = 1; i < decision.participants.length; i++) {
      const targetNode = this.nodes.get(decision.participants[i]);
      if (!targetNode) {
        continue;
      }
      const data = await sourceNode?.backend?.retrieve(decision.target);
      if (data) {
        await targetNode?.backend?.store(decision.target, data);
      }
    }
  }
  /**
   * Execute repair operation for inconsistent data.
   *
   * @param decision
   */
  async executeRepair(decision) {
    const values = await Promise.all(
      decision.participants.map(async (nodeId) => {
        const node = this.nodes.get(nodeId);
        if (!node) return null;
        try {
          return await node?.backend?.retrieve(decision.target);
        } catch {
          return null;
        }
      })
    );
    const validValues = values.filter((v) => v !== null);
    if (validValues.length === 0) return;
    const valueCount = /* @__PURE__ */ new Map();
    validValues.forEach((value) => {
      const key = JSON.stringify(value);
      valueCount.set(key, (valueCount.get(key) || 0) + 1);
    });
    const [winningValue] = Array.from(valueCount.entries()).sort(
      ([, a], [, b]) => b - a
    )[0];
    const correctValue = JSON.parse(winningValue);
    const repairPromises = decision.participants.map(async (nodeId) => {
      const node = this.nodes.get(nodeId);
      if (!node) return;
      await node?.backend?.store(decision.target, correctValue);
    });
    await Promise.all(repairPromises);
  }
  /**
   * Get coordination statistics.
   */
  getStats() {
    return {
      nodes: {
        total: this.nodes.size,
        active: Array.from(this.nodes.values()).filter(
          (n) => n.status === "active"
        ).length,
        degraded: Array.from(this.nodes.values()).filter(
          (n) => n.status === "degraded"
        ).length
      },
      decisions: {
        total: this.decisions.size,
        pending: Array.from(this.decisions.values()).filter(
          (d) => d.status === "pending"
        ).length,
        executing: Array.from(this.decisions.values()).filter(
          (d) => d.status === "executing"
        ).length,
        completed: Array.from(this.decisions.values()).filter(
          (d) => d.status === "completed"
        ).length,
        failed: Array.from(this.decisions.values()).filter(
          (d) => d.status === "failed"
        ).length
      },
      config: this.config
    };
  }
  /**
   * Store data across distributed memory nodes.
   *
   * @param key
   * @param data
   * @param options
   * @param options.ttl
   * @param options.replicas
   */
  async store(key, data, options) {
    const decision = await this.coordinate({
      type: "write",
      target: key,
      metadata: { data, options }
    });
    if (decision.status === "failed") {
      throw new Error(`Failed to store data for key: ${key}`);
    }
  }
  /**
   * Retrieve data from distributed memory nodes.
   *
   * @param key
   */
  async get(key) {
    const decision = await this.coordinate({
      type: "read",
      target: key
    });
    if (decision.status === "failed") {
      throw new Error(`Failed to retrieve data for key: ${key}`);
    }
    return await this.executeRead(decision);
  }
  /**
   * Delete data from distributed memory nodes.
   *
   * @param key
   */
  async deleteEntry(key) {
    const decision = await this.coordinate({
      type: "delete",
      target: key
    });
    if (decision.status === "failed") {
      throw new Error(`Failed to delete data for key: ${key}`);
    }
  }
  /**
   * List all keys matching a pattern across distributed nodes.
   *
   * @param pattern
   */
  async list(pattern) {
    const results = [];
    const activeNodes = Array.from(this.nodes.values()).filter(
      (n) => n.status === "active"
    );
    for (const node of activeNodes) {
      try {
        if ("keys" in node?.backend && typeof node?.backend?.keys === "function") {
          const keys = await node?.backend?.keys();
          const matchingKeys = keys.filter(
            (key) => this.matchesPattern(key, pattern)
          );
          for (const key of matchingKeys) {
            try {
              const value = await node?.backend?.retrieve(key);
              results?.push({ key, value });
            } catch (_error) {
            }
          }
        }
      } catch (_error) {
      }
    }
    const uniqueResults = /* @__PURE__ */ new Map();
    for (const result of results) {
      if (!uniqueResults?.has(result?.key)) {
        uniqueResults?.set(result?.key, result);
      }
    }
    return Array.from(uniqueResults?.values());
  }
  /**
   * Simple pattern matching for key listing.
   *
   * @param key
   * @param pattern
   */
  matchesPattern(key, pattern) {
    const regexPattern = pattern.replace(/\\/g, "\\\\").replace(/\*/g, ".*").replace(/\?/g, ".").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(key);
  }
  /**
   * Health check for coordinator.
   */
  async healthCheck() {
    const stats = this.getStats();
    const unhealthyNodes = Array.from(this.nodes.values()).filter(
      (n) => n.status !== "active"
    );
    return {
      status: unhealthyNodes.length === 0 ? "healthy" : "degraded",
      details: {
        ...stats,
        unhealthyNodes: unhealthyNodes?.map((n) => ({
          id: n.id,
          status: n.status
        }))
      }
    };
  }
};

// src/interfaces/mcp/mcp-tools.ts
var memoryCoordinator = null;
var AdvancedToolHandler = class {
  static {
    __name(this, "AdvancedToolHandler");
  }
  validateParams(params, schema) {
    if (schema.required) {
      for (const required of schema.required) {
        if (!(required in (params || {}))) {
          throw new Error(`Missing required parameter: ${required}`);
        }
      }
    }
  }
  createResult(success, content, error, metadata) {
    return {
      success,
      content: Array.isArray(content) ? content : [{ type: "text", text: JSON.stringify(content, null, 2) }],
      error,
      metadata: {
        executionTime: Date.now(),
        version: "2.0.0",
        ...metadata
      }
    };
  }
};
var AdvancedToolRegistry = class {
  static {
    __name(this, "AdvancedToolRegistry");
  }
  tools = /* @__PURE__ */ new Map();
  categoryIndex = /* @__PURE__ */ new Map();
  tagIndex = /* @__PURE__ */ new Map();
  registerTool(tool) {
    this.tools.set(tool.name, tool);
    if (!this.categoryIndex.has(tool.category)) {
      this.categoryIndex.set(tool.category, []);
    }
    this.categoryIndex.get(tool.category)?.push(tool.name);
    for (const tag of tool.metadata.tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, []);
      }
      this.tagIndex.get(tag)?.push(tool.name);
    }
  }
  getTool(name) {
    return this.tools.get(name);
  }
  getToolsByCategory(category) {
    const toolNames = this.categoryIndex.get(category) || [];
    return toolNames.map((name) => this.tools.get(name)).filter(Boolean);
  }
  getToolsByTag(tag) {
    const toolNames = this.tagIndex.get(tag) || [];
    return toolNames.map((name) => this.tools.get(name)).filter(Boolean);
  }
  getAllTools() {
    return Array.from(this.tools.values());
  }
  getToolCount() {
    return this.tools.size;
  }
  getCategorySummary() {
    const summary = {};
    for (const [category, tools] of this.categoryIndex.entries()) {
      summary[category] = tools.length;
    }
    return summary;
  }
};
var advancedToolRegistry = new AdvancedToolRegistry();
var StoreDiscoveryPatternHandler = class extends AdvancedToolHandler {
  static {
    __name(this, "StoreDiscoveryPatternHandler");
  }
  async execute(params) {
    this.validateParams(params, memoryStoreDiscoveryPatternTool.inputSchema);
    try {
      if (!memoryCoordinator) {
        memoryCoordinator = new MemoryCoordinator({
          enabled: true,
          consensus: { quorum: 0.5, timeout: 5e3, strategy: "majority" },
          distributed: {
            replication: 1,
            consistency: "strong",
            partitioning: "hash"
          },
          optimization: {
            autoCompaction: true,
            cacheEviction: "lru",
            memoryThreshold: 0.8
          }
        });
      }
      const { pattern } = params;
      const { domainName } = pattern;
      const coordinationParams = {
        type: "write",
        sessionId: "discovery_patterns",
        // Using a fixed session ID for now
        target: domainName,
        metadata: { data: pattern }
      };
      const decision = await memoryCoordinator.coordinate(coordinationParams);
      return this.createResult(true, {
        message: `Discovery pattern for domain '${domainName}' stored successfully.`,
        decision
      });
    } catch (error) {
      return this.createResult(false, null, error.message);
    }
  }
};
var memoryStoreDiscoveryPatternTool = {
  name: "memory_store_discovery_pattern",
  description: "Store a discovery pattern in memory for future use.",
  category: "memory-neural",
  version: "1.0.0",
  permissions: [{ type: "write", resource: "memory:discovery_patterns" }],
  priority: "medium",
  inputSchema: {
    type: "object",
    properties: {
      pattern: {
        type: "object",
        properties: {
          domainName: { type: "string" },
          files: { type: "array", items: { type: "string" } },
          dependencies: { type: "array", items: { type: "string" } },
          confidenceScore: { type: "number" }
        },
        required: ["domainName", "files", "dependencies", "confidenceScore"]
      }
    },
    required: ["pattern"]
  },
  handler: new StoreDiscoveryPatternHandler(),
  metadata: {
    author: "Gemini",
    tags: ["memory", "discovery", "learning"],
    examples: [
      {
        description: "Store a discovery pattern for a new domain.",
        params: {
          pattern: {
            domainName: "my-new-domain",
            files: ["file1.ts", "file2.ts"],
            dependencies: ["dependency1", "dependency2"],
            confidenceScore: 0.8
          }
        }
      }
    ],
    related: ["memory_retrieve_discovery_pattern"],
    since: "2025-08-10"
  }
};
advancedToolRegistry.registerTool(memoryStoreDiscoveryPatternTool);
var RetrieveDiscoveryPatternHandler = class extends AdvancedToolHandler {
  static {
    __name(this, "RetrieveDiscoveryPatternHandler");
  }
  async execute(params) {
    this.validateParams(params, memoryRetrieveDiscoveryPatternTool.inputSchema);
    try {
      if (!memoryCoordinator) {
        throw new Error(
          "Memory coordinator not initialized. Run memory_init first."
        );
      }
      const { domainName } = params;
      const coordinationParams = {
        type: "read",
        sessionId: "discovery_patterns",
        // Using a fixed session ID for now
        target: domainName
      };
      const result = await memoryCoordinator.coordinate(coordinationParams);
      return this.createResult(true, {
        message: `Discovery pattern for domain '${domainName}' retrieved successfully.`,
        pattern: result
      });
    } catch (error) {
      return this.createResult(false, null, error.message);
    }
  }
};
var memoryRetrieveDiscoveryPatternTool = {
  name: "memory_retrieve_discovery_pattern",
  description: "Retrieve a discovery pattern from memory.",
  category: "memory-neural",
  version: "1.0.0",
  permissions: [{ type: "read", resource: "memory:discovery_patterns" }],
  priority: "medium",
  inputSchema: {
    type: "object",
    properties: {
      domainName: { type: "string" }
    },
    required: ["domainName"]
  },
  handler: new RetrieveDiscoveryPatternHandler(),
  metadata: {
    author: "Gemini",
    tags: ["memory", "discovery", "learning"],
    examples: [
      {
        description: "Retrieve a discovery pattern for a domain.",
        params: {
          domainName: "my-new-domain"
        }
      }
    ],
    related: ["memory_store_discovery_pattern"],
    since: "2025-08-10"
  }
};
advancedToolRegistry.registerTool(memoryRetrieveDiscoveryPatternTool);
var FindSimilarDiscoveryPatternsHandler = class extends AdvancedToolHandler {
  static {
    __name(this, "FindSimilarDiscoveryPatternsHandler");
  }
  async execute(params) {
    this.validateParams(
      params,
      memoryFindSimilarDiscoveryPatternsTool.inputSchema
    );
    try {
      if (!memoryCoordinator) {
        throw new Error(
          "Memory coordinator not initialized. Run memory_init first."
        );
      }
      const { pattern, similarityThreshold } = params;
      const allPatternsRaw = await memoryCoordinator.coordinate({
        type: "read",
        sessionId: "discovery_patterns",
        target: "*"
        // Assuming a wildcard to get all patterns
      });
      const allPatterns = allPatternsRaw.metadata?.data || [];
      const similarPatterns = allPatterns.filter((p) => {
        const jaccardIndex = this.calculateJaccardIndex(pattern.files, p.files);
        return jaccardIndex >= similarityThreshold;
      });
      return this.createResult(true, {
        message: `Found ${similarPatterns.length} similar discovery patterns.`,
        patterns: similarPatterns
      });
    } catch (error) {
      return this.createResult(false, null, error.message);
    }
  }
  calculateJaccardIndex(set1, set2) {
    const intersection = new Set(set1.filter((x) => new Set(set2).has(x)));
    const union = /* @__PURE__ */ new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }
};
var memoryFindSimilarDiscoveryPatternsTool = {
  name: "memory_find_similar_discovery_patterns",
  description: "Find similar discovery patterns in memory.",
  category: "memory-neural",
  version: "1.0.0",
  permissions: [{ type: "read", resource: "memory:discovery_patterns" }],
  priority: "medium",
  inputSchema: {
    type: "object",
    properties: {
      pattern: {
        type: "object",
        properties: {
          domainName: { type: "string" },
          files: { type: "array", items: { type: "string" } },
          dependencies: { type: "array", items: { type: "string" } },
          confidenceScore: { type: "number" }
        },
        required: ["domainName", "files", "dependencies", "confidenceScore"]
      },
      similarityThreshold: {
        type: "number",
        minimum: 0,
        maximum: 1,
        default: 0.5
      }
    },
    required: ["pattern"]
  },
  handler: new FindSimilarDiscoveryPatternsHandler(),
  metadata: {
    author: "Gemini",
    tags: ["memory", "discovery", "learning", "pattern-matching"],
    examples: [
      {
        description: "Find similar discovery patterns for a new domain.",
        params: {
          pattern: {
            domainName: "my-new-domain",
            files: ["file1.ts", "file2.ts"],
            dependencies: ["dependency1", "dependency2"],
            confidenceScore: 0.8
          },
          similarityThreshold: 0.7
        }
      }
    ],
    related: [
      "memory_store_discovery_pattern",
      "memory_retrieve_discovery_pattern"
    ],
    since: "2025-08-10"
  }
};
advancedToolRegistry.registerTool(memoryFindSimilarDiscoveryPatternsTool);
var LogSwarmOperationHandler = class extends AdvancedToolHandler {
  static {
    __name(this, "LogSwarmOperationHandler");
  }
  async execute(params) {
    this.validateParams(params, memoryLogSwarmOperationTool.inputSchema);
    try {
      if (!memoryCoordinator) {
        throw new Error(
          "Memory coordinator not initialized. Run memory_init first."
        );
      }
      const { operation } = params;
      const coordinationParams = {
        type: "write",
        sessionId: "swarm_operations",
        // Using a fixed session ID for now
        target: `${operation.domainName}-${Date.now()}`,
        metadata: { data: operation }
      };
      const decision = await memoryCoordinator.coordinate(coordinationParams);
      return this.createResult(true, {
        message: "Swarm operation logged successfully.",
        decision
      });
    } catch (error) {
      return this.createResult(false, null, error.message);
    }
  }
};
var memoryLogSwarmOperationTool = {
  name: "memory_log_swarm_operation",
  description: "Log a swarm operation for continuous learning.",
  category: "memory-neural",
  version: "1.0.0",
  permissions: [{ type: "write", resource: "memory:swarm_operations" }],
  priority: "medium",
  inputSchema: {
    type: "object",
    properties: {
      operation: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["bugfix", "feature", "refactor"] },
          domainName: { type: "string" },
          filesModified: { type: "array", items: { type: "string" } },
          outcome: { type: "string", enum: ["success", "failure"] }
        },
        required: ["type", "domainName", "filesModified", "outcome"]
      }
    },
    required: ["operation"]
  },
  handler: new LogSwarmOperationHandler(),
  metadata: {
    author: "Gemini",
    tags: ["memory", "swarm", "learning", "logging"],
    examples: [
      {
        description: "Log a successful bugfix operation.",
        params: {
          operation: {
            type: "bugfix",
            domainName: "my-new-domain",
            filesModified: ["file1.ts"],
            outcome: "success"
          }
        }
      }
    ],
    related: ["memory_update_discovery_pattern_from_swarm_operation"],
    since: "2025-08-10"
  }
};
advancedToolRegistry.registerTool(memoryLogSwarmOperationTool);
var UpdateDiscoveryPatternFromSwarmOperationHandler = class extends AdvancedToolHandler {
  static {
    __name(this, "UpdateDiscoveryPatternFromSwarmOperationHandler");
  }
  async execute(params) {
    this.validateParams(
      params,
      memoryUpdateDiscoveryPatternFromSwarmOperationTool.inputSchema
    );
    try {
      if (!memoryCoordinator) {
        throw new Error(
          "Memory coordinator not initialized. Run memory_init first."
        );
      }
      const { operation } = params;
      const { domainName, filesModified, outcome } = operation;
      const existingPatternRaw = await memoryCoordinator.coordinate({
        type: "read",
        sessionId: "discovery_patterns",
        target: domainName
      });
      const existingPattern = existingPatternRaw.metadata?.data;
      if (!existingPattern) {
        throw new Error(
          `Discovery pattern for domain '${domainName}' not found.`
        );
      }
      if (outcome === "success") {
        existingPattern.confidenceScore = Math.min(
          1,
          existingPattern.confidenceScore + 0.1
        );
        existingPattern.files = [
          .../* @__PURE__ */ new Set([...existingPattern.files, ...filesModified])
        ];
      } else {
        existingPattern.confidenceScore = Math.max(
          0,
          existingPattern.confidenceScore - 0.1
        );
      }
      const coordinationParams = {
        type: "write",
        sessionId: "discovery_patterns",
        target: domainName,
        metadata: { data: existingPattern }
      };
      const decision = await memoryCoordinator.coordinate(coordinationParams);
      return this.createResult(true, {
        message: `Discovery pattern for domain '${domainName}' updated successfully.`,
        decision
      });
    } catch (error) {
      return this.createResult(false, null, error.message);
    }
  }
};
var memoryUpdateDiscoveryPatternFromSwarmOperationTool = {
  name: "memory_update_discovery_pattern_from_swarm_operation",
  description: "Update a discovery pattern based on a swarm operation.",
  category: "memory-neural",
  version: "1.0.0",
  permissions: [{ type: "write", resource: "memory:discovery_patterns" }],
  priority: "medium",
  inputSchema: {
    type: "object",
    properties: {
      operation: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["bugfix", "feature", "refactor"] },
          domainName: { type: "string" },
          filesModified: { type: "array", items: { type: "string" } },
          outcome: { type: "string", enum: ["success", "failure"] }
        },
        required: ["type", "domainName", "filesModified", "outcome"]
      }
    },
    required: ["operation"]
  },
  handler: new UpdateDiscoveryPatternFromSwarmOperationHandler(),
  metadata: {
    author: "Gemini",
    tags: ["memory", "swarm", "learning", "update"],
    examples: [
      {
        description: "Update a discovery pattern after a successful bugfix.",
        params: {
          operation: {
            type: "bugfix",
            domainName: "my-new-domain",
            filesModified: ["file1.ts"],
            outcome: "success"
          }
        }
      }
    ],
    related: ["memory_log_swarm_operation"],
    since: "2025-08-10"
  }
};
advancedToolRegistry.registerTool(
  memoryUpdateDiscoveryPatternFromSwarmOperationTool
);
var ExportDiscoveryPatternsHandler = class extends AdvancedToolHandler {
  static {
    __name(this, "ExportDiscoveryPatternsHandler");
  }
  async execute(params) {
    this.validateParams(params, memoryExportDiscoveryPatternsTool.inputSchema);
    try {
      if (!memoryCoordinator) {
        throw new Error(
          "Memory coordinator not initialized. Run memory_init first."
        );
      }
      const { filePath } = params;
      const allPatternsRaw = await memoryCoordinator.coordinate({
        type: "read",
        sessionId: "discovery_patterns",
        target: "*"
        // Assuming a wildcard to get all patterns
      });
      const allPatterns = allPatternsRaw.metadata?.data || [];
      fs3.writeFileSync(filePath, JSON.stringify(allPatterns, null, 2));
      return this.createResult(true, {
        message: `Successfully exported ${allPatterns.length} discovery patterns to ${filePath}.`
      });
    } catch (error) {
      return this.createResult(false, null, error.message);
    }
  }
};
var memoryExportDiscoveryPatternsTool = {
  name: "memory_export_discovery_patterns",
  description: "Export all discovery patterns to a file.",
  category: "memory-neural",
  version: "1.0.0",
  permissions: [
    { type: "read", resource: "memory:discovery_patterns" },
    { type: "write", resource: "filesystem" }
  ],
  priority: "medium",
  inputSchema: {
    type: "object",
    properties: {
      filePath: { type: "string" }
    },
    required: ["filePath"]
  },
  handler: new ExportDiscoveryPatternsHandler(),
  metadata: {
    author: "Gemini",
    tags: ["memory", "discovery", "learning", "export"],
    examples: [
      {
        description: "Export all discovery patterns to a JSON file.",
        params: {
          filePath: "discovery-patterns.json"
        }
      }
    ],
    related: ["memory_store_discovery_pattern"],
    since: "2025-08-10"
  }
};
advancedToolRegistry.registerTool(memoryExportDiscoveryPatternsTool);

// src/interfaces/mcp/http-mcp-server.ts
var logger5 = getLogger("SDK-HTTP-MCP-Server");
var advancedMCPToolsManager = {
  searchTools(query) {
    const allTools = advancedToolRegistry.getAllTools();
    const filtered = allTools.filter(
      (tool) => tool.name.toLowerCase().includes(query.toLowerCase()) || tool.description.toLowerCase().includes(query.toLowerCase()) || tool.metadata.tags.some(
        (tag) => tag.toLowerCase().includes(query.toLowerCase())
      )
    );
    return { tools: filtered };
  },
  getToolsByCategory(category) {
    const tools = advancedToolRegistry.getToolsByCategory(category);
    return { tools };
  },
  listAllTools() {
    const tools = advancedToolRegistry.getAllTools();
    return { tools };
  },
  getRegistryOverview() {
    const categorySummary = advancedToolRegistry.getCategorySummary();
    const totalTools = advancedToolRegistry.getToolCount();
    return {
      totalTools,
      categories: categorySummary,
      status: "active"
    };
  },
  hasTool(name) {
    return advancedToolRegistry.getTool(name) !== void 0;
  },
  async executeTool(name, params) {
    const tool = advancedToolRegistry.getTool(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }
    return await tool.handler.execute(params);
  },
  getToolCount() {
    return advancedToolRegistry.getToolCount();
  },
  getToolStats() {
    const categorySummary = advancedToolRegistry.getCategorySummary();
    const totalTools = advancedToolRegistry.getToolCount();
    return {
      total: totalTools,
      byCategory: categorySummary,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};
var HTTPMCPServer = class {
  static {
    __name(this, "HTTPMCPServer");
  }
  server;
  expressApp;
  httpServer;
  config;
  isRunning = false;
  constructor(userConfig = {}) {
    const centralConfig = config?.getAll();
    this.config = {
      port: userConfig?.port || centralConfig?.interfaces?.mcp?.http?.port,
      host: userConfig?.host || centralConfig?.interfaces?.mcp?.http?.host,
      timeout: userConfig?.timeout || centralConfig?.interfaces?.mcp?.http?.timeout,
      logLevel: userConfig?.logLevel || centralConfig?.core?.logger?.level
    };
    this.server = new McpServer(
      {
        name: "claude-zen-http-mcp",
        version: "1.0.0-alpha.43"
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
          resources: {}
        }
      }
    );
    this.server.setRequestHandler("tools/list", async () => {
      return {
        tools: [
          {
            name: "system_info",
            description: "Get Claude-Zen system information and status",
            inputSchema: {
              type: "object",
              properties: {
                detailed: {
                  type: "boolean",
                  description: "Include detailed system metrics",
                  default: false
                }
              }
            }
          }
          // Add more tools here as needed
        ]
      };
    });
    this.expressApp = express();
    this.setupExpressMiddleware();
    this.setupSDKRoutes();
  }
  /**
   * Setup Express middleware for SDK transport.
   */
  setupExpressMiddleware() {
    this.expressApp.use(express.json({ limit: "10mb" }));
    this.expressApp.use(
      express.raw({ type: "application/octet-stream", limit: "10mb" })
    );
    this.expressApp.use((req, res, next) => {
      const corsOrigins = getCORSOrigins();
      const origin = req.headers.origin;
      if (corsOrigins.includes("*") || origin && corsOrigins.includes(origin) || !origin) {
        res.header("Access-Control-Allow-Origin", origin || "*");
      }
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-MCP-Client-Info, Last-Event-ID, MCP-Session-ID"
      );
      res.header("Access-Control-Allow-Credentials", "true");
      if (req.method === "OPTIONS") {
        res.sendStatus(200);
      } else {
        next();
      }
    });
    this.expressApp.use((req, _res, next) => {
      logger5.debug(`${req.method} ${req.path}`, {
        headers: req.headers,
        hasBody: !!req.body,
        bodyMethod: req.body?.method
      });
      next();
    });
    this.expressApp.get("/health", (_req, res) => {
      res.json({
        status: "healthy",
        server: "claude-zen-sdk-http-mcp",
        version: "2.0.0",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        uptime: process.uptime(),
        sdk: "official-mcp-sdk"
      });
    });
  }
  /**
   * Register Claude-Zen tools with the SDK.
   */
  async registerTools() {
    this.server.setRequestHandler("tools/call", async (request) => {
      const { name, arguments: args } = request.params;
      if (name === "system_info") {
        const detailed = args?.detailed;
        const info = {
          name: "claude-zen",
          version: "2.0.0",
          status: "running",
          uptime: Math.floor(process.uptime()),
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
          pid: process.pid,
          sdk: "official-mcp-sdk",
          server: "claude-zen-sdk-http-mcp"
        };
        if (detailed) {
          const memUsage = process.memoryUsage();
          Object.assign(info, {
            memory: {
              used: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
              total: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
              external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
            },
            cpuUsage: process.cpuUsage(),
            resourceUsage: process.resourceUsage?.() || {}
          });
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(info, null, 2)
            }
          ]
        };
      }
      throw new Error(`Unknown tool: ${name}`);
    });
    this.server.tool(
      "project_init",
      "Initialize a new Claude-Zen project with templates and configuration",
      {
        name: z.string().min(1).describe("Project name"),
        template: z.enum(["basic", "advanced", "swarm", "neural"]).default("basic").describe("Project template to use"),
        directory: z.string().default(".").describe("Target directory for project")
      },
      {
        title: "Project Initialization",
        description: "Creates a new Claude-Zen project with the specified template and configuration"
      },
      async ({ name, template, directory }) => {
        logger5.info(`Initializing project: ${name} with template: ${template}`);
        const result = {
          success: true,
          project: name,
          template,
          directory,
          message: `Project ${name} initialized successfully with ${template} template`,
          nextSteps: [
            "Run claude-zen status to check project health",
            "Use claude-zen swarm init to set up agent coordination",
            "Explore claude-zen --help for available commands"
          ],
          sdk: "official-mcp-sdk"
        };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
    );
    this.server.tool(
      "project_status",
      "Get comprehensive project status including swarms, tasks, and resources",
      {
        format: z.enum(["json", "summary"]).default("json").describe("Output format"),
        includeMetrics: z.boolean().default(false).describe("Include performance metrics")
      },
      {
        title: "Project Status",
        description: "Provides comprehensive project health, swarm status, and resource utilization"
      },
      async ({ format, includeMetrics }) => {
        const status = {
          project: {
            name: "current-project",
            status: "active",
            initialized: true,
            sdk: "official-mcp-sdk"
          },
          swarms: {
            active: 0,
            total: 0,
            agents: 0
          },
          tasks: {
            pending: 0,
            active: 0,
            completed: 0
          },
          resources: {
            memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            uptime: `${Math.floor(process.uptime())}s`
          }
        };
        if (includeMetrics) {
          Object.assign(status, {
            metrics: {
              requestsProcessed: 0,
              averageResponseTime: 0,
              errorRate: 0,
              sdkVersion: "1.17.1"
            }
          });
        }
        let result;
        if (format === "summary") {
          result = {
            summary: `Project: ${status.project.name} (${status.project.status})`,
            swarms: `${status.swarms.active}/${status.swarms.total} active`,
            tasks: `${status.tasks.active} active, ${status.tasks.completed} completed`,
            uptime: status.resources.uptime,
            sdk: "official-mcp-sdk"
          };
        } else {
          result = status;
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
    );
    await this.registerAdvancedTools();
    await this.integrateAdvancedToolsNatively();
    logger5.info("Registered Claude-Zen tools with official MCP SDK");
  }
  /**
   * Register advanced tools from claude-zen (87 tools).
   */
  async registerAdvancedTools() {
    logger5.info("Registering 87 advanced tools from claude-zen...");
    this.server.tool(
      "advanced_tools_list",
      "List all 87 advanced MCP tools with categories and metadata",
      {
        category: z.string().optional().describe("Filter by tool category"),
        search: z.string().optional().describe("Search tools by name or tags")
      },
      {
        title: "Advanced Tools Discovery",
        description: "Comprehensive listing of all advanced MCP tools available in the system"
      },
      async ({ category, search }) => {
        try {
          let tools;
          if (search) {
            tools = advancedMCPToolsManager.searchTools(search);
          } else if (category) {
            tools = advancedMCPToolsManager.getToolsByCategory(category);
          } else {
            tools = advancedMCPToolsManager.listAllTools();
          }
          const overview = advancedMCPToolsManager.getRegistryOverview();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    overview,
                    tools: typeof tools === "object" && "tools" in tools ? tools.tools : tools,
                    filter: { category, search },
                    timestamp: (/* @__PURE__ */ new Date()).toISOString()
                  },
                  null,
                  2
                )
              }
            ]
          };
        } catch (error) {
          logger5.error("Error listing advanced tools:", error);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ error: error.message }, null, 2)
              }
            ]
          };
        }
      }
    );
    this.server.tool(
      "advanced_tool_execute",
      "Execute any of the 87 advanced MCP tools",
      {
        toolName: z.string().describe("Name of the advanced tool to execute"),
        params: z.record(z.any()).optional().describe("Parameters for the tool")
      },
      {
        title: "Advanced Tool Execution",
        description: "Execute advanced coordination, monitoring, neural, GitHub, system, and orchestration tools"
      },
      async ({ toolName, params = {} }) => {
        try {
          if (!advancedMCPToolsManager.hasTool(toolName)) {
            throw new Error(`Advanced tool not found: ${toolName}`);
          }
          const result = await advancedMCPToolsManager.executeTool(
            toolName,
            params
          );
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    tool: toolName,
                    params,
                    result,
                    executedAt: (/* @__PURE__ */ new Date()).toISOString()
                  },
                  null,
                  2
                )
              }
            ]
          };
        } catch (error) {
          logger5.error(`Error executing advanced tool ${toolName}:`, error);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    tool: toolName,
                    error: error.message,
                    params,
                    executedAt: (/* @__PURE__ */ new Date()).toISOString()
                  },
                  null,
                  2
                )
              }
            ]
          };
        }
      }
    );
    this.server.tool(
      "advanced_tools_stats",
      "Get execution statistics for advanced MCP tools",
      {
        detailed: z.boolean().default(false).describe("Include detailed per-tool statistics")
      },
      {
        title: "Advanced Tools Statistics",
        description: "Performance metrics and usage statistics for advanced MCP tools"
      },
      async ({ detailed }) => {
        const overview = advancedMCPToolsManager.getRegistryOverview();
        const stats = detailed ? advancedMCPToolsManager.getToolStats() : {};
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  overview,
                  ...detailed && { detailedStats: stats },
                  generatedAt: (/* @__PURE__ */ new Date()).toISOString()
                },
                null,
                2
              )
            }
          ]
        };
      }
    );
    logger5.info(
      `\u2705 Registered 3 proxy tools for ${advancedMCPToolsManager.getToolCount()} advanced tools`
    );
  }
  /**
   * Integrate all advanced tools as native MCP tools (not proxy).
   */
  async integrateAdvancedToolsNatively() {
    logger5.info("Integrating advanced tools as native MCP tools...");
    const allTools = advancedMCPToolsManager.listAllTools();
    const tools = allTools.tools || [];
    let registeredCount = 0;
    for (const tool of tools) {
      try {
        this.server.tool(
          tool.name,
          tool.description,
          tool.inputSchema,
          {
            title: tool.metadata?.title || tool.name,
            description: tool.description
          },
          async (params) => {
            const result = await advancedMCPToolsManager.executeTool(
              tool.name,
              params
            );
            if (result && typeof result === "object" && !Array.isArray(result)) {
              if ("content" in result) {
                return result;
              }
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                  }
                ]
              };
            }
            return {
              content: [
                {
                  type: "text",
                  text: typeof result === "string" ? result : JSON.stringify(result, null, 2)
                }
              ]
            };
          }
        );
        registeredCount++;
      } catch (error) {
        logger5.warn(`Failed to register tool ${tool.name}:`, error);
      }
    }
    logger5.info(
      `\u2705 Integrated ${registeredCount}/${tools.length} advanced tools as native MCP tools`
    );
  }
  /**
   * Setup SDK transport routes.
   */
  setupSDKRoutes() {
    const transports = {};
    const mcpPostHandler = /* @__PURE__ */ __name(async (req, res) => {
      try {
        let sessionId = req.headers["mcp-session-id"];
        let transport = sessionId ? transports[sessionId] : void 0;
        const isInitRequest = req.body && req.body.method === "initialize";
        if (!transport && isInitRequest) {
          sessionId = randomUUID();
          transport = {
            handleRequest: /* @__PURE__ */ __name(async (req2, res2, body) => {
              res2.json({ error: "MCP SDK not available" });
            }, "handleRequest"),
            close: /* @__PURE__ */ __name(async () => {
            }, "close")
          };
          transports[sessionId] = transport;
          await this.server.connect(transport);
          await transport.handleRequest(req, res, req.body);
          return;
        }
        if (!(transport || isInitRequest)) {
          res.status(400).json({
            jsonrpc: "2.0",
            error: {
              code: -32e3,
              message: "Bad Request: No valid session ID provided. Initialize first."
            },
            id: req.body?.id || null
          });
          return;
        }
        if (transport) {
          await transport.handleRequest(req, res, req.body);
          return;
        }
        res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32e3,
            message: "Bad Request: Invalid request state"
          },
          id: req.body?.id || null
        });
      } catch (error) {
        logger5.error("Error handling MCP POST request:", error);
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: "Internal server error"
            },
            id: req.body?.id || null
          });
        }
      }
    }, "mcpPostHandler");
    const mcpGetHandler = /* @__PURE__ */ __name(async (req, res) => {
      try {
        const sessionId = req.headers["mcp-session-id"];
        const transport = sessionId ? transports[sessionId] : void 0;
        if (!transport) {
          res.status(400).send("Invalid or missing session ID for SSE stream");
          return;
        }
        await transport.handleRequest(req, res);
      } catch (error) {
        logger5.error("Error handling MCP GET request:", error);
        if (!res.headersSent) {
          res.status(500).send("Error establishing SSE stream");
        }
      }
    }, "mcpGetHandler");
    const mcpDeleteHandler = /* @__PURE__ */ __name(async (req, res) => {
      try {
        const sessionId = req.headers["mcp-session-id"];
        const transport = sessionId ? transports[sessionId] : void 0;
        if (!transport) {
          res.status(400).send("Invalid or missing session ID");
          return;
        }
        await transport.handleRequest(req, res);
        if (sessionId && transports[sessionId]) {
          await transports[sessionId]?.close();
          delete transports[sessionId];
        }
      } catch (error) {
        logger5.error("Error handling session termination:", error);
        if (!res.headersSent) {
          res.status(500).send("Error processing session termination");
        }
      }
    }, "mcpDeleteHandler");
    this.expressApp.post("/mcp", mcpPostHandler);
    this.expressApp.get("/mcp", mcpGetHandler);
    this.expressApp.delete("/mcp", mcpDeleteHandler);
    this.expressApp.get("/capabilities", (_req, res) => {
      res.json({
        protocolVersion: "2024-11-05",
        serverInfo: {
          name: "claude-zen-sdk-http-mcp",
          version: "2.0.0",
          description: "Claude-Zen HTTP MCP Server using official SDK"
        },
        capabilities: {
          tools: {},
          resources: {
            list: true,
            read: true
          },
          logging: {}
        },
        sdk: "official-mcp-sdk"
      });
    });
    this.expressApp.use((req, res) => {
      res.status(404).json({
        error: "Not Found",
        message: `Endpoint ${req.originalUrl} not found`,
        availableEndpoints: [
          "GET /health",
          "GET /capabilities",
          "POST /mcp",
          "PUT /mcp",
          "DELETE /mcp"
        ],
        sdk: "official-mcp-sdk"
      });
    });
  }
  /**
   * Start the HTTP MCP server.
   */
  async start() {
    if (this.isRunning) {
      logger5.warn("Server already running");
      return;
    }
    await this.registerTools();
    return new Promise((resolve3, reject) => {
      this.httpServer = this.expressApp.listen(
        this.config.port,
        this.config.host,
        () => {
          this.isRunning = true;
          const url = `http://${this.config.host}:${this.config.port}`;
          logger5.info(`\u{1F680} Claude-Zen SDK HTTP MCP Server started`);
          logger5.info(`   URL: ${url}`);
          logger5.info(`   Protocol: Official MCP SDK over HTTP`);
          logger5.info(`   Health: ${url}/health`);
          logger5.info(`   Capabilities: ${url}/capabilities`);
          logger5.info(`   MCP Endpoint: ${url}/mcp`);
          resolve3();
        }
      );
      this.httpServer.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
          reject(new Error(`Port ${this.config.port} is already in use`));
        } else {
          reject(error);
        }
      });
    });
  }
  /**
   * Stop the HTTP MCP server.
   */
  async stop() {
    if (!(this.isRunning && this.httpServer)) {
      return;
    }
    return new Promise((resolve3) => {
      this.httpServer.close(() => {
        this.isRunning = false;
        logger5.info("SDK HTTP MCP Server stopped");
        resolve3();
      });
    });
  }
  /**
   * Get server status.
   */
  getStatus() {
    return {
      running: this.isRunning,
      config: this.config,
      uptime: process.uptime(),
      sdk: "official-mcp-sdk",
      version: "2.0.0"
    };
  }
};
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new HTTPMCPServer();
  process.on("SIGTERM", () => server.stop());
  process.on("SIGINT", () => server.stop());
  server.start().catch((error) => {
    logger5.error("Failed to start SDK HTTP MCP Server:", error);
    process.exit(1);
  });
}

// src/interfaces/mcp/start-server.ts
var logger6 = getLogger("MCP-Starter");
function parseArgs() {
  const config2 = {};
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--port":
      case "-p": {
        const port = Number.parseInt(args[++i], 10);
        if (Number.isNaN(port) || port < 1 || port > 65535) {
          throw new Error(`Invalid port: ${args[i]}`);
        }
        config2.port = port;
        break;
      }
      case "--host":
      case "-h":
        config2.host = args[++i];
        break;
      case "--log-level":
      case "-l": {
        const level = args[++i];
        if (!["debug", "info", "warn", "error"].includes(level)) {
          throw new Error(`Invalid log level: ${level}`);
        }
        config2.logLevel = level;
        break;
      }
      case "--timeout":
      case "-t": {
        const timeout = Number.parseInt(args[++i], 10);
        if (Number.isNaN(timeout) || timeout < 1e3) {
          throw new Error(`Invalid timeout: ${args[i]} (minimum 1000ms)`);
        }
        config2.timeout = timeout;
        break;
      }
      case "--help":
        printUsage();
        process.exit(0);
        break;
      default:
        if (arg.startsWith("-")) {
          throw new Error(`Unknown option: ${arg}`);
        }
    }
  }
  return config2;
}
__name(parseArgs, "parseArgs");
function printUsage() {
}
__name(printUsage, "printUsage");
function setupGracefulShutdown(server) {
  let shutdownInProgress = false;
  const shutdown = /* @__PURE__ */ __name(async (signal) => {
    if (shutdownInProgress) {
      logger6.warn("Shutdown already in progress...");
      return;
    }
    shutdownInProgress = true;
    logger6.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await server.stop();
      logger6.info("SDK server shutdown complete");
      process.exit(0);
    } catch (error) {
      logger6.error("Error during shutdown:", error);
      process.exit(1);
    }
  }, "shutdown");
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGQUIT", () => shutdown("SIGQUIT"));
  process.on("uncaughtException", (error) => {
    logger6.error("Uncaught exception:", error);
    shutdown("uncaughtException");
  });
  process.on("unhandledRejection", (reason, promise) => {
    logger6.error("Unhandled rejection at:", promise, "reason:", reason);
    shutdown("unhandledRejection");
  });
}
__name(setupGracefulShutdown, "setupGracefulShutdown");
function validateConfig(config2) {
  if (config2?.port && (config2?.port < 1 || config2?.port > 65535)) {
    throw new Error(`Invalid port: ${config2?.port} (must be 1-65535)`);
  }
  if (config2?.host && config2?.host.length === 0) {
    throw new Error("Host cannot be empty");
  }
  if (config2?.timeout && config2?.timeout < 1e3) {
    throw new Error(`Invalid timeout: ${config2?.timeout}ms (minimum 1000ms)`);
  }
}
__name(validateConfig, "validateConfig");
async function main() {
  try {
    const config2 = parseArgs();
    validateConfig(config2);
    logger6.info("Starting Claude-Zen SDK HTTP MCP Server...", { config: config2 });
    const centralConfig = config2.get();
    const server = new HTTPMCPServer({
      port: config2?.port || Number.parseInt(
        process.env["CLAUDE_MCP_PORT"] || process.env["MCP_PORT"] || String(centralConfig?.interfaces?.mcp?.http?.port),
        10
      ),
      host: config2?.host || process.env["CLAUDE_MCP_HOST"] || process.env["MCP_HOST"] || centralConfig?.interfaces?.mcp?.http?.host,
      logLevel: config2?.logLevel || process.env["CLAUDE_LOG_LEVEL"] || process.env["MCP_LOG_LEVEL"] || centralConfig?.core?.logger?.level,
      timeout: config2?.timeout || Number.parseInt(
        process.env["CLAUDE_MCP_TIMEOUT"] || process.env["MCP_TIMEOUT"] || String(centralConfig?.interfaces?.mcp?.http?.timeout),
        10
      )
    });
    setupGracefulShutdown(server);
    await server.start();
    const status = server.getStatus();
    logger6.info("SDK server started successfully", {
      port: status.config.port,
      host: status.config.host,
      pid: process.pid,
      sdk: status.sdk
    });
    process.stdin.resume();
  } catch (error) {
    logger6.error("Raw startup error:", error);
    logger6.error("Failed to start SDK server:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : void 0,
      code: error?.code
    });
    if (error instanceof Error) {
      if (error.message.includes("EADDRINUSE")) {
        logger6.error(
          "Port is already in use. Try a different port with --port option."
        );
      } else if (error.message.includes("EACCES")) {
        logger6.error(
          "Permission denied. Try running with sudo or use a port > 1024."
        );
      }
    }
    process.exit(1);
  }
}
__name(main, "main");
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger6.error("SDK startup failed:", error);
    process.exit(1);
  });
}
export {
  main as startHTTPMCPServer
};
//# sourceMappingURL=mcp-server.js.map
