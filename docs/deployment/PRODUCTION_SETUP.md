# Claude-Zen Production Deployment Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Methods](#deployment-methods)
5. [Security Hardening](#security-hardening)
6. [Monitoring & Logging](#monitoring--logging)
7. [Backup & Recovery](#backup--recovery)
8. [Performance Optimization](#performance-optimization)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

## 🚀 Overview

Claude-Zen is a production-ready AI-powered development environment that supports multiple deployment strategies. This guide covers everything needed for a secure, scalable, and maintainable production deployment.

### Architecture Components

- **HTTP MCP Server** (Port 3000) - Claude Desktop integration
- **Web Dashboard** (Port 3456) - Browser-based interface
- **API Server** (Port 4000) - REST API endpoints
- **WebSocket Server** (Port 4001) - Real-time updates
- **PostgreSQL Database** - Primary data storage
- **Redis Cache** - Session storage and caching
- **Vector Database** - AI embeddings and search

## 🔧 Prerequisites

### System Requirements

**Minimum Hardware:**
- CPU: 4 cores, 2.4GHz
- RAM: 8GB
- Storage: 50GB SSD
- Network: 100Mbps

**Recommended Hardware:**
- CPU: 8 cores, 3.0GHz
- RAM: 16GB
- Storage: 200GB NVMe SSD
- Network: 1Gbps

### Software Requirements

- **Operating System**: Ubuntu 22.04 LTS, CentOS 8, or Docker-compatible OS
- **Node.js**: Version 18.x or 20.x
- **PostgreSQL**: Version 14+ with pgvector extension
- **Redis**: Version 7.x
- **Nginx** (optional): For reverse proxy and SSL termination

### Network Requirements

- **Inbound Ports**: 80, 443, 3000, 3456
- **Outbound Ports**: 443 (API calls), 22 (SSH), 5432 (PostgreSQL), 6379 (Redis)
- **Domain**: SSL certificate for production domain

## ⚙️ Environment Configuration

### 1. Choose Environment Template

Claude-Zen provides several environment templates:

```bash
# Production (recommended)
cp .env.example .env
# or
cp .env.production .env

# Docker deployment
cp .env.docker .env

# Development (local testing)
cp .env.development .env
```

### 2. Configure Core Settings

Edit your `.env` file with production values:

```bash
# Core Configuration
NODE_ENV=production
APP_NAME=claude-zen
CLAUDE_INSTANCE_ID=prod-server-01

# Network Configuration
CLAUDE_MCP_HOST=0.0.0.0
CLAUDE_MCP_PORT=3000
CLAUDE_WEB_HOST=0.0.0.0
CLAUDE_WEB_PORT=3456
```

### 3. Database Configuration

**PostgreSQL Setup:**

```bash
# Install PostgreSQL with pgvector
sudo apt update
sudo apt install postgresql postgresql-contrib postgresql-14-pgvector

# Create database and user
sudo -u postgres psql
CREATE DATABASE claude_zen_production;
CREATE USER claude_user WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE claude_zen_production TO claude_user;
\q

# Configure in .env
DATABASE_URL=postgresql://claude_user:your-secure-password@localhost:5432/claude_zen_production
```

**Redis Setup:**

```bash
# Install Redis
sudo apt install redis-server

# Configure authentication
sudo nano /etc/redis/redis.conf
# Uncomment and set: requirepass your-redis-password

sudo systemctl restart redis-server

# Configure in .env
REDIS_URL=redis://:your-redis-password@localhost:6379/0
```

### 4. API Keys Configuration

```bash
# AI Services (REQUIRED)
ANTHROPIC_API_KEY=your-production-anthropic-key
OPENAI_API_KEY=your-production-openai-key

# GitHub Integration (optional but recommended)
GITHUB_TOKEN=your-github-personal-access-token

# Security Tokens (GENERATE STRONG VALUES)
JWT_SECRET=your-super-strong-jwt-secret-minimum-64-characters
ENCRYPTION_KEY=your-32-character-encryption-key
SESSION_SECRET=your-strong-session-secret
```

**Generate Secure Secrets:**

```bash
# Generate JWT secret (64 characters)
openssl rand -base64 48

# Generate encryption key (32 characters)
openssl rand -base64 24

# Generate session secret
openssl rand -base64 32
```

### 5. Security Configuration

```bash
# HTTPS Enforcement
FORCE_HTTPS=true
HSTS_MAX_AGE=31536000

# CORS Configuration
CORS_ORIGIN=https://your-production-domain.com
CLAUDE_MCP_CORS_ORIGIN=https://your-production-domain.com

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=60
RATE_LIMIT_WINDOW=60000
```

## 🚢 Deployment Methods

### Method 1: Docker Compose (Recommended)

**Prerequisites:**
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo pip3 install docker-compose

# Create docker group
sudo usermod -aG docker $USER
```

**Deployment:**

```bash
# Clone repository
git clone https://github.com/mikkihugo/claude-code-zen.git
cd claude-code-zen

# Configure environment
cp .env.docker .env
# Edit .env with your production values

# Create required directories
mkdir -p data logs cache workspace backups
mkdir -p database/data redis/data

# Start services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps
```

**SSL Certificate Setup:**

```bash
# Using Let's Encrypt with Traefik
mkdir -p certs
# Traefik will automatically obtain certificates
# Or manually place certificates:
# cp your-cert.pem certs/
# cp your-key.pem certs/
```

### Method 2: Kubernetes Deployment

**Prerequisites:**
```bash
# Ensure kubectl is configured
kubectl cluster-info

# Install Helm (optional, for easier management)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

**Deployment:**

```bash
# Apply configurations
kubectl apply -f kubernetes/

# Check deployment status
kubectl get pods -n claude-zen
kubectl get services -n claude-zen
kubectl get ingress -n claude-zen

# Scale deployment
kubectl scale deployment claude-zen --replicas=5 -n claude-zen
```

**Configure Ingress:**

```bash
# Update kubernetes/claude-zen-config.yaml
# Replace your-domain.com with your actual domain
sed -i 's/your-domain.com/yourdomain.com/g' kubernetes/claude-zen-config.yaml

# Apply changes
kubectl apply -f kubernetes/claude-zen-config.yaml
```

### Method 3: SystemD Service (Linux Servers)

**Prerequisites:**
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2
```

**Deployment:**

```bash
# Create application user
sudo useradd --system --shell /bin/false --home /opt/claude-zen claude-zen

# Install application
sudo mkdir -p /opt/claude-zen
sudo git clone https://github.com/mikkihugo/claude-code-zen.git /opt/claude-zen
cd /opt/claude-zen

# Install dependencies
sudo npm ci --production

# Configure environment
sudo cp .env.production .env
# Edit .env with production values

# Set permissions
sudo chown -R claude-zen:claude-zen /opt/claude-zen
sudo chmod -R 755 /opt/claude-zen

# Create log directory
sudo mkdir -p /var/log/claude-zen
sudo chown claude-zen:claude-zen /var/log/claude-zen

# Install SystemD service
sudo cp systemd/claude-zen.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable claude-zen
sudo systemctl start claude-zen

# Check status
sudo systemctl status claude-zen
```

### Method 4: PM2 Process Manager

```bash
# Install globally
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'claude-zen',
    script: './bin/claude-zen',
    args: 'start --production',
    instances: 4,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/claude-zen-error.log',
    out_file: './logs/claude-zen-out.log',
    log_file: './logs/claude-zen-combined.log',
    time: true
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔒 Security Hardening

### 1. Firewall Configuration

```bash
# Ubuntu/Debian (UFW)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # MCP Server
sudo ufw allow 3456/tcp  # Web Dashboard

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=3456/tcp
sudo firewall-cmd --reload
```

### 2. SSL/TLS Configuration

**Using Nginx Reverse Proxy:**

```nginx
# /etc/nginx/sites-available/claude-zen
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.pem;
    ssl_certificate_key /path/to/your/private-key.pem;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    # MCP Server proxy
    location /mcp/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Web Dashboard proxy
    location / {
        proxy_pass http://localhost:3456/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. Database Security

```bash
# PostgreSQL security
sudo nano /etc/postgresql/14/main/postgresql.conf
# Set: listen_addresses = 'localhost'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Change authentication method to scram-sha-256

# Redis security
sudo nano /etc/redis/redis.conf
# Set: bind 127.0.0.1
# Set: requirepass your-strong-password
# Set: rename-command CONFIG ""
```

### 4. Application Security

```bash
# Create dedicated user for application
sudo useradd --system --shell /bin/false claude-zen

# Set proper file permissions
sudo chown -R claude-zen:claude-zen /opt/claude-zen
sudo chmod -R 750 /opt/claude-zen
sudo chmod -R 600 /opt/claude-zen/.env

# Secure log files
sudo chown -R claude-zen:claude-zen /var/log/claude-zen
sudo chmod -R 640 /var/log/claude-zen
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

**Health Check Endpoint:**
```bash
# Check application health
curl -f http://localhost:3000/health

# Health check response format:
{
  "status": "healthy",
  "timestamp": "2024-01-20T12:00:00.000Z",
  "uptime": 3600,
  "version": "2.0.0",
  "components": {
    "database": "healthy",
    "redis": "healthy",
    "ai_services": "healthy"
  }
}
```

**Metrics Endpoint:**
```bash
# Prometheus metrics
curl http://localhost:9090/metrics
```

### 2. Log Management

**Log Rotation with Logrotate:**

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/claude-zen

/var/log/claude-zen/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        systemctl reload claude-zen
    endscript
}
```

**Centralized Logging:**

```bash
# Install and configure rsyslog for centralized logging
sudo apt install rsyslog

# Configure rsyslog to forward claude-zen logs
echo "if $programname == 'claude-zen' then @@logserver:514" | sudo tee -a /etc/rsyslog.conf
sudo systemctl restart rsyslog
```

### 3. Monitoring Stack Setup

**Prometheus Configuration:**

```yaml
# monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'claude-zen'
    static_configs:
      - targets: ['localhost:9090']
    scrape_interval: 30s
    metrics_path: '/metrics'
```

**Grafana Dashboard:**

```bash
# Import pre-built dashboard
curl -X POST http://admin:admin@localhost:3001/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @monitoring/grafana/dashboards/claude-zen-dashboard.json
```

## 💾 Backup & Recovery

### 1. Database Backup

**Automated Backup Script:**

```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="/backups/database"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="claude_zen_production"

mkdir -p $BACKUP_DIR

# Create PostgreSQL backup
pg_dump -U claude_user -h localhost $DB_NAME | gzip > $BACKUP_DIR/postgres_${TIMESTAMP}.sql.gz

# Create Redis backup
redis-cli --rdb $BACKUP_DIR/redis_${TIMESTAMP}.rdb

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -type f -mtime +30 -delete
find $BACKUP_DIR -name "*.rdb" -type f -mtime +30 -delete
```

**Schedule with Cron:**

```bash
# Add to crontab
crontab -e

# Backup every 6 hours
0 */6 * * * /opt/claude-zen/scripts/backup-database.sh

# Weekly full system backup
0 2 * * 0 /opt/claude-zen/scripts/backup-full.sh
```

### 2. Application Data Backup

```bash
#!/bin/bash
# scripts/backup-full.sh

BACKUP_BASE="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
APP_DIR="/opt/claude-zen"

# Create backup directory
mkdir -p $BACKUP_BASE/full/$TIMESTAMP

# Backup application data
tar -czf $BACKUP_BASE/full/$TIMESTAMP/app-data.tar.gz $APP_DIR/data
tar -czf $BACKUP_BASE/full/$TIMESTAMP/workspace.tar.gz $APP_DIR/workspace
tar -czf $BACKUP_BASE/full/$TIMESTAMP/config.tar.gz $APP_DIR/config

# Backup logs
tar -czf $BACKUP_BASE/full/$TIMESTAMP/logs.tar.gz /var/log/claude-zen

# Sync to cloud storage (AWS S3)
aws s3 sync $BACKUP_BASE/full/$TIMESTAMP/ s3://your-backup-bucket/claude-zen/$TIMESTAMP/
```

### 3. Recovery Procedures

**Database Recovery:**

```bash
# Stop application
sudo systemctl stop claude-zen

# Restore PostgreSQL
gunzip -c /backups/database/postgres_20240120_120000.sql.gz | \
  psql -U claude_user -h localhost claude_zen_production

# Restore Redis
sudo systemctl stop redis
cp /backups/database/redis_20240120_120000.rdb /var/lib/redis/dump.rdb
sudo chown redis:redis /var/lib/redis/dump.rdb
sudo systemctl start redis

# Start application
sudo systemctl start claude-zen
```

**Full System Recovery:**

```bash
# Restore application data
cd /opt/claude-zen
sudo tar -xzf /backups/full/20240120_120000/app-data.tar.gz
sudo tar -xzf /backups/full/20240120_120000/workspace.tar.gz
sudo tar -xzf /backups/full/20240120_120000/config.tar.gz

# Set permissions
sudo chown -R claude-zen:claude-zen /opt/claude-zen

# Restart services
sudo systemctl restart claude-zen
```

## ⚡ Performance Optimization

### 1. Application Performance

**Node.js Optimization:**

```bash
# .env optimizations
NODE_OPTIONS="--max-old-space-size=8192 --optimize-for-size"
WORKER_THREADS=8
UV_THREADPOOL_SIZE=16

# Enable performance features
ENABLE_SIMD=true
ENABLE_VECTOR_SEARCH=true
PERFORMANCE_MONITORING=true
```

**Memory Management:**

```bash
# Redis memory optimization
redis-cli CONFIG SET maxmemory 2gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# PostgreSQL optimization
# Edit /etc/postgresql/14/main/postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

### 2. Database Performance

**PostgreSQL Tuning:**

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_documents_created_at ON documents(created_at);
CREATE INDEX CONCURRENTLY idx_embeddings_similarity ON embeddings USING ivfflat (embedding vector_cosine_ops);

-- Update statistics
ANALYZE;

-- Enable query optimization
SET enable_seqscan = off;
```

**Connection Pooling:**

```bash
# Install pgbouncer
sudo apt install pgbouncer

# Configure connection pooling
DATABASE_URL=postgresql://claude_user:password@localhost:6432/claude_zen_production
DATABASE_POOL_MIN=10
DATABASE_POOL_MAX=100
```

### 3. Load Balancing

**Nginx Load Balancer:**

```nginx
upstream claude_zen_backend {
    server localhost:3000 weight=1 max_fails=3 fail_timeout=30s;
    server localhost:3001 weight=1 max_fails=3 fail_timeout=30s;
    server localhost:3002 weight=1 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    location / {
        proxy_pass http://claude_zen_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Health check
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
    }
}
```

## 🔧 Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed troubleshooting guide.

## 🔄 Maintenance

### Regular Maintenance Tasks

**Daily:**
- Check service status
- Monitor disk space
- Review error logs
- Verify backups completed

**Weekly:**
- Update system packages
- Clean up temporary files
- Rotate logs
- Review performance metrics

**Monthly:**
- Security updates
- Database optimization
- Backup testing
- Capacity planning review

**Quarterly:**
- Full security audit
- Disaster recovery testing
- Performance benchmarking
- Dependencies update

### Maintenance Scripts

```bash
# Daily maintenance
0 6 * * * /opt/claude-zen/scripts/daily-maintenance.sh

# Weekly maintenance
0 3 * * 1 /opt/claude-zen/scripts/weekly-maintenance.sh

# Monthly maintenance
0 2 1 * * /opt/claude-zen/scripts/monthly-maintenance.sh
```

## 📞 Support

For production support and questions:

- **Documentation**: [https://github.com/mikkihugo/claude-code-zen/wiki](https://github.com/mikkihugo/claude-code-zen/wiki)
- **Issues**: [https://github.com/mikkihugo/claude-code-zen/issues](https://github.com/mikkihugo/claude-code-zen/issues)
- **Discussions**: [https://github.com/mikkihugo/claude-code-zen/discussions](https://github.com/mikkihugo/claude-code-zen/discussions)

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.