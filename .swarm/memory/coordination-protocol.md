# Swarm Coordination Protocol

## Communication Rules

### 1. Status Updates
Each agent must update their status file at:
- Task start: Set status to "working" with task details
- Major milestones: Update progress percentage
- Task completion: Set status to "completed" with outputs
- Blockers: Set status to "blocked" with dependency info

### 2. File Locations
- Agent Status: `.swarm/memory/agents/{agent-id}/status.json`
- Task Queue: `.swarm/memory/tasks/queue.json`
- Decisions Log: `.swarm/memory/decisions/{timestamp}-{agent}-{decision}.json`
- Integration Points: `.swarm/memory/integration-contracts.json`

### 3. Coordination Commands
Agents should use these bash commands for coordination:

```bash
# Update agent status
echo '{"status": "working", "task": "task-id", "progress": 25}' > .swarm/memory/agents/vision/status.json

# Check dependency status
cat .swarm/memory/agents/*/status.json | jq '.status'

# Log decision
echo '{"agent": "vision", "decision": "Using OpenAI Vision API", "rationale": "..."}' > .swarm/memory/decisions/$(date +%s)-vision-api-choice.json

# Signal task completion
echo '{"task_id": "task-001", "status": "completed", "outputs": [...]}' > .swarm/memory/tasks/completed/task-001.json
```

### 4. Dependency Management
- Agents must check dependencies before starting dependent tasks
- Use `.swarm/memory/integration-contracts.json` for API contracts
- Block and wait if dependencies are not ready
- Queen agent resolves conflicts and deadlocks

### 5. Progress Reporting
Every 30 minutes or after major milestones:
- Update progress in agent status file
- Log any decisions made
- Document any API changes or integration points
- Check for updates from other agents