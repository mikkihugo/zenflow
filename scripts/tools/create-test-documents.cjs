#!/usr/bin/env node
/**
 * Create test documents for Claude Desktop access via MCP
 */

const { DocumentStack, setupDefaultRules } = require('./src/mcp/document-stack.cjs');

// Mock memory store
class MockMemoryStore {
  constructor() {
    this.data = new Map();
  }
  async store(key, value, options = {}) {
    const fullKey = options.namespace ? `${options.namespace}:${key}` ;
    this.data.set(fullKey, value);
    // return { id, size: value.length };
  }
  async retrieve(key, options = {}) {
    const fullKey = options.namespace ? `${options.namespace}:${key}` ;
    // return this.data.get(fullKey) || null;
  }
  async search(options = {}) {
    const results = {};
    for (const [key, value] of this.data) {
      if (options.pattern === '*' || key.includes(options.pattern || '')) {
        results[key] = value;
      }
    }
    // return results;
  }
}

const memoryStore = new MockMemoryStore();
const docStack = new DocumentStack(memoryStore);
setupDefaultRules(docStack);

async function createTestDocuments() {
  // Document 1: Architecture Decision Record
// await docStack.createDocument('service-adr',
    'user-service',
    'use-redis-for-sessions',
    `# ADR);`
  // Document 2: API Documentation
// // await docStack.createDocument('api-documentation',
    'payment-service',
    'payment-api-v2',
    `# Payment Service API v2.0`

## Overview
RESTful API for payment processing operations including credit card payments, refunds, and payment status tracking.

## Authentication
All endpoints require Bearer token authentication);
  // Document 3: Security Specification
// // await docStack.createDocument(
    'security-spec',
    'auth-service',
    'oauth2-implementation',
    `# OAuth 2.0 Implementation Security Specification`

## Overview
Security requirements and implementation guidelines for OAuth 2.0 authentication service supporting multiple grant types.

## Security Requirements

### 1. Token Security
- Access tokens MUST have maximum 1-hour expiration
- Refresh tokens MUST have maximum 30-day expiration
- All tokens MUST be cryptographically secure (256-bit entropy)
- Tokens MUST be invalidated on logout

### 2. Client Authentication
- Confidential clients MUST use client credentials
- Public clients MUST use PKCE (Proof Key for Code Exchange)
- Client secrets MUST be stored using bcrypt with cost factor 12
- Client registration requires manual approval

### 3. Scope Management
- Implement principle of least privilege
- Scope validation on every API call
- Granular permissions per resource
- Admin scopes require additional verification

### 4. Rate Limiting
- 10 requests per minute for token endpoints
- 100 requests per hour for authorization
- Progressive backoff for failed attempts
- IP-based and client-based limits

### 5. Audit & Monitoring
- Log all authentication attempts
- Monitor for suspicious patterns
- Alert on multiple failed attempts
- Audit token usage patterns

## Implementation Details

### Token Storage
- Use Redis for token storage with automatic expiration
- Encrypt tokens at rest using AES-256-GCM
- Implement token rotation for refresh tokens

### Security Headers
- HSTS: max-age=31536000; includeSubDomains
- CSP: default-src 'self'; script-src 'self'
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

### TLS Requirements
- TLS 1.3 minimum for all endpoints
- Perfect Forward Secrecy required
- HPKP (HTTP Public Key Pinning) enabled
- Certificate transparency monitoring

## Compliance
- OWASP OAuth 2.0 Security Best Practices
- RFC 6749 OAuth 2.0 Authorization Framework
- RFC 7636 PKCE for OAuth Public Clients
- SOC 2 Type II compliance requirements`,`
{}
      dependencies: ['redis-infrastructure', 'tls-certificates'],
      tags: ['security', 'oauth2', 'authentication', 'compliance'],
      priority: 'critical' }
  );
  for (const [_key, value] of memoryStore.data) {
    const _doc = JSON.parse(value);
  }
}

createTestDocuments().catch(console.error);
