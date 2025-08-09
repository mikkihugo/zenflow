#!/bin/bash

# ==============================================================================
# CLAUDE-ZEN PRODUCTION HEALTH CHECK SCRIPT
# ==============================================================================
#
# Comprehensive health check and monitoring script for Claude-Zen production deployments
#
# This script performs detailed health checks on all system components:
# - Application health and responsiveness
# - Database connectivity and performance
# - Cache (Redis) availability
# - System resource utilization
# - Network connectivity
# - SSL certificate status
# - Service status and uptime
# - Log analysis for errors
# - Security monitoring
#
# Usage:
#   bash scripts/health-check.sh [options]
#
# Options:
#   --help              Show help message
#   --verbose           Enable verbose output
#   --quiet             Minimize output (errors only)
#   --json              Output results in JSON format
#   --nagios            Output in Nagios-compatible format
#   --check TYPE        Run specific check only
#   --timeout SECONDS   Set timeout for HTTP checks (default: 10)
#   --critical          Exit with critical status on any failure
#   --no-color          Disable colored output
#   --save-report       Save detailed report to file
#   --alert-webhook     Send alerts to webhook on failures
#
# Check types:
#   app, database, cache, system, network, ssl, services, logs, security, all
#
# Examples:
#   bash scripts/health-check.sh                    # Run all checks
#   bash scripts/health-check.sh --json             # JSON output
#   bash scripts/health-check.sh --check app        # Only app health
#   bash scripts/health-check.sh --critical         # Exit on first failure
#   bash scripts/health-check.sh --save-report      # Save detailed report
#
# Exit codes:
#   0 = All checks passed
#   1 = Warning (non-critical issues)
#   2 = Critical failure
#   3 = Configuration error

set -euo pipefail

# ==============================================================================
# CONFIGURATION & DEFAULTS
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Default settings
VERBOSE=false
QUIET=false
JSON_OUTPUT=false
NAGIOS_OUTPUT=false
SPECIFIC_CHECK=""
TIMEOUT=10
CRITICAL_MODE=false
NO_COLOR=false
SAVE_REPORT=false
ALERT_WEBHOOK=""

# Health check configuration
APP_URL="http://localhost:3000"
WEB_URL="http://localhost:3456"
HEALTH_ENDPOINT="/health"
METRICS_ENDPOINT="/metrics"

# Paths
LOG_DIR="/var/log/claude-zen"
APP_DIR="/opt/claude-zen"
PID_FILE="/var/run/claude-zen/claude-zen.pid"

# Thresholds
CPU_WARNING=80
CPU_CRITICAL=95
MEMORY_WARNING=80
MEMORY_CRITICAL=95
DISK_WARNING=80
DISK_CRITICAL=95
RESPONSE_TIME_WARNING=2000  # milliseconds
RESPONSE_TIME_CRITICAL=5000

# Colors (can be disabled with --no-color)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Result tracking
PASSED_CHECKS=0
WARNING_CHECKS=0
CRITICAL_CHECKS=0
TOTAL_CHECKS=0

# Results array for JSON output
declare -a CHECK_RESULTS=()

# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================

# Logging functions
log_info() {
    [[ "$QUIET" == true ]] && return
    if [[ "$NO_COLOR" == true ]]; then
        echo "[INFO] $1"
    else
        echo -e "${GREEN}[INFO]${NC} $1"
    fi
}

log_warn() {
    if [[ "$NO_COLOR" == true ]]; then
        echo "[WARN] $1"
    else
        echo -e "${YELLOW}[WARN]${NC} $1"
    fi
}

log_error() {
    if [[ "$NO_COLOR" == true ]]; then
        echo "[ERROR] $1" >&2
    else
        echo -e "${RED}[ERROR]${NC} $1" >&2
    fi
}

log_debug() {
    [[ "$VERBOSE" != true ]] && return
    if [[ "$NO_COLOR" == true ]]; then
        echo "[DEBUG] $1"
    else
        echo -e "${BLUE}[DEBUG]${NC} $1"
    fi
}

# Result recording
record_result() {
    local check_name="$1"
    local status="$2"  # PASS, WARN, FAIL
    local message="$3"
    local details="${4:-}"
    
    ((TOTAL_CHECKS++))
    
    case "$status" in
        PASS)
            ((PASSED_CHECKS++))
            [[ "$VERBOSE" == true ]] && log_info "✓ $check_name: $message"
            ;;
        WARN)
            ((WARNING_CHECKS++))
            log_warn "⚠ $check_name: $message"
            ;;
        FAIL)
            ((CRITICAL_CHECKS++))
            log_error "✗ $check_name: $message"
            if [[ "$CRITICAL_MODE" == true ]]; then
                exit 2
            fi
            ;;
    esac
    
    # Store for JSON output
    if [[ "$JSON_OUTPUT" == true ]]; then
        local result_json=$(jq -n \
            --arg name "$check_name" \
            --arg status "$status" \
            --arg message "$message" \
            --arg details "$details" \
            --arg timestamp "$(date -Iseconds)" \
            '{
                name: $name,
                status: $status,
                message: $message,
                details: $details,
                timestamp: $timestamp
            }')
        CHECK_RESULTS+=("$result_json")
    fi
}

# HTTP request with timeout
http_check() {
    local url="$1"
    local expected_code="${2:-200}"
    local timeout="${3:-$TIMEOUT}"
    
    local start_time=$(date +%s%3N)
    local response_code
    
    if response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$timeout" "$url" 2>/dev/null); then
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))
        
        if [[ "$response_code" == "$expected_code" ]]; then
            echo "SUCCESS:$response_time:$response_code"
        else
            echo "FAIL:$response_time:$response_code"
        fi
    else
        echo "ERROR:0:0"
    fi
}

# Check if service is running
is_service_running() {
    systemctl is-active --quiet "$1" 2>/dev/null
}

# Get service uptime
get_service_uptime() {
    systemctl show -p ActiveEnterTimestamp "$1" 2>/dev/null | cut -d= -f2
}

# Check port availability
is_port_open() {
    local host="${1:-localhost}"
    local port="$2"
    local timeout="${3:-5}"
    
    timeout "$timeout" bash -c "</dev/tcp/$host/$port" 2>/dev/null
}

# Parse size string to bytes
parse_size() {
    local size_str="$1"
    echo "$size_str" | awk '
        /K$/ { print $1 * 1024 }
        /M$/ { print $1 * 1024 * 1024 }
        /G$/ { print $1 * 1024 * 1024 * 1024 }
        /T$/ { print $1 * 1024 * 1024 * 1024 * 1024 }
        !/[KMGT]$/ { print $1 }
    '
}

# ==============================================================================
# HEALTH CHECK FUNCTIONS
# ==============================================================================

check_application_health() {
    log_debug "Checking application health..."
    
    # Check if process is running
    if ! pgrep -f "claude-zen" > /dev/null; then
        record_result "App Process" "FAIL" "Claude-Zen process not running"
        return
    fi
    
    record_result "App Process" "PASS" "Claude-Zen process is running"
    
    # Check HTTP MCP server
    local mcp_result
    mcp_result=$(http_check "$APP_URL$HEALTH_ENDPOINT")
    
    IFS=':' read -r status response_time code <<< "$mcp_result"
    
    case "$status" in
        SUCCESS)
            if [[ $response_time -gt $RESPONSE_TIME_CRITICAL ]]; then
                record_result "MCP Server" "FAIL" "Response time too slow: ${response_time}ms (>$RESPONSE_TIME_CRITICAL ms)"
            elif [[ $response_time -gt $RESPONSE_TIME_WARNING ]]; then
                record_result "MCP Server" "WARN" "Response time slow: ${response_time}ms (>$RESPONSE_TIME_WARNING ms)"
            else
                record_result "MCP Server" "PASS" "Responding in ${response_time}ms"
            fi
            ;;
        FAIL)
            record_result "MCP Server" "FAIL" "HTTP $code (expected 200) in ${response_time}ms"
            ;;
        ERROR)
            record_result "MCP Server" "FAIL" "Connection failed or timeout"
            ;;
    esac
    
    # Check Web Dashboard
    local web_result
    web_result=$(http_check "$WEB_URL$HEALTH_ENDPOINT")
    
    IFS=':' read -r status response_time code <<< "$web_result"
    
    case "$status" in
        SUCCESS)
            if [[ $response_time -gt $RESPONSE_TIME_CRITICAL ]]; then
                record_result "Web Dashboard" "FAIL" "Response time too slow: ${response_time}ms"
            elif [[ $response_time -gt $RESPONSE_TIME_WARNING ]]; then
                record_result "Web Dashboard" "WARN" "Response time slow: ${response_time}ms"
            else
                record_result "Web Dashboard" "PASS" "Responding in ${response_time}ms"
            fi
            ;;
        FAIL)
            record_result "Web Dashboard" "FAIL" "HTTP $code (expected 200) in ${response_time}ms"
            ;;
        ERROR)
            record_result "Web Dashboard" "FAIL" "Connection failed or timeout"
            ;;
    esac
    
    # Check metrics endpoint
    local metrics_result
    metrics_result=$(http_check "$APP_URL$METRICS_ENDPOINT")
    
    IFS=':' read -r status response_time code <<< "$metrics_result"
    
    case "$status" in
        SUCCESS)
            record_result "Metrics Endpoint" "PASS" "Metrics available"
            ;;
        *)
            record_result "Metrics Endpoint" "WARN" "Metrics not available (may be disabled)"
            ;;
    esac
}

check_database_health() {
    log_debug "Checking database health..."
    
    # Check PostgreSQL service
    if ! is_service_running postgresql; then
        record_result "PostgreSQL Service" "FAIL" "PostgreSQL service is not running"
        return
    fi
    
    record_result "PostgreSQL Service" "PASS" "PostgreSQL service is running"
    
    # Check PostgreSQL connectivity
    if command -v pg_isready &> /dev/null; then
        if pg_isready -h localhost -p 5432 -q; then
            record_result "PostgreSQL Connection" "PASS" "PostgreSQL accepting connections"
        else
            record_result "PostgreSQL Connection" "FAIL" "PostgreSQL not accepting connections"
            return
        fi
    else
        record_result "PostgreSQL Connection" "WARN" "pg_isready not available, cannot test connection"
    fi
    
    # Check database connectivity with application user (if credentials available)
    if [[ -f "$APP_DIR/.env" ]]; then
        local db_url
        db_url=$(grep -E "^DATABASE_URL=" "$APP_DIR/.env" 2>/dev/null | cut -d= -f2- | tr -d '"' || echo "")
        
        if [[ -n "$db_url" ]]; then
            # Parse database URL for testing
            if command -v psql &> /dev/null; then
                if psql "$db_url" -c "SELECT 1;" &> /dev/null; then
                    record_result "Database Query" "PASS" "Database query successful"
                else
                    record_result "Database Query" "FAIL" "Database query failed"
                fi
            fi
        fi
    fi
    
    # Check for pgvector extension
    if command -v psql &> /dev/null && [[ -n "${db_url:-}" ]]; then
        if psql "$db_url" -c "SELECT * FROM pg_extension WHERE extname='vector';" 2>/dev/null | grep -q vector; then
            record_result "Vector Extension" "PASS" "pgvector extension is installed"
        else
            record_result "Vector Extension" "WARN" "pgvector extension not found"
        fi
    fi
}

check_cache_health() {
    log_debug "Checking cache (Redis) health..."
    
    # Check Redis service
    if is_service_running redis-server || is_service_running redis; then
        record_result "Redis Service" "PASS" "Redis service is running"
    else
        record_result "Redis Service" "FAIL" "Redis service is not running"
        return
    fi
    
    # Check Redis connectivity
    if ! is_port_open localhost 6379; then
        record_result "Redis Connection" "FAIL" "Redis port 6379 not accessible"
        return
    fi
    
    record_result "Redis Connection" "PASS" "Redis port 6379 is accessible"
    
    # Test Redis ping (with authentication if configured)
    local redis_password=""
    if [[ -f "$APP_DIR/.env" ]]; then
        redis_password=$(grep -E "^REDIS_PASSWORD=" "$APP_DIR/.env" 2>/dev/null | cut -d= -f2- | tr -d '"' || echo "")
    fi
    
    if command -v redis-cli &> /dev/null; then
        local ping_result
        if [[ -n "$redis_password" ]]; then
            ping_result=$(redis-cli -a "$redis_password" ping 2>/dev/null || echo "ERROR")
        else
            ping_result=$(redis-cli ping 2>/dev/null || echo "ERROR")
        fi
        
        if [[ "$ping_result" == "PONG" ]]; then
            record_result "Redis Ping" "PASS" "Redis responding to ping"
        else
            record_result "Redis Ping" "FAIL" "Redis not responding to ping"
        fi
        
        # Check Redis memory usage
        local redis_info
        if [[ -n "$redis_password" ]]; then
            redis_info=$(redis-cli -a "$redis_password" info memory 2>/dev/null || echo "")
        else
            redis_info=$(redis-cli info memory 2>/dev/null || echo "")
        fi
        
        if [[ -n "$redis_info" ]]; then
            local used_memory=$(echo "$redis_info" | grep "used_memory_human:" | cut -d: -f2 | tr -d '\r')
            local max_memory=$(echo "$redis_info" | grep "maxmemory_human:" | cut -d: -f2 | tr -d '\r')
            
            if [[ -n "$used_memory" ]]; then
                record_result "Redis Memory" "PASS" "Memory usage: $used_memory${max_memory:+ / $max_memory}"
            fi
        fi
    fi
}

check_system_health() {
    log_debug "Checking system health..."
    
    # CPU usage
    local cpu_usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d% -f1 | cut -d, -f1)
    cpu_usage=${cpu_usage%.*}  # Remove decimal part
    
    if [[ $cpu_usage -ge $CPU_CRITICAL ]]; then
        record_result "CPU Usage" "FAIL" "CPU usage critical: ${cpu_usage}% (>=$CPU_CRITICAL%)"
    elif [[ $cpu_usage -ge $CPU_WARNING ]]; then
        record_result "CPU Usage" "WARN" "CPU usage high: ${cpu_usage}% (>=$CPU_WARNING%)"
    else
        record_result "CPU Usage" "PASS" "CPU usage normal: ${cpu_usage}%"
    fi
    
    # Memory usage
    local memory_info
    memory_info=$(free | grep "Mem:")
    local total_mem=$(echo "$memory_info" | awk '{print $2}')
    local used_mem=$(echo "$memory_info" | awk '{print $3}')
    local memory_percent=$((used_mem * 100 / total_mem))
    
    if [[ $memory_percent -ge $MEMORY_CRITICAL ]]; then
        record_result "Memory Usage" "FAIL" "Memory usage critical: ${memory_percent}% (>=$MEMORY_CRITICAL%)"
    elif [[ $memory_percent -ge $MEMORY_WARNING ]]; then
        record_result "Memory Usage" "WARN" "Memory usage high: ${memory_percent}% (>=$MEMORY_WARNING%)"
    else
        record_result "Memory Usage" "PASS" "Memory usage normal: ${memory_percent}%"
    fi
    
    # Disk usage
    local disk_usage
    disk_usage=$(df / | awk 'NR==2 {gsub(/%/, "", $5); print $5}')
    
    if [[ $disk_usage -ge $DISK_CRITICAL ]]; then
        record_result "Disk Usage" "FAIL" "Disk usage critical: ${disk_usage}% (>=$DISK_CRITICAL%)"
    elif [[ $disk_usage -ge $DISK_WARNING ]]; then
        record_result "Disk Usage" "WARN" "Disk usage high: ${disk_usage}% (>=$DISK_WARNING%)"
    else
        record_result "Disk Usage" "PASS" "Disk usage normal: ${disk_usage}%"
    fi
    
    # Load average
    local load_avg
    load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
    local cpu_cores
    cpu_cores=$(nproc)
    local load_percent
    load_percent=$(echo "$load_avg * 100 / $cpu_cores" | bc -l 2>/dev/null | cut -d. -f1 || echo "0")
    
    if [[ $load_percent -ge 100 ]]; then
        record_result "System Load" "WARN" "Load average high: $load_avg (${load_percent}% of $cpu_cores cores)"
    else
        record_result "System Load" "PASS" "Load average normal: $load_avg (${load_percent}% of $cpu_cores cores)"
    fi
    
    # Check available disk space for critical directories
    local app_disk_free
    app_disk_free=$(df "$APP_DIR" 2>/dev/null | awk 'NR==2 {print $4}' || echo "0")
    local app_disk_free_gb=$((app_disk_free / 1024 / 1024))
    
    if [[ $app_disk_free_gb -lt 1 ]]; then
        record_result "App Disk Space" "FAIL" "App directory disk space critical: ${app_disk_free_gb}GB free"
    elif [[ $app_disk_free_gb -lt 5 ]]; then
        record_result "App Disk Space" "WARN" "App directory disk space low: ${app_disk_free_gb}GB free"
    else
        record_result "App Disk Space" "PASS" "App directory disk space: ${app_disk_free_gb}GB free"
    fi
    
    # System uptime
    local uptime_info
    uptime_info=$(uptime -p 2>/dev/null || uptime | cut -d, -f1 | cut -d' ' -f3-)
    record_result "System Uptime" "PASS" "Uptime: $uptime_info"
}

check_network_health() {
    log_debug "Checking network health..."
    
    # Check required ports
    local ports=(3000 3456 5432 6379)
    local port_names=("MCP Server" "Web Dashboard" "PostgreSQL" "Redis")
    
    for i in "${!ports[@]}"; do
        local port="${ports[$i]}"
        local name="${port_names[$i]}"
        
        if is_port_open localhost "$port"; then
            record_result "Port $port" "PASS" "$name port is accessible"
        else
            record_result "Port $port" "FAIL" "$name port is not accessible"
        fi
    done
    
    # Check external connectivity (optional)
    if ping -c 1 -W 5 8.8.8.8 &> /dev/null; then
        record_result "Internet Connectivity" "PASS" "Internet connectivity available"
    else
        record_result "Internet Connectivity" "WARN" "Internet connectivity not available"
    fi
    
    # Check DNS resolution
    if nslookup google.com &> /dev/null; then
        record_result "DNS Resolution" "PASS" "DNS resolution working"
    else
        record_result "DNS Resolution" "WARN" "DNS resolution issues"
    fi
}

check_ssl_health() {
    log_debug "Checking SSL/TLS health..."
    
    # Skip if no SSL configuration detected
    if [[ ! -f /etc/nginx/sites-enabled/claude-zen ]] && [[ ! -d /etc/letsencrypt/live ]]; then
        record_result "SSL Configuration" "WARN" "SSL not configured (optional)"
        return
    fi
    
    # Check nginx configuration
    if command -v nginx &> /dev/null; then
        if nginx -t &> /dev/null; then
            record_result "Nginx Config" "PASS" "Nginx configuration valid"
        else
            record_result "Nginx Config" "FAIL" "Nginx configuration invalid"
        fi
    fi
    
    # Check SSL certificates (if Let's Encrypt is used)
    if command -v certbot &> /dev/null; then
        local cert_info
        cert_info=$(certbot certificates 2>/dev/null || echo "No certificates found")
        
        if echo "$cert_info" | grep -q "VALID"; then
            # Parse expiration date
            local expiry_date
            expiry_date=$(echo "$cert_info" | grep "Expiry Date:" | head -1 | awk '{print $3, $4, $5, $6}')
            
            if [[ -n "$expiry_date" ]]; then
                local expiry_epoch
                expiry_epoch=$(date -d "$expiry_date" +%s 2>/dev/null || echo "0")
                local current_epoch
                current_epoch=$(date +%s)
                local days_until_expiry
                days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
                
                if [[ $days_until_expiry -lt 7 ]]; then
                    record_result "SSL Certificate" "FAIL" "Certificate expires in $days_until_expiry days"
                elif [[ $days_until_expiry -lt 30 ]]; then
                    record_result "SSL Certificate" "WARN" "Certificate expires in $days_until_expiry days"
                else
                    record_result "SSL Certificate" "PASS" "Certificate valid for $days_until_expiry days"
                fi
            fi
        else
            record_result "SSL Certificate" "WARN" "No valid SSL certificates found"
        fi
    fi
}

check_services_health() {
    log_debug "Checking services health..."
    
    # List of critical services
    local services=("claude-zen" "postgresql" "redis-server" "nginx")
    local service_names=("Claude-Zen" "PostgreSQL" "Redis" "Nginx")
    
    for i in "${!services[@]}"; do
        local service="${services[$i]}"
        local name="${service_names[$i]}"
        
        # Handle Redis service name variation
        if [[ "$service" == "redis-server" ]] && ! systemctl list-units --full -all | grep -q "redis-server.service"; then
            service="redis"
        fi
        
        if is_service_running "$service"; then
            local uptime
            uptime=$(get_service_uptime "$service")
            record_result "$name Service" "PASS" "Service is running (started: ${uptime:-unknown})"
        else
            # Check if service exists before marking as failed
            if systemctl list-unit-files | grep -q "^$service.service"; then
                record_result "$name Service" "FAIL" "Service is not running"
            else
                record_result "$name Service" "WARN" "Service not installed or not found"
            fi
        fi
    done
    
    # Check service dependencies
    if is_service_running claude-zen; then
        local failed_deps
        failed_deps=$(systemctl show claude-zen -p SubState,ActiveState | grep -v "SubState=running\|ActiveState=active" || echo "")
        
        if [[ -z "$failed_deps" ]]; then
            record_result "Service Dependencies" "PASS" "All service dependencies satisfied"
        else
            record_result "Service Dependencies" "WARN" "Some service dependencies may have issues"
        fi
    fi
}

check_logs_health() {
    log_debug "Checking logs for issues..."
    
    # Check if log directory exists
    if [[ ! -d "$LOG_DIR" ]]; then
        record_result "Log Directory" "WARN" "Log directory does not exist: $LOG_DIR"
        return
    fi
    
    record_result "Log Directory" "PASS" "Log directory exists and accessible"
    
    # Check recent error logs
    local error_count=0
    local recent_errors=""
    
    if [[ -f "$LOG_DIR/error.log" ]]; then
        error_count=$(tail -n 100 "$LOG_DIR/error.log" 2>/dev/null | wc -l)
        recent_errors=$(tail -n 10 "$LOG_DIR/error.log" 2>/dev/null | head -5)
    fi
    
    # Check main application log for errors
    if [[ -f "$LOG_DIR/claude-zen.log" ]]; then
        local app_errors
        app_errors=$(tail -n 100 "$LOG_DIR/claude-zen.log" 2>/dev/null | grep -i error | wc -l)
        error_count=$((error_count + app_errors))
    fi
    
    # Check systemd journal for recent errors
    local journal_errors
    journal_errors=$(journalctl -u claude-zen --since "1 hour ago" --no-pager -q 2>/dev/null | grep -i error | wc -l || echo "0")
    error_count=$((error_count + journal_errors))
    
    if [[ $error_count -gt 10 ]]; then
        record_result "Recent Errors" "FAIL" "$error_count errors found in recent logs"
    elif [[ $error_count -gt 0 ]]; then
        record_result "Recent Errors" "WARN" "$error_count errors found in recent logs"
    else
        record_result "Recent Errors" "PASS" "No recent errors in logs"
    fi
    
    # Check log file sizes
    local log_size_mb=0
    if [[ -f "$LOG_DIR/claude-zen.log" ]]; then
        log_size_mb=$(du -m "$LOG_DIR/claude-zen.log" 2>/dev/null | cut -f1 || echo "0")
    fi
    
    if [[ $log_size_mb -gt 100 ]]; then
        record_result "Log File Size" "WARN" "Main log file is large: ${log_size_mb}MB (consider rotation)"
    else
        record_result "Log File Size" "PASS" "Log file size normal: ${log_size_mb}MB"
    fi
    
    # Check log rotation
    if [[ -f "/etc/logrotate.d/claude-zen" ]]; then
        record_result "Log Rotation" "PASS" "Log rotation configured"
    else
        record_result "Log Rotation" "WARN" "Log rotation not configured"
    fi
}

check_security_health() {
    log_debug "Checking security configuration..."
    
    # Check firewall status
    if command -v ufw &> /dev/null; then
        if ufw status | grep -q "Status: active"; then
            record_result "UFW Firewall" "PASS" "UFW firewall is active"
        else
            record_result "UFW Firewall" "WARN" "UFW firewall is inactive"
        fi
    elif command -v firewall-cmd &> /dev/null; then
        if firewall-cmd --state &> /dev/null; then
            record_result "Firewalld" "PASS" "Firewalld is running"
        else
            record_result "Firewalld" "WARN" "Firewalld is not running"
        fi
    else
        record_result "Firewall" "WARN" "No firewall detected"
    fi
    
    # Check fail2ban
    if command -v fail2ban-client &> /dev/null; then
        if is_service_running fail2ban; then
            record_result "Fail2ban" "PASS" "Fail2ban is running"
        else
            record_result "Fail2ban" "WARN" "Fail2ban is not running"
        fi
    else
        record_result "Fail2ban" "WARN" "Fail2ban not installed"
    fi
    
    # Check file permissions
    if [[ -f "$APP_DIR/.env" ]]; then
        local env_perms
        env_perms=$(stat -c "%a" "$APP_DIR/.env" 2>/dev/null || echo "000")
        
        if [[ "$env_perms" == "600" ]] || [[ "$env_perms" == "400" ]]; then
            record_result "Env File Permissions" "PASS" "Environment file has secure permissions ($env_perms)"
        else
            record_result "Env File Permissions" "FAIL" "Environment file has insecure permissions ($env_perms)"
        fi
    fi
    
    # Check for running processes as root
    local root_processes
    root_processes=$(ps aux | grep claude-zen | grep "^root" | grep -v grep | wc -l)
    
    if [[ $root_processes -gt 0 ]]; then
        record_result "Root Processes" "WARN" "$root_processes Claude-Zen processes running as root"
    else
        record_result "Root Processes" "PASS" "No Claude-Zen processes running as root"
    fi
    
    # Check SSH configuration (if applicable)
    if [[ -f "/etc/ssh/sshd_config" ]]; then
        if grep -q "PermitRootLogin no" /etc/ssh/sshd_config; then
            record_result "SSH Security" "PASS" "Root SSH login disabled"
        else
            record_result "SSH Security" "WARN" "Root SSH login may be enabled"
        fi
    fi
}

# ==============================================================================
# OUTPUT FUNCTIONS
# ==============================================================================

output_json() {
    local overall_status="PASS"
    
    if [[ $CRITICAL_CHECKS -gt 0 ]]; then
        overall_status="FAIL"
    elif [[ $WARNING_CHECKS -gt 0 ]]; then
        overall_status="WARN"
    fi
    
    local results_json="["
    local first=true
    for result in "${CHECK_RESULTS[@]}"; do
        if [[ "$first" == true ]]; then
            first=false
        else
            results_json+=","
        fi
        results_json+="$result"
    done
    results_json+="]"
    
    jq -n \
        --arg timestamp "$(date -Iseconds)" \
        --arg status "$overall_status" \
        --argjson total "$TOTAL_CHECKS" \
        --argjson passed "$PASSED_CHECKS" \
        --argjson warnings "$WARNING_CHECKS" \
        --argjson critical "$CRITICAL_CHECKS" \
        --argjson checks "$results_json" \
        '{
            timestamp: $timestamp,
            overall_status: $status,
            summary: {
                total_checks: $total,
                passed: $passed,
                warnings: $warnings,
                critical: $critical
            },
            checks: $checks
        }'
}

output_nagios() {
    local status_code=0
    local status_text="OK"
    local message=""
    
    if [[ $CRITICAL_CHECKS -gt 0 ]]; then
        status_code=2
        status_text="CRITICAL"
        message="$CRITICAL_CHECKS critical issues found"
    elif [[ $WARNING_CHECKS -gt 0 ]]; then
        status_code=1
        status_text="WARNING"
        message="$WARNING_CHECKS warnings found"
    else
        message="All $TOTAL_CHECKS checks passed"
    fi
    
    echo "CLAUDE_ZEN $status_text - $message | passed=$PASSED_CHECKS warnings=$WARNING_CHECKS critical=$CRITICAL_CHECKS"
    exit $status_code
}

output_summary() {
    if [[ "$QUIET" == true ]]; then
        return
    fi
    
    local color=""
    local status=""
    
    if [[ $CRITICAL_CHECKS -gt 0 ]]; then
        color="$RED"
        status="CRITICAL"
    elif [[ $WARNING_CHECKS -gt 0 ]]; then
        color="$YELLOW"
        status="WARNING"
    else
        color="$GREEN"
        status="HEALTHY"
    fi
    
    if [[ "$NO_COLOR" == true ]]; then
        color=""
    fi
    
    echo
    echo -e "${color}========================================${NC}"
    echo -e "${color}  CLAUDE-ZEN HEALTH CHECK SUMMARY${NC}"
    echo -e "${color}========================================${NC}"
    echo -e "${color}Status: $status${NC}"
    echo "Timestamp: $(date)"
    echo
    echo "Check Results:"
    echo "  ✓ Passed:   $PASSED_CHECKS"
    echo "  ⚠ Warnings: $WARNING_CHECKS"
    echo "  ✗ Critical: $CRITICAL_CHECKS"
    echo "  ─────────────"
    echo "  Total:      $TOTAL_CHECKS"
    echo
    
    if [[ $CRITICAL_CHECKS -gt 0 ]] || [[ $WARNING_CHECKS -gt 0 ]]; then
        echo "Issues require attention. Check the detailed output above."
        echo "For troubleshooting help, see: docs/deployment/TROUBLESHOOTING.md"
    else
        echo "All systems operational! 🎉"
    fi
    
    echo -e "${color}========================================${NC}"
}

# ==============================================================================
# MAIN EXECUTION FUNCTIONS
# ==============================================================================

run_specific_check() {
    local check_type="$1"
    
    case "$check_type" in
        app|application)
            check_application_health
            ;;
        database|db)
            check_database_health
            ;;
        cache|redis)
            check_cache_health
            ;;
        system)
            check_system_health
            ;;
        network)
            check_network_health
            ;;
        ssl|tls)
            check_ssl_health
            ;;
        services)
            check_services_health
            ;;
        logs)
            check_logs_health
            ;;
        security)
            check_security_health
            ;;
        all)
            check_application_health
            check_database_health
            check_cache_health
            check_system_health
            check_network_health
            check_ssl_health
            check_services_health
            check_logs_health
            check_security_health
            ;;
        *)
            log_error "Unknown check type: $check_type"
            exit 3
            ;;
    esac
}

save_report() {
    local report_file="/tmp/claude-zen-health-report-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Claude-Zen Health Check Report"
        echo "Generated: $(date)"
        echo "Host: $(hostname)"
        echo "User: $(whoami)"
        echo
        
        if [[ "$JSON_OUTPUT" == true ]]; then
            output_json
        else
            # Re-run checks to capture all output
            run_specific_check "${SPECIFIC_CHECK:-all}" 2>&1
            output_summary
        fi
    } > "$report_file"
    
    log_info "Health check report saved to: $report_file"
}

send_webhook_alert() {
    if [[ -z "$ALERT_WEBHOOK" ]]; then
        return
    fi
    
    if [[ $CRITICAL_CHECKS -eq 0 ]] && [[ $WARNING_CHECKS -eq 0 ]]; then
        return  # No alerts needed
    fi
    
    local alert_level="warning"
    if [[ $CRITICAL_CHECKS -gt 0 ]]; then
        alert_level="critical"
    fi
    
    local payload=$(jq -n \
        --arg level "$alert_level" \
        --arg host "$(hostname)" \
        --arg timestamp "$(date -Iseconds)" \
        --argjson critical "$CRITICAL_CHECKS" \
        --argjson warnings "$WARNING_CHECKS" \
        --argjson total "$TOTAL_CHECKS" \
        '{
            alert_level: $level,
            service: "claude-zen",
            host: $host,
            timestamp: $timestamp,
            message: "Health check found \($critical) critical and \($warnings) warning issues out of \($total) total checks",
            critical_count: $critical,
            warning_count: $warnings,
            total_checks: $total
        }')
    
    curl -s -X POST "$ALERT_WEBHOOK" \
         -H "Content-Type: application/json" \
         -d "$payload" &> /dev/null && \
    log_debug "Alert sent to webhook" || \
    log_debug "Failed to send webhook alert"
}

show_help() {
    cat << EOF
Claude-Zen Production Health Check Script

Usage: bash scripts/health-check.sh [options]

Options:
  --help              Show this help message
  --verbose           Enable verbose output (show all checks)
  --quiet             Minimize output (errors only)
  --json              Output results in JSON format
  --nagios            Output in Nagios-compatible format
  --check TYPE        Run specific check only
  --timeout SECONDS   Set timeout for HTTP checks (default: 10)
  --critical          Exit with critical status on any failure
  --no-color          Disable colored output
  --save-report       Save detailed report to file
  --alert-webhook     Send alerts to webhook on failures

Check types:
  app                 Application health (MCP server, web dashboard)
  database            Database connectivity and performance
  cache               Redis cache health
  system              System resources (CPU, memory, disk)
  network             Network connectivity and ports
  ssl                 SSL/TLS certificate status
  services            System services status
  logs                Log analysis for errors
  security            Security configuration checks
  all                 Run all checks (default)

Examples:
  bash scripts/health-check.sh                    # Run all checks
  bash scripts/health-check.sh --json             # JSON output
  bash scripts/health-check.sh --check app        # Only app health
  bash scripts/health-check.sh --verbose          # Show all details
  bash scripts/health-check.sh --critical         # Exit on first failure
  bash scripts/health-check.sh --save-report      # Save report to file
  bash scripts/health-check.sh --nagios           # Nagios format

Exit codes:
  0 = All checks passed
  1 = Warnings found (non-critical issues)
  2 = Critical failures found
  3 = Configuration or script error

For troubleshooting help, see:
  docs/deployment/TROUBLESHOOTING.md
EOF
}

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                exit 0
                ;;
            --verbose|-v)
                VERBOSE=true
                shift
                ;;
            --quiet|-q)
                QUIET=true
                shift
                ;;
            --json|-j)
                JSON_OUTPUT=true
                shift
                ;;
            --nagios|-n)
                NAGIOS_OUTPUT=true
                shift
                ;;
            --check|-c)
                SPECIFIC_CHECK="$2"
                shift 2
                ;;
            --timeout|-t)
                TIMEOUT="$2"
                shift 2
                ;;
            --critical)
                CRITICAL_MODE=true
                shift
                ;;
            --no-color)
                NO_COLOR=true
                RED=""
                GREEN=""
                YELLOW=""
                BLUE=""
                MAGENTA=""
                CYAN=""
                WHITE=""
                NC=""
                shift
                ;;
            --save-report)
                SAVE_REPORT=true
                shift
                ;;
            --alert-webhook)
                ALERT_WEBHOOK="$2"
                shift 2
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 3
                ;;
        esac
    done
}

main() {
    # Parse command line arguments
    parse_arguments "$@"
    
    # Ensure required tools are available
    if [[ "$JSON_OUTPUT" == true ]] && ! command -v jq &> /dev/null; then
        log_error "jq is required for JSON output but not installed"
        exit 3
    fi
    
    # Start health checks
    if [[ "$QUIET" != true ]]; then
        if [[ "$NO_COLOR" == true ]]; then
            echo "Starting Claude-Zen health checks..."
        else
            echo -e "${BLUE}Starting Claude-Zen health checks...${NC}"
        fi
    fi
    
    # Run checks
    run_specific_check "${SPECIFIC_CHECK:-all}"
    
    # Output results
    if [[ "$JSON_OUTPUT" == true ]]; then
        output_json
    elif [[ "$NAGIOS_OUTPUT" == true ]]; then
        output_nagios
    else
        output_summary
    fi
    
    # Save report if requested
    if [[ "$SAVE_REPORT" == true ]]; then
        save_report
    fi
    
    # Send webhook alert if configured
    send_webhook_alert
    
    # Determine exit code
    local exit_code=0
    if [[ $CRITICAL_CHECKS -gt 0 ]]; then
        exit_code=2
    elif [[ $WARNING_CHECKS -gt 0 ]]; then
        exit_code=1
    fi
    
    exit $exit_code
}

# ==============================================================================
# SCRIPT EXECUTION
# ==============================================================================

# Run main function with all arguments
main "$@"