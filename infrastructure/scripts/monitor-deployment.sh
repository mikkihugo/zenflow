#!/bin/bash
# Deployment Monitoring Script
# Real-time monitoring of deployment health and performance

set -euo pipefail

# Configuration
MONITOR_INTERVAL=10  # seconds
ERROR_THRESHOLD=5    # consecutive errors before alert
CPU_THRESHOLD=80     # percentage
MEMORY_THRESHOLD=85  # percentage
RESPONSE_TIME_THRESHOLD=500  # milliseconds

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Monitoring data
declare -A error_counts
declare -A response_times
declare -A cpu_usage
declare -A memory_usage

# Function to log with timestamp and color
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[${timestamp}]${NC} ${message}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[${timestamp}]${NC} ✓ ${message}"
            ;;
        "WARNING")
            echo -e "${YELLOW}[${timestamp}]${NC} ⚠ ${message}"
            ;;
        "ERROR")
            echo -e "${RED}[${timestamp}]${NC} ✗ ${message}"
            ;;
    esac
}

# Function to check service health
check_service_health() {
    local namespace=$1
    local service=$2
    local endpoint="/health"
    
    # Get service endpoint
    local service_ip=$(kubectl get service $service -n $namespace -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
    local service_port=$(kubectl get service $service -n $namespace -o jsonpath='{.spec.ports[0].port}' 2>/dev/null)
    
    if [[ -z "$service_ip" || -z "$service_port" ]]; then
        return 1
    fi
    
    # Make health check request through a pod
    local start_time=$(date +%s%N)
    local response=$(kubectl run health-check-$RANDOM \
        --image=curlimages/curl:latest \
        --rm -i --restart=Never \
        --command -- curl -sf "http://${service_ip}:${service_port}${endpoint}" 2>/dev/null)
    local end_time=$(date +%s%N)
    
    if [[ $? -eq 0 ]]; then
        local duration=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds
        response_times[$service]=$duration
        error_counts[$service]=0
        return 0
    else
        ((error_counts[$service]++))
        return 1
    fi
}

# Function to get pod metrics
get_pod_metrics() {
    local namespace=$1
    local service=$2
    
    # Get pods for the service
    local pods=$(kubectl get pods -n $namespace -l app=$service -o jsonpath='{.items[*].metadata.name}')
    
    if [[ -z "$pods" ]]; then
        return 1
    fi
    
    local total_cpu=0
    local total_memory=0
    local pod_count=0
    
    for pod in $pods; do
        # Get CPU and memory usage
        local metrics=$(kubectl top pod $pod -n $namespace --no-headers 2>/dev/null || echo "0m 0Mi")
        if [[ -n "$metrics" ]]; then
            local cpu=$(echo $metrics | awk '{print $2}' | sed 's/m//')
            local memory=$(echo $metrics | awk '{print $3}' | sed 's/Mi//')
            
            total_cpu=$((total_cpu + cpu))
            total_memory=$((total_memory + memory))
            pod_count=$((pod_count + 1))
        fi
    done
    
    if [[ $pod_count -gt 0 ]]; then
        cpu_usage[$service]=$((total_cpu / pod_count))
        memory_usage[$service]=$((total_memory / pod_count))
        return 0
    else
        return 1
    fi
}

# Function to check database health
check_database_health() {
    local namespace=$1
    local service=$2
    
    # Get database connection count
    local db_secret=$(kubectl get secret -n $namespace -l app=$service,component=database -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [[ -z "$db_secret" ]]; then
        return 1
    fi
    
    # Check database connectivity (simplified - in real scenario, use proper DB client)
    kubectl run db-check-$RANDOM \
        --image=postgres:15-alpine \
        --rm -i --restart=Never \
        --env="PGPASSWORD=$(kubectl get secret $db_secret -n $namespace -o jsonpath='{.data.password}' | base64 -d)" \
        --command -- psql -h $(kubectl get secret $db_secret -n $namespace -o jsonpath='{.data.host}' | base64 -d) \
        -U $(kubectl get secret $db_secret -n $namespace -o jsonpath='{.data.username}' | base64 -d) \
        -d $(kubectl get secret $db_secret -n $namespace -o jsonpath='{.data.database}' | base64 -d) \
        -c "SELECT 1" &>/dev/null
    
    return $?
}

# Function to display monitoring dashboard
display_dashboard() {
    clear
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}║          Vision-to-Code Deployment Monitor                    ║${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "Environment: ${YELLOW}$1${NC} | Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${BLUE}───────────────────────────────────────────────────────────────${NC}"
    
    # Service status table
    printf "%-20s %-10s %-15s %-10s %-10s %-15s\n" "Service" "Status" "Response (ms)" "CPU (m)" "Memory (Mi)" "Errors"
    echo -e "${BLUE}───────────────────────────────────────────────────────────────${NC}"
    
    for service in "${!error_counts[@]}"; do
        local status="${GREEN}✓ Healthy${NC}"
        local response="${response_times[$service]:-N/A}"
        local cpu="${cpu_usage[$service]:-N/A}"
        local memory="${memory_usage[$service]:-N/A}"
        local errors="${error_counts[$service]}"
        
        # Check thresholds
        if [[ $errors -ge $ERROR_THRESHOLD ]]; then
            status="${RED}✗ Unhealthy${NC}"
        elif [[ "$response" != "N/A" && $response -gt $RESPONSE_TIME_THRESHOLD ]]; then
            status="${YELLOW}⚠ Slow${NC}"
        elif [[ "$cpu" != "N/A" && $cpu -gt $((CPU_THRESHOLD * 10)) ]]; then
            status="${YELLOW}⚠ High CPU${NC}"
        elif [[ "$memory" != "N/A" && $memory -gt $((MEMORY_THRESHOLD * 10)) ]]; then
            status="${YELLOW}⚠ High Memory${NC}"
        fi
        
        printf "%-20s %-20b %-15s %-10s %-10s %-15s\n" "$service" "$status" "$response" "$cpu" "$memory" "$errors"
    done
    
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
}

# Function to send alert
send_alert() {
    local service=$1
    local issue=$2
    local details=$3
    
    log "ERROR" "ALERT: $service - $issue: $details"
    
    # Send to monitoring system (example with curl to webhook)
    if [[ -n "${ALERT_WEBHOOK:-}" ]]; then
        curl -X POST "$ALERT_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{\"service\":\"$service\",\"issue\":\"$issue\",\"details\":\"$details\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
            &>/dev/null
    fi
}

# Function to monitor deployment
monitor_deployment() {
    local environment=$1
    local duration=${2:-600}  # Default 10 minutes
    local namespace="vision-to-code-${environment}"
    
    log "INFO" "Starting deployment monitoring for $environment (${duration}s)"
    
    # Initialize services
    local services=("business-service" "core-service" "swarm-service" "development-service")
    for service in "${services[@]}"; do
        error_counts[$service]=0
        response_times[$service]=0
        cpu_usage[$service]=0
        memory_usage[$service]=0
    done
    
    # Monitoring loop
    local start_time=$(date +%s)
    local iteration=0
    
    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [[ $elapsed -ge $duration ]]; then
            log "SUCCESS" "Monitoring completed after ${duration}s"
            break
        fi
        
        # Check each service
        for service in "${services[@]}"; do
            # Health check
            if ! check_service_health $namespace $service; then
                if [[ ${error_counts[$service]} -ge $ERROR_THRESHOLD ]]; then
                    send_alert $service "Service Unhealthy" "Failed $ERROR_THRESHOLD consecutive health checks"
                fi
            fi
            
            # Get metrics
            get_pod_metrics $namespace $service
            
            # Check thresholds
            if [[ ${cpu_usage[$service]:-0} -gt $((CPU_THRESHOLD * 10)) ]]; then
                send_alert $service "High CPU Usage" "${cpu_usage[$service]}m exceeds threshold"
            fi
            
            if [[ ${memory_usage[$service]:-0} -gt $((MEMORY_THRESHOLD * 10)) ]]; then
                send_alert $service "High Memory Usage" "${memory_usage[$service]}Mi exceeds threshold"
            fi
            
            if [[ ${response_times[$service]:-0} -gt $RESPONSE_TIME_THRESHOLD ]]; then
                send_alert $service "Slow Response Time" "${response_times[$service]}ms exceeds threshold"
            fi
        done
        
        # Check database health
        for service in "${services[@]}"; do
            if ! check_database_health $namespace $service; then
                send_alert $service "Database Connection Failed" "Unable to connect to database"
            fi
        done
        
        # Display dashboard every 3 iterations (30 seconds)
        if [[ $((iteration % 3)) -eq 0 ]]; then
            display_dashboard $environment
        fi
        
        iteration=$((iteration + 1))
        sleep $MONITOR_INTERVAL
    done
    
    # Final summary
    echo -e "\n${BLUE}Monitoring Summary${NC}"
    echo -e "${BLUE}───────────────────────────────────────────────────────────────${NC}"
    
    local total_errors=0
    for service in "${!error_counts[@]}"; do
        total_errors=$((total_errors + error_counts[$service]))
        if [[ ${error_counts[$service]} -gt 0 ]]; then
            log "WARNING" "$service had ${error_counts[$service]} errors during monitoring"
        fi
    done
    
    if [[ $total_errors -eq 0 ]]; then
        log "SUCCESS" "No errors detected during monitoring period"
        return 0
    else
        log "WARNING" "Total errors detected: $total_errors"
        return 1
    fi
}

# Main function
main() {
    local environment=${1:-""}
    local duration=${2:-600}
    
    if [[ -z "$environment" ]]; then
        echo "Usage: $0 {staging|production} [duration-seconds]"
        echo ""
        echo "Monitor deployment health and performance in real-time"
        echo ""
        echo "Examples:"
        echo "  $0 staging 300        # Monitor staging for 5 minutes"
        echo "  $0 production 3600    # Monitor production for 1 hour"
        exit 1
    fi
    
    # Check prerequisites
    if ! command -v kubectl &> /dev/null; then
        log "ERROR" "kubectl is not installed"
        exit 1
    fi
    
    # Update kubeconfig
    aws eks update-kubeconfig --region us-east-1 --name "vision-to-code-${environment}" 2>/dev/null || true
    
    # Start monitoring
    monitor_deployment $environment $duration
}

# Handle interrupts
trap 'echo -e "\n${YELLOW}Monitoring interrupted${NC}"; exit 0' INT TERM

# Execute main
main "$@"