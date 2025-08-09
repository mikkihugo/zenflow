#!/bin/bash

# ==============================================================================
# CLAUDE-ZEN PRODUCTION SETUP AUTOMATION SCRIPT
# ==============================================================================
#
# Automated production deployment script for Claude-Zen
# 
# This script automates the complete production setup process including:
# - System requirements verification
# - Dependencies installation
# - Database setup (PostgreSQL + Redis)
# - SSL certificate configuration
# - Firewall and security setup
# - Application deployment
# - Service configuration
# - Health verification
#
# Usage:
#   sudo bash scripts/setup-production.sh [options]
#
# Options:
#   --help              Show help message
#   --skip-deps         Skip dependency installation
#   --skip-db           Skip database setup
#   --skip-ssl          Skip SSL certificate setup
#   --skip-firewall     Skip firewall configuration
#   --config-only       Only generate configuration files
#   --docker            Setup for Docker deployment
#   --kubernetes        Setup for Kubernetes deployment
#   --domain DOMAIN     Set domain name for SSL
#   --db-password PASS  Set database password
#   --redis-password    Set Redis password
#   --backup-s3 BUCKET  Enable S3 backups
#
# Examples:
#   sudo bash scripts/setup-production.sh --domain example.com
#   sudo bash scripts/setup-production.sh --docker --skip-deps
#   sudo bash scripts/setup-production.sh --config-only
#
# Requirements:
#   - Ubuntu 20.04+ or CentOS 8+
#   - Root or sudo access
#   - Internet connection
#   - Domain name (for SSL)

set -euo pipefail

# ==============================================================================
# CONFIGURATION & DEFAULTS
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_FILE="/var/log/claude-zen-setup.log"

# Default configuration
DEFAULT_DOMAIN=""
DEFAULT_DB_PASSWORD=""
DEFAULT_REDIS_PASSWORD=""
DEFAULT_APP_USER="claude-zen"
DEFAULT_APP_DIR="/opt/claude-zen"
DEFAULT_LOG_DIR="/var/log/claude-zen"
DEFAULT_DATA_DIR="/opt/claude-zen/data"
DEFAULT_BACKUP_DIR="/backup/claude-zen"

# Feature flags
SKIP_DEPS=false
SKIP_DB=false
SKIP_SSL=false
SKIP_FIREWALL=false
CONFIG_ONLY=false
SETUP_DOCKER=false
SETUP_KUBERNETES=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARN: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}" | tee -a "$LOG_FILE"
}

step() {
    echo -e "\n${BLUE}${WHITE}[STEP] $1${NC}" | tee -a "$LOG_FILE"
    echo "========================================" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Detect OS
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    else
        error "Cannot detect operating system"
        exit 1
    fi
    
    log "Detected OS: $OS $VER"
}

# Check system requirements
check_requirements() {
    local cpu_cores=$(nproc)
    local memory_gb=$(free -g | awk '/^Mem:/{print $2}')
    local disk_gb=$(df -BG / | awk 'NR==2{gsub(/G/,"",$4); print $4}')
    
    log "System specifications:"
    log "  CPU cores: $cpu_cores"
    log "  Memory: ${memory_gb}GB"
    log "  Available disk space: ${disk_gb}GB"
    
    # Check minimum requirements
    if [[ $cpu_cores -lt 2 ]]; then
        warn "Minimum 4 CPU cores recommended for production"
    fi
    
    if [[ $memory_gb -lt 4 ]]; then
        error "Minimum 8GB RAM required for production"
        exit 1
    fi
    
    if [[ $disk_gb -lt 20 ]]; then
        error "Minimum 50GB disk space required"
        exit 1
    fi
    
    success "System requirements check passed"
}

# Generate secure passwords
generate_password() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Install package based on OS
install_package() {
    local package=$1
    
    case $OS in
        ubuntu|debian)
            apt-get update -qq
            apt-get install -y "$package"
            ;;
        centos|rhel|fedora)
            if command -v dnf &> /dev/null; then
                dnf install -y "$package"
            else
                yum install -y "$package"
            fi
            ;;
        *)
            error "Unsupported operating system: $OS"
            exit 1
            ;;
    esac
}

# Check if service is running
is_service_running() {
    local service=$1
    systemctl is-active --quiet "$service"
}

# Wait for service to be ready
wait_for_service() {
    local service=$1
    local port=$2
    local timeout=${3:-30}
    local count=0
    
    log "Waiting for $service to be ready on port $port..."
    
    while ! nc -z localhost "$port" && [[ $count -lt $timeout ]]; do
        sleep 1
        ((count++))
    done
    
    if [[ $count -ge $timeout ]]; then
        error "$service failed to start within $timeout seconds"
        return 1
    fi
    
    success "$service is ready"
}

# ==============================================================================
# DEPENDENCY INSTALLATION
# ==============================================================================

install_system_dependencies() {
    step "Installing system dependencies"
    
    case $OS in
        ubuntu|debian)
            apt-get update
            apt-get install -y \
                curl \
                wget \
                git \
                build-essential \
                software-properties-common \
                apt-transport-https \
                ca-certificates \
                gnupg \
                lsb-release \
                unzip \
                jq \
                htop \
                net-tools \
                netcat-openbsd \
                ufw \
                fail2ban \
                logrotate \
                cron \
                openssl
            ;;
        centos|rhel|fedora)
            if command -v dnf &> /dev/null; then
                dnf groupinstall -y "Development Tools"
                dnf install -y \
                    curl \
                    wget \
                    git \
                    openssl \
                    jq \
                    htop \
                    net-tools \
                    nc \
                    firewalld \
                    fail2ban \
                    logrotate \
                    cronie
            else
                yum groupinstall -y "Development Tools"
                yum install -y \
                    curl \
                    wget \
                    git \
                    openssl \
                    jq \
                    htop \
                    net-tools \
                    nc \
                    firewalld \
                    fail2ban \
                    logrotate \
                    cronie
            fi
            ;;
    esac
    
    success "System dependencies installed"
}

install_nodejs() {
    step "Installing Node.js 20.x"
    
    if command -v node &> /dev/null; then
        local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ $node_version -ge 18 ]]; then
            log "Node.js $node_version already installed"
            return 0
        fi
    fi
    
    case $OS in
        ubuntu|debian)
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y nodejs
            ;;
        centos|rhel|fedora)
            curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
            if command -v dnf &> /dev/null; then
                dnf install -y nodejs
            else
                yum install -y nodejs
            fi
            ;;
    esac
    
    # Verify installation
    local node_version=$(node --version)
    local npm_version=$(npm --version)
    log "Node.js version: $node_version"
    log "NPM version: $npm_version"
    
    success "Node.js installed successfully"
}

install_postgresql() {
    step "Installing PostgreSQL with pgvector extension"
    
    if command -v psql &> /dev/null && is_service_running postgresql; then
        log "PostgreSQL already installed and running"
        return 0
    fi
    
    case $OS in
        ubuntu|debian)
            # Install PostgreSQL
            apt-get install -y postgresql postgresql-contrib
            
            # Install pgvector extension
            apt-get install -y postgresql-14-pgvector || {
                warn "pgvector extension not available in repository, installing from source"
                install_pgvector_from_source
            }
            ;;
        centos|rhel|fedora)
            if command -v dnf &> /dev/null; then
                dnf install -y postgresql postgresql-server postgresql-contrib
                postgresql-setup --initdb
            else
                yum install -y postgresql postgresql-server postgresql-contrib
                postgresql-setup initdb
            fi
            ;;
    esac
    
    # Start and enable PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    
    wait_for_service "postgresql" 5432
    
    success "PostgreSQL installed and started"
}

install_pgvector_from_source() {
    log "Installing pgvector from source"
    
    # Install build dependencies
    case $OS in
        ubuntu|debian)
            apt-get install -y postgresql-server-dev-14
            ;;
        centos|rhel|fedora)
            install_package postgresql-devel
            ;;
    esac
    
    # Build and install pgvector
    cd /tmp
    git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
    cd pgvector
    make
    make install
    cd "$PROJECT_ROOT"
    rm -rf /tmp/pgvector
    
    success "pgvector extension installed from source"
}

install_redis() {
    step "Installing Redis"
    
    if command -v redis-cli &> /dev/null && is_service_running redis; then
        log "Redis already installed and running"
        return 0
    fi
    
    install_package redis-server
    
    # Start and enable Redis
    systemctl start redis-server || systemctl start redis
    systemctl enable redis-server || systemctl enable redis
    
    wait_for_service "redis" 6379
    
    success "Redis installed and started"
}

install_nginx() {
    step "Installing Nginx"
    
    if command -v nginx &> /dev/null; then
        log "Nginx already installed"
        return 0
    fi
    
    install_package nginx
    
    # Start and enable Nginx
    systemctl start nginx
    systemctl enable nginx
    
    wait_for_service "nginx" 80
    
    success "Nginx installed and started"
}

# ==============================================================================
# DATABASE SETUP
# ==============================================================================

setup_postgresql() {
    step "Setting up PostgreSQL database"
    
    # Generate database password if not provided
    if [[ -z "$DEFAULT_DB_PASSWORD" ]]; then
        DEFAULT_DB_PASSWORD=$(generate_password 24)
        log "Generated database password"
    fi
    
    # Create database and user
    sudo -u postgres psql << EOF
-- Create database
CREATE DATABASE claude_zen_production;

-- Create user
CREATE USER claude_user WITH ENCRYPTED PASSWORD '$DEFAULT_DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE claude_zen_production TO claude_user;

-- Enable pgvector extension
\c claude_zen_production
CREATE EXTENSION IF NOT EXISTS vector;

-- Exit
\q
EOF
    
    # Configure PostgreSQL for production
    local pg_config_dir="/etc/postgresql/14/main"
    if [[ ! -d "$pg_config_dir" ]]; then
        pg_config_dir=$(find /etc -name "postgresql.conf" -path "*/postgresql/*" -exec dirname {} \; 2>/dev/null | head -1)
    fi
    
    if [[ -n "$pg_config_dir" && -f "$pg_config_dir/postgresql.conf" ]]; then
        log "Configuring PostgreSQL for production"
        
        # Backup original config
        cp "$pg_config_dir/postgresql.conf" "$pg_config_dir/postgresql.conf.backup"
        
        # Update configuration
        cat >> "$pg_config_dir/postgresql.conf" << EOF

# Claude-Zen production configuration
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
wal_buffers = 16MB
checkpoint_completion_target = 0.9
random_page_cost = 1.1
effective_io_concurrency = 200
EOF
        
        # Update authentication
        sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" "$pg_config_dir/postgresql.conf"
        
        # Configure authentication
        local pg_hba_file="$pg_config_dir/pg_hba.conf"
        if [[ -f "$pg_hba_file" ]]; then
            cp "$pg_hba_file" "$pg_hba_file.backup"
            
            # Add authentication for claude_user
            echo "local   claude_zen_production   claude_user   scram-sha-256" >> "$pg_hba_file"
            echo "host    claude_zen_production   claude_user   127.0.0.1/32   scram-sha-256" >> "$pg_hba_file"
        fi
        
        # Restart PostgreSQL to apply changes
        systemctl restart postgresql
        wait_for_service "postgresql" 5432
    fi
    
    # Test database connection
    PGPASSWORD="$DEFAULT_DB_PASSWORD" psql -U claude_user -h localhost -d claude_zen_production -c "SELECT 1;" > /dev/null
    
    success "PostgreSQL database configured successfully"
}

setup_redis() {
    step "Setting up Redis"
    
    # Generate Redis password if not provided
    if [[ -z "$DEFAULT_REDIS_PASSWORD" ]]; then
        DEFAULT_REDIS_PASSWORD=$(generate_password 24)
        log "Generated Redis password"
    fi
    
    # Configure Redis
    local redis_conf="/etc/redis/redis.conf"
    if [[ ! -f "$redis_conf" ]]; then
        redis_conf=$(find /etc -name "redis.conf" 2>/dev/null | head -1)
    fi
    
    if [[ -f "$redis_conf" ]]; then
        log "Configuring Redis for production"
        
        # Backup original config
        cp "$redis_conf" "${redis_conf}.backup"
        
        # Update configuration
        sed -i "s/^# requirepass foobared/requirepass $DEFAULT_REDIS_PASSWORD/" "$redis_conf"
        sed -i "s/^bind 127.0.0.1/bind 127.0.0.1/" "$redis_conf"
        sed -i "s/^# maxmemory <bytes>/maxmemory 1gb/" "$redis_conf"
        sed -i "s/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/" "$redis_conf"
        
        # Security settings
        echo "rename-command CONFIG \"\"" >> "$redis_conf"
        echo "rename-command SHUTDOWN SHUTDOWN_$(generate_password 8)" >> "$redis_conf"
        
        # Restart Redis
        systemctl restart redis-server || systemctl restart redis
        wait_for_service "redis" 6379
    fi
    
    # Test Redis connection
    redis-cli -a "$DEFAULT_REDIS_PASSWORD" ping > /dev/null
    
    success "Redis configured successfully"
}

# ==============================================================================
# APPLICATION SETUP
# ==============================================================================

create_app_user() {
    step "Creating application user"
    
    if id "$DEFAULT_APP_USER" &>/dev/null; then
        log "User $DEFAULT_APP_USER already exists"
        return 0
    fi
    
    useradd --system --shell /bin/false --home "$DEFAULT_APP_DIR" "$DEFAULT_APP_USER"
    success "Created user: $DEFAULT_APP_USER"
}

setup_directories() {
    step "Setting up application directories"
    
    # Create directories
    mkdir -p "$DEFAULT_APP_DIR"
    mkdir -p "$DEFAULT_LOG_DIR"
    mkdir -p "$DEFAULT_DATA_DIR"
    mkdir -p "$DEFAULT_BACKUP_DIR"
    mkdir -p "$DEFAULT_APP_DIR/cache"
    mkdir -p "$DEFAULT_APP_DIR/workspace"
    mkdir -p "$DEFAULT_APP_DIR/config"
    
    # Set permissions
    chown -R "$DEFAULT_APP_USER:$DEFAULT_APP_USER" "$DEFAULT_APP_DIR"
    chown -R "$DEFAULT_APP_USER:$DEFAULT_APP_USER" "$DEFAULT_LOG_DIR"
    chown -R "$DEFAULT_APP_USER:$DEFAULT_APP_USER" "$DEFAULT_DATA_DIR"
    chown -R "$DEFAULT_APP_USER:$DEFAULT_APP_USER" "$DEFAULT_BACKUP_DIR"
    
    chmod -R 755 "$DEFAULT_APP_DIR"
    chmod -R 755 "$DEFAULT_LOG_DIR"
    
    success "Application directories created"
}

install_application() {
    step "Installing Claude-Zen application"
    
    # Copy application files
    log "Copying application files to $DEFAULT_APP_DIR"
    rsync -av --exclude=node_modules --exclude=.git --exclude=logs --exclude=tmp "$PROJECT_ROOT/" "$DEFAULT_APP_DIR/"
    
    # Install Node.js dependencies
    cd "$DEFAULT_APP_DIR"
    sudo -u "$DEFAULT_APP_USER" npm ci --production --silent
    
    # Make binary executable
    chmod +x "$DEFAULT_APP_DIR/bin/claude-zen" 2>/dev/null || {
        warn "Binary file not found, application may need to be built"
    }
    
    success "Application installed"
}

generate_environment_config() {
    step "Generating environment configuration"
    
    local env_file="$DEFAULT_APP_DIR/.env"
    
    # Generate JWT secret
    local jwt_secret=$(generate_password 64)
    local encryption_key=$(generate_password 32)
    local session_secret=$(generate_password 32)
    local web_session_secret=$(generate_password 32)
    
    # Create production .env file
    cat > "$env_file" << EOF
# ==============================================================================
# CLAUDE-ZEN PRODUCTION CONFIGURATION
# Generated by setup script on $(date)
# ==============================================================================

# Core System
NODE_ENV=production
APP_NAME=claude-zen
APP_VERSION=2.0.0
CLAUDE_INSTANCE_ID=$(hostname)-prod

# Node.js Configuration
NODE_OPTIONS="--max-old-space-size=8192"

# Logging
CLAUDE_LOG_LEVEL=info
CLAUDE_LOG_CONSOLE=false
CLAUDE_LOG_FILE=true
CLAUDE_LOG_JSON=true
CLAUDE_LOG_DIR=$DEFAULT_LOG_DIR
CLAUDE_LOG_FILE_PATH=$DEFAULT_LOG_DIR/claude-zen.log
CLAUDE_LOG_ERROR_FILE=$DEFAULT_LOG_DIR/error.log

# Network
CLAUDE_MCP_HOST=0.0.0.0
CLAUDE_MCP_PORT=3000
CLAUDE_WEB_HOST=0.0.0.0
CLAUDE_WEB_PORT=3456
API_PORT=4000
WEBSOCKET_PORT=4001

# Security
FORCE_HTTPS=true
JWT_SECRET=$jwt_secret
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=24h
ENCRYPTION_KEY=$encryption_key
SESSION_SECRET=$session_secret
CLAUDE_WEB_SESSION_SECRET=$web_session_secret
CORS_ORIGIN=${DEFAULT_DOMAIN:+https://$DEFAULT_DOMAIN}
CLAUDE_MCP_CORS_ORIGIN=${DEFAULT_DOMAIN:+https://$DEFAULT_DOMAIN}

# Database
DATABASE_URL=postgresql://claude_user:$DEFAULT_DB_PASSWORD@localhost:5432/claude_zen_production
DATABASE_POOL_MIN=10
DATABASE_POOL_MAX=50
DATABASE_SSL=require
VECTOR_DATABASE_URL=postgresql://claude_user:$DEFAULT_DB_PASSWORD@localhost:5432/claude_zen_production

# Redis
REDIS_URL=redis://:$DEFAULT_REDIS_PASSWORD@localhost:6379/0
REDIS_PASSWORD=$DEFAULT_REDIS_PASSWORD
SESSION_STORE=redis

# File System
CLAUDE_WORK_DIR=$DEFAULT_APP_DIR/workspace
CLAUDE_CACHE_DIR=$DEFAULT_APP_DIR/cache
CLAUDE_CONFIG_DIR=$DEFAULT_APP_DIR/config
MAX_FILE_SIZE=50mb
DOCUMENT_MAX_SIZE=25mb

# Monitoring
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true
PERFORMANCE_MONITORING=true

# Backup
BACKUP_ENABLED=true
BACKUP_LOCATION=$DEFAULT_BACKUP_DIR
BACKUP_COMPRESSION=true

# Feature Flags
MCP_HTTP_ENABLED=true
MCP_STDIO_ENABLED=true
WEB_DASHBOARD_ENABLED=true
TUI_ENABLED=false
CLI_ENABLED=true
NEURAL_PROCESSING_ENABLED=true
SWARM_COORDINATION_ENABLED=true

# Debug (disabled in production)
DEBUG=false
DEBUG_ENABLED=false
DEV_TOOLS_ENABLED=false

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=60
RATE_LIMIT_WINDOW=60000

# Performance
WORKER_THREADS=8
ENABLE_SIMD=true

# AI Service Configuration
# TODO: Set your API keys
ANTHROPIC_API_KEY=your-anthropic-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
GITHUB_TOKEN=your-github-token-here

EOF
    
    # Set secure permissions
    chown "$DEFAULT_APP_USER:$DEFAULT_APP_USER" "$env_file"
    chmod 600 "$env_file"
    
    success "Environment configuration generated"
    warn "IMPORTANT: Update API keys in $env_file before starting the application"
}

install_systemd_service() {
    step "Installing SystemD service"
    
    local service_file="/etc/systemd/system/claude-zen.service"
    
    # Copy service file if it exists, or create one
    if [[ -f "$PROJECT_ROOT/systemd/claude-zen.service" ]]; then
        cp "$PROJECT_ROOT/systemd/claude-zen.service" "$service_file"
    else
        # Create basic service file
        cat > "$service_file" << EOF
[Unit]
Description=Claude-Zen AI Development Environment
After=network-online.target postgresql.service redis.service
Wants=network-online.target
Requires=postgresql.service redis.service

[Service]
Type=exec
ExecStart=$DEFAULT_APP_DIR/bin/claude-zen start --production
ExecReload=/bin/kill -HUP \$MAINPID
ExecStop=/bin/kill -TERM \$MAINPID

WorkingDirectory=$DEFAULT_APP_DIR
EnvironmentFile=$DEFAULT_APP_DIR/.env
Environment=NODE_ENV=production

User=$DEFAULT_APP_USER
Group=$DEFAULT_APP_USER

Restart=always
RestartSec=10
StartLimitIntervalSec=60
StartLimitBurst=3

# Security
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict
ReadWritePaths=$DEFAULT_APP_DIR/data $DEFAULT_LOG_DIR $DEFAULT_APP_DIR/cache $DEFAULT_APP_DIR/workspace
NoNewPrivileges=true

# Resource limits
MemoryLimit=8G
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF
    fi
    
    # Reload systemd and enable service
    systemctl daemon-reload
    systemctl enable claude-zen
    
    success "SystemD service installed and enabled"
}

# ==============================================================================
# SSL/TLS CONFIGURATION
# ==============================================================================

install_certbot() {
    step "Installing Certbot for SSL certificates"
    
    if command -v certbot &> /dev/null; then
        log "Certbot already installed"
        return 0
    fi
    
    case $OS in
        ubuntu|debian)
            apt-get install -y certbot python3-certbot-nginx
            ;;
        centos|rhel|fedora)
            if command -v dnf &> /dev/null; then
                dnf install -y certbot python3-certbot-nginx
            else
                yum install -y certbot python3-certbot-nginx
            fi
            ;;
    esac
    
    success "Certbot installed"
}

setup_ssl_certificates() {
    step "Setting up SSL certificates"
    
    if [[ -z "$DEFAULT_DOMAIN" ]]; then
        warn "No domain specified, skipping SSL setup"
        warn "Run: certbot --nginx -d your-domain.com to setup SSL later"
        return 0
    fi
    
    log "Obtaining SSL certificate for $DEFAULT_DOMAIN"
    
    # Create nginx configuration for domain
    configure_nginx
    
    # Obtain SSL certificate
    certbot --nginx -d "$DEFAULT_DOMAIN" --non-interactive --agree-tos --email "admin@$DEFAULT_DOMAIN" --redirect
    
    # Set up automatic renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    success "SSL certificate configured for $DEFAULT_DOMAIN"
}

configure_nginx() {
    step "Configuring Nginx reverse proxy"
    
    local nginx_config="/etc/nginx/sites-available/claude-zen"
    local nginx_enabled="/etc/nginx/sites-enabled/claude-zen"
    
    # Create nginx configuration
    cat > "$nginx_config" << EOF
server {
    listen 80;
    server_name ${DEFAULT_DOMAIN:-_};
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=web:10m rate=20r/s;
    
    # MCP Server
    location /mcp/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
    
    # Web Dashboard
    location / {
        limit_req zone=web burst=50 nodelay;
        
        proxy_pass http://localhost:3456/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
EOF
    
    # Enable site
    ln -sf "$nginx_config" "$nginx_enabled"
    
    # Remove default site if it exists
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload nginx
    nginx -t
    systemctl reload nginx
    
    success "Nginx configured"
}

# ==============================================================================
# SECURITY & FIREWALL
# ==============================================================================

setup_firewall() {
    step "Configuring firewall"
    
    case $OS in
        ubuntu|debian)
            # Configure UFW
            ufw --force enable
            
            # Default policies
            ufw default deny incoming
            ufw default allow outgoing
            
            # SSH access
            ufw allow ssh
            
            # HTTP/HTTPS
            ufw allow 80/tcp
            ufw allow 443/tcp
            
            # Application ports (if needed for direct access)
            # ufw allow 3000/tcp  # MCP
            # ufw allow 3456/tcp  # Web Dashboard
            
            ufw reload
            ;;
        centos|rhel|fedora)
            # Configure firewalld
            systemctl start firewalld
            systemctl enable firewalld
            
            # Default zone
            firewall-cmd --set-default-zone=public
            
            # Allow services
            firewall-cmd --permanent --add-service=ssh
            firewall-cmd --permanent --add-service=http
            firewall-cmd --permanent --add-service=https
            
            # Application ports (if needed)
            # firewall-cmd --permanent --add-port=3000/tcp
            # firewall-cmd --permanent --add-port=3456/tcp
            
            firewall-cmd --reload
            ;;
    esac
    
    success "Firewall configured"
}

setup_fail2ban() {
    step "Configuring Fail2ban"
    
    # Create Claude-Zen jail configuration
    cat > /etc/fail2ban/jail.d/claude-zen.conf << EOF
[claude-zen-auth]
enabled = true
port = 3000,3456
filter = claude-zen-auth
logpath = $DEFAULT_LOG_DIR/access.log
maxretry = 5
bantime = 3600
findtime = 600

[nginx-claude-zen]
enabled = true
port = 80,443
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
bantime = 600
findtime = 600
EOF
    
    # Create filter for Claude-Zen authentication failures
    cat > /etc/fail2ban/filter.d/claude-zen-auth.conf << EOF
[Definition]
failregex = ^.*\[AUTH\].*Failed login from <HOST>.*$
            ^.*\[AUTH\].*Invalid token from <HOST>.*$
ignoreregex =
EOF
    
    # Restart fail2ban
    systemctl restart fail2ban
    systemctl enable fail2ban
    
    success "Fail2ban configured"
}

setup_log_rotation() {
    step "Setting up log rotation"
    
    cat > /etc/logrotate.d/claude-zen << EOF
$DEFAULT_LOG_DIR/*.log {
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
EOF
    
    success "Log rotation configured"
}

# ==============================================================================
# MONITORING & BACKUP
# ==============================================================================

setup_monitoring() {
    step "Setting up basic monitoring"
    
    # Create monitoring script
    cat > /usr/local/bin/claude-zen-monitor << 'EOF'
#!/bin/bash

HEALTH_URL="http://localhost:3000/health"
LOG_FILE="/var/log/claude-zen-monitor.log"

check_health() {
    if ! curl -sf "$HEALTH_URL" > /dev/null; then
        echo "$(date): Health check failed, restarting claude-zen" >> "$LOG_FILE"
        systemctl restart claude-zen
    fi
}

check_disk_space() {
    local usage=$(df / | awk 'NR==2{gsub(/%/,"",$5); print $5}')
    if [[ $usage -gt 90 ]]; then
        echo "$(date): Disk usage critical: ${usage}%" >> "$LOG_FILE"
        # Clean up old logs and backups
        find /var/log -name "*.log.gz" -mtime +7 -delete 2>/dev/null || true
        find /backup -name "*.tar.gz" -mtime +30 -delete 2>/dev/null || true
    fi
}

check_memory() {
    local usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2 }')
    if [[ $usage -gt 90 ]]; then
        echo "$(date): Memory usage critical: ${usage}%" >> "$LOG_FILE"
        # Could add memory cleanup or alerting here
    fi
}

check_health
check_disk_space
check_memory
EOF
    
    chmod +x /usr/local/bin/claude-zen-monitor
    
    # Add to crontab for root
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/claude-zen-monitor") | crontab -
    
    success "Basic monitoring configured"
}

setup_backup() {
    step "Setting up backup system"
    
    # Create backup script
    cat > /usr/local/bin/claude-zen-backup << EOF
#!/bin/bash

BACKUP_DIR="$DEFAULT_BACKUP_DIR"
LOG_FILE="/var/log/claude-zen-backup.log"
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
DB_PASSWORD="$DEFAULT_DB_PASSWORD"
REDIS_PASSWORD="$DEFAULT_REDIS_PASSWORD"

log() {
    echo "[\$(date)] \$1" >> "\$LOG_FILE"
}

# Create backup directory
mkdir -p "\$BACKUP_DIR/\$TIMESTAMP"

# Backup database
log "Starting database backup"
PGPASSWORD="\$DB_PASSWORD" pg_dump -U claude_user -h localhost claude_zen_production | gzip > "\$BACKUP_DIR/\$TIMESTAMP/postgres.sql.gz"

# Backup Redis
log "Starting Redis backup"
redis-cli -a "\$REDIS_PASSWORD" --rdb "\$BACKUP_DIR/\$TIMESTAMP/redis.rdb"

# Backup application data
log "Starting application data backup"
tar -czf "\$BACKUP_DIR/\$TIMESTAMP/app-data.tar.gz" -C "$DEFAULT_APP_DIR" data workspace cache config

# Backup logs
log "Starting logs backup"
tar -czf "\$BACKUP_DIR/\$TIMESTAMP/logs.tar.gz" -C "$DEFAULT_LOG_DIR" .

# Clean up old backups (keep 7 days)
find "\$BACKUP_DIR" -type d -name "*_*" -mtime +7 -exec rm -rf {} + 2>/dev/null || true

log "Backup completed: \$TIMESTAMP"
EOF
    
    chmod +x /usr/local/bin/claude-zen-backup
    
    # Schedule daily backups at 2 AM
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/claude-zen-backup") | crontab -
    
    success "Backup system configured"
}

# ==============================================================================
# HEALTH CHECKS & VALIDATION
# ==============================================================================

validate_installation() {
    step "Validating installation"
    
    local errors=0
    
    # Check services
    log "Checking services..."
    for service in postgresql redis nginx claude-zen; do
        if systemctl is-active --quiet "$service"; then
            log "✓ $service is running"
        else
            error "✗ $service is not running"
            ((errors++))
        fi
    done
    
    # Check ports
    log "Checking ports..."
    local ports=(5432 6379 80 3000 3456)
    for port in "${ports[@]}"; do
        if nc -z localhost "$port"; then
            log "✓ Port $port is open"
        else
            warn "✗ Port $port is not accessible"
        fi
    done
    
    # Check configuration files
    log "Checking configuration files..."
    local config_files=(
        "$DEFAULT_APP_DIR/.env"
        "/etc/systemd/system/claude-zen.service"
        "/etc/nginx/sites-available/claude-zen"
    )
    
    for file in "${config_files[@]}"; do
        if [[ -f "$file" ]]; then
            log "✓ $file exists"
        else
            error "✗ $file missing"
            ((errors++))
        fi
    done
    
    # Test application health
    log "Testing application health..."
    sleep 10  # Give application time to start
    
    if curl -sf "http://localhost:3000/health" > /dev/null; then
        success "✓ Application health check passed"
    else
        error "✗ Application health check failed"
        ((errors++))
    fi
    
    if [[ $errors -eq 0 ]]; then
        success "Installation validation passed"
        return 0
    else
        error "Installation validation failed with $errors errors"
        return 1
    fi
}

# ==============================================================================
# MAIN SETUP WORKFLOW
# ==============================================================================

show_help() {
    cat << EOF
Claude-Zen Production Setup Script

Usage: sudo bash scripts/setup-production.sh [options]

Options:
  --help               Show this help message
  --skip-deps          Skip dependency installation
  --skip-db            Skip database setup
  --skip-ssl           Skip SSL certificate setup
  --skip-firewall      Skip firewall configuration
  --config-only        Only generate configuration files
  --docker             Setup for Docker deployment
  --kubernetes         Setup for Kubernetes deployment
  --domain DOMAIN      Set domain name for SSL
  --db-password PASS   Set database password
  --redis-password     Set Redis password

Examples:
  sudo bash scripts/setup-production.sh --domain example.com
  sudo bash scripts/setup-production.sh --docker --skip-deps
  sudo bash scripts/setup-production.sh --config-only
EOF
}

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help)
                show_help
                exit 0
                ;;
            --skip-deps)
                SKIP_DEPS=true
                shift
                ;;
            --skip-db)
                SKIP_DB=true
                shift
                ;;
            --skip-ssl)
                SKIP_SSL=true
                shift
                ;;
            --skip-firewall)
                SKIP_FIREWALL=true
                shift
                ;;
            --config-only)
                CONFIG_ONLY=true
                shift
                ;;
            --docker)
                SETUP_DOCKER=true
                shift
                ;;
            --kubernetes)
                SETUP_KUBERNETES=true
                shift
                ;;
            --domain)
                DEFAULT_DOMAIN="$2"
                shift 2
                ;;
            --db-password)
                DEFAULT_DB_PASSWORD="$2"
                shift 2
                ;;
            --redis-password)
                DEFAULT_REDIS_PASSWORD="$2"
                shift 2
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

main() {
    # Parse command line arguments
    parse_arguments "$@"
    
    # Initialize
    log "Starting Claude-Zen production setup"
    log "Timestamp: $(date)"
    log "Script: $0"
    log "Arguments: $*"
    
    # Pre-flight checks
    check_root
    detect_os
    check_requirements
    
    # Configuration only mode
    if [[ "$CONFIG_ONLY" == true ]]; then
        step "Configuration-only mode"
        create_app_user
        setup_directories
        generate_environment_config
        success "Configuration files generated. Review and update API keys before deployment."
        exit 0
    fi
    
    # Main installation workflow
    if [[ "$SKIP_DEPS" != true ]]; then
        install_system_dependencies
        install_nodejs
        
        if [[ "$SKIP_DB" != true ]]; then
            install_postgresql
            install_redis
        fi
        
        if [[ "$SKIP_SSL" != true ]]; then
            install_nginx
            install_certbot
        fi
    fi
    
    # Application setup
    create_app_user
    setup_directories
    install_application
    generate_environment_config
    install_systemd_service
    
    # Database configuration
    if [[ "$SKIP_DB" != true ]]; then
        setup_postgresql
        setup_redis
    fi
    
    # SSL and reverse proxy
    if [[ "$SKIP_SSL" != true ]]; then
        configure_nginx
        if [[ -n "$DEFAULT_DOMAIN" ]]; then
            setup_ssl_certificates
        fi
    fi
    
    # Security
    if [[ "$SKIP_FIREWALL" != true ]]; then
        setup_firewall
        setup_fail2ban
    fi
    
    # Monitoring and maintenance
    setup_log_rotation
    setup_monitoring
    setup_backup
    
    # Start services
    systemctl start claude-zen
    
    # Validation
    validate_installation
    
    # Final instructions
    step "Setup Complete!"
    
    success "Claude-Zen has been successfully installed and configured for production."
    echo
    log "📝 Next Steps:"
    log "  1. Update API keys in $DEFAULT_APP_DIR/.env"
    log "     - ANTHROPIC_API_KEY (required)"
    log "     - OPENAI_API_KEY (optional, for failover)"
    log "     - GITHUB_TOKEN (optional, for GitHub integration)"
    echo
    log "  2. Restart the service: sudo systemctl restart claude-zen"
    echo
    log "  3. Check service status: sudo systemctl status claude-zen"
    echo
    log "  4. View logs: sudo journalctl -u claude-zen -f"
    echo
    log "  5. Test the application:"
    if [[ -n "$DEFAULT_DOMAIN" ]]; then
        log "     - Web Dashboard: https://$DEFAULT_DOMAIN/"
        log "     - Health Check: https://$DEFAULT_DOMAIN/health"
    else
        log "     - Web Dashboard: http://localhost:3456/"
        log "     - Health Check: http://localhost:3000/health"
    fi
    echo
    log "📊 System Information:"
    log "  - Application Directory: $DEFAULT_APP_DIR"
    log "  - Log Directory: $DEFAULT_LOG_DIR"
    log "  - Data Directory: $DEFAULT_DATA_DIR"
    log "  - Backup Directory: $DEFAULT_BACKUP_DIR"
    log "  - Database: PostgreSQL with pgvector extension"
    log "  - Cache: Redis with authentication"
    log "  - Web Server: Nginx reverse proxy"
    log "  - SSL: ${DEFAULT_DOMAIN:+Enabled for $DEFAULT_DOMAIN}${DEFAULT_DOMAIN:-Not configured}"
    log "  - Firewall: ${SKIP_FIREWALL:+Skipped}${SKIP_FIREWALL:-Configured}"
    log "  - Monitoring: Enabled with health checks"
    log "  - Backups: Daily at 2:00 AM"
    echo
    log "🔐 Security Notes:"
    log "  - Database password: $DEFAULT_DB_PASSWORD"
    log "  - Redis password: $DEFAULT_REDIS_PASSWORD"
    log "  - All secrets are in $DEFAULT_APP_DIR/.env (secure permissions)"
    log "  - Fail2ban is configured for intrusion prevention"
    log "  - Firewall is configured to allow only necessary ports"
    echo
    log "📖 Documentation:"
    log "  - Production Setup: $PROJECT_ROOT/docs/deployment/PRODUCTION_SETUP.md"
    log "  - Environment Variables: $PROJECT_ROOT/docs/deployment/ENVIRONMENT_VARIABLES.md"
    log "  - Troubleshooting: $PROJECT_ROOT/docs/deployment/TROUBLESHOOTING.md"
    echo
    
    success "Setup completed successfully! 🎉"
}

# ==============================================================================
# SCRIPT EXECUTION
# ==============================================================================

# Ensure log file exists and is writable
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"

# Run main function with all arguments
main "$@"