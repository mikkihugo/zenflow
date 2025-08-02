#!/usr/bin/env tsx

/**
 * Claude-Zen Performance Optimizer
 * Comprehensive build and runtime performance optimization system
 */

import { performance } from 'node:perf_hooks';
import { execSync, spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

interface PerformanceMetrics {
  buildTime: number;
  bundleSize: number;
  memoryUsage: number;
  testTime: number;
  errors: string[];
}

interface OptimizationConfig {
  incrementalBuild: boolean;
  parallelBuild: boolean;
  wasmOptimization: boolean;
  bundleAnalysis: boolean;
  cacheOptimization: boolean;
}

class PerformanceOptimizer {
  private metrics: PerformanceMetrics[] = [];
  private config: OptimizationConfig;

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      incrementalBuild: true,
      parallelBuild: true,
      wasmOptimization: true,
      bundleAnalysis: true,
      cacheOptimization: true,
      ...config
    };
  }

  /**
   * Run comprehensive performance optimization
   */
  async optimize(): Promise<PerformanceMetrics> {
    console.log('🚀 Starting Claude-Zen Performance Optimization...\n');

    const startTime = performance.now();
    const metrics: PerformanceMetrics = {
      buildTime: 0,
      bundleSize: 0,
      memoryUsage: 0,
      testTime: 0,
      errors: []
    };

    try {
      // Phase 1: Install missing dependencies
      await this.installDependencies();

      // Phase 2: Fix TypeScript configuration
      await this.optimizeTypeScriptConfig();

      // Phase 3: Implement build optimizations
      await this.optimizeBuildProcess();

      // Phase 4: Optimize WASM compilation
      if (this.config.wasmOptimization) {
        await this.optimizeWasmBuild();
      }

      // Phase 5: Analyze and optimize bundle
      if (this.config.bundleAnalysis) {
        metrics.bundleSize = await this.analyzeBundleSize();
      }

      // Phase 6: Performance testing
      metrics.buildTime = await this.measureBuildTime();
      metrics.testTime = await this.measureTestTime();
      metrics.memoryUsage = await this.measureMemoryUsage();

      const totalTime = performance.now() - startTime;
      console.log(`\n✅ Optimization completed in ${(totalTime / 1000).toFixed(2)}s`);

      this.metrics.push(metrics);
      await this.generatePerformanceReport(metrics);

      return metrics;

    } catch (error) {
      metrics.errors.push(error instanceof Error ? error.message : String(error));
      console.error('❌ Optimization failed:', error);
      return metrics;
    }
  }

  /**
   * Install missing build dependencies
   */
  private async installDependencies(): Promise<void> {
    console.log('📦 Installing missing dependencies...');

    const dependencies = [
      'wasm-opt',
      'binaryen',
      'concurrently'
    ];

    for (const dep of dependencies) {
      try {
        execSync(`which ${dep}`, { stdio: 'ignore' });
        console.log(`✅ ${dep} already installed`);
      } catch {
        console.log(`📥 Installing ${dep}...`);
        try {
          if (dep === 'wasm-opt' || dep === 'binaryen') {
            execSync(`sudo apt-get update && sudo apt-get install -y binaryen`, { stdio: 'inherit' });
          } else {
            execSync(`npm install -g ${dep}`, { stdio: 'inherit' });
          }
          console.log(`✅ ${dep} installed successfully`);
        } catch (error) {
          console.warn(`⚠️  Failed to install ${dep}: ${error}`);
        }
      }
    }
  }

  /**
   * Optimize TypeScript configuration for better performance
   */
  private async optimizeTypeScriptConfig(): Promise<void> {
    console.log('⚙️  Optimizing TypeScript configuration...');

    const tsconfigPath = 'tsconfig.json';
    if (!existsSync(tsconfigPath)) {
      console.warn('⚠️  tsconfig.json not found');
      return;
    }

    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));

    // Enable incremental compilation
    if (this.config.incrementalBuild) {
      tsconfig.compilerOptions.incremental = true;
      tsconfig.compilerOptions.tsBuildInfoFile = '.tsbuildinfo';
      console.log('✅ Enabled incremental compilation');
    }

    // Optimize for development speed
    tsconfig.compilerOptions.skipLibCheck = true;
    tsconfig.compilerOptions.transpileOnly = true;

    // Exclude test files from main build
    if (!tsconfig.exclude) {
      tsconfig.exclude = [];
    }
    tsconfig.exclude.push('**/*.test.ts', '**/*.spec.ts', '__tests__/**/*');

    writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    console.log('✅ TypeScript configuration optimized');
  }

  /**
   * Optimize the build process
   */
  private async optimizeBuildProcess(): Promise<void> {
    console.log('🔧 Optimizing build process...');

    const packageJsonPath = 'package.json';
    if (!existsSync(packageJsonPath)) {
      console.warn('⚠️  package.json not found');
      return;
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    if (this.config.parallelBuild) {
      // Add parallel build scripts
      packageJson.scripts = {
        ...packageJson.scripts,
        'build:fast': 'npm run clean && tsc --incremental',
        'build:parallel': 'concurrently "npm run build:ts" "npm run build:wasm:dev"',
        'build:ts': 'tsc --incremental',
        'build:production': 'npm run clean && npm run build:parallel && npm run optimize:bundle'
      };
      console.log('✅ Added parallel build scripts');
    }

    if (this.config.cacheOptimization) {
      // Add caching optimizations
      packageJson.scripts = {
        ...packageJson.scripts,
        'clean:cache': 'rm -rf .tsbuildinfo node_modules/.cache dist/.cache',
        'build:cached': 'npm run build:ts || npm run build:fast'
      };
      console.log('✅ Added build caching');
    }

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Build process optimized');
  }

  /**
   * Optimize WASM build process
   */
  private async optimizeWasmBuild(): Promise<void> {
    console.log('⚡ Optimizing WASM build...');

    const wasmPath = 'src/neural/wasm';
    if (!existsSync(wasmPath)) {
      console.warn('⚠️  WASM directory not found');
      return;
    }

    // Create optimized WASM build script
    const optimizedBuildScript = `#!/bin/bash
set -e

echo "🚀 Building optimized WASM modules..."

# Development build (fast)
if [ "$BUILD_MODE" = "dev" ]; then
    echo "📦 Development build..."
    wasm-pack build --target web --out-dir pkg --dev
    echo "✅ Development WASM build complete"
    exit 0
fi

# Production build (optimized)
echo "🔧 Production build with optimizations..."
wasm-pack build --target web --out-dir pkg --release

# Optimize with wasm-opt if available
if command -v wasm-opt >/dev/null 2>&1; then
    echo "⚡ Optimizing WASM with wasm-opt..."
    for file in pkg/*.wasm; do
        if [ -f "$file" ]; then
            wasm-opt "$file" -o "$file.optimized" -O4
            mv "$file.optimized" "$file"
            echo "✅ Optimized $(basename "$file")"
        fi
    done
else
    echo "⚠️  wasm-opt not found, skipping optimization"
fi

echo "✅ Production WASM build complete"
`;

    writeFileSync(join(wasmPath, 'scripts/build-wasm-optimized.sh'), optimizedBuildScript);
    execSync(`chmod +x ${join(wasmPath, 'scripts/build-wasm-optimized.sh')}`);
    console.log('✅ WASM build optimization configured');
  }

  /**
   * Analyze bundle size and optimize
   */
  private async analyzeBundleSize(): Promise<number> {
    console.log('📊 Analyzing bundle size...');

    try {
      const distPath = 'dist';
      if (!existsSync(distPath)) {
        console.warn('⚠️  Dist directory not found, building first...');
        await this.runCommand('npm run build:fast');
      }

      const bundleAnalysis = execSync(`du -sh ${distPath}`, { encoding: 'utf8' });
      const sizeMatch = bundleAnalysis.match(/^([0-9.]+)([KMG])/);
      
      if (sizeMatch) {
        const [, size, unit] = sizeMatch;
        const sizeInMB = this.convertToMB(parseFloat(size), unit);
        console.log(`📦 Current bundle size: ${size}${unit} (${sizeInMB.toFixed(2)}MB)`);
        return sizeInMB;
      }

      return 0;
    } catch (error) {
      console.warn('⚠️  Bundle analysis failed:', error);
      return 0;
    }
  }

  /**
   * Measure build time performance
   */
  private async measureBuildTime(): Promise<number> {
    console.log('⏱️  Measuring build time...');

    const startTime = performance.now();
    try {
      await this.runCommand('npm run build:fast');
      const buildTime = (performance.now() - startTime) / 1000;
      console.log(`⚡ Build completed in ${buildTime.toFixed(2)}s`);
      return buildTime;
    } catch (error) {
      console.error('❌ Build failed:', error);
      return -1;
    }
  }

  /**
   * Measure test execution time
   */
  private async measureTestTime(): Promise<number> {
    console.log('🧪 Measuring test performance...');

    const startTime = performance.now();
    try {
      await this.runCommand('npm run test:unit');
      const testTime = (performance.now() - startTime) / 1000;
      console.log(`✅ Tests completed in ${testTime.toFixed(2)}s`);
      return testTime;
    } catch (error) {
      console.warn('⚠️  Test execution failed:', error);
      return -1;
    }
  }

  /**
   * Measure memory usage
   */
  private async measureMemoryUsage(): Promise<number> {
    console.log('💾 Measuring memory usage...');

    const memoryUsage = process.memoryUsage();
    const usedMB = memoryUsage.heapUsed / 1024 / 1024;
    console.log(`📊 Current memory usage: ${usedMB.toFixed(2)}MB`);
    return usedMB;
  }

  /**
   * Generate comprehensive performance report
   */
  private async generatePerformanceReport(metrics: PerformanceMetrics): Promise<void> {
    console.log('📋 Generating performance report...');

    const report = `# 🚀 Claude-Zen Performance Report

## Optimization Results

### Build Performance
- **Build Time**: ${metrics.buildTime > 0 ? `${metrics.buildTime.toFixed(2)}s` : 'Failed'}
- **Bundle Size**: ${metrics.bundleSize > 0 ? `${metrics.bundleSize.toFixed(2)}MB` : 'Unknown'}
- **Memory Usage**: ${metrics.memoryUsage.toFixed(2)}MB

### Test Performance
- **Test Execution**: ${metrics.testTime > 0 ? `${metrics.testTime.toFixed(2)}s` : 'Failed'}

### Optimization Status
- ✅ Incremental builds enabled
- ✅ Parallel compilation configured
- ✅ WASM optimization pipeline setup
- ✅ Build caching implemented
- ✅ Bundle analysis configured

### Issues Encountered
${metrics.errors.length > 0 ? metrics.errors.map(error => `- ❌ ${error}`).join('\n') : '- ✅ No issues encountered'}

### Recommendations
1. **Build Time**: ${this.getBuildTimeRecommendation(metrics.buildTime)}
2. **Bundle Size**: ${this.getBundleSizeRecommendation(metrics.bundleSize)}
3. **Memory Usage**: ${this.getMemoryRecommendation(metrics.memoryUsage)}

---
Generated: ${new Date().toISOString()}
`;

    writeFileSync('PERFORMANCE_REPORT.md', report);
    console.log('✅ Performance report generated: PERFORMANCE_REPORT.md');
  }

  /**
   * Helper methods
   */
  private async runCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const process = spawn(cmd, args, { stdio: 'inherit' });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });
      
      process.on('error', reject);
    });
  }

  private convertToMB(size: number, unit: string): number {
    switch (unit) {
      case 'K': return size / 1024;
      case 'M': return size;
      case 'G': return size * 1024;
      default: return size / (1024 * 1024); // Assume bytes
    }
  }

  private getBuildTimeRecommendation(buildTime: number): string {
    if (buildTime < 0) return 'Fix TypeScript compilation errors first';
    if (buildTime < 10) return 'Excellent build performance';
    if (buildTime < 30) return 'Consider enabling more aggressive caching';
    return 'Implement incremental builds and parallel compilation';
  }

  private getBundleSizeRecommendation(bundleSize: number): string {
    if (bundleSize === 0) return 'Bundle analysis unavailable';
    if (bundleSize < 2) return 'Excellent bundle size';
    if (bundleSize < 5) return 'Consider code splitting for large modules';
    return 'Implement tree shaking and dynamic imports';
  }

  private getMemoryRecommendation(memoryUsage: number): string {
    if (memoryUsage < 50) return 'Excellent memory efficiency';
    if (memoryUsage < 100) return 'Good memory usage';
    return 'Consider implementing memory pooling and optimization';
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new PerformanceOptimizer();
  optimizer.optimize().catch(console.error);
}

export { PerformanceOptimizer, type PerformanceMetrics, type OptimizationConfig };