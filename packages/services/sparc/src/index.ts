/**
 * @fileoverview SPARC Package - Systematic Development Methodology
 * 
 * Clean SPARC implementation with enhanced foundation utilities
 * 
 * @package @claude-zen/sparc
 * @version 1.0.0
 */

// Core SPARC implementation with enhanced foundation usage
export { SPARCManager } from './sparc';
export type { SparcConfig, SparcProject, SparcResult } from './sparc';

// SAFe 6.0 Development Manager - TEMPORARILY DISABLED DUE TO SYNTAX ISSUES
// export { Safe6DevelopmentManager } from './safe6-development-manager';
// export type { Safe6DevelopmentManagerConfig } from './safe6-development-manager';

// SPARC facade for easy usage
export class SPARC {
  /**
   * Create SPARC manager instance with enhanced foundation utilities
   */
  static createManager(config?: Partial<import('./sparc').SparcConfig>): import('./sparc').SPARCManager {
    const { SPARCManager } = require('./sparc');
    return new SPARCManager(config);
  }

  /**
   * Quick project initialization with SPARC methodology
   */
  static async createProject(
    name: string,
    domain: string,
    requirements: string[]
  ): Promise<import('./sparc').SparcProject> {
    const manager = this.createManager();
    return await manager.initializeProject({ name, domain, requirements });
  }
}

export default SPARC;