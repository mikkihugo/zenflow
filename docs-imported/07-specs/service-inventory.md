# Singularity Engine Service Inventory Report

Generated: Mon Jun 9 06:55:22 PM UTC 2025

## Executive Summary

The Singularity Engine contains **99 services** distributed across:
- **27 Platform Services** - Core infrastructure and shared capabilities
- **68 Domain Services** - Business-specific functionality
- **4 App Services** - Application-level services

### Documentation Coverage

- **README.md**: 40 services (40.4%)
- **CLAUDE.md**: 79 services (79.8%)
- **service.metadata.json**: 1 service (1.0%)
- **service.scope.toml**: 6 services (6.1%)
- **project.json**: 69 services (69.7%)
- **api.ts**: 28 services (28.3%)

## Critical Findings

### Services Missing All Documentation
The following services have no documentation files at all:

1. **platform/observatory-service/** - Completely undocumented (renamed from overwatch?)
2. **domains/strategic/apex-council-service/** - No documentation or project structure

### Services with Minimal Documentation
These services only have CLAUDE.md but are missing README.md:

**Platform Services:**
- auth-service
- certificate-authority-service
- certificates-management-service
- memory-service
- secrets-management-service
- task-orchestration-service

**Domain Services:**
- collective-intelligence-service
- cross-sell-platform-service
- global-billing-receiver-service
- model-performance-service
- model-service
- provider-service
- oncall/auth-service
- oncall/escalation-service
- oncall/notification-service
- oncall/oncall-probe-service
- oncall/oncall-service
- oncall/oncall-siem-service
- oncall/wazuh-service
- project/backlog-service
- project/project-management-service
- project/sprint-planning-service
- source-control/actions-service
- source-control/billing-service
- source-control/deployment-service
- source-control/git-core-service
- source-control/runner-management-service
- source-control/runner-monitoring-service
- source-control/system-passkey-service
- strategic/strategic-intelligence-service
- evolution/cognitive-architecture-service

### Well-Documented Services
These services have comprehensive documentation:

**Best Documentation (README + CLAUDE + project.json + api.ts):**
- platform/auth-service
- platform/memory-service
- platform/overwatch-service
- platform/safety-service
- platform/system-command-service
- domains/business/cross-sell-platform-service
- domains/business/global-billing-receiver-service
- domains/llm/model-performance-service
- domains/llm/model-service
- domains/llm/provider-service
- domains/llm/router-service
- domains/oncall/oncall-service
- domains/oncall/oncall-siem-service
- domains/project/project-service
- domains/source-control/git-platform-service

## Service Status by Domain

### Platform Services (27 total)
- **Active & Documented**: 15
- **Partially Documented**: 11
- **Undocumented**: 1 (observatory-service)

### Business Domain (8 services)
- **All have CLAUDE.md**
- **6 have README.md**
- **All have project.json**
- **2 have api.ts**

### Knowledge Domain (5 services)
- **All have CLAUDE.md and README.md**
- **Only 2 have project.json**
- **None have api.ts**

### LLM Domain (6 services)
- **All have CLAUDE.md**
- **3 have README.md**
- **5 have project.json**
- **5 have api.ts**

### OnCall Domain (8 services)
- **All have CLAUDE.md**
- **2 have README.md**
- **All have project.json**
- **2 have api.ts**

### Project Domain (5 services)
- **All have CLAUDE.md**
- **2 have README.md**
- **All have project.json**
- **1 has api.ts**

### Source Control Domain (10 services)
- **All have CLAUDE.md**
- **2 have README.md**
- **4 have project.json**
- **6 have api.ts**

### Strategic Domain (3 services)
- **2 have CLAUDE.md**
- **2 have README.md**
- **2 have project.json**
- **None have api.ts**

### Evolution Domain (2 services)
- **1 has CLAUDE.md**
- **1 has README.md**
- **1 has project.json**
- **None have api.ts**

## Services Mentioned But Not Found

Based on documentation references, these services appear to be missing:
1. **hivemind-coordination-service** - Referenced in multiple places
2. **tenant-management-service** - Critical for multi-tenancy
3. **monitoring-service** - Separate from overwatch/observatory
4. **telemetry-service** - For metrics collection
5. **logging-service** - Centralized logging

## Recommendations

### Immediate Actions Needed

1. **Create README.md for all services missing it** (59 services)
   - Use a standard template with: Purpose, API endpoints, Dependencies, Configuration
   
2. **Standardize service.scope.toml** (93 services missing)
   - Define service boundaries and responsibilities
   - Document integration points
   
3. **Add service.metadata.json** (98 services missing)
   - Service version, status, dependencies
   - Health check endpoints
   - Resource requirements

4. **Document observatory-service**
   - Appears to be renamed from overwatch-service
   - Needs complete documentation set

5. **Create missing api.ts files** (71 services)
   - Define service contracts
   - Enable Encore.dev integration

### Documentation Template Structure

```markdown
# Service Name

## Purpose
Brief description of what this service does

## Status
- [ ] Development
- [ ] Testing
- [ ] Production Ready
- [ ] Deprecated

## API Endpoints
List of available endpoints

## Dependencies
- Service dependencies
- External dependencies

## Configuration
Environment variables and configuration options

## Integration Points
How this service connects with others

## Deployment
Deployment requirements and instructions
```

### Priority Order

1. **High Priority** (Core Platform Services):
   - memory-service
   - auth-service
   - registry-service
   - messaging-service
   - guardian-protection-service

2. **Medium Priority** (Domain Services):
   - All LLM domain services
   - All OnCall domain services
   - Strategic planning services

3. **Low Priority** (Support Services):
   - Development tools
   - Testing services
   - Utility services

## Next Steps

1. Run documentation generation scripts for each service
2. Create standardized templates for missing documentation
3. Set up automated documentation validation in CI/CD
4. Implement service discovery and auto-documentation
5. Create service dependency graph visualization