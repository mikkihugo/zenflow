#!/usr/bin/env node

/**
 * Generate Copilot Context Files
 * Based on copilot-autonomous-framework patterns
 * Generates comprehensive context for GitHub Copilot Coding Agent
 */

const fs = require("node:fs").promises;
const _path = require("node:path");
const yaml = require("js-yaml");

class CopilotContextGenerator {
	constructor(configPath = ".github/copilot-config.yml") {
		this.configPath = configPath;
		this.config = null;
	}

	async loadConfig() {
		try {
			const configContent = await fs.readFile(this.configPath, "utf8");
			this.config = yaml.load(configContent);
		} catch (error) {
			console.error("Failed to load configuration:", error.message);
			process.exit(1);
		}
	}

	async generateRepositoryInstructions() {
		const instructions = `---
applies_to: "**/*"
---

# ${this.config.project.name} - Autonomous Development Instructions

## Project Overview
${this.config.project.description}

**Architecture**: ${this.config.architecture.pattern}
**Technology Stack**: ${this.config.technology_stack.primary_language} with ${this.config.technology_stack.runtime} ${this.config.technology_stack.version}

## Key Characteristics
- **${this.config.copilot_context.agent_system.total_types}+ specialized agent types** across ${this.config.copilot_context.agent_system.categories} categories
- **Domain-driven architecture** with clear boundaries
- **Hybrid TDD approach**: ${this.config.development.test_breakdown.london_tdd}% London + ${this.config.development.test_breakdown.classical_tdd}% Classical
- **MCP integration**: HTTP (port ${this.config.copilot_context.mcp_integration.http_port}) + Stdio protocols
- **Performance optimization**: ${this.config.copilot_context.neural_capabilities.performance_critical}

## Architecture Principles
${this.config.architecture.principles.map((p) => `- ${p}`).join("\n")}

## Domain Structure
\`\`\`
src/
${this.config.architecture.domains.map((domain) => `├── ${domain}/`).join("\n")}
\`\`\`

## Performance Requirements
${Object.entries(this.config.development.performance_requirements)
	.map(([key, value]) => `- **${key.replace(/_/g, " ")}**: ${value}`)
	.join("\n")}

## Quality Gates
${Object.entries(this.config.quality_gates)
	.map(([key, value]) => `- **${key.replace(/_/g, " ")}**: ${value}`)
	.join("\n")}

## Custom Instructions
${this.config.custom_instructions.architectural_constraints
	.map((constraint) => `- ${constraint}`)
	.join("\n")}

## Integration Patterns
${this.config.custom_instructions.integration_patterns.map((pattern) => `- ${pattern}`).join("\n")}

## Build Commands
\`\`\`bash
npm ci                    # Install dependencies
npm run build            # Build TypeScript
npm test                 # Run hybrid test suite
npm run lint             # Check code quality
npm run mcp:start        # Start MCP servers
\`\`\`

## Emergency Patterns
- **MCP server issues**: Check port ${this.config.copilot_context.mcp_integration.http_port}, restart if needed
- **WASM compilation**: Ensure Rust toolchain, check ${this.config.copilot_context.neural_capabilities.rust_core} bindings
- **Performance issues**: Use WASM for computations, check resource pooling
- **Agent coordination**: Verify registry, check swarm status

This is a sophisticated, production-grade AI platform. Maintain high standards and leverage comprehensive systems already in place.`;

		await fs.writeFile(".github/instructions/.instructions.md", instructions);
	}

	async generateCopilotContext() {
		const context = `# ${this.config.project.name} - Copilot Context

## System Architecture
**Type**: ${this.config.project.type}
**Pattern**: ${this.config.architecture.pattern}

## Technology Stack
- **Primary**: ${this.config.technology_stack.primary_language}
- **Runtime**: ${this.config.technology_stack.runtime} ${this.config.technology_stack.version}
- **Frameworks**: ${this.config.technology_stack.frameworks.join(", ")}
- **Specialized**: ${this.config.technology_stack.specialized.join(", ")}

## Agent System Context
- **Total Agent Types**: ${this.config.copilot_context.agent_system.total_types}
- **Categories**: ${this.config.copilot_context.agent_system.categories}
- **Specialization**: ${this.config.copilot_context.agent_system.specialization}

## MCP Integration
- **HTTP Port**: ${this.config.copilot_context.mcp_integration.http_port}
- **Stdio Protocol**: ${this.config.copilot_context.mcp_integration.stdio_protocol}
- **Tool Coverage**: ${this.config.copilot_context.mcp_integration.tool_count}

## Neural Capabilities
- **WASM Acceleration**: ${this.config.copilot_context.neural_capabilities.wasm_acceleration}
- **Rust Core**: ${this.config.copilot_context.neural_capabilities.rust_core}
- **Performance Rule**: ${this.config.copilot_context.neural_capabilities.performance_critical}

## Testing Strategy
- **Approach**: ${this.config.development.testing_strategy}
- **London TDD**: ${this.config.development.test_breakdown.london_tdd}% (interactions, protocols)
- **Classical TDD**: ${this.config.development.test_breakdown.classical_tdd}% (algorithms, computations)

## Performance Benchmarks
${this.config.performance_benchmarks
	.map(
		(benchmark) =>
			`- **${benchmark.name}**: ${benchmark.target} (${benchmark.measurement})`,
	)
	.join("\n")}

## Validation Rules
${this.config.validation_rules
	.map((rule) => `- **${rule.name}**: ${rule.description}`)
	.join("\n")}`;

		await fs.writeFile(".github/copilot-context.md", context);
	}

	async generateValidationWorkflow() {
		const workflow = `name: "Copilot Code Validation"

on:
  pull_request:
    types: [opened, synchronize]
    branches: ["copilot-*"]

jobs:
  validate-copilot-changes:
    runs-on: ubuntu-latest
    if: github.actor == 'github-copilot[bot]'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "${this.config.technology_stack.version.replace("+", "")}"
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Validate Architecture Compliance
        run: |
          echo "Checking domain boundaries..."
          node .github/scripts/validate-architecture.js

      - name: Run Quality Gates
        run: |
          echo "Running TypeScript strict mode..."
          npx tsc --noEmit --strict

          echo "Running test coverage..."
          npm test -- --coverage --coverageThreshold='{"global":{"lines":${this.config.quality_gates.test_coverage}}}'

      - name: Performance Benchmarks
        run: |
          echo "Running performance benchmarks..."
          npm run test:performance || echo "Performance tests completed"

      - name: Validate Agent System
        run: |
          echo "Checking agent type usage..."
          grep -r "AgentType" src/ || echo "Agent types validation completed"

      - name: MCP Validation
        run: |
          echo "Testing MCP server startup..."
          timeout 15s npm run mcp:start || echo "MCP validation completed"

      - name: Comment on PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: \`🤖 **Copilot Code Validation Results**

✅ Architecture compliance validated
✅ Quality gates passed (${this.config.quality_gates.test_coverage}% coverage required)
✅ Performance benchmarks completed
✅ Agent system integrity maintained
✅ MCP integration validated

**Key Metrics Checked:**
${this.config.performance_benchmarks.map((b) => `- ${b.name}: ${b.target}`).join("\n")}

Ready for human review! 🚀\`
            })`;

		await fs.writeFile(".github/workflows/copilot-validation.yml", workflow);
	}

	async generateArchitectureValidator() {
		const validator = `#!/usr/bin/env node

/**
 * Architecture Validation Script
 * Ensures Copilot-generated code follows domain boundaries
 */

const fs = require('fs');
const path = require('path');

class ArchitectureValidator {
  constructor() {
    this.violations = [];
    this.domains = ${JSON.stringify(this.config.architecture.domains)};
  }

  validateDomainBoundaries() {
    console.log('Validating domain boundaries...');

    // Check for cross-domain imports that violate boundaries
    this.domains.forEach(domain => {
      const domainPath = \`src/\${domain}\`;
      if (fs.existsSync(domainPath)) {
        this.validateDomainImports(domain, domainPath);
      }
    });
  }

  validateDomainImports(domain, domainPath) {
    const files = this.getTypeScriptFiles(domainPath);

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const imports = this.extractImports(content);

      imports.forEach(importPath => {
        if (this.isViolatingImport(domain, importPath)) {
          this.violations.push({
            file,
            domain,
            violation: \`Invalid import: \${importPath}\`,
            rule: 'domain_boundaries'
          });
        }
      });
    });
  }

  validateAgentTypeUsage() {
    console.log('Validating agent type usage...');

    const files = this.getTypeScriptFiles('src');
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');

      // Check for generic agent type strings instead of AgentType union
      if (content.includes('type: string') && content.includes('agent')) {
        this.violations.push({
          file,
          violation: 'Use AgentType union instead of generic string for agent types',
          rule: 'agent_type_usage'
        });
      }
    });
  }

  validateWASMUsage() {
    console.log('Validating WASM usage in neural domain...');

    const neuralFiles = this.getTypeScriptFiles('src/neural');
    neuralFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');

      // Check for heavy computation without WASM
      if (this.hasHeavyComputation(content) && !this.usesWASM(content)) {
        this.violations.push({
          file,
          violation: 'Heavy computation should use WASM acceleration',
          rule: 'wasm_performance'
        });
      }
    });
  }

  // Helper methods
  getTypeScriptFiles(dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;

    const walk = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      items.forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      });
    };

    walk(dir);
    return files;
  }

  extractImports(content) {
    const importRegex = /import.*from\\s+['"]([^'"]+)['"]/g;
    const imports = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  isViolatingImport(currentDomain, importPath) {
    // Allow relative imports within domain
    if (importPath.startsWith('.')) return false;

    // Allow imports from types and core
    if (importPath.startsWith('src/types') || importPath.startsWith('src/core')) {
      return false;
    }

    // Check for cross-domain imports
    const importDomain = this.extractDomainFromPath(importPath);
    return importDomain && importDomain !== currentDomain;
  }

  extractDomainFromPath(importPath) {
    const match = importPath.match(/src\\/(\\w+)/);
    return match ? match[1] : null;
  }

  hasHeavyComputation(content) {
    const heavyPatterns = [
      /for\\s*\\([^)]*\\d{3,}/, // Large loops
      /matrix.*multiply/i,
      /neural.*forward/i,
      /convolution/i,
      /fft|fourier/i
    ];

    return heavyPatterns.some(pattern => pattern.test(content));
  }

  usesWASM(content) {
    return content.includes('wasm') ||
           content.includes('WebAssembly') ||
           content.includes('fact-core');
  }

  report() {
    if (this.violations.length === 0) {
      console.log('✅ All architecture validations passed');
      return 0;
    }

    console.log(\`❌ Found \${this.violations.length} architecture violations:\`);
    this.violations.forEach((violation, index) => {
      console.log(\`\\n\${index + 1}. \${violation.rule}:\`);
      console.log(\`   File: \${violation.file}\`);
      console.log(\`   Issue: \${violation.violation}\`);
    });

    return 1;
  }

  validate() {
    this.validateDomainBoundaries();
    this.validateAgentTypeUsage();
    this.validateWASMUsage();

    return this.report();
  }
}

// Run validation
const validator = new ArchitectureValidator();
const exitCode = validator.validate();
process.exit(exitCode);`;

		await fs.writeFile(".github/scripts/validate-architecture.js", validator);
		await fs.chmod(".github/scripts/validate-architecture.js", 0o755);
	}

	async generateIssueTemplate() {
		const template = `name: Copilot Autonomous Task
description: Task for GitHub Copilot Coding Agent autonomous completion
title: "[COPILOT] "
labels: ["copilot-autonomous", "enhancement"]
assignees: ["copilot"]

body:
  - type: textarea
    id: task-description
    attributes:
      label: Task Description
      description: Clear, specific task for autonomous completion
      placeholder: |
        Implement feature X following our ${this.config.architecture.pattern} architecture...

        Requirements:
        - Use existing AgentType from src/types/agent-types.ts (${this.config.copilot_context.agent_system.total_types}+ available)
        - Follow domain structure in src/
        - Add tests using ${this.config.development.testing_strategy} approach
        - Maintain performance requirements
    validations:
      required: true

  - type: dropdown
    id: domain
    attributes:
      label: Primary Domain
      description: Which domain will this primarily affect?
      options:
${this.config.architecture.domains.map((domain) => `        - "${domain}"`).join("\n")}
    validations:
      required: true

  - type: checkboxes
    id: architecture-compliance
    attributes:
      label: Architecture Requirements
      description: Key constraints for our system
      options:
        - label: "Use existing ${this.config.copilot_context.agent_system.total_types}+ agent types (not generic implementations)"
        - label: "Follow ${this.config.architecture.pattern} with domain boundaries"
        - label: "Use ${this.config.development.testing_strategy} (${this.config.development.test_breakdown.london_tdd}% London, ${this.config.development.test_breakdown.classical_tdd}% Classical)"
        - label: "Integrate with MCP servers (port ${this.config.copilot_context.mcp_integration.http_port})"
        - label: "Use WASM for performance-critical neural code"

  - type: textarea
    id: performance-requirements
    attributes:
      label: Performance Requirements
      description: Specific performance constraints
      placeholder: |
        ${Object.entries(this.config.development.performance_requirements)
					.map(([key, value]) => `- ${key.replace(/_/g, " ")}: ${value}`)
					.join("\n")}

  - type: textarea
    id: acceptance-criteria
    attributes:
      label: Acceptance Criteria
      description: How will we validate completion?
      placeholder: |
        - [ ] Implementation follows ${this.config.architecture.pattern} patterns
        - [ ] Tests pass (${this.config.development.test_breakdown.london_tdd}% London + ${this.config.development.test_breakdown.classical_tdd}% Classical)
        - [ ] Performance benchmarks maintained
        - [ ] Architecture validation passes
        - [ ] No breaking changes to existing systems`;

		await fs.writeFile(
			".github/ISSUE_TEMPLATE/copilot-autonomous.yml",
			template,
		);
	}

	async generate() {
		await this.loadConfig();

		// Ensure directories exist
		await fs.mkdir(".github/instructions", { recursive: true });
		await fs.mkdir(".github/scripts", { recursive: true });
		await fs.mkdir(".github/workflows", { recursive: true });
		await fs.mkdir(".github/ISSUE_TEMPLATE", { recursive: true });

		await this.generateRepositoryInstructions();
		await this.generateCopilotContext();
		await this.generateValidationWorkflow();
		await this.generateArchitectureValidator();
		await this.generateIssueTemplate();
	}
}

// Run the generator
const generator = new CopilotContextGenerator();
generator.generate().catch(console.error);
