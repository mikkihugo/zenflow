// sparc-structure.js - SPARC structure creation utilities
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Creates basic SPARC structure manually
 * Exported from cli-main.js to maintain consistency
 */
export async function createSparcStructureManually() {
  try {
    // Create .roo directory structure
    const rooDirectories = [
      '.roo',
      '.roo/templates',
      '.roo/workflows',
      '.roo/modes',
      '.roo/configs',
    ];
    
    for (const dir of rooDirectories) {
      try {
        mkdirSync(dir, { recursive: true });
        console.log(`  ✓ Created ${dir}/`);
      } catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }
      }
    }

    // Create .roomodes file (copy from existing if available, or create basic version)
    let roomodesContent;
    try {
      // Check if .roomodes already exists and read it
      if (existsSync('.roomodes')) {
        roomodesContent = readFileSync('.roomodes', 'utf8');
        console.log('  ✓ Using existing .roomodes configuration');
      } else {
        throw new Error('File does not exist');
      }
    } catch {
      // Create basic .roomodes configuration
      roomodesContent = createBasicRoomodesConfig();
      writeFileSync('.roomodes', roomodesContent);
      console.log('  ✓ Created .roomodes configuration');
    }

    // Create basic workflow templates
    const basicWorkflow = createBasicSparcWorkflow();
    writeFileSync('.roo/workflows/basic-tdd.json', basicWorkflow);
    console.log('  ✓ Created .roo/workflows/basic-tdd.json');

    // Create README for .roo directory
    const rooReadme = createRooReadme();
    writeFileSync('.roo/README.md', rooReadme);
    console.log('  ✓ Created .roo/README.md');

    console.log('  ✅ Basic SPARC structure created successfully');
  } catch (err) {
    console.log(`  ❌ Failed to create SPARC structure: ${err.message}`);
  }
}

/**
 * Creates basic .roomodes configuration
 */
function createBasicRoomodesConfig() {
  return `# SPARC Development Modes Configuration
# This file defines available development modes for SPARC methodology

[sparc]
enabled = true
default_mode = "tdd"
output_format = "markdown"

[modes.tdd]
name = "Test-Driven Development"
description = "Complete TDD workflow using SPARC methodology"
phases = ["specification", "pseudocode", "architecture", "refinement", "completion"]

[modes.spec-pseudocode]
name = "Specification & Pseudocode"
description = "Define requirements and create algorithmic logic"
phases = ["specification", "pseudocode"]

[modes.architect]
name = "Architecture Design"
description = "System architecture design and documentation"
phases = ["architecture", "refinement"]

[modes.integration]
name = "Integration & Testing"
description = "Integration testing and validation"
phases = ["refinement", "completion"]
`;
}

/**
 * Creates basic SPARC workflow template
 */
function createBasicSparcWorkflow() {
  const workflow = {
    name: "Basic TDD Workflow",
    description: "Standard Test-Driven Development using SPARC methodology",
    version: "1.0.0",
    phases: [
      {
        name: "specification",
        description: "Define clear requirements and acceptance criteria",
        tasks: [
          "Analyze user requirements",
          "Define functional specifications",
          "Create acceptance criteria",
          "Identify edge cases"
        ]
      },
      {
        name: "pseudocode",
        description: "Create algorithmic logic and data structures",
        tasks: [
          "Design core algorithms",
          "Define data structures",
          "Map input/output flows",
          "Validate logic patterns"
        ]
      },
      {
        name: "architecture",
        description: "Design system architecture and components",
        tasks: [
          "Define component structure",
          "Design API interfaces",
          "Plan data flow",
          "Document architecture decisions"
        ]
      },
      {
        name: "refinement",
        description: "Implement with test-driven development",
        tasks: [
          "Write failing tests",
          "Implement minimal code",
          "Refactor for quality",
          "Ensure all tests pass"
        ]
      },
      {
        name: "completion",
        description: "Integration, documentation, and validation",
        tasks: [
          "Integration testing",
          "Performance validation",
          "Documentation updates",
          "Final quality checks"
        ]
      }
    ]
  };
  
  return JSON.stringify(workflow, null, 2);
}

/**
 * Creates README for .roo directory
 */
function createRooReadme() {
  return `# SPARC Development Environment

This directory contains SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology configuration and templates.

## Directory Structure

- \`templates/\` - Code and documentation templates
- \`workflows/\` - Predefined development workflows
- \`modes/\` - Custom development modes
- \`configs/\` - Configuration files

## Files

- \`.roomodes\` - Main configuration file defining available development modes
- \`workflows/basic-tdd.json\` - Basic Test-Driven Development workflow

## Usage

Use Claude Flow SPARC commands to leverage this configuration:

\`\`\`bash
npx claude-flow sparc modes              # List available modes
npx claude-flow sparc run tdd "feature"  # Run TDD workflow
npx claude-flow sparc info <mode>        # Get mode information
\`\`\`

## Customization

You can customize workflows and modes by editing the configuration files in this directory. Changes will be automatically picked up by the Claude Flow system.
`;
}