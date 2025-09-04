/**
* @fileoverview Intelligence System Factory Functions
*
* Factory functions for creating different intelligence system configurations
*/

import { getLogger} from '@claude-zen/foundation';

import { CompleteIntelligenceSystem} from './analysis-engine';
import type { IntelligenceSystemConfig} from './types';

const logger = getLogger('agent-monitoring-intelligence-factory');

/**
* Create a basic intelligence system with minimal features
*/
export function createBasicIntelligenceSystem():CompleteIntelligenceSystem {
const config:IntelligenceSystemConfig = {
taskPrediction:{
enabled:true,
confidenceThreshold:0.7,
historyWindowSize:50,
updateInterval:60000,
},
agentLearning:{
enabled:false,
},
healthMonitoring:{
enabled:true,
healthCheckInterval:60000,
},
predictiveAnalytics:{
enabled:false,
},
persistence:{
enabled:false,
},
};

logger.info('Creating basic intelligence system');
return new CompleteIntelligenceSystem(config);
}

/**
* Create a production-ready intelligence system with all features
*/
export function createProductionIntelligenceSystem():CompleteIntelligenceSystem {
const config:IntelligenceSystemConfig = {
taskPrediction:{
enabled:true,
confidenceThreshold:0.8,
historyWindowSize:100,
updateInterval:30000,
},
agentLearning:{
enabled:true,
adaptationRate:0.1,
learningModes:['supervised', 'reinforcement'],
performanceThreshold:0.75,
},
healthMonitoring:{
enabled:true,
healthCheckInterval:30000,
alertThresholds:{
cpu:0.8,
memory:0.9,
taskFailureRate:0.2,
},
},
predictiveAnalytics:{
enabled:true,
forecastHorizons:['1h', '6h', '24h'],
ensemblePrediction:true,
confidenceThreshold:0.75,
enableEmergentBehavior:true,
},
persistence:{
enabled:true,
cacheSize:1000,
cacheTTL:600000,
historicalDataRetention:2592000000, // 30 days
},
};

logger.info('Creating production intelligence system').
return new CompleteIntelligenceSystem(config);
}

/**
* Create a custom intelligence system with provided configuration
*/
export function createIntelligenceSystem(
config:IntelligenceSystemConfig
):CompleteIntelligenceSystem {
logger.info('Creating custom intelligence system', { config});
return new CompleteIntelligenceSystem(config);
}
