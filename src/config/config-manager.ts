/**
 * @fileoverview Configuration Manager - Clean Export
 *
 * Re-export of the unified configuration system for backward compatibility
 */

export { DEFAULT_CONFIG } from './defaults';
// Re-export everything from the new unified system
export * from './manager';
// Primary exports for backward compatibility
// Default export
export {
  ConfigurationManager as ConfigManager,
  configManager,
  configManager as default,
} from './manager';
export * from './types';
