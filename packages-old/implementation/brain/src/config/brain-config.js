/**
 * @file Brain Configuration using Foundation Infrastructure
 *
 * Demonstrates optimal usage of @claude-zen/foundation components:
 * - Shared config system with validation
 * - Centralized logging configuration
 * - Type-safe configuration management
 * - Performance metrics integration
 * - Storage configuration
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (const p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
const __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
const __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    let _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === 'function' ? Iterator : Object).prototype
      );
    return (
      (g.next = verb(0)),
      (g.throw = verb(1)),
      (g.return = verb(2)),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, '__esModule', { value: true });
exports.DEFAULT_BRAIN_CONFIG = void 0;
exports.getBrainConfig = getBrainConfig;
exports.validateBrainConfig = validateBrainConfig;
exports.initializeBrainSystem = initializeBrainSystem;
const foundation_1 = require('@claude-zen/foundation');
const logger = (0, foundation_1.getLogger)('BrainConfig');
exports.DEFAULT_BRAIN_CONFIG = {
  wasmPath: './wasm/claude_zen_neural',
  maxNetworks: 10,
  defaultBatchSize: 32,
  enableGPU: false,
  neuralPresets: {
    enablePresets: true,
    defaultPreset: 'BASIC_CLASSIFIER',
  },
  dspy: {
    teleprompter: 'MIPROv2',
    maxTokens: 4000,
    optimizationSteps: 50,
    coordinationFeedback: true,
  },
  performance: {
    enableBenchmarking: (0, foundation_1.isDebugMode)(),
    trackMetrics: (0, foundation_1.areMetricsEnabled)(),
    autoOptimize: false,
  },
};
/**
 * Get brain configuration using shared infrastructure
 */
function getBrainConfig() {
  try {
    // Get shared configuration (handles environment, validation, etc.)
    const sharedConfig = (0, foundation_1.getConfig)();
    // Get neural-specific config from shared system
    const neuralConfig = foundation_1.getNeuralConfig
      ? (0, foundation_1.getNeuralConfig)() || {}
      : {};
    // Log neural config availability for debugging
    logger.debug('Neural configuration loaded', {
      hasNeuralConfig: Object.keys(neuralConfig).length > 0,
      neuralConfigKeys: Object.keys(neuralConfig),
      getNeuralConfigAvailable: Boolean(foundation_1.getNeuralConfig),
    });
    // Get environment-specific settings
    const debugMode = (0, foundation_1.isDebugMode)();
    // Use NODE_ENV or fallback to debug mode inference
    const environment =
      process.env.NODE_ENV || (debugMode ? 'development' : 'production');
    logger.info('Loading brain config for environment: '.concat(environment), {
      debugMode,
    });
    // Merge configurations with proper precedence
    const brainConfig = __assign(
      __assign(__assign({}, exports.DEFAULT_BRAIN_CONFIG), neuralConfig),
      {
        // Environment-specific overrides
        enableGPU:
          environment === 'production'
            ? false
            : exports.DEFAULT_BRAIN_CONFIG.enableGPU,
        performance: __assign(
          __assign({}, exports.DEFAULT_BRAIN_CONFIG.performance),
          {
            enableBenchmarking: debugMode,
            trackMetrics:
              (0, foundation_1.areMetricsEnabled)() && environment !== 'test',
          }
        ),
        // Production optimizations
        dspy: __assign(__assign({}, exports.DEFAULT_BRAIN_CONFIG.dspy), {
          maxTokens: environment === 'production' ? 2000 : 4000,
          optimizationSteps: environment === 'production' ? 25 : 50,
        }),
      }
    );
    logger.info('Brain configuration loaded successfully', {
      wasmEnabled: !!brainConfig.wasmPath,
      gpuEnabled: brainConfig.enableGPU,
      environment,
    });
    return __assign(__assign({}, brainConfig), sharedConfig);
  } catch (error) {
    logger.error('Failed to load brain configuration:', error);
    throw new Error(
      'Brain configuration failed: '.concat(
        error instanceof Error ? error.message : String(error)
      )
    );
  }
}
/**
 * Validate brain configuration
 */
function validateBrainConfig(config) {
  let _a;
  try {
    if (!config.wasmPath || typeof config.wasmPath !== 'string') {
      throw new Error('wasmPath must be a valid string');
    }
    if (
      config.maxNetworks &&
      (config.maxNetworks < 1 || config.maxNetworks > 100)
    ) {
      throw new Error('maxNetworks must be between 1 and 100');
    }
    if (
      config.defaultBatchSize &&
      (config.defaultBatchSize < 1 || config.defaultBatchSize > 1024)
    ) {
      throw new Error('defaultBatchSize must be between 1 and 1024');
    }
    if (
      ((_a = config.dspy) === null || _a === void 0 ? void 0 : _a.maxTokens) &&
      (config.dspy.maxTokens < 100 || config.dspy.maxTokens > 10000)
    ) {
      throw new Error('DSPy maxTokens must be between 100 and 10000');
    }
    logger.info('Brain configuration validation passed');
    return true;
  } catch (error) {
    logger.error('Brain configuration validation failed:', error);
    throw error;
  }
}
/**
 * Initialize brain system with shared infrastructure
 */
function initializeBrainSystem() {
  return __awaiter(this, void 0, void 0, function () {
    let config;
    return __generator(this, (_a) => {
      logger.info('Initializing brain system with shared infrastructure...');
      try {
        config = getBrainConfig();
        validateBrainConfig(config);
        // Initialize shared services as needed
        // The shared system handles: logging, config management, etc.
        logger.info('Brain system initialization completed', {
          configValid: true,
          sharedInfrastructure: 'active',
        });
        return [2 /*return*/, config];
      } catch (error) {
        logger.error('Brain system initialization failed:', error);
        throw error;
      }
    });
  });
}
exports.default = {
  getBrainConfig,
  validateBrainConfig,
  initializeBrainSystem,
  DEFAULT_BRAIN_CONFIG: exports.DEFAULT_BRAIN_CONFIG,
};
