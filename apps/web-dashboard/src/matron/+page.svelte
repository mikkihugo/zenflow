<!--
  @component Matron Advisory Dashboard
  Central hub for AI matron advisory services, expert guidance, and strategic recommendations
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  // Matron advisory state management
  const activeConsultations = writable([]);
  const expertDomains = writable([]);
  const recommendationHistory = writable([]);
  const matronMetrics = writable({
    totalConsultations: 0,
    activeExperts: 0,
    resolutionRate: 0,
    averageResponseTime: '0m'
  });

  // Mock data for development
  let mockConsultations = [
    {
      id: 'cons-001',
      title: 'Architecture Decision: Microservices vs Monolith',
      domain: 'system-architecture',
      expert: 'AI Architecture Advisor',
      priority: 'high',
      status: 'active',
      requestedBy: 'Tech Lead',
      created: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
      context: {
        projectType: 'E-commerce Platform',
        scalabilityRequirements: 'High',
        teamSize: '8 developers',
        timeline: '6 months'
      },
      question: 'Given our scale requirements and team size, should we migrate from monolith to microservices architecture?',
      complexity: 'high',
      businessImpact: 'critical',
      stakeholders: ['Engineering Team', 'Product Manager', 'CTO']
    },
    {
      id: 'cons-002',
      title: 'Performance Optimization Strategy',
      domain: 'performance',
      expert: 'AI Performance Specialist',
      priority: 'medium',
      status: 'analysis',
      requestedBy: 'Senior Developer',
      created: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      context: {
        currentMetrics: '2.5s average load time',
        targetMetrics: '<1s load time',
        userBase: '50K active users',
        infrastructure: 'AWS Cloud'
      },
      question: 'What are the most effective strategies to optimize our application performance from 2.5s to under 1s?',
      complexity: 'medium',
      businessImpact: 'high',
      stakeholders: ['Performance Team', 'DevOps', 'Users']
    },
    {
      id: 'cons-003',
      title: 'Security Framework Implementation',
      domain: 'security',
      expert: 'AI Security Advisor',
      priority: 'critical',
      status: 'pending',
      requestedBy: 'Security Team',
      created: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      context: {
        complianceRequirements: 'SOC2, GDPR',
        dataTypes: 'PII, Financial',
        currentFramework: 'Basic',
        industryVertical: 'FinTech'
      },
      question: 'Design a comprehensive security framework for our FinTech application to meet SOC2 and GDPR requirements.',
      complexity: 'critical',
      businessImpact: 'critical',
      stakeholders: ['Security Team', 'Compliance', 'Legal', 'C-Suite']
    }
  ];

  let mockExperts = [
    {
      domain: 'system-architecture',
      name: 'AI Architecture Advisor',
      specialties: ['Microservices', 'Scalability', 'Design Patterns', 'Cloud Architecture'],
      consultations: 15,
      rating: 4.8,
      status: 'available',
      lastActive: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      domain: 'performance',
      name: 'AI Performance Specialist',
      specialties: ['Database Optimization', 'Caching', 'Load Testing', 'Monitoring'],
      consultations: 12,
      rating: 4.9,
      status: 'busy',
      lastActive: new Date(Date.now() - 1000 * 60 * 2)
    },
    {
      domain: 'security',
      name: 'AI Security Advisor',
      specialties: ['Compliance', 'Vulnerability Assessment', 'Secure Coding', 'Incident Response'],
      consultations: 18,
      rating: 4.7,
      status: 'available',
      lastActive: new Date(Date.now() - 1000 * 60 * 1)
    },
    {
      domain: 'devops',
      name: 'AI DevOps Consultant',
      specialties: ['CI/CD', 'Infrastructure as Code', 'Monitoring', 'Automation'],
      consultations: 9,
      rating: 4.6,
      status: 'available',
      lastActive: new Date(Date.now() - 1000 * 60 * 3)
    },
    {
      domain: 'frontend',
      name: 'AI Frontend Expert',
      specialties: ['React', 'Vue', 'Performance', 'Accessibility'],
      consultations: 7,
      rating: 4.5,
      status: 'offline',
      lastActive: new Date(Date.now() - 1000 * 60 * 30)
    }
  ];

  let mockRecommendations = [
    {
      id: 'rec-001',
      consultationId: 'cons-001',
      title: 'Incremental Migration to Microservices',
      expert: 'AI Architecture Advisor',
      summary: 'Recommended phased approach starting with user service separation',
      confidence: 0.89,
      implementationComplexity: 'high',
      estimatedTimeframe: '4-6 months',
      riskLevel: 'medium',
      created: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      status: 'under-review'
    },
    {
      id: 'rec-002',
      consultationId: 'cons-002',
      title: 'Database Query Optimization Plan',
      expert: 'AI Performance Specialist',
      summary: 'Implement connection pooling, query optimization, and Redis caching',
      confidence: 0.92,
      implementationComplexity: 'medium',
      estimatedTimeframe: '2-3 weeks',
      riskLevel: 'low',
      created: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      status: 'approved'
    }
  ];

  onMount(async () => {
    // Load real data from APIs
    await loadActiveConsultations();
    await loadExpertDomains();
    await loadRecommendationHistory();
    await loadMatronMetrics();
  });

  async function loadActiveConsultations() {
    try {
      const response = await fetch('/api/matron/consultations');
      if (response.ok) {
        const data = await response.json();
        activeConsultations.set(data.consultations || mockConsultations);
      } else {
        // Use mock data for development
        activeConsultations.set(mockConsultations);
      }
    } catch (error) {
      console.error('Failed to load consultations:', error);
      activeConsultations.set(mockConsultations);
    }
  }

  async function loadExpertDomains() {
    try {
      const response = await fetch('/api/matron/experts');
      if (response.ok) {
        const data = await response.json();
        expertDomains.set(data.experts || mockExperts);
      } else {
        expertDomains.set(mockExperts);
      }
    } catch (error) {
      console.error('Failed to load experts:', error);
      expertDomains.set(mockExperts);
    }
  }

  async function loadRecommendationHistory() {
    try {
      const response = await fetch('/api/matron/recommendations');
      if (response.ok) {
        const data = await response.json();
        recommendationHistory.set(data.recommendations || mockRecommendations);
      } else {
        recommendationHistory.set(mockRecommendations);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      recommendationHistory.set(mockRecommendations);
    }
  }

  async function loadMatronMetrics() {
    try {
      const response = await fetch('/api/matron/metrics');
      if (response.ok) {
        const data = await response.json();
        matronMetrics.set(data);
      } else {
        // Set mock metrics
        matronMetrics.set({
          totalConsultations: mockConsultations.length + 45,
          activeExperts: mockExperts.filter(e => e.status !== 'offline').length,
          resolutionRate: 94,
          averageResponseTime: '18m'
        });
      }
    } catch (error) {
      console.error('Failed to load matron metrics:', error);
    }
  }

  async function requestConsultation(domain) {
    // Navigate to consultation request form
    window.location.href = `/matron/request?domain=${domain}`;
  }

  function getStatusColor(status) {
    switch (status) {
      case 'active': return 'text-blue-400';
      case 'analysis': return 'text-yellow-400';
      case 'pending': return 'text-orange-400';
      case 'completed': return 'text-green-400';
      case 'escalated': return 'text-red-400';
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

  function getComplexityColor(complexity) {
    switch (complexity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  }

  function getExpertStatusColor(status) {
    switch (status) {
      case 'available': return 'text-green-400';
      case 'busy': return 'text-yellow-400';
      case 'offline': return 'text-gray-400';
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
  <title>Matron Advisory - AI Expert Guidance - Claude Code Zen</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
  <!-- Header -->
  <div class="bg-gray-800 border-b border-gray-700 p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-purple-400 mb-2">🧙‍♀️ Matron Advisory</h1>
      <p class="text-gray-300">AI-powered expert guidance and strategic recommendations</p>
      
      <!-- Status Overview -->
      <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-gray-700 rounded-lg p-3">
          <div class="text-sm text-gray-400">Total Consultations</div>
          <div class="text-blue-400 font-semibold">{$matronMetrics.totalConsultations}</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-3">
          <div class="text-sm text-gray-400">Active Experts</div>
          <div class="text-green-400 font-semibold">{$matronMetrics.activeExperts}</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-3">
          <div class="text-sm text-gray-400">Resolution Rate</div>
          <div class="text-purple-400 font-semibold">{$matronMetrics.resolutionRate}%</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-3">
          <div class="text-sm text-gray-400">Avg Response Time</div>
          <div class="text-yellow-400 font-semibold">{$matronMetrics.averageResponseTime}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
    <!-- Main Content Area -->
    <div class="xl:col-span-2 space-y-6">
      <!-- Active Consultations -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 class="text-xl font-semibold mb-4">💭 Active Consultations</h2>
        
        <div class="space-y-4">
          {#each $activeConsultations as consultation}
            <div class="bg-gray-700 rounded-lg p-4 border-l-4 {consultation.priority === 'critical' ? 'border-red-400' : consultation.priority === 'high' ? 'border-orange-400' : 'border-blue-400'}">
              <!-- Consultation Header -->
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h3 class="font-semibold text-lg">{consultation.title}</h3>
                  <div class="flex items-center gap-4 text-sm text-gray-300">
                    <span class="{getStatusColor(consultation.status)}">● {consultation.status.toUpperCase()}</span>
                    <span class="px-2 py-1 rounded text-xs {getPriorityColor(consultation.priority)}">{consultation.priority.toUpperCase()}</span>
                    <span class="text-purple-400">{consultation.domain}</span>
                    <span>{formatTimeAgo(consultation.created)}</span>
                  </div>
                </div>
                <div class="text-right text-sm text-gray-400">
                  <div>ID: {consultation.id}</div>
                  <div>Expert: {consultation.expert}</div>
                </div>
              </div>

              <!-- Consultation Question -->
              <div class="mb-3">
                <div class="text-sm text-gray-400 mb-1">Question:</div>
                <div class="text-gray-300 text-sm bg-gray-800 rounded p-2">{consultation.question}</div>
              </div>

              <!-- Context & Details -->
              <div class="mb-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div class="text-gray-400">Business Impact:</div>
                  <div class="{consultation.businessImpact === 'critical' ? 'text-red-400' : consultation.businessImpact === 'high' ? 'text-orange-400' : 'text-yellow-400'}">
                    {consultation.businessImpact.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div class="text-gray-400">Complexity:</div>
                  <div class="{getComplexityColor(consultation.complexity)}">{consultation.complexity.toUpperCase()}</div>
                </div>
                <div>
                  <div class="text-gray-400">Requested by:</div>
                  <div class="text-blue-400">{consultation.requestedBy}</div>
                </div>
                <div>
                  <div class="text-gray-400">Stakeholders:</div>
                  <div>{consultation.stakeholders.join(', ')}</div>
                </div>
              </div>

              <!-- Context Details -->
              {#if consultation.context}
                <div class="mb-3">
                  <div class="text-sm text-gray-400 mb-1">Context:</div>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    {#each Object.entries(consultation.context) as [key, value]}
                      <div class="text-gray-300">
                        <span class="text-gray-500">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> {value}
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}

              <!-- Action Buttons -->
              <div class="flex gap-2">
                <a 
                  href="/matron/consultation/{consultation.id}" 
                  class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  👁️ View Details
                </a>
                <button class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors">
                  💬 Add Input
                </button>
                <button class="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm transition-colors">
                  📋 View Recommendations
                </button>
              </div>
            </div>
          {/each}
          
          {#if $activeConsultations.length === 0}
            <div class="text-center py-8 text-gray-500">
              <p>No active consultations</p>
            </div>
          {/if}
        </div>
      </div>

      <!-- Recent Recommendations -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 class="text-xl font-semibold mb-4">💡 Recent Recommendations</h2>
        
        <div class="space-y-4">
          {#each $recommendationHistory as recommendation}
            <div class="bg-gray-700 rounded-lg p-4">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h3 class="font-semibold">{recommendation.title}</h3>
                  <div class="text-sm text-gray-300">by {recommendation.expert}</div>
                </div>
                <div class="text-right text-sm">
                  <div class="px-2 py-1 rounded text-xs {recommendation.status === 'approved' ? 'bg-green-600' : 'bg-yellow-600'}">
                    {recommendation.status.replace('-', ' ').toUpperCase()}
                  </div>
                  <div class="text-gray-400 mt-1">{formatTimeAgo(recommendation.created)}</div>
                </div>
              </div>

              <p class="text-gray-300 text-sm mb-3">{recommendation.summary}</p>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                <div>
                  <div class="text-gray-400">Confidence</div>
                  <div class="text-blue-400">{Math.round(recommendation.confidence * 100)}%</div>
                </div>
                <div>
                  <div class="text-gray-400">Complexity</div>
                  <div class="{getComplexityColor(recommendation.implementationComplexity)}">{recommendation.implementationComplexity.toUpperCase()}</div>
                </div>
                <div>
                  <div class="text-gray-400">Timeframe</div>
                  <div class="text-purple-400">{recommendation.estimatedTimeframe}</div>
                </div>
                <div>
                  <div class="text-gray-400">Risk Level</div>
                  <div class="{recommendation.riskLevel === 'high' ? 'text-red-400' : recommendation.riskLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'}">
                    {recommendation.riskLevel.toUpperCase()}
                  </div>
                </div>
              </div>

              <div class="flex gap-2">
                <a 
                  href="/matron/recommendation/{recommendation.id}" 
                  class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  📄 Full Report
                </a>
                <button class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors">
                  ✅ Approve
                </button>
                <button class="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-sm transition-colors">
                  📝 Request Changes
                </button>
              </div>
            </div>
          {/each}
          
          {#if $recommendationHistory.length === 0}
            <div class="text-center py-8 text-gray-500">
              <p>No recent recommendations</p>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
      <!-- Expert Domains -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 class="text-lg font-semibold mb-4">👨‍💼 Available Experts</h3>
        <div class="space-y-3">
          {#each $expertDomains as expert}
            <div class="bg-gray-700 rounded-lg p-3">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <div class="font-medium">{expert.name}</div>
                  <div class="text-sm text-gray-400">{expert.domain.replace('-', ' ').toUpperCase()}</div>
                </div>
                <div class="text-right text-sm">
                  <div class="{getExpertStatusColor(expert.status)}">● {expert.status.toUpperCase()}</div>
                  <div class="text-gray-400">⭐ {expert.rating}</div>
                </div>
              </div>
              
              <div class="text-xs text-gray-300 mb-2">
                <div class="text-gray-400">Specialties:</div>
                <div class="flex flex-wrap gap-1">
                  {#each expert.specialties.slice(0, 3) as specialty}
                    <span class="bg-blue-600 text-blue-100 px-1 py-0.5 rounded">{specialty}</span>
                  {/each}
                  {#if expert.specialties.length > 3}
                    <span class="text-gray-400">+{expert.specialties.length - 3}</span>
                  {/if}
                </div>
              </div>

              <div class="flex justify-between text-xs text-gray-400 mb-2">
                <span>{expert.consultations} consultations</span>
                <span>Last: {formatTimeAgo(expert.lastActive)}</span>
              </div>

              <button 
                on:click={() => requestConsultation(expert.domain)}
                class="w-full bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-sm transition-colors"
                disabled={expert.status === 'offline'}
              >
                💬 Request Consultation
              </button>
            </div>
          {/each}
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 class="text-lg font-semibold mb-4">⚡ Quick Actions</h3>
        <div class="space-y-2">
          <a href="/matron/request" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">
            💭 New Consultation
          </a>
          <a href="/matron/history" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">
            📚 Consultation History
          </a>
          <a href="/matron/experts" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">
            👨‍💼 Expert Directory
          </a>
          <a href="/matron/analytics" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">
            📊 Advisory Analytics
          </a>
          <a href="/matron/knowledge-base" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">
            📖 Knowledge Base
          </a>
        </div>
      </div>

      <!-- Advisory Statistics -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 class="text-lg font-semibold mb-4">📈 Advisory Statistics</h3>
        <div class="space-y-3">
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-gray-400">Resolution Rate</span>
              <span class="text-green-400">{$matronMetrics.resolutionRate}%</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2">
              <div class="bg-green-400 h-2 rounded-full" style="width: {$matronMetrics.resolutionRate}%"></div>
            </div>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-400">Active Consultations</span>
            <span class="text-blue-400">{$activeConsultations.length}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-400">Experts Online</span>
            <span class="text-green-400">{$expertDomains.filter(e => e.status === 'available').length}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-400">Avg Response</span>
            <span class="text-purple-400">{$matronMetrics.averageResponseTime}</span>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 class="text-lg font-semibold mb-4">🕐 Recent Activity</h3>
        <div class="space-y-3 text-sm">
          <div class="border-l-2 border-green-400 pl-3">
            <div class="text-green-400">Consultation completed</div>
            <div class="text-gray-400">Performance optimization - 2h ago</div>
          </div>
          <div class="border-l-2 border-blue-400 pl-3">
            <div class="text-blue-400">New expert available</div>
            <div class="text-gray-400">AI DevOps Consultant online - 1h ago</div>
          </div>
          <div class="border-l-2 border-yellow-400 pl-3">
            <div class="text-yellow-400">Recommendation pending</div>
            <div class="text-gray-400">Architecture decision review - 30m ago</div>
          </div>
          <div class="border-l-2 border-purple-400 pl-3">
            <div class="text-purple-400">Knowledge updated</div>
            <div class="text-gray-400">Security best practices - 15m ago</div>
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