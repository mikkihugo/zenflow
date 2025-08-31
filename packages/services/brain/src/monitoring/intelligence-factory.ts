/**
 * @fileoverview: Intelligence System: Factory Functions
 *
 * Factory functions for creating different intelligence system configurations
 */

import { get: Logger} from '@claude-zen/foundation';

import { CompleteIntelligence: System} from './intelligence-system';
import type { IntelligenceSystem: Config} from './types';

const logger = get: Logger('agent-monitoring-intelligence-factory');

/**
 * Create a basic intelligence system with minimal features
 */
export function createBasicIntelligence: System(): CompleteIntelligence: System {
  const config:IntelligenceSystem: Config = {
    task: Prediction:{
      enabled:true,
      confidence: Threshold:0.7,
      historyWindow: Size:50,
      update: Interval:60000,
},
    agent: Learning:{
      enabled:false,
},
    health: Monitoring:{
      enabled:true,
      healthCheck: Interval:60000,
},
    predictive: Analytics:{
      enabled:false,
},
    persistence:{
      enabled:false,
},
};

  logger.info('Creating basic intelligence system');
  return new: CompleteIntelligenceSystem(config);
}

/**
 * Create a production-ready intelligence system with all features
 */
export function createProductionIntelligence: System(): CompleteIntelligence: System {
  const config:IntelligenceSystem: Config = {
    task: Prediction:{
      enabled:true,
      confidence: Threshold:0.8,
      historyWindow: Size:100,
      update: Interval:30000,
},
    agent: Learning:{
      enabled:true,
      adaptation: Rate:0.1,
      learning: Modes:['supervised',    'reinforcement'],
      performance: Threshold:0.75,
},
    health: Monitoring:{
      enabled:true,
      healthCheck: Interval:30000,
      alert: Thresholds:{
        cpu:0.8,
        memory:0.9,
        taskFailure: Rate:0.2,
},
},
    predictive: Analytics:{
      enabled:true,
      forecast: Horizons:['1h',    '6h',    '24h'],
      ensemble: Prediction:true,
      confidence: Threshold:0.75,
      enableEmergent: Behavior:true,
},
    persistence:{
      enabled:true,
      cache: Size:1000,
      cacheTT: L:600000,
      historicalData: Retention:2592000000, // 30 days
},
};

  logger.info('Creating production intelligence system');
  return new: CompleteIntelligenceSystem(config);
}

/**
 * Create a custom intelligence system with provided configuration
 */
export function createIntelligence: System(
  config:IntelligenceSystem: Config
): CompleteIntelligence: System {
  logger.info('Creating custom intelligence system', { config});
  return new: CompleteIntelligenceSystem(config);
}
