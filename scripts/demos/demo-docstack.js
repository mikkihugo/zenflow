#!/usr/bin/env node;
/**
 * Live Demo: Creating documents through the MCP document stack;
 */
// ANSI colors for pretty output
const _colors = {
  reset: '\x1b[0m',
bright: '\x1b[1m',
green: '\x1b[32m',
blue: '\x1b[34m',
yellow: '\x1b[33m',
cyan: '\x1b[36m',
magenta: '\x1b[35m'
// }
// Document examples to create
const _documentExamples = [
  //   {
    service: 'unified-storage',
    docType: 'service-adr',
    docId: 'use-postgres-for-storage',
    content: `# ADR: Use PostgreSQL for Primary Storage`
## Status;
Accepted - 2025-01-17
## Context;
We need a reliable, scalable database solution for our storage service that supports ACID transactions and complex queries.
## Decision;
We will use PostgreSQL 15+  primary storage solution.
## Consequences;
### Positive;
- Strong ACID compliance for data integrity;
- Excellent support for complex queries and indexes;
- Mature ecosystem with good tooling;
- Support for JSON/JSONB for flexible schemas
### Negative;
- Requires more operational expertise than NoSQL alternatives;
- Vertical scaling h compared to distributed databases
## References;
- PostgreSQL 15 Documentation;
- Our performance benchmarks showing 10K TPS capability`,`
    metadata: {
      dependencies: ['database-infrastructure'],
      tags: ['database', 'architecture', 'postgresql'] } },
  //   {
    service: 'user-service',
    docType: 'api-documentation',
    docId: 'users-api-v1',
    content: `# User Service API Documentation`
## Overview;
RESTful API for user management operations including CRUD operations, authentication, and profile management.
## Authentication;
Bearer token authentication required for all endpoints except /health.
## Endpoints
### GET /api/v1/users;
Retrieve a list of users with pagination support.
**Query Parameters:**;
- page (integer): Page number, default 1;
- limit (integer): Items per page, default 20;
- sort (string): Sort field, default 'created_at'
**Response:**;
\`\`\`json;`
// {
  "users": [;
    //     {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2025-01-17T10,00Z";
    //     }
  ],
  "pagination": {
    "page",
    "limit",
    "total";
  //   }
// }
\`\`\`
### POST /api/v1/users;
Create a new user account.
**Request Body:**;
\`\`\`json;`
// {
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "name": "Jane Smith";
// }
\`\`\`
**Response:** 201 Created;
\`\`\`json;`
// {
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "created_at": "2025-01-17T10,00Z";
// }
\`\`\`
## Error Codes;
| Code | Description |;
|------|-------------|;
| 400 | Bad Request - Invalid input data |;
| 401 | Unauthorized - Invalid or missing token |;
| 404 | Not Found - User does not exist |;
| 409 | Conflict - Email already exists |;
| 500 | Internal Server Error |`,`
    metadata: {
      tags: ['api', 'rest', 'users'],
      version: '1.0.0' } },
  //   {
    service: 'payment-service',
    docType: 'security-spec',
    docId: 'pci-compliance',
    content: `# Payment Service Security Specification`
## PCI DSS Compliance Requirements
### Overview;
This document outlines security requirements for PCI DSS Level 1 compliance for our payment processing service.
### Requirements
#### 1. Build and Maintain a Secure Network;
- Install and maintain firewall configuration;
- Do not use vendor-supplied defaults for passwords;
- Encrypt transmission of cardholder data across networks
#### 2. Protect Cardholder Data;
- Protect stored cardholder data using AES-256 encryption;
- Mask PAN when displayed (first 6, last 4 digits max
// )
-Render
PAN
unreadable in all
storage
locations
#
#
#
#
3
Maintain;
a;
Vulnerability;
Management;
Program;
-Use;
and;
regularly;
update;
anti - virus;
software;
-Develop;
and;
maintain;
secure;
systems;
and;
applications;
-Implement;
security;
patches;
within;
30;
days;
#
#
#
#
4;
Implement;
Strong;
Access;
Control;
-Restrict;
access;
to;
cardholder;
data;
by;
business;
need - to - know;
-Assign;
unique;
ID;
to;
each;
person;
with computer access;
-Restrict;
physical;
access;
to;
cardholder;
data;
#
#
#
#
5;
Monitor;
and;
Test;
Networks;
-Track;
all;
access;
to;
network;
resources;
and;
cardholder;
data;
-Regularly;
test;
security;
systems;
and;
processes;
-Maintain;
audit;
trails;
for at least one year
#
#
#
#
6;
Maintain;
Information;
Security;
Policy;
-Establish, publish, maintain;
security;
policy;
-Implement;
security;
awareness;
program;
-Background;
checks;
for personnel with access to
cardholder;
data;
#
#
#
Implementation;
Details;
-Use;
HashiCorp;
Vault;
for key management;
- Implement TLS
1.3;
for all API communications;
-Enable;
comprehensive;
audit;
logging;
with Datadog;
-Quarterly;
vulnerability;
scans;
by;
approved;
vendor`,`
    metadata: {
      compliance: ['PCI-DSS', 'SOC2'],
      tags: ['security', 'compliance', 'payment'],
      priority: 'critical' } } ];
async function simulateDocumentCreation() {
  console.warn(`;`
$;
// {
  colors.bright;
// }
$;
// {
  colors.green;
// }
� Document Stack Live Demo$
// {
  colors.reset;
// }
\n`)`
console.warn('This demo will create real documents using the MCP document stack.\n')
// Instead of actual MCP calls, let's demonstrate the flow'
for (const doc of documentExamples) {
  console.warn(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.warn(`${colors.bright}� Creating);`
  console.warn(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  // Show what would be sent to MCP
  console.warn(`${colors.yellow}� MCP Request);`
  console.warn(`Tool);`
  console.warn(`Action);`
  console.warn(`Service);`
  console.warn(`DocType);`
  console.warn(`DocId);`
  console.warn(`Metadata:`, JSON.stringify(doc.metadata, null, 2));
  // Simulate the document stack processing
  console.warn(`\n${colors.green}✅ Document Stack Processing);`
  // Show auto-generated metadata
  const _layer = getLayer(doc.docType);
  const _routing = getRouting(doc.docType);
  console.warn(`\n${colors.magenta}� Auto-Generated Front Matter);`
  console.warn(`---`);
  console.warn(`type);`
  console.warn(`service);`
  console.warn(`layer);`
  console.warn(`created: ${new Date().toISOString()}`);
  console.warn(`auto_routing);`
  console.warn(`  approvers: ${JSON.stringify(routing.approvers)}`);
  console.warn(`  validation: ${JSON.stringify(routing.validation ?? [])}`);
  console.warn(`dependencies: ${JSON.stringify(doc.metadata.dependencies ?? [])}`);
  console.warn(`tags: ${JSON.stringify(doc.metadata.tags ?? [])}`);
  console.warn(`---`);
  // Show storage location
  console.warn(`\n${colors.blue}� Storage);`
  console.warn(`Namespace);`
  console.warn(`Key);`
  // Show load balancing
  const _swarm = getSwarmForLayer(layer);
  console.warn(`\n${colors.yellow}⚖ Load Balanced to);`
  // Show applied rules
  console.warn(`\n${colors.green}� Applied Rules);`
  if (doc.docType === 'service-adr') {
    console.warn(` ADR Review Rule);`
  //   }
  if (doc.docType === 'security-spec') {
    console.warn(` Security Approval Rule);`
  //   }
  if (doc.docType === 'api-documentation') {
    console.warn(` API Approval Rule);`
  //   }
  console.warn(` Auto-Tag Rule);`
  // Simulate success
  console.warn(;
  `\n${colors.bright}${colors.green}✨ Document created successfully!${colors.reset}`;
  //   )
  // Small delay for readability
  // // await new Promise((resolve) => setTimeout(resolve, 1000))
// }
// Summary
console.warn(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.warn(`${colors.bright}${colors.green}� Demo Summary${colors.reset}`);
console.warn(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
console.warn(`✅ Created ${documentExamples.length} documents);`
documentExamples.forEach((doc) => {
  console.warn(`   • ${doc.service}/${doc.docType}/${doc.docId}`);
});
console.warn(`\n${colors.yellow} Key Features Demonstrated);`
console.warn(`    Automatic metadata generation`);
console.warn(`    Layer-based organization`);
console.warn(`    Auto-routing for approvals`);
console.warn(`    Load balancing by layer`);
console.warn(`    Rule engine for validation`);
console.warn(`    Namespace isolation per service`);
console.warn(;
`\n${colors.bright}${colors.green}� Document Stack Ready for Production!${colors.reset}\n`;
// )
// }
// Helper functions matching document-stack.js
function getLayer() {
  const _layers = {
    'deployment-guide': 'infrastructure',
    'monitoring-spec': 'infrastructure',
    'security-spec': 'infrastructure',
    'service-adr': 'service',
    'interface-spec': 'service',
    'service-description': 'service',
    'api-documentation': 'application',
    'user-guide': 'application',
    tutorial: 'application',
    roadmap: 'business',
    'requirements-spec': 'business'
// }
// return layers[docType]  ?? 'application';
// }
function getRouting() {
  const _routing = {
    'service-adr': {
      approvers: ['architect', 'tech-lead'],
      validation: ['consistency-check', 'dependency-analysis']
// }


('api-documentation')
: null
// {
  approvers: ['product-owner'],
  validation: ['completeness-check']
// }


('security-spec')
: null
// {
  approvers: ['security-team', 'architect'],
  validation: ['security-scan', 'compliance-check']
// }


// 
}
// return routing[docType]  ?? { approvers: ['team-lead'], validation: [] };
// }
function getSwarmForLayer() {
  const _swarms = {
    infrastructure: ['infra-swarm-1', 'infra-swarm-2'],
    service: ['service-swarm-1', 'service-swarm-2'],
    application: ['app-swarm-1', 'app-swarm-2'],
    business: ['business-swarm-1']
// }
const _available = swarms[layer] ?? swarms.application;
// return available[Math.floor(Math.random() * available.length)];
// }
// Run the demo
if (require.main === module) {
  simulateDocumentCreation().catch(console.error);
// }

