#!/bin/bash
# Smoke Tests for Vision-to-Code Deployment
# Quick validation of basic functionality after deployment

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_TIMEOUT=30
RETRY_COUNT=3
RETRY_DELAY=5

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results
declare -A test_results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to log test results
log_test() {
    local test_name=$1
    local status=$2
    local message=${3:-""}
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [[ "$status" == "PASS" ]]; then
        echo -e "${GREEN}✓${NC} $test_name"
        test_results[$test_name]="PASS"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗${NC} $test_name"
        if [[ -n "$message" ]]; then
            echo -e "  ${RED}Error: $message${NC}"
        fi
        test_results[$test_name]="FAIL: $message"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to make HTTP request with retries
http_request() {
    local method=$1
    local url=$2
    local expected_status=$3
    local data=${4:-""}
    
    for i in $(seq 1 $RETRY_COUNT); do
        if [[ -n "$data" ]]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$url" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $API_TOKEN" \
                -d "$data" \
                --connect-timeout 5 \
                --max-time $TEST_TIMEOUT || echo "000")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$url" \
                -H "Authorization: Bearer $API_TOKEN" \
                --connect-timeout 5 \
                --max-time $TEST_TIMEOUT || echo "000")
        fi
        
        status_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | sed '$d')
        
        if [[ "$status_code" == "$expected_status" ]]; then
            echo "$body"
            return 0
        fi
        
        if [[ $i -lt $RETRY_COUNT ]]; then
            sleep $RETRY_DELAY
        fi
    done
    
    echo "HTTP request failed: Status $status_code (expected $expected_status)"
    return 1
}

# Test: Health Check Endpoints
test_health_checks() {
    echo -e "\n${BLUE}Testing Health Check Endpoints...${NC}"
    
    local services=("business" "core" "swarm" "development")
    
    for service in "${services[@]}"; do
        if response=$(http_request GET "$BASE_URL/api/v1/$service/health" 200); then
            # Verify response contains expected fields
            if echo "$response" | jq -e '.status == "healthy"' > /dev/null 2>&1; then
                log_test "Health Check: $service-service" "PASS"
            else
                log_test "Health Check: $service-service" "FAIL" "Invalid health response format"
            fi
        else
            log_test "Health Check: $service-service" "FAIL" "$response"
        fi
    done
}

# Test: API Authentication
test_api_authentication() {
    echo -e "\n${BLUE}Testing API Authentication...${NC}"
    
    # Test with valid token (already set in API_TOKEN)
    if response=$(http_request GET "$BASE_URL/api/v1/core/status" 200); then
        log_test "API Authentication: Valid Token" "PASS"
    else
        log_test "API Authentication: Valid Token" "FAIL" "$response"
    fi
    
    # Test with invalid token
    local original_token=$API_TOKEN
    API_TOKEN="invalid-token-12345"
    
    if response=$(http_request GET "$BASE_URL/api/v1/core/status" 401); then
        log_test "API Authentication: Invalid Token Rejection" "PASS"
    else
        log_test "API Authentication: Invalid Token Rejection" "FAIL" "Expected 401, got different response"
    fi
    
    API_TOKEN=$original_token
}

# Test: Create Vision Workflow
test_create_vision() {
    echo -e "\n${BLUE}Testing Vision Creation Workflow...${NC}"
    
    local vision_data='{
        "title": "Smoke Test Vision",
        "description": "Automated test vision for deployment validation",
        "objectives": ["Test objective 1", "Test objective 2"],
        "constraints": ["Time: 1 hour", "Budget: $0"]
    }'
    
    # Create vision
    if response=$(http_request POST "$BASE_URL/api/v1/business/visions" 201 "$vision_data"); then
        VISION_ID=$(echo "$response" | jq -r '.id')
        if [[ -n "$VISION_ID" && "$VISION_ID" != "null" ]]; then
            log_test "Vision Creation" "PASS"
            echo "$VISION_ID" > /tmp/test_vision_id
        else
            log_test "Vision Creation" "FAIL" "No vision ID returned"
        fi
    else
        log_test "Vision Creation" "FAIL" "$response"
    fi
}

# Test: Service Discovery
test_service_discovery() {
    echo -e "\n${BLUE}Testing Service Discovery...${NC}"
    
    if response=$(http_request GET "$BASE_URL/api/v1/core/services" 200); then
        # Check if all required services are registered
        local required_services=("business-service" "core-service" "swarm-service" "development-service")
        local all_found=true
        
        for service in "${required_services[@]}"; do
            if ! echo "$response" | jq -e ".services[] | select(.name == \"$service\")" > /dev/null 2>&1; then
                all_found=false
                break
            fi
        done
        
        if [[ "$all_found" == "true" ]]; then
            log_test "Service Discovery" "PASS"
        else
            log_test "Service Discovery" "FAIL" "Not all services are registered"
        fi
    else
        log_test "Service Discovery" "FAIL" "$response"
    fi
}

# Test: Swarm Agent Spawning
test_swarm_agents() {
    echo -e "\n${BLUE}Testing Swarm Agent Management...${NC}"
    
    # Get current agent count
    if response=$(http_request GET "$BASE_URL/api/v1/swarm/agents/status" 200); then
        initial_count=$(echo "$response" | jq -r '.active_agents // 0')
        
        # Spawn a test agent
        local agent_data='{
            "type": "researcher",
            "name": "smoke-test-agent",
            "task": "Validate deployment"
        }'
        
        if spawn_response=$(http_request POST "$BASE_URL/api/v1/swarm/agents" 201 "$agent_data"); then
            AGENT_ID=$(echo "$spawn_response" | jq -r '.id')
            
            # Wait for agent to become active
            sleep 3
            
            # Verify agent count increased
            if status_response=$(http_request GET "$BASE_URL/api/v1/swarm/agents/status" 200); then
                new_count=$(echo "$status_response" | jq -r '.active_agents // 0')
                
                if [[ $new_count -gt $initial_count ]]; then
                    log_test "Swarm Agent Spawning" "PASS"
                    
                    # Cleanup: terminate the test agent
                    http_request DELETE "$BASE_URL/api/v1/swarm/agents/$AGENT_ID" 200 > /dev/null 2>&1
                else
                    log_test "Swarm Agent Spawning" "FAIL" "Agent count did not increase"
                fi
            else
                log_test "Swarm Agent Spawning" "FAIL" "Could not get agent status"
            fi
        else
            log_test "Swarm Agent Spawning" "FAIL" "$spawn_response"
        fi
    else
        log_test "Swarm Agent Spawning" "FAIL" "Could not get initial agent status"
    fi
}

# Test: Database Connectivity
test_database_connectivity() {
    echo -e "\n${BLUE}Testing Database Connectivity...${NC}"
    
    # Test database health through service endpoints
    local services=("business" "core" "swarm" "development")
    
    for service in "${services[@]}"; do
        if response=$(http_request GET "$BASE_URL/api/v1/$service/db/health" 200); then
            if echo "$response" | jq -e '.connected == true' > /dev/null 2>&1; then
                log_test "Database Connectivity: $service" "PASS"
            else
                log_test "Database Connectivity: $service" "FAIL" "Database not connected"
            fi
        else
            log_test "Database Connectivity: $service" "FAIL" "$response"
        fi
    done
}

# Test: Cache Connectivity
test_cache_connectivity() {
    echo -e "\n${BLUE}Testing Cache (Redis) Connectivity...${NC}"
    
    # Test cache through core service
    local test_key="smoke-test-$(date +%s)"
    local test_value="test-value-$RANDOM"
    
    # Set value in cache
    local cache_data="{\"key\": \"$test_key\", \"value\": \"$test_value\", \"ttl\": 60}"
    
    if response=$(http_request POST "$BASE_URL/api/v1/core/cache" 200 "$cache_data"); then
        # Get value from cache
        if get_response=$(http_request GET "$BASE_URL/api/v1/core/cache/$test_key" 200); then
            retrieved_value=$(echo "$get_response" | jq -r '.value')
            
            if [[ "$retrieved_value" == "$test_value" ]]; then
                log_test "Cache Connectivity" "PASS"
                
                # Cleanup
                http_request DELETE "$BASE_URL/api/v1/core/cache/$test_key" 200 > /dev/null 2>&1
            else
                log_test "Cache Connectivity" "FAIL" "Retrieved value does not match"
            fi
        else
            log_test "Cache Connectivity" "FAIL" "Could not retrieve from cache"
        fi
    else
        log_test "Cache Connectivity" "FAIL" "Could not set cache value"
    fi
}

# Test: API Rate Limiting
test_rate_limiting() {
    echo -e "\n${BLUE}Testing API Rate Limiting...${NC}"
    
    # Make rapid requests to trigger rate limit
    local endpoint="$BASE_URL/api/v1/core/status"
    local rate_limited=false
    
    for i in {1..150}; do
        status_code=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$endpoint" \
            -H "Authorization: Bearer $API_TOKEN" \
            --connect-timeout 1 \
            --max-time 2)
        
        if [[ "$status_code" == "429" ]]; then
            rate_limited=true
            break
        fi
    done
    
    if [[ "$rate_limited" == "true" ]]; then
        log_test "API Rate Limiting" "PASS"
    else
        log_test "API Rate Limiting" "FAIL" "Rate limit not enforced"
    fi
}

# Test: Metrics Endpoint
test_metrics_endpoint() {
    echo -e "\n${BLUE}Testing Metrics Collection...${NC}"
    
    if response=$(http_request GET "$BASE_URL/metrics" 200); then
        # Check for standard Prometheus metrics
        if echo "$response" | grep -q "# TYPE" && echo "$response" | grep -q "# HELP"; then
            log_test "Metrics Endpoint" "PASS"
        else
            log_test "Metrics Endpoint" "FAIL" "Invalid metrics format"
        fi
    else
        log_test "Metrics Endpoint" "FAIL" "$response"
    fi
}

# Function to generate test report
generate_report() {
    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}          SMOKE TEST REPORT                 ${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    
    echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
    echo -e "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "Base URL: $BASE_URL"
    echo -e "\nTest Results:"
    echo -e "Total Tests: $TOTAL_TESTS"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    
    if [[ $FAILED_TESTS -gt 0 ]]; then
        echo -e "\n${RED}Failed Tests:${NC}"
        for test_name in "${!test_results[@]}"; do
            if [[ "${test_results[$test_name]}" != "PASS" ]]; then
                echo -e "  - $test_name: ${test_results[$test_name]}"
            fi
        done
    fi
    
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    
    # Save report to file
    local report_file="/tmp/smoke-test-report-$(date +%Y%m%d-%H%M%S).json"
    jq -n \
        --arg env "$ENVIRONMENT" \
        --arg url "$BASE_URL" \
        --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --arg total "$TOTAL_TESTS" \
        --arg passed "$PASSED_TESTS" \
        --arg failed "$FAILED_TESTS" \
        --argjson results "$(echo '{}' | jq --arg k "$test_name" --arg v "${test_results[$test_name]}" '. + {($k): $v}' | for test_name in "${!test_results[@]}"; do jq --arg k "$test_name" --arg v "${test_results[$test_name]}" '. + {($k): $v}'; done)" \
        '{
            environment: $env,
            base_url: $url,
            timestamp: $timestamp,
            summary: {
                total: ($total | tonumber),
                passed: ($passed | tonumber),
                failed: ($failed | tonumber)
            },
            results: $results
        }' > "$report_file"
    
    echo -e "\nReport saved to: $report_file"
}

# Main function
main() {
    local environment=${1:-""}
    
    if [[ -z "$environment" ]]; then
        echo "Usage: $0 {staging|production}"
        echo ""
        echo "Run smoke tests against deployed environment"
        exit 1
    fi
    
    # Set environment-specific variables
    case $environment in
        "staging")
            BASE_URL="https://staging-api.vision-to-code.com"
            API_TOKEN="${STAGING_API_TOKEN:-test-token}"
            ;;
        "production")
            BASE_URL="https://api.vision-to-code.com"
            API_TOKEN="${PRODUCTION_API_TOKEN:-prod-token}"
            ;;
        *)
            echo "Invalid environment: $environment"
            exit 1
            ;;
    esac
    
    ENVIRONMENT=$environment
    
    echo -e "${BLUE}Starting Smoke Tests for $ENVIRONMENT${NC}"
    echo -e "Base URL: $BASE_URL\n"
    
    # Run all tests
    test_health_checks
    test_api_authentication
    test_service_discovery
    test_create_vision
    test_swarm_agents
    test_database_connectivity
    test_cache_connectivity
    test_rate_limiting
    test_metrics_endpoint
    
    # Generate report
    generate_report
    
    # Exit with appropriate code
    if [[ $FAILED_TESTS -eq 0 ]]; then
        echo -e "\n${GREEN}✓ All smoke tests passed!${NC}"
        exit 0
    else
        echo -e "\n${RED}✗ Some smoke tests failed!${NC}"
        exit 1
    fi
}

# Execute main
main "$@"