#!/usr/bin/env node
/**
 * Create test documents for Claude Desktop access via MCP
 */

const { DocumentStack, setupDefaultRules } = require('./src/mcp/document-stack.cjs');

// Mock memory store
class MockMemoryStore {
  constructor() { this.data = new Map(); }
  async store(key, value, options = {}) {
    const fullKey = options.namespace ? `${options.namespace}:${key}` : key;
    this.data.set(fullKey, value);
    console.log(`📁 Stored: ${fullKey}`);
    return { id: fullKey, size: value.length };
  }
  async retrieve(key, options = {}) {
    const fullKey = options.namespace ? `${options.namespace}:${key}` : key;
    return this.data.get(fullKey) || null;
  }
  async search(options = {}) {
    const results = {};
    for (const [key, value] of this.data) {
      if (options.pattern === '*' || key.includes(options.pattern || '')) {
        results[key] = value;
      }
    }
    return results;
  }
}

const memoryStore = new MockMemoryStore();
const docStack = new DocumentStack(memoryStore);
setupDefaultRules(docStack);

async function createTestDocuments() {
  console.log('🚀 Creating test documents for Claude Desktop access...\n');
  
  // Document 1: Architecture Decision Record
  const adr = await docStack.createDocument(
    'service-adr',
    'user-service',
    'use-redis-for-sessions',
    `# ADR: Use Redis for Session Storage

## Status
Accepted - 2025-01-17

## Context
Our user service currently stores sessions in memory, which doesn't scale across multiple instances and loses sessions on restart. We need a distributed session storage solution that can handle high load and provide session persistence.

## Decision
We will use Redis as our session storage backend for the user service.

## Consequences
### Positive
- Sessions persist across service restarts
- Horizontal scaling support with shared session state
- Fast read/write performance for session data
- Built-in TTL support for session expiration
- Redis Cluster support for high availability

### Negative
- Additional infrastructure dependency
- Network latency for session operations
- Need to manage Redis high availability
- Memory usage for session data storage

## Implementation Notes
- Use Redis with TTL matching session timeout
- Implement session serialization/deserialization
- Configure Redis Cluster for production
- Monitor Redis memory usage and performance`,
    {
      dependencies: ['redis-infrastructure', 'user-service-core'],
      tags: ['sessions', 'redis', 'scaling', 'architecture']
    }
  );

  // Document 2: API Documentation
  const api = await docStack.createDocument(
    'api-documentation',
    'payment-service',
    'payment-api-v2',
    `# Payment Service API v2.0

## Overview
RESTful API for payment processing operations including credit card payments, refunds, and payment status tracking.

## Authentication
All endpoints require Bearer token authentication:
\`\`\`
Authorization: Bearer <your-api-token>
\`\`\`

## Base URL
- Production: \`https://api.example.com/v2/payments\`
- Staging: \`https://staging-api.example.com/v2/payments\`

## Endpoints

### POST /payments
Process a new payment

**Request Body:**
\`\`\`json
{
  "amount": 2500,
  "currency": "USD",
  "payment_method": {
    "type": "card",
    "card": {
      "number": "4242424242424242",
      "exp_month": 12,
      "exp_year": 2025,
      "cvc": "123"
    }
  },
  "customer_id": "cust_123456",
  "description": "Order #12345"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "pay_987654321",
  "status": "succeeded",
  "amount": 2500,
  "currency": "USD",
  "created": "2025-01-17T10:30:00Z",
  "customer_id": "cust_123456"
}
\`\`\`

### GET /payments/{payment_id}
Retrieve payment details

**Response:**
\`\`\`json
{
  "id": "pay_987654321",
  "status": "succeeded",
  "amount": 2500,
  "currency": "USD",
  "refunded": false,
  "created": "2025-01-17T10:30:00Z"
}
\`\`\`

### POST /payments/{payment_id}/refund
Process a refund

**Request Body:**
\`\`\`json
{
  "amount": 1000,
  "reason": "Customer request"
}
\`\`\`

## Error Handling
| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid API key |
| 402 | Payment Required - Insufficient funds |
| 404 | Not Found - Payment not found |
| 500 | Internal Server Error |

## Rate Limits
- 1000 requests per hour per API key
- 100 payments per minute per merchant`,
    {
      dependencies: ['payment-processor', 'fraud-detection'],
      tags: ['api', 'payments', 'rest', 'documentation']
    }
  );

  // Document 3: Security Specification
  const security = await docStack.createDocument(
    'security-spec',
    'auth-service',
    'oauth2-implementation',
    `# OAuth 2.0 Implementation Security Specification

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
- SOC 2 Type II compliance requirements`,
    {
      dependencies: ['redis-infrastructure', 'tls-certificates'],
      tags: ['security', 'oauth2', 'authentication', 'compliance'],
      priority: 'critical'
    }
  );

  console.log('\n✅ Created 3 test documents:');
  console.log('   1. user-service/service-adr/use-redis-for-sessions');
  console.log('   2. payment-service/api-documentation/payment-api-v2');
  console.log('   3. auth-service/security-spec/oauth2-implementation');
  
  console.log('\n📋 Documents are ready for Claude Desktop access via MCP!');
  
  // Show what Claude Desktop can access
  console.log('\n🔍 What you can do in Claude Desktop:');
  console.log('   • "List all service documents"');
  console.log('   • "Show me the payment API documentation"');
  console.log('   • "Get the Redis session ADR for user service"');
  console.log('   • "Review the OAuth2 security specification"');
  console.log('   • "What documents exist for user-service?"');
  
  // Show storage information
  console.log('\n💾 Storage Details:');
  for (const [key, value] of memoryStore.data) {
    const doc = JSON.parse(value);
    console.log(`   ${key} (Layer: ${doc.metadata.stack_layer})`);
  }
}

createTestDocuments().catch(console.error);