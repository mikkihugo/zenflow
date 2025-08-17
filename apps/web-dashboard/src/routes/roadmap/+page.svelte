<!--
  @component Visionary Roadmap Planning System
  Strategic planning interface with timeline visualization, milestone tracking, and roadmap management
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  // Roadmap state management
  const roadmaps = writable([]);
  const milestones = writable([]);
  const visionStatements = writable([]);
  const strategicGoals = writable([]);
  const roadmapMetrics = writable({
    totalRoadmaps: 0,
    activeMilestones: 0,
    completionRate: 0,
    strategicAlignment: 0
  });

  // View state
  let selectedTimeframe = '12months';
  let selectedRoadmap = null;
  let viewMode = 'timeline'; // timeline, gantt, kanban
  let showCompleted = true;
  let filterPriority = 'all';

  // Mock data for development
  let mockRoadmaps = [
    {
      id: 'rm-001',
      title: 'AI Platform Evolution 2024-2025',
      description: 'Comprehensive roadmap for advancing AI capabilities and platform maturity',
      vision: 'Become the leading AI-powered development platform with autonomous coding capabilities',
      status: 'active',
      priority: 'critical',
      owner: 'AI Strategy Team',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      completion: 45,
      strategicThemes: ['AI Advancement', 'Platform Maturity', 'Developer Experience'],
      stakeholders: ['Engineering', 'Product', 'AI Research', 'Customer Success'],
      riskLevel: 'medium',
      budget: '$2.5M',
      dependencies: ['Infrastructure Scaling', 'Model Training'],
      kpis: ['User Adoption', 'Code Quality', 'Response Time', 'Customer Satisfaction']
    },
    {
      id: 'rm-002',
      title: 'Developer Experience Enhancement',
      description: 'Improving developer tools, documentation, and workflow optimization',
      vision: 'Create the most intuitive and powerful development experience in the industry',
      status: 'planning',
      priority: 'high',
      owner: 'Developer Relations',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-12-31'),
      completion: 15,
      strategicThemes: ['Developer Productivity', 'Tool Integration', 'Learning Resources'],
      stakeholders: ['Developer Community', 'Engineering', 'Documentation'],
      riskLevel: 'low',
      budget: '$800K',
      dependencies: ['Platform Stability'],
      kpis: ['Developer Satisfaction', 'Tool Adoption', 'Documentation Usage']
    },
    {
      id: 'rm-003',
      title: 'Security & Compliance Framework',
      description: 'Implementing enterprise-grade security and regulatory compliance',
      vision: 'Achieve SOC2 Type II and enterprise security standards while maintaining agility',
      status: 'active',
      priority: 'critical',
      owner: 'Security Team',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-09-30'),
      completion: 75,
      strategicThemes: ['Security', 'Compliance', 'Risk Management'],
      stakeholders: ['Security', 'Legal', 'Compliance', 'Engineering'],
      riskLevel: 'high',
      budget: '$1.2M',
      dependencies: ['Infrastructure Audit', 'Legal Review'],
      kpis: ['Security Score', 'Compliance Rate', 'Incident Response', 'Audit Results']
    }
  ];

  let mockMilestones = [
    {
      id: 'ms-001',
      roadmapId: 'rm-001',
      title: 'AI Model v3.0 Release',
      description: 'Launch of next-generation AI model with improved reasoning capabilities',
      type: 'major-release',
      status: 'completed',
      priority: 'critical',
      dueDate: new Date('2024-08-15'),
      completedDate: new Date('2024-08-12'),
      owner: 'AI Research Team',
      deliverables: ['Model Training', 'Performance Testing', 'Integration Testing', 'Documentation'],
      dependencies: ['Infrastructure Scaling', 'Model Architecture'],
      riskFactors: ['Training Data Quality', 'Compute Resources'],
      successCriteria: ['95% accuracy', '50% performance improvement', 'Zero critical bugs']
    },
    {
      id: 'ms-002',
      roadmapId: 'rm-001',
      title: 'Autonomous Code Generation Beta',
      description: 'Beta release of autonomous code generation capabilities',
      type: 'feature-release',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date('2024-12-01'),
      completedDate: null,
      owner: 'AI Engineering',
      deliverables: ['Code Generation Engine', 'Safety Controls', 'User Interface', 'Beta Testing'],
      dependencies: ['AI Model v3.0', 'Security Framework'],
      riskFactors: ['Code Quality', 'Security Vulnerabilities', 'User Adoption'],
      successCriteria: ['90% code correctness', '1000 beta users', 'Positive feedback']
    },
    {
      id: 'ms-003',
      roadmapId: 'rm-002',
      title: 'Developer Portal Redesign',
      description: 'Complete redesign of developer portal with improved UX',
      type: 'improvement',
      status: 'planning',
      priority: 'medium',
      dueDate: new Date('2024-10-15'),
      completedDate: null,
      owner: 'UX Team',
      deliverables: ['UI/UX Design', 'Frontend Development', 'Content Migration', 'User Testing'],
      dependencies: ['User Research', 'Design System'],
      riskFactors: ['Content Migration', 'User Adoption'],
      successCriteria: ['50% better task completion', 'Improved user ratings', 'Reduced support tickets']
    },
    {
      id: 'ms-004',
      roadmapId: 'rm-003',
      title: 'SOC2 Type II Certification',
      description: 'Achieve SOC2 Type II certification for enterprise customers',
      type: 'compliance',
      status: 'in-progress',
      priority: 'critical',
      dueDate: new Date('2024-09-30'),
      completedDate: null,
      owner: 'Compliance Team',
      deliverables: ['Security Controls', 'Process Documentation', 'Third-party Audit', 'Certification'],
      dependencies: ['Security Framework', 'Process Implementation'],
      riskFactors: ['Audit Findings', 'Control Gaps', 'Timeline Delays'],
      successCriteria: ['Pass audit', 'Zero critical findings', 'Certification achieved']
    }
  ];

  let mockVisionStatements = [
    {
      id: 'vs-001',
      title: 'AI-First Development Platform',
      description: 'To become the world\'s leading AI-powered development platform that empowers developers to build exceptional software with unprecedented speed and quality.',
      timeframe: '3-5 years',
      strategicPillars: ['AI Innovation', 'Developer Experience', 'Platform Excellence'],
      successMetrics: ['Market Leadership', 'Developer Adoption', 'Customer Satisfaction'],
      status: 'active',
      owner: 'Chief Product Officer',
      lastUpdated: new Date('2024-01-15')
    },
    {
      id: 'vs-002',
      title: 'Autonomous Software Engineering',
      description: 'Achieve autonomous software engineering capabilities where AI can independently design, develop, test, and deploy software solutions.',
      timeframe: '5-10 years',
      strategicPillars: ['AI Autonomy', 'Quality Assurance', 'Deployment Excellence'],
      successMetrics: ['Autonomous Deployment Rate', 'Code Quality Score', 'Time to Market'],
      status: 'research',
      owner: 'Chief Technology Officer',
      lastUpdated: new Date('2024-02-01')
    }
  ];

  onMount(async () => {
    // Load real data from APIs
    await loadRoadmaps();
    await loadMilestones();
    await loadVisionStatements();
    await loadRoadmapMetrics();
  });

  async function loadRoadmaps() {
    try {
      const response = await fetch('/api/roadmap/roadmaps');
      if (response.ok) {
        const data = await response.json();
        roadmaps.set(data.roadmaps || mockRoadmaps);
      } else {
        roadmaps.set(mockRoadmaps);
      }
    } catch (error) {
      console.error('Failed to load roadmaps:', error);
      roadmaps.set(mockRoadmaps);
    }
  }

  async function loadMilestones() {
    try {
      const response = await fetch('/api/roadmap/milestones');
      if (response.ok) {
        const data = await response.json();
        milestones.set(data.milestones || mockMilestones);
      } else {
        milestones.set(mockMilestones);
      }
    } catch (error) {
      console.error('Failed to load milestones:', error);
      milestones.set(mockMilestones);
    }
  }

  async function loadVisionStatements() {
    try {
      const response = await fetch('/api/roadmap/vision');
      if (response.ok) {
        const data = await response.json();
        visionStatements.set(data.visions || mockVisionStatements);
      } else {
        visionStatements.set(mockVisionStatements);
      }
    } catch (error) {
      console.error('Failed to load vision statements:', error);
      visionStatements.set(mockVisionStatements);
    }
  }

  async function loadRoadmapMetrics() {
    try {
      const response = await fetch('/api/roadmap/metrics');
      if (response.ok) {
        const data = await response.json();
        roadmapMetrics.set(data);
      } else {
        // Calculate mock metrics
        const totalRoadmaps = mockRoadmaps.length;
        const activeMilestones = mockMilestones.filter(m => m.status === 'in-progress' || m.status === 'planning').length;
        const completedMilestones = mockMilestones.filter(m => m.status === 'completed').length;
        const completionRate = Math.round((completedMilestones / mockMilestones.length) * 100);
        
        roadmapMetrics.set({
          totalRoadmaps,
          activeMilestones,
          completionRate,
          strategicAlignment: 87
        });
      }
    } catch (error) {
      console.error('Failed to load roadmap metrics:', error);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'planning': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      case 'on-hold': return 'text-gray-400';
      case 'cancelled': return 'text-red-400';
      case 'in-progress': return 'text-blue-400';
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

  function getRiskColor(risk) {
    switch (risk) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  }

  function getMilestoneTypeIcon(type) {
    switch (type) {
      case 'major-release': return '🚀';
      case 'feature-release': return '✨';
      case 'improvement': return '🔧';
      case 'compliance': return '🛡️';
      case 'research': return '🔬';
      default: return '📌';
    }
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  }

  function calculateDaysRemaining(dueDate) {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function selectRoadmap(roadmap) {
    selectedRoadmap = roadmap;
  }

  function createNewRoadmap() {
    window.location.href = '/roadmap/create';
  }

  function createNewMilestone() {
    window.location.href = '/roadmap/milestone/create';
  }

  // Filter milestones based on selected roadmap
  $: filteredMilestones = selectedRoadmap 
    ? $milestones.filter(m => m.roadmapId === selectedRoadmap.id)
    : $milestones;

  // Timeline calculation for visualization
  $: timelineData = calculateTimelineData($roadmaps, $milestones);

  function calculateTimelineData(roadmaps, milestones) {
    // Calculate timeline positions and durations
    const now = new Date();
    const startDate = new Date(Math.min(...roadmaps.map(r => r.startDate.getTime())));
    const endDate = new Date(Math.max(...roadmaps.map(r => r.endDate.getTime())));
    
    return {
      startDate,
      endDate,
      totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      currentPosition: Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    };
  }
</script>

<svelte:head>
  <title>Visionary Roadmap - Strategic Planning - Claude Code Zen</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
  <!-- Header -->
  <div class="bg-gray-800 border-b border-gray-700 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h1 class="text-3xl font-bold text-purple-400 mb-2">🗺️ Visionary Roadmap</h1>
          <p class="text-gray-300">Strategic planning and roadmap visualization</p>
        </div>
        <div class="flex gap-3">
          <button 
            on:click={createNewRoadmap}
            class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
          >
            ➕ New Roadmap
          </button>
          <button 
            on:click={createNewMilestone}
            class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            📌 New Milestone
          </button>
        </div>
      </div>
      
      <!-- Metrics Overview -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-gray-700 rounded-lg p-3">
          <div class="text-sm text-gray-400">Total Roadmaps</div>
          <div class="text-purple-400 font-semibold">{$roadmapMetrics.totalRoadmaps}</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-3">
          <div class="text-sm text-gray-400">Active Milestones</div>
          <div class="text-blue-400 font-semibold">{$roadmapMetrics.activeMilestones}</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-3">
          <div class="text-sm text-gray-400">Completion Rate</div>
          <div class="text-green-400 font-semibold">{$roadmapMetrics.completionRate}%</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-3">
          <div class="text-sm text-gray-400">Strategic Alignment</div>
          <div class="text-yellow-400 font-semibold">{$roadmapMetrics.strategicAlignment}%</div>
        </div>
      </div>

      <!-- View Controls -->
      <div class="mt-4 flex flex-wrap gap-4 items-center">
        <div class="flex gap-2">
          <button 
            class="px-3 py-1 rounded text-sm {viewMode === 'timeline' ? 'bg-blue-600' : 'bg-gray-600'} transition-colors"
            on:click={() => viewMode = 'timeline'}
          >
            📅 Timeline
          </button>
          <button 
            class="px-3 py-1 rounded text-sm {viewMode === 'gantt' ? 'bg-blue-600' : 'bg-gray-600'} transition-colors"
            on:click={() => viewMode = 'gantt'}
          >
            📊 Gantt
          </button>
          <button 
            class="px-3 py-1 rounded text-sm {viewMode === 'kanban' ? 'bg-blue-600' : 'bg-gray-600'} transition-colors"
            on:click={() => viewMode = 'kanban'}
          >
            📋 Kanban
          </button>
        </div>
        
        <select 
          bind:value={selectedTimeframe}
          class="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
        >
          <option value="3months">3 Months</option>
          <option value="6months">6 Months</option>
          <option value="12months">12 Months</option>
          <option value="24months">24 Months</option>
          <option value="all">All Time</option>
        </select>
        
        <select 
          bind:value={filterPriority}
          class="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        
        <label class="flex items-center gap-2 text-sm">
          <input 
            type="checkbox" 
            bind:checked={showCompleted}
            class="rounded"
          />
          Show Completed
        </label>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
    <!-- Sidebar - Roadmaps List -->
    <div class="lg:col-span-1 space-y-6">
      <!-- Vision Statements -->
      <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 class="text-lg font-semibold mb-3">🎯 Vision Statements</h3>
        <div class="space-y-3">
          {#each $visionStatements as vision}
            <div class="bg-gray-700 rounded-lg p-3">
              <h4 class="font-medium text-purple-400 mb-1">{vision.title}</h4>
              <p class="text-gray-300 text-xs mb-2">{vision.description}</p>
              <div class="flex justify-between text-xs text-gray-400">
                <span>{vision.timeframe}</span>
                <span class="text-blue-400">{vision.status.toUpperCase()}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Roadmaps List -->
      <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 class="text-lg font-semibold mb-3">🗺️ Active Roadmaps</h3>
        <div class="space-y-2">
          {#each $roadmaps as roadmap}
            <button
              class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors {selectedRoadmap?.id === roadmap.id ? 'ring-2 ring-purple-400' : ''}"
              on:click={() => selectRoadmap(roadmap)}
            >
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-medium text-sm">{roadmap.title}</h4>
                <span class="px-2 py-1 rounded text-xs {getPriorityColor(roadmap.priority)}">
                  {roadmap.priority.toUpperCase()}
                </span>
              </div>
              <div class="text-xs text-gray-400 mb-2">{roadmap.description}</div>
              <div class="flex justify-between items-center">
                <span class="text-xs {getStatusColor(roadmap.status)}">● {roadmap.status.toUpperCase()}</span>
                <div class="text-xs text-gray-400">
                  <div class="w-16 bg-gray-600 rounded-full h-1">
                    <div class="bg-blue-400 h-1 rounded-full" style="width: {roadmap.completion}%"></div>
                  </div>
                  <span>{roadmap.completion}%</span>
                </div>
              </div>
            </button>
          {/each}
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 class="text-lg font-semibold mb-3">📈 Quick Stats</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400">On Track</span>
            <span class="text-green-400">{$roadmaps.filter(r => r.status === 'active').length}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Planning</span>
            <span class="text-yellow-400">{$roadmaps.filter(r => r.status === 'planning').length}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">At Risk</span>
            <span class="text-red-400">{$roadmaps.filter(r => r.riskLevel === 'high').length}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Completed</span>
            <span class="text-blue-400">{$roadmaps.filter(r => r.status === 'completed').length}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="lg:col-span-3 space-y-6">
      {#if selectedRoadmap}
        <!-- Selected Roadmap Details -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-2xl font-semibold text-purple-400 mb-2">{selectedRoadmap.title}</h2>
              <p class="text-gray-300 mb-3">{selectedRoadmap.description}</p>
              <div class="bg-gray-700 rounded-lg p-3 mb-3">
                <div class="text-sm text-gray-400 mb-1">Vision:</div>
                <div class="text-gray-300 italic">"{selectedRoadmap.vision}"</div>
              </div>
            </div>
            <div class="text-right">
              <div class="px-3 py-1 rounded text-sm {getPriorityColor(selectedRoadmap.priority)} mb-2">
                {selectedRoadmap.priority.toUpperCase()}
              </div>
              <div class="text-sm text-gray-400">
                <div>Owner: {selectedRoadmap.owner}</div>
                <div>Budget: {selectedRoadmap.budget}</div>
                <div class="text-{getRiskColor(selectedRoadmap.riskLevel)}">Risk: {selectedRoadmap.riskLevel.toUpperCase()}</div>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-400">Overall Progress</span>
              <span class="text-blue-400">{selectedRoadmap.completion}%</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-3">
              <div class="bg-blue-400 h-3 rounded-full" style="width: {selectedRoadmap.completion}%"></div>
            </div>
          </div>

          <!-- Roadmap Details Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div class="text-sm text-gray-400 mb-1">Timeline</div>
              <div class="text-gray-300">
                {formatDate(selectedRoadmap.startDate)} - {formatDate(selectedRoadmap.endDate)}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-400 mb-1">Strategic Themes</div>
              <div class="flex flex-wrap gap-1">
                {#each selectedRoadmap.strategicThemes as theme}
                  <span class="bg-purple-600 text-purple-100 px-2 py-1 rounded text-xs">{theme}</span>
                {/each}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-400 mb-1">Key Stakeholders</div>
              <div class="text-gray-300 text-sm">{selectedRoadmap.stakeholders.join(', ')}</div>
            </div>
            <div>
              <div class="text-sm text-gray-400 mb-1">Success Metrics</div>
              <div class="text-gray-300 text-sm">{selectedRoadmap.kpis.join(', ')}</div>
            </div>
          </div>

          <!-- Dependencies -->
          {#if selectedRoadmap.dependencies.length > 0}
            <div class="mb-4">
              <div class="text-sm text-gray-400 mb-2">Dependencies</div>
              <div class="flex flex-wrap gap-2">
                {#each selectedRoadmap.dependencies as dependency}
                  <span class="bg-yellow-600 text-yellow-100 px-2 py-1 rounded text-sm">⚠️ {dependency}</span>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- Roadmap Milestones -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">📌 Roadmap Milestones</h3>
            <div class="text-sm text-gray-400">
              {filteredMilestones.filter(m => m.status === 'completed').length} of {filteredMilestones.length} completed
            </div>
          </div>

          <!-- Timeline View -->
          {#if viewMode === 'timeline'}
            <div class="space-y-4">
              {#each filteredMilestones as milestone}
                <div class="bg-gray-700 rounded-lg p-4 border-l-4 {milestone.status === 'completed' ? 'border-green-400' : milestone.status === 'in-progress' ? 'border-blue-400' : 'border-yellow-400'}">
                  <div class="flex justify-between items-start mb-3">
                    <div class="flex items-start gap-3">
                      <span class="text-2xl">{getMilestoneTypeIcon(milestone.type)}</span>
                      <div>
                        <h4 class="font-semibold text-lg">{milestone.title}</h4>
                        <p class="text-gray-300 text-sm mb-2">{milestone.description}</p>
                        <div class="flex items-center gap-4 text-sm">
                          <span class="px-2 py-1 rounded text-xs {getPriorityColor(milestone.priority)}">
                            {milestone.priority.toUpperCase()}
                          </span>
                          <span class="text-purple-400">{milestone.type.replace('-', ' ').toUpperCase()}</span>
                          <span class="{getStatusColor(milestone.status)}">● {milestone.status.replace('-', ' ').toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                    <div class="text-right text-sm">
                      <div class="text-gray-400">Due: {formatDate(milestone.dueDate)}</div>
                      {#if milestone.status === 'completed'}
                        <div class="text-green-400">✅ Completed: {formatDate(milestone.completedDate)}</div>
                      {:else}
                        {@const daysRemaining = calculateDaysRemaining(milestone.dueDate)}
                        <div class="text-{daysRemaining < 0 ? 'red' : daysRemaining < 7 ? 'yellow' : 'blue'}-400">
                          {daysRemaining < 0 ? 'Overdue by' : 'Due in'} {Math.abs(daysRemaining)} days
                        </div>
                      {/if}
                      <div class="text-gray-400">Owner: {milestone.owner}</div>
                    </div>
                  </div>

                  <!-- Deliverables -->
                  <div class="mb-3">
                    <div class="text-sm text-gray-400 mb-1">Deliverables:</div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {#each milestone.deliverables as deliverable}
                        <div class="bg-gray-600 px-2 py-1 rounded text-xs text-center">
                          {deliverable}
                        </div>
                      {/each}
                    </div>
                  </div>

                  <!-- Dependencies & Risks -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <div class="text-gray-400 mb-1">Dependencies:</div>
                      <div class="space-y-1">
                        {#each milestone.dependencies as dependency}
                          <div class="text-yellow-400">🔗 {dependency}</div>
                        {/each}
                      </div>
                    </div>
                    <div>
                      <div class="text-gray-400 mb-1">Risk Factors:</div>
                      <div class="space-y-1">
                        {#each milestone.riskFactors as risk}
                          <div class="text-orange-400">⚠️ {risk}</div>
                        {/each}
                      </div>
                    </div>
                  </div>

                  <!-- Success Criteria -->
                  <div class="mb-3">
                    <div class="text-sm text-gray-400 mb-1">Success Criteria:</div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {#each milestone.successCriteria as criteria}
                        <div class="bg-green-900/20 text-green-400 px-2 py-1 rounded text-xs">
                          ✓ {criteria}
                        </div>
                      {/each}
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex gap-2">
                    <a 
                      href="/roadmap/milestone/{milestone.id}" 
                      class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                    >
                      👁️ View Details
                    </a>
                    <button class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors">
                      📝 Update Progress
                    </button>
                    <button class="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm transition-colors">
                      💬 Add Comment
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}

          <!-- Gantt View Placeholder -->
          {#if viewMode === 'gantt'}
            <div class="bg-gray-700 rounded-lg p-8 text-center">
              <div class="text-gray-400 mb-2">📊 Gantt Chart View</div>
              <div class="text-gray-500 text-sm">Interactive Gantt chart visualization coming soon</div>
            </div>
          {/if}

          <!-- Kanban View -->
          {#if viewMode === 'kanban'}
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              {#each ['planning', 'in-progress', 'review', 'completed'] as status}
                <div class="bg-gray-700 rounded-lg p-4">
                  <h4 class="font-semibold mb-3 text-center {getStatusColor(status)}">
                    {status.replace('-', ' ').toUpperCase()}
                  </h4>
                  <div class="space-y-3">
                    {#each filteredMilestones.filter(m => m.status === status || (status === 'review' && m.status === 'under-review')) as milestone}
                      <div class="bg-gray-600 rounded-lg p-3">
                        <div class="flex items-center gap-2 mb-2">
                          <span>{getMilestoneTypeIcon(milestone.type)}</span>
                          <h5 class="font-medium text-sm">{milestone.title}</h5>
                        </div>
                        <div class="text-xs text-gray-400 mb-2">{milestone.description}</div>
                        <div class="flex justify-between items-center text-xs">
                          <span class="px-2 py-1 rounded {getPriorityColor(milestone.priority)}">
                            {milestone.priority.charAt(0).toUpperCase()}
                          </span>
                          <span class="text-gray-400">{formatDate(milestone.dueDate)}</span>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <!-- No Roadmap Selected -->
        <div class="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
          <div class="text-6xl mb-4">🗺️</div>
          <h2 class="text-2xl font-semibold text-purple-400 mb-3">Select a Roadmap</h2>
          <p class="text-gray-400 mb-6">Choose a roadmap from the sidebar to view its details and milestones</p>
          <button 
            on:click={createNewRoadmap}
            class="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
          >
            ➕ Create New Roadmap
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: #111827;
  }
</style>