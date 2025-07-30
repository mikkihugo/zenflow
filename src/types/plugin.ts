/**
 * Plugin System Types
 * Comprehensive plugin architecture for extensible functionality
 */

import type { Identifiable } from './core.js';

// =============================================================================
// PLUGIN CORE TYPES
// =============================================================================

export type PluginType =
  | 'ai-provider'
  | 'architect-advisor'
  | 'security-auth'
  | 'notifications'
  | 'export-system'
  | 'documentation-linker'
  | 'workflow-engine'
  | 'github-integration'
  | 'memory-backend'
  | 'performance-monitor'
  | 'code-analysis'
  | 'test-runner'
  | 'database-connector'
  | 'neural-processor'
  | 'vision-processor'
  | 'custom';

export type PluginStatus =
  | 'unloaded'
  | 'loading'
  | 'loaded'
  | 'initializing'
  | 'active'
  | 'error'
  | 'disabled';

export type HookType =
  | 'pre-task'
  | 'post-task'
  | 'pre-edit'
  | 'post-edit'
  | 'pre-search'
  | 'post-search'
  | 'pre-command'
  | 'post-command'
  | 'session-start'
  | 'session-end'
  | 'notification'
  | 'error'
  | 'health-check'
  | 'performance-metric';

export interface PluginManifest {name = | 'filesystem = ============================================================================
// PLUGIN RUNTIME
// =============================================================================

export interface PluginContext {
  // Plugin informationplugin = ============================================================================
// PLUGIN EVENTS
// =============================================================================

export interface PluginEvents {
  // Index signature for EventMap compatibility
  [event = > void;
  
  // Lifecycle events
  'loading': (pluginName = > void;
  'loaded': (pluginName = > void;
  'initializing': (pluginName = > void;
  'initialized': (pluginName = > void;
  'starting': (pluginName = > void;
  'started': (pluginName = > void;
  'stopping': (pluginName = > void;
  'stopped': (pluginName = > void;
  'unloading': (pluginName = > void;
  'unloaded': (pluginName = > void;
  'error': (pluginName = > void;
  'restarted': (pluginName = > void;
  
  // Hook events
  'hook-registered': (pluginName = > void;
  'hook-unregistered': (pluginName = > void;
  'hook-executed': (pluginName = > void;
  'hook-failed': (pluginName = > void;
  
  // API events
  'api-registered': (pluginName = > void;
  'api-unregistered': (pluginName = > void;
  'api-called': (pluginName = > void;
  'api-failed': (pluginName = > void;
  
  // Resource events
  'resource-warning': (pluginName = > void;
  'resource-exceeded': (pluginName = > void;
  'performance-degraded': (pluginName = > void;
  
  // Security events
  'permission-denied': (pluginName = > void;
  'security-violation': (pluginName = > void;
  'sandbox-breach': (pluginName = > void;
}

// =============================================================================
// PLUGIN INTERFACE
// =============================================================================

export interface Plugin extends Identifiable {
  // Metadata
  readonlymanifest = ============================================================================
// HOOK SYSTEM
// =============================================================================

export interface HookHandler {
  (context = executed firsttimeout = ============================================================================
// API SYSTEM
// =============================================================================

export interface PluginAPI {name = ============================================================================
// PLUGIN APIS
// =============================================================================

export interface PluginLogger {
  trace(message = > void): Promise<void>;
  off(event = > void): Promise<void>;
  once(event = > void): Promise<void>;
}

export interface PluginHttpAPI {
  request(options = > boolean;
  proxy?: string;
  auth?: {username = > void): Promise<void>;
}

export interface FileStats {size = ============================================================================
// PLUGIN MANAGER
// =============================================================================

export interface PluginManager extends TypedEventEmitter<_PluginEvents> {
  // Plugin lifecycle
  loadPlugin(path = ============================================================================
// AUXILIARY TYPES
// =============================================================================

export interface PluginHealthResult {status = > Promise<void>): Promise<void>
unschedule(name: string)
: Promise<void>
trigger(name: string)
: Promise<void>
list();
: Promise<ScheduledJob[]>
}

export interface ScheduledJob {
  name: string;
  cron: string;
  nextRun: Date;
  lastRun?: Date;
  enabled: boolean;
  runCount: number;
  errorCount: number;
}
