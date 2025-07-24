#!/bin/bash
# Vision-to-Code Service Integration Test Script

echo "🧪 Testing Vision-to-Code Service Endpoints"
echo "==========================================="

# Test configuration
BUSINESS_SERVICE="http://localhost:4106"
CORE_SERVICE="http://localhost:4105"
SWARM_SERVICE="http://localhost:4108"
DEVELOPMENT_SERVICE="http://localhost:4103"

success=0
total=0

# Function to test endpoint
test_endpoint() {
    local service_name="$1"
    local url="$2"
    local endpoint="$3"
    local expected_status="$4"
    
    echo -n "Testing $service_name $endpoint: "
    total=$((total + 1))
    
    response=$(curl -s -w "%{http_code}" "$url$endpoint" -o /tmp/test_response)
    http_code="${response: -3}"
    
    if [ "$http_code" = "$expected_status" ]; then
        echo "✅ PASS ($http_code)"
        success=$((success + 1))
        if [ "$endpoint" = "/health" ] || [ "$endpoint" = "/info" ] || [ "$endpoint" = "/status" ]; then
            echo "   Response: $(cat /tmp/test_response | jq -c .)"
        fi
    else
        echo "❌ FAIL ($http_code)"
        echo "   Expected: $expected_status, Got: $http_code"
        if [ -f /tmp/test_response ]; then
            echo "   Response: $(cat /tmp/test_response)"
        fi
    fi
}

echo ""
echo "🔍 Health Check Tests"
echo "--------------------"
test_endpoint "Business Service" "$BUSINESS_SERVICE" "/health" "200"
test_endpoint "Core Service" "$CORE_SERVICE" "/health" "200"
test_endpoint "Swarm Service" "$SWARM_SERVICE" "/health" "200"
test_endpoint "Development Service" "$DEVELOPMENT_SERVICE" "/health" "200"

echo ""
echo "📋 Service Info Tests"
echo "--------------------"
test_endpoint "Business Service" "$BUSINESS_SERVICE" "/info" "200"
test_endpoint "Core Service" "$CORE_SERVICE" "/info" "200"
test_endpoint "Swarm Service" "$SWARM_SERVICE" "/info" "200"
test_endpoint "Development Service" "$DEVELOPMENT_SERVICE" "/info" "200"

echo ""
echo "📊 Service Status Tests"
echo "----------------------"
test_endpoint "Business Service" "$BUSINESS_SERVICE" "/status" "200"
test_endpoint "Core Service" "$CORE_SERVICE" "/status" "200"
test_endpoint "Swarm Service" "$SWARM_SERVICE" "/status" "200"
test_endpoint "Development Service" "$DEVELOPMENT_SERVICE" "/status" "200"

echo ""
echo "🚫 Error Handling Tests"
echo "----------------------"
test_endpoint "Business Service" "$BUSINESS_SERVICE" "/nonexistent" "404"
test_endpoint "Core Service" "$CORE_SERVICE" "/invalid" "404"

echo ""
echo "🌐 Service Discovery Test"
echo "------------------------"
echo "Checking if all services can communicate..."

# Check port connectivity
echo -n "Business Service (4106): "
if nc -z localhost 4106 2>/dev/null; then
    echo "✅ Reachable"
else
    echo "❌ Unreachable"
fi

echo -n "Core Service (4105): "
if nc -z localhost 4105 2>/dev/null; then
    echo "✅ Reachable"
else
    echo "❌ Unreachable"
fi

echo -n "Swarm Service (4108): "
if nc -z localhost 4108 2>/dev/null; then
    echo "✅ Reachable"
else
    echo "❌ Unreachable"
fi

echo -n "Development Service (4103): "
if nc -z localhost 4103 2>/dev/null; then
    echo "✅ Reachable"
else
    echo "❌ Unreachable"
fi

echo ""
echo "📈 Test Summary"
echo "==============="
echo "Tests passed: $success/$total"

if [ $success -eq $total ]; then
    echo "🎉 All tests passed! Vision-to-Code services are ready for integration testing."
    exit 0
else
    echo "⚠️  Some tests failed. Check the logs above for details."
    exit 1
fi

# Cleanup
rm -f /tmp/test_response