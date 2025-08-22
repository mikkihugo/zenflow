<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  export let data: any;
  export let userRole: string;
  export let immersionLevel: 'basic' | 'enhanced' | 'production';

  const integrationStatus = writable('healthy');
  const lastSyncTimes = writable({});

  // Tool integration data based on role
  const roleIntegrations = {
    team_member: {
      tools: [
        { name: 'GitHub', icon: '🐙', status: 'healthy', syncRate: 99.9, lastSync: '30 seconds ago', type: 'development' },
        { name: 'VS Code', icon: '💻', status: 'healthy', syncRate: 100, lastSync: '1 minute ago', type: 'development' },
        { name: 'Slack', icon: '💬', status: 'healthy', syncRate: 98.5, lastSync: '2 minutes ago', type: 'communication' },
        { name: 'Jira', icon: '📋', status: 'warning', syncRate: 95.2, lastSync: '15 minutes ago', type: 'planning' }
      ],
      automations: [
        { name: 'PR Auto-Review', status: 'active', triggers: 12, successRate: 94 },
        { name: 'Code Quality Gates', status: 'active', triggers: 8, successRate: 100 },
        { name: 'Story Status Sync', status: 'paused', triggers: 0, successRate: 87 }
      ]
    },
    scrum_master: {
      tools: [
        { name: 'Jira', icon: '📋', status: 'healthy', syncRate: 99.8, lastSync: '1 minute ago', type: 'planning' },
        { name: 'Confluence', icon: '📖', status: 'healthy', syncRate: 98.7, lastSync: '3 minutes ago', type: 'documentation' },
        { name: 'Slack', icon: '💬', status: 'healthy', syncRate: 99.1, lastSync: '30 seconds ago', type: 'communication' },
        { name: 'Azure DevOps', icon: '🔄', status: 'healthy', syncRate: 97.3, lastSync: '5 minutes ago', type: 'development' },
        { name: 'Miro', icon: '🎨', status: 'warning', syncRate: 89.2, lastSync: '25 minutes ago', type: 'collaboration' }
      ],
      automations: [
        { name: 'Sprint Planning Automation', status: 'active', triggers: 3, successRate: 100 },
        { name: 'Retrospective Action Tracking', status: 'active', triggers: 7, successRate: 89 },
        { name: 'Team Velocity Reporting', status: 'active', triggers: 15, successRate: 96 },
        { name: 'Impediment Escalation', status: 'active', triggers: 2, successRate: 100 }
      ]
    },
    po: {
      tools: [
        { name: 'Jira', icon: '📋', status: 'healthy', syncRate: 99.5, lastSync: '2 minutes ago', type: 'planning' },
        { name: 'Confluence', icon: '📖', status: 'healthy', syncRate: 97.8, lastSync: '7 minutes ago', type: 'documentation' },
        { name: 'Figma', icon: '🎨', status: 'healthy', syncRate: 98.9, lastSync: '4 minutes ago', type: 'design' },
        { name: 'Analytics', icon: '📊', status: 'healthy', syncRate: 96.7, lastSync: '10 minutes ago', type: 'analytics' },
        { name: 'Customer Feedback', icon: '📢', status: 'warning', syncRate: 92.1, lastSync: '18 minutes ago', type: 'feedback' }
      ],
      automations: [
        { name: 'Backlog Prioritization', status: 'active', triggers: 5, successRate: 91 },
        { name: 'Feature Flag Management', status: 'active', triggers: 8, successRate: 98 },
        { name: 'Customer Feedback Integration', status: 'active', triggers: 12, successRate: 85 },
        { name: 'Release Notes Generation', status: 'active', triggers: 3, successRate: 100 }
      ]
    },
    rte: {
      tools: [
        { name: 'Jira (Portfolio)', icon: '📋', status: 'healthy', syncRate: 99.7, lastSync: '1 minute ago', type: 'planning' },
        { name: 'Azure DevOps', icon: '🔄', status: 'healthy', syncRate: 98.3, lastSync: '3 minutes ago', type: 'development' },
        { name: 'Teams', icon: '👥', status: 'healthy', syncRate: 97.9, lastSync: '2 minutes ago', type: 'communication' },
        { name: 'Power BI', icon: '📊', status: 'healthy', syncRate: 96.4, lastSync: '8 minutes ago', type: 'analytics' },
        { name: 'ServiceNow', icon: '🎫', status: 'warning', syncRate: 94.1, lastSync: '22 minutes ago', type: 'service_management' }
      ],
      automations: [
        { name: 'PI Planning Coordination', status: 'active', triggers: 2, successRate: 100 },
        { name: 'ART Sync Automation', status: 'active', triggers: 24, successRate: 96 },
        { name: 'Dependency Tracking', status: 'active', triggers: 18, successRate: 89 },
        { name: 'System Demo Preparation', status: 'active', triggers: 4, successRate: 100 },
        { name: 'Inspect & Adapt Facilitation', status: 'active', triggers: 1, successRate: 100 }
      ]
    },
    architect: {
      tools: [
        { name: 'GitHub Enterprise', icon: '🐙', status: 'healthy', syncRate: 99.8, lastSync: '45 seconds ago', type: 'development' },
        { name: 'SonarQube', icon: '🔍', status: 'healthy', syncRate: 98.2, lastSync: '5 minutes ago', type: 'quality' },
        { name: 'Confluence', icon: '📖', status: 'healthy', syncRate: 97.1, lastSync: '8 minutes ago', type: 'documentation' },
        { name: 'ArchiMate', icon: '🏗️', status: 'healthy', syncRate: 95.7, lastSync: '12 minutes ago', type: 'architecture' },
        { name: 'JIRA (Architecture)', icon: '📋', status: 'warning', syncRate: 93.4, lastSync: '20 minutes ago', type: 'planning' }
      ],
      automations: [
        { name: 'Architecture Compliance Check', status: 'active', triggers: 15, successRate: 92 },
        { name: 'Technical Debt Analysis', status: 'active', triggers: 8, successRate: 98 },
        { name: 'Security Scan Integration', status: 'active', triggers: 23, successRate: 87 },
        { name: 'Architecture Decision Records', status: 'active', triggers: 6, successRate: 100 }
      ]
    },
    business_owner: {
      tools: [
        { name: 'JIRA (Portfolio)', icon: '📋', status: 'healthy', syncRate: 99.6, lastSync: '2 minutes ago', type: 'planning' },
        { name: 'Power BI', icon: '📊', status: 'healthy', syncRate: 98.8, lastSync: '4 minutes ago', type: 'analytics' },
        { name: 'Salesforce', icon: '☁️', status: 'healthy', syncRate: 97.5, lastSync: '6 minutes ago', type: 'crm' },
        { name: 'Financial Systems', icon: '💰', status: 'healthy', syncRate: 96.9, lastSync: '10 minutes ago', type: 'finance' },
        { name: 'Tableau', icon: '📈', status: 'warning', syncRate: 94.7, lastSync: '16 minutes ago', type: 'analytics' }
      ],
      automations: [
        { name: 'ROI Calculation', status: 'active', triggers: 8, successRate: 95 },
        { name: 'Portfolio Health Reporting', status: 'active', triggers: 12, successRate: 98 },
        { name: 'Business Value Tracking', status: 'active', triggers: 20, successRate: 91 },
        { name: 'Investment Decision Support', status: 'active', triggers: 4, successRate: 100 }
      ]
    }
  };

  $: roleData = roleIntegrations[userRole] || roleIntegrations.team_member;
  $: connectedTools = data?.connectedTools || roleData.tools;
  $: workflowAutomations = data?.workflowAutomations || roleData.automations;

  onMount(() => {
    // Simulate real-time sync updates
    setInterval(updateSyncTimes, 15000);
  });

  function updateSyncTimes() {
    lastSyncTimes.update(times => {
      const newTimes = { ...times };
      connectedTools.forEach(tool => {
        const randomDelay = Math.random() * 300; // 0-5 minutes
        newTimes[tool.name] = new Date(Date.now() - randomDelay * 1000);
      });
      return newTimes;
    });
  }

  function getStatusColor(status: string): string {
    const colors = {
      healthy: 'text-green-400 border-green-500/30 bg-green-500/10',
      warning: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
      error: 'text-red-400 border-red-500/30 bg-red-500/10',
      disconnected: 'text-gray-400 border-gray-500/30 bg-gray-500/10'
    };
    return colors[status] || colors.disconnected;
  }

  function getTypeIcon(type: string): string {
    const icons = {
      development: '💻',
      planning: '📋',
      communication: '💬',
      documentation: '📖',
      analytics: '📊',
      collaboration: '🤝',
      design: '🎨',
      feedback: '📢',
      quality: '✅',
      architecture: '🏗️',
      service_management: '🎫',
      crm: '☁️',
      finance: '💰'
    };
    return icons[type] || '🔧';
  }

  function getAutomationStatusColor(status: string): string {
    const colors = {
      active: 'text-green-400',
      paused: 'text-yellow-400',
      error: 'text-red-400',
      disabled: 'text-gray-400'
    };
    return colors[status] || colors.disabled;
  }

  function formatSyncRate(rate: number): string {
    return `${rate.toFixed(1)}%`;
  }

  function formatLastSync(syncTime: string): string {
    // Simple time formatting
    const timeValue = parseInt(syncTime.split(' ')[0]);
    const unit = syncTime.split(' ')[1];
    
    if (timeValue <= 1) return 'Just now';
    if (timeValue < 60 && unit.includes('second')) return `${timeValue}s ago`;
    if (timeValue < 60 && unit.includes('minute')) return `${timeValue}m ago`;
    return syncTime;
  }
</script>

<div class="flex flex-col h-full space-y-4">
  <!-- Integration Health Overview -->
  <div class="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg border border-slate-600/50">
    <div class="flex items-center space-x-2">
      <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      <span class="text-sm font-medium text-slate-200">System Health</span>
    </div>
    <div class="text-right">
      <div class="text-lg font-bold text-green-400">98.7%</div>
      <div class="text-xs text-slate-400">Overall Uptime</div>
    </div>
  </div>

  <!-- Connected Tools -->
  <div>
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-slate-200">🔗 Connected Tools</h4>
      <div class="text-xs text-slate-400">{connectedTools.length} active</div>
    </div>
    
    <div class="space-y-2 max-h-32 overflow-y-auto">
      {#each connectedTools as tool}
        <div class="flex items-center justify-between p-2 rounded-lg border {getStatusColor(tool.status)}">
          <div class="flex items-center space-x-2">
            <span class="text-lg">{tool.icon}</span>
            <div>
              <div class="text-sm font-medium text-slate-200">{tool.name}</div>
              <div class="text-xs text-slate-400 flex items-center space-x-2">
                <span>{getTypeIcon(tool.type)}</span>
                <span class="capitalize">{tool.type.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
          
          <div class="text-right">
            <div class="text-xs font-medium {tool.status === 'healthy' ? 'text-green-400' : tool.status === 'warning' ? 'text-yellow-400' : 'text-red-400'}">
              {formatSyncRate(tool.syncRate)}
            </div>
            <div class="text-xs text-slate-400">{formatLastSync(tool.lastSync)}</div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Workflow Automations -->
  <div>
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-slate-200">⚡ Automations</h4>
      <div class="text-xs text-slate-400">{workflowAutomations.filter(a => a.status === 'active').length} running</div>
    </div>
    
    <div class="space-y-2">
      {#each workflowAutomations as automation}
        <div class="p-2 bg-slate-700/20 rounded-lg border border-slate-600/30">
          <div class="flex items-center justify-between mb-1">
            <div class="text-sm font-medium text-slate-200">{automation.name}</div>
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 rounded-full {automation.status === 'active' ? 'bg-green-400' : automation.status === 'paused' ? 'bg-yellow-400' : 'bg-red-400'}"></div>
              <span class="text-xs {getAutomationStatusColor(automation.status)} capitalize">{automation.status}</span>
            </div>
          </div>
          
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>Today: {automation.triggers} triggers</span>
            <span>Success: {automation.successRate}%</span>
          </div>
          
          <!-- Success Rate Bar -->
          <div class="w-full bg-slate-600 rounded-full h-1 mt-1">
            <div 
              class="bg-gradient-to-r from-green-500 to-blue-500 h-1 rounded-full transition-all duration-1000"
              style="width: {automation.successRate}%"
            ></div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Quick Actions -->
  <div>
    <div class="text-sm font-semibold text-slate-200 mb-2">🚀 Quick Actions</div>
    <div class="grid grid-cols-2 gap-2">
      <button class="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-xs text-blue-200 transition-colors">
        Sync All
      </button>
      <button class="p-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-xs text-green-200 transition-colors">
        Test Connections
      </button>
    </div>
  </div>

  <!-- Performance Metrics -->
  {#if immersionLevel === 'production'}
    <div class="pt-2 border-t border-slate-700">
      <div class="grid grid-cols-3 gap-2 text-center">
        <div>
          <div class="text-xs text-slate-400">Latency</div>
          <div class="text-sm font-semibold text-blue-400">45ms</div>
        </div>
        <div>
          <div class="text-xs text-slate-400">Throughput</div>
          <div class="text-sm font-semibold text-green-400">1.2k/min</div>
        </div>
        <div>
          <div class="text-xs text-slate-400">Error Rate</div>
          <div class="text-sm font-semibold text-yellow-400">0.1%</div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Custom scrollbar for tools list */
  .space-y-2::-webkit-scrollbar {
    width: 3px;
  }
  
  .space-y-2::-webkit-scrollbar-track {
    background: rgba(51, 65, 85, 0.3);
    border-radius: 2px;
  }
  
  .space-y-2::-webkit-scrollbar-thumb {
    background: rgba(71, 85, 105, 0.6);
    border-radius: 2px;
  }
  
  .space-y-2::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 116, 139, 0.8);
  }
</style>