# 🔄 Ticket #3: Code Duplication Elimination & Maintenance Optimization

## Priority: 🟡 P1 (High)

## Problem Statement

Claude Code Zen contains **significant code duplication** across packages, creating maintenance overhead and consistency issues. Analysis identified:

- **TSDoc fix scripts duplicated** across 5+ packages (identical functionality)
- **Similar database adapter patterns** repeated without abstraction
- **Redundant type definitions** across package boundaries
- **Copy-paste patterns** in coordination and monitoring code

## Current State Analysis

### 1. TSDoc Script Duplication
Identical TSDoc fix scripts found in multiple packages:
```bash
packages/services/brain/scripts/fix-tsdoc.mjs         (650+ lines)
packages/core/dspy/scripts/fix-tsdoc.mjs             (650+ lines)  
packages/services/knowledge/scripts/fix-tsdoc.mjs    (650+ lines)
packages/core/foundation/scripts/fix-tsdoc.mjs       (650+ lines)
packages/core/fact-system/scripts/fix-tsdoc.mjs      (650+ lines)

# Nearly identical functions:
- generateTSDocPrompt()
- processBatch()
- runTSDocCheck()
- generateDetailedReport()
```

### 2. Database Pattern Duplication
Similar adapter implementations across database types:
```typescript
// Repeated connection management patterns
// Repeated query execution patterns  
// Repeated error handling patterns
// Repeated transaction management
```

### 3. Monitoring & Metrics Duplication
Similar monitoring patterns across services:
```bash
# Similar metric collection code
# Repeated health check implementations
# Duplicated performance tracking
# Copy-paste dashboard components
```

## Root Cause Analysis

### 1. Package-First Development
Each package developed independently without shared utilities consideration.

### 2. Lack of Common Utilities
No centralized location for shared scripts and utilities.

### 3. Copy-Paste Culture  
Teams copying working solutions rather than abstracting them.

### 4. Missing Abstraction Layers
Common patterns not identified and abstracted into reusable components.

## Proposed Solution

### Phase 1: TSDoc Script Consolidation (2-3 days)

#### 1.1 Create Shared TSDoc Utility
```typescript
// packages/core/foundation/src/scripts/tsdoc-utility.ts
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import chalk from 'chalk';

export interface TSDocConfig {
  readonly claudeModel: string;
  readonly maxBatchSize: number;
  readonly enhancedMode: boolean;
  readonly includeAnalysisReport: boolean;
  readonly outputPath?: string;
  readonly maxReportExports: number;
}

export interface UndocumentedExport {
  readonly name: string;
  readonly type: string;
  readonly line: number;
}

export interface FileAnalysis {
  readonly path: string;
  readonly coverage: number;
  readonly undocumented: UndocumentedExport[];
}

export interface ProcessingResult {
  readonly file: string;
  readonly success: boolean;
  readonly finalCoverage?: number;
  readonly remaining?: number;
  readonly error?: string;
}

export class TSDocProcessor {
  constructor(private config: TSDocConfig) {}

  async runTSDocCheck(filePath: string = '.'): Promise<{ files: FileAnalysis[]; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const child = spawn('pnpm', ['docs:check-strict'], { 
        cwd: filePath,
        stdio: 'pipe' 
      });
      
      let output = '';
      child.stdout.on('data', (data) => output += data.toString());
      child.stderr.on('data', (data) => output += data.toString());
      
      child.on('close', (code) => {
        const files = this.parseCheckOutput(output);
        resolve({ files, exitCode: code || 0 });
      });
      
      child.on('error', (error) => {
        reject(new Error(`Failed to run TSDoc check: ${error.message}`));
      });
    });
  }

  private parseCheckOutput(output: string): FileAnalysis[] {
    const lines = output.split('\n');
    const files: FileAnalysis[] = [];
    let currentFile = '';
    let currentCoverage = 0;
    let undocumentedExports: UndocumentedExport[] = [];

    for (const line of lines) {
      const fileMatch = line.match(/📄\s+(.+\.ts)/);
      if (fileMatch) {
        if (currentFile && currentCoverage < 100) {
          files.push({
            path: currentFile,
            coverage: currentCoverage,
            undocumented: [...undocumentedExports],
          });
        }
        currentFile = fileMatch[1];
        undocumentedExports = [];
      }

      const coverageMatch = line.match(/Coverage:\s+(\d+)%/);
      if (coverageMatch) {
        currentCoverage = parseInt(coverageMatch[1], 10);
      }

      const undocumentedMatch = line.match(/•\s+(\w+)\s+\((\w+),\s+line\s+(\d+)\)/);
      if (undocumentedMatch) {
        undocumentedExports.push({
          name: undocumentedMatch[1],
          type: undocumentedMatch[2],
          line: parseInt(undocumentedMatch[3], 10),
        });
      }
    }

    // Add the last file if it needs fixes
    if (currentFile && currentCoverage < 100) {
      files.push({
        path: currentFile,
        coverage: currentCoverage,
        undocumented: [...undocumentedExports],
      });
    }

    return files;
  }

  generateTSDocPrompt(filePath: string, undocumentedExports: UndocumentedExport[], analysisReport?: FileAnalysis): string {
    const basePrompt = `Please add comprehensive TSDoc documentation for the following exports in ${filePath}:

${undocumentedExports.map(exp => `- ${exp.name} (${exp.type}) at line ${exp.line}`).join('\n')}

Guidelines:
1. Use proper TSDoc syntax with /** */ comments
2. Include @param tags for all parameters
3. Include @returns tags for return values
4. Add @throws tags when applicable
5. Keep descriptions concise but informative
6. Use consistent style matching existing documentation in the file

Please analyze the file and add high-quality TSDoc documentation for all missing exports. Maintain the existing code structure and only add documentation comments.`;

    if (this.config.enhancedMode) {
      const fileContext = `
📁 File: ${filePath}
📊 Missing Documentation: ${undocumentedExports.length} exports
🎯 Target: 100% TSDoc coverage
🏗️ Project: claude-code-zen (AI swarm orchestration platform)`;

      const reportSection = this.config.includeAnalysisReport && analysisReport
        ? `\n\n📋 ANALYSIS REPORT:\nCurrent coverage: ${analysisReport.coverage}%\nTotal undocumented: ${analysisReport.undocumented.length} exports`
        : '';

      return `${fileContext}${reportSection}\n\n${basePrompt}`;
    }

    return basePrompt;
  }

  async processBatch(files: FileAnalysis[]): Promise<ProcessingResult[]> {
    console.log(chalk.green(`\n🚀 Processing ${files.length} files for documentation improvements...`));

    const results: ProcessingResult[] = [];

    for (const file of files) {
      try {
        console.log(`\n${'─'.repeat(50)}`);
        console.log(chalk.cyan(`📁 Processing: ${file.path}`));
        console.log(chalk.yellow(`📊 Current coverage: ${file.coverage}%`));
        console.log(chalk.yellow(`📝 Undocumented exports: ${file.undocumented.length}`));

        const claudeResult = await this.fixFileWithClaude(file.path, file.undocumented, file);

        if (claudeResult.success) {
          console.log(chalk.blue('🔍 Validating improvements...'));
          const validation = await this.validateFixes(file.path);

          if (validation.success) {
            console.log(chalk.green(`🎉 SUCCESS: ${file.path} now has 100% coverage!`));
            results.push({ file: file.path, success: true, finalCoverage: 100 });
          } else {
            console.log(chalk.yellow(`⚠️  PARTIAL: ${file.path} improved to ${validation.coverage}% (${validation.remaining} exports remaining)`));
            results.push({
              file: file.path,
              success: false,
              finalCoverage: validation.coverage,
              remaining: validation.remaining,
            });
          }
        } else {
          console.log(chalk.red(`❌ FAILED: Could not improve ${file.path}`));
          results.push({
            file: file.path,
            success: false,
            error: claudeResult.error,
          });
        }
      } catch (error) {
        console.error(chalk.red(`💥 ERROR processing ${file.path}: ${error.message}`));
        results.push({ file: file.path, success: false, error: error.message });
      }
    }

    return results;
  }

  private async fixFileWithClaude(filePath: string, undocumented: UndocumentedExport[], analysis: FileAnalysis): Promise<{ success: boolean; error?: string }> {
    // Implementation would integrate with Claude API
    // This is a placeholder for the actual implementation
    return { success: true };
  }

  private async validateFixes(filePath: string): Promise<{ success: boolean; coverage: number; remaining: number }> {
    // Implementation would re-run TSDoc check on specific file
    // This is a placeholder for the actual implementation
    return { success: true, coverage: 100, remaining: 0 };
  }

  async generateDetailedReport(results: ProcessingResult[], checkResult: { files: FileAnalysis[] }): Promise<string | null> {
    if (!this.config.outputPath) return null;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `${this.config.outputPath}/tsdoc-fix-report-${timestamp}.md`;

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const partial = results.filter(r => !r.success && r.finalCoverage);

    const reportContent = this.buildReportContent(successful, failed, partial, checkResult.files);

    try {
      await fs.writeFile(reportPath, reportContent, 'utf8');
      console.log(chalk.green(`📊 Detailed report saved: ${reportPath}`));
      return reportPath;
    } catch (error) {
      console.error(chalk.red(`Failed to save report: ${error.message}`));
      return null;
    }
  }

  private buildReportContent(successful: ProcessingResult[], failed: ProcessingResult[], partial: ProcessingResult[], originalFiles: FileAnalysis[]): string {
    // Implementation would build comprehensive markdown report
    return `# TSDoc Auto-Fix Report\n\nGenerated: ${new Date().toISOString()}\n\n## Summary\n- Successful: ${successful.length}\n- Failed: ${failed.length}\n- Partial: ${partial.length}`;
  }
}
```

#### 1.2 Package-Specific Wrapper Scripts
```typescript
// packages/services/brain/scripts/fix-tsdoc.mjs (simplified)
import { TSDocProcessor } from '@claude-zen/foundation';

const config = {
  claudeModel: 'claude-3-5-sonnet-20241022',
  maxBatchSize: 5,
  enhancedMode: true,
  includeAnalysisReport: true,
  outputPath: './reports',
  maxReportExports: 10
};

const processor = new TSDocProcessor(config);

async function main() {
  try {
    console.log('🔧 Running TSDoc check for brain service...');
    const checkResult = await processor.runTSDocCheck('.');
    
    if (checkResult.files.length === 0) {
      console.log('🎉 All files already have 100% TSDoc coverage!');
      return;
    }

    const results = await processor.processBatch(checkResult.files);
    await processor.generateDetailedReport(results, checkResult);
    
  } catch (error) {
    console.error('❌ TSDoc processing failed:', error.message);
    process.exit(1);
  }
}

main();
```

### Phase 2: Database Pattern Unification (3-4 days)

#### 2.1 Abstract Database Adapter Base
```typescript
// packages/core/database/src/adapters/base-adapter.ts
export abstract class BaseAdapter<TConnection, TResult> implements DatabaseAdapter<TConnection, TResult> {
  protected connection: TConnection | null = null;
  protected config: DatabaseConfig;
  protected logger: Logger;
  protected metrics: MetricsCollector;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.logger = getLogger(`${this.getAdapterName()}Adapter`);
    this.metrics = new MetricsCollector(this.getAdapterName());
  }

  abstract getAdapterName(): string;
  protected abstract doConnect(): Promise<TConnection>;
  protected abstract doDisconnect(): Promise<void>;
  protected abstract doQuery(sql: string, params?: unknown[]): Promise<QueryResult<TResult>>;
  protected abstract doHealthCheck(): Promise<HealthStatus>;

  async connect(): Promise<void> {
    const startTime = performance.now();
    try {
      this.logger.info('Connecting to database...');
      this.connection = await this.doConnect();
      this.metrics.recordConnectionTime(performance.now() - startTime);
      this.logger.info('Database connection established');
    } catch (error) {
      this.metrics.recordConnectionError();
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;
    
    try {
      this.logger.info('Disconnecting from database...');
      await this.doDisconnect();
      this.connection = null;
      this.logger.info('Database disconnected');
    } catch (error) {
      this.logger.error('Error during disconnect', error);
      throw error;
    }
  }

  async query(sql: string, params?: unknown[]): Promise<QueryResult<TResult>> {
    if (!this.connection) {
      throw new Error('Database not connected');
    }

    const startTime = performance.now();
    try {
      const result = await this.doQuery(sql, params);
      this.metrics.recordQueryTime(performance.now() - startTime);
      this.metrics.recordQuerySuccess();
      return result;
    } catch (error) {
      this.metrics.recordQueryError();
      this.logger.error('Query failed', { sql, params, error });
      throw error;
    }
  }

  async transaction<T>(fn: (connection: TConnection) => Promise<T>): Promise<T> {
    if (!this.connection) {
      throw new Error('Database not connected');
    }

    const startTime = performance.now();
    try {
      await this.doBeginTransaction();
      const result = await fn(this.connection);
      await this.doCommitTransaction();
      this.metrics.recordTransactionTime(performance.now() - startTime);
      return result;
    } catch (error) {
      await this.doRollbackTransaction();
      this.metrics.recordTransactionError();
      throw error;
    }
  }

  protected abstract doBeginTransaction(): Promise<void>;
  protected abstract doCommitTransaction(): Promise<void>;
  protected abstract doRollbackTransaction(): Promise<void>;

  async healthCheck(): Promise<HealthStatus> {
    try {
      return await this.doHealthCheck();
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        timestamp: new Date(),
        adapter: this.getAdapterName()
      };
    }
  }
}
```

#### 2.2 Specialized Adapter Implementations
```typescript
// packages/core/database/src/adapters/sqlite-adapter.ts
export class SQLiteAdapter extends BaseAdapter<sqlite3.Database, SQLiteResult> {
  getAdapterName(): string {
    return 'sqlite';
  }

  protected async doConnect(): Promise<sqlite3.Database> {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.config.path, (err) => {
        if (err) reject(err);
        else resolve(db);
      });
    });
  }

  protected async doDisconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection!.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  protected async doQuery(sql: string, params?: unknown[]): Promise<QueryResult<SQLiteResult>> {
    return new Promise((resolve, reject) => {
      this.connection!.all(sql, params || [], (err, rows) => {
        if (err) reject(err);
        else resolve({
          records: rows,
          rowCount: rows.length,
          executionTime: 0 // Would be calculated properly
        });
      });
    });
  }

  protected async doHealthCheck(): Promise<HealthStatus> {
    const result = await this.doQuery('SELECT 1 as health');
    return {
      status: result.records.length > 0 ? 'healthy' : 'unhealthy',
      timestamp: new Date(),
      adapter: this.getAdapterName()
    };
  }

  protected async doBeginTransaction(): Promise<void> {
    await this.doQuery('BEGIN TRANSACTION');
  }

  protected async doCommitTransaction(): Promise<void> {
    await this.doQuery('COMMIT');
  }

  protected async doRollbackTransaction(): Promise<void> {
    await this.doQuery('ROLLBACK');
  }

  // SQLite-specific methods
  async backup(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const backup = this.connection!.backup(path);
      backup.step(-1, (err) => {
        if (err) reject(err);
        else {
          backup.finish((finishErr) => {
            if (finishErr) reject(finishErr);
            else resolve();
          });
        }
      });
    });
  }

  async optimize(): Promise<void> {
    await this.doQuery('VACUUM');
    await this.doQuery('ANALYZE');
  }
}
```

### Phase 3: Common Utilities Extraction (2-3 days)

#### 3.1 Monitoring Utilities
```typescript
// packages/core/foundation/src/monitoring/metrics-collector.ts
export class MetricsCollector {
  private metrics: Map<string, MetricValue> = new Map();
  private timers: Map<string, number> = new Map();

  constructor(private namespace: string) {}

  recordConnectionTime(milliseconds: number): void {
    this.recordHistogram('connection_time_ms', milliseconds);
  }

  recordConnectionError(): void {
    this.incrementCounter('connection_errors_total');
  }

  recordQueryTime(milliseconds: number): void {
    this.recordHistogram('query_time_ms', milliseconds);
  }

  recordQuerySuccess(): void {
    this.incrementCounter('queries_success_total');
  }

  recordQueryError(): void {
    this.incrementCounter('queries_error_total');
  }

  recordTransactionTime(milliseconds: number): void {
    this.recordHistogram('transaction_time_ms', milliseconds);
  }

  recordTransactionError(): void {
    this.incrementCounter('transaction_errors_total');
  }

  private incrementCounter(name: string): void {
    const key = `${this.namespace}_${name}`;
    const current = this.metrics.get(key) || { type: 'counter', value: 0 };
    this.metrics.set(key, { ...current, value: current.value + 1 });
  }

  private recordHistogram(name: string, value: number): void {
    const key = `${this.namespace}_${name}`;
    const current = this.metrics.get(key) || { 
      type: 'histogram', 
      values: [], 
      sum: 0, 
      count: 0 
    };
    
    if (current.type === 'histogram') {
      current.values.push(value);
      current.sum += value;
      current.count += 1;
      this.metrics.set(key, current);
    }
  }

  getMetrics(): Record<string, MetricValue> {
    return Object.fromEntries(this.metrics.entries());
  }

  reset(): void {
    this.metrics.clear();
  }
}
```

#### 3.2 Common Health Check Utilities
```typescript
// packages/core/foundation/src/health/health-checker.ts
export class HealthChecker {
  private checks: Map<string, HealthCheck> = new Map();

  addCheck(name: string, check: HealthCheck): void {
    this.checks.set(name, check);
  }

  async runAllChecks(): Promise<OverallHealth> {
    const results: Record<string, HealthStatus> = {};
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    for (const [name, check] of this.checks.entries()) {
      try {
        const result = await Promise.race([
          check.check(),
          this.timeout(5000) // 5 second timeout
        ]);
        
        results[name] = result;
        
        if (result.status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (result.status === 'degraded' && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      } catch (error) {
        results[name] = {
          status: 'unhealthy',
          message: `Health check timeout or error: ${error.message}`,
          timestamp: new Date()
        };
        overallStatus = 'unhealthy';
      }
    }

    return {
      status: overallStatus,
      timestamp: new Date(),
      checks: results
    };
  }

  private async timeout(ms: number): Promise<HealthStatus> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), ms);
    });
  }
}

export interface HealthCheck {
  check(): Promise<HealthStatus>;
}

export interface OverallHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: Record<string, HealthStatus>;
}
```

### Phase 4: Script and Build Consolidation (1-2 days)

#### 4.1 Centralized Script Management
```typescript
// scripts/shared-utilities.js
export class ScriptRunner {
  static async runPackageScript(packagePath, scriptName, args = []) {
    const { spawn } = await import('child_process');
    
    return new Promise((resolve, reject) => {
      const child = spawn('pnpm', [scriptName, ...args], {
        cwd: packagePath,
        stdio: 'inherit'
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Script ${scriptName} failed with exit code ${code}`));
        }
      });
    });
  }

  static async runParallel(tasks) {
    const results = await Promise.allSettled(tasks);
    const failures = results.filter(r => r.status === 'rejected');
    
    if (failures.length > 0) {
      console.error(`${failures.length} tasks failed:`, failures);
      throw new Error(`${failures.length} parallel tasks failed`);
    }
    
    return results.map(r => r.value);
  }
}
```

## Implementation Plan

### Day 1: TSDoc Consolidation
- [ ] Create shared TSDoc utility in foundation package
- [ ] Replace first 2 package scripts with shared utility
- [ ] Test and validate functionality

### Day 2-3: Complete TSDoc Migration
- [ ] Replace remaining TSDoc scripts across all packages
- [ ] Update package.json scripts to use shared utility
- [ ] Comprehensive testing across all packages

### Day 4-5: Database Pattern Unification
- [ ] Create BaseAdapter abstract class
- [ ] Refactor SQLite adapter to use base class
- [ ] Refactor Kuzu and LanceDB adapters
- [ ] Update all database consumers

### Day 6-7: Common Utilities & Scripts
- [ ] Extract monitoring utilities
- [ ] Create shared health check utilities
- [ ] Consolidate build and maintenance scripts
- [ ] Update CI/CD to use consolidated scripts

## Success Metrics

### Immediate (1 week)
- [ ] **Zero TSDoc script duplication** across packages
- [ ] **50%+ reduction** in maintenance script lines of code
- [ ] **Consistent patterns** across all database adapters

### Short-term (2-4 weeks)
- [ ] **30-40% reduction** in total duplicated code
- [ ] **Faster onboarding** through consistent patterns
- [ ] **Reduced maintenance overhead** for common utilities

### Long-term (2-3 months)
- [ ] **Single source of truth** for common functionality
- [ ] **Improved code quality** through shared abstractions
- [ ] **Faster feature development** with reusable components

## Risk Mitigation

### Technical Risks
- **Breaking Changes**: Implement gradual migration with backward compatibility
- **Shared Dependencies**: Use peer dependencies to avoid version conflicts
- **Abstraction Complexity**: Start simple and iterate based on usage

### Process Risks
- **Team Coordination**: Coordinate changes across teams to avoid conflicts
- **Testing Impact**: Ensure comprehensive testing during migration
- **Documentation**: Update all relevant documentation and examples

## Expected ROI

### Development Efficiency
- **40-50% reduction** in maintenance time for common utilities
- **25-30% faster** implementation of new database adapters
- **Improved consistency** across all packages

### Code Quality
- **Better testability** through shared abstractions
- **Reduced bug surface area** by eliminating duplicated logic
- **Easier refactoring** with centralized implementations

## Dependencies

- Foundation package enhancements
- Package.json script updates across all affected packages
- CI/CD pipeline updates to use consolidated scripts
- Team coordination for migration timing

## Notes

This ticket provides **immediate value** through code consolidation while establishing patterns for future development. The focus on TSDoc scripts provides a clear, measurable win that demonstrates the value of the approach.

The database adapter unification creates a foundation for consistent multi-database operations, crucial for the enterprise architecture's reliability and maintainability.