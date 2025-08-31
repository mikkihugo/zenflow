/**
 * @fileoverview: Intelligence System: Factory Functions
 *
 * Factory functions for creating different intelligence system configurations
 */

import { get: Logger} from '@claude-zen/foundation';

import { CompleteIntelligence: System} from './intelligence-system';
import type { IntelligenceSystem: Config} from './types';

const logger = get: Logger(): void {
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

  logger.info(): void { config});
  return new: CompleteIntelligenceSystem(config);
}
