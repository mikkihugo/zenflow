/**
 * @fileoverview sobelow-integration.ts - Minimal Implementation
 */

export interface DefaultConfig {
  enabled: boolean;
  [key: string]: unknown;
}

export class DefaultImplementation {
  private config: DefaultConfig;

  constructor(config: Partial<DefaultConfig> = {}) {
    this.config = {
      enabled: true,
      ...config,
    };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }
}

export default new DefaultImplementation();
