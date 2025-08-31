import { getLogger } from '@claude-zen/foundation';

/**
 * @fileoverview Intelligence System Factory Functions
 *
 * Factory functions for creating different intelligence system configurations
 */

import { CompleteIntelligenceSystem } from './intelligence-system';
import type { IntelligenceSystemConfig} from './types';

const logger = getLogger('intelligence-factory');

/**
 * Default configuration for intelligence systems
 */
const DEFAULT_CONFIG: IntelligenceSystemConfig = {
  monitoring: {
    enabled: true,
    healthCheckInterval: 30000,
    alertThresholds: {
      cpu: 0.8,
      memory: 0.9,
      taskFailureRate: 0.2,
    },
  },
  predictiveAnalytics: {
    enabled: true,
    forecastHorizons: ['1h', '6h', '24h'],
    ensemblePrediction: true,
    confidenceThreshold: 0.75,
    enableEmergentBehavior: true,
  },
  persistence: {
    enabled: true,
    cacheSize: 1000,
    cacheTTL: 600000,
    historicalDataRetention: 2592000000, // 30 days
  },
};

/**
 * Creates a complete intelligence system with default configuration
 */
export function createIntelligenceSystem(config?: Partial<IntelligenceSystemConfig>): CompleteIntelligenceSystem {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  logger.info('Creating intelligence system with config');
  return new CompleteIntelligenceSystem(mergedConfig);
}
