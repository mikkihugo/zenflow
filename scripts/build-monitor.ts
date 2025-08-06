#!/usr/bin/env node

/**
 * Build Monitor - Continuous build verification for alpha release
 *
 * @fileoverview Advanced build monitoring with strict TypeScript standards
 * @author Claude Code Flow Team
 * @version 2.0.0
 */

import { exec } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/**
 * TypeScript error information
 */
interface TypeScriptError {
  file?: string;
  code?: string;
  message: string;
}

/**
 * Build result information
 */
interface BuildResult {
  timestamp: string;
  errorCount: number;
  errors: TypeScriptError[];
  success: boolean;
}

/**
 * Error category breakdown
 */
interface ErrorCategories {
  type_compatibility: number;
  missing_properties: number;
  import_export: number;
  null_undefined: number;
  constructor_issues: number;
  other: number;
}

/**
 * Alpha certification status
 */
interface AlphaCertification {
  timestamp: string;
  status: 'ALPHA_READY' | 'IN_PROGRESS';
  errorCount: number;
  buildSuccess: boolean;
  verifiedBy: string;
}

/**
 * Build monitoring report
 */
interface BuildReport {
  timestamp: string;
  currentErrorCount: number;
  buildHistory: BuildResult[];
  errorCategories: ErrorCategories;
  status: 'ALPHA_READY' | 'IN_PROGRESS';
}

/**
 * Build Monitor class for continuous build verification
 * Monitors TypeScript compilation progress toward zero-error alpha release
 * @example
 */
class BuildMonitor {
  private errorCount: number;
  private monitoringActive: boolean;
  private buildHistory: BuildResult[];
  private errorCategories: ErrorCategories;

  /** Initializes build monitor with baseline metrics */
  constructor() {
    this.errorCount = 282; // Baseline error count
    this.lastCheck = Date.now();
    this.monitoringActive = true;
    this.buildHistory = [];
    this.errorCategories = {
      type_compatibility: 0,
      missing_properties: 0,
      import_export: 0,
      null_undefined: 0,
      constructor_issues: 0,
      other: 0,
    };
  }

  /**
   * Executes build process and captures results
   * Parses TypeScript errors and categorizes them
   *
   * @returns Promise resolving to build result
   */
  async runBuild(): Promise<BuildResult> {
    try {
      const { stdout, stderr } = await execAsync('npm run build');
      const buildOutput = stderr || stdout;
      const errors = this.parseErrors(buildOutput);
      const buildResult: BuildResult = {
        timestamp: new Date().toISOString(),
        errorCount: errors.length,
        errors,
        success: errors.length === 0,
      };
      this.buildHistory.push(buildResult);
      return buildResult;
    } catch (error) {
      // Build failed, capture error information
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errors = this.parseErrors(errorMessage);
      const buildResult: BuildResult = {
        timestamp: new Date().toISOString(),
        errorCount: errors.length,
        errors,
        success: false,
      };
      this.buildHistory.push(buildResult);
      return buildResult;
    }
  }

  /**
   * Parses build output to extract TypeScript errors
   * Categorizes errors by type for analysis
   *
   * @param buildOutput - Raw build output string
   * @returns Array of parsed TypeScript errors
   */
  private parseErrors(buildOutput: string): TypeScriptError[] {
    if (!buildOutput) return [];

    const errorLines = buildOutput
      .split('\n')
      .filter((line) => line.includes('error TS') || line.includes('Error'));

    return errorLines.map((line) => {
      const match = line.match(/([^:]+):\s*error\s+TS(\d+):\s*(.+)/);
      if (match) {
        return {
          file: match[1],
          code: match[2],
          message: match[3],
        };
      }
      return { message: line };
    });
  }

  /**
   * Checks swarm memory for agent activity
   * Monitors for progress updates from other agents
   *
   * @returns Promise resolving to boolean indicating activity
   */
  async checkSwarmMemory(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        'npx claude-zen hooks pre-search --query "agent-progress" --cache-results true'
      );
      return stdout.includes('progress') || stdout.includes('fixed');
    } catch (_error) {
      // Swarm memory check failed, assume no activity
      return false;
    }
  }

  /** Main monitoring loop - Continuously monitors build status and reports progress */
  async monitor(): Promise<void> {
    while (this.monitoringActive) {
      try {
        // Check for swarm activity
        const swarmActivity = await this.checkSwarmMemory();
        if (swarmActivity) {
          const buildResult = await this.runBuild();

          if (buildResult.errorCount < this.errorCount) {
            const _reduction = this.errorCount - buildResult.errorCount;
            // Update baseline
            this.errorCount = buildResult.errorCount;
            // Store progress and alert swarm
            await this.storeProgress(buildResult);
            await this.alertSwarm(buildResult);
          } else if (buildResult.errorCount > this.errorCount) {
            const _increase = buildResult.errorCount - this.errorCount;
            // Alert swarm of regression
            await this.alertRegression(buildResult);
          }

          // Check for alpha readiness
          if (buildResult.errorCount === 0) {
            await this.certifyAlphaReady();
            break;
          }
        }

        // Wait before next check (30 second intervals)
        await new Promise((resolve) => setTimeout(resolve, 30000));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ Monitor error:', errorMessage);
        // Wait longer on error (1 minute)
        await new Promise((resolve) => setTimeout(resolve, 60000));
      }
    }
  }

  /**
   * Stores build progress in swarm memory
   * Updates other agents on progress status
   *
   * @param buildResult - Latest build result to store
   */
  private async storeProgress(buildResult: BuildResult): Promise<void> {
    try {
      const message = `BUILD PROGRESS: ${buildResult.errorCount} errors remaining (${this.errorCount - buildResult.errorCount} fixed)`;
      await execAsync(`npx claude-zen hooks notification --message "${message}" --telemetry true`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to store progress:', errorMessage);
    }
  }

  /**
   * Alerts swarm of positive build progress
   * Notifies other agents of error reduction
   *
   * @param buildResult - Build result to report
   */
  private async alertSwarm(buildResult: BuildResult): Promise<void> {
    const message = `🔧 BUILD UPDATE: ${buildResult.errorCount} errors remaining. Progress: ${this.errorCount - buildResult.errorCount} errors fixed.`;
    try {
      await execAsync(`npx claude-zen hooks notification --message "${message}" --telemetry true`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to alert swarm:', errorMessage);
    }
  }

  /**
   * Alerts swarm of build regression
   * Warns other agents of new errors introduced
   *
   * @param buildResult - Build result showing regression
   */
  private async alertRegression(buildResult: BuildResult): Promise<void> {
    const message = `🚨 REGRESSION ALERT: ${buildResult.errorCount - this.errorCount} new errors introduced. Review recent changes.`;
    try {
      await execAsync(`npx claude-zen hooks notification --message "${message}" --telemetry true`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to alert regression:', errorMessage);
    }
  }

  /** Certifies alpha readiness when zero errors achieved */
  private async certifyAlphaReady(): Promise<void> {
    const _certification: AlphaCertification = {
      timestamp: new Date().toISOString(),
      status: 'ALPHA_READY',
      errorCount: 0,
      buildSuccess: true,
      verifiedBy: 'Build-Verifier-Agent',
    };

    try {
      await execAsync(
        `npx claude-zen hooks notification --message "🏆 ALPHA CERTIFICATION COMPLETE" --telemetry true`
      );
      await execAsync(
        `npx claude-zen hooks post-task --task-id "alpha-build-verification" --analyze-performance true`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to certify alpha:', errorMessage);
    }
  }

  /**
   * Generates comprehensive build monitoring report
   * Creates status report for external consumption
   *
   * @returns Build monitoring report
   */
  generateReport(): BuildReport {
    const report: BuildReport = {
      timestamp: new Date().toISOString(),
      currentErrorCount: this.errorCount,
      buildHistory: this.buildHistory,
      errorCategories: this.errorCategories,
      status: this.errorCount === 0 ? 'ALPHA_READY' : 'IN_PROGRESS',
    };

    // Write report to file
    const reportPath = path.join(process.cwd(), 'build-verification-status.json');
    fs.writeFile(reportPath, JSON.stringify(report, null, 2)).catch((error) => {
      console.error('Failed to write report:', error);
    });

    return report;
  }
}

/** Main execution function - Starts build monitoring when run directly */
async function main(): Promise<void> {
  const monitor = new BuildMonitor();
  await monitor.monitor();
}

// Start monitoring if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('🚨 Build monitor error:', error);
    process.exit(1);
  });
}

export default BuildMonitor;
