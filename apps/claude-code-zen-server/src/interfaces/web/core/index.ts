/**
 * Web Core Module - Central exports for core web functionality.
 *
 * Provides clean exports for all core web components including
 * route handlers, data services, and core business logic.
 */

// Route handlers
export { SystemCapabilityRoutes } from './routes/system.routes';

// Data handlers
export { WebDataService } from './handlers/data.handler';

// Type exports
export type {
  SystemStatusData,
  SwarmData,
  TaskData,
  DocumentData,
  CommandResult,
} from './handlers/data.handler';
