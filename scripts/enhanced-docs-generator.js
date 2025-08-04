#!/usr/bin/env node

/**
 * Enhanced Documentation Generation System
 * Comprehensive documentation automation for Claude-Zen
 * Generates API docs, ADRs, performance reports, and security docs
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

class EnhancedDocumentationGenerator {
  constructor() {
    this.rootDir = process.cwd();
    this.sourceDir = 'src';
    this.docsDir = 'docs';
    this.generatedDir = 'docs/generated';
    this.apiDir = 'docs/api';
    this.securityDir = 'docs/security';
    this.performanceDir = 'docs/performance';
    this.architectureDir = 'docs/architecture';
  }

  async generateComprehensiveDocumentation() {
    try {
      // Create documentation structure
      await this.createDocumentationStructure();
      await this.generateAPIDocumentation();
      await this.generateTypeScriptDocumentation();
      await this.generateArchitectureDocumentation();
      await this.generatePerformanceDocumentation();
      await this.generateSecurityDocumentation();
      await this.generateADRDocumentation();
      await this.generateTestCoverageDocumentation();
      await this.generateDeveloperGuide();
      await this.generateDocumentationIndex();
      return this.getGeneratedDocuments();
    } catch (error) {
      console.error('❌ Documentation generation failed:', error);
      throw error;
    }
  }

  async createDocumentationStructure() {
    const dirs = [
      this.docsDir,
      this.generatedDir,
      this.apiDir,
      this.securityDir,
      this.performanceDir,
      this.architectureDir,
      `${this.docsDir}/adrs`,
      `${this.docsDir}/guides`,
      `${this.docsDir}/tutorials`,
      `${this.docsDir}/examples`,
      `${this.docsDir}/coverage`,
    ];

    for (const dir of dirs) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
  }

  async generateAPIDocumentation() {
    // Enhanced API documentation with TypeDoc integration
    const tsFiles = await glob('src/**/*.ts');
    const jsFiles = await glob('src/**/*.js');

    const apiDocData = {
      timestamp: new Date().toISOString(),
      version: await this.getProjectVersion(),
      typescript: await this.processTypeScriptFiles(tsFiles),
      javascript: await this.processJavaScriptFiles(jsFiles),
      interfaces: await this.extractInterfacesFromFiles(tsFiles),
      exports: await this.extractExportsFromFiles(tsFiles.concat(jsFiles)),
    };

    // Generate comprehensive API documentation
    const apiMarkdown = this.generateAPIMarkdown(apiDocData);
    await fs.promises.writeFile(`${this.apiDir}/comprehensive-api.md`, apiMarkdown);

    // Generate JSON schema for API
    await fs.promises.writeFile(
      `${this.apiDir}/api-schema.json`,
      JSON.stringify(apiDocData, null, 2)
    );
  }

  async generateTypeScriptDocumentation() {
    try {
      // Use TypeDoc for comprehensive TypeScript documentation
      await this.runCommand('npx', ['typedoc', '--out', 'docs/api/typedoc', 'src']);
    } catch (_error) {
      // Fallback: Manual TypeScript interface extraction
      const interfaces = await this.extractTypeScriptInterfaces();
      const interfaceMarkdown = this.generateInterfaceMarkdown(interfaces);

      await fs.promises.writeFile(`${this.apiDir}/typescript-interfaces.md`, interfaceMarkdown);
    }
  }

  async generateArchitectureDocumentation() {
    const architectureData = {
      timestamp: new Date().toISOString(),
      domains: await this.analyzeDomainStructure(),
      dependencies: await this.analyzeDependencies(),
      interfaces: await this.analyzeInterfaceArchitecture(),
      coordination: await this.analyzeCoordinationLayer(),
      neural: await this.analyzeNeuralArchitecture(),
    };

    const architectureMarkdown = this.generateArchitectureMarkdown(architectureData);
    await fs.promises.writeFile(
      `${this.architectureDir}/system-architecture.md`,
      architectureMarkdown
    );

    // Generate domain maps
    await this.generateDomainMaps(architectureData.domains);
  }

  async generatePerformanceDocumentation() {
    const performanceData = {
      timestamp: new Date().toISOString(),
      benchmarks: await this.extractBenchmarkData(),
      optimization: await this.extractOptimizationGuides(),
      monitoring: await this.extractMonitoringData(),
      bottlenecks: await this.analyzePerformanceBottlenecks(),
    };

    const performanceMarkdown = this.generatePerformanceMarkdown(performanceData);
    await fs.promises.writeFile(
      `${this.performanceDir}/performance-analysis.md`,
      performanceMarkdown
    );
  }

  async generateSecurityDocumentation() {
    const securityData = {
      timestamp: new Date().toISOString(),
      auditResults: await this.extractSecurityAuditResults(),
      vulnerabilities: await this.scanVulnerabilities(),
      hardening: await this.extractHardeningMeasures(),
      compliance: await this.checkComplianceStatus(),
      recommendations: await this.generateSecurityRecommendations(),
    };

    const securityMarkdown = this.generateSecurityMarkdown(securityData);
    await fs.promises.writeFile(`${this.securityDir}/security-analysis.md`, securityMarkdown);

    // Generate security checklist
    await this.generateSecurityChecklist(securityData);
  }

  async generateADRDocumentation() {
    const adrTemplate = this.generateADRTemplate();
    await fs.promises.writeFile(`${this.docsDir}/adrs/adr-template.md`, adrTemplate);

    // Generate automated ADRs from code analysis
    const autoADRs = await this.generateAutomatedADRs();
    for (const adr of autoADRs) {
      await fs.promises.writeFile(`${this.docsDir}/adrs/${adr.filename}`, adr.content);
    }
  }

  async generateTestCoverageDocumentation() {
    try {
      // Generate test coverage report
      await this.runCommand('npm', ['run', 'test:coverage']);

      // Process coverage data
      const coverageData = await this.processCoverageData();
      const coverageMarkdown = this.generateCoverageMarkdown(coverageData);

      await fs.promises.writeFile(
        `${this.docsDir}/coverage/coverage-analysis.md`,
        coverageMarkdown
      );
    } catch (_error) {}
  }

  async generateDeveloperGuide() {
    const developerGuide = `# Claude-Zen Developer Guide

*Generated: ${new Date().toISOString()}*

## Quick Start

### Installation
\`\`\`bash
npm install claude-code-zen
\`\`\`

### Basic Usage
\`\`\`bash
# Initialize project
claude-zen init my-project

# Start interfaces
claude-zen mcp start          # HTTP MCP (port 3000)
claude-zen web start --daemon # Web dashboard (port 3456)
\`\`\`

## Architecture Overview

${await this.generateArchitectureOverview()}

## Development Workflow

${await this.generateDevelopmentWorkflow()}

## Testing Strategy

${await this.generateTestingStrategy()}

## Deployment Guide

${await this.generateDeploymentGuide()}

## Troubleshooting

${await this.generateTroubleshootingGuide()}
`;

    await fs.promises.writeFile(`${this.docsDir}/guides/developer-guide.md`, developerGuide);
  }

  async generateDocumentationIndex() {
    const index = `# Claude-Zen Documentation Index

*Generated: ${new Date().toISOString()}*

## 📚 Documentation Sections

### 🏗️ Architecture
- [System Architecture](architecture/system-architecture.md)
- [Domain Analysis](architecture/domain-maps.md)
- [Interface Architecture](architecture/interface-analysis.md)

### 📖 API Reference
- [Comprehensive API](api/comprehensive-api.md)
- [TypeScript Interfaces](api/typescript-interfaces.md)
- [API Schema](api/api-schema.json)

### 🔒 Security
- [Security Analysis](security/security-analysis.md)
- [Security Checklist](security/security-checklist.md)
- [Compliance Status](security/compliance-report.md)

### ⚡ Performance
- [Performance Analysis](performance/performance-analysis.md)
- [Optimization Guides](performance/optimization-guides.md)
- [Monitoring Setup](performance/monitoring-setup.md)

### 🧪 Testing
- [Coverage Analysis](coverage/coverage-analysis.md)
- [Testing Strategy](guides/testing-strategy.md)
- [TDD Guidelines](guides/tdd-guidelines.md)

### 👨‍💻 Developer Guides
- [Developer Guide](guides/developer-guide.md)
- [Contributing Guide](guides/contributing.md)
- [Deployment Guide](guides/deployment.md)

### 📋 Architecture Decision Records
- [ADR Template](adrs/adr-template.md)
- [Interface Isolation](adrs/adr-001-interface-isolation.md)
- [Hybrid Testing Strategy](adrs/adr-002-hybrid-testing.md)

## 🔗 Quick Links

- [Getting Started](getting-started.md)
- [CLI Reference](cli-reference.md)
- [API Reference](api/comprehensive-api.md)
- [Architecture Overview](architecture/system-architecture.md)
- [Security Guidelines](security/security-analysis.md)
`;

    await fs.promises.writeFile(`${this.docsDir}/INDEX.md`, index);
  }

  // Helper methods for data extraction and processing
  async processTypeScriptFiles(files) {
    const processed = [];
    for (const file of files.slice(0, 20)) {
      // Limit for performance
      try {
        const content = await fs.promises.readFile(file, 'utf-8');
        const interfaces = this.extractTSInterfaces(content);
        const exports = this.extractTSExports(content);

        if (interfaces.length > 0 || exports.length > 0) {
          processed.push({
            file,
            interfaces,
            exports,
            lineCount: content.split('\n').length,
          });
        }
      } catch (error) {
        console.warn(`Warning: Could not process ${file}: ${error.message}`);
      }
    }
    return processed;
  }

  async processJavaScriptFiles(files) {
    const processed = [];
    for (const file of files.slice(0, 20)) {
      // Limit for performance
      try {
        const content = await fs.promises.readFile(file, 'utf-8');
        const jsdoc = this.extractJSDoc(content);
        const exports = this.extractJSExports(content);

        if (jsdoc.length > 0 || exports.length > 0) {
          processed.push({
            file,
            jsdoc,
            exports,
            lineCount: content.split('\n').length,
          });
        }
      } catch (error) {
        console.warn(`Warning: Could not process ${file}: ${error.message}`);
      }
    }
    return processed;
  }

  extractTSInterfaces(content) {
    const interfaceRegex = /interface\s+(\w+)\s*{[^}]*}/g;
    const matches = content.match(interfaceRegex) || [];
    return matches.map((match) => {
      const name = match.match(/interface\s+(\w+)/)?.[1];
      return { name, definition: match };
    });
  }

  extractTSExports(content) {
    const exportRegex = /export\s+(?:interface|class|function|const|let|var)\s+(\w+)/g;
    const matches = [...content.matchAll(exportRegex)];
    return matches.map((match) => ({ name: match[1], type: 'export' }));
  }

  extractJSDoc(content) {
    const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
    const matches = content.match(jsdocRegex) || [];
    return matches.map((match) => ({ content: match }));
  }

  extractJSExports(content) {
    const exportRegex = /(?:module\.exports|exports\.|export\s+)/g;
    const matches = content.match(exportRegex) || [];
    return matches.map((match, index) => ({ index, type: match.trim() }));
  }

  async analyzeDomainStructure() {
    const domains = [];
    const srcDirs = await fs.promises.readdir('src', { withFileTypes: true });

    for (const dir of srcDirs.filter((d) => d.isDirectory())) {
      const domainPath = path.join('src', dir.name);
      const files = await glob(`${domainPath}/**/*.{ts,js}`);

      domains.push({
        name: dir.name,
        path: domainPath,
        fileCount: files.length,
        lineCount: await this.countLinesInFiles(files),
        subdirectories: await this.getSubdirectories(domainPath),
      });
    }

    return domains;
  }

  async analyzeDependencies() {
    try {
      const packageJson = JSON.parse(await fs.promises.readFile('package.json', 'utf-8'));
      return {
        dependencies: Object.keys(packageJson.dependencies || {}),
        devDependencies: Object.keys(packageJson.devDependencies || {}),
        peerDependencies: Object.keys(packageJson.peerDependencies || {}),
      };
    } catch (_error) {
      return { dependencies: [], devDependencies: [], peerDependencies: [] };
    }
  }

  async countLinesInFiles(files) {
    let totalLines = 0;
    for (const file of files) {
      try {
        const content = await fs.promises.readFile(file, 'utf-8');
        totalLines += content.split('\n').length;
      } catch (_error) {
        // Skip files that can't be read
      }
    }
    return totalLines;
  }

  async getSubdirectories(dirPath) {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    } catch (_error) {
      return [];
    }
  }

  generateAPIMarkdown(apiData) {
    return `# Comprehensive API Documentation

*Generated: ${apiData.timestamp}*  
*Version: ${apiData.version}*

## Overview

This documentation covers all TypeScript interfaces and JavaScript exports in the Claude-Zen codebase.

## TypeScript Files (${apiData.typescript.length})

${apiData.typescript
  .map(
    (file) => `
### ${file.file}

**Lines of Code:** ${file.lineCount}

**Interfaces (${file.interfaces.length}):**
${file.interfaces.map((iface) => `- \`${iface.name}\``).join('\n')}

**Exports (${file.exports.length}):**
${file.exports.map((exp) => `- \`${exp.name}\``).join('\n')}
`
  )
  .join('\n')}

## JavaScript Files (${apiData.javascript.length})

${apiData.javascript
  .map(
    (file) => `
### ${file.file}

**Lines of Code:** ${file.lineCount}

**JSDoc Comments:** ${file.jsdoc.length}
**Exports:** ${file.exports.length}
`
  )
  .join('\n')}

---

*This documentation is automatically generated. Do not edit manually.*
`;
  }

  generateArchitectureMarkdown(data) {
    return `# System Architecture Documentation

*Generated: ${data.timestamp}*

## Domain Structure

${data.domains
  .map(
    (domain) => `
### ${domain.name}
- **Path:** \`${domain.path}\`
- **Files:** ${domain.fileCount}
- **Lines of Code:** ${domain.lineCount}
- **Subdirectories:** ${domain.subdirectories.join(', ')}
`
  )
  .join('\n')}

## Dependencies

- **Runtime Dependencies:** ${data.dependencies.dependencies.length}
- **Development Dependencies:** ${data.dependencies.devDependencies.length}
- **Peer Dependencies:** ${data.dependencies.peerDependencies.length}

---

*Architecture analysis automatically generated.*
`;
  }

  async getProjectVersion() {
    try {
      const packageJson = JSON.parse(await fs.promises.readFile('package.json', 'utf-8'));
      return packageJson.version || '0.0.0';
    } catch (_error) {
      return '0.0.0';
    }
  }

  async runCommand(command, args) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { stdio: 'inherit' });
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });
    });
  }

  async extractSecurityAuditResults() {
    try {
      const auditFile = 'src/__tests__/swarm-zen/security-audit.test.js';
      if (await this.fileExists(auditFile)) {
        return { status: 'Available', file: auditFile };
      }
    } catch (_error) {
      // Ignore
    }
    return { status: 'Not available' };
  }

  async scanVulnerabilities() {
    try {
      // Run npm audit and parse results
      const { stdout } = await this.runCommandWithOutput('npm', ['audit', '--json']);
      return JSON.parse(stdout);
    } catch (_error) {
      return { vulnerabilities: {}, metadata: { totalDependencies: 0 } };
    }
  }

  async runCommandWithOutput(command, args) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => (stdout += data));
      child.stderr.on('data', (data) => (stderr += data));

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed: ${stderr}`));
        }
      });
    });
  }

  async fileExists(filePath) {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  generateSecurityMarkdown(data) {
    return `# Security Analysis Documentation

*Generated: ${data.timestamp}*

## Security Audit Results

${JSON.stringify(data.auditResults, null, 2)}

## Vulnerability Scan

- **Total Dependencies:** ${data.vulnerabilities.metadata?.totalDependencies || 0}
- **Vulnerabilities Found:** ${Object.keys(data.vulnerabilities.vulnerabilities || {}).length}

## Recommendations

${data.recommendations?.map((rec) => `- ${rec}`).join('\n') || 'No specific recommendations at this time.'}

---

*Security analysis automatically generated.*
`;
  }

  async getGeneratedDocuments() {
    const documents = [];
    const searchDirs = [this.apiDir, this.securityDir, this.performanceDir, this.architectureDir];

    for (const dir of searchDirs) {
      try {
        const files = await glob(`${dir}/**/*.md`);
        documents.push(...files);
      } catch (_error) {
        // Directory might not exist
      }
    }

    return documents;
  }

  // Implementation methods for file processing
  async extractInterfacesFromFiles(files) {
    const interfaces = [];
    for (const file of files.slice(0, 10)) {
      // Limit for performance
      try {
        const content = await fs.promises.readFile(file, 'utf-8');
        const fileInterfaces = this.extractTSInterfaces(content);
        if (fileInterfaces.length > 0) {
          interfaces.push({ file, interfaces: fileInterfaces });
        }
      } catch (_error) {
        // Skip files that can't be read
      }
    }
    return interfaces;
  }

  async extractExportsFromFiles(files) {
    const exports = [];
    for (const file of files.slice(0, 10)) {
      // Limit for performance
      try {
        const content = await fs.promises.readFile(file, 'utf-8');
        const fileExports = file.endsWith('.ts')
          ? this.extractTSExports(content)
          : this.extractJSExports(content);
        if (fileExports.length > 0) {
          exports.push({ file, exports: fileExports });
        }
      } catch (_error) {
        // Skip files that can't be read
      }
    }
    return exports;
  }

  // Stub methods for comprehensive functionality
  async analyzeInterfaceArchitecture() {
    return { interfaces: [] };
  }
  async analyzeCoordinationLayer() {
    return { coordination: 'analyzed' };
  }
  async analyzeNeuralArchitecture() {
    return { neural: 'analyzed' };
  }
  async extractBenchmarkData() {
    return { benchmarks: [] };
  }
  async extractOptimizationGuides() {
    return { optimization: [] };
  }
  async extractMonitoringData() {
    return { monitoring: [] };
  }
  async analyzePerformanceBottlenecks() {
    return { bottlenecks: [] };
  }
  async extractHardeningMeasures() {
    return { hardening: [] };
  }
  async checkComplianceStatus() {
    return { compliance: 'checked' };
  }
  async generateSecurityRecommendations() {
    return ['Regular security audits', 'Dependency updates'];
  }
  async generateDomainMaps() {
    return 'Generated domain maps';
  }
  async extractTypeScriptInterfaces() {
    return [];
  }
  generateInterfaceMarkdown() {
    return '# TypeScript Interfaces\n\nTo be implemented.';
  }
  generatePerformanceMarkdown() {
    return '# Performance Analysis\n\nTo be implemented.';
  }
  async generateSecurityChecklist() {
    return 'Security checklist generated';
  }
  generateADRTemplate() {
    return '# ADR Template\n\n## Status\n\n## Context\n\n## Decision\n\n## Consequences';
  }
  async generateAutomatedADRs() {
    return [];
  }
  async processCoverageData() {
    return { coverage: 0 };
  }
  generateCoverageMarkdown() {
    return '# Coverage Analysis\n\nTo be implemented.';
  }
  async generateArchitectureOverview() {
    return 'Architecture overview to be implemented.';
  }
  async generateDevelopmentWorkflow() {
    return 'Development workflow to be implemented.';
  }
  async generateTestingStrategy() {
    return 'Testing strategy to be implemented.';
  }
  async generateDeploymentGuide() {
    return 'Deployment guide to be implemented.';
  }
  async generateTroubleshootingGuide() {
    return 'Troubleshooting guide to be implemented.';
  }
}

// CLI runner
async function main() {
  const generator = new EnhancedDocumentationGenerator();
  const documents = await generator.generateComprehensiveDocumentation();
  documents.forEach((_doc) => {});
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { EnhancedDocumentationGenerator };
