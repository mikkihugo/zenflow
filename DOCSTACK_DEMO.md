# 🚀 Document Stack Demo - GitHub Models Style

## Overview

The Document Stack now includes interactive interfaces similar to GitHub Models, allowing you to create documents and provide human feedback on the automatic routing and metadata generation.

## Running the Demo

```bash
./run-docstack-demo.sh
```

This gives you three options:

### 1. Interactive CLI (Terminal-based)
```bash
./interactive-docstack.cjs
```

Features:
- Command-line interface for document management
- Create documents with automatic metadata
- Review documents and provide feedback
- Approve documents as different roles
- Run validations
- List and search documents

Commands:
- `create <type> <service> <id>` - Create a new document
- `review <service/type/id>` - Review document for approval
- `list [service]` - List documents
- `approve <service/type/id>` - Approve a document
- `validate <service/type/id>` - Run validation
- `help` - Show all commands

### 2. Web Interface (Browser-based)
```bash
./docstack-web-server.cjs
```

Then open: http://localhost:3456

Features:
- GitHub Models-like web interface
- Visual document creation form
- Automatic template loading
- Real-time metadata generation
- Human feedback forms
- Visual routing display

### 3. Run Tests
```bash
./test-docstack.cjs
```

Runs the test suite to verify the document stack functionality.

## How It Works

1. **Create Document**: Enter document details (type, service, content)
2. **Auto-Generation**: System automatically generates:
   - Layer assignment (infrastructure/service/application/business)
   - Routing rules (approvers and validations)
   - Metadata (timestamps, versions, etc.)
3. **Human Feedback**: Review the auto-generated routing and provide feedback
4. **Processing**: Documents are stored with namespace isolation per service

## Document Types

- **service-adr**: Architecture Decision Records
- **api-documentation**: API specs and docs
- **security-spec**: Security requirements
- **deployment-guide**: Infrastructure docs
- **user-guide**: End-user documentation

## Example Flow

1. Create an ADR for using PostgreSQL:
   - Type: `service-adr`
   - Service: `storage-service`
   - ID: `use-postgres`
   
2. System auto-generates:
   - Layer: `service`
   - Approvers: `architect, tech-lead`
   - Validations: `consistency-check, dependency-analysis`
   
3. Human reviews and can:
   - Confirm routing is correct
   - Suggest additional approvers
   - Add comments for improvements

## Integration with MCP

The document stack is fully integrated with the MCP server and can be accessed via:
- `service_document_manager` - CRUD operations
- `service_approval_workflow` - Approval management
- `service_document_validator` - Validation runs

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Web/CLI UI    │────▶│  Document Stack  │────▶│  Memory Store   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   Rule Engine    │
                        └──────────────────┘
```

Simple metadata + layering rules = powerful document management!