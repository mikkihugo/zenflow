#!/bin/bash
# Vision-to-Code Deployment Script
# Zero-downtime deployment with health checks and rollback capability

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR"))"
HELM_CHART_DIR="${ROOT_DIR}/infrastructure/helm/vision-to-code"
TIMEOUT="900" # 15 minutes

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[${timestamp}] [INFO]${NC} ${message}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[${timestamp}] [SUCCESS]${NC} ${message}"
            ;;
        "WARNING")
            echo -e "${YELLOW}[${timestamp}] [WARNING]${NC} ${message}"
            ;;
        "ERROR")
            echo -e "${RED}[${timestamp}] [ERROR]${NC} ${message}"
            ;;
    esac
}

# Function to check prerequisites
check_prerequisites() {
    log "INFO" "Checking prerequisites..."
    
    local required_tools=("kubectl" "helm" "aws" "jq")
    for tool in "${required_tools[@]}"; do
        if ! command -v $tool &> /dev/null; then
            log "ERROR" "$tool is not installed"
            exit 1
        fi
    done
    
    log "SUCCESS" "All prerequisites met"
}

# Function to validate environment
validate_environment() {
    local environment=$1
    
    if [[ ! "$environment" =~ ^(staging|production)$ ]]; then
        log "ERROR" "Invalid environment: $environment. Must be 'staging' or 'production'"
        exit 1
    fi
}

# Function to get current deployment
get_current_deployment() {
    local namespace=$1
    local release_name=$2
    
    helm get values $release_name -n $namespace 2>/dev/null | jq -r '.global.deploymentColor // "blue"'
}

# Function to determine new deployment color
get_new_deployment_color() {
    local current_color=$1
    
    if [[ "$current_color" == "blue" ]]; then
        echo "green"
    else
        echo "blue"
    fi
}

# Function to wait for deployment
wait_for_deployment() {
    local namespace=$1
    local deployment_color=$2
    local timeout=$3
    
    log "INFO" "Waiting for deployment to be ready (timeout: ${timeout}s)..."
    
    local start_time=$(date +%s)
    while true; do
        local ready_replicas=$(kubectl get deployment -n $namespace -l deployment-color=$deployment_color -o json | jq '[.items[].status.readyReplicas // 0] | add')
        local desired_replicas=$(kubectl get deployment -n $namespace -l deployment-color=$deployment_color -o json | jq '[.items[].spec.replicas // 0] | add')
        
        if [[ $ready_replicas -eq $desired_replicas && $desired_replicas -gt 0 ]]; then
            log "SUCCESS" "All pods are ready ($ready_replicas/$desired_replicas)"
            break
        fi
        
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [[ $elapsed -gt $timeout ]]; then
            log "ERROR" "Deployment timed out after ${timeout}s"
            return 1
        fi
        
        log "INFO" "Waiting... ($ready_replicas/$desired_replicas ready, ${elapsed}s elapsed)"
        sleep 10
    done
}

# Function to run health checks
run_health_checks() {
    local namespace=$1
    local deployment_color=$2
    
    log "INFO" "Running health checks..."
    
    local services=("business-service" "core-service" "swarm-service" "development-service")
    local all_healthy=true
    
    for service in "${services[@]}"; do
        local pod_name=$(kubectl get pod -n $namespace -l app=$service,deployment-color=$deployment_color -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
        
        if [[ -z "$pod_name" ]]; then
            log "ERROR" "No pod found for $service"
            all_healthy=false
            continue
        fi
        
        # Check pod health endpoint
        if kubectl exec -n $namespace $pod_name -- curl -sf http://localhost:4000/health > /dev/null 2>&1; then
            log "SUCCESS" "$service is healthy"
        else
            log "ERROR" "$service health check failed"
            all_healthy=false
        fi
    done
    
    if [[ "$all_healthy" == "true" ]]; then
        log "SUCCESS" "All services are healthy"
        return 0
    else
        log "ERROR" "Some services are unhealthy"
        return 1
    fi
}

# Function to switch traffic
switch_traffic() {
    local namespace=$1
    local new_color=$2
    
    log "INFO" "Switching traffic to $new_color deployment..."
    
    # Update service selectors
    local services=("business-service" "core-service" "swarm-service" "development-service")
    
    for service in "${services[@]}"; do
        kubectl patch service $service -n $namespace -p "{\"spec\":{\"selector\":{\"deployment-color\":\"$new_color\"}}}"
        log "SUCCESS" "Switched $service to $new_color"
    done
    
    # Update ingress if using blue-green at ingress level
    kubectl patch ingress vision-to-code -n $namespace -p "{\"spec\":{\"rules\":[{\"http\":{\"paths\":[{\"backend\":{\"service\":{\"name\":\"vision-to-code-$new_color\"}}}]}}]}}"
}

# Function to cleanup old deployment
cleanup_old_deployment() {
    local namespace=$1
    local old_color=$2
    local keep_previous=$3
    
    if [[ "$keep_previous" == "true" ]]; then
        log "INFO" "Keeping previous $old_color deployment for rollback capability"
    else
        log "INFO" "Cleaning up old $old_color deployment..."
        kubectl delete deployment -n $namespace -l deployment-color=$old_color
        log "SUCCESS" "Cleaned up $old_color deployment"
    fi
}

# Function to perform deployment
perform_deployment() {
    local environment=$1
    local image_tag=$2
    local dry_run=${3:-false}
    
    # Set namespace and cluster based on environment
    local namespace="vision-to-code-${environment}"
    local cluster_name="vision-to-code-${environment}"
    local release_name="vision-to-code"
    
    log "INFO" "Starting deployment to $environment environment"
    
    # Update kubeconfig
    log "INFO" "Updating kubeconfig for cluster: $cluster_name"
    aws eks update-kubeconfig --region us-east-1 --name $cluster_name
    
    # Get current deployment color
    local current_color=$(get_current_deployment $namespace $release_name)
    local new_color=$(get_new_deployment_color $current_color)
    
    log "INFO" "Current deployment: $current_color, New deployment: $new_color"
    
    # Prepare Helm values
    local helm_args=(
        "upgrade"
        "--install"
        "${release_name}-${new_color}"
        "$HELM_CHART_DIR"
        "--namespace" "$namespace"
        "--create-namespace"
        "--values" "${HELM_CHART_DIR}/values.yaml"
        "--values" "${HELM_CHART_DIR}/values-${environment}.yaml"
        "--set" "global.deploymentColor=$new_color"
        "--set" "global.imageTag=$image_tag"
        "--wait"
        "--timeout" "${TIMEOUT}s"
    )
    
    if [[ "$dry_run" == "true" ]]; then
        helm_args+=("--dry-run")
    fi
    
    # Deploy new version
    log "INFO" "Deploying new version with Helm..."
    helm "${helm_args[@]}"
    
    if [[ "$dry_run" == "true" ]]; then
        log "INFO" "Dry run completed successfully"
        return 0
    fi
    
    # Wait for deployment to be ready
    if ! wait_for_deployment $namespace $new_color $TIMEOUT; then
        log "ERROR" "Deployment failed to become ready"
        return 1
    fi
    
    # Run health checks
    if ! run_health_checks $namespace $new_color; then
        log "ERROR" "Health checks failed"
        return 1
    fi
    
    # Switch traffic to new deployment
    switch_traffic $namespace $new_color
    
    log "SUCCESS" "Traffic switched to $new_color deployment"
    
    # Monitor for stability (5 minutes)
    log "INFO" "Monitoring deployment stability for 5 minutes..."
    sleep 300
    
    # Final health check
    if ! run_health_checks $namespace $new_color; then
        log "ERROR" "Post-deployment health checks failed"
        return 1
    fi
    
    # Cleanup old deployment
    cleanup_old_deployment $namespace $current_color true
    
    log "SUCCESS" "Deployment completed successfully!"
}

# Function to rollback deployment
rollback_deployment() {
    local environment=$1
    
    local namespace="vision-to-code-${environment}"
    local release_name="vision-to-code"
    
    log "WARNING" "Starting rollback for $environment environment"
    
    # Get current deployment color
    local current_color=$(get_current_deployment $namespace $release_name)
    local previous_color=$(get_new_deployment_color $current_color)
    
    log "INFO" "Rolling back from $current_color to $previous_color"
    
    # Check if previous deployment exists
    if ! kubectl get deployment -n $namespace -l deployment-color=$previous_color &> /dev/null; then
        log "ERROR" "No previous deployment found for rollback"
        return 1
    fi
    
    # Switch traffic back
    switch_traffic $namespace $previous_color
    
    # Verify rollback
    if run_health_checks $namespace $previous_color; then
        log "SUCCESS" "Rollback completed successfully"
        # Remove failed deployment
        cleanup_old_deployment $namespace $current_color false
    else
        log "ERROR" "Rollback failed - manual intervention required"
        return 1
    fi
}

# Main function
main() {
    local command=${1:-""}
    local environment=${2:-""}
    local image_tag=${3:-"latest"}
    
    case $command in
        "deploy")
            check_prerequisites
            validate_environment $environment
            perform_deployment $environment $image_tag
            ;;
        "rollback")
            check_prerequisites
            validate_environment $environment
            rollback_deployment $environment
            ;;
        "dry-run")
            check_prerequisites
            validate_environment $environment
            perform_deployment $environment $image_tag true
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|dry-run} {staging|production} [image-tag]"
            echo ""
            echo "Commands:"
            echo "  deploy    - Deploy new version with zero-downtime"
            echo "  rollback  - Rollback to previous version"
            echo "  dry-run   - Simulate deployment without making changes"
            echo ""
            echo "Examples:"
            echo "  $0 deploy staging v1.2.3"
            echo "  $0 rollback production"
            echo "  $0 dry-run staging latest"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"