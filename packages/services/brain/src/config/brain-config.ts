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

import {
type Config,
getConfig,
getLogger,
getNeuralConfig,
isDebugMode,
} from '@claude-zen/foundation';

const logger = getLogger('BrainConfig');

export interface BrainSpecificConfig {
wasmPath:string;
maxNetworks:number;
defaultBatchSize:number;
enableGPU:boolean;
neuralPresets:{
enablePresets:boolean;
defaultPreset:string;
customPresets?:Record<string, any>;
};
dspy:{
teleprompter:|'MIPROv2|BootstrapFewShot|LabeledFewShot|Ensemble;
maxTokens:number;
optimizationSteps:number;
coordinationFeedback:boolean;
// Uses external @zen-ai/dspy-engine for implementation
};
performance:{
enableBenchmarking:boolean;
trackMetrics:boolean;
autoOptimize:boolean;
};
}

export const DEFAULT_BRAIN_CONFIG:BrainSpecificConfig = {
wasmPath: './wasm/claude_zen_neural', maxNetworks:10,
defaultBatchSize:32,
enableGPU:false,
neuralPresets:{
enablePresets:true,
defaultPreset: 'BASIC_CLASSIFIER',},
dspy:{
teleprompter: 'MIPROv2', maxTokens:4000,
optimizationSteps:50,
coordinationFeedback:true,
},
performance:{
enableBenchmarking:isDebugMode(),
trackMetrics:true, // Default to true, controlled by operations facade
autoOptimize:false,
},
};

/**
* Get brain configuration using shared infrastructure
*/
export function getBrainConfig():BrainSpecificConfig & Partial<Config> {
try {
// Get shared configuration (handles environment, validation, etc.)
const __sharedConfig = getConfig();

// Get neural-specific config from shared system
const neuralConfig = getNeuralConfig ? getNeuralConfig()||{} :{};

// Log neural config availability for debugging
logger.debug('Neural configuration loaded', {
') hasNeuralConfig:Object.keys(neuralConfig).length > 0,
neuralConfigKeys:Object.keys(neuralConfig),
getNeuralConfigAvailable:Boolean(getNeuralConfig),
});

// Get environment-specific settings
const debugMode = isDebugMode();
// Use NODE_ENV or fallback to debug mode inference
const __environment =
process.env.NODE_ENV || (debugMode ? 'development' : 'production');
logger.info(`Loading brain config for environment: ${__environment}`, {
debugMode,
});

// Merge configurations with proper precedence
const brainConfig:BrainSpecificConfig = {
...DEFAULT_BRAIN_CONFIG,
// Apply neural-specific configuration if available
...(neuralConfig as Partial<BrainSpecificConfig>),
// Environment-specific overrides
enableGPU:
environment === 'production' ? false:DEFAULT_BRAIN_CONFIG.enableGPU,
performance:{
...DEFAULT_BRAIN_CONFIG.performance,
enableBenchmarking:debugMode,
trackMetrics:environment !== 'test', // Controlled by operations facade')},
// Production optimizations
dspy:{
...DEFAULT_BRAIN_CONFIG.dspy,
maxTokens:environment === 'production' ? 2000 : 4000,
optimizationSteps:environment === 'production' ? 25 : 50,
},
};

logger.info('Brain configuration loaded successfully', {
') wasmEnabled:!!brainConfig.wasmPath,
gpuEnabled:brainConfig.enableGPU,
environment,
});

return {
...brainConfig,
...sharedConfig,
} as BrainSpecificConfig & Partial<Config>;
} catch (error) {
logger.error('Failed to load brain configuration:', error);') throw new Error(
`Brain configuration failed:${error instanceof Error ? error.message : String(error)}``
);
}
}

/**
* Validate brain configuration
*/
export function validateBrainConfig(
config:Partial<BrainSpecificConfig>
):boolean {
try {
if (!config.wasmPath||typeof config.wasmPath !=='string') {
') throw new Error('wasmPath must be a valid string');')}

if (
config.maxNetworks &&
(config.maxNetworks < 1||config.maxNetworks > 100)
) {
throw new Error('maxNetworks must be between 1 and 100');')}

if (
config.defaultBatchSize &&
(config.defaultBatchSize < 1||config.defaultBatchSize > 1024)
) {
throw new Error('defaultBatchSize must be between 1 and 1024');')}

if (
config.dspy?.maxTokens &&
(config.dspy.maxTokens < 100||config.dspy.maxTokens > 10000)
) {
throw new Error('DSPy maxTokens must be between 100 and 10000');')}

logger.info('Brain configuration validation passed');') return true;
} catch (error) {
logger.error('Brain configuration validation failed:', error);') throw error;
}
}

/**
* Initialize brain system with shared infrastructure
*/
export async function initializeBrainSystem():Promise<
BrainSpecificConfig & Partial<Config>
> {
logger.info('Initializing brain system with shared infrastructure...');')
try {
// Load and validate configuration
const config = getBrainConfig();
validateBrainConfig(config);

// Allow system initialization to complete
await new Promise(resolve => setTimeout(resolve, 0));

// Initialize shared services as needed
// The shared system handles:logging, config management, etc.

logger.info('Brain system initialization completed', {
') configValid:true,
sharedInfrastructure: 'active',});

return config;
} catch (error) {
logger.error('Brain system initialization failed:', error);') throw error;
}
}

export default {
getBrainConfig,
validateBrainConfig,
initializeBrainSystem,
DEFAULT_BRAIN_CONFIG,
};
