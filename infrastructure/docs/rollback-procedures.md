# Vision-to-Code System Rollback Procedures

## Table of Contents
1. [Overview](#overview)
2. [Rollback Triggers](#rollback-triggers)
3. [Rollback Types](#rollback-types)
4. [Pre-Rollback Checklist](#pre-rollback-checklist)
5. [Rollback Procedures](#rollback-procedures)
6. [Post-Rollback Actions](#post-rollback-actions)
7. [Emergency Procedures](#emergency-procedures)
8. [Communication Plan](#communication-plan)

## Overview

This document outlines the procedures for rolling back deployments of the Vision-to-Code system. These procedures ensure minimal downtime and data integrity during rollback scenarios.

### Key Principles
- **Zero-downtime rollbacks** using blue-green deployment
- **Data consistency** preservation during rollbacks
- **Automated validation** before and after rollback
- **Clear communication** throughout the process

## Rollback Triggers

### Automatic Triggers
1. **Health Check Failures**
   - 3+ consecutive health check failures
   - Response time > 5s for 5 minutes
   - Error rate > 10% for 5 minutes

2. **Resource Exhaustion**
   - CPU usage > 90% for 10 minutes
   - Memory usage > 95% for 5 minutes
   - Database connections > 90% capacity

3. **Critical Errors**
   - 5+ consecutive 5xx errors
   - Database connection failures
   - Service mesh communication breakdown

### Manual Triggers
1. **Business Impact**
   - Customer-reported critical issues
   - Data integrity concerns
   - Security vulnerabilities discovered

2. **Performance Degradation**
   - Significant latency increase
   - Throughput reduction > 50%
   - Queue backlogs growing

## Rollback Types

### 1. Service-Level Rollback
**When to use:** Single service experiencing issues

```bash
# Rollback specific service
./infrastructure/scripts/rollback-service.sh <service-name> <environment>

# Example

```

### 2. Full System Rollback
**When to use:** Multiple services affected or critical system-wide issue

```bash
# Rollback entire deployment
./infrastructure/scripts/deploy.sh rollback <environment>

# Example
./infrastructure/scripts/deploy.sh rollback production
```

### 3. Database Rollback
**When to use:** Schema changes causing issues

```bash
# Rollback database migrations
./infrastructure/scripts/db-rollback.sh <service> <version>

# Example
./infrastructure/scripts/db-rollback.sh business-service v1.2.0
```

## Pre-Rollback Checklist

### Immediate Actions
- [ ] **Identify the issue** - Gather error logs and metrics
- [ ] **Assess impact** - Determine affected users/features
- [ ] **Notify stakeholders** - Alert team and management
- [ ] **Verify rollback target** - Ensure previous version is stable

### Technical Validation
- [ ] **Check previous deployment** health status
- [ ] **Verify database compatibility** with previous version
- [ ] **Ensure sufficient resources** for parallel deployments
- [ ] **Confirm backup availability** for data recovery

## Rollback Procedures

### Standard Rollback (Blue-Green Switch)

#### Step 1: Verify Current State
```bash
# Check current deployment color
kubectl get service -n vision-to-code-production -o json | \
  jq '.items[] | select(.metadata.name | contains("vision-to-code")) | .spec.selector'

# Verify previous deployment health
kubectl get pods -n vision-to-code-production -l deployment-color=blue
```

#### Step 2: Execute Rollback
```bash
# Switch traffic to previous deployment
./infrastructure/scripts/deploy.sh rollback production

# Monitor rollback progress
./infrastructure/scripts/monitor-deployment.sh production 300
```

#### Step 3: Validate Rollback
```bash
# Run smoke tests
./infrastructure/scripts/smoke-tests.sh production

# Check service health
for service in business core swarm development; do
  curl -s https://api.vision-to-code.com/api/v1/$service/health | jq .
done
```

### Database Migration Rollback

#### Step 1: Stop Write Operations
```sql
-- Set database to read-only mode
ALTER DATABASE vision_to_code_production SET default_transaction_read_only = on;
```

#### Step 2: Execute Migration Rollback
```bash
# For each service database
for service in business core swarm development; do
  kubectl exec -n vision-to-code-production \
    deployment/${service}-service -- \
    mix ecto.rollback --to <previous-version>
done
```

#### Step 3: Restore Write Operations
```sql
-- Re-enable write operations
ALTER DATABASE vision_to_code_production SET default_transaction_read_only = off;
```

### Partial Rollback (Canary Reversion)

```bash
# Reduce canary traffic to 0%
kubectl patch virtualservice vision-to-code -n vision-to-code-production \
  --type merge \
  -p '{"spec":{"http":[{"weight":0}]}}'

# Scale down canary deployment
kubectl scale deployment vision-to-code-canary -n vision-to-code-production --replicas=0
```

## Post-Rollback Actions

### Immediate Tasks
1. **Verify System Stability**
   ```bash
   # Run comprehensive health checks
   ./infrastructure/scripts/health-check-all.sh production
   ```

2. **Monitor Metrics**
   ```bash
   # Watch key metrics for 30 minutes
   ./infrastructure/scripts/monitor-deployment.sh production 1800
   ```

3. **Communicate Status**
   - Update incident ticket
   - Notify stakeholders of rollback completion
   - Schedule post-mortem meeting

### Follow-up Actions
1. **Root Cause Analysis**
   - Collect all logs from failed deployment
   - Analyze metrics during failure window
   - Document timeline of events

2. **Fix Forward Planning**
   - Identify required fixes
   - Plan remediation deployment
   - Update test coverage

3. **Process Improvements**
   - Update rollback procedures if needed
   - Enhance monitoring alerts
   - Improve smoke test coverage

## Emergency Procedures

### Complete System Failure

#### 1. Emergency DNS Failover
```bash
# Switch to disaster recovery site
aws route53 change-resource-record-sets \
  --hosted-zone-id $ZONE_ID \
  --change-batch file://emergency-failover.json
```

#### 2. Restore from Backup
```bash
# Restore latest backup
./infrastructure/scripts/restore-backup.sh production latest

# Verify data integrity
./infrastructure/scripts/verify-backup.sh production
```

### Data Corruption Recovery

#### 1. Isolate Affected Data
```sql
-- Create quarantine table
CREATE TABLE corrupted_data_quarantine AS 
SELECT * FROM affected_table WHERE corruption_detected = true;

-- Remove corrupted records
DELETE FROM affected_table WHERE corruption_detected = true;
```

#### 2. Restore Clean Data
```bash
# Restore specific tables from backup
./infrastructure/scripts/restore-tables.sh production affected_table --timestamp="2024-01-15T10:00:00Z"
```

## Communication Plan

### Internal Communication

#### Rollback Initiated
```
**ROLLBACK INITIATED**
Environment: Production
Reason: [Brief description]
Expected Duration: ~15 minutes
Incident Lead: [Name]
Slack Channel: #incident-response
```

#### Rollback Complete
```
**ROLLBACK COMPLETE**
Environment: Production
Status: Stable
Services Affected: [List]
Next Steps: Post-mortem scheduled for [Time]
```

### External Communication

#### Customer Notification (if needed)
```
**Service Update**
We experienced a brief service disruption affecting [features].
The issue has been resolved and all services are operational.
We apologize for any inconvenience.
```

## Rollback Decision Matrix

| Scenario | Automatic Rollback | Manual Decision | Escalation Required |
|----------|-------------------|-----------------|--------------------|
| Health check failures (3+) | Yes | No | No |
| Error rate > 10% | Yes | No | Yes (notify on-call) |
| Performance degradation > 50% | No | Yes | Yes (team lead) |
| Data integrity issues | No | Yes | Yes (CTO/VP) |
| Security vulnerability | No | Yes | Yes (Security team) |
| Customer impact > 100 users | No | Yes | Yes (Product team) |

## Testing Rollback Procedures

### Monthly Rollback Drills
```bash
# Schedule for first Monday of each month
0 10 * * 1 [ $(date +\%d) -le 7 ] && /infrastructure/scripts/rollback-drill.sh staging
```

### Rollback Time Targets
- **Detection to Decision**: < 5 minutes
- **Decision to Execution**: < 2 minutes
- **Execution to Stable**: < 10 minutes
- **Total Time**: < 17 minutes

## Appendix: Quick Reference

### Critical Commands
```bash
# Emergency rollback
./deploy.sh rollback production

# Service-specific rollback
./rollback-service.sh <service> production

# Monitor rollback
./monitor-deployment.sh production 600

# Validate rollback
./smoke-tests.sh production
```

### Key Contacts
- **On-Call Engineer**: See PagerDuty
- **Infrastructure Lead**: infrastructure@vision-to-code.com
- **Database Admin**: dba@vision-to-code.com
- **Security Team**: security@vision-to-code.com

### Useful Links
- [Monitoring Dashboard](https://monitoring.vision-to-code.com)
- [Incident Runbook](https://wiki.vision-to-code.com/incident-response)
- [Architecture Diagrams](https://wiki.vision-to-code.com/architecture)
- [Previous Post-Mortems](https://wiki.vision-to-code.com/post-mortems)