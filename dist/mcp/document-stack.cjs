#!/usr/bin/env node
/**
 * Document Stack - Simple metadata + rules system
 * Just metadata in docs and some layering rules - not complex
 */

class DocumentStack {
  constructor(memoryStore) {
    this.memoryStore = memoryStore;
    this.rules = new Map();
    this.metadata = new Map();
  }

  // Simple metadata system - just add to front matter
  addDocumentMetadata(docId, metadata) {
    const frontMatter = {
      ...metadata,
      created: new Date().toISOString(),
      stack_layer: this.determineLayer(metadata.type),
      auto_routing: this.getAutoRouting(metadata.type),
      dependencies: metadata.dependencies || [],
      tags: metadata.tags || []
    };
    
    this.metadata.set(docId, frontMatter);
    return frontMatter;
  }

  // Simple layering rules
  determineLayer(docType) {
    const layers = {
      // Infrastructure layer
      'deployment-guide': 'infrastructure',
      'monitoring-spec': 'infrastructure', 
      'security-spec': 'infrastructure',
      
      // Service layer  
      'service-adr': 'service',
      'interface-spec': 'service',
      'service-description': 'service',
      
      // Application layer
      'api-documentation': 'application',
      'user-guide': 'application',
      'tutorial': 'application',
      
      // Business layer
      'roadmap': 'business',
      'requirements-spec': 'business'
    };
    
    return layers[docType] || 'application';
  }

  // Auto-routing based on simple rules
  getAutoRouting(docType) {
    const routing = {
      'service-adr': { 
        approvers: ['architect', 'tech-lead'],
        validation: ['consistency-check', 'dependency-analysis']
      },
      'api-documentation': {
        approvers: ['product-owner'],
        validation: ['completeness-check']
      },
      'security-spec': {
        approvers: ['security-team', 'architect'],
        validation: ['security-scan', 'compliance-check']
      }
    };
    
    return routing[docType] || { approvers: ['team-lead'], validation: [] };
  }

  // Simple rule engine
  addRule(name, condition, action) {
    this.rules.set(name, { condition, action });
  }

  // Apply rules to document
  async applyRules(document) {
    const results = [];
    
    for (const [name, rule] of this.rules) {
      if (rule.condition(document)) {
        const result = await rule.action(document);
        results.push({ rule: name, result });
      }
    }
    
    return results;
  }

  // Generate simple front matter for any document
  generateFrontMatter(docType, service, metadata = {}) {
    return `---
type: ${docType}
service: ${service}
layer: ${this.determineLayer(docType)}
created: ${new Date().toISOString()}
auto_routing: ${JSON.stringify(this.getAutoRouting(docType), null, 2)}
dependencies: ${JSON.stringify(metadata.dependencies || [])}
tags: ${JSON.stringify(metadata.tags || [])}
---

`;
  }

  // Simple document creation with metadata
  async createDocument(docType, service, docId, content, metadata = {}) {
    const frontMatter = this.generateFrontMatter(docType, service, metadata);
    const fullContent = frontMatter + content;
    
    // Store with metadata
    const namespace = `service-documents/${service}`;
    const documentData = {
      id: docId,
      service: service,
      docType: docType,
      content: { raw: content, frontMatter: frontMatter },
      metadata: this.addDocumentMetadata(docId, { type: docType, service, ...metadata }),
      created: new Date().toISOString(),
      version: 1
    };

    await this.memoryStore.store(docId, JSON.stringify(documentData), {
      namespace: namespace,
      metadata: {
        type: 'document_stack',
        docType: docType,
        service: service,
        layer: this.determineLayer(docType)
      }
    });

    return {
      success: true,
      docId: docId,
      frontMatter: frontMatter,
      fullContent: fullContent,
      routing: this.getAutoRouting(docType)
    };
  }

  // Simple balancing - just round robin for now
  getAvailableSwarm(layer) {
    const swarms = {
      infrastructure: ['infra-swarm-1', 'infra-swarm-2'],
      service: ['service-swarm-1', 'service-swarm-2'], 
      application: ['app-swarm-1', 'app-swarm-2'],
      business: ['business-swarm-1']
    };
    
    const available = swarms[layer] || swarms.application;
    return available[Math.floor(Math.random() * available.length)];
  }

  // Simple search by metadata
  async searchByMetadata(criteria) {
    const results = [];
    const allDocs = await this.memoryStore.search({ pattern: '*' });
    
    for (const [key, value] of Object.entries(allDocs)) {
      try {
        const doc = JSON.parse(value);
        if (this.matchesCriteria(doc.metadata, criteria)) {
          results.push({
            id: key,
            metadata: doc.metadata,
            service: doc.service,
            docType: doc.docType
          });
        }
      } catch (e) {
        // Skip malformed docs
      }
    }
    
    return results;
  }

  matchesCriteria(metadata, criteria) {
    for (const [key, value] of Object.entries(criteria)) {
      if (metadata[key] !== value) {
        return false;
      }
    }
    return true;
  }
}

// Default rules - simple and practical
function setupDefaultRules(documentStack) {
  // Rule: ADRs need architecture review
  documentStack.addRule('adr-review', 
    (doc) => doc.docType === 'service-adr',
    async (doc) => ({
      action: 'require_approval',
      approvers: ['architect', 'tech-lead'],
      reason: 'ADRs require architectural review'
    })
  );

  // Rule: Security docs need security team approval
  documentStack.addRule('security-approval',
    (doc) => doc.docType === 'security-spec',
    async (doc) => ({
      action: 'require_approval', 
      approvers: ['security-team'],
      reason: 'Security specifications require security team approval'
    })
  );

  // Rule: API docs need product owner approval
  documentStack.addRule('api-approval',
    (doc) => doc.docType === 'api-documentation',
    async (doc) => ({
      action: 'require_approval',
      approvers: ['product-owner'],
      reason: 'API documentation affects user experience'
    })
  );

  // Rule: Auto-tag by service type
  documentStack.addRule('auto-tag',
    (doc) => true,
    async (doc) => {
      const tags = [];
      if (doc.service.includes('elixir')) tags.push('elixir');
      if (doc.service.includes('gleam')) tags.push('gleam');
      if (doc.service.includes('api')) tags.push('api');
      return { action: 'add_tags', tags };
    }
  );
}

// Simple template system
const documentTemplates = {
  'service-adr': `# Architecture Decision Record: {{title}}

## Status
{{status}} - {{date}}

## Context
{{context}}

## Decision
{{decision}}

## Consequences
### Positive
- {{positive_consequence}}

### Negative  
- {{negative_consequence}}

## References
- {{reference}}
`,

  'api-documentation': `# {{service_name}} API Documentation

## Overview
{{overview}}

## Authentication
{{auth_method}}

## Endpoints

### {{endpoint_name}}
- **Method**: {{method}}
- **URL**: {{url}}
- **Description**: {{description}}

#### Request
\`\`\`json
{{request_example}}
\`\`\`

#### Response
\`\`\`json
{{response_example}}
\`\`\`

## Error Codes
| Code | Description |
|------|-------------|
| {{error_code}} | {{error_description}} |
`,

  'service-description': `# {{service_name}}

## Purpose
{{purpose}}

## Technology Stack
- **Language**: {{language}}
- **Framework**: {{framework}}
- **Database**: {{database}}

## Dependencies
{{#each dependencies}}
- {{this}}
{{/each}}

## API Endpoints
- Health Check: \`GET /health\`
- {{custom_endpoints}}

## Configuration
{{configuration_details}}

## Deployment
{{deployment_instructions}}
`
};

module.exports = { DocumentStack, setupDefaultRules, documentTemplates };