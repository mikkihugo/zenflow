#!/bin/bash

# Enhanced Claude CLI Activity Monitor with Extended Timeout Visibility
# Shows real-time activity during 10-30 minute operations

echo "🔍 Enhanced Claude CLI Activity Monitor"
echo "======================================"
echo "⏱️  Extended Timeouts: 10min inactivity | 30min maximum"
echo "📡 Real-time streaming visibility enabled"
echo ""

# Function to monitor process with enhanced details
monitor_enhanced_process() {
  local pid=$1
  local name=$2
  
  if kill -0 $pid 2>/dev/null; then
    echo "✅ $name (PID: $pid) - ACTIVE"
    
    # Enhanced process information
    ps -p $pid -o pid,ppid,cpu,pmem,etime,time,cmd --no-headers | while read line; do
      echo "   📊 $line"
    done
    
    # File activity tracking
    if command -v lsof >/dev/null 2>&1; then
      echo "   📁 Recent file access:"
      lsof -p $pid 2>/dev/null | grep -E '\.(ts|js|json)$' | tail -3 | awk '{print "      " $9}' | head -3
    fi
    
    # Network connections
    echo "   🌐 Network: $(netstat -tulpn 2>/dev/null | grep $pid | wc -l) connections"
    
    echo ""
  else
    echo "❌ $name (PID: $pid) - NOT RUNNING"
  fi
}

# Function to show swarm coordination status
show_swarm_status() {
  echo "🐝 Swarm Coordination Status:"
  
  # Count active Claude processes
  claude_count=$(ps aux | grep -v grep | grep -E "(claude|tsx.*eslint-swarm)" | wc -l)
  echo "   Active Claude/Coordinator processes: $claude_count"
  
  # Show recent ESLint reports
  if [ -d "scripts/ai-eslint/reports" ]; then
    recent_reports=$(ls -t scripts/ai-eslint/reports/*.md 2>/dev/null | head -3)
    if [ -n "$recent_reports" ]; then
      echo "   📋 Recent reports:"
      echo "$recent_reports" | while read report; do
        echo "      $(basename $report) ($(stat -c %y $report | cut -d' ' -f1-2))"
      done
    fi
  fi
  
  echo ""
}

# Function to display system performance during extended operations
show_extended_performance() {
  echo "⚡ System Performance During Extended Operations:"
  
  # CPU and memory
  echo "   CPU Load: $(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')"
  echo "   Memory: $(free -h | grep '^Mem:' | awk '{print $3 "/" $2 " (" int($3/$2*100) "%)"}')"
  
  # Disk I/O
  if command -v iostat >/dev/null 2>&1; then
    io_stats=$(iostat -d 1 1 2>/dev/null | tail -n +4 | head -1 | awk '{print "Read: " $3 " Write: " $4}')
    echo "   Disk I/O: $io_stats"
  fi
  
  # Process count
  echo "   Total Processes: $(ps aux | wc -l)"
  
  echo ""
}

# Function to estimate remaining work
estimate_remaining_work() {
  echo "🔮 Work Estimation:"
  
  # Quick ESLint violation count
  violation_count=$(timeout 10 npx eslint "src/core/*.ts" --format json 2>/dev/null | jq '.[].messages | length' 2>/dev/null | paste -sd+ | bc 2>/dev/null || echo "unknown")
  echo "   Estimated remaining violations: $violation_count"
  
  # File modification times
  recent_changes=$(find src -name "*.ts" -mmin -30 2>/dev/null | wc -l)
  echo "   Files modified in last 30min: $recent_changes"
  
  echo ""
}

# Main monitoring loop with enhanced features
echo "🚀 Starting enhanced monitoring for extended operations..."
echo "   Extended timeouts prevent premature termination"
echo "   Real-time streaming shows continuous progress"
echo "   Press Ctrl+C to stop monitoring"
echo ""

iteration=0

while true; do
  clear
  echo "🕐 $(date '+%H:%M:%S') - Enhanced Claude Activity Monitor (${iteration})"
  echo "==============================================="
  echo ""
  
  # Find and monitor active processes
  active_processes=$(ps aux | grep -E "(claude|tsx.*eslint|zen-ai-fixer)" | grep -v grep)
  
  if [ -n "$active_processes" ]; then
    echo "🤖 Active ESLint/Claude Processes:"
    echo "$active_processes" | while read line; do
      pid=$(echo $line | awk '{print $2}')
      cmd=$(echo $line | awk '{for(i=11;i<=NF;i++) printf $i" "; print ""}')
      monitor_enhanced_process $pid "$cmd"
    done
  else
    echo "❌ No active Claude/ESLint processes found"
    echo ""
  fi
  
  show_swarm_status
  show_extended_performance
  estimate_remaining_work
  
  echo "💡 Enhanced Monitoring Features:"
  echo "   ✅ Extended timeout tracking (10min inactivity, 30min max)"
  echo "   📊 Real-time process and file monitoring" 
  echo "   🔮 Work estimation and progress tracking"
  echo "   ⚡ System performance monitoring during long operations"
  echo ""
  
  # Show tips based on iteration
  if [ $((iteration % 6)) -eq 0 ]; then
    echo "💭 TIP: Extended timeouts allow Claude to work thoughtfully on complex violations"
  elif [ $((iteration % 6)) -eq 3 ]; then
    echo "💭 TIP: Real-time streaming prevents timeout anxiety - you see all progress"
  fi
  
  iteration=$((iteration + 1))
  sleep 5
done