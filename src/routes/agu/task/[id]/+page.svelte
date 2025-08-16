<!--
  @component Task Approval Detail Page
  Detailed task review and approval interface with rich context
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { writable } from 'svelte/store';

  // Get task ID from URL parameters
  const taskId = $page.params.id;

  // Task state
  const task = writable(null);
  const isLoading = writable(true);
  const decision = writable('');
  const rationale = writable('');
  const modifications = writable({});
  const showModificationForm = writable(false);

  // Mock task data - in production, this would come from the AGU backend
  const mockTask = {
    id: taskId,
    title: 'Refactor Authentication Module',
    description: 'Modernize auth system to use JWT tokens and improve security. This task was generated from automated code analysis that detected outdated authentication patterns and potential security vulnerabilities.',
    type: 'refactoring',
    priority: 'high',
    estimatedHours: 8,
    requiredAgentTypes: ['Security Expert', 'Backend Developer', 'QA Engineer'],
    suggestedSwarmType: 'security-focused',
    sourceAnalysis: {
      filePath: 'src/auth/auth-service.ts',
      lineNumber: 45,
      type: 'security',
      severity: 'medium',
      codeSnippet: `// Vulnerable session handling
function authenticateUser(username, password) {
  // TODO: Add JWT token generation
  const user = findUser(username);
  if (user && user.password === password) {
    return { authenticated: true, user };
  }
  return { authenticated: false };
}`,
      tags: ['authentication', 'security', 'jwt', 'session-management'],
      confidence: 0.92
    },
    acceptanceCriteria: [
      'All tests pass with new JWT implementation',
      'Security scan shows no critical vulnerabilities',
      'Performance benchmarks maintained or improved',
      'Existing API compatibility preserved',
      'Documentation updated with new auth flow'
    ],
    businessContext: {
      impact: 'high',
      stakeholders: ['Security Team', 'Backend Team', 'Product Manager'],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days
      dependencies: [
        { reference: 'user-management-service', type: 'service', criticality: 'high' },
        { reference: 'api-gateway', type: 'infrastructure', criticality: 'medium' }
      ],
      riskFactors: [
        { description: 'Potential API breaking changes', severity: 'medium', probability: 0.3 },
        { description: 'User session interruption during deployment', severity: 'low', probability: 0.8 }
      ]
    },
    created: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    scannedBy: 'Enhanced Document Scanner v2.0',
    correlationId: 'scan-2024-001-auth-analysis'
  };

  onMount(async () => {
    await loadTaskDetails();
  });

  async function loadTaskDetails() {
    try {
      const response = await fetch(`/api/agu/tasks/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        task.set(data);
      } else {
        // Use mock data for development
        task.set(mockTask);
      }
    } catch (error) {
      console.error('Failed to load task details:', error);
      task.set(mockTask);
    } finally {
      isLoading.set(false);
    }
  }

  async function submitDecision() {
    if (!$decision) {
      alert('Please select a decision');
      return;
    }

    if (($decision === 'reject' || $decision === 'modify') && !$rationale.trim()) {
      alert('Please provide a rationale for your decision');
      return;
    }

    try {
      const payload = {
        taskId,
        decision: $decision,
        approved: $decision === 'approve' || $decision === 'modify',
        rationale: $rationale,
        modifications: $decision === 'modify' ? $modifications : undefined,
        decisionMaker: 'web-user', // In production, use actual user ID
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/agu/task-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(`Task ${$decision}ed successfully!`);
        // Redirect to AGU dashboard
        window.location.href = '/agu';
      } else {
        alert('Failed to submit decision');
      }
    } catch (error) {
      console.error('Decision submission error:', error);
      alert('Error submitting decision');
    }
  }

  function toggleModificationForm() {
    showModificationForm.update(n => !n);
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

  function getSeverityColor(severity) {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
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
  <title>Task Approval - {$task?.title || 'Loading...'} - Claude Code Zen</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
  {#if $isLoading}
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p class="text-gray-300">Loading task details...</p>
      </div>
    </div>
  {:else if $task}
    <!-- Header -->
    <div class="bg-gray-800 border-b border-gray-700 p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center gap-4 mb-4">
          <a href="/agu" class="text-purple-400 hover:text-purple-300">← Back to AGU</a>
          <div class="h-6 w-px bg-gray-600"></div>
          <h1 class="text-2xl font-bold text-purple-400">📋 Task Approval Review</h1>
        </div>
        
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-xl font-semibold mb-2">{$task.title}</h2>
            <div class="flex items-center gap-4 text-sm text-gray-300">
              <span class="px-2 py-1 rounded {getPriorityColor($task.priority)}">{$task.priority.toUpperCase()}</span>
              <span class="text-blue-400">{$task.type}</span>
              <span>{$task.estimatedHours}h estimated</span>
              <span>Created {formatTimeAgo($task.created)}</span>
            </div>
          </div>
          <div class="text-right text-sm text-gray-400">
            <div>Task ID: {$task.id}</div>
            <div>Correlation: {$task.correlationId}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Task Description -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg font-semibold mb-3">📝 Task Description</h3>
          <p class="text-gray-300 leading-relaxed">{$task.description}</p>
        </div>

        <!-- Source Analysis -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg font-semibold mb-3">🔍 Source Analysis</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div class="text-sm text-gray-400">File Path</div>
              <div class="font-mono text-green-400">{$task.sourceAnalysis.filePath}</div>
            </div>
            <div>
              <div class="text-sm text-gray-400">Line Number</div>
              <div class="text-blue-400">{$task.sourceAnalysis.lineNumber || 'N/A'}</div>
            </div>
            <div>
              <div class="text-sm text-gray-400">Analysis Type</div>
              <div class="text-purple-400">{$task.sourceAnalysis.type}</div>
            </div>
            <div>
              <div class="text-sm text-gray-400">Severity</div>
              <div class="{getSeverityColor($task.sourceAnalysis.severity)}">{$task.sourceAnalysis.severity.toUpperCase()}</div>
            </div>
          </div>

          {#if $task.sourceAnalysis.codeSnippet}
            <div class="mb-4">
              <div class="text-sm text-gray-400 mb-2">Code Context</div>
              <pre class="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto border border-gray-600"><code>{$task.sourceAnalysis.codeSnippet}</code></pre>
            </div>
          {/if}

          <div class="mb-4">
            <div class="text-sm text-gray-400 mb-2">Analysis Tags</div>
            <div class="flex flex-wrap gap-2">
              {#each $task.sourceAnalysis.tags as tag}
                <span class="bg-blue-600 text-blue-100 px-2 py-1 rounded text-xs">{tag}</span>
              {/each}
            </div>
          </div>

          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Scanner: {$task.scannedBy}</span>
            <span class="text-gray-400">Confidence: {Math.round($task.sourceAnalysis.confidence * 100)}%</span>
          </div>
        </div>

        <!-- Acceptance Criteria -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg font-semibold mb-3">✅ Acceptance Criteria</h3>
          <div class="space-y-2">
            {#each $task.acceptanceCriteria as criterion}
              <div class="flex items-start gap-2">
                <span class="text-green-400 mt-1">•</span>
                <span class="text-gray-300">{criterion}</span>
              </div>
            {/each}
          </div>
        </div>

        <!-- Business Context -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg font-semibold mb-3">🏢 Business Context</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div class="text-sm text-gray-400">Business Impact</div>
              <div class="text-orange-400 font-semibold">{$task.businessContext.impact.toUpperCase()}</div>
            </div>
            <div>
              <div class="text-sm text-gray-400">Deadline</div>
              <div class="text-yellow-400">{$task.businessContext.deadline.toLocaleDateString()}</div>
            </div>
          </div>

          <div class="mb-4">
            <div class="text-sm text-gray-400 mb-2">Stakeholders</div>
            <div class="flex flex-wrap gap-2">
              {#each $task.businessContext.stakeholders as stakeholder}
                <span class="bg-purple-600 text-purple-100 px-2 py-1 rounded text-xs">{stakeholder}</span>
              {/each}
            </div>
          </div>

          {#if $task.businessContext.dependencies.length > 0}
            <div class="mb-4">
              <div class="text-sm text-gray-400 mb-2">Dependencies</div>
              {#each $task.businessContext.dependencies as dep}
                <div class="text-sm text-gray-300">
                  • {dep.reference} ({dep.type}, {dep.criticality} criticality)
                </div>
              {/each}
            </div>
          {/if}

          {#if $task.businessContext.riskFactors.length > 0}
            <div>
              <div class="text-sm text-gray-400 mb-2">Risk Factors</div>
              {#each $task.businessContext.riskFactors as risk}
                <div class="text-sm text-gray-300">
                  • {risk.description} ({risk.severity}, {Math.round(risk.probability * 100)}% probability)
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Decision Form -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg font-semibold mb-4">🎯 Make Decision</h3>
          
          <!-- Decision Options -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Decision</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label class="flex items-center">
                <input type="radio" bind:group={$decision} value="approve" class="mr-2">
                <span class="text-green-400">✅ Approve</span>
              </label>
              <label class="flex items-center">
                <input type="radio" bind:group={$decision} value="modify" class="mr-2">
                <span class="text-yellow-400">📝 Modify</span>
              </label>
              <label class="flex items-center">
                <input type="radio" bind:group={$decision} value="reject" class="mr-2">
                <span class="text-red-400">❌ Reject</span>
              </label>
              <label class="flex items-center">
                <input type="radio" bind:group={$decision} value="defer" class="mr-2">
                <span class="text-gray-400">⏸️ Defer</span>
              </label>
            </div>
          </div>

          <!-- Rationale -->
          <div class="mb-4">
            <label for="rationale" class="block text-sm font-medium mb-2">
              Rationale {($decision === 'reject' || $decision === 'modify') ? '(Required)' : '(Optional)'}
            </label>
            <textarea
              id="rationale"
              bind:value={$rationale}
              placeholder="Provide reasoning for your decision..."
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 h-24 resize-none"
            ></textarea>
          </div>

          <!-- Modification Form -->
          {#if $decision === 'modify'}
            <div class="mb-4 p-4 bg-gray-700 rounded-lg">
              <div class="flex justify-between items-center mb-3">
                <h4 class="font-medium">Task Modifications</h4>
                <button 
                  on:click={toggleModificationForm}
                  class="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {$showModificationForm ? 'Hide' : 'Show'} Options
                </button>
              </div>

              {#if $showModificationForm}
                <div class="space-y-3">
                  <div>
                    <label class="block text-sm text-gray-400 mb-1">New Title</label>
                    <input 
                      type="text" 
                      bind:value={$modifications.title}
                      placeholder="Leave empty to keep current title"
                      class="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                    >
                  </div>
                  <div>
                    <label class="block text-sm text-gray-400 mb-1">Priority</label>
                    <select bind:value={$modifications.priority} class="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm">
                      <option value="">Keep current priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm text-gray-400 mb-1">Estimated Hours</label>
                    <input 
                      type="number" 
                      bind:value={$modifications.estimatedHours}
                      placeholder="Current: {$task.estimatedHours}"
                      class="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                    >
                  </div>
                </div>
              {/if}
            </div>
          {/if}

          <!-- Submit Button -->
          <button 
            on:click={submitDecision}
            disabled={!$decision}
            class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Submit Decision
          </button>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Task Summary -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg font-semibold mb-4">📊 Task Summary</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Type</span>
              <span class="text-blue-400">{$task.type}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Priority</span>
              <span class="{getPriorityColor($task.priority).split(' ')[0]}">{$task.priority.toUpperCase()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Estimated Hours</span>
              <span>{$task.estimatedHours}h</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Suggested Swarm</span>
              <span class="text-purple-400">{$task.suggestedSwarmType}</span>
            </div>
          </div>
        </div>

        <!-- Required Agents -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg font-semibold mb-4">👥 Required Agents</h3>
          <div class="space-y-2">
            {#each $task.requiredAgentTypes as agent}
              <div class="bg-gray-700 rounded px-3 py-2 text-sm">{agent}</div>
            {/each}
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg font-semibold mb-4">⚡ Quick Actions</h3>
          <div class="space-y-2">
            <button 
              on:click={() => { $decision = 'approve'; $rationale = 'Quick approval - task appears straightforward and low risk'; }}
              class="w-full text-left bg-green-600 hover:bg-green-700 p-2 rounded text-sm transition-colors"
            >
              ✅ Quick Approve
            </button>
            <button 
              on:click={() => { $decision = 'defer'; $rationale = 'Requires additional review and stakeholder input'; }}
              class="w-full text-left bg-yellow-600 hover:bg-yellow-700 p-2 rounded text-sm transition-colors"
            >
              ⏸️ Defer for Review
            </button>
            <a 
              href="/agu/task/{$task.id}/export" 
              class="w-full text-left bg-blue-600 hover:bg-blue-700 p-2 rounded text-sm transition-colors block"
            >
              📄 Export Details
            </a>
          </div>
        </div>

        <!-- Analysis Confidence -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg font-semibold mb-4">🎯 Analysis Confidence</h3>
          <div class="space-y-3">
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-gray-400">Scanner Confidence</span>
                <span class="text-blue-400">{Math.round($task.sourceAnalysis.confidence * 100)}%</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-2">
                <div class="bg-blue-400 h-2 rounded-full" style="width: {$task.sourceAnalysis.confidence * 100}%"></div>
              </div>
            </div>
            <div class="text-xs text-gray-500">
              High confidence indicates reliable automated analysis
            </div>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-red-400 mb-4">Task Not Found</h1>
        <p class="text-gray-300 mb-4">The requested task could not be found.</p>
        <a href="/agu" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors">
          Return to AGU Dashboard
        </a>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    background-color: #111827;
  }
</style>