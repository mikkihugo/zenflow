/**
 * Web Core Module - Central exports for core web functionality.
 *
 * Provides clean exports for all core web components including
 * route handlers, data services, and core business logic.
 */

// Type exports
export type {
	CommandResult,
	DocumentData,
	SwarmData,
	SystemStatusData,
	TaskData,
} from "./handlers/data.handler";

// Data handlers
export { WebDataService } from "./handlers/data.handler";
// Route handlers
export { SystemCapabilityRoutes } from "./routes/system.routes";
