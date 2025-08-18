<!--
  @component AGU (AI Governance Unit) Dashboard
  Central hub for AI governance, task approval, and workflow management
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  // AGU state management
  const activeWorkflows = writable([]);
  const pendingApprovals = writable([]);
  const systemGovernance = writable({
    status: 'active',
    policies: [],
    violations: 0,
    complianceScore: 95
  });
  const aguMetrics = writable({
    totalTasks: 0,
    approvedTasks: 0,
    rejectedTasks: 0,
    pendingTasks: 0,
    averageApprovalTime: '0m'
  });

  // Mock data for development
  let mockWorkflows = [
    {
      id: 'wf-001',
      name: 'Code Analysis Pipeline',
      status: 'active',
      gateType: 'approval',
      priority: 'high',
      requester: 'Auto-Scanner',
      created: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      businessImpact: 'high',
      stakeholders: ['Tech Lead', 'Security Team']
    },
    {
      id: 'wf-002', 
      name: 'Feature Implementation Gate',
      status: 'pending',
      gateType: 'checkpoint',
      priority: 'medium',
      requester: 'Product Manager',
      created: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      businessImpact: 'medium',
      stakeholders: ['Engineering', 'QA']
    },
    {
      id: 'wf-003',
      name: 'Emergency Security Patch',
      status: 'escalated',
      gateType: 'emergency',
      priority: 'critical',
      requester: 'Security Bot',
      created: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      businessImpact: 'critical',
      stakeholders: ['CTO', 'Security Team', 'DevOps']
    }
  ];

  let mockApprovals = [
    {
      id: 'app-001',
      taskTitle: 'Refactor Authentication Module',
      description: 'Modernize auth system to use JWT tokens and improve security',
      type: 'refactoring',
      priority: 'high',
      estimatedHours: 8,
      requiredAgents: ['Security Expert', 'Backend Developer'],
      sourceAnalysis: {
        filePath: 'src/auth/auth-service.ts',
        severity: 'medium',
        type: 'security'
      },
      acceptanceCriteria: [
        'All tests pass',
        'Security scan shows no vulnerabilities',
        'Performance benchmarks maintained'
      ],
      created: new Date(Date.now() - 1000 * 60 * 45),
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2) // 2 days
    },
    {
      id: 'app-002',
      taskTitle: 'Database Query Optimization',
      description: 'Optimize slow queries identified in performance monitoring',
      type: 'optimization',
      priority: 'medium',
      estimatedHours: 4,
      requiredAgents: ['Database Expert', 'Performance Analyst'],
      sourceAnalysis: {
        filePath: 'src/database/queries/user-queries.ts',
        severity: 'low',
        type: 'performance'
      },
      acceptanceCriteria: [
        'Query time reduced by 50%',
        'Database load testing passes',
        'No data integrity issues'
      ],
      created: new Date(Date.now() - 1000 * 60 * 20),
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5) // 5 days
    }
  ];

  onMount(async () => {
    // Load real data from APIs
    await loadActiveWorkflows();
    await loadPendingApprovals();
    await loadSystemGovernance();
    await loadAGUMetrics();
  });

  async function loadActiveWorkflows() {
    try {
      const response = await fetch('/api/agu/workflows');
      if (response.ok) {
        const data = await response.json();
        activeWorkflows.set(data.workflows || mockWorkflows);
      } else {
        // Use mock data for development
        activeWorkflows.set(mockWorkflows);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
      activeWorkflows.set(mockWorkflows);
    }
  }

  async function loadPendingApprovals() {
    try {
      const response = await fetch('/api/agu/approvals');
      if (response.ok) {
        const data = await response.json();
        pendingApprovals.set(data.approvals || mockApprovals);
      } else {
        pendingApprovals.set(mockApprovals);
      }
    } catch (error) {
      console.error('Failed to load approvals:', error);
      pendingApprovals.set(mockApprovals);
    }
  }

  async function loadSystemGovernance() {
    try {
      const response = await fetch('/api/agu/governance');
      if (response.ok) {
        const data = await response.json();
        systemGovernance.set(data);
      }
    } catch (error) {
      console.error('Failed to load governance data:', error);
    }
  }

  async function loadAGUMetrics() {
    try {
      const response = await fetch('/api/agu/metrics');
      if (response.ok) {
        const data = await response.json();
        aguMetrics.set(data);
      } else {
        // Set mock metrics
        aguMetrics.set({
          totalTasks: mockApprovals.length + 150,
          approvedTasks: 89,
          rejectedTasks: 12,
          pendingTasks: mockApprovals.length,
          averageApprovalTime: '24m'
        });
      }
    } catch (error) {
      console.error('Failed to load AGU metrics:', error);
    }
  }

  async function approveWorkflow(workflowId) {
    try {
      const response = await fetch(`/api/agu/workflows/${workflowId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'approved', rationale: 'Reviewed and approved via web interface' })
      });

      if (response.ok) {
        await loadActiveWorkflows();
        showNotification('Workflow approved successfully', 'success');
      } else {
        showNotification('Failed to approve workflow', 'error');
      }
    } catch (error) {
      console.error('Approval error:', error);
      showNotification('Error processing approval', 'error');
    }
  }

  async function rejectWorkflow(workflowId) {
    const rationale = prompt('Please provide a reason for rejection:');
    if (!rationale) return;

    try {
      const response = await fetch(`/api/agu/workflows/${workflowId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'rejected', rationale })
      });

      if (response.ok) {
        await loadActiveWorkflows();
        showNotification('Workflow rejected', 'warning');
      } else {
        showNotification('Failed to reject workflow', 'error');
      }
    } catch (error) {
      console.error('Rejection error:', error);
      showNotification('Error processing rejection', 'error');
    }
  }

  async function escalateWorkflow(workflowId) {
    try {
      const response = await fetch(`/api/agu/workflows/${workflowId}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escalationLevel: 'TEAM_LEAD', reason: 'Manual escalation via web interface' })
      });

      if (response.ok) {
        await loadActiveWorkflows();
        showNotification('Workflow escalated', 'info');
      } else {
        showNotification('Failed to escalate workflow', 'error');
      }
    } catch (error) {
      console.error('Escalation error:', error);
      showNotification('Error processing escalation', 'error');
    }
  }

  function showNotification(message, type) {
    // Simple notification - in a real app, use a proper notification system
    alert(`${type.toUpperCase()}: ${message}`);
  }

  function getStatusColor(status) {
    switch (status) {
      case 'active': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      case 'escalated': return 'text-red-400';
      case 'completed': return 'text-green-400';
      default: return 'text-gray-400';
    }
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  }

  function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 24 * 60) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffMinutes / (24 * 60))}d ago`;
    }
  }
</script>

<svelte:head>
  <title>AGU - AI Governance Unit - Claude Code Zen</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
  <!-- Header -->
  <div class="bg-gray-800 border-b border-gray-700 p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-purple-400 mb-2">🛡️ AGU - AI Governance Unit</h1>
      <p class="text-gray-300">Centralized governance, approval workflows, and compliance management</p>
      
      <!-- Status Overview -->
      <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-gray-700 rounded-lg p-3">
          <div class="text-sm text-gray-400">System Status</div>
          <div class="text-green-400 font-semibold">{$systemGovernance.status.toUpperCase()}</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-3">
          <div class="text-sm text-gray-400">Compliance Score</div>
          <div class="text-blue-400 font-semibold">{$systemGovernance.complianceScore}%</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-3">
          <div class="text-sm text-gray-400">Pending Approvals</div>
          <div class="text-yellow-400 font-semibold">{$pendingApprovals.length}</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-3">
          <div class="text-sm text-gray-400">Active Workflows</div>
          <div class="text-purple-400 font-semibold">{$activeWorkflows.length}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
    <!-- Main Content Area -->
    <div class="xl:col-span-2 space-y-6">
      <!-- Active Workflows -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 class="text-xl font-semibold mb-4">🔀 Active Workflow Gates</h2>
        
        <div class="space-y-4">
          {#each $activeWorkflows as workflow}
            <div class="bg-gray-700 rounded-lg p-4 border-l-4 {workflow.status === 'escalated' ? 'border-red-400' : workflow.status === 'pending' ? 'border-yellow-400' : 'border-blue-400'}">
              <!-- Workflow Header -->
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h3 class="font-semibold text-lg">{workflow.name}</h3>
                  <div class="flex items-center gap-4 text-sm text-gray-300">
                    <span class="{getStatusColor(workflow.status)}">● {workflow.status.toUpperCase()}</span>
                    <span class="px-2 py-1 rounded text-xs {getPriorityColor(workflow.priority)}">{workflow.priority.toUpperCase()}</span>
                    <span>Gate: {workflow.gateType}</span>
                    <span>{formatTimeAgo(workflow.created)}</span>
                  </div>
                </div>
                <div class="text-right text-sm text-gray-400">
                  <div>ID: {workflow.id}</div>
                  <div>Requested by: {workflow.requester}</div>
                </div>
              </div>

              <!-- Business Impact & Stakeholders -->
              <div class="mb-3">
                <div class="text-sm text-gray-300">
                  <span class="font-medium">Business Impact:</span> 
                  <span class="{workflow.businessImpact === 'critical' ? 'text-red-400' : workflow.businessImpact === 'high' ? 'text-orange-400' : 'text-yellow-400'}">
                    {workflow.businessImpact.toUpperCase()}
                  </span>
                </div>
                <div class="text-sm text-gray-300">
                  <span class="font-medium">Stakeholders:</span> {workflow.stakeholders.join(', ')}
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2">
                <button 
                  on:click={() => approveWorkflow(workflow.id)}
                  class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  ✅ Approve
                </button>
                <button 
                  on:click={() => rejectWorkflow(workflow.id)}
                  class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  ❌ Reject
                </button>
                <button 
                  on:click={() => escalateWorkflow(workflow.id)}
                  class="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  🔺 Escalate
                </button>
                <a 
                  href="/agu/workflow/{workflow.id}" 
                  class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors inline-block"
                >
                  👁️ Details
                </a>
              </div>
            </div>
          {/each}
          
          {#if $activeWorkflows.length === 0}
            <div class="text-center py-8 text-gray-500">
              <p>No active workflows requiring attention</p>
            </div>
          {/if}
        </div>
      </div>

      <!-- Task Approvals -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 class="text-xl font-semibold mb-4">📋 Pending Task Approvals</h2>
        
        <div class="space-y-4">
          {#each $pendingApprovals as approval}
            <div class="bg-gray-700 rounded-lg p-4">
              <!-- Task Header -->
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h3 class="font-semibold">{approval.taskTitle}</h3>
                  <p class="text-gray-300 text-sm mt-1">{approval.description}</p>
                </div>
                <div class="text-right text-sm text-gray-400">
                  <div class="px-2 py-1 rounded text-xs {getPriorityColor(approval.priority)} mb-1">
                    {approval.priority.toUpperCase()}
                  </div>
                  <div>{approval.estimatedHours}h estimated</div>
                </div>
              </div>

              <!-- Task Details -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <div class="text-gray-400">Type:</div>
                  <div class="text-blue-400">{approval.type}</div>
                </div>
                <div>
                  <div class="text-gray-400">Source:</div>
                  <div class="font-mono text-green-400">{approval.sourceAnalysis.filePath}</div>
                </div>
                <div>
                  <div class="text-gray-400">Required Agents:</div>
                  <div>{approval.requiredAgents.join(', ')}</div>
                </div>
                <div>
                  <div class="text-gray-400">Deadline:</div>
                  <div class="text-yellow-400">{approval.deadline.toLocaleDateString()}</div>
                </div>
              </div>

              <!-- Acceptance Criteria -->
              <div class="mb-3">
                <div class="text-sm text-gray-400 mb-1">Acceptance Criteria:</div>
                <div class="text-sm">
                  {#each approval.acceptanceCriteria as criterion}
                    <div class="text-gray-300">• {criterion}</div>
                  {/each}
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2">
                <button class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors">
                  ✅ Approve Task
                </button>
                <button class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition-colors">
                  📝 Modify
                </button>
                <button class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors">
                  ❌ Reject
                </button>
                <a 
                  href="/agu/task/{approval.id}" 
                  class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors inline-block"
                >
                  👁️ Review
                </a>
              </div>
            </div>
          {/each}
          
          {#if $pendingApprovals.length === 0}
            <div class="text-center py-8 text-gray-500">
              <p>No pending task approvals</p>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
      <!-- AGU Metrics -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 class="text-lg font-semibold mb-4">📊 AGU Metrics</h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-400">Total Tasks</span>
            <span class="font-semibold">{$aguMetrics.totalTasks}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Approved</span>
            <span class="text-green-400 font-semibold">{$aguMetrics.approvedTasks}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Rejected</span>
            <span class="text-red-400 font-semibold">{$aguMetrics.rejectedTasks}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Pending</span>
            <span class="text-yellow-400 font-semibold">{$aguMetrics.pendingTasks}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Avg Approval Time</span>
            <span class="text-blue-400 font-semibold">{$aguMetrics.averageApprovalTime}</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 class="text-lg font-semibold mb-4">⚡ Quick Actions</h3>
        <div class="space-y-2">
          <a href="/agu/scan" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">
            🔍 Initiate Code Scan
          </a>
          <a href="/agu/policies" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">
            📋 Review Policies
          </a>
          <a href="/agu/reports" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">
            📊 Generate Reports
          </a>
          <a href="/agu/audit" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">
            🔍 Audit Trail
          </a>
          <a href="/agu/settings" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">
            ⚙️ AGU Settings
          </a>
        </div>
      </div>

      <!-- Governance Status -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 class="text-lg font-semibold mb-4">🛡️ Governance Status</h3>
        <div class="space-y-3">
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-gray-400">Compliance Score</span>
              <span class="text-blue-400">{$systemGovernance.complianceScore}%</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2">
              <div class="bg-blue-400 h-2 rounded-full" style="width: {$systemGovernance.complianceScore}%"></div>
            </div>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Violations</span>
            <span class="text-red-400">{$systemGovernance.violations}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Active Policies</span>
            <span class="text-green-400">{$systemGovernance.policies.length}</span>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 class="text-lg font-semibold mb-4">🕐 Recent Activity</h3>
        <div class="space-y-3 text-sm">
          <div class="border-l-2 border-green-400 pl-3">
            <div class="text-green-400">Workflow approved</div>
            <div class="text-gray-400">Security patch deployment - 15m ago</div>
          </div>
          <div class="border-l-2 border-yellow-400 pl-3">
            <div class="text-yellow-400">Task escalated</div>
            <div class="text-gray-400">Database optimization review - 1h ago</div>
          </div>
          <div class="border-l-2 border-blue-400 pl-3">
            <div class="text-blue-400">Policy updated</div>
            <div class="text-gray-400">Code review requirements - 2h ago</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: #111827;
  }
</style>