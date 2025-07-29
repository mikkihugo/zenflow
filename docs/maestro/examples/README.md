# Maestro Examples and Tutorials

## Overview

This directory contains comprehensive examples and tutorials for using the Maestro specifications-driven development framework with Claude-Flow's hive mind infrastructure.

## Quick Start Examples

### 1. Basic Feature Development

Create and implement a simple user authentication feature:

```bash
# Create specification
npx claude-flow maestro create-spec user-authentication \
  -r "Implement secure user authentication with JWT tokens and password hashing"

# Generate design using collective intelligence
npx claude-flow maestro generate-design user-authentication

# Approve design phase
npx claude-flow maestro approve-phase user-authentication

# Generate implementation tasks
npx claude-flow maestro generate-tasks user-authentication

# Implement tasks one by one
npx claude-flow maestro implement-task user-authentication 1
npx claude-flow maestro implement-task user-authentication 2
npx claude-flow maestro implement-task user-authentication 3

# Check progress
npx claude-flow maestro status user-authentication --detailed
```

### 2. Advanced Configuration

Use advanced hive mind settings for complex projects:

```bash
# High-confidence consensus for critical features
npx claude-flow maestro create-spec payment-processing \
  --consensus-threshold 0.85 \
  --max-agents 15 \
  -r "Implement secure payment processing with Stripe integration and fraud detection"

# Generate design with full collective intelligence
npx claude-flow maestro generate-design payment-processing

# Fast implementation without consensus (for non-critical tasks)
npx claude-flow maestro implement-task payment-processing 1 --skip-consensus
```

### 3. Domain-Specific Steering

Create steering documents for consistent guidance:

```bash
# Security standards
npx claude-flow maestro init-steering security \
  -c "# Security Standards
  
## Authentication
- Use JWT tokens with 15-minute expiration
- Implement refresh token rotation
- Require MFA for admin accounts

## Data Protection
- Encrypt all PII at rest using AES-256
- Use TLS 1.3 for all communications
- Implement field-level encryption for sensitive data"

# API design standards
npx claude-flow maestro init-steering api-design \
  -c "# API Design Standards
  
## REST Principles
- Use HTTP verbs correctly (GET, POST, PUT, DELETE)
- Implement proper status codes
- Use consistent naming conventions

## Error Handling
- Return structured error responses
- Include error codes and human-readable messages
- Log all errors with correlation IDs"
```

## Complete Project Workflow

### E-commerce Platform Example

This example demonstrates building a complete e-commerce platform using Maestro:

#### Phase 1: Core Authentication
```bash
# 1. User Authentication System
npx claude-flow maestro create-spec user-authentication \
  -r "Secure user registration, login, and session management with JWT"

npx claude-flow maestro generate-design user-authentication
npx claude-flow maestro approve-phase user-authentication
npx claude-flow maestro generate-tasks user-authentication

# Implement all authentication tasks
for i in {1..8}; do
  npx claude-flow maestro implement-task user-authentication $i
done
```

#### Phase 2: Product Management
```bash
# 2. Product Catalog System
npx claude-flow maestro create-spec product-catalog \
  -r "Product management with categories, inventory, pricing, and search"

npx claude-flow maestro generate-design product-catalog
npx claude-flow maestro approve-phase product-catalog
npx claude-flow maestro generate-tasks product-catalog

# Implement product management
for i in {1..12}; do
  npx claude-flow maestro implement-task product-catalog $i
done
```

#### Phase 3: Shopping Experience
```bash
# 3. Shopping Cart and Checkout
npx claude-flow maestro create-spec shopping-cart \
  --consensus-threshold 0.8 \
  -r "Shopping cart management and secure checkout process with payment integration"

npx claude-flow maestro generate-design shopping-cart
npx claude-flow maestro approve-phase shopping-cart
npx claude-flow maestro generate-tasks shopping-cart

# Implement shopping cart (with higher consensus for payment features)
for i in {1..10}; do
  npx claude-flow maestro implement-task shopping-cart $i
done
```

#### Phase 4: Order Management
```bash
# 4. Order Processing System
npx claude-flow maestro create-spec order-management \
  -r "Order processing, fulfillment tracking, and customer notifications"

npx claude-flow maestro generate-design order-management
npx claude-flow maestro approve-phase order-management
npx claude-flow maestro generate-tasks order-management

# Implement order management
for i in {1..15}; do
  npx claude-flow maestro implement-task order-management $i
done
```

### Project Status Monitoring

```bash
# Check all project components
npx claude-flow maestro status user-authentication --json > auth-status.json
npx claude-flow maestro status product-catalog --json > catalog-status.json
npx claude-flow maestro status shopping-cart --json > cart-status.json
npx claude-flow maestro status order-management --json > orders-status.json

# View cleanup and architecture status
npx claude-flow maestro clean
```

## Integration Examples

### 1. CI/CD Pipeline Integration

Create a GitHub Actions workflow that uses Maestro for feature development:

```yaml
# .github/workflows/maestro-feature-development.yml
name: Maestro Feature Development

on:
  workflow_dispatch:
    inputs:
      feature_name:
        description: 'Feature name'
        required: true
      feature_description:
        description: 'Feature description'
        required: true

jobs:
  generate_specification:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Create feature specification
        run: |
          npx claude-flow maestro create-spec "${{ github.event.inputs.feature_name }}" \
            -r "${{ github.event.inputs.feature_description }}"
            
      - name: Generate design
        run: |
          npx claude-flow maestro generate-design "${{ github.event.inputs.feature_name }}"
          
      - name: Generate tasks
        run: |
          npx claude-flow maestro approve-phase "${{ github.event.inputs.feature_name }}"
          npx claude-flow maestro generate-tasks "${{ github.event.inputs.feature_name }}"
          
      - name: Commit specifications
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .claude/claude-flow/maestro/specs/
          git commit -m "Add specifications for ${{ github.event.inputs.feature_name }}"
          git push
```

### 2. IDE Integration (VS Code Extension)

Example VS Code extension that integrates with Maestro:

```typescript
// extension.ts
import * as vscode from 'vscode';
import { MaestroOrchestrator } from './maestro-orchestrator';

export function activate(context: vscode.ExtensionContext) {
  // Register Maestro commands
  let createSpecCommand = vscode.commands.registerCommand(
    'maestro.createSpec',
    async () => {
      const featureName = await vscode.window.showInputBox({
        prompt: 'Enter feature name'
      });
      
      const description = await vscode.window.showInputBox({
        prompt: 'Enter feature description'
      });
      
      if (featureName && description) {
        const terminal = vscode.window.createTerminal('Maestro');
        terminal.sendText(
          `npx claude-flow maestro create-spec ${featureName} -r "${description}"`
        );
        terminal.show();
      }
    }
  );
  
  context.subscriptions.push(createSpecCommand);
}
```

### 3. Webhook Integration

Integrate Maestro with external systems using webhooks:

```javascript
// webhook-server.js
const express = require('express');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

// Webhook endpoint for automatic feature creation
app.post('/webhook/create-feature', (req, res) => {
  const { feature_name, description, priority } = req.body;
  
  const consensusThreshold = priority === 'high' ? '0.8' : '0.66';
  const maxAgents = priority === 'high' ? '12' : '8';
  
  const command = `npx claude-flow maestro create-spec ${feature_name} ` +
    `--consensus-threshold ${consensusThreshold} ` +
    `--max-agents ${maxAgents} ` +
    `-r "${description}"`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error}`);
      res.status(500).json({ error: error.message });
      return;
    }
    
    res.json({ 
      message: 'Feature specification created successfully',
      feature_name,
      output: stdout
    });
  });
});

app.listen(3000, () => {
  console.log('Maestro webhook server running on port 3000');
});
```

## Advanced Usage Patterns

### 1. Multi-Project Coordination

Coordinate feature development across multiple related projects:

```bash
# Project A: Core API
cd project-a
npx claude-flow maestro create-spec user-api \
  -r "User management API endpoints with authentication"

# Project B: Frontend
cd ../project-b  
npx claude-flow maestro create-spec user-interface \
  -r "User interface components that integrate with user API"

# Project C: Mobile App
cd ../project-c
npx claude-flow maestro create-spec mobile-user-auth \
  -r "Mobile authentication that integrates with core user API"

# Coordinate implementation timing
cd ../project-a && npx claude-flow maestro implement-task user-api 1
cd ../project-b && npx claude-flow maestro implement-task user-interface 1
cd ../project-c && npx claude-flow maestro implement-task mobile-user-auth 1
```

### 2. Feature Flag Integration

Integrate Maestro with feature flag systems:

```bash
# Create feature with feature flag consideration
npx claude-flow maestro create-spec experimental-recommendation-engine \
  -r "Machine learning recommendation engine with feature flag controls for gradual rollout"

# Create steering document for feature flag standards
npx claude-flow maestro init-steering feature-flags \
  -c "# Feature Flag Standards
  
## Implementation
- All new features must be behind feature flags
- Use percentage-based rollouts for gradual deployment
- Include kill switches for emergency rollback

## Naming Convention
- Use descriptive names: enable_recommendation_engine
- Include version numbers for major changes
- Group related flags with prefixes"
```

### 3. Testing Strategy Integration

Integrate comprehensive testing strategies:

```bash
# Create testing-focused specifications
npx claude-flow maestro create-spec comprehensive-testing \
  -r "Complete testing strategy including unit, integration, e2e, and performance tests"

# Create testing steering document
npx claude-flow maestro init-steering testing-standards \
  -c "# Testing Standards
  
## Coverage Requirements
- Unit tests: 90% line coverage minimum
- Integration tests: All API endpoints
- E2E tests: Critical user journeys
- Performance tests: All user-facing features

## Test Structure
- Use AAA pattern (Arrange, Act, Assert)
- Include negative test cases
- Test error conditions and edge cases
- Use data-driven tests for multiple scenarios"
```

## Troubleshooting Examples

### Common Issues and Solutions

#### 1. Consensus Timeout
```bash
# Issue: Consensus takes too long
# Solution: Adjust timeout and threshold

npx claude-flow maestro create-spec quick-feature \
  --consensus-threshold 0.5 \    # Lower threshold
  --max-agents 4 \               # Fewer agents
  -r "Simple feature with faster consensus"
```

#### 2. Resource Constraints
```bash
# Issue: System runs out of memory
# Solution: Limit concurrent workflows

# Check current status first
npx claude-flow maestro status feature-1
npx claude-flow maestro status feature-2
npx claude-flow maestro status feature-3

# Implement one feature at a time
npx claude-flow maestro implement-task feature-1 1
# Wait for completion before starting next
```

#### 3. Integration Failures
```bash
# Issue: Hive mind integration fails
# Solution: Check system status and restart

# Check cleanup status
npx claude-flow maestro clean

# Check help for current implementation status
npx claude-flow maestro help

# Use simplified mode if needed
npx claude-flow maestro create-spec simple-feature \
  --no-hive-mind \               # Disable collective intelligence
  -r "Simple feature without hive mind"
```

## Performance Optimization Examples

### 1. High-Performance Configuration
```bash
# Optimize for speed
npx claude-flow maestro create-spec fast-feature \
  --consensus-threshold 0.51 \   # Minimal consensus
  --max-agents 3 \               # Few agents
  --skip-consensus \             # Skip consensus for tasks
  -r "Feature optimized for development speed"
```

### 2. High-Quality Configuration
```bash
# Optimize for quality
npx claude-flow maestro create-spec quality-feature \
  --consensus-threshold 0.9 \    # High consensus
  --max-agents 20 \              # Many agents
  -r "Feature optimized for maximum quality and validation"
```

### 3. Balanced Configuration
```bash
# Balanced approach (recommended)
npx claude-flow maestro create-spec balanced-feature \
  --consensus-threshold 0.66 \   # Standard consensus
  --max-agents 8 \               # Reasonable agent count
  -r "Feature with balanced speed and quality optimization"
```

## Best Practices Summary

### 1. Feature Naming
- Use descriptive, kebab-case names: `user-authentication`, `payment-processing`
- Include version suffixes for major changes: `api-v2`, `checkout-redesign`
- Group related features with prefixes: `admin-user-management`, `admin-reporting`

### 2. Consensus Configuration
- **Critical features**: 0.8-0.9 threshold, 10-15 agents
- **Standard features**: 0.66 threshold, 6-8 agents  
- **Experimental features**: 0.5 threshold, 3-5 agents

### 3. Workflow Organization
- Create steering documents before starting major projects
- Use consistent description patterns across related features
- Implement tasks in logical dependency order
- Regular status checks to monitor progress

### 4. Integration Patterns
- Use webhooks for external system integration
- Implement CI/CD pipelines for automated workflows
- Create IDE extensions for developer productivity
- Monitor resource usage for large projects

*Generated by Maestro Examples and Tutorial System*