#!/usr/bin/env bash
# Enhanced Claude Code Hook: Performance Tracking
# Tracks operation performance and generates optimization suggestions

# Parse JSON input from Claude Code
INPUT="$1"
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')
OPERATION_TYPE=$(echo "$INPUT" | jq -r '.tool_input.operation_type // ""')
OPERATION_ID=$(echo "$INPUT" | jq -r '.tool_input.operation_id // ""')
START_TIME=$(echo "$INPUT" | jq -r '.tool_input.start_time // ""')
END_TIME=$(echo "$INPUT" | jq -r '.tool_input.end_time // ""')
SUCCESS=$(echo "$INPUT" | jq -r '.tool_input.success // "true"')
ERROR_TYPE=$(echo "$INPUT" | jq -r '.tool_input.error_type // ""')

# Create log directory
mkdir -p "$HOME/.claude/enhanced-hooks/metrics"

# Log performance tracking
echo "$(date -Iseconds): Performance tracking for $TOOL_NAME - $OPERATION_TYPE" >> "$HOME/.claude/enhanced-hooks/performance-tracker.log"

# Calculate operation duration
if [[ -n "$START_TIME" && -n "$END_TIME" ]]; then
    START_TIMESTAMP=$(date -d "$START_TIME" +%s 2>/dev/null || echo "$(date +%s)")
    END_TIMESTAMP=$(date -d "$END_TIME" +%s 2>/dev/null || echo "$(date +%s)")
    DURATION=$((END_TIMESTAMP - START_TIMESTAMP))
else
    # Default duration if not provided
    DURATION=5
fi

# Estimate resource usage (mock implementation - would integrate with actual monitoring)
estimate_resource_usage() {
    local operation_type="$1"
    local duration="$2"
    
    # Base resource usage
    local memory_mb=50
    local cpu_percent=25
    local disk_io=10
    local network_io=5
    
    # Adjust based on operation type
    case "$operation_type" in
        *test*)
            memory_mb=80
            cpu_percent=40
            ;;
        *build*)
            memory_mb=200
            cpu_percent=60
            disk_io=50
            ;;
        *analysis*)
            memory_mb=100
            cpu_percent=50
            ;;
        *ml*|*ai*)
            memory_mb=500
            cpu_percent=80
            ;;
    esac
    
    # Adjust based on duration
    if [[ "$duration" -gt 60 ]]; then
        memory_mb=$((memory_mb * 2))
        cpu_percent=$((cpu_percent + 10))
    fi
    
    echo "{\"memory_mb\":$memory_mb,\"cpu_percent\":$cpu_percent,\"disk_io\":$disk_io,\"network_io\":$network_io,\"peak_memory\":$((memory_mb + 20))}"
}

# Calculate quality score
calculate_quality_score() {
    local success="$1"
    local duration="$2"
    local expected_duration="$3"
    
    local score=0.5
    
    # Success factor
    if [[ "$success" == "true" ]]; then
        score=$(echo "scale=2; $score + 0.3" | bc -l)
    fi
    
    # Performance factor
    if [[ "$duration" -le "$expected_duration" ]]; then
        score=$(echo "scale=2; $score + 0.2" | bc -l)
    fi
    
    # Cap at 1.0
    if (( $(echo "$score > 1.0" | bc -l) )); then
        score=1.0
    fi
    
    echo "$score"
}

# Get expected duration for operation type
get_expected_duration() {
    local operation_type="$1"
    
    case "$operation_type" in
        *edit*|*write*) echo 5 ;;
        *test*) echo 30 ;;
        *build*) echo 60 ;;
        *analysis*) echo 15 ;;
        *deploy*) echo 120 ;;
        *) echo 10 ;;
    esac
}

# Generate resource usage and quality metrics
RESOURCE_USAGE=$(estimate_resource_usage "$OPERATION_TYPE" "$DURATION")
EXPECTED_DURATION=$(get_expected_duration "$OPERATION_TYPE")
QUALITY_SCORE=$(calculate_quality_score "$SUCCESS" "$DURATION" "$EXPECTED_DURATION")

# Create performance metrics
PERFORMANCE_METRICS="{
    \"operation_id\": \"$OPERATION_ID\",
    \"tool_name\": \"$TOOL_NAME\",
    \"operation_type\": \"$OPERATION_TYPE\",
    \"start_time\": \"$START_TIME\",
    \"end_time\": \"$END_TIME\",
    \"duration_seconds\": $DURATION,
    \"success\": $SUCCESS,
    \"error_type\": \"$ERROR_TYPE\",
    \"resource_usage\": $RESOURCE_USAGE,
    \"quality_score\": $QUALITY_SCORE,
    \"expected_duration\": $EXPECTED_DURATION,
    \"timestamp\": \"$(date -Iseconds)\"
}"

# Store metrics
METRICS_FILE="$HOME/.claude/enhanced-hooks/metrics/$(date +%Y-%m-%d).jsonl"
echo "$PERFORMANCE_METRICS" >> "$METRICS_FILE"

echo "$(date -Iseconds): Metrics stored for operation $OPERATION_ID" >> "$HOME/.claude/enhanced-hooks/performance-tracker.log"

# Analyze for performance issues
analyze_performance_issues() {
    local metrics="$1"
    local issues="[]"
    
    local duration=$(echo "$metrics" | jq -r '.duration_seconds')
    local memory_mb=$(echo "$metrics" | jq -r '.resource_usage.memory_mb')
    local cpu_percent=$(echo "$metrics" | jq -r '.resource_usage.cpu_percent')
    local expected_duration=$(echo "$metrics" | jq -r '.expected_duration')
    
    # Check for slow execution
    if [[ "$duration" -gt $((expected_duration * 2)) ]]; then
        issues=$(echo "$issues" | jq '. += [{"type":"SLOW_EXECUTION","severity":"HIGH","description":"Operation took '"$duration"'s, expected '"$expected_duration"'s","suggestion":"Consider optimization or breaking down the operation"}]')
    fi
    
    # Check for high memory usage
    if [[ "$memory_mb" -gt 256 ]]; then
        issues=$(echo "$issues" | jq '. += [{"type":"HIGH_MEMORY_USAGE","severity":"MEDIUM","description":"Memory usage '"$memory_mb"'MB exceeds normal threshold","suggestion":"Optimize memory usage or increase available memory"}]')
    fi
    
    # Check for high CPU usage
    if [[ "$cpu_percent" -gt 80 ]]; then
        issues=$(echo "$issues" | jq '. += [{"type":"HIGH_CPU_USAGE","severity":"MEDIUM","description":"CPU usage '"$cpu_percent"'% is very high","suggestion":"Optimize CPU-intensive operations"}]')
    fi
    
    echo "$issues"
}

# Generate optimization suggestions
generate_optimizations() {
    local metrics="$1"
    local suggestions="[]"
    
    local duration=$(echo "$metrics" | jq -r '.duration_seconds')
    local memory_mb=$(echo "$metrics" | jq -r '.resource_usage.memory_mb')
    local operation_type=$(echo "$metrics" | jq -r '.operation_type')
    
    # Duration-based suggestions
    if [[ "$duration" -gt 30 ]]; then
        suggestions=$(echo "$suggestions" | jq '. += ["Consider breaking down large operations into smaller chunks"]')
        suggestions=$(echo "$suggestions" | jq '. += ["Implement caching for repeated operations"]')
    fi
    
    # Memory-based suggestions
    if [[ "$memory_mb" -gt 200 ]]; then
        suggestions=$(echo "$suggestions" | jq '. += ["Implement memory-efficient algorithms"]')
        suggestions=$(echo "$suggestions" | jq '. += ["Add memory cleanup between operations"]')
    fi
    
    # Operation-specific suggestions
    case "$operation_type" in
        *test*)
            suggestions=$(echo "$suggestions" | jq '. += ["Use parallel test execution"]')
            suggestions=$(echo "$suggestions" | jq '. += ["Implement test result caching"]')
            ;;
        *build*)
            suggestions=$(echo "$suggestions" | jq '. += ["Use incremental builds"]')
            suggestions=$(echo "$suggestions" | jq '. += ["Implement build caching"]')
            ;;
        *analysis*)
            suggestions=$(echo "$suggestions" | jq '. += ["Use sampling for large datasets"]')
            suggestions=$(echo "$suggestions" | jq '. += ["Implement analysis result caching"]')
            ;;
    esac
    
    echo "$suggestions"
}

# Perform performance analysis
PERFORMANCE_ISSUES=$(analyze_performance_issues "$PERFORMANCE_METRICS")
OPTIMIZATION_SUGGESTIONS=$(generate_optimizations "$PERFORMANCE_METRICS")

# Create performance report
PERFORMANCE_REPORT="{
    \"timestamp\": \"$(date -Iseconds)\",
    \"metrics\": $PERFORMANCE_METRICS,
    \"issues\": $PERFORMANCE_ISSUES,
    \"optimizations\": $OPTIMIZATION_SUGGESTIONS
}"

# Store performance report
REPORTS_FILE="$HOME/.claude/enhanced-hooks/performance-reports.jsonl"
echo "$PERFORMANCE_REPORT" >> "$REPORTS_FILE"

# Generate alerts for critical issues
CRITICAL_ISSUES=$(echo "$PERFORMANCE_ISSUES" | jq '[.[] | select(.severity == "HIGH" or .severity == "CRITICAL")]')
CRITICAL_COUNT=$(echo "$CRITICAL_ISSUES" | jq 'length')

if [[ "$CRITICAL_COUNT" -gt 0 ]]; then
    echo "$(date -Iseconds): ALERT: $CRITICAL_COUNT critical performance issues detected" >> "$HOME/.claude/enhanced-hooks/performance-tracker.log"
    
    # Create alert file
    ALERT_FILE="$HOME/.claude/enhanced-hooks/alerts/performance-alert-$(date +%s).json"
    mkdir -p "$(dirname "$ALERT_FILE")"
    cat > "$ALERT_FILE" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "operation_id": "$OPERATION_ID",
    "tool_name": "$TOOL_NAME",
    "operation_type": "$OPERATION_TYPE",
    "critical_issues": $CRITICAL_ISSUES,
    "immediate_action_required": true
}
EOF
fi

# Update running statistics
update_running_stats() {
    local metrics="$1"
    local stats_file="$HOME/.claude/enhanced-hooks/running-stats.json"
    
    local duration=$(echo "$metrics" | jq -r '.duration_seconds')
    local success=$(echo "$metrics" | jq -r '.success')
    local operation_type=$(echo "$metrics" | jq -r '.operation_type')
    
    if [[ -f "$stats_file" ]]; then
        # Update existing stats
        local updated_stats=$(cat "$stats_file" | jq --argjson duration "$duration" --argjson success "$success" --arg op_type "$operation_type" '
            .total_operations += 1 |
            .total_duration += $duration |
            .average_duration = (.total_duration / .total_operations) |
            if $success then .successful_operations += 1 else . end |
            .success_rate = (.successful_operations / .total_operations) |
            .last_updated = "'"$(date -Iseconds)"'" |
            .operations_by_type[$op_type] = ((.operations_by_type[$op_type] // 0) + 1)
        ')
        echo "$updated_stats" > "$stats_file"
    else
        # Create initial stats
        cat > "$stats_file" << EOF
{
    "total_operations": 1,
    "successful_operations": $(echo "$success" | jq '.'),
    "total_duration": $duration,
    "average_duration": $duration,
    "success_rate": $(echo "$success" | jq '.'),
    "last_updated": "$(date -Iseconds)",
    "operations_by_type": {
        "$operation_type": 1
    }
}
EOF
    fi
}

update_running_stats "$PERFORMANCE_METRICS"

# Generate trend analysis (weekly)
generate_trend_analysis() {
    local days_back=7
    local start_date=$(date -d "$days_back days ago" +%Y-%m-%d)
    local trend_data="[]"
    
    # Collect metrics from the past week
    for i in $(seq 0 $days_back); do
        local check_date=$(date -d "$i days ago" +%Y-%m-%d)
        local metrics_file="$HOME/.claude/enhanced-hooks/metrics/$check_date.jsonl"
        
        if [[ -f "$metrics_file" ]]; then
            local daily_metrics=$(cat "$metrics_file" | jq -s '.')
            local daily_avg_duration=$(echo "$daily_metrics" | jq '[.[].duration_seconds] | add / length')
            local daily_success_rate=$(echo "$daily_metrics" | jq '[.[].success] | map(select(. == true)) | length / length')
            
            trend_data=$(echo "$trend_data" | jq --arg date "$check_date" --argjson duration "$daily_avg_duration" --argjson success "$daily_success_rate" '
                . += [{
                    "date": $date,
                    "average_duration": $duration,
                    "success_rate": $success,
                    "operations_count": '"$(echo "$daily_metrics" | jq 'length')"'
                }]
            ')
        fi
    done
    
    # Save trend analysis
    local trend_file="$HOME/.claude/enhanced-hooks/trend-analysis.json"
    cat > "$trend_file" << EOF
{
    "analysis_date": "$(date -Iseconds)",
    "period_days": $days_back,
    "trend_data": $trend_data,
    "insights": [
        "Trend analysis covers the last $days_back days",
        "Performance patterns can be identified from daily aggregations"
    ]
}
EOF
}

# Run trend analysis once per day
LAST_TREND_FILE="$HOME/.claude/enhanced-hooks/.last-trend-analysis"
TODAY=$(date +%Y-%m-%d)

if [[ ! -f "$LAST_TREND_FILE" ]] || [[ "$(cat "$LAST_TREND_FILE" 2>/dev/null)" != "$TODAY" ]]; then
    generate_trend_analysis
    echo "$TODAY" > "$LAST_TREND_FILE"
    echo "$(date -Iseconds): Trend analysis updated" >> "$HOME/.claude/enhanced-hooks/performance-tracker.log"
fi

# Output performance report
echo "$PERFORMANCE_REPORT" | jq '.'

echo "$(date -Iseconds): Performance tracking completed for operation $OPERATION_ID" >> "$HOME/.claude/enhanced-hooks/performance-tracker.log"
exit 0