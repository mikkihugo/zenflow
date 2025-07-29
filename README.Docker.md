# Claude Flow Docker Deployment Guide

This guide covers deploying Claude Flow using Docker for production environments.

## Quick Start

### 1. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/yourusername/claude-flow.git
cd claude-flow

# Copy environment configuration
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 2. Build Images

```bash
# Build production images
./scripts/docker-build.sh

# Or build with all variants
BUILD_DEV=true BUILD_TEST=true ./scripts/docker-build.sh
```

### 3. Start Services

```bash
# Start core services
docker-compose up -d

# Start with production optimizations
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Start with all features (monitoring, backup, etc.)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile enterprise up -d
```

## Architecture

### Core Services

1. **API Server** (`api-server`)
   - Main Claude Flow application
   - Handles all API requests
   - WebSocket support for real-time features
   - Ports: 4000 (API), 4001 (WebSocket)

2. **MCP Server** (`mcp-server`)
   - Model Context Protocol server for Claude integration
   - Provides all swarm coordination tools
   - Port: 3000

3. **Databases**
   - SQLite: Primary persistence and hive coordination
   - LanceDB: Vector embeddings and semantic search
   - Kuzu: Graph database for relationships
   - PostgreSQL: Optional enterprise backend with pgvector

### Optional Services

4. **Redis** - Caching and pub/sub
5. **Nginx** - Reverse proxy and load balancer
6. **Prometheus** - Metrics collection
7. **Grafana** - Metrics visualization
8. **Loki/Promtail** - Log aggregation
9. **Backup Service** - Automated backups to S3

## Deployment Profiles

### Basic Deployment
```bash
docker-compose up -d
```
Includes: API Server, MCP Server

### Production Deployment
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```
Adds: Nginx, PostgreSQL, Redis, enhanced resource limits

### Enterprise Deployment
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile enterprise up -d
```
Adds: Full monitoring stack, backup service, log aggregation

### Development Environment
```bash
docker-compose --profile development up -d
```
Includes: Hot reload, debugging ports, development tools

## Configuration

### Essential Environment Variables

```bash
# API Keys (Required)
CLAUDE_API_KEY=your-claude-api-key

# Security (Change these!)
JWT_SECRET=long-random-string-here
ENCRYPTION_KEY=32-character-encryption-key-here

# Database URLs (Optional)
POSTGRES_URL=postgresql://user:pass@postgres:5432/dbname
REDIS_URL=redis://:password@redis:6379

# Performance Tuning
MAX_AGENTS=100
MAX_HIVES=10
ENABLE_GPU=false
```

### Volume Mounts

Production deployments should use persistent volumes:

```yaml
volumes:
  claude-flow-data:      # Application data
  claude-flow-logs:      # Log files
  claude-flow-memory:    # Persistent memory
  claude-flow-databases: # All databases
```

## Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# View health endpoint
curl http://localhost:4000/health

# MCP server health
curl http://localhost:3000/health
```

## Scaling

### Horizontal Scaling

```bash
# Scale API servers
docker-compose up -d --scale api-server=3

# Scale MCP servers
docker-compose up -d --scale mcp-server=2
```

### Resource Limits

Adjust in `docker-compose.prod.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 8G
    reservations:
      cpus: '2'
      memory: 4G
```

## Monitoring

### Prometheus Metrics
- Available at: http://localhost:9090
- Scrapes metrics from all services
- 90-day retention by default

### Grafana Dashboards
- Available at: http://localhost:3001
- Pre-configured dashboards for:
  - System metrics
  - API performance
  - Swarm coordination
  - Database performance

### Log Aggregation
- Loki collects logs from all containers
- View in Grafana under "Explore"
- Query using LogQL

## Backup and Recovery

### Automated Backups
```bash
# Enable backup service
docker-compose --profile backup up -d

# Configure in .env:
BACKUP_SCHEDULE=0 2 * * *  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### Manual Backup
```bash
# Backup all data
docker exec claude-flow-backup /scripts/backup.sh

# Restore from backup
docker exec claude-flow-backup /scripts/restore.sh backup-2024-01-15.tar.gz
```

## Security Considerations

1. **Use HTTPS in Production**
   - Configure SSL certificates in nginx
   - Use Let's Encrypt for free certificates

2. **Secure Environment Variables**
   - Never commit `.env` files
   - Use Docker secrets for sensitive data
   - Rotate API keys regularly

3. **Network Isolation**
   - Use Docker networks to isolate services
   - Only expose necessary ports
   - Use firewall rules

4. **Regular Updates**
   - Keep base images updated
   - Monitor for security vulnerabilities
   - Use image scanning tools

## Troubleshooting

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-server

# Last 100 lines
docker-compose logs --tail=100 api-server
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=claude-flow:* docker-compose up

# Connect to running container
docker exec -it claude-flow-api /bin/bash

# Run health checks
docker exec claude-flow-api node scripts/health-check.js
```

### Common Issues

1. **Port conflicts**
   - Change ports in `.env` file
   - Check with `netstat -tulpn`

2. **Memory issues**
   - Increase Docker memory limit
   - Adjust NODE_OPTIONS in environment

3. **Database connection errors**
   - Ensure volumes have correct permissions
   - Check database service logs

4. **Build failures**
   - Clear Docker cache: `docker system prune`
   - Rebuild without cache: `docker-compose build --no-cache`

## Production Checklist

- [ ] Configure all required environment variables
- [ ] Set strong passwords and secrets
- [ ] Enable HTTPS with valid certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Enable automated backups
- [ ] Test restore procedures
- [ ] Document deployment specifics
- [ ] Set up log rotation
- [ ] Configure resource limits
- [ ] Enable health checks
- [ ] Plan for scaling

## Support

For issues or questions:
- Check logs first: `docker-compose logs`
- Review health endpoints
- Consult the main documentation
- Open an issue on GitHub

## License

See LICENSE file in the repository root.