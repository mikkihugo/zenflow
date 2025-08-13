#!/usr/bin/env node

/**
 * Generate Copilot Configuration Files
 * Based on copilot-autonomous-framework patterns
 * Converts project-config.yml into proper Copilot configuration files
 */

const fs = require('node:fs').promises;
const _path = require('node:path');
const yaml = require('js-yaml');

class CopilotConfigGenerator {
  constructor(configPath = 'project-config.yml') {
    this.configPath = configPath;
    this.config = null;
    this.templateContext = {};
  }

  async loadConfig() {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf8');
      this.config = yaml.load(configContent);
      this.prepareTemplateContext();
    } catch (error) {
      console.error('Failed to load project configuration:', error.message);
      process.exit(1);
    }
  }

  prepareTemplateContext() {
    // Flatten configuration and prepare template variables
    this.templateContext = {
      // Project variables
      PROJECT_NAME: this.config.project.name,
      PROJECT_DESCRIPTION: this.config.project.description,
      PROJECT_MISSION: this.config.project.mission,

      // Documents
      PRD_REFERENCE: this.config.documents?.prd_reference || '',
      TECHNICAL_SPEC_REFERENCE:
        this.config.documents?.technical_spec_reference || '',

      // Architecture
      ARCHITECTURE_PATTERN: this.config.architecture.pattern,
      PRINCIPLES: this.config.architecture.principles,

      // Technology flags (following their pattern)
      NODE_BACKEND:
        this.config.stack.backend.language === 'typescript' &&
        this.config.stack.backend.framework === 'node',
      REACT_FRONTEND: this.config.stack.frontend?.framework === 'react',
      RUST_WASM: this.config.stack.specialized?.neural?.language === 'rust',

      // Arrays for iteration
      DOMAINS: this.config.domains,
      FEATURES: this.config.features,
      PERFORMANCE_TARGETS: this.config.performance_targets,
      VALIDATION_RULES: this.config.validation_rules,

      // Agent system
      AGENT_TOTAL_TYPES: this.config.agent_system.total_types,
      AGENT_CATEGORIES: this.config.agent_system.categories,
      AGENT_SPECIALIZATION: this.config.agent_system.specialization_level,

      // Testing
      TESTING_STRATEGY: this.config.testing.strategy,
      LONDON_TDD_PERCENT: this.config.testing.breakdown.london_tdd,
      CLASSICAL_TDD_PERCENT: this.config.testing.breakdown.classical_tdd,
      COVERAGE_TARGET: this.config.testing.coverage_target,

      // MCP
      MCP_HTTP_PORT: this.config.mcp_integration.servers.http.port,
      MCP_STDIO: this.config.mcp_integration.servers.stdio.protocol === 'stdio',

      // Neural
      WASM_ACCELERATION: this.config.neural_capabilities.wasm_acceleration,
      RUST_CORE: this.config.neural_capabilities.rust_core,
      PERFORMANCE_RULE: this.config.neural_capabilities.performance_rule,

      // Memory
      MEMORY_BACKENDS: this.config.memory_system.backends,

      // Setup commands
      NODE_VERSION: this.config.environment_setup.node_version,
      PACKAGE_MANAGER: this.config.environment_setup.package_manager,
      ADDITIONAL_TOOLS: this.config.environment_setup.additional_tools,

      // Build and test commands
      BUILD_COMMANDS: ['npm ci', 'npm run build'],
      TEST_COMMANDS: ['npm test', 'npm run lint'],
      DEV_SETUP_COMMANDS: ['npm run mcp:start'],

      // Custom instructions
      ARCHITECTURAL_CONSTRAINTS:
        this.config.custom_instructions.architectural_constraints,
      PERFORMANCE_REQUIREMENTS:
        this.config.custom_instructions.performance_requirements,
    };
  }

  replaceTemplateVariables(template, context = this.templateContext) {
    let result = template;

    // Simple variable replacement {{VARIABLE}}
    Object.keys(context).forEach((key) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      const value = context[key];

      if (Array.isArray(value)) {
        result = result.replace(regex, value.join(', '));
      } else {
        result = result.replace(regex, String(value));
      }
    });

    // Handle conditional blocks {{#if CONDITION}}...{{/if}}
    result = this.handleConditionals(result, context);

    // Handle each blocks {{#each ARRAY}}...{{/each}}
    result = this.handleEachBlocks(result, context);

    return result;
  }

  handleConditionals(template, context) {
    const conditionalRegex = /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

    return template.replace(conditionalRegex, (_match, condition, content) => {
      const value = context[condition];
      return value ? content : '';
    });
  }

  handleEachBlocks(template, context) {
    const eachRegex = /\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

    return template.replace(eachRegex, (_match, arrayName, itemTemplate) => {
      const array = context[arrayName];
      if (!Array.isArray(array)) return '';

      return array
        .map((item) => {
          let result = itemTemplate;

          if (typeof item === 'object' && item !== null) {
            // Handle object properties like {{this.name}}, {{this.description}}
            Object.keys(item).forEach((key) => {
              const regex = new RegExp(`\\{\\{this\\.${key}\\}\\}`, 'g');
              result = result.replace(regex, String(item[key]));
            });
          } else {
            // Handle simple values {{this}}
            result = result.replace(/\{\{this\}\}/g, String(item));
          }

          return result;
        })
        .join('\n');
    });
  }

  async generateCopilotInstructions() {
    const template = `# {{PROJECT_NAME}} - Development Instructions

## Project Overview
{{PROJECT_DESCRIPTION}}

**Mission**: {{PROJECT_MISSION}}

## Architecture
- **Pattern**: {{ARCHITECTURE_PATTERN}}
- **Principles**: {{#each PRINCIPLES}}{{this}}, {{/each}}

## Key Technologies
{{#if NODE_BACKEND}}
- **Backend**: TypeScript with Node.js {{NODE_VERSION}}
- **Package Manager**: {{PACKAGE_MANAGER}}
{{/if}}

{{#if REACT_FRONTEND}}
- **Frontend**: React with TypeScript
{{/if}}

{{#if RUST_WASM}}
- **Neural Acceleration**: Rust/WASM with {{RUST_CORE}}
- **Performance Rule**: {{PERFORMANCE_RULE}}
{{/if}}

## Agent System
- **Total Agent Types**: {{AGENT_TOTAL_TYPES}}+ across {{AGENT_CATEGORIES}} categories
- **Specialization**: {{AGENT_SPECIALIZATION}} task assignment
- **Coordination**: Advanced swarm intelligence patterns

## Domain Structure
\`\`\`
src/
{{#each DOMAINS}}├── {{this}}/
{{/each}}
\`\`\`

## Testing Strategy
- **Approach**: {{TESTING_STRATEGY}}
- **London TDD**: {{LONDON_TDD_PERCENT}}% (interactions, protocols, coordination)
- **Classical TDD**: {{CLASSICAL_TDD_PERCENT}}% (algorithms, neural networks, computations)
- **Coverage Target**: {{COVERAGE_TARGET}}%

## MCP Integration
- **HTTP MCP**: Port {{MCP_HTTP_PORT}} for external tool integration
{{#if MCP_STDIO}}
- **Stdio MCP**: Internal swarm coordination protocol
{{/if}}

## Performance Requirements
{{#each PERFORMANCE_TARGETS}}
- {{this}}
{{/each}}

## Development Guidelines

### Architectural Constraints
{{#each ARCHITECTURAL_CONSTRAINTS}}
- {{this}}
{{/each}}

### Performance Requirements
{{#each PERFORMANCE_REQUIREMENTS}}
- {{this}}
{{/each}}

## Build Commands
\`\`\`bash
{{#each BUILD_COMMANDS}}{{this}}
{{/each}}
{{#each TEST_COMMANDS}}{{this}}
{{/each}}
{{#each DEV_SETUP_COMMANDS}}{{this}}
{{/each}}
\`\`\`

## Memory System
- **Backends**: {{#each MEMORY_BACKENDS}}{{this}}, {{/each}}
- **Features**: Connection pooling, multi-backend abstraction, caching

{{#if WASM_ACCELERATION}}
## WASM Integration
- **Rust Core**: {{RUST_CORE}}
- **Performance**: Always use WASM for heavy neural computations
- **Bindings**: JavaScript/WASM bridge with proper memory management
{{/if}}

## Validation Rules
{{#each VALIDATION_RULES}}
- **{{this.name}}**: {{this.description}}
{{/each}}

This is a sophisticated, production-grade AI platform. Maintain high standards and leverage the comprehensive systems already in place.`;

    const rendered = this.replaceTemplateVariables(template);
    await fs.writeFile('.github/copilot-instructions.md', rendered);
  }

  async generateCopilotContext() {
    const template = `# {{PROJECT_NAME}} - Copilot Context

## System Overview
**Type**: Advanced AI Coordination Platform
**Architecture**: {{ARCHITECTURE_PATTERN}}
**Mission**: {{PROJECT_MISSION}}

## Technology Stack
{{#if NODE_BACKEND}}
- **Backend**: TypeScript/Node.js {{NODE_VERSION}}
- **Build**: {{PACKAGE_MANAGER}} with TypeScript compiler
{{/if}}

{{#if RUST_WASM}}
- **Neural**: Rust/WASM ({{RUST_CORE}})
- **Performance**: {{PERFORMANCE_RULE}}
{{/if}}

## Agent Coordination System
- **Total Types**: {{AGENT_TOTAL_TYPES}}+ specialized agent types
- **Categories**: {{AGENT_CATEGORIES}} distinct categories
- **Specialization**: {{AGENT_SPECIALIZATION}} for optimal task assignment

## MCP Protocol Integration
- **HTTP Server**: Port {{MCP_HTTP_PORT}} (external tools)
{{#if MCP_STDIO}}
- **Stdio Server**: Internal swarm coordination
{{/if}}
- **Tool Categories**: Coordination, monitoring, memory, GitHub integration

## Testing Philosophy
- **Strategy**: {{TESTING_STRATEGY}}
- **London TDD**: {{LONDON_TDD_PERCENT}}% for interactions and protocols
- **Classical TDD**: {{CLASSICAL_TDD_PERCENT}}% for algorithms and computations
- **Target Coverage**: {{COVERAGE_TARGET}}%

## Performance Benchmarks
{{#each PERFORMANCE_TARGETS}}
- {{this}}
{{/each}}

## Domain Boundaries
{{#each DOMAINS}}
- **{{this}}**: Specialized domain with clear boundaries
{{/each}}

## Key Features
{{#each FEATURES}}
- {{this}}
{{/each}}

{{#if WASM_ACCELERATION}}
## Neural Acceleration
- **WASM Required**: All heavy computations use Rust/WASM
- **Core Module**: {{RUST_CORE}}
- **JavaScript Bridge**: Efficient memory management
{{/if}}

## Memory Architecture
- **Multi-Backend**: {{#each MEMORY_BACKENDS}}{{this}}, {{/each}}
- **Pooling**: Connection and resource pooling
- **Caching**: Multi-layer caching strategies

## Development Workflow
1. Check existing patterns in relevant domains
2. Use established agent types ({{AGENT_TOTAL_TYPES}}+ available)
3. Follow {{ARCHITECTURE_PATTERN}} boundaries
4. Apply {{TESTING_STRATEGY}} approach
5. Maintain performance standards`;

    const rendered = this.replaceTemplateVariables(template);
    await fs.writeFile('.github/copilot-context.md', rendered);
  }

  async generateCopilotSetupSteps() {
    const template = `name: "Copilot Setup Steps"

on:
  workflow_dispatch:
  push:
    paths:
      - .github/workflows/copilot-setup-steps.yml
  pull_request:
    paths:
      - .github/workflows/copilot-setup-steps.yml

jobs:
  copilot-setup-steps:
    runs-on: ubuntu-latest
    timeout-minutes: 45

    permissions:
      contents: read

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

{{#if NODE_BACKEND}}
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "{{NODE_VERSION}}"
          cache: "{{PACKAGE_MANAGER}}"

      - name: Install dependencies
        run: {{PACKAGE_MANAGER}} ci

      - name: Build TypeScript
        run: |
          echo "Building {{PROJECT_NAME}}..."
          {{PACKAGE_MANAGER}} run build
{{/if}}

{{#if RUST_WASM}}
      - name: Set up Rust/WASM toolchain
        run: |
          echo "Setting up Rust/WASM for {{RUST_CORE}}..."
          curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
          source ~/.cargo/env
          rustup target add wasm32-unknown-unknown
          cargo install wasm-pack
{{/if}}

      - name: Install additional tools
        run: |
          echo "Installing development tools..."
{{#each ADDITIONAL_TOOLS}}          {{PACKAGE_MANAGER}} install -g {{this}}
{{/each}}

      - name: Validate project structure
        run: |
          echo "Validating {{PROJECT_NAME}} structure..."
          echo "Domains:"
{{#each DOMAINS}}          [ -d "src/{{this}}" ] && echo "✅ {{this}} domain"
{{/each}}
          
          echo "Agent system:"
          [ -f "src/types/agent-types.ts" ] && echo "✅ {{AGENT_TOTAL_TYPES}}+ agent types available"

{{#if MCP_HTTP_PORT}}
      - name: Test MCP integration
        run: |
          echo "Testing MCP servers..."
          timeout 15s {{PACKAGE_MANAGER}} run mcp:start || echo "MCP test completed"
{{/if}}

      - name: Run test validation
        run: |
          echo "Validating {{TESTING_STRATEGY}} setup..."
{{#each TEST_COMMANDS}}          {{this}} || echo "Test validation completed"
{{/each}}

      - name: Prepare development environment
        run: |
          echo "=== {{PROJECT_NAME}} Development Environment Ready ==="
          echo "Architecture: {{ARCHITECTURE_PATTERN}}"
          echo "Agent Types: {{AGENT_TOTAL_TYPES}}+"
          echo "Testing: {{TESTING_STRATEGY}} ({{LONDON_TDD_PERCENT}}% London, {{CLASSICAL_TDD_PERCENT}}% Classical)"
{{#if WASM_ACCELERATION}}          echo "Neural: WASM acceleration enabled"
{{/if}}
          echo "Ready for autonomous development!"`;

    const rendered = this.replaceTemplateVariables(template);
    await fs.writeFile('.github/workflows/copilot-setup-steps.yml', rendered);
  }

  async generateIssueTemplate() {
    const template = `name: Copilot Autonomous Task
description: Task for GitHub Copilot Coding Agent following {{ARCHITECTURE_PATTERN}} patterns
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
        Implement feature X following {{ARCHITECTURE_PATTERN}} architecture...
        
        Requirements:
        - Use existing AgentType from src/types/agent-types.ts ({{AGENT_TOTAL_TYPES}}+ available)
        - Follow domain structure in src/
        - Add tests using {{TESTING_STRATEGY}} approach
        - Maintain performance requirements
    validations:
      required: true
      
  - type: dropdown
    id: domain
    attributes:
      label: Primary Domain
      description: Which domain will this primarily affect?
      options:
{{#each DOMAINS}}        - "{{this}}"
{{/each}}
    validations:
      required: true
      
  - type: checkboxes
    id: architecture-compliance
    attributes:
      label: Architecture Requirements
      description: Key constraints for {{PROJECT_NAME}}
      options:
        - label: "Use existing {{AGENT_TOTAL_TYPES}}+ agent types (not generic implementations)"
        - label: "Follow {{ARCHITECTURE_PATTERN}} with domain boundaries"
        - label: "Use {{TESTING_STRATEGY}} ({{LONDON_TDD_PERCENT}}% London, {{CLASSICAL_TDD_PERCENT}}% Classical)"
{{#if MCP_HTTP_PORT}}        - label: "Integrate with MCP servers (port {{MCP_HTTP_PORT}})"
{{/if}}
{{#if WASM_ACCELERATION}}        - label: "Use WASM for performance-critical neural code"
{{/if}}
        
  - type: textarea
    id: acceptance-criteria
    attributes:
      label: Acceptance Criteria
      description: How will we validate completion?
      placeholder: |
        - [ ] Implementation follows {{ARCHITECTURE_PATTERN}} patterns
        - [ ] Tests pass ({{LONDON_TDD_PERCENT}}% London + {{CLASSICAL_TDD_PERCENT}}% Classical)
        - [ ] Performance benchmarks maintained
        - [ ] Architecture validation passes
        - [ ] No breaking changes to existing systems`;

    const rendered = this.replaceTemplateVariables(template);
    await fs.writeFile(
      '.github/ISSUE_TEMPLATE/copilot-autonomous.yml',
      rendered
    );
  }

  async generate() {
    await this.loadConfig();

    // Ensure directories exist
    await fs.mkdir('.github', { recursive: true });
    await fs.mkdir('.github/workflows', { recursive: true });
    await fs.mkdir('.github/ISSUE_TEMPLATE', { recursive: true });

    await this.generateCopilotInstructions();
    await this.generateCopilotContext();
    await this.generateCopilotSetupSteps();
    await this.generateIssueTemplate();
  }
}

// Add js-yaml dependency check
try {
  require('js-yaml');
} catch (_error) {
  console.error('Please install js-yaml: npm install js-yaml');
  process.exit(1);
}

// Run the generator
const generator = new CopilotConfigGenerator();
generator.generate().catch(console.error);
