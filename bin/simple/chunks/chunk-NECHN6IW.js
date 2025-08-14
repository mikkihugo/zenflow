
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  __name
} from "./chunk-O4JO3PGD.js";

// node_modules/@logtape/logtape/dist/level.js
var logLevels = [
  "trace",
  "debug",
  "info",
  "warning",
  "error",
  "fatal"
];
function compareLogLevel(a, b) {
  const aIndex = logLevels.indexOf(a);
  if (aIndex < 0) throw new TypeError(`Invalid log level: ${JSON.stringify(a)}.`);
  const bIndex = logLevels.indexOf(b);
  if (bIndex < 0) throw new TypeError(`Invalid log level: ${JSON.stringify(b)}.`);
  return aIndex - bIndex;
}
__name(compareLogLevel, "compareLogLevel");

// node_modules/@logtape/logtape/dist/logger.js
function getLogger(category = []) {
  return LoggerImpl.getLogger(category);
}
__name(getLogger, "getLogger");
var globalRootLoggerSymbol = Symbol.for("logtape.rootLogger");
var LoggerImpl = class LoggerImpl2 {
  static {
    __name(this, "LoggerImpl");
  }
  parent;
  children;
  category;
  sinks;
  parentSinks = "inherit";
  filters;
  lowestLevel = "trace";
  contextLocalStorage;
  static getLogger(category = []) {
    let rootLogger = globalRootLoggerSymbol in globalThis ? globalThis[globalRootLoggerSymbol] ?? null : null;
    if (rootLogger == null) {
      rootLogger = new LoggerImpl2(null, []);
      globalThis[globalRootLoggerSymbol] = rootLogger;
    }
    if (typeof category === "string") return rootLogger.getChild(category);
    if (category.length === 0) return rootLogger;
    return rootLogger.getChild(category);
  }
  constructor(parent, category) {
    this.parent = parent;
    this.children = {};
    this.category = category;
    this.sinks = [];
    this.filters = [];
  }
  getChild(subcategory) {
    const name = typeof subcategory === "string" ? subcategory : subcategory[0];
    const childRef = this.children[name];
    let child = childRef instanceof LoggerImpl2 ? childRef : childRef?.deref();
    if (child == null) {
      child = new LoggerImpl2(this, [...this.category, name]);
      this.children[name] = "WeakRef" in globalThis ? new WeakRef(child) : child;
    }
    if (typeof subcategory === "string" || subcategory.length === 1) return child;
    return child.getChild(subcategory.slice(1));
  }
  /**
  * Reset the logger.  This removes all sinks and filters from the logger.
  */
  reset() {
    while (this.sinks.length > 0) this.sinks.shift();
    this.parentSinks = "inherit";
    while (this.filters.length > 0) this.filters.shift();
    this.lowestLevel = "trace";
  }
  /**
  * Reset the logger and all its descendants.  This removes all sinks and
  * filters from the logger and all its descendants.
  */
  resetDescendants() {
    for (const child of Object.values(this.children)) {
      const logger2 = child instanceof LoggerImpl2 ? child : child.deref();
      if (logger2 != null) logger2.resetDescendants();
    }
    this.reset();
  }
  with(properties) {
    return new LoggerCtx(this, { ...properties });
  }
  filter(record) {
    for (const filter of this.filters) if (!filter(record)) return false;
    if (this.filters.length < 1) return this.parent?.filter(record) ?? true;
    return true;
  }
  *getSinks(level) {
    if (this.lowestLevel === null || compareLogLevel(level, this.lowestLevel) < 0) return;
    if (this.parent != null && this.parentSinks === "inherit") for (const sink of this.parent.getSinks(level)) yield sink;
    for (const sink of this.sinks) yield sink;
  }
  emit(record, bypassSinks) {
    if (this.lowestLevel === null || compareLogLevel(record.level, this.lowestLevel) < 0 || !this.filter(record)) return;
    for (const sink of this.getSinks(record.level)) {
      if (bypassSinks?.has(sink)) continue;
      try {
        sink(record);
      } catch (error) {
        const bypassSinks2 = new Set(bypassSinks);
        bypassSinks2.add(sink);
        metaLogger.log("fatal", "Failed to emit a log record to sink {sink}: {error}", {
          sink,
          error,
          record
        }, bypassSinks2);
      }
    }
  }
  log(level, rawMessage, properties, bypassSinks) {
    const implicitContext = LoggerImpl2.getLogger().contextLocalStorage?.getStore() ?? {};
    let cachedProps = void 0;
    const record = typeof properties === "function" ? {
      category: this.category,
      level,
      timestamp: Date.now(),
      get message() {
        return parseMessageTemplate(rawMessage, this.properties);
      },
      rawMessage,
      get properties() {
        if (cachedProps == null) cachedProps = {
          ...implicitContext,
          ...properties()
        };
        return cachedProps;
      }
    } : {
      category: this.category,
      level,
      timestamp: Date.now(),
      message: parseMessageTemplate(rawMessage, {
        ...implicitContext,
        ...properties
      }),
      rawMessage,
      properties: {
        ...implicitContext,
        ...properties
      }
    };
    this.emit(record, bypassSinks);
  }
  logLazily(level, callback, properties = {}) {
    const implicitContext = LoggerImpl2.getLogger().contextLocalStorage?.getStore() ?? {};
    let rawMessage = void 0;
    let msg = void 0;
    function realizeMessage() {
      if (msg == null || rawMessage == null) {
        msg = callback((tpl, ...values) => {
          rawMessage = tpl;
          return renderMessage(tpl, values);
        });
        if (rawMessage == null) throw new TypeError("No log record was made.");
      }
      return [msg, rawMessage];
    }
    __name(realizeMessage, "realizeMessage");
    this.emit({
      category: this.category,
      level,
      get message() {
        return realizeMessage()[0];
      },
      get rawMessage() {
        return realizeMessage()[1];
      },
      timestamp: Date.now(),
      properties: {
        ...implicitContext,
        ...properties
      }
    });
  }
  logTemplate(level, messageTemplate, values, properties = {}) {
    const implicitContext = LoggerImpl2.getLogger().contextLocalStorage?.getStore() ?? {};
    this.emit({
      category: this.category,
      level,
      message: renderMessage(messageTemplate, values),
      rawMessage: messageTemplate,
      timestamp: Date.now(),
      properties: {
        ...implicitContext,
        ...properties
      }
    });
  }
  trace(message, ...values) {
    if (typeof message === "string") this.log("trace", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("trace", message);
    else if (!Array.isArray(message)) this.log("trace", "{*}", message);
    else this.logTemplate("trace", message, values);
  }
  debug(message, ...values) {
    if (typeof message === "string") this.log("debug", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("debug", message);
    else if (!Array.isArray(message)) this.log("debug", "{*}", message);
    else this.logTemplate("debug", message, values);
  }
  info(message, ...values) {
    if (typeof message === "string") this.log("info", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("info", message);
    else if (!Array.isArray(message)) this.log("info", "{*}", message);
    else this.logTemplate("info", message, values);
  }
  warn(message, ...values) {
    if (typeof message === "string") this.log("warning", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("warning", message);
    else if (!Array.isArray(message)) this.log("warning", "{*}", message);
    else this.logTemplate("warning", message, values);
  }
  warning(message, ...values) {
    this.warn(message, ...values);
  }
  error(message, ...values) {
    if (typeof message === "string") this.log("error", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("error", message);
    else if (!Array.isArray(message)) this.log("error", "{*}", message);
    else this.logTemplate("error", message, values);
  }
  fatal(message, ...values) {
    if (typeof message === "string") this.log("fatal", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("fatal", message);
    else if (!Array.isArray(message)) this.log("fatal", "{*}", message);
    else this.logTemplate("fatal", message, values);
  }
};
var LoggerCtx = class LoggerCtx2 {
  static {
    __name(this, "LoggerCtx");
  }
  logger;
  properties;
  constructor(logger2, properties) {
    this.logger = logger2;
    this.properties = properties;
  }
  get category() {
    return this.logger.category;
  }
  get parent() {
    return this.logger.parent;
  }
  getChild(subcategory) {
    return this.logger.getChild(subcategory).with(this.properties);
  }
  with(properties) {
    return new LoggerCtx2(this.logger, {
      ...this.properties,
      ...properties
    });
  }
  log(level, message, properties, bypassSinks) {
    this.logger.log(level, message, typeof properties === "function" ? () => ({
      ...this.properties,
      ...properties()
    }) : {
      ...this.properties,
      ...properties
    }, bypassSinks);
  }
  logLazily(level, callback) {
    this.logger.logLazily(level, callback, this.properties);
  }
  logTemplate(level, messageTemplate, values) {
    this.logger.logTemplate(level, messageTemplate, values, this.properties);
  }
  trace(message, ...values) {
    if (typeof message === "string") this.log("trace", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("trace", message);
    else if (!Array.isArray(message)) this.log("trace", "{*}", message);
    else this.logTemplate("trace", message, values);
  }
  debug(message, ...values) {
    if (typeof message === "string") this.log("debug", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("debug", message);
    else if (!Array.isArray(message)) this.log("debug", "{*}", message);
    else this.logTemplate("debug", message, values);
  }
  info(message, ...values) {
    if (typeof message === "string") this.log("info", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("info", message);
    else if (!Array.isArray(message)) this.log("info", "{*}", message);
    else this.logTemplate("info", message, values);
  }
  warn(message, ...values) {
    if (typeof message === "string") this.log("warning", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("warning", message);
    else if (!Array.isArray(message)) this.log("warning", "{*}", message);
    else this.logTemplate("warning", message, values);
  }
  warning(message, ...values) {
    this.warn(message, ...values);
  }
  error(message, ...values) {
    if (typeof message === "string") this.log("error", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("error", message);
    else if (!Array.isArray(message)) this.log("error", "{*}", message);
    else this.logTemplate("error", message, values);
  }
  fatal(message, ...values) {
    if (typeof message === "string") this.log("fatal", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("fatal", message);
    else if (!Array.isArray(message)) this.log("fatal", "{*}", message);
    else this.logTemplate("fatal", message, values);
  }
};
var metaLogger = LoggerImpl.getLogger(["logtape", "meta"]);
function parseMessageTemplate(template, properties) {
  const length = template.length;
  if (length === 0) return [""];
  if (!template.includes("{")) return [template];
  const message = [];
  let startIndex = 0;
  for (let i = 0; i < length; i++) {
    const char = template[i];
    if (char === "{") {
      const nextChar = i + 1 < length ? template[i + 1] : "";
      if (nextChar === "{") {
        i++;
        continue;
      }
      const closeIndex = template.indexOf("}", i + 1);
      if (closeIndex === -1) continue;
      const beforeText = template.slice(startIndex, i);
      message.push(beforeText.replace(/{{/g, "{").replace(/}}/g, "}"));
      const key = template.slice(i + 1, closeIndex);
      let prop;
      const trimmedKey = key.trim();
      if (trimmedKey === "*") prop = key in properties ? properties[key] : "*" in properties ? properties["*"] : properties;
      else if (key !== trimmedKey) prop = key in properties ? properties[key] : properties[trimmedKey];
      else prop = properties[key];
      message.push(prop);
      i = closeIndex;
      startIndex = i + 1;
    } else if (char === "}" && i + 1 < length && template[i + 1] === "}") i++;
  }
  const remainingText = template.slice(startIndex);
  message.push(remainingText.replace(/{{/g, "{").replace(/}}/g, "}"));
  return message;
}
__name(parseMessageTemplate, "parseMessageTemplate");
function renderMessage(template, values) {
  const args = [];
  for (let i = 0; i < template.length; i++) {
    args.push(template[i]);
    if (i < values.length) args.push(values[i]);
  }
  return args;
}
__name(renderMessage, "renderMessage");

// src/config/logging-config.ts
var LoggingConfigurationManager = class _LoggingConfigurationManager {
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
    const nodeEnv = "development";
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
    const logger2 = this.createLoggerForComponent(component);
    this.loggers.set(component, logger2);
    return logger2;
  }
  createLoggerForComponent(component) {
    const componentLevel = this.config.components[component] || this.config.level;
    const originalLevel = process.env["LOG_LEVEL"];
    process.env["LOG_LEVEL"] = componentLevel;
    try {
      const coreLogger = getLogger(component);
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
        delete process.env["LOG_LEVEL"];
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
    const logger2 = this.getLogger(component);
    return {
      debug: /* @__PURE__ */ __name((message, meta) => logger2.debug(message, meta), "debug"),
      // For console.log replacement, use info level
      info: /* @__PURE__ */ __name((message, meta) => logger2.info(message, meta), "info"),
      warn: /* @__PURE__ */ __name((message, meta) => logger2.warn(message, meta), "warn"),
      error: /* @__PURE__ */ __name((message, meta) => logger2.error(message, meta), "error"),
      success: logger2.success || ((message, meta) => logger2.info(message, meta)),
      progress: logger2.progress || ((message, meta) => logger2.info(message, meta))
    };
  }
  /**
   * Enable debug logging for development.
   */
  enableDebugMode() {
    this.updateConfig({
      level: "debug" /* DEBUG */,
      components: Object.fromEntries(
        Object.keys(this.config.components).map((key) => [key, "debug" /* DEBUG */])
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
        Object.keys(this.config.components).map((key) => [key, "info" /* INFO */])
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
        Object.keys(this.config.components).map((key) => [key, "error" /* ERROR */])
      )
    });
  }
};
var loggingConfigManager = LoggingConfigurationManager.getInstance();
function getLogger2(component) {
  return loggingConfigManager?.getLogger(component);
}
__name(getLogger2, "getLogger");
function getConsoleReplacementLogger(component) {
  return loggingConfigManager?.createConsoleReplacementLogger(component);
}
__name(getConsoleReplacementLogger, "getConsoleReplacementLogger");
var logger = {
  // Default system logger
  system: getLogger2("system"),
  // CLI output logger
  cli: getConsoleReplacementLogger("cli"),
  // Swarm coordination logger
  swarm: getLogger2("swarm-coordinator"),
  // Neural network logger
  neural: getLogger2("neural-network"),
  // MCP server logger
  mcp: getLogger2("mcp-server"),
  // Database logger
  database: getLogger2("database")
};
var logEntries = [];
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

export {
  getLogger2 as getLogger
};
//# sourceMappingURL=chunk-NECHN6IW.js.map
