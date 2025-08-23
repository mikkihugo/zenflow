/**
 * @fileoverview Temporary stub for @claude-zen/foundation/config
 *
 * This file provides fallback configuration utilities.
 */

// Foundation config types and utilities stub
export interface ConfigManager {
  get(key: string): any;
  set(key: string,
  value: any): void;
  has(key: string): boolean

}

export interface ProjectConfig {
  name: string;
  version: string;
  description?: string;
  settings?: Record<string,
  any>

}

// Config utilities
export function getProjectConfig(): ProjectConfig  { return { name: 'claude-code-zen'; version: '2.1.0'; description: 'Claude Code Zen Server'; settings: {}
}
}

export function createConfigManager(): ConfigManager  { const config = new Map<string, any>(); return {
  get: (key: string) => config.get(key),
  set: (key: string,
  value: any) => config.set(key,
  value),
  has: (key: string) => config.has(key)

}
}

export const CONFIG_DEFAULTS = { server: {
  port: 3000,
  host: 'localhost'
}, logging: { level: 'info'
};
};

// Export utilities
export { CONFIG_DEFAULTS as default };
