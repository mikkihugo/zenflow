
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  __commonJS,
  __name,
  __require
} from "./chunk-O4JO3PGD.js";

// node_modules/@logtape/logtape/dist/filter.cjs
var require_filter = __commonJS({
  "node_modules/@logtape/logtape/dist/filter.cjs"(exports) {
    function toFilter(filter) {
      if (typeof filter === "function") return filter;
      return getLevelFilter(filter);
    }
    __name(toFilter, "toFilter");
    function getLevelFilter(level) {
      if (level == null) return () => false;
      if (level === "fatal") return (record) => record.level === "fatal";
      else if (level === "error") return (record) => record.level === "fatal" || record.level === "error";
      else if (level === "warning") return (record) => record.level === "fatal" || record.level === "error" || record.level === "warning";
      else if (level === "info") return (record) => record.level === "fatal" || record.level === "error" || record.level === "warning" || record.level === "info";
      else if (level === "debug") return (record) => record.level === "fatal" || record.level === "error" || record.level === "warning" || record.level === "info" || record.level === "debug";
      else if (level === "trace") return () => true;
      throw new TypeError(`Invalid log level: ${level}.`);
    }
    __name(getLevelFilter, "getLevelFilter");
    exports.getLevelFilter = getLevelFilter;
    exports.toFilter = toFilter;
  }
});

// node_modules/@logtape/logtape/dist/level.cjs
var require_level = __commonJS({
  "node_modules/@logtape/logtape/dist/level.cjs"(exports) {
    var logLevels = [
      "trace",
      "debug",
      "info",
      "warning",
      "error",
      "fatal"
    ];
    function getLogLevels() {
      return [...logLevels];
    }
    __name(getLogLevels, "getLogLevels");
    function parseLogLevel(level) {
      level = level.toLowerCase();
      switch (level) {
        case "trace":
        case "debug":
        case "info":
        case "warning":
        case "error":
        case "fatal":
          return level;
        default:
          throw new TypeError(`Invalid log level: ${level}.`);
      }
    }
    __name(parseLogLevel, "parseLogLevel");
    function isLogLevel(level) {
      switch (level) {
        case "trace":
        case "debug":
        case "info":
        case "warning":
        case "error":
        case "fatal":
          return true;
        default:
          return false;
      }
    }
    __name(isLogLevel, "isLogLevel");
    function compareLogLevel(a, b) {
      const aIndex = logLevels.indexOf(a);
      if (aIndex < 0) throw new TypeError(`Invalid log level: ${JSON.stringify(a)}.`);
      const bIndex = logLevels.indexOf(b);
      if (bIndex < 0) throw new TypeError(`Invalid log level: ${JSON.stringify(b)}.`);
      return aIndex - bIndex;
    }
    __name(compareLogLevel, "compareLogLevel");
    exports.compareLogLevel = compareLogLevel;
    exports.getLogLevels = getLogLevels;
    exports.isLogLevel = isLogLevel;
    exports.parseLogLevel = parseLogLevel;
  }
});

// node_modules/@logtape/logtape/dist/logger.cjs
var require_logger = __commonJS({
  "node_modules/@logtape/logtape/dist/logger.cjs"(exports) {
    var require_level2 = require_level();
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
          const logger = child instanceof LoggerImpl2 ? child : child.deref();
          if (logger != null) logger.resetDescendants();
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
        if (this.lowestLevel === null || require_level2.compareLogLevel(level, this.lowestLevel) < 0) return;
        if (this.parent != null && this.parentSinks === "inherit") for (const sink of this.parent.getSinks(level)) yield sink;
        for (const sink of this.sinks) yield sink;
      }
      emit(record, bypassSinks) {
        if (this.lowestLevel === null || require_level2.compareLogLevel(record.level, this.lowestLevel) < 0 || !this.filter(record)) return;
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
      constructor(logger, properties) {
        this.logger = logger;
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
    exports.LoggerImpl = LoggerImpl;
    exports.getLogger = getLogger;
  }
});

// node_modules/@logtape/logtape/dist/_virtual/rolldown_runtime.cjs
var require_rolldown_runtime = __commonJS({
  "node_modules/@logtape/logtape/dist/_virtual/rolldown_runtime.cjs"(exports) {
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = /* @__PURE__ */ __name((to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
        key = keys[i];
        if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
          get: ((k) => from[k]).bind(null, key),
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
      return to;
    }, "__copyProps");
    var __toESM = /* @__PURE__ */ __name((mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
      value: mod,
      enumerable: true
    }) : target, mod)), "__toESM");
    Object.defineProperty(exports, "__toESM", {
      enumerable: true,
      get: /* @__PURE__ */ __name(function() {
        return __toESM;
      }, "get")
    });
  }
});

// node_modules/@logtape/logtape/dist/util.node.cjs
var require_util_node = __commonJS({
  "node_modules/@logtape/logtape/dist/util.node.cjs"(exports) {
    var require_rolldown_runtime2 = require_rolldown_runtime();
    var node_util = require_rolldown_runtime2.__toESM(__require("node:util"));
    function inspect(obj, options) {
      return node_util.default.inspect(obj, options);
    }
    __name(inspect, "inspect");
    exports.inspect = inspect;
  }
});

// node_modules/@logtape/logtape/dist/formatter.cjs
var require_formatter = __commonJS({
  "node_modules/@logtape/logtape/dist/formatter.cjs"(exports) {
    var require_rolldown_runtime2 = require_rolldown_runtime();
    var __util = require_rolldown_runtime2.__toESM(require_util_node());
    var levelAbbreviations = {
      "trace": "TRC",
      "debug": "DBG",
      "info": "INF",
      "warning": "WRN",
      "error": "ERR",
      "fatal": "FTL"
    };
    var inspect = typeof document !== "undefined" || typeof navigator !== "undefined" && navigator.product === "ReactNative" ? (v) => JSON.stringify(v) : "Deno" in globalThis && "inspect" in globalThis.Deno && typeof globalThis.Deno.inspect === "function" ? (v, opts) => globalThis.Deno.inspect(v, {
      strAbbreviateSize: Infinity,
      iterableLimit: Infinity,
      ...opts
    }) : __util != null && "inspect" in __util && typeof __util.inspect === "function" ? (v, opts) => __util.inspect(v, {
      maxArrayLength: Infinity,
      maxStringLength: Infinity,
      ...opts
    }) : (v) => JSON.stringify(v);
    function padZero(num) {
      return num < 10 ? `0${num}` : `${num}`;
    }
    __name(padZero, "padZero");
    function padThree(num) {
      return num < 10 ? `00${num}` : num < 100 ? `0${num}` : `${num}`;
    }
    __name(padThree, "padThree");
    var timestampFormatters = {
      "date-time-timezone": /* @__PURE__ */ __name((ts) => {
        const d = new Date(ts);
        const year = d.getUTCFullYear();
        const month = padZero(d.getUTCMonth() + 1);
        const day = padZero(d.getUTCDate());
        const hour = padZero(d.getUTCHours());
        const minute = padZero(d.getUTCMinutes());
        const second = padZero(d.getUTCSeconds());
        const ms = padThree(d.getUTCMilliseconds());
        return `${year}-${month}-${day} ${hour}:${minute}:${second}.${ms} +00:00`;
      }, "date-time-timezone"),
      "date-time-tz": /* @__PURE__ */ __name((ts) => {
        const d = new Date(ts);
        const year = d.getUTCFullYear();
        const month = padZero(d.getUTCMonth() + 1);
        const day = padZero(d.getUTCDate());
        const hour = padZero(d.getUTCHours());
        const minute = padZero(d.getUTCMinutes());
        const second = padZero(d.getUTCSeconds());
        const ms = padThree(d.getUTCMilliseconds());
        return `${year}-${month}-${day} ${hour}:${minute}:${second}.${ms} +00`;
      }, "date-time-tz"),
      "date-time": /* @__PURE__ */ __name((ts) => {
        const d = new Date(ts);
        const year = d.getUTCFullYear();
        const month = padZero(d.getUTCMonth() + 1);
        const day = padZero(d.getUTCDate());
        const hour = padZero(d.getUTCHours());
        const minute = padZero(d.getUTCMinutes());
        const second = padZero(d.getUTCSeconds());
        const ms = padThree(d.getUTCMilliseconds());
        return `${year}-${month}-${day} ${hour}:${minute}:${second}.${ms}`;
      }, "date-time"),
      "time-timezone": /* @__PURE__ */ __name((ts) => {
        const d = new Date(ts);
        const hour = padZero(d.getUTCHours());
        const minute = padZero(d.getUTCMinutes());
        const second = padZero(d.getUTCSeconds());
        const ms = padThree(d.getUTCMilliseconds());
        return `${hour}:${minute}:${second}.${ms} +00:00`;
      }, "time-timezone"),
      "time-tz": /* @__PURE__ */ __name((ts) => {
        const d = new Date(ts);
        const hour = padZero(d.getUTCHours());
        const minute = padZero(d.getUTCMinutes());
        const second = padZero(d.getUTCSeconds());
        const ms = padThree(d.getUTCMilliseconds());
        return `${hour}:${minute}:${second}.${ms} +00`;
      }, "time-tz"),
      "time": /* @__PURE__ */ __name((ts) => {
        const d = new Date(ts);
        const hour = padZero(d.getUTCHours());
        const minute = padZero(d.getUTCMinutes());
        const second = padZero(d.getUTCSeconds());
        const ms = padThree(d.getUTCMilliseconds());
        return `${hour}:${minute}:${second}.${ms}`;
      }, "time"),
      "date": /* @__PURE__ */ __name((ts) => {
        const d = new Date(ts);
        const year = d.getUTCFullYear();
        const month = padZero(d.getUTCMonth() + 1);
        const day = padZero(d.getUTCDate());
        return `${year}-${month}-${day}`;
      }, "date"),
      "rfc3339": /* @__PURE__ */ __name((ts) => new Date(ts).toISOString(), "rfc3339"),
      "none": /* @__PURE__ */ __name(() => null, "none")
    };
    var levelRenderersCache = {
      ABBR: levelAbbreviations,
      abbr: {
        trace: "trc",
        debug: "dbg",
        info: "inf",
        warning: "wrn",
        error: "err",
        fatal: "ftl"
      },
      FULL: {
        trace: "TRACE",
        debug: "DEBUG",
        info: "INFO",
        warning: "WARNING",
        error: "ERROR",
        fatal: "FATAL"
      },
      full: {
        trace: "trace",
        debug: "debug",
        info: "info",
        warning: "warning",
        error: "error",
        fatal: "fatal"
      },
      L: {
        trace: "T",
        debug: "D",
        info: "I",
        warning: "W",
        error: "E",
        fatal: "F"
      },
      l: {
        trace: "t",
        debug: "d",
        info: "i",
        warning: "w",
        error: "e",
        fatal: "f"
      }
    };
    function getTextFormatter(options = {}) {
      const timestampRenderer = (() => {
        const tsOption = options.timestamp;
        if (tsOption == null) return timestampFormatters["date-time-timezone"];
        else if (tsOption === "disabled") return timestampFormatters["none"];
        else if (typeof tsOption === "string" && tsOption in timestampFormatters) return timestampFormatters[tsOption];
        else return tsOption;
      })();
      const categorySeparator = options.category ?? "\xB7";
      const valueRenderer = options.value ?? inspect;
      const levelRenderer = (() => {
        const levelOption = options.level;
        if (levelOption == null || levelOption === "ABBR") return (level) => levelRenderersCache.ABBR[level];
        else if (levelOption === "abbr") return (level) => levelRenderersCache.abbr[level];
        else if (levelOption === "FULL") return (level) => levelRenderersCache.FULL[level];
        else if (levelOption === "full") return (level) => levelRenderersCache.full[level];
        else if (levelOption === "L") return (level) => levelRenderersCache.L[level];
        else if (levelOption === "l") return (level) => levelRenderersCache.l[level];
        else return levelOption;
      })();
      const formatter = options.format ?? (({ timestamp, level, category, message }) => `${timestamp ? `${timestamp} ` : ""}[${level}] ${category}: ${message}`);
      return (record) => {
        const msgParts = record.message;
        const msgLen = msgParts.length;
        let message;
        if (msgLen === 1) message = msgParts[0];
        else if (msgLen <= 6) {
          message = "";
          for (let i = 0; i < msgLen; i++) message += i % 2 === 0 ? msgParts[i] : valueRenderer(msgParts[i]);
        } else {
          const parts = new Array(msgLen);
          for (let i = 0; i < msgLen; i++) parts[i] = i % 2 === 0 ? msgParts[i] : valueRenderer(msgParts[i]);
          message = parts.join("");
        }
        const timestamp = timestampRenderer(record.timestamp);
        const level = levelRenderer(record.level);
        const category = typeof categorySeparator === "function" ? categorySeparator(record.category) : record.category.join(categorySeparator);
        const values = {
          timestamp,
          level,
          category,
          message,
          record
        };
        return `${formatter(values)}
`;
      };
    }
    __name(getTextFormatter, "getTextFormatter");
    var defaultTextFormatter = getTextFormatter();
    var RESET = "\x1B[0m";
    var ansiColors = {
      black: "\x1B[30m",
      red: "\x1B[31m",
      green: "\x1B[32m",
      yellow: "\x1B[33m",
      blue: "\x1B[34m",
      magenta: "\x1B[35m",
      cyan: "\x1B[36m",
      white: "\x1B[37m"
    };
    var ansiStyles = {
      bold: "\x1B[1m",
      dim: "\x1B[2m",
      italic: "\x1B[3m",
      underline: "\x1B[4m",
      strikethrough: "\x1B[9m"
    };
    var defaultLevelColors = {
      trace: null,
      debug: "blue",
      info: "green",
      warning: "yellow",
      error: "red",
      fatal: "magenta"
    };
    function getAnsiColorFormatter(options = {}) {
      const format = options.format;
      const timestampStyle = typeof options.timestampStyle === "undefined" ? "dim" : options.timestampStyle;
      const timestampColor = options.timestampColor ?? null;
      const timestampPrefix = `${timestampStyle == null ? "" : ansiStyles[timestampStyle]}${timestampColor == null ? "" : ansiColors[timestampColor]}`;
      const timestampSuffix = timestampStyle == null && timestampColor == null ? "" : RESET;
      const levelStyle = typeof options.levelStyle === "undefined" ? "bold" : options.levelStyle;
      const levelColors = options.levelColors ?? defaultLevelColors;
      const categoryStyle = typeof options.categoryStyle === "undefined" ? "dim" : options.categoryStyle;
      const categoryColor = options.categoryColor ?? null;
      const categoryPrefix = `${categoryStyle == null ? "" : ansiStyles[categoryStyle]}${categoryColor == null ? "" : ansiColors[categoryColor]}`;
      const categorySuffix = categoryStyle == null && categoryColor == null ? "" : RESET;
      return getTextFormatter({
        timestamp: "date-time-tz",
        value(value) {
          return inspect(value, { colors: true });
        },
        ...options,
        format({ timestamp, level, category, message, record }) {
          const levelColor = levelColors[record.level];
          timestamp = `${timestampPrefix}${timestamp}${timestampSuffix}`;
          level = `${levelStyle == null ? "" : ansiStyles[levelStyle]}${levelColor == null ? "" : ansiColors[levelColor]}${level}${levelStyle == null && levelColor == null ? "" : RESET}`;
          return format == null ? `${timestamp} ${level} ${categoryPrefix}${category}:${categorySuffix} ${message}` : format({
            timestamp,
            level,
            category: `${categoryPrefix}${category}${categorySuffix}`,
            message,
            record
          });
        }
      });
    }
    __name(getAnsiColorFormatter, "getAnsiColorFormatter");
    var ansiColorFormatter = getAnsiColorFormatter();
    function getJsonLinesFormatter(options = {}) {
      if (!options.categorySeparator && !options.message && !options.properties) return (record) => {
        if (record.message.length === 3) return JSON.stringify({
          "@timestamp": new Date(record.timestamp).toISOString(),
          level: record.level === "warning" ? "WARN" : record.level.toUpperCase(),
          message: record.message[0] + JSON.stringify(record.message[1]) + record.message[2],
          logger: record.category.join("."),
          properties: record.properties
        }) + "\n";
        if (record.message.length === 1) return JSON.stringify({
          "@timestamp": new Date(record.timestamp).toISOString(),
          level: record.level === "warning" ? "WARN" : record.level.toUpperCase(),
          message: record.message[0],
          logger: record.category.join("."),
          properties: record.properties
        }) + "\n";
        let msg = record.message[0];
        for (let i = 1; i < record.message.length; i++) msg += i & 1 ? JSON.stringify(record.message[i]) : record.message[i];
        return JSON.stringify({
          "@timestamp": new Date(record.timestamp).toISOString(),
          level: record.level === "warning" ? "WARN" : record.level.toUpperCase(),
          message: msg,
          logger: record.category.join("."),
          properties: record.properties
        }) + "\n";
      };
      const isTemplateMessage = options.message === "template";
      const propertiesOption = options.properties ?? "nest:properties";
      let joinCategory;
      if (typeof options.categorySeparator === "function") joinCategory = options.categorySeparator;
      else {
        const separator = options.categorySeparator ?? ".";
        joinCategory = /* @__PURE__ */ __name((category) => category.join(separator), "joinCategory");
      }
      let getProperties;
      if (propertiesOption === "flatten") getProperties = /* @__PURE__ */ __name((properties) => properties, "getProperties");
      else if (propertiesOption.startsWith("prepend:")) {
        const prefix = propertiesOption.substring(8);
        if (prefix === "") throw new TypeError(`Invalid properties option: ${JSON.stringify(propertiesOption)}. It must be of the form "prepend:<prefix>" where <prefix> is a non-empty string.`);
        getProperties = /* @__PURE__ */ __name((properties) => {
          const result = {};
          for (const key in properties) result[`${prefix}${key}`] = properties[key];
          return result;
        }, "getProperties");
      } else if (propertiesOption.startsWith("nest:")) {
        const key = propertiesOption.substring(5);
        getProperties = /* @__PURE__ */ __name((properties) => ({ [key]: properties }), "getProperties");
      } else throw new TypeError(`Invalid properties option: ${JSON.stringify(propertiesOption)}. It must be "flatten", "prepend:<prefix>", or "nest:<key>".`);
      let getMessage;
      if (isTemplateMessage) getMessage = /* @__PURE__ */ __name((record) => {
        if (typeof record.rawMessage === "string") return record.rawMessage;
        let msg = "";
        for (let i = 0; i < record.rawMessage.length; i++) msg += i % 2 < 1 ? record.rawMessage[i] : "{}";
        return msg;
      }, "getMessage");
      else getMessage = /* @__PURE__ */ __name((record) => {
        const msgLen = record.message.length;
        if (msgLen === 1) return record.message[0];
        let msg = "";
        for (let i = 0; i < msgLen; i++) msg += i % 2 < 1 ? record.message[i] : JSON.stringify(record.message[i]);
        return msg;
      }, "getMessage");
      return (record) => {
        return JSON.stringify({
          "@timestamp": new Date(record.timestamp).toISOString(),
          level: record.level === "warning" ? "WARN" : record.level.toUpperCase(),
          message: getMessage(record),
          logger: joinCategory(record.category),
          ...getProperties(record.properties)
        }) + "\n";
      };
    }
    __name(getJsonLinesFormatter, "getJsonLinesFormatter");
    var jsonLinesFormatter = getJsonLinesFormatter();
    var logLevelStyles = {
      "trace": "background-color: gray; color: white;",
      "debug": "background-color: gray; color: white;",
      "info": "background-color: white; color: black;",
      "warning": "background-color: orange; color: black;",
      "error": "background-color: red; color: white;",
      "fatal": "background-color: maroon; color: white;"
    };
    function defaultConsoleFormatter(record) {
      let msg = "";
      const values = [];
      for (let i = 0; i < record.message.length; i++) if (i % 2 === 0) msg += record.message[i];
      else {
        msg += "%o";
        values.push(record.message[i]);
      }
      const date = new Date(record.timestamp);
      const time = `${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}:${date.getUTCSeconds().toString().padStart(2, "0")}.${date.getUTCMilliseconds().toString().padStart(3, "0")}`;
      return [
        `%c${time} %c${levelAbbreviations[record.level]}%c %c${record.category.join("\xB7")} %c${msg}`,
        "color: gray;",
        logLevelStyles[record.level],
        "background-color: default;",
        "color: gray;",
        "color: default;",
        ...values
      ];
    }
    __name(defaultConsoleFormatter, "defaultConsoleFormatter");
    exports.ansiColorFormatter = ansiColorFormatter;
    exports.defaultConsoleFormatter = defaultConsoleFormatter;
    exports.defaultTextFormatter = defaultTextFormatter;
    exports.getAnsiColorFormatter = getAnsiColorFormatter;
    exports.getJsonLinesFormatter = getJsonLinesFormatter;
    exports.getTextFormatter = getTextFormatter;
    exports.jsonLinesFormatter = jsonLinesFormatter;
  }
});

// node_modules/@logtape/logtape/dist/sink.cjs
var require_sink = __commonJS({
  "node_modules/@logtape/logtape/dist/sink.cjs"(exports) {
    var require_filter2 = require_filter();
    var require_formatter2 = require_formatter();
    function withFilter(sink, filter) {
      const filterFunc = require_filter2.toFilter(filter);
      return (record) => {
        if (filterFunc(record)) sink(record);
      };
    }
    __name(withFilter, "withFilter");
    function getStreamSink(stream, options = {}) {
      const formatter = options.formatter ?? require_formatter2.defaultTextFormatter;
      const encoder = options.encoder ?? new TextEncoder();
      const writer = stream.getWriter();
      if (!options.nonBlocking) {
        let lastPromise = Promise.resolve();
        const sink = /* @__PURE__ */ __name((record) => {
          const bytes = encoder.encode(formatter(record));
          lastPromise = lastPromise.then(() => writer.ready).then(() => writer.write(bytes));
        }, "sink");
        sink[Symbol.asyncDispose] = async () => {
          await lastPromise;
          await writer.close();
        };
        return sink;
      }
      const nonBlockingConfig = options.nonBlocking === true ? {} : options.nonBlocking;
      const bufferSize = nonBlockingConfig.bufferSize ?? 100;
      const flushInterval = nonBlockingConfig.flushInterval ?? 100;
      const buffer = [];
      let flushTimer = null;
      let disposed = false;
      let activeFlush = null;
      const maxBufferSize = bufferSize * 2;
      async function flush() {
        if (buffer.length === 0) return;
        const records = buffer.splice(0);
        for (const record of records) try {
          const bytes = encoder.encode(formatter(record));
          await writer.ready;
          await writer.write(bytes);
        } catch {
        }
      }
      __name(flush, "flush");
      function scheduleFlush() {
        if (activeFlush) return;
        activeFlush = flush().finally(() => {
          activeFlush = null;
        });
      }
      __name(scheduleFlush, "scheduleFlush");
      function startFlushTimer() {
        if (flushTimer !== null || disposed) return;
        flushTimer = setInterval(() => {
          scheduleFlush();
        }, flushInterval);
      }
      __name(startFlushTimer, "startFlushTimer");
      const nonBlockingSink = /* @__PURE__ */ __name((record) => {
        if (disposed) return;
        if (buffer.length >= maxBufferSize) buffer.shift();
        buffer.push(record);
        if (buffer.length >= bufferSize) scheduleFlush();
        else if (flushTimer === null) startFlushTimer();
      }, "nonBlockingSink");
      nonBlockingSink[Symbol.asyncDispose] = async () => {
        disposed = true;
        if (flushTimer !== null) {
          clearInterval(flushTimer);
          flushTimer = null;
        }
        await flush();
        try {
          await writer.close();
        } catch {
        }
      };
      return nonBlockingSink;
    }
    __name(getStreamSink, "getStreamSink");
    function getConsoleSink(options = {}) {
      const formatter = options.formatter ?? require_formatter2.defaultConsoleFormatter;
      const levelMap = {
        trace: "debug",
        debug: "debug",
        info: "info",
        warning: "warn",
        error: "error",
        fatal: "error",
        ...options.levelMap ?? {}
      };
      const console2 = options.console ?? globalThis.console;
      const baseSink = /* @__PURE__ */ __name((record) => {
        const args = formatter(record);
        const method = levelMap[record.level];
        if (method === void 0) throw new TypeError(`Invalid log level: ${record.level}.`);
        if (typeof args === "string") {
          const msg = args.replace(/\r?\n$/, "");
          console2[method](msg);
        } else console2[method](...args);
      }, "baseSink");
      if (!options.nonBlocking) return baseSink;
      const nonBlockingConfig = options.nonBlocking === true ? {} : options.nonBlocking;
      const bufferSize = nonBlockingConfig.bufferSize ?? 100;
      const flushInterval = nonBlockingConfig.flushInterval ?? 100;
      const buffer = [];
      let flushTimer = null;
      let disposed = false;
      let flushScheduled = false;
      const maxBufferSize = bufferSize * 2;
      function flush() {
        if (buffer.length === 0) return;
        const records = buffer.splice(0);
        for (const record of records) try {
          baseSink(record);
        } catch {
        }
      }
      __name(flush, "flush");
      function scheduleFlush() {
        if (flushScheduled) return;
        flushScheduled = true;
        setTimeout(() => {
          flushScheduled = false;
          flush();
        }, 0);
      }
      __name(scheduleFlush, "scheduleFlush");
      function startFlushTimer() {
        if (flushTimer !== null || disposed) return;
        flushTimer = setInterval(() => {
          flush();
        }, flushInterval);
      }
      __name(startFlushTimer, "startFlushTimer");
      const nonBlockingSink = /* @__PURE__ */ __name((record) => {
        if (disposed) return;
        if (buffer.length >= maxBufferSize) buffer.shift();
        buffer.push(record);
        if (buffer.length >= bufferSize) scheduleFlush();
        else if (flushTimer === null) startFlushTimer();
      }, "nonBlockingSink");
      nonBlockingSink[Symbol.dispose] = () => {
        disposed = true;
        if (flushTimer !== null) {
          clearInterval(flushTimer);
          flushTimer = null;
        }
        flush();
      };
      return nonBlockingSink;
    }
    __name(getConsoleSink, "getConsoleSink");
    function fromAsyncSink(asyncSink) {
      let lastPromise = Promise.resolve();
      const sink = /* @__PURE__ */ __name((record) => {
        lastPromise = lastPromise.then(() => asyncSink(record)).catch(() => {
        });
      }, "sink");
      sink[Symbol.asyncDispose] = async () => {
        await lastPromise;
      };
      return sink;
    }
    __name(fromAsyncSink, "fromAsyncSink");
    exports.fromAsyncSink = fromAsyncSink;
    exports.getConsoleSink = getConsoleSink;
    exports.getStreamSink = getStreamSink;
    exports.withFilter = withFilter;
  }
});

// node_modules/@logtape/logtape/dist/config.cjs
var require_config = __commonJS({
  "node_modules/@logtape/logtape/dist/config.cjs"(exports) {
    var require_filter2 = require_filter();
    var require_logger2 = require_logger();
    var require_sink2 = require_sink();
    var currentConfig = null;
    var strongRefs = /* @__PURE__ */ new Set();
    var disposables = /* @__PURE__ */ new Set();
    var asyncDisposables = /* @__PURE__ */ new Set();
    function isLoggerConfigMeta(cfg) {
      return cfg.category.length === 0 || cfg.category.length === 1 && cfg.category[0] === "logtape" || cfg.category.length === 2 && cfg.category[0] === "logtape" && cfg.category[1] === "meta";
    }
    __name(isLoggerConfigMeta, "isLoggerConfigMeta");
    async function configure(config) {
      if (currentConfig != null && !config.reset) throw new ConfigError("Already configured; if you want to reset, turn on the reset flag.");
      await reset();
      try {
        configureInternal(config, true);
      } catch (e) {
        if (e instanceof ConfigError) await reset();
        throw e;
      }
    }
    __name(configure, "configure");
    function configureSync(config) {
      if (currentConfig != null && !config.reset) throw new ConfigError("Already configured; if you want to reset, turn on the reset flag.");
      if (asyncDisposables.size > 0) throw new ConfigError("Previously configured async disposables are still active. Use configure() instead or explicitly dispose them using dispose().");
      resetSync();
      try {
        configureInternal(config, false);
      } catch (e) {
        if (e instanceof ConfigError) resetSync();
        throw e;
      }
    }
    __name(configureSync, "configureSync");
    function configureInternal(config, allowAsync) {
      currentConfig = config;
      let metaConfigured = false;
      const configuredCategories = /* @__PURE__ */ new Set();
      for (const cfg of config.loggers) {
        if (isLoggerConfigMeta(cfg)) metaConfigured = true;
        const categoryKey = Array.isArray(cfg.category) ? JSON.stringify(cfg.category) : JSON.stringify([cfg.category]);
        if (configuredCategories.has(categoryKey)) throw new ConfigError(`Duplicate logger configuration for category: ${categoryKey}. Each category can only be configured once.`);
        configuredCategories.add(categoryKey);
        const logger = require_logger2.LoggerImpl.getLogger(cfg.category);
        for (const sinkId of cfg.sinks ?? []) {
          const sink = config.sinks[sinkId];
          if (!sink) throw new ConfigError(`Sink not found: ${sinkId}.`);
          logger.sinks.push(sink);
        }
        logger.parentSinks = cfg.parentSinks ?? "inherit";
        if (cfg.lowestLevel !== void 0) logger.lowestLevel = cfg.lowestLevel;
        for (const filterId of cfg.filters ?? []) {
          const filter = config.filters?.[filterId];
          if (filter === void 0) throw new ConfigError(`Filter not found: ${filterId}.`);
          logger.filters.push(require_filter2.toFilter(filter));
        }
        strongRefs.add(logger);
      }
      require_logger2.LoggerImpl.getLogger().contextLocalStorage = config.contextLocalStorage;
      for (const sink of Object.values(config.sinks)) {
        if (Symbol.asyncDispose in sink) if (allowAsync) asyncDisposables.add(sink);
        else throw new ConfigError("Async disposables cannot be used with configureSync().");
        if (Symbol.dispose in sink) disposables.add(sink);
      }
      for (const filter of Object.values(config.filters ?? {})) {
        if (filter == null || typeof filter === "string") continue;
        if (Symbol.asyncDispose in filter) if (allowAsync) asyncDisposables.add(filter);
        else throw new ConfigError("Async disposables cannot be used with configureSync().");
        if (Symbol.dispose in filter) disposables.add(filter);
      }
      if ("process" in globalThis && !("Deno" in globalThis)) {
        const proc = globalThis.process;
        if (proc?.on) proc.on("exit", allowAsync ? dispose : disposeSync);
      } else addEventListener("unload", allowAsync ? dispose : disposeSync);
      const meta = require_logger2.LoggerImpl.getLogger(["logtape", "meta"]);
      if (!metaConfigured) meta.sinks.push(require_sink2.getConsoleSink());
      meta.info("LogTape loggers are configured.  Note that LogTape itself uses the meta logger, which has category {metaLoggerCategory}.  The meta logger purposes to log internal errors such as sink exceptions.  If you are seeing this message, the meta logger is automatically configured.  It's recommended to configure the meta logger with a separate sink so that you can easily notice if logging itself fails or is misconfigured.  To turn off this message, configure the meta logger with higher log levels than {dismissLevel}.  See also <https://logtape.org/manual/categories#meta-logger>.", {
        metaLoggerCategory: ["logtape", "meta"],
        dismissLevel: "info"
      });
    }
    __name(configureInternal, "configureInternal");
    function getConfig() {
      return currentConfig;
    }
    __name(getConfig, "getConfig");
    async function reset() {
      await dispose();
      resetInternal();
    }
    __name(reset, "reset");
    function resetSync() {
      disposeSync();
      resetInternal();
    }
    __name(resetSync, "resetSync");
    function resetInternal() {
      const rootLogger = require_logger2.LoggerImpl.getLogger([]);
      rootLogger.resetDescendants();
      delete rootLogger.contextLocalStorage;
      strongRefs.clear();
      currentConfig = null;
    }
    __name(resetInternal, "resetInternal");
    async function dispose() {
      disposeSync();
      const promises = [];
      for (const disposable of asyncDisposables) {
        promises.push(disposable[Symbol.asyncDispose]());
        asyncDisposables.delete(disposable);
      }
      await Promise.all(promises);
    }
    __name(dispose, "dispose");
    function disposeSync() {
      for (const disposable of disposables) disposable[Symbol.dispose]();
      disposables.clear();
    }
    __name(disposeSync, "disposeSync");
    var ConfigError = class extends Error {
      static {
        __name(this, "ConfigError");
      }
      /**
      * Constructs a new configuration error.
      * @param message The error message.
      */
      constructor(message) {
        super(message);
        this.name = "ConfigureError";
      }
    };
    exports.ConfigError = ConfigError;
    exports.configure = configure;
    exports.configureSync = configureSync;
    exports.dispose = dispose;
    exports.disposeSync = disposeSync;
    exports.getConfig = getConfig;
    exports.reset = reset;
    exports.resetSync = resetSync;
  }
});

// node_modules/@logtape/logtape/dist/context.cjs
var require_context = __commonJS({
  "node_modules/@logtape/logtape/dist/context.cjs"(exports) {
    var require_logger2 = require_logger();
    function withContext(context, callback) {
      const rootLogger = require_logger2.LoggerImpl.getLogger();
      if (rootLogger.contextLocalStorage == null) {
        require_logger2.LoggerImpl.getLogger(["logtape", "meta"]).warn("Context-local storage is not configured.  Specify contextLocalStorage option in the configure() function.");
        return callback();
      }
      const parentContext = rootLogger.contextLocalStorage.getStore() ?? {};
      return rootLogger.contextLocalStorage.run({
        ...parentContext,
        ...context
      }, callback);
    }
    __name(withContext, "withContext");
    exports.withContext = withContext;
  }
});

// node_modules/@logtape/logtape/dist/mod.cjs
var require_mod = __commonJS({
  "node_modules/@logtape/logtape/dist/mod.cjs"(exports) {
    var require_filter2 = require_filter();
    var require_level2 = require_level();
    var require_logger2 = require_logger();
    var require_formatter2 = require_formatter();
    var require_sink2 = require_sink();
    var require_config2 = require_config();
    var require_context2 = require_context();
    exports.ConfigError = require_config2.ConfigError;
    exports.ansiColorFormatter = require_formatter2.ansiColorFormatter;
    exports.compareLogLevel = require_level2.compareLogLevel;
    exports.configure = require_config2.configure;
    exports.configureSync = require_config2.configureSync;
    exports.defaultConsoleFormatter = require_formatter2.defaultConsoleFormatter;
    exports.defaultTextFormatter = require_formatter2.defaultTextFormatter;
    exports.dispose = require_config2.dispose;
    exports.disposeSync = require_config2.disposeSync;
    exports.fromAsyncSink = require_sink2.fromAsyncSink;
    exports.getAnsiColorFormatter = require_formatter2.getAnsiColorFormatter;
    exports.getConfig = require_config2.getConfig;
    exports.getConsoleSink = require_sink2.getConsoleSink;
    exports.getJsonLinesFormatter = require_formatter2.getJsonLinesFormatter;
    exports.getLevelFilter = require_filter2.getLevelFilter;
    exports.getLogLevels = require_level2.getLogLevels;
    exports.getLogger = require_logger2.getLogger;
    exports.getStreamSink = require_sink2.getStreamSink;
    exports.getTextFormatter = require_formatter2.getTextFormatter;
    exports.isLogLevel = require_level2.isLogLevel;
    exports.jsonLinesFormatter = require_formatter2.jsonLinesFormatter;
    exports.parseLogLevel = require_level2.parseLogLevel;
    exports.reset = require_config2.reset;
    exports.resetSync = require_config2.resetSync;
    exports.toFilter = require_filter2.toFilter;
    exports.withContext = require_context2.withContext;
    exports.withFilter = require_sink2.withFilter;
  }
});

// src/core/bootstrap-logger.ts
var BootstrapLogger = class {
  static {
    __name(this, "BootstrapLogger");
  }
  logger;
  // logtape logger
  prefix;
  constructor(prefix = "system", level = 1 /* INFO */) {
    this.prefix = prefix;
    try {
      const { getLogger } = require_mod();
      this.logger = getLogger(prefix);
    } catch (error) {
      this.logger = {
        debug: /* @__PURE__ */ __name((msg, meta) => console.debug(`[${prefix}] DEBUG: ${msg}`, meta || ""), "debug"),
        info: /* @__PURE__ */ __name((msg, meta) => console.info(`[${prefix}] INFO: ${msg}`, meta || ""), "info"),
        warn: /* @__PURE__ */ __name((msg, meta) => console.warn(`[${prefix}] WARN: ${msg}`, meta || ""), "warn"),
        error: /* @__PURE__ */ __name((msg, meta) => console.error(`[${prefix}] ERROR: ${msg}`, meta || ""), "error")
      };
    }
  }
  debug(message, meta) {
    this.logger.debug(message, meta);
  }
  info(message, meta) {
    this.logger.info(message, meta);
  }
  warn(message, meta) {
    this.logger.warn(message, meta);
  }
  error(message, meta) {
    this.logger.error(message, meta);
  }
};
function createBootstrapLogger(prefix) {
  return new BootstrapLogger(prefix);
}
__name(createBootstrapLogger, "createBootstrapLogger");
var systemLogger = createBootstrapLogger("system");

// src/core/logger.ts
var EnhancedLogger = class {
  static {
    __name(this, "EnhancedLogger");
  }
  bootstrapLogger;
  configLoaded = false;
  prefix;
  constructor(prefix) {
    this.prefix = prefix;
    this.bootstrapLogger = createBootstrapLogger(prefix);
  }
  /**
   * Upgrade logger with config (called after config system is ready).
   *
   * @param config
   */
  upgradeWithConfig(config) {
    try {
      const centralConfig = config?.getAll?.();
      if (centralConfig) {
        this.configLoaded = true;
      }
    } catch (error) {
      this.bootstrapLogger.error("Failed to upgrade logger with config", error);
    }
  }
  debug(message, meta) {
    this.bootstrapLogger.debug(message, meta);
  }
  info(message, meta) {
    this.bootstrapLogger.info(message, meta);
  }
  warn(message, meta) {
    this.bootstrapLogger.warn(message, meta);
  }
  error(message, meta) {
    this.bootstrapLogger.error(message, meta);
  }
};
var loggerRegistry = /* @__PURE__ */ new Map();
var Logger = class extends EnhancedLogger {
  static {
    __name(this, "Logger");
  }
  constructor(prefix = "system") {
    super(prefix);
    loggerRegistry.set(prefix, this);
  }
};
function createLogger(prefix = "system") {
  return new Logger(prefix);
}
__name(createLogger, "createLogger");

export {
  createLogger
};
//# sourceMappingURL=chunk-MPG6LEYZ.js.map
