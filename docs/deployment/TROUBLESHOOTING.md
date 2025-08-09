# Claude-Zen Production Troubleshooting Guide

## 📋 Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Service Startup Issues](#service-startup-issues)
3. [Database Connection Problems](#database-connection-problems)
4. [AI Service Integration Issues](#ai-service-integration-issues)
5. [Memory and Performance Issues](#memory-and-performance-issues)
6. [Networking and Connectivity](#networking-and-connectivity)
7. [Docker Deployment Issues](#docker-deployment-issues)
8. [Kubernetes Issues](#kubernetes-issues)
9. [SSL/TLS Certificate Issues](#ssltls-certificate-issues)
10. [Backup and Recovery Issues](#backup-and-recovery-issues)
11. [Monitoring and Alerting Issues](#monitoring-and-alerting-issues)
12. [Log Analysis](#log-analysis)
13. [Common Error Messages](#common-error-messages)
14. [Emergency Procedures](#emergency-procedures)

## 🔍 Quick Diagnostics

### Health Check Commands

```bash
# Quick health check
curl -f http://localhost:3000/health

# Detailed status with JSON output
curl -s http://localhost:3000/health | jq '.'

# Check all services
curl -f http://localhost:3000/health && \
curl -f http://localhost:3456/health && \
echo "All services healthy"

# Check service status
systemctl status claude-zen        # SystemD
pm2 status                         # PM2
docker ps                          # Docker
kubectl get pods -n claude-zen     # Kubernetes
```

### Log Commands

```bash
# Recent logs
tail -f /var/log/claude-zen/claude-zen.log

# Error logs only
tail -f /var/log/claude-zen/error.log

# SystemD logs
journalctl -u claude-zen -f

# Docker logs
docker logs -f claude-zen-app

# Kubernetes logs
kubectl logs -f deployment/claude-zen -n claude-zen
```

### Resource Usage Check

```bash
# System resources
htop
free -h
df -h
netstat -tlnp

# Application specific
ps aux | grep claude-zen
lsof -i :3000
lsof -i :3456
ss -tlnp | grep -E "3000|3456"
```

## 🚀 Service Startup Issues

### Issue: Service Fails to Start

**Symptoms:**
- Service exits immediately after start
- "Connection refused" errors
- Process not visible in process list

**Common Causes & Solutions:**

#### 1. Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :3000
sudo netstat -tlnp | grep 3000

# Kill conflicting process
sudo kill -9 <PID>

# Or change port in .env
CLAUDE_MCP_PORT=3001
```

#### 2. Missing Environment Variables
```bash
# Check required environment variables
env | grep CLAUDE_
env | grep ANTHROPIC_API_KEY
env | grep DATABASE_URL

# Validate configuration
node scripts/validate-config.js

# Set missing variables
export ANTHROPIC_API_KEY="your-key-here"
```

#### 3. File Permissions
```bash
# Check file ownership
ls -la /opt/claude-zen/

# Fix permissions
sudo chown -R claude-zen:claude-zen /opt/claude-zen/
sudo chmod +x /opt/claude-zen/bin/claude-zen

# Check log directory permissions
sudo chown -R claude-zen:claude-zen /var/log/claude-zen/
sudo chmod 755 /var/log/claude-zen/
```

#### 4. Node.js Version Incompatibility
```bash
# Check Node.js version
node --version

# Should be 18.x or 20.x
# Install correct version with nvm
nvm install 20
nvm use 20

# Or update system Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 5. Missing Dependencies
```bash
# Reinstall dependencies
cd /opt/claude-zen
npm ci --production

# Clear npm cache if needed
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: Service Starts but Immediately Crashes

**Check Application Logs:**
```bash
# Recent crash logs
journalctl -u claude-zen --since "5 minutes ago"
tail -50 /var/log/claude-zen/error.log

# Memory or CPU issues
dmesg | grep -i "killed\|memory\|oom"
```

**Common Fixes:**
```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=8192"

# Reduce worker threads if low memory
WORKER_THREADS=2

# Enable graceful shutdown
NODE_ENV=production
```

## 🗄️ Database Connection Problems

### Issue: Cannot Connect to PostgreSQL

**Symptoms:**
```
Error: Connection refused to database
ECONNREFUSED 127.0.0.1:5432
```

**Diagnostics:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql
ps aux | grep postgres

# Test database connection
psql -h localhost -U claude_user -d claude_zen_production

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

**Solutions:**

#### 1. PostgreSQL Not Running
```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check if it's listening
sudo netstat -tlnp | grep 5432
```

#### 2. Authentication Issues
```bash
# Check pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Should have line like:
# local   claude_zen_production   claude_user   scram-sha-256
# host    claude_zen_production   claude_user   127.0.0.1/32   scram-sha-256

# Reload configuration
sudo systemctl reload postgresql
```

#### 3. Database/User Doesn't Exist
```sql
-- Connect as postgres user
sudo -u postgres psql

-- Check if database exists
\l

-- Check if user exists
\du

-- Create if missing
CREATE DATABASE claude_zen_production;
CREATE USER claude_user WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE claude_zen_production TO claude_user;
```

#### 4. Connection String Issues
```bash
# Check DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://username:password@host:port/database

# Test with different connection string
DATABASE_URL="postgresql://claude_user:password@localhost:5432/claude_zen_production"
```

### Issue: Redis Connection Problems

**Diagnostics:**
```bash
# Check Redis status
sudo systemctl status redis
redis-cli ping

# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log

# Test connection with password
redis-cli -a your-redis-password ping
```

**Solutions:**
```bash
# Start Redis
sudo systemctl start redis
sudo systemctl enable redis

# Check Redis configuration
sudo nano /etc/redis/redis.conf

# Verify password setting
grep "requirepass" /etc/redis/redis.conf

# Restart Redis after config changes
sudo systemctl restart redis
```

### Issue: Database Migration Failures

**Check Migration Status:**
```bash
# Check migration table
psql -h localhost -U claude_user -d claude_zen_production -c "SELECT * FROM migrations;"

# Run migrations manually
npm run migrate

# Reset migrations (CAUTION: This will drop all data)
npm run migrate:reset
```

**Common Migration Issues:**
```sql
-- Check for locks
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Kill long-running queries
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 minutes';

-- Check disk space
SELECT pg_size_pretty(pg_database_size('claude_zen_production'));
```

## 🤖 AI Service Integration Issues

### Issue: Anthropic API Connection Failures

**Symptoms:**
```
Error: Request failed with status 401
Error: Request failed with status 429
Error: Network timeout
```

**Diagnostics:**
```bash
# Test API key
curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.anthropic.com/v1/messages

# Check API key format
echo $ANTHROPIC_API_KEY | wc -c
# Should be around 108 characters

# Test with different model
ANTHROPIC_MODEL=claude-3-haiku-20240307
```

**Solutions:**

#### 1. Invalid API Key
```bash
# Verify API key is correct
# Get new key from: https://console.anthropic.com/

# Update environment
export ANTHROPIC_API_KEY="sk-ant-api03-..."
# Or update .env file
```

#### 2. Rate Limiting (429 errors)
```bash
# Reduce request frequency
ANTHROPIC_TIMEOUT=120000
AI_RETRY_ATTEMPTS=5
AI_RETRY_DELAY=2000

# Enable request queuing
AI_FAILOVER_ENABLED=true
```

#### 3. Network/Firewall Issues
```bash
# Test connectivity
curl -I https://api.anthropic.com

# Check firewall rules
sudo iptables -L
sudo ufw status

# Allow outbound HTTPS
sudo ufw allow out 443/tcp
```

### Issue: OpenAI API Failover Not Working

**Check Failover Configuration:**
```bash
# Ensure both keys are set
echo $ANTHROPIC_API_KEY
echo $OPENAI_API_KEY

# Enable failover
AI_FAILOVER_ENABLED=true
AI_HEALTH_CHECK_INTERVAL=30000

# Test OpenAI connection
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models
```

### Issue: GitHub Integration Problems

**Symptoms:**
```
Error: Bad credentials
Error: API rate limit exceeded
```

**Solutions:**
```bash
# Check GitHub token
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/user

# Generate new token with correct permissions:
# - repo (for repository access)
# - read:org (for organization access)
# - user (for user information)

# Check rate limits
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/rate_limit
```

## 💾 Memory and Performance Issues

### Issue: High Memory Usage

**Diagnostics:**
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head -10

# Node.js specific memory
node -e "console.log(process.memoryUsage())"

# Check for memory leaks
DEBUG_MEMORY_LEAKS=true
ENABLE_PROFILING=true
```

**Solutions:**

#### 1. Increase Node.js Memory Limit
```bash
# Increase heap size
NODE_OPTIONS="--max-old-space-size=8192"

# For very large deployments
NODE_OPTIONS="--max-old-space-size=16384"
```

#### 2. Optimize Cache Settings
```bash
# Reduce memory cache size
MEMORY_CACHE_SIZE_MB=256
MEMORY_CACHE_SIZE=500

# Reduce cache TTL
MEMORY_CACHE_TTL=1800000  # 30 minutes
```

#### 3. Optimize Database Connections
```bash
# Reduce connection pool size
DATABASE_POOL_MAX=10
DATABASE_POOL_MIN=2

# Reduce Redis pool
REDIS_POOL_SIZE=5
```

### Issue: High CPU Usage

**Diagnostics:**
```bash
# Monitor CPU usage
htop
top -p $(pgrep -f claude-zen)

# Check for infinite loops
strace -p <PID>
```

**Solutions:**
```bash
# Reduce worker threads
WORKER_THREADS=2

# Reduce concurrent tasks
MAX_CONCURRENT_TASKS=25

# Optimize swarm settings
SWARM_MAX_AGENTS=25
DEFAULT_SWARM_SIZE=4
```

### Issue: Slow Response Times

**Check Performance Bottlenecks:**
```bash
# Enable performance logging
CLAUDE_LOG_PERFORMANCE=true
PERFORMANCE_MONITORING=true

# Check database performance
psql -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check Redis performance
redis-cli --latency -h localhost -p 6379
```

**Optimization:**
```bash
# Enable SIMD optimizations
ENABLE_SIMD=true

# Optimize database
DATABASE_POOL_MIN=10
DATABASE_POOL_MAX=50

# Add database indexes (if missing)
psql -c "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_created_at ON documents(created_at);"
```

## 🌐 Networking and Connectivity

### Issue: Cannot Access Web Dashboard

**Symptoms:**
- Connection refused on port 3456
- Timeout errors
- 502/503 errors from reverse proxy

**Diagnostics:**
```bash
# Check if service is listening
sudo netstat -tlnp | grep 3456
sudo lsof -i :3456

# Test local connection
curl -I http://localhost:3456

# Check firewall
sudo ufw status
sudo iptables -L INPUT | grep 3456
```

**Solutions:**

#### 1. Service Not Binding Correctly
```bash
# Check binding configuration
CLAUDE_WEB_HOST=0.0.0.0  # Not localhost
CLAUDE_WEB_PORT=3456

# Restart service
sudo systemctl restart claude-zen
```

#### 2. Firewall Blocking Connections
```bash
# Open required ports
sudo ufw allow 3000/tcp  # MCP Server
sudo ufw allow 3456/tcp  # Web Dashboard
sudo ufw reload

# For iptables
sudo iptables -A INPUT -p tcp --dport 3456 -j ACCEPT
sudo iptables-save
```

#### 3. Reverse Proxy Misconfiguration
```nginx
# Check nginx configuration
sudo nginx -t

# Example working config for /etc/nginx/sites-available/claude-zen
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3456;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Restart nginx
sudo systemctl restart nginx
```

### Issue: CORS Errors

**Symptoms:**
```
Access to fetch at 'http://localhost:3000' blocked by CORS policy
```

**Solutions:**
```bash
# Update CORS configuration
CORS_ORIGIN=https://your-domain.com
CLAUDE_MCP_CORS_ORIGIN=https://your-domain.com

# For development/testing only
CORS_ORIGIN=*
CLAUDE_MCP_CORS_ORIGIN=*

# Enable credentials if needed
CORS_CREDENTIALS=true
```

### Issue: WebSocket Connection Problems

**Check WebSocket Status:**
```bash
# Test WebSocket connection
wscat -c ws://localhost:4001

# Check WebSocket logs
grep -i websocket /var/log/claude-zen/claude-zen.log

# Check configuration
WEBSOCKET_PORT=4001
ENABLE_WEBSOCKET=true
CLAUDE_WS_MAX_CONNECTIONS=1000
```

## 🐳 Docker Deployment Issues

### Issue: Container Won't Start

**Check Docker Status:**
```bash
# Check container status
docker ps -a
docker logs claude-zen-app

# Check resource limits
docker stats claude-zen-app

# Inspect container
docker inspect claude-zen-app
```

**Common Issues:**

#### 1. Environment Variables Not Set
```bash
# Check environment in container
docker exec claude-zen-app env | grep CLAUDE_

# Mount .env file correctly
docker run -v $(pwd)/.env:/app/.env claude-zen:latest

# Or use docker-compose environment section
```

#### 2. Volume Mount Issues
```bash
# Check volume mounts
docker inspect claude-zen-app | grep -A 20 "Mounts"

# Fix permissions
sudo chown -R 1000:1000 ./data ./logs

# Create required directories
mkdir -p data logs cache workspace
```

#### 3. Network Connectivity
```bash
# Check Docker network
docker network ls
docker network inspect claude-zen-network

# Test inter-container connectivity
docker exec claude-zen-app ping postgres
docker exec claude-zen-app ping redis
```

### Issue: Database Connection from Container

**Check Database Service:**
```bash
# Check if postgres container is running
docker ps | grep postgres

# Test connection from app container
docker exec claude-zen-app pg_isready -h postgres -p 5432

# Check connection string
docker exec claude-zen-app env | grep DATABASE_URL
```

**Fix Connection Issues:**
```bash
# Use service name in connection string
DATABASE_URL=postgresql://user:pass@postgres:5432/claude_zen

# Not localhost
# DATABASE_URL=postgresql://user:pass@localhost:5432/claude_zen  # Wrong!
```

### Issue: Docker Compose Service Dependencies

**Check Service Status:**
```bash
# Check all services
docker-compose -f docker-compose.production.yml ps

# Check service logs
docker-compose -f docker-compose.production.yml logs postgres
docker-compose -f docker-compose.production.yml logs redis

# Restart specific service
docker-compose -f docker-compose.production.yml restart claude-zen
```

**Fix Startup Order:**
```yaml
# In docker-compose.yml
services:
  claude-zen:
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
```

## ☸️ Kubernetes Issues

### Issue: Pods Not Starting

**Diagnostics:**
```bash
# Check pod status
kubectl get pods -n claude-zen
kubectl describe pod <pod-name> -n claude-zen

# Check events
kubectl get events -n claude-zen --sort-by='.lastTimestamp'

# Check logs
kubectl logs -f deployment/claude-zen -n claude-zen
```

**Common Issues:**

#### 1. Image Pull Errors
```bash
# Check image availability
kubectl describe pod <pod-name> -n claude-zen | grep -A 10 "Events"

# Update image pull policy
imagePullPolicy: Always  # or IfNotPresent
```

#### 2. Resource Limits
```bash
# Check resource usage
kubectl top pods -n claude-zen

# Adjust resource limits in deployment
resources:
  limits:
    memory: "8Gi"
    cpu: "4000m"
  requests:
    memory: "2Gi"
    cpu: "1000m"
```

#### 3. ConfigMap/Secret Issues
```bash
# Check ConfigMap
kubectl get configmap claude-zen-config -n claude-zen -o yaml

# Check Secret
kubectl get secret claude-zen-secrets -n claude-zen -o yaml

# Update Secret
kubectl create secret generic claude-zen-secrets \
  --from-literal=ANTHROPIC_API_KEY=your-key \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Issue: Service Not Accessible

**Check Service Configuration:**
```bash
# Check service
kubectl get svc -n claude-zen
kubectl describe svc claude-zen-service -n claude-zen

# Check endpoints
kubectl get endpoints -n claude-zen

# Test internal connectivity
kubectl run test-pod --image=busybox --rm -it --restart=Never \
  -- wget -O- http://claude-zen-service:3000/health
```

### Issue: Ingress Not Working

**Check Ingress:**
```bash
# Check ingress status
kubectl get ingress -n claude-zen
kubectl describe ingress claude-zen-ingress -n claude-zen

# Check ingress controller
kubectl get pods -n ingress-nginx

# Test SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

## 🔐 SSL/TLS Certificate Issues

### Issue: Certificate Expired or Invalid

**Check Certificate:**
```bash
# Check certificate expiration
openssl x509 -in /path/to/cert.pem -noout -dates

# Check certificate details
openssl x509 -in /path/to/cert.pem -noout -text

# Test SSL connection
openssl s_client -connect your-domain.com:443
```

**Solutions:**

#### 1. Renew Let's Encrypt Certificate
```bash
# With Certbot
sudo certbot renew

# Check renewal status
sudo certbot certificates

# Test renewal (dry run)
sudo certbot renew --dry-run
```

#### 2. Update Certificate in Application
```bash
# Update paths in nginx config
ssl_certificate /path/to/new-cert.pem;
ssl_certificate_key /path/to/new-key.pem;

# Restart nginx
sudo systemctl restart nginx
```

#### 3. Docker/Kubernetes Certificate Update
```bash
# Update Docker volume mount
-v /path/to/certs:/certs:ro

# Update Kubernetes secret
kubectl create secret tls claude-zen-tls \
  --cert=cert.pem \
  --key=key.pem \
  -n claude-zen
```

### Issue: SSL Handshake Failures

**Common Causes:**
```bash
# Check SSL configuration
curl -I https://your-domain.com
curl -k -I https://your-domain.com  # Skip certificate verification

# Check SSL protocols
nmap --script ssl-enum-ciphers -p 443 your-domain.com
```

**Fix SSL Configuration:**
```nginx
# Strong SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;

# Security headers
add_header Strict-Transport-Security "max-age=63072000" always;
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
```

## 💾 Backup and Recovery Issues

### Issue: Backup Failures

**Check Backup Status:**
```bash
# Check backup logs
tail -f /var/log/claude-zen/backup.log

# Test manual backup
./scripts/backup-database.sh

# Check backup directory permissions
ls -la /backups/
df -h /backups/  # Check disk space
```

**Common Issues:**

#### 1. Insufficient Disk Space
```bash
# Check available space
df -h

# Clean old backups
find /backups -name "*.gz" -mtime +30 -delete

# Compress existing backups
gzip /backups/*.sql
```

#### 2. Database Connection Issues
```bash
# Test pg_dump
pg_dump -U claude_user -h localhost claude_zen_production > test_backup.sql

# Check database permissions
psql -U claude_user -h localhost -c "\l"
```

#### 3. S3 Upload Failures
```bash
# Test AWS credentials
aws s3 ls s3://your-backup-bucket

# Check AWS CLI configuration
aws configure list

# Test S3 upload
echo "test" | aws s3 cp - s3://your-backup-bucket/test.txt
```

### Issue: Recovery Failures

**Database Recovery:**
```bash
# Stop application first
sudo systemctl stop claude-zen

# Create database backup before recovery
pg_dump -U claude_user claude_zen_production > pre_recovery_backup.sql

# Restore from backup
dropdb claude_zen_production
createdb claude_zen_production
gunzip -c backup.sql.gz | psql -U claude_user claude_zen_production

# Start application
sudo systemctl start claude-zen
```

**File Recovery:**
```bash
# Stop application
sudo systemctl stop claude-zen

# Restore data directory
rm -rf /opt/claude-zen/data
tar -xzf data_backup.tar.gz -C /opt/claude-zen/

# Fix permissions
sudo chown -R claude-zen:claude-zen /opt/claude-zen/data

# Start application
sudo systemctl start claude-zen
```

## 📊 Monitoring and Alerting Issues

### Issue: Metrics Not Collected

**Check Metrics Endpoint:**
```bash
# Test metrics endpoint
curl http://localhost:9090/metrics

# Check Prometheus configuration
sudo systemctl status prometheus
tail -f /var/log/prometheus/prometheus.log
```

**Fix Prometheus Issues:**
```yaml
# Check prometheus.yml configuration
scrape_configs:
  - job_name: 'claude-zen'
    static_configs:
      - targets: ['localhost:9090']
    scrape_interval: 30s
    metrics_path: '/metrics'
```

### Issue: Grafana Dashboard Not Working

**Check Grafana:**
```bash
# Check Grafana status
sudo systemctl status grafana-server
curl -I http://localhost:3001

# Check Grafana logs
sudo tail -f /var/log/grafana/grafana.log

# Reset Grafana admin password
sudo grafana-cli admin reset-admin-password newpassword
```

### Issue: Alerts Not Firing

**Check Alert Configuration:**
```bash
# Check alert rules
curl http://localhost:9090/api/v1/rules

# Check alertmanager
systemctl status alertmanager
curl http://localhost:9093/api/v1/status
```

## 📝 Log Analysis

### Analyzing Application Logs

**Common Log Patterns:**
```bash
# Error analysis
grep -i error /var/log/claude-zen/claude-zen.log | tail -20

# Performance issues
grep -i "slow\|timeout\|memory" /var/log/claude-zen/claude-zen.log

# API errors
grep "status: [4-5][0-9][0-9]" /var/log/claude-zen/access.log

# Memory issues
grep -i "heap\|memory\|gc" /var/log/claude-zen/claude-zen.log
```

**Log Parsing Scripts:**
```bash
# Top error messages
grep -i error /var/log/claude-zen/claude-zen.log | \
  cut -d' ' -f4- | sort | uniq -c | sort -nr | head -10

# Response time analysis
awk '/response_time/ {sum+=$NF; count++} END {print "Avg response time:", sum/count}' \
  /var/log/claude-zen/access.log
```

### System Log Analysis

```bash
# Check system errors
dmesg | grep -i error
journalctl --priority=err --since="1 hour ago"

# Check for OOM kills
dmesg | grep -i "killed process"
grep -i "out of memory" /var/log/syslog

# Network issues
grep -i "network\|connection" /var/log/syslog
```

## ⚠️ Common Error Messages

### Database Errors

**Error: `connection terminated unexpectedly`**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection limits
psql -c "SHOW max_connections;"
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Increase connection limit if needed
# Edit /etc/postgresql/14/main/postgresql.conf
max_connections = 200
```

**Error: `database "claude_zen_production" does not exist`**
```sql
-- Create database
sudo -u postgres createdb claude_zen_production

-- Or via SQL
sudo -u postgres psql -c "CREATE DATABASE claude_zen_production;"
```

### Authentication Errors

**Error: `Invalid API key`**
```bash
# Check API key format
echo $ANTHROPIC_API_KEY | wc -c  # Should be ~108 characters
echo $ANTHROPIC_API_KEY | head -c 20  # Should start with "sk-ant-api03-"

# Test API key
curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
     https://api.anthropic.com/v1/messages
```

**Error: `JWT token invalid`**
```bash
# Check JWT secret
echo $JWT_SECRET | wc -c  # Should be at least 32 characters

# Regenerate JWT secret
JWT_SECRET=$(openssl rand -base64 48)
```

### Memory Errors

**Error: `JavaScript heap out of memory`**
```bash
# Increase heap size
NODE_OPTIONS="--max-old-space-size=8192"

# Check current memory usage
node -e "console.log(process.memoryUsage())"

# Add to service file or environment
```

**Error: `ENOMEM: not enough memory`**
```bash
# Check available memory
free -h

# Add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Network Errors

**Error: `ECONNREFUSED`**
```bash
# Check if service is running
sudo netstat -tlnp | grep <port>

# Check firewall
sudo ufw status

# Test local connection
telnet localhost <port>
```

**Error: `ETIMEDOUT`**
```bash
# Check DNS resolution
nslookup api.anthropic.com
dig api.anthropic.com

# Check network connectivity
ping -c 4 api.anthropic.com
traceroute api.anthropic.com

# Check proxy settings
echo $HTTP_PROXY
echo $HTTPS_PROXY
```

## 🚨 Emergency Procedures

### Service Recovery

**Quick Service Restart:**
```bash
# SystemD
sudo systemctl restart claude-zen

# Docker
docker-compose -f docker-compose.production.yml restart claude-zen

# Kubernetes
kubectl rollout restart deployment/claude-zen -n claude-zen

# PM2
pm2 restart claude-zen
```

**Emergency Shutdown:**
```bash
# Graceful shutdown
sudo systemctl stop claude-zen

# Force kill if needed
sudo pkill -f claude-zen
sudo kill -9 $(pgrep -f claude-zen)

# Stop all Docker containers
docker-compose -f docker-compose.production.yml down
```

### Database Emergency Procedures

**Database Connection Pool Exhaustion:**
```sql
-- Check active connections
SELECT count(*), state FROM pg_stat_activity GROUP BY state;

-- Kill idle connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE state = 'idle' AND state_change < now() - interval '1 hour';

-- Kill all application connections (CAUTION!)
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE usename = 'claude_user';
```

**Database Corruption Recovery:**
```bash
# Stop application
sudo systemctl stop claude-zen

# Check database integrity
sudo -u postgres pg_dump claude_zen_production > /dev/null

# If corrupt, restore from backup
sudo -u postgres dropdb claude_zen_production
sudo -u postgres createdb claude_zen_production
sudo -u postgres psql claude_zen_production < latest_backup.sql
```

### Disk Space Emergency

**Free Up Space Immediately:**
```bash
# Clean logs
sudo truncate -s 0 /var/log/claude-zen/*.log
sudo journalctl --vacuum-time=1d

# Clean temp files
sudo rm -rf /tmp/claude-zen/*
sudo rm -rf /var/cache/claude-zen/*

# Clean old backups
find /backups -name "*.gz" -mtime +7 -delete

# Clean npm cache
npm cache clean --force
```

### Security Incident Response

**Suspected Compromise:**
```bash
# Immediately stop service
sudo systemctl stop claude-zen

# Check for suspicious processes
ps aux | grep -E "(bitcoin|mining|crypto)"

# Check network connections
sudo netstat -tulpn | grep ESTABLISHED

# Check recent logins
last -n 20
who

# Change all secrets
# 1. Generate new JWT secret
# 2. Rotate API keys
# 3. Change database passwords
# 4. Update SSL certificates
```

**Rate Limiting Emergency:**
```bash
# Implement immediate rate limiting
# Add to nginx config:
limit_req_zone $binary_remote_addr zone=api:10m rate=1r/s;
limit_req zone=api burst=5 nodelay;

# Or use iptables
sudo iptables -A INPUT -p tcp --dport 3000 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT
```

## 📞 Getting Help

### Collecting Diagnostic Information

**System Information:**
```bash
#!/bin/bash
# diagnostic-info.sh
echo "=== System Information ===" > diagnostic.txt
uname -a >> diagnostic.txt
lsb_release -a >> diagnostic.txt
date >> diagnostic.txt
echo "" >> diagnostic.txt

echo "=== Resource Usage ===" >> diagnostic.txt
free -h >> diagnostic.txt
df -h >> diagnostic.txt
ps aux | grep claude-zen >> diagnostic.txt
echo "" >> diagnostic.txt

echo "=== Service Status ===" >> diagnostic.txt
systemctl status claude-zen >> diagnostic.txt
echo "" >> diagnostic.txt

echo "=== Recent Logs ===" >> diagnostic.txt
tail -100 /var/log/claude-zen/claude-zen.log >> diagnostic.txt
journalctl -u claude-zen --since "1 hour ago" >> diagnostic.txt
echo "" >> diagnostic.txt

echo "=== Configuration ===" >> diagnostic.txt
env | grep -E "CLAUDE_|NODE_|DATABASE_|REDIS_" | sort >> diagnostic.txt
echo "" >> diagnostic.txt

echo "=== Network Configuration ===" >> diagnostic.txt
sudo netstat -tlnp | grep -E "3000|3456|4000|5432|6379" >> diagnostic.txt

echo "Diagnostic information saved to diagnostic.txt"
```

### Support Resources

- **GitHub Issues**: [https://github.com/mikkihugo/claude-code-zen/issues](https://github.com/mikkihugo/claude-code-zen/issues)
- **Documentation**: [https://github.com/mikkihugo/claude-code-zen/wiki](https://github.com/mikkihugo/claude-code-zen/wiki)
- **Community Discussions**: [https://github.com/mikkihugo/claude-code-zen/discussions](https://github.com/mikkihugo/claude-code-zen/discussions)

### Creating a Support Request

When creating a support request, include:

1. **Environment Details:**
   - Operating System and version
   - Node.js version
   - Deployment method (Docker, Kubernetes, SystemD)
   - Claude-Zen version

2. **Problem Description:**
   - What you were trying to do
   - What happened instead
   - Error messages (full text)
   - When the problem started

3. **Diagnostic Information:**
   - Recent logs (sanitized)
   - Configuration (with secrets removed)
   - System resource usage
   - Network configuration

4. **Steps to Reproduce:**
   - Step-by-step instructions
   - Expected vs actual results
   - Frequency (always, sometimes, once)

5. **Attempted Solutions:**
   - What troubleshooting steps you've tried
   - Results of each attempt
   - Any temporary workarounds

Remember to remove sensitive information (API keys, passwords, personal data) before sharing diagnostic information.