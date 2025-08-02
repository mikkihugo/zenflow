# 🐝 Swarm Report: {{swarm.name}}

**Generated:** {{timestamp}}  
**Topology:** {{swarm.topology}} | **Status:** {{swarm.status}}

## 📊 Overview

- **Total Agents:** {{agents.total}}
- **Active Tasks:** {{tasks.active}}  
- **Completed Tasks:** {{tasks.completed}}
- **Success Rate:** {{performance.successRate}}%

## 🤖 Agents

{{#each agents.list}}
### {{name}} ({{type}})
- **Status:** {{status}}
- **Tasks Completed:** {{tasksCompleted}}
- **Capabilities:** {{capabilities}}

{{/each}}

## 📈 Performance Metrics

| Metric | Value |
|--------|-------|
| Total Execution Time | {{performance.totalTime}} |
| Average Task Duration | {{performance.avgTaskTime}} |
| Memory Usage | {{performance.memoryUsage}} |
| Success Rate | {{performance.successRate}}% |