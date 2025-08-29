/**
 * @fileoverview Intelligence System Factory Functions
 *
 * Factory functions for creating different intelligence system configurations
 */

// Simple logger placeholder
const getLogger = (name: string) => ({
  info:(msg: string, meta?:unknown) =>
    logger.info(`[INFO: ${name}] ${msg}`, meta || '),
  debug:(msg: string, meta?:unknown) =>
    logger.info(`[DEBUG: ${name}] ${msg}`, meta || '),
  warn:(msg: string, meta?:unknown) =>
    logger.warn(`[WARN: ${name}] ${msg}`, meta || '),
  error:(msg: string, meta?:unknown) =>
    logger.error(`[ERROR: ${name}] ${msg}`, meta || '),
});
import { CompleteIntelligenceSystem } from './intelligence-system';
import type { IntelligenceSystemConfig} from './types';

const logger = getLogger('agent-monitoring-intelligence-factory');

/**
 * Create a basic intelligence system with minimal features
 */
export function createBasicIntelligenceSystem(inputConfig?:IntelligenceSystemConfig
): CompleteIntelligenceSystem {
  const config: IntelligenceSystemConfig = {
    taskPrediction:{
      enabled: true,
      confidenceThreshold:0.7,
      historyWindowSize:50,
      updateInterval:60000,
},
    agentLearning:{
      enabled: false,
},
    healthMonitoring:{
      enabled: true,
      healthCheckInterval:60000,
},
    predictiveAnalytics:{
      enabled: false,
},
    persistence:{
      enabled: false,
},
};

  logger.info('Creating basic intelligence system');
  const finalConfig = { ...config, ...inputConfig};
  return new CompleteIntelligenceSystem(finalConfig);
}

/**
 * Create a production-ready intelligence system with all features
 */
export function createProductionIntelligenceSystem(inputConfig?:IntelligenceSystemConfig
): CompleteIntelligenceSystem {
  const config: IntelligenceSystemConfig = {
    taskPrediction:{
      enabled: true,
      confidenceThreshold:0.8,
      historyWindowSize:100,
      updateInterval:30000,
},
    agentLearning:{
      enabled: true,
      adaptationRate:0.1,
      learningModes:['supervised',    'reinforcement'],
      performanceThreshold:0.75,
},
    healthMonitoring:{
      enabled: true,
      healthCheckInterval:30000,
      alertThresholds:{
        cpu:0.8,
        memory:0.9,
        taskFailureRate:0.2,
},
},
    predictiveAnalytics:{
      enabled: true,
      forecastHorizons:['1h',    '6h',    '24h'],
      ensemblePrediction: true,
      confidenceThreshold:0.75,
      enableEmergentBehavior: true,
},
    persistence:{
      enabled: true,
      cacheSize:1000,
      cacheTTL:600000,
      historicalDataRetention:2592000000, // 30 days
},
};

  logger.info('Creating production intelligence system');
  const finalConfig = { ...config, ...inputConfig};
  return new CompleteIntelligenceSystem(finalConfig);
}

/**
 * Create a custom intelligence system with provided configuration
 */
export function createIntelligenceSystem(config: IntelligenceSystemConfig
): CompleteIntelligenceSystem {
  logger.info('Creating custom intelligence system', { config});
  return new CompleteIntelligenceSystem(config);
}
