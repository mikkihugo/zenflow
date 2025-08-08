#!/bin/bash

# Real-time Swarm Status Dashboard
echo "🐝 ESLint Swarm Coordination Dashboard"
echo "====================================="

while true; do
  clear
  echo "🐝 ESLint Swarm Status - $(date '+%H:%M:%S')"
  echo "============================================="
  
  # Count active Claude/ESLint processes
  claude_count=$(ps aux | grep -v grep | grep -E "(claude|zen-ai)" | wc -l)
  echo "🤖 Active ESLint Processes: $claude_count"
  
  if [ $claude_count -gt 0 ]; then
    echo ""
    echo "📊 Active Processes:"
    ps aux | grep -v grep | grep -E "(claude|zen-ai)" | while read line; do
      pid=$(echo $line | awk '{print $2}')
      cmd=$(echo $line | awk '{for(i=11;i<=NF;i++) printf $i" "; print ""}' | cut -c1-60)
      runtime=$(ps -o etime= -p $pid 2>/dev/null | tr -d ' ')
      echo "   PID $pid: $cmd... (Runtime: $runtime)"
    done
  fi
  
  echo ""
  echo "⏱️  Extended Timeouts Active:"
  echo "   Inactivity: 10 minutes (was 3 minutes)"
  echo "   Maximum: 30 minutes (was 60 minutes)"
  
  echo ""
  echo "📈 System Performance:"
  echo "   Load: $(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')"
  echo "   Memory: $(free -h | grep '^Mem:' | awk '{print $3 "/" $2}')"
  
  echo ""
  echo "📁 Recent Activity:"
  recent_changes=$(find src -name "*.ts" -mmin -10 2>/dev/null | wc -l)
  echo "   Files modified in last 10min: $recent_changes"
  
  if [ -d "scripts/ai-eslint/reports" ]; then
    latest_report=$(ls -t scripts/ai-eslint/reports/*.md 2>/dev/null | head -1)
    if [ -n "$latest_report" ]; then
      report_time=$(stat -c %y "$latest_report" 2>/dev/null | cut -d' ' -f2 | cut -d'.' -f1)
      echo "   Latest report: $(basename $latest_report) at $report_time"
    fi
  fi
  
  echo ""
  echo "💡 Press Ctrl+C to stop monitoring"
  
  sleep 10
done