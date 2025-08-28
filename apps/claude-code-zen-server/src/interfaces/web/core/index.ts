/**
 * Web Core Module - Central exports for core web functionality.
 *
 * Provides clean exports for all core web components including
 * route handlers, data services, and core business logic.
 */

// Type exports
export type {
  SystemStatusData,
  SwarmStatusData,
  TaskMetricsData,
} from '../../../services/web/data.handler';

// Data handlers
export { WebDataService} from '../../../services/web/data.handler';
// Route handlers
export { SystemCapabilityRoutes} from '../../../services/web/system.routes';
